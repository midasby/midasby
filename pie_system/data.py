"""
PIE Analiz Sistemi - Veri Çekme Modülü
Para Sihirbazı / Price Is Everything
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# ─── Sembol Haritaları ───────────────────────────────────────────
FOREX_MAP = {
    'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'USDJPY': 'USDJPY=X',
    'USDCHF': 'USDCHF=X', 'AUDUSD': 'AUDUSD=X', 'NZDUSD': 'NZDUSD=X',
    'USDCAD': 'USDCAD=X', 'GBPJPY': 'GBPJPY=X', 'EURJPY': 'EURJPY=X',
    'EURGBP': 'EURGBP=X', 'EURCHF': 'EURCHF=X', 'AUDJPY': 'AUDJPY=X',
    'USDDKK': 'USDDKK=X', 'USDTRY': 'TRY=X',
}

CRYPTO_MAP = {
    'BTCUSD': 'BTC-USD', 'ETHUSD': 'ETH-USD', 'BNBUSD': 'BNB-USD',
    'SOLUSD': 'SOL-USD', 'XRPUSD': 'XRP-USD', 'ADAUSD': 'ADA-USD',
    'DOTUSD': 'DOT-USD', 'AVAXUSD': 'AVAX-USD', 'MATICUSD': 'MATIC-USD',
}

STOCK_MAP = {
    'GOLD': 'GC=F', 'SILVER': 'SI=F', 'OIL': 'CL=F',
    'SPX': '^GSPC', 'NAS': '^IXIC', 'DOW': '^DJI',
}

# Korelasyon haritası (PIE sistemine göre)
CORRELATION_MAP = {
    'EURUSD=X': {
        'positive': ['GBPUSD=X', 'AUDUSD=X', 'NZDUSD=X'],
        'negative': ['USDJPY=X', 'USDCHF=X', 'USDDKK=X'],
    },
    'GBPUSD=X': {
        'positive': ['EURUSD=X', 'AUDUSD=X'],
        'negative': ['USDJPY=X', 'USDCHF=X'],
    },
    'BTC-USD': {
        'positive': ['ETH-USD', 'BNB-USD', 'SOL-USD'],
        'negative': [],
    },
    'ETH-USD': {
        'positive': ['BTC-USD', 'BNB-USD', 'SOL-USD'],
        'negative': [],
    },
}


def resolve_symbol(symbol: str) -> str:
    s = symbol.upper().replace('/', '').replace('-', '')
    if s in FOREX_MAP:
        return FOREX_MAP[s]
    if s in CRYPTO_MAP:
        return CRYPTO_MAP[s]
    if s in STOCK_MAP:
        return STOCK_MAP[s]
    return symbol  # As-is (e.g. already "EURUSD=X")


def fetch_ohlcv(symbol: str, period: str = '3mo', interval: str = '4h') -> tuple[str, pd.DataFrame]:
    """
    OHLCV verisi çek ve PIE sistemi için hazırla.
    Döner: (resolved_symbol, dataframe)
    """
    resolved = resolve_symbol(symbol)

    df = yf.download(resolved, period=period, interval=interval, progress=False, auto_adjust=True)

    if df.empty:
        raise ValueError(f"Veri bulunamadı: {resolved} ({symbol})")

    # Çoklu seviyeli kolonları düzelt
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0].lower() for c in df.columns]
    else:
        df.columns = [c.lower() for c in df.columns]

    df = df[['open', 'high', 'low', 'close', 'volume']].copy()
    df.dropna(inplace=True)
    df.index = pd.to_datetime(df.index)

    # ─── Türetilmiş sütunlar ─────────────────────────────────────
    df['body']        = (df['close'] - df['open']).abs()
    df['range']       = df['high'] - df['low']
    df['upper_wick']  = df['high'] - df[['open', 'close']].max(axis=1)
    df['lower_wick']  = df[['open', 'close']].min(axis=1) - df['low']
    df['is_bull']     = df['close'] > df['open']
    df['is_bear']     = df['close'] < df['open']
    df['mid']         = (df['high'] + df['low']) / 2

    # ATR ve ortalamalar
    df['atr']      = df['range'].rolling(14, min_periods=5).mean()
    df['avg_body'] = df['body'].rolling(20, min_periods=5).mean()
    df['avg_range']= df['range'].rolling(20, min_periods=5).mean()

    # Pip değeri (forex için)
    price = df['close'].iloc[-1]
    if price < 10:
        df['pip'] = 0.0001
    elif price < 200:
        df['pip'] = 0.01
    else:
        df['pip'] = 1.0

    return resolved, df


def fetch_correlation_pair(symbol: str, period: str = '3mo', interval: str = '4h') -> dict:
    """Korelasyon çiftlerinin verilerini çek."""
    corr_data = {}
    pairs = CORRELATION_MAP.get(symbol, {})

    for direction, symbols in pairs.items():
        for s in symbols:
            try:
                _, corr_df = fetch_ohlcv(s, period=period, interval=interval)
                corr_data[s] = {'df': corr_df, 'direction': direction}
            except Exception:
                pass

    return corr_data


def get_timeframe_label(interval: str) -> str:
    labels = {
        '1m': '1 Dakika', '5m': '5 Dakika', '15m': '15 Dakika',
        '30m': '30 Dakika', '1h': '1 Saat', '4h': '4 Saat',
        '1d': 'Günlük', '1wk': 'Haftalık', '1mo': 'Aylık',
    }
    return labels.get(interval, interval)
