"""
Kâğıt üstünde (paper trading) portföy defteri.

Gerçek para YOKTUR. Tarayıcının bulduğu fırsatları sanal bir bakiyeyle
"uygular", pozisyonları ve gerçekleşen/varsayımsal kârı JSON dosyasında tutar.
Amaç: stratejinin gerçek hayatta ne getireceğini riske girmeden ölçmek.

Kullanım: main.py `scan --paper` bayrağıyla bunu otomatik çağırır.
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path

from scanner import Opportunity

LEDGER_PATH = Path(__file__).parent / "paper_ledger.json"


@dataclass
class PaperPosition:
    ts: float
    kind: str
    question: str
    url: str
    edge: float
    size: float
    cost: float
    guaranteed_profit: float
    detail: str


@dataclass
class Ledger:
    start_balance: float = 1000.0
    balance: float = 1000.0
    locked: float = 0.0          # çözüm bekleyen pozisyonlarda kilitli para
    realized_pnl: float = 0.0
    positions: list[PaperPosition] = field(default_factory=list)

    @classmethod
    def load(cls) -> "Ledger":
        if LEDGER_PATH.exists():
            data = json.loads(LEDGER_PATH.read_text())
            positions = [PaperPosition(**p) for p in data.pop("positions", [])]
            return cls(**data, positions=positions)
        return cls()

    def save(self) -> None:
        data = asdict(self)
        LEDGER_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    def execute(self, opp: Opportunity, max_stake: float = 100.0) -> PaperPosition | None:
        """Fırsatı sanal olarak uygular. Sadece garanti arbitrajları işler."""
        if opp.kind == "market_making":
            return None  # envanter riski taşır; kâğıt defterde saymıyoruz

        # Maliyet: 1$ ödeme başına (1 - edge). Derinlik ve bakiye ile sınırla.
        unit_cost = 1.0 - opp.edge
        affordable = self.balance / unit_cost if unit_cost > 0 else 0
        size = min(opp.max_size, affordable, max_stake / unit_cost)
        if size < 1:
            return None

        cost = size * unit_cost
        profit = size * opp.edge
        self.balance -= cost
        self.locked += cost
        self.realized_pnl += profit  # arbitraj: çözümde kesinleşecek kâr

        pos = PaperPosition(
            ts=time.time(),
            kind=opp.kind,
            question=opp.market.question,
            url=opp.market.url,
            edge=opp.edge,
            size=round(size, 2),
            cost=round(cost, 2),
            guaranteed_profit=round(profit, 2),
            detail=opp.detail,
        )
        self.positions.append(pos)
        return pos

    def summary(self) -> str:
        total_cost = sum(p.cost for p in self.positions)
        total_profit = sum(p.guaranteed_profit for p in self.positions)
        roi = (total_profit / total_cost * 100) if total_cost else 0.0
        return (
            f"Kâğıt portföy: {len(self.positions)} pozisyon | "
            f"serbest bakiye ${self.balance:,.2f} | kilitli ${self.locked:,.2f} | "
            f"garanti kâr ${total_profit:,.2f} (yatırılan üzerinden %{roi:.2f})"
        )
