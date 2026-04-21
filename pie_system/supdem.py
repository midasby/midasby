"""
PIE Analiz Sistemi - Arz/Talep (Supply/Demand) Bölge Yönetimi
Para Sihirbazı / Price Is Everything
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List
from patterns import detect_engulf, detect_bobins, BobinZone


@dataclass
class SupdemZone:
    zone_type: str     # 'supply' veya 'demand'
    zone_low: float
    zone_high: float
    created_idx: int
    source: str        # 'engulf' veya 'bobin' veya 'magic'
    strength: int = 1  # kaç kez test edildi
    fresh: bool = True
    active: bool = True

    @property
    def mid(self):
        return (self.zone_low + self.zone_high) / 2

    @property
    def width(self):
        return self.zone_high - self.zone_low


def build_supdem_zones(df: pd.DataFrame) -> List[SupdemZone]:
    """
    Engulf ve Bobin formasyonlarından Arz/Talep bölgeleri oluştur.
    PDF: 'Arz-Talep iki oluşuma bakarak çizilir: Engulflar ve Bobinler'
    """
    zones: List[SupdemZone] = []
    engulfs = detect_engulf(df)
    bobins  = detect_bobins(df)
    atr     = df['atr'].fillna(df['range'].mean())

    # ── Engulflardan Supdem ──────────────────────────────────────
    # PDF: 'Engulf oluşumunun yalnız birinci mumundan dikdörtgen çizilir'
    for i in df.index[1:]:
        idx = df.index.get_loc(i)
        a   = atr.iloc[idx]
        if a == 0:
            continue

        # Yükselen Engulf → Talep Bölgesi (demand)
        if engulfs['bull_engulf'].iloc[idx]:
            prev = idx - 1
            z_low  = df['low'].iloc[prev]
            z_high = df['high'].iloc[prev]
            margin = a * 0.1
            zones.append(SupdemZone(
                zone_type='demand',
                zone_low=z_low - margin,
                zone_high=z_high + margin,
                created_idx=idx,
                source='engulf',
            ))

        # Düşen Engulf → Arz Bölgesi (supply)
        if engulfs['bear_engulf'].iloc[idx]:
            prev = idx - 1
            z_low  = df['low'].iloc[prev]
            z_high = df['high'].iloc[prev]
            margin = a * 0.1
            zones.append(SupdemZone(
                zone_type='supply',
                zone_low=z_low - margin,
                zone_high=z_high + margin,
                created_idx=idx,
                source='engulf',
            ))

    # ── Bobinlerden Supdem ───────────────────────────────────────
    # PDF: 'bobinli kısım çözüldükten hemen sonra dikdörtgen çizilir'
    for bobin in bobins:
        end_idx = bobin.end_idx
        if end_idx + 1 >= len(df):
            continue

        # Çözüm yönüne bak
        resolve_bar = df.iloc[end_idx + 1]
        margin = atr.iloc[end_idx] * 0.1

        if resolve_bar['is_bull']:
            zones.append(SupdemZone(
                zone_type='demand',
                zone_low=bobin.zone_low - margin,
                zone_high=bobin.zone_high + margin,
                created_idx=end_idx,
                source='bobin',
                strength=bobin.candle_count // 2,
            ))
        elif resolve_bar['is_bear']:
            zones.append(SupdemZone(
                zone_type='supply',
                zone_low=bobin.zone_low - margin,
                zone_high=bobin.zone_high + margin,
                created_idx=end_idx,
                source='bobin',
                strength=bobin.candle_count // 2,
            ))

    # ── Sihirli Supdem ────────────────────────────────────────────
    # PDF: 'Spike + Spike bölgesinde 3 mum (D-Y-D veya Y-D-Y)'
    _add_magic_supdem(df, zones, atr)

    # ── Test ve güncelleme ────────────────────────────────────────
    _update_zone_tests(df, zones)

    # Çok küçük veya geçersiz bölgeleri filtrele
    min_width = df['atr'].mean() * 0.05
    zones = [z for z in zones if z.width >= min_width and z.active]

    return zones


def _add_magic_supdem(df: pd.DataFrame, zones: List[SupdemZone], atr: pd.Series):
    """
    Sihirli Supdem: Spike + 3 mum (D-Y-D veya Y-D-Y) → kuvvetli bölge
    """
    n = len(df)
    for i in range(4, n - 1):
        a = atr.iloc[i]
        if a == 0:
            continue

        spike_range = df['range'].iloc[i - 1]
        if spike_range < a * 1.8:
            continue

        if i + 3 >= n:
            continue

        d = [df['is_bull'].iloc[i + k] for k in range(3)]

        # Yükselen trend Spike → Y-D-Y (talep)
        if d[0] and not d[1] and d[2]:
            z_low  = min(df['low'].iloc[i:i + 3])
            z_high = max(df['high'].iloc[i:i + 3])
            zones.append(SupdemZone(
                zone_type='demand',
                zone_low=z_low,
                zone_high=z_high,
                created_idx=i + 2,
                source='magic',
                strength=2,
            ))

        # Düşen trend Spike → D-Y-D (arz)
        elif not d[0] and d[1] and not d[2]:
            z_low  = min(df['low'].iloc[i:i + 3])
            z_high = max(df['high'].iloc[i:i + 3])
            zones.append(SupdemZone(
                zone_type='supply',
                zone_low=z_low,
                zone_high=z_high,
                created_idx=i + 2,
                source='magic',
                strength=2,
            ))


def _update_zone_tests(df: pd.DataFrame, zones: List[SupdemZone]):
    """
    Fiyat bölgeyi ziyaret ettikçe 'fresh' durumunu güncelle,
    birden fazla test bölgeyi güçlendirir.
    """
    for zone in zones:
        for i in range(zone.created_idx + 1, len(df)):
            lo = df['low'].iloc[i]
            hi = df['high'].iloc[i]

            if lo <= zone.zone_high and hi >= zone.zone_low:
                if zone.fresh:
                    zone.fresh = False
                    zone.strength += 1
                else:
                    zone.strength += 1

                # 3'ten fazla test edilmiş bölge zayıflamış
                if zone.strength > 4:
                    zone.active = False
                    break


def find_nearest_zones(
    price: float,
    zones: List[SupdemZone],
    zone_type: str = None,
    max_zones: int = 3
) -> List[SupdemZone]:
    """
    Mevcut fiyata en yakın aktif bölgeleri döndür.
    """
    active = [z for z in zones if z.active]
    if zone_type:
        active = [z for z in active if z.zone_type == zone_type]

    active.sort(key=lambda z: abs(z.mid - price))
    return active[:max_zones]


def price_in_zone(price: float, zone: SupdemZone, tolerance: float = 0.0) -> bool:
    return (zone.zone_low - tolerance) <= price <= (zone.zone_high + tolerance)
