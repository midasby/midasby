"""
PIE Analiz Sistemi - Para Yönetimi & Risk Hesaplama
Para Sihirbazı / Price Is Everything
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class RiskCalc:
    account_balance: float
    risk_percent: float        # örn: 2.0  → %2
    entry: float
    sl: float
    tp: float
    pip_value: float = 10.0    # 1 standart lot = $10/pip (EURUSD varsayılan)
    pip_size: float = 0.0001   # forex pip büyüklüğü

    @property
    def risk_amount(self) -> float:
        """Riske edilecek maksimum dolar miktarı"""
        return self.account_balance * (self.risk_percent / 100)

    @property
    def sl_distance(self) -> float:
        """Entry ile SL arası mesafe (fiyat)"""
        return abs(self.entry - self.sl)

    @property
    def tp_distance(self) -> float:
        """Entry ile TP arası mesafe (fiyat)"""
        return abs(self.tp - self.entry)

    @property
    def sl_pips(self) -> float:
        return round(self.sl_distance / self.pip_size, 1)

    @property
    def tp_pips(self) -> float:
        return round(self.tp_distance / self.pip_size, 1)

    @property
    def rr_ratio(self) -> float:
        if self.sl_distance == 0:
            return 0
        return round(self.tp_distance / self.sl_distance, 2)

    @property
    def lot_size(self) -> float:
        """
        Önerilen lot büyüklüğü.
        PDF: '1000$ hesap → günlük max 30$ kayıp → 0.02-0.05 lot'
        """
        if self.sl_pips == 0:
            return 0.01
        lot = self.risk_amount / (self.sl_pips * self.pip_value)
        # Lot sınırları
        lot = max(0.01, min(lot, self.account_balance / 1000))
        return round(lot, 2)

    @property
    def potential_profit(self) -> float:
        return round(self.lot_size * self.tp_pips * self.pip_value, 2)

    @property
    def max_loss(self) -> float:
        return round(self.lot_size * self.sl_pips * self.pip_value, 2)

    @property
    def daily_loss_limit(self) -> float:
        """PDF: 'günlük kaybedilecek miktar sermayenin %3'ünü geçmemeli'"""
        return round(self.account_balance * 0.03, 2)

    @property
    def daily_profit_target(self) -> float:
        """Önerilen günlük kar hedefi (risk'in 2 katı)"""
        return round(self.daily_loss_limit * 2, 2)

    def partial_close_level(self, fraction: float = 2/3) -> float:
        """
        PDF: 'SL kadar karda pozun 2/3'ü kapatılmalı'
        """
        if self.entry < self.sl:  # SELL
            return round(self.entry - self.sl_distance, 5)
        else:  # BUY
            return round(self.entry + self.sl_distance, 5)

    def summary(self) -> dict:
        return {
            "Hesap Bakiyesi":    f"${self.account_balance:,.2f}",
            "Risk Oranı":        f"%{self.risk_percent}",
            "Riske Edilen":      f"${self.risk_amount:.2f}",
            "Giriş":             f"{self.entry:.5f}",
            "Stop Loss":         f"{self.sl:.5f}  ({self.sl_pips} pip)",
            "Take Profit":       f"{self.tp:.5f}  ({self.tp_pips} pip)",
            "R/R Oranı":         f"1 : {self.rr_ratio}",
            "Önerilen Lot":      f"{self.lot_size}",
            "Potansiyel Kar":    f"${self.potential_profit:.2f}",
            "Max Kayıp":         f"${self.max_loss:.2f}",
            "Günlük Kayıp Limiti": f"${self.daily_loss_limit:.2f}",
            "Günlük Kar Hedefi": f"${self.daily_profit_target:.2f}",
            "Kısmi Kapanış":     f"{self.partial_close_level():.5f}",
        }


def calculate_risk(
    account_balance: float,
    entry: float,
    sl: float,
    tp: float,
    risk_percent: float = 2.0,
    pip_size: float = 0.0001,
    pip_value: float = 10.0,
) -> RiskCalc:
    return RiskCalc(
        account_balance=account_balance,
        risk_percent=risk_percent,
        entry=entry,
        sl=sl,
        tp=tp,
        pip_size=pip_size,
        pip_value=pip_value,
    )


def get_pip_info(price: float) -> tuple[float, float]:
    """Fiyata göre pip büyüklüğü ve pip değerini tahmin et."""
    if price < 10:        # EURUSD, GBPUSD gibi
        return 0.0001, 10.0
    elif price < 50:      # USDCAD, USDCHF
        return 0.0001, 10.0
    elif price < 200:     # GBPJPY, EURJPY
        return 0.01, 1000.0
    elif price < 1000:    # USDJPY
        return 0.01, 1000.0
    else:                 # BTCUSD, GOLD
        return 1.0, 1.0
