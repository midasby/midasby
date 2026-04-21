"""
PIE Analiz Sistemi - Formasyon Tespiti
Para Sihirbazı / Price Is Everything
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional


# ─────────────────────────────────────────────────────────────────
# Veri Sınıfları
# ─────────────────────────────────────────────────────────────────

@dataclass
class BobinZone:
    start_idx: int
    end_idx: int
    zone_low: float
    zone_high: float
    candle_count: int

@dataclass
class AtNaliSignal:
    idx: int          # son mumun indeksi
    direction: str    # 'BUY' veya 'SELL'
    strength: float   # ne kadar güçlü (0-1)

@dataclass
class YingYangSignal:
    idx: int
    direction: str
    entry: float
    sl: float
    tp: float

@dataclass
class FakePinSignal:
    idx: int
    direction: str
    zone_low: float
    zone_high: float

@dataclass
class QuassiSignal:
    idx: int
    direction: str
    entry: float
    sl: float


# ─────────────────────────────────────────────────────────────────
# MOMENTUM
# ─────────────────────────────────────────────────────────────────

def detect_momentum(df: pd.DataFrame, mult: float = 1.5) -> pd.Series:
    """
    Momentum mumu: ortalamadan belirgin büyük gövde veya range.
    PDF: 'hacim demektir; büyük, diğerlerinden daha uzun olan mum çubuklardır'
    """
    avg_b = df['avg_body'].fillna(df['body'].mean())
    avg_r = df['avg_range'].fillna(df['range'].mean())
    return (df['body'] > avg_b * mult) | (df['range'] > avg_r * mult)


# ─────────────────────────────────────────────────────────────────
# PİNBAR
# ─────────────────────────────────────────────────────────────────

def detect_pinbar(df: pd.DataFrame) -> pd.DataFrame:
    """
    Bullish PinBar : alt iğne uzun, üst iğne kısa  → alıcı var
    Bearish PinBar : üst iğne uzun, alt iğne kısa  → satıcı var
    PDF: 'iğnesi uzun, gövdesi çok kısa olan barlardır'
    """
    body  = df['body']
    rng   = df['range'].replace(0, np.nan)
    upper = df['upper_wick']
    lower = df['lower_wick']

    small_body = body < rng * 0.35

    bull = (
        small_body &
        (lower > body * 2.0) &
        (lower > upper * 2.0) &
        (lower > rng * 0.50)
    )
    bear = (
        small_body &
        (upper > body * 2.0) &
        (upper > lower * 2.0) &
        (upper > rng * 0.50)
    )
    return pd.DataFrame({'bull_pin': bull, 'bear_pin': bear}, index=df.index)


# ─────────────────────────────────────────────────────────────────
# ENGULF
# ─────────────────────────────────────────────────────────────────

def detect_engulf(df: pd.DataFrame) -> pd.DataFrame:
    """
    Yükselen Engulf : önceki düşen bar, ardından daha uzun yükselen bar
    Düşen Engulf    : önceki yükselen bar, ardından daha uzun düşen bar
    """
    body      = df['body']
    prev_body = body.shift(1)
    is_bull   = df['is_bull']
    is_bear   = df['is_bear']

    bull_eng = (
        is_bear.shift(1) & is_bull &
        (body > prev_body * 1.05) &
        (df['close'] > df['open'].shift(1)) &
        (df['open'] <= df['close'].shift(1))
    )
    bear_eng = (
        is_bull.shift(1) & is_bear &
        (body > prev_body * 1.05) &
        (df['close'] < df['open'].shift(1)) &
        (df['open'] >= df['close'].shift(1))
    )
    return pd.DataFrame({'bull_engulf': bull_eng, 'bear_engulf': bear_eng}, index=df.index)


def detect_magic_engulf(df: pd.DataFrame) -> pd.DataFrame:
    """
    Sihirli Engulf: iğnelerin yönü ikinci barın yönündedir.
    PDF: 'İğneli yükselen bar, iğneli düşen kuvvetli bar'
    """
    eng   = detect_engulf(df)
    body  = df['body']
    upper = df['upper_wick']
    lower = df['lower_wick']

    bear_magic = (
        eng['bear_engulf'] &
        (lower > body * 0.25) &
        (upper.shift(1) > body.shift(1) * 0.4)
    )
    bull_magic = (
        eng['bull_engulf'] &
        (upper > body * 0.25) &
        (lower.shift(1) > body.shift(1) * 0.4)
    )
    return pd.DataFrame(
        {'bull_magic_eng': bull_magic, 'bear_magic_eng': bear_magic},
        index=df.index
    )


# ─────────────────────────────────────────────────────────────────
# BOBİN (COİL)
# ─────────────────────────────────────────────────────────────────

def detect_bobins(df: pd.DataFrame, min_candles: int = 4, range_mult: float = 1.4) -> List[BobinZone]:
    """
    Bobin: fiyatın aynı bölgede salınması (karar bölgesi).
    PDF: 'fiyatın bir yukarı bir aşağı giderek aynı bölgede kümelenmesi'
    """
    zones: List[BobinZone] = []
    n = len(df)
    i = 0

    while i < n - min_candles:
        atr_val = df['atr'].iloc[i]
        if pd.isna(atr_val) or atr_val == 0:
            i += 1
            continue
        max_zone = atr_val * range_mult

        z_high = df['high'].iloc[i]
        z_low  = df['low'].iloc[i]
        j = i + 1

        while j < n:
            nh = max(z_high, df['high'].iloc[j])
            nl = min(z_low,  df['low'].iloc[j])
            if nh - nl > max_zone:
                break
            z_high, z_low = nh, nl
            j += 1

        count = j - i
        if count >= min_candles:
            directions = df['is_bull'].iloc[i:j].values
            changes = sum(1 for k in range(1, len(directions)) if directions[k] != directions[k-1])
            if changes >= 2:
                zones.append(BobinZone(i, j - 1, z_low, z_high, count))
                i = j
                continue
        i += 1

    return zones


# ─────────────────────────────────────────────────────────────────
# AT NALI FORMASYONU
# ─────────────────────────────────────────────────────────────────

def detect_at_nali(df: pd.DataFrame) -> List[AtNaliSignal]:
    """
    4 mumdan oluşur. Kenardakiler ortadakilerden belirgin uzun.
    Bearish: Y-D-Y-D  |  Bullish: D-Y-D-Y
    PDF: 'birinci ve dördüncü barların uzunlukları ikinci ve üçüncüden daha uzun olmalı'
    """
    signals: List[AtNaliSignal] = []
    n = len(df)

    for i in range(3, n):
        b = [df['body'].iloc[i - 3 + k] for k in range(4)]
        d = [df['is_bull'].iloc[i - 3 + k] for k in range(4)]  # True=bull

        outer_min = min(b[0], b[3])
        inner_max = max(b[1], b[2])

        if outer_min <= inner_max * 1.1:
            continue

        # Bearish at nalı: Y-D-Y-D
        if d[0] and not d[1] and d[2] and not d[3]:
            strength = b[3] / b[0] if b[0] > 0 else 0
            signals.append(AtNaliSignal(i, 'SELL', min(strength, 1.5)))

        # Bullish at nalı: D-Y-D-Y
        elif not d[0] and d[1] and not d[2] and d[3]:
            strength = b[3] / b[0] if b[0] > 0 else 0
            signals.append(AtNaliSignal(i, 'BUY', min(strength, 1.5)))

    return signals


# ─────────────────────────────────────────────────────────────────
# YİNG YANG FORMASYONU
# ─────────────────────────────────────────────────────────────────

def detect_ying_yang(df: pd.DataFrame) -> List[YingYangSignal]:
    """
    2 ardışık aynı yönlü mum, zıt iğne yapısı.
    PDF: 'iki düşen bar; 1. kısa üst uzun alt iğne, 2. uzun üst kısa alt iğne'
    """
    signals: List[YingYangSignal] = []
    n = len(df)
    pip = df['pip'].iloc[-1]

    for i in range(1, n):
        body1  = df['body'].iloc[i - 1]
        body2  = df['body'].iloc[i]
        upper1 = df['upper_wick'].iloc[i - 1]
        lower1 = df['lower_wick'].iloc[i - 1]
        upper2 = df['upper_wick'].iloc[i]
        lower2 = df['lower_wick'].iloc[i]
        atr    = df['atr'].iloc[i]

        if atr == 0 or pd.isna(atr):
            continue

        min_wick = atr * 0.3

        # Bearish Ying Yang: iki düşen mum
        if df['is_bear'].iloc[i - 1] and df['is_bear'].iloc[i]:
            if (lower1 > min_wick and upper1 < lower1 * 0.4 and
                    upper2 > min_wick and lower2 < upper2 * 0.4):
                entry = df['close'].iloc[i]
                sl    = df['high'].iloc[i - 1] + atr * 0.1
                tp    = entry - (body1 + body2)
                signals.append(YingYangSignal(i, 'SELL', entry, sl, tp))

        # Bullish Ying Yang: iki yükselen mum
        elif df['is_bull'].iloc[i - 1] and df['is_bull'].iloc[i]:
            if (upper1 > min_wick and lower1 < upper1 * 0.4 and
                    lower2 > min_wick and upper2 < lower2 * 0.4):
                entry = df['close'].iloc[i]
                sl    = df['low'].iloc[i - 1] - atr * 0.1
                tp    = entry + (body1 + body2)
                signals.append(YingYangSignal(i, 'BUY', entry, sl, tp))

    return signals


# ─────────────────────────────────────────────────────────────────
# FAKE PİNBAR FORMASYONU
# ─────────────────────────────────────────────────────────────────

def detect_fake_pinbar(df: pd.DataFrame, min_inner: int = 2) -> List[FakePinSignal]:
    """
    Büyük bir mumun gölgesinde küçük mumlar, son mum dışa Spike → geri döner.
    PDF: 'Hangi yöne doğru fake pin attıysa tersi yöne doğru fiyat gider'
    """
    signals: List[FakePinSignal] = []
    n = len(df)

    for i in range(2 + min_inner, n):
        # Zone mumu: büyük mum
        zone_high = df['high'].iloc[i - min_inner - 2]
        zone_low  = df['low'].iloc[i - min_inner - 2]
        zone_body = df['body'].iloc[i - min_inner - 2]
        atr       = df['atr'].iloc[i]

        if zone_body < atr * 0.8:
            continue

        # İç mumlar zone içinde mi?
        inner_ok = all(
            df['high'].iloc[j] <= zone_high and df['low'].iloc[j] >= zone_low
            for j in range(i - min_inner - 1, i - 1)
        )
        if not inner_ok:
            continue

        # Son mum: dışa Spike atar ama kapanış zone içinde
        last_high  = df['high'].iloc[i - 1]
        last_low   = df['low'].iloc[i - 1]
        last_close = df['close'].iloc[i - 1]
        last_open  = df['open'].iloc[i - 1]

        if last_high > zone_high and last_close < zone_high:
            signals.append(FakePinSignal(i - 1, 'SELL', zone_low, zone_high))

        elif last_low < zone_low and last_close > zone_low:
            signals.append(FakePinSignal(i - 1, 'BUY', zone_low, zone_high))

    return signals


# ─────────────────────────────────────────────────────────────────
# TESTERE FORMASYONU
# ─────────────────────────────────────────────────────────────────

def detect_testere(df: pd.DataFrame, bobins: List[BobinZone]) -> List[dict]:
    """
    Bobin → Spike → Hacimli kırılım → Test aşamasında giriş.
    PDF: 'sadece dördüncü aşamada (test aşamasında) dahil olunur'
    """
    signals = []
    n = len(df)

    for bobin in bobins:
        end = bobin.end_idx
        if end + 4 >= n:
            continue

        atr = df['atr'].iloc[end]

        # Adım 1: Bobinden hemen sonra Spike var mı?
        spike_low  = df['low'].iloc[end + 1]
        spike_high = df['high'].iloc[end + 1]
        spike_rng  = df['range'].iloc[end + 1]

        if spike_rng < atr * 1.3:
            continue

        # Adım 2: Spike yönünde momentumlu mum
        if spike_low < bobin.zone_low:  # Aşağı Spike
            direction = 'BUY'
            momentum_bar = end + 2
            if momentum_bar >= n:
                continue
            if not (df['is_bear'].iloc[momentum_bar] and df['body'].iloc[momentum_bar] > atr * 0.8):
                continue
            broken_level = bobin.zone_low

        elif spike_high > bobin.zone_high:  # Yukarı Spike
            direction = 'SELL'
            momentum_bar = end + 2
            if momentum_bar >= n:
                continue
            if not (df['is_bull'].iloc[momentum_bar] and df['body'].iloc[momentum_bar] > atr * 0.8):
                continue
            broken_level = bobin.zone_high
        else:
            continue

        # Adım 3: Test aşaması - fiyat seviyeye geri döndü mü?
        for t in range(momentum_bar + 1, min(momentum_bar + 10, n)):
            price_now = df['close'].iloc[t]
            if direction == 'BUY' and abs(price_now - broken_level) < atr * 0.3:
                signals.append({
                    'idx': t, 'direction': direction,
                    'entry': broken_level,
                    'sl': broken_level - atr * 1.2,
                    'tp': broken_level + atr * 2.5,
                    'pattern': 'Testere'
                })
                break
            elif direction == 'SELL' and abs(price_now - broken_level) < atr * 0.3:
                signals.append({
                    'idx': t, 'direction': direction,
                    'entry': broken_level,
                    'sl': broken_level + atr * 1.2,
                    'tp': broken_level - atr * 2.5,
                    'pattern': 'Testere'
                })
                break

    return signals


# ─────────────────────────────────────────────────────────────────
# TREND TESPİTİ
# ─────────────────────────────────────────────────────────────────

def detect_trend(df: pd.DataFrame, lookback: int = 30) -> dict:
    """
    Swing high/low karşılaştırmasıyla trend tespiti.
    Döner: {'direction': 'bull'/'bear'/'neutral', 'strength': 0-3}
    """
    if len(df) < lookback:
        return {'direction': 'neutral', 'strength': 0}

    recent = df.tail(lookback)

    # Pivot noktaları bul
    highs = recent['high'].values
    lows  = recent['low'].values

    def find_pivots(arr, window=3):
        pivots = []
        for i in range(window, len(arr) - window):
            if arr[i] == max(arr[i - window:i + window + 1]):
                pivots.append((i, arr[i]))
        return pivots

    def find_troughs(arr, window=3):
        troughs = []
        for i in range(window, len(arr) - window):
            if arr[i] == min(arr[i - window:i + window + 1]):
                troughs.append((i, arr[i]))
        return troughs

    pivot_highs  = find_pivots(highs)
    pivot_lows   = find_troughs(lows)

    bull_score = 0
    bear_score = 0

    # Yükselen yüksekler / yükselen dipler → bullish
    if len(pivot_highs) >= 2:
        if pivot_highs[-1][1] > pivot_highs[-2][1]:
            bull_score += 1
        else:
            bear_score += 1

    if len(pivot_lows) >= 2:
        if pivot_lows[-1][1] > pivot_lows[-2][1]:
            bull_score += 1
        else:
            bear_score += 1

    # Son kapanış pozisyonu
    last_close = recent['close'].iloc[-1]
    mid_high   = recent['high'].mean()
    mid_low    = recent['low'].mean()
    if last_close > (mid_high + mid_low) / 2:
        bull_score += 1
    else:
        bear_score += 1

    if bull_score > bear_score:
        return {'direction': 'bull', 'strength': bull_score}
    elif bear_score > bull_score:
        return {'direction': 'bear', 'strength': bear_score}
    else:
        return {'direction': 'neutral', 'strength': 0}


# ─────────────────────────────────────────────────────────────────
# QUASSIMODO FORMASYONU
# ─────────────────────────────────────────────────────────────────

def detect_quassimodo(df: pd.DataFrame) -> List[QuassiSignal]:
    """
    A → B → C(yeni tepe) → D(yeni dip) → E(A hizasında tepe) → SATIŞ
    PDF: 'E noktasına geldikten sonra direkt satış yapılır'
    """
    signals: List[QuassiSignal] = []
    n   = len(df)
    atr = df['atr'].iloc[-1] if not pd.isna(df['atr'].iloc[-1]) else df['range'].mean()

    window = 5

    def local_max(i):
        start = max(0, i - window)
        end   = min(n, i + window + 1)
        return df['high'].iloc[start:end].max() == df['high'].iloc[i]

    def local_min(i):
        start = max(0, i - window)
        end   = min(n, i + window + 1)
        return df['low'].iloc[start:end].min() == df['low'].iloc[i]

    peaks   = [i for i in range(window, n - window) if local_max(i)]
    troughs = [i for i in range(window, n - window) if local_min(i)]

    for idx in range(4, min(len(peaks), 10)):
        if idx - 2 >= len(troughs):
            continue

        c_idx = peaks[idx]      # Yeni tepe (C)
        a_idx = peaks[idx - 2]  # Önceki tepe (A)
        e_idx = peaks[idx - 1] if idx - 1 < len(peaks) else None

        if e_idx is None:
            continue

        a_high = df['high'].iloc[a_idx]
        c_high = df['high'].iloc[c_idx]
        e_high = df['high'].iloc[e_idx]

        # C > A ve E ≈ A (E, A hizasında)
        if c_high > a_high and abs(e_high - a_high) < atr * 1.5:
            sl_level = c_high + atr * 0.5
            signals.append(QuassiSignal(
                idx=e_idx,
                direction='SELL',
                entry=e_high,
                sl=sl_level
            ))

    return signals


# ─────────────────────────────────────────────────────────────────
# BOŞALT DOLDUR
# ─────────────────────────────────────────────────────────────────

def detect_bosalt_doldur(df: pd.DataFrame) -> List[dict]:
    """
    İğnelenen bölge büyük bir barla doldurulur → taraf değişimi.
    PDF: 'iğnelenen bölge büyük bir barla doldurulur, taraf değişir'
    """
    signals = []
    n   = len(df)
    atr = df['atr']

    for i in range(2, n - 1):
        avg = atr.iloc[i]
        if pd.isna(avg) or avg == 0:
            continue

        # Aşağı Spike, ardından büyük yükselen mum
        if (df['lower_wick'].iloc[i - 1] > avg * 1.5 and
                df['is_bull'].iloc[i] and
                df['body'].iloc[i] > avg * 1.2):
            signals.append({
                'idx': i, 'direction': 'BUY',
                'entry': df['close'].iloc[i],
                'sl': df['low'].iloc[i - 1] - avg * 0.2,
                'tp': df['close'].iloc[i] + df['lower_wick'].iloc[i - 1],
                'pattern': 'Boşalt-Doldur'
            })

        # Yukarı Spike, ardından büyük düşen mum
        elif (df['upper_wick'].iloc[i - 1] > avg * 1.5 and
              df['is_bear'].iloc[i] and
              df['body'].iloc[i] > avg * 1.2):
            signals.append({
                'idx': i, 'direction': 'SELL',
                'entry': df['close'].iloc[i],
                'sl': df['high'].iloc[i - 1] + avg * 0.2,
                'tp': df['close'].iloc[i] - df['upper_wick'].iloc[i - 1],
                'pattern': 'Boşalt-Doldur'
            })

    return signals
