#!/usr/bin/env python3
"""
PIE ANALİZ SİSTEMİ
Para Sihirbazı (Magician11) — Price Is Everything
Kullanım:
  python main.py --symbol EURUSD --interval 4h --balance 1000 --risk 2
  python main.py --symbol BTCUSD --interval 1d --balance 5000 --risk 1.5
  python main.py --symbol GBPUSD --interval 1h --balance 2000
"""

import argparse
import sys

from rich.console import Console
from rich.prompt import Prompt

from data import fetch_ohlcv, fetch_correlation_pair, get_timeframe_label, resolve_symbol
from patterns import detect_momentum, detect_trend
from supdem import build_supdem_zones
from signals import generate_signals, check_correlation_bias
from risk import calculate_risk, get_pip_info
from report import print_full_report, console

# Interval → period eşlemesi
PERIOD_MAP = {
    '1m':  '5d',  '5m':  '1mo', '15m': '2mo',
    '30m': '3mo', '1h':  '3mo', '4h':  '6mo',
    '1d':  '1y',  '1wk': '3y',  '1mo': '5y',
}


def parse_args():
    p = argparse.ArgumentParser(
        description="PIE Analiz Sistemi — Para Sihirbazı",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Örnekler:
  python main.py --symbol EURUSD --interval 4h --balance 1000
  python main.py --symbol BTCUSD --interval 1d --balance 5000 --risk 1
  python main.py --symbol GOLD   --interval 1h --balance 3000 --risk 2
  python main.py  (interaktif mod)
        """
    )
    p.add_argument('--symbol',   type=str, default=None,  help='Sembol (EURUSD, BTCUSD, GOLD...)')
    p.add_argument('--interval', type=str, default='4h',  help='Zaman dilimi (1h, 4h, 1d...)')
    p.add_argument('--balance',  type=float, default=1000, help='Hesap bakiyesi ($)')
    p.add_argument('--risk',     type=float, default=2.0,  help='Risk yüzdesi (varsayılan: 2)')
    p.add_argument('--corr',     action='store_true',      help='Korelasyon analizi yap')
    return p.parse_args()


def interactive_mode() -> tuple:
    console.print("\n[bold yellow]PIE ANALİZ SİSTEMİ[/bold yellow] — interaktif mod\n")
    symbol   = Prompt.ask("[cyan]Sembol girin[/cyan]", default="EURUSD")
    interval = Prompt.ask("[cyan]Zaman dilimi[/cyan]", default="4h",
                          choices=["1m","5m","15m","30m","1h","4h","1d","1wk"])
    balance  = float(Prompt.ask("[cyan]Hesap bakiyesi ($)[/cyan]", default="1000"))
    risk     = float(Prompt.ask("[cyan]Risk yüzdesi (%)[/cyan]", default="2.0"))
    corr     = Prompt.ask("[cyan]Korelasyon analizi?[/cyan]", default="h",
                          choices=["e","h"]) == "e"
    return symbol, interval, balance, risk, corr


def run_analysis(symbol: str, interval: str, balance: float, risk: float, do_corr: bool):
    period = PERIOD_MAP.get(interval, '3mo')

    # ── 1. Veri çek ───────────────────────────────────────────────
    console.print(f"\n[dim]Veri çekiliyor: [bold]{symbol}[/bold] / {interval}...[/dim]")
    try:
        resolved, df = fetch_ohlcv(symbol, period=period, interval=interval)
    except ValueError as e:
        console.print(f"[red]HATA: {e}[/red]")
        sys.exit(1)

    if len(df) < 30:
        console.print("[red]Yeterli veri yok (min 30 mum gerekli).[/red]")
        sys.exit(1)

    # ── 2. Fiyat değişimi ──────────────────────────────────────────
    price      = float(df['close'].iloc[-1])
    prev_price = float(df['close'].iloc[-2])
    change_pct = ((price - prev_price) / prev_price) * 100

    # ── 3. Trend analizi ───────────────────────────────────────────
    console.print("[dim]Trend analizi...[/dim]")
    trend = detect_trend(df)

    # ── 4. Momentum sayısı ─────────────────────────────────────────
    mom_series    = detect_momentum(df)
    momentum_count = int(mom_series.tail(10).sum())

    # ── 5. Korelasyon ──────────────────────────────────────────────
    corr_bias = None
    if do_corr:
        console.print("[dim]Korelasyon çiftleri çekiliyor...[/dim]")
        corr_data = fetch_correlation_pair(resolved, period=period, interval=interval)
        corr_bias = check_correlation_bias(corr_data)

    # ── 6. Supdem bölgeleri ────────────────────────────────────────
    console.print("[dim]Supdem bölgeleri hesaplanıyor...[/dim]")
    zones = build_supdem_zones(df)

    # ── 7. Sinyaller ──────────────────────────────────────────────
    console.print("[dim]Sinyaller taranıyor...[/dim]")
    signals = generate_signals(df, zones, trend, corr_bias, lookback=8)

    # ── 8. Risk hesabı (en güçlü sinyal için) ─────────────────────
    rc = None
    if signals:
        best = signals[0]
        pip_size, pip_value = get_pip_info(price)
        rc = calculate_risk(
            account_balance=balance,
            entry=best.entry,
            sl=best.sl,
            tp=best.tp,
            risk_percent=risk,
            pip_size=pip_size,
            pip_value=pip_value,
        )

    # ── 9. Rapor ──────────────────────────────────────────────────
    print_full_report(
        symbol=resolved,
        interval=get_timeframe_label(interval),
        price=price,
        change_pct=change_pct,
        trend=trend,
        momentum_count=momentum_count,
        corr_bias=corr_bias,
        zones=zones,
        signals=signals,
        rc=rc,
    )

    console.print(f"[dim]Toplam {len(df)} mum analiz edildi. "
                  f"{len(zones)} Supdem bölgesi, {len(signals)} sinyal bulundu.[/dim]\n")


def main():
    args = parse_args()

    if args.symbol is None:
        symbol, interval, balance, risk, do_corr = interactive_mode()
    else:
        symbol   = args.symbol
        interval = args.interval
        balance  = args.balance
        risk     = args.risk
        do_corr  = args.corr

    run_analysis(symbol, interval, balance, risk, do_corr)


if __name__ == '__main__':
    main()
