"""
Fiyatlama hatası tarayıcıları.

Üç strateji taranır — üçü de "tahmin" değil, MATEMATİKSEL kenar arar:

1. Binary arbitraj      : YES_ask + NO_ask < 1  → ikisini de al, çözümde 1$ öde(n)ir.
2. Negatif-risk arbitraj: Çok sonuçlu grupta tüm YES ask'lerinin toplamı < 1
                          (tam olarak bir sonuç YES çözülür) → hepsini al.
                          Ya da tüm NO ask'lerinin toplamı < n-1 → tüm NO'ları al.
3. Piyasa yapıcılık     : Geniş spread + yeterli hacim → iki taraflı kotasyonla
                          spread'i toplama adayları (garanti DEĞİL, envanter riski var).

Not: Polymarket'te alım-satım komisyonu çoğu piyasada %0'dır ama çözüme kadar
paranın kilitlenmesi, gaz/çekim maliyeti ve kısmi dolum riski vardır. Bu yüzden
`min_edge` eşiği altındaki fırsatlar elenmelidir.
"""

from __future__ import annotations

from dataclasses import dataclass

from api import Market


@dataclass
class Opportunity:
    kind: str            # "binary_arb" | "negrisk_yes" | "negrisk_no" | "market_making"
    market: Market
    edge: float          # 1$ başına garanti (veya beklenen) brüt kâr
    max_size: float      # mevcut derinlikle uygulanabilir azami adet
    detail: str

    @property
    def max_profit(self) -> float:
        return self.edge * self.max_size


def scan_binary_arbitrage(markets: list[Market], min_edge: float = 0.005) -> list[Opportunity]:
    """YES_ask + NO_ask < 1 - min_edge olan binary piyasaları bulur."""
    opps: list[Opportunity] = []
    for m in markets:
        if len(m.outcomes) != 2:
            continue
        yes, no = m.outcomes
        if yes.best_ask is None or no.best_ask is None:
            continue
        total = yes.best_ask + no.best_ask
        edge = 1.0 - total
        if edge >= min_edge:
            size = min(yes.ask_size, no.ask_size)
            opps.append(
                Opportunity(
                    kind="binary_arb",
                    market=m,
                    edge=edge,
                    max_size=size,
                    detail=(
                        f"{yes.name} @ {yes.best_ask:.3f} + {no.name} @ {no.best_ask:.3f} "
                        f"= {total:.3f} < 1.000 → çözümde garanti {edge:.3f}$/adet"
                    ),
                )
            )
    return opps


def scan_negative_risk(
    markets: list[Market], min_edge: float = 0.005
) -> list[Opportunity]:
    """Aynı olaya bağlı, birbirini dışlayan çok sonuçlu piyasa gruplarını tarar.

    Grup = aynı event_slug'ı paylaşan neg_risk piyasalar. Tam olarak bir tanesi
    YES çözülür. İki yönlü kontrol:
      - sum(YES ask) < 1      → tüm YES'leri al  (ödeme: 1)
      - sum(NO ask)  < n - 1  → tüm NO'ları al   (ödeme: n-1)
    """
    groups: dict[str, list[Market]] = {}
    for m in markets:
        if m.neg_risk and m.event_slug and len(m.outcomes) == 2:
            groups.setdefault(m.event_slug, []).append(m)

    opps: list[Opportunity] = []
    for slug, group in groups.items():
        if len(group) < 2:
            continue
        yes_legs = [m.outcomes[0] for m in group]
        no_legs = [m.outcomes[1] for m in group]
        if any(o.best_ask is None for o in yes_legs + no_legs):
            continue

        n = len(group)
        rep = group[0]

        sum_yes = sum(o.best_ask for o in yes_legs)  # type: ignore[arg-type]
        edge_yes = 1.0 - sum_yes
        if edge_yes >= min_edge:
            size = min(o.ask_size for o in yes_legs)
            opps.append(
                Opportunity(
                    kind="negrisk_yes",
                    market=rep,
                    edge=edge_yes,
                    max_size=size,
                    detail=(
                        f"'{slug}' grubundaki {n} sonucun YES toplamı {sum_yes:.3f} < 1 "
                        f"→ hepsini al, garanti {edge_yes:.3f}$/set"
                    ),
                )
            )

        sum_no = sum(o.best_ask for o in no_legs)  # type: ignore[arg-type]
        edge_no = (n - 1) - sum_no
        if edge_no >= min_edge:
            size = min(o.ask_size for o in no_legs)
            opps.append(
                Opportunity(
                    kind="negrisk_no",
                    market=rep,
                    edge=edge_no,
                    max_size=size,
                    detail=(
                        f"'{slug}' grubundaki {n} sonucun NO toplamı {sum_no:.3f} < {n - 1} "
                        f"→ tüm NO'ları al, garanti {edge_no:.3f}$/set"
                    ),
                )
            )
    return opps


def scan_market_making(
    markets: list[Market],
    min_spread: float = 0.04,
    min_volume_24h: float = 5000.0,
) -> list[Opportunity]:
    """Geniş spread'li, hacimli piyasaları piyasa yapıcılık adayı olarak sıralar.

    DİKKAT: Bu arbitraj değildir — envanter riski taşır. Spread'in yarısı,
    kotasyonların iki yanda da dolması varsayımıyla 'beklenen' kenardır.
    """
    opps: list[Opportunity] = []
    for m in markets:
        if m.volume_24h < min_volume_24h or not m.outcomes:
            continue
        o = m.outcomes[0]
        if o.best_bid is None or o.best_ask is None:
            continue
        spread = o.best_ask - o.best_bid
        # Uç fiyatlı (çok kesinleşmiş) piyasalarda spread yanıltıcıdır
        mid = (o.best_ask + o.best_bid) / 2
        if spread >= min_spread and 0.10 <= mid <= 0.90:
            opps.append(
                Opportunity(
                    kind="market_making",
                    market=m,
                    edge=spread / 2,
                    max_size=min(o.bid_size, o.ask_size),
                    detail=(
                        f"spread {spread:.3f} (bid {o.best_bid:.3f} / ask {o.best_ask:.3f}), "
                        f"24s hacim ${m.volume_24h:,.0f} — iki taraflı kotasyon adayı"
                    ),
                )
            )
    return opps


def scan_all(
    markets: list[Market], min_edge: float = 0.005
) -> list[Opportunity]:
    """Tüm tarayıcıları çalıştırır, fırsatları azami kâra göre sıralar."""
    opps = (
        scan_binary_arbitrage(markets, min_edge)
        + scan_negative_risk(markets, min_edge)
        + scan_market_making(markets)
    )
    opps.sort(key=lambda o: o.max_profit, reverse=True)
    return opps
