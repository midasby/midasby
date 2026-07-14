#!/usr/bin/env python3
"""
Geriye dönük test: son N günde binary arbitraj fırsatı ne sıklıkta oluştu?

CLOB /prices-history ucundan YES ve NO token'larının geçmiş fiyat serisini
çeker, zaman damgalarını hizalar ve YES+NO toplamının 1'in altına düştüğü
anları sayar. Sonuçta "fırsat sıklığı" ve "ortalama kenar" raporlar.

ÖNEMLİ SINIR: prices-history son işlem/orta fiyat verir, ASK fiyatı değil.
Gerçekte alım ask'ten yapılır; yani buradaki sonuç İYİMSER bir üst sınırdır.
Gerçek uygulanabilir kâr bundan DÜŞÜKTÜR. Ayrıca saniyeler süren fırsatlar
dakikalık örneklemede hiç görünmeyebilir. Bu araç kesin getiri ölçmez;
piyasanın ne kadar verimli olduğunu hissettirir.

Kullanım:
  python backtest.py --days 90 --markets 50 --min-edge 0.005
"""

from __future__ import annotations

import argparse
import time
from statistics import mean

from api import CLOB_URL, _get, fetch_active_markets


def price_history(token_id: str, start_ts: int, end_ts: int, fidelity_min: int = 60) -> dict[int, float]:
    """Bir token'ın t -> fiyat sözlüğünü döner (fidelity: dakika)."""
    data = _get(
        f"{CLOB_URL}/prices-history",
        params={
            "market": token_id,
            "startTs": start_ts,
            "endTs": end_ts,
            "fidelity": fidelity_min,
        },
    )
    return {int(p["t"]): float(p["p"]) for p in data.get("history", [])}  # type: ignore[union-attr]


def backtest(days: int, n_markets: int, min_edge: float, fidelity_min: int) -> None:
    end_ts = int(time.time())
    start_ts = end_ts - days * 86400

    print(f"Son {days} gün, en hacimli {n_markets} binary piyasa, "
          f"{fidelity_min} dk örnekleme, eşik {min_edge:.3f}$…\n")
    markets = [m for m in fetch_active_markets(limit=n_markets * 2) if len(m.outcomes) == 2][:n_markets]

    total_points = 0
    opportunity_points = 0
    edges: list[float] = []
    per_market_hits: list[tuple[str, int, float]] = []

    for i, m in enumerate(markets, 1):
        yes_t, no_t = m.outcomes[0].token_id, m.outcomes[1].token_id
        try:
            yes_hist = price_history(yes_t, start_ts, end_ts, fidelity_min)
            no_hist = price_history(no_t, start_ts, end_ts, fidelity_min)
        except RuntimeError as e:
            print(f"  [{i}/{len(markets)}] atlandı ({e})")
            continue

        common = sorted(set(yes_hist) & set(no_hist))
        hits = 0
        market_edges: list[float] = []
        for t in common:
            total_points += 1
            edge = 1.0 - (yes_hist[t] + no_hist[t])
            if edge >= min_edge:
                opportunity_points += 1
                hits += 1
                edges.append(edge)
                market_edges.append(edge)
        if hits:
            per_market_hits.append((m.question, hits, mean(market_edges)))
        print(f"  [{i}/{len(markets)}] {m.question[:60]:60s} "
              f"nokta={len(common):5d} fırsat={hits}")
        time.sleep(0.3)  # rate limit nezaketi

    print("\n================ SONUÇ ================")
    if not total_points:
        print("Veri çekilemedi.")
        return
    freq = opportunity_points / total_points * 100
    print(f"İncelenen örnek nokta : {total_points:,}")
    print(f"Eşiği geçen an        : {opportunity_points:,}  (%{freq:.2f})")
    if edges:
        print(f"Ortalama kenar        : {mean(edges):.4f}$ / adet")
        print(f"En büyük kenar        : {max(edges):.4f}$ / adet")
    print("\nEn çok fırsat veren piyasalar:")
    for q, h, e in sorted(per_market_hits, key=lambda x: -x[1])[:10]:
        print(f"  • {q[:70]} — {h} an, ort. kenar {e:.4f}$")
    print(
        "\nUYARI: Bu sayılar orta/son fiyat üzerinden İYİMSER üst sınırdır.\n"
        "Gerçek alım ask fiyatından olur ve kısa ömürlü fırsatların çoğu\n"
        "botlara kaptırılır. Kararını kâğıt portföy (scan --paper) ile\n"
        "canlı ölçüm yapmadan verme."
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="Binary arbitraj sıklığı backtest'i")
    ap.add_argument("--days", type=int, default=90, help="kaç gün geriye bakılsın")
    ap.add_argument("--markets", type=int, default=50, help="incelenecek piyasa sayısı")
    ap.add_argument("--min-edge", type=float, default=0.005)
    ap.add_argument("--fidelity", type=int, default=60, help="örnekleme aralığı (dakika)")
    args = ap.parse_args()
    backtest(args.days, args.markets, args.min_edge, args.fidelity)


if __name__ == "__main__":
    main()
