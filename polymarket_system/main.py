#!/usr/bin/env python3
"""
Polymarket fırsat tarayıcısı — komut satırı arayüzü.

Komutlar:
  python main.py scan                 # canlı piyasaları tara, fırsatları listele
  python main.py scan --demo          # internet yokken sentetik veriyle test
  python main.py scan --paper         # bulunan arbitrajları kâğıt portföye işle
  python main.py watch [--every 60]   # sürekli tarama döngüsü
  python main.py paper                # kâğıt portföy özetini göster

Sadece OKUMA yapar; hiçbir gerçek emir göndermez, cüzdan/anahtar istemez.
"""

from __future__ import annotations

import argparse
import sys
import time

from scanner import Opportunity, scan_all

KIND_LABELS = {
    "binary_arb": "BİNARY ARBİTRAJ (garanti)",
    "negrisk_yes": "NEG-RİSK YES ARBİTRAJ (garanti)",
    "negrisk_no": "NEG-RİSK NO ARBİTRAJ (garanti)",
    "market_making": "PİYASA YAPICILIK (riskli)",
}


def load_markets(demo: bool, limit: int, min_liquidity: float):
    if demo:
        from demo import synthetic_markets
        print("⚠ Demo modu: sentetik veri kullanılıyor (canlı fiyat değil).\n")
        return synthetic_markets()
    from api import attach_prices, fetch_active_markets
    print(f"Gamma API'den en hacimli {limit} aktif piyasa çekiliyor…")
    markets = fetch_active_markets(limit=limit, min_liquidity=min_liquidity)
    print(f"{len(markets)} piyasa bulundu; emir defterleri çekiliyor…")
    attach_prices(markets)
    return markets


def print_opportunities(opps: list[Opportunity]) -> None:
    if not opps:
        print("Şu an eşiği geçen fırsat yok. (Normaldir: arbitraj pencereleri "
              "saniyeler içinde kapanır — `watch` ile sürekli tarayın.)")
        return
    for i, o in enumerate(opps, 1):
        print(f"\n#{i} [{KIND_LABELS[o.kind]}]")
        print(f"   Piyasa : {o.market.question}")
        print(f"   Link   : {o.market.url}")
        print(f"   Kenar  : {o.edge:.4f}$ / adet  |  derinlik: {o.max_size:,.0f} adet"
              f"  |  azami brüt kâr: ${o.max_profit:,.2f}")
        print(f"   Detay  : {o.detail}")


def cmd_scan(args: argparse.Namespace) -> None:
    markets = load_markets(args.demo, args.limit, args.min_liquidity)
    opps = scan_all(markets, min_edge=args.min_edge)
    print_opportunities(opps)

    if args.paper:
        from paper import Ledger
        ledger = Ledger.load()
        executed = 0
        for o in opps:
            if ledger.execute(o, max_stake=args.max_stake):
                executed += 1
        ledger.save()
        print(f"\n→ {executed} arbitraj kâğıt portföye işlendi.")
        print(ledger.summary())


def cmd_watch(args: argparse.Namespace) -> None:
    print(f"Sürekli tarama: her {args.every} saniyede bir. Ctrl+C ile durdurun.")
    while True:
        try:
            cmd_scan(args)
        except RuntimeError as e:
            print(f"Tarama hatası (tekrar denenecek): {e}", file=sys.stderr)
        time.sleep(args.every)


def cmd_paper(_: argparse.Namespace) -> None:
    from paper import Ledger
    ledger = Ledger.load()
    print(ledger.summary())
    for p in ledger.positions[-10:]:
        print(f"  • {p.question[:70]} | {p.kind} | kâr ${p.guaranteed_profit:.2f}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Polymarket fırsat tarayıcısı")
    sub = parser.add_subparsers(dest="cmd", required=True)

    def add_scan_args(p: argparse.ArgumentParser) -> None:
        p.add_argument("--demo", action="store_true", help="sentetik veriyle çevrimdışı test")
        p.add_argument("--paper", action="store_true", help="arbitrajları kâğıt portföye işle")
        p.add_argument("--limit", type=int, default=200, help="taranacak piyasa sayısı")
        p.add_argument("--min-liquidity", type=float, default=1000.0)
        p.add_argument("--min-edge", type=float, default=0.005,
                       help="adet başına asgari garanti kenar ($)")
        p.add_argument("--max-stake", type=float, default=100.0,
                       help="kâğıt portföyde pozisyon başına azami $")

    p_scan = sub.add_parser("scan", help="tek seferlik tarama")
    add_scan_args(p_scan)
    p_scan.set_defaults(func=cmd_scan)

    p_watch = sub.add_parser("watch", help="sürekli tarama döngüsü")
    add_scan_args(p_watch)
    p_watch.add_argument("--every", type=int, default=60, help="tarama aralığı (sn)")
    p_watch.set_defaults(func=cmd_watch)

    p_paper = sub.add_parser("paper", help="kâğıt portföy özeti")
    p_paper.set_defaults(func=cmd_paper)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
