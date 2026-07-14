"""
Polymarket halka açık API istemcisi (sadece okuma — anahtar gerekmez).

İki API kullanılır:
  - Gamma API  (https://gamma-api.polymarket.com) : piyasa keşfi, metadata
  - CLOB API   (https://clob.polymarket.com)      : emir defteri, fiyatlar

Her iki API'nin okuma uçları kimlik doğrulaması istemez.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field

import requests

GAMMA_URL = "https://gamma-api.polymarket.com"
CLOB_URL = "https://clob.polymarket.com"

_session = requests.Session()
_session.headers.update({"User-Agent": "midasby-polymarket-scanner/1.0"})


def _get(url: str, params: dict | None = None, retries: int = 3) -> dict | list:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            r = _session.get(url, params=params, timeout=15)
            if r.status_code == 429:  # rate limit — bekle ve tekrar dene
                time.sleep(2 ** (attempt + 1))
                continue
            r.raise_for_status()
            return r.json()
        except (requests.RequestException, json.JSONDecodeError) as e:
            last_err = e
            time.sleep(1.5 ** attempt)
    raise RuntimeError(f"API isteği başarısız: {url} — {last_err}")


@dataclass
class Outcome:
    """Bir piyasadaki tek bir sonuç (ör. 'Yes' / 'No' ya da bir aday)."""
    name: str
    token_id: str
    best_bid: float | None = None   # en iyi alış teklifi
    best_ask: float | None = None   # en iyi satış teklifi
    bid_size: float = 0.0           # best_bid seviyesindeki adet
    ask_size: float = 0.0           # best_ask seviyesindeki adet


@dataclass
class Market:
    """Tek bir Polymarket piyasası (binary ya da çok sonuçlu grubun bir ayağı)."""
    id: str
    question: str
    slug: str
    volume_24h: float
    liquidity: float
    end_date: str
    neg_risk: bool                      # çok sonuçlu (negatif risk) gruba mı ait
    event_slug: str = ""
    outcomes: list[Outcome] = field(default_factory=list)

    @property
    def url(self) -> str:
        return f"https://polymarket.com/event/{self.event_slug or self.slug}"


def fetch_active_markets(limit: int = 200, min_liquidity: float = 1000.0) -> list[Market]:
    """Aktif piyasaları Gamma API'den çeker; düşük likiditelileri eler."""
    markets: list[Market] = []
    offset = 0
    while len(markets) < limit:
        batch = _get(
            f"{GAMMA_URL}/markets",
            params={
                "active": "true",
                "closed": "false",
                "limit": min(100, limit - len(markets)),
                "offset": offset,
                "order": "volume24hr",
                "ascending": "false",
            },
        )
        if not batch:
            break
        offset += len(batch)
        for m in batch:
            liq = float(m.get("liquidityNum") or m.get("liquidity") or 0)
            if liq < min_liquidity:
                continue
            try:
                token_ids = json.loads(m.get("clobTokenIds") or "[]")
                names = json.loads(m.get("outcomes") or "[]")
            except json.JSONDecodeError:
                continue
            if len(token_ids) != len(names) or not token_ids:
                continue
            events = m.get("events") or []
            event_slug = events[0].get("slug", "") if events else ""
            markets.append(
                Market(
                    id=str(m.get("id")),
                    question=m.get("question", ""),
                    slug=m.get("slug", ""),
                    volume_24h=float(m.get("volume24hr") or 0),
                    liquidity=liq,
                    end_date=m.get("endDate", ""),
                    neg_risk=bool(m.get("negRisk")),
                    event_slug=event_slug,
                    outcomes=[
                        Outcome(name=n, token_id=t)
                        for n, t in zip(names, token_ids)
                    ],
                )
            )
    return markets[:limit]


def fetch_books(token_ids: list[str]) -> dict[str, dict]:
    """CLOB API'den toplu emir defteri çeker. token_id -> book sözlüğü döner."""
    books: dict[str, dict] = {}
    # /books ucu POST ile toplu sorgu kabul eder; 100'lük partiler halinde soralım
    for i in range(0, len(token_ids), 100):
        chunk = token_ids[i : i + 100]
        try:
            r = _session.post(
                f"{CLOB_URL}/books",
                json=[{"token_id": t} for t in chunk],
                timeout=20,
            )
            r.raise_for_status()
            for book in r.json():
                books[book.get("asset_id", "")] = book
        except requests.RequestException:
            # Toplu istek başarısızsa tek tek dene
            for t in chunk:
                try:
                    books[t] = _get(f"{CLOB_URL}/book", params={"token_id": t})  # type: ignore[assignment]
                except RuntimeError:
                    continue
    return books


def attach_prices(markets: list[Market]) -> None:
    """Piyasalardaki her sonuca en iyi alış/satış fiyatlarını ekler (yerinde)."""
    all_tokens = [o.token_id for m in markets for o in m.outcomes]
    books = fetch_books(all_tokens)
    for m in markets:
        for o in m.outcomes:
            book = books.get(o.token_id)
            if not book:
                continue
            bids = book.get("bids") or []
            asks = book.get("asks") or []
            if bids:
                best = max(bids, key=lambda x: float(x["price"]))
                o.best_bid = float(best["price"])
                o.bid_size = float(best["size"])
            if asks:
                best = min(asks, key=lambda x: float(x["price"]))
                o.best_ask = float(best["price"])
                o.ask_size = float(best["size"])
