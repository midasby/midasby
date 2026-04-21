"""
PIE Analiz Sistemi - Çoklu Teyit Sinyal Motoru
Para Sihirbazı / Price Is Everything
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional
from patterns import (
    detect_momentum, detect_pinbar, detect_engulf, detect_magic_engulf,
    detect_at_nali, detect_ying_yang, detect_fake_pinbar,
    detect_testere, detect_quassimodo, detect_bosalt_doldur,
    detect_bobins, detect_trend
)
from supdem import build_supdem_zones, find_nearest_zones, price_in_zone, SupdemZone


@dataclass
class TradeSignal:
    pattern: str
    direction: str          # 'BUY' / 'SELL'
    entry: float
    sl: float
    tp: float
    score: int              # 1-5 yıldız
    confirmations: List[str] = field(default_factory=list)
    timestamp: Optional[object] = None
    idx: int = -1
    rr_ratio: float = 0.0
    zone: Optional[SupdemZone] = None

    def __post_init__(self):
        risk   = abs(self.entry - self.sl)
        reward = abs(self.tp - self.entry)
        self.rr_ratio = round(reward / risk, 2) if risk > 0 else 0


STAR_LABELS = {1: "★☆☆☆☆", 2: "★★☆☆☆", 3: "★★★☆☆", 4: "★★★★☆", 5: "★★★★★"}


def generate_signals(
    df: pd.DataFrame,
    zones: List[SupdemZone],
    trend: dict,
    corr_bias: Optional[str] = None,   # 'bull' / 'bear' / None
    lookback: int = 5,
) -> List[TradeSignal]:
    """
    Son `lookback` mumda oluşan tüm formasyonları tara,
    teyit sayısına göre puanla ve sırala.
    """
    signals: List[TradeSignal] = []

    n        = len(df)
    start    = max(0, n - lookback)
    atr      = df['atr'].iloc[-1]
    price    = df['close'].iloc[-1]
    pip      = df['pip'].iloc[-1]
    momentum = detect_momentum(df)
    pins     = detect_pinbar(df)
    engulfs  = detect_engulf(df)
    m_eng    = detect_magic_engulf(df)
    bobins   = detect_bobins(df)

    # ── PinBar Sinyalleri ─────────────────────────────────────────
    for i in range(start, n):
        if pins['bull_pin'].iloc[i]:
            sig = _build_signal(df, i, 'BUY', 'PinBar', zones, trend, momentum,
                                corr_bias, atr, pip)
            if sig:
                signals.append(sig)

        if pins['bear_pin'].iloc[i]:
            sig = _build_signal(df, i, 'SELL', 'PinBar', zones, trend, momentum,
                                corr_bias, atr, pip)
            if sig:
                signals.append(sig)

    # ── Magic Engulf Sinyalleri ───────────────────────────────────
    for i in range(start, n):
        if m_eng['bull_magic_eng'].iloc[i]:
            sig = _build_signal(df, i, 'BUY', 'Sihirli Engulf', zones, trend,
                                momentum, corr_bias, atr, pip)
            if sig:
                signals.append(sig)

        if m_eng['bear_magic_eng'].iloc[i]:
            sig = _build_signal(df, i, 'SELL', 'Sihirli Engulf', zones, trend,
                                momentum, corr_bias, atr, pip)
            if sig:
                signals.append(sig)

    # ── Normal Engulf (Supdem'de) ─────────────────────────────────
    for i in range(start, n):
        if engulfs['bull_engulf'].iloc[i]:
            sig = _build_signal(df, i, 'BUY', 'Engulf', zones, trend, momentum,
                                corr_bias, atr, pip, require_zone=True)
            if sig:
                signals.append(sig)

        if engulfs['bear_engulf'].iloc[i]:
            sig = _build_signal(df, i, 'SELL', 'Engulf', zones, trend, momentum,
                                corr_bias, atr, pip, require_zone=True)
            if sig:
                signals.append(sig)

    # ── At Nalı ───────────────────────────────────────────────────
    for s in detect_at_nali(df):
        if s.idx >= start:
            sig = _build_signal(df, s.idx, s.direction, 'At Nalı', zones, trend,
                                momentum, corr_bias, atr, pip)
            if sig:
                signals.append(sig)

    # ── Ying Yang ─────────────────────────────────────────────────
    for s in detect_ying_yang(df):
        if s.idx >= start:
            nearby = find_nearest_zones(s.entry, zones, max_zones=1)
            score, confs = _score(df, s.idx, s.direction, zones, trend, momentum, corr_bias)
            signal = TradeSignal(
                pattern='Ying Yang',
                direction=s.direction,
                entry=s.entry,
                sl=s.sl,
                tp=s.tp,
                score=score,
                confirmations=confs,
                timestamp=df.index[s.idx],
                idx=s.idx,
                zone=nearby[0] if nearby else None,
            )
            signals.append(signal)

    # ── Fake PinBar ───────────────────────────────────────────────
    for s in detect_fake_pinbar(df):
        if s.idx >= start:
            entry = df['close'].iloc[s.idx]
            if s.direction == 'BUY':
                sl = s.zone_low - atr * 0.3
                tp = entry + atr * 2
            else:
                sl = s.zone_high + atr * 0.3
                tp = entry - atr * 2
            score, confs = _score(df, s.idx, s.direction, zones, trend, momentum, corr_bias)
            signals.append(TradeSignal(
                pattern='Fake PinBar',
                direction=s.direction,
                entry=entry, sl=sl, tp=tp,
                score=score, confirmations=confs,
                timestamp=df.index[s.idx], idx=s.idx,
            ))

    # ── Testere ───────────────────────────────────────────────────
    for s in detect_testere(df, bobins):
        if s['idx'] >= start:
            score, confs = _score(df, s['idx'], s['direction'], zones, trend, momentum, corr_bias)
            signals.append(TradeSignal(
                pattern='Testere',
                direction=s['direction'],
                entry=s['entry'], sl=s['sl'], tp=s['tp'],
                score=score + 1, confirmations=confs,
                timestamp=df.index[s['idx']], idx=s['idx'],
            ))

    # ── Quassimodo ────────────────────────────────────────────────
    for s in detect_quassimodo(df):
        if s.idx >= start:
            tp = df['close'].iloc[s.idx] - (s.sl - df['close'].iloc[s.idx]) * 2
            score, confs = _score(df, s.idx, s.direction, zones, trend, momentum, corr_bias)
            signals.append(TradeSignal(
                pattern='Quassimodo',
                direction=s.direction,
                entry=s.entry, sl=s.sl, tp=tp,
                score=score + 1, confirmations=confs,
                timestamp=df.index[s.idx], idx=s.idx,
            ))

    # ── Boşalt-Doldur ─────────────────────────────────────────────
    for s in detect_bosalt_doldur(df):
        if s['idx'] >= start:
            score, confs = _score(df, s['idx'], s['direction'], zones, trend, momentum, corr_bias)
            signals.append(TradeSignal(
                pattern='Boşalt-Doldur',
                direction=s['direction'],
                entry=s['entry'], sl=s['sl'], tp=s['tp'],
                score=score, confirmations=confs,
                timestamp=df.index[s['idx']], idx=s['idx'],
            ))

    # Filtrele: min 2 yıldız, pozitif R/R
    signals = [s for s in signals if s.score >= 2 and s.rr_ratio >= 1.5]

    # En güçlü sinyaller önce
    signals.sort(key=lambda x: (-x.score, -x.rr_ratio))

    return signals


def _build_signal(
    df, idx, direction, pattern, zones, trend, momentum,
    corr_bias, atr, pip, require_zone=False
) -> Optional[TradeSignal]:
    """Tek bir sinyal inşa et, teyitleri hesapla."""

    entry = df['close'].iloc[idx]
    nearby_zones = find_nearest_zones(
        entry, zones,
        zone_type='demand' if direction == 'BUY' else 'supply'
    )

    in_zone = any(price_in_zone(entry, z, atr * 0.3) for z in nearby_zones)

    if require_zone and not in_zone:
        return None

    # SL/TP hesapla
    if direction == 'BUY':
        sl = df['low'].iloc[max(0, idx - 1)] - atr * 0.2
        tp = entry + (entry - sl) * 2.5
    else:
        sl = df['high'].iloc[max(0, idx - 1)] + atr * 0.2
        tp = entry - (sl - entry) * 2.5

    score, confs = _score(df, idx, direction, zones, trend, momentum, corr_bias)

    if in_zone:
        score = min(score + 1, 5)
        confs.append("Supdem Bölgesi")

    return TradeSignal(
        pattern=pattern,
        direction=direction,
        entry=entry, sl=sl, tp=tp,
        score=score, confirmations=confs,
        timestamp=df.index[idx], idx=idx,
        zone=nearby_zones[0] if nearby_zones else None,
    )


def _score(df, idx, direction, zones, trend, momentum, corr_bias) -> tuple[int, list]:
    """Teyit sayısını hesapla (1-5)."""
    score = 1
    confs = [f"Temel Formasyon"]

    # Trend teyidi
    if trend['direction'] == 'bull' and direction == 'BUY':
        score += 1
        confs.append("Trend Uyumlu (YUK)")
    elif trend['direction'] == 'bear' and direction == 'SELL':
        score += 1
        confs.append("Trend Uyumlu (DUS)")

    # Momentum teyidi
    if momentum.iloc[idx] or (idx > 0 and momentum.iloc[idx - 1]):
        score += 1
        confs.append("Momentum Var")

    # Korelasyon teyidi
    if corr_bias:
        if corr_bias == 'bull' and direction == 'BUY':
            score += 1
            confs.append("Korelasyon Uyumlu")
        elif corr_bias == 'bear' and direction == 'SELL':
            score += 1
            confs.append("Korelasyon Uyumlu")

    score = min(score, 5)
    return score, confs


def check_correlation_bias(corr_data: dict) -> Optional[str]:
    """
    Korelasyon çiftlerinin trend yönünü kontrol et.
    Çoğunluk hangi yönde ise onu döndür.
    """
    bull = 0
    bear = 0
    for sym, info in corr_data.items():
        t = detect_trend(info['df'])
        if info['direction'] == 'positive':
            if t['direction'] == 'bull':
                bull += 1
            elif t['direction'] == 'bear':
                bear += 1
        else:  # negative
            if t['direction'] == 'bull':
                bear += 1
            elif t['direction'] == 'bear':
                bull += 1

    if bull > bear:
        return 'bull'
    elif bear > bull:
        return 'bear'
    return None
