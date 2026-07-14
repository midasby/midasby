"""
Çevrimdışı demo: sentetik piyasa verisiyle tarayıcıyı uçtan uca test eder.

İnternet erişimi olmayan ortamlarda `python main.py scan --demo` bunu kullanır.
Sentetik veri, gerçek hayatta görülen üç fırsat tipini de içerir; böylece
tarayıcı mantığının doğru çalıştığı doğrulanabilir.
"""

from __future__ import annotations

from api import Market, Outcome


def synthetic_markets() -> list[Market]:
    return [
        # 1) Binary arbitraj: 0.46 + 0.52 = 0.98 < 1 → 0.02 kenar
        Market(
            id="demo-1",
            question="[DEMO] BTC 100k üzerinde mi kapanır?",
            slug="demo-btc-100k",
            volume_24h=250_000,
            liquidity=80_000,
            end_date="2026-12-31",
            neg_risk=False,
            outcomes=[
                Outcome("Yes", "t1", best_bid=0.45, best_ask=0.46, bid_size=900, ask_size=1200),
                Outcome("No", "t2", best_bid=0.51, best_ask=0.52, bid_size=800, ask_size=1500),
            ],
        ),
        # 2) Verimli piyasa: 0.60 + 0.41 = 1.01 → fırsat YOK (doğru elenmeli)
        Market(
            id="demo-2",
            question="[DEMO] Faiz indirimi gelir mi?",
            slug="demo-rate-cut",
            volume_24h=500_000,
            liquidity=200_000,
            end_date="2026-09-30",
            neg_risk=False,
            outcomes=[
                Outcome("Yes", "t3", best_bid=0.59, best_ask=0.60, bid_size=5000, ask_size=5000),
                Outcome("No", "t4", best_bid=0.40, best_ask=0.41, bid_size=5000, ask_size=5000),
            ],
        ),
        # 3) Negatif-risk grubu: 3 aday, YES toplamı 0.31+0.33+0.32 = 0.96 < 1
        *[
            Market(
                id=f"demo-3{i}",
                question=f"[DEMO] Seçimi {aday} kazanır mı?",
                slug=f"demo-secim-{aday.lower()}",
                volume_24h=120_000,
                liquidity=40_000,
                end_date="2026-11-03",
                neg_risk=True,
                event_slug="demo-secim-2026",
                outcomes=[
                    Outcome("Yes", f"ty{i}", best_bid=yes - 0.01, best_ask=yes,
                            bid_size=600, ask_size=700),
                    Outcome("No", f"tn{i}", best_bid=1 - yes - 0.02, best_ask=1 - yes - 0.01,
                            bid_size=600, ask_size=700),
                ],
            )
            for i, (aday, yes) in enumerate([("Ali", 0.31), ("Veli", 0.33), ("Ayşe", 0.32)])
        ],
        # 4) Piyasa yapıcılık adayı: geniş spread (0.35 / 0.45), yüksek hacim
        Market(
            id="demo-4",
            question="[DEMO] Film gişede 1 milyar $ aşar mı?",
            slug="demo-gise",
            volume_24h=60_000,
            liquidity=15_000,
            end_date="2026-08-31",
            neg_risk=False,
            outcomes=[
                Outcome("Yes", "t9", best_bid=0.35, best_ask=0.45, bid_size=300, ask_size=350),
                Outcome("No", "t10", best_bid=0.54, best_ask=0.66, bid_size=300, ask_size=350),
            ],
        ),
    ]
