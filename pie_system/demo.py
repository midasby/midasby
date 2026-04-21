"""
PIE Analiz Sistemi - Demo Modu (Sentetik Veri)
Gerçek kullanımda: python main.py --symbol EURUSD --interval 4h --balance 1000
"""

import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Sentetik OHLCV verisi üret (gerçekçi fiyat hareketi)
def make_demo_data(n=200, base=1.0850, seed=42):
    np.random.seed(seed)
    dates = pd.date_range(end=datetime.now(), periods=n, freq='4h')
    close = [base]

    for _ in range(n - 1):
        change = np.random.normal(0, 0.0015)
        # Zaman zaman momentum mumları
        if np.random.random() < 0.05:
            change *= 3
        close.append(max(0.5, close[-1] + change))

    close = np.array(close)
    body_half = np.abs(np.random.normal(0, 0.0005, n))
    open_ = close - body_half * np.sign(np.random.randn(n))
    high  = np.maximum(close, open_) + np.abs(np.random.normal(0, 0.0008, n))
    low   = np.minimum(close, open_) - np.abs(np.random.normal(0, 0.0008, n))
    vol   = np.random.randint(5000, 50000, n).astype(float)

    df = pd.DataFrame({'open': open_, 'high': high, 'low': low,
                       'close': close, 'volume': vol}, index=dates)

    df['body']       = (df['close'] - df['open']).abs()
    df['range']      = df['high'] - df['low']
    df['upper_wick'] = df['high'] - df[['open','close']].max(axis=1)
    df['lower_wick'] = df[['open','close']].min(axis=1) - df['low']
    df['is_bull']    = df['close'] > df['open']
    df['is_bear']    = df['close'] < df['open']
    df['mid']        = (df['high'] + df['low']) / 2
    df['atr']        = df['range'].rolling(14, min_periods=5).mean()
    df['avg_body']   = df['body'].rolling(20, min_periods=5).mean()
    df['avg_range']  = df['range'].rolling(20, min_periods=5).mean()
    df['pip']        = 0.0001

    return df


def run_demo():
    from patterns  import detect_momentum, detect_trend
    from supdem    import build_supdem_zones
    from signals   import generate_signals
    from risk      import calculate_risk, get_pip_info
    from report    import print_full_report, console

    console.print("\n[bold yellow]DEMO MODU — Sentetik EURUSD 4H Verisi[/bold yellow]\n")

    df    = make_demo_data()
    price = float(df['close'].iloc[-1])
    prev  = float(df['close'].iloc[-2])
    chg   = ((price - prev) / prev) * 100

    trend          = detect_trend(df)
    mom            = detect_momentum(df)
    momentum_count = int(mom.tail(10).sum())
    zones          = build_supdem_zones(df)
    signals        = generate_signals(df, zones, trend, corr_bias=None, lookback=10)

    rc = None
    if signals:
        best = signals[0]
        pip_size, pip_value = get_pip_info(price)
        rc = calculate_risk(1000, best.entry, best.sl, best.tp,
                            risk_percent=2.0, pip_size=pip_size, pip_value=pip_value)

    print_full_report(
        symbol='EURUSD=X (DEMO)',
        interval='4 Saat',
        price=price,
        change_pct=chg,
        trend=trend,
        momentum_count=momentum_count,
        corr_bias=None,
        zones=zones,
        signals=signals,
        rc=rc,
    )

    console.print(f"[dim]{len(df)} mum, {len(zones)} Supdem bölgesi, {len(signals)} sinyal[/dim]\n")


if __name__ == '__main__':
    sys.path.insert(0, '.')
    run_demo()
