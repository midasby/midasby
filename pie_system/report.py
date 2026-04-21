"""
PIE Analiz Sistemi - Rich Terminal Dashboard
Para Sihirbazı / Price Is Everything
"""

from datetime import datetime
from typing import List, Optional

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.columns import Columns
from rich.text import Text
from rich.rule import Rule
from rich import box

from signals import TradeSignal, STAR_LABELS
from supdem import SupdemZone
from risk import RiskCalc

console = Console()


def _dir_color(direction: str) -> str:
    return "bold green" if direction == "BUY" else "bold red"


def _trend_icon(direction: str) -> str:
    return {"bull": "[green]▲ YÜKSELİŞ[/green]",
            "bear": "[red]▼ DÜŞÜŞ[/red]",
            "neutral": "[yellow]─ YATAY[/yellow]"}.get(direction, "?")


def print_header(symbol: str, interval: str, price: float, change_pct: float):
    ts = datetime.now().strftime("%d.%m.%Y  %H:%M")
    chg = f"[green]+{change_pct:.2f}%[/green]" if change_pct >= 0 else f"[red]{change_pct:.2f}%[/red]"
    console.print(Panel(
        f"[bold yellow]PIE ANALİZ SİSTEMİ[/bold yellow]  —  Price Is Everything\n"
        f"[cyan]Sembol:[/cyan] [bold]{symbol}[/bold]   "
        f"[cyan]Zaman:[/cyan] [bold]{interval}[/bold]   "
        f"[cyan]Fiyat:[/cyan] [bold white]{price:.5f}[/bold white]  {chg}\n"
        f"[dim]{ts}[/dim]",
        box=box.DOUBLE_EDGE,
        style="bold",
        expand=True,
    ))


def print_trend_and_momentum(trend: dict, momentum_count: int, corr_bias: Optional[str]):
    rows = [
        f"  Trend Yönü   : {_trend_icon(trend['direction'])}  "
        f"(Güç: {'●' * trend['strength']}{'○' * (3 - trend['strength'])})",
        f"  Momentum     : [{'green' if momentum_count > 0 else 'dim'}]"
        f"{'▲ ' + str(momentum_count) + ' momentum mumu' if momentum_count > 0 else 'Düşük momentum'}[/]",
        f"  Korelasyon   : {_trend_icon(corr_bias) if corr_bias else '[dim]Veri yok[/dim]'}",
    ]
    console.print(Panel("\n".join(rows), title="[bold]TREND & MOMENTUM[/bold]", box=box.ROUNDED))


def print_supdem_zones(zones: List[SupdemZone], price: float):
    if not zones:
        console.print("[dim]  Aktif Supdem bölgesi bulunamadı.[/dim]")
        return

    table = Table(box=box.SIMPLE_HEAD, show_header=True, header_style="bold cyan")
    table.add_column("Tür",      style="bold", width=10)
    table.add_column("Alt",      justify="right")
    table.add_column("Üst",      justify="right")
    table.add_column("Kaynak",   width=10)
    table.add_column("Durum",    width=12)
    table.add_column("Güç",      justify="center")

    supply  = sorted([z for z in zones if z.zone_type == "supply"],  key=lambda z: z.mid, reverse=True)
    demand  = sorted([z for z in zones if z.zone_type == "demand"],  key=lambda z: z.mid, reverse=True)

    for z in supply[:4]:
        dist   = ((z.mid - price) / price) * 100
        status = "[green]TAZE[/green]" if z.fresh else "[yellow]TEST[/yellow]"
        table.add_row(
            "[red]ARZ (Satış)[/red]",
            f"{z.zone_low:.5f}",
            f"{z.zone_high:.5f}",
            z.source,
            status,
            "★" * min(z.strength, 5),
        )

    table.add_row("──────────", f"◀ {price:.5f} ▶", "", "", "", "")

    for z in demand[:4]:
        status = "[green]TAZE[/green]" if z.fresh else "[yellow]TEST[/yellow]"
        table.add_row(
            "[green]TALEP (Alış)[/green]",
            f"{z.zone_low:.5f}",
            f"{z.zone_high:.5f}",
            z.source,
            status,
            "★" * min(z.strength, 5),
        )

    console.print(Panel(table, title="[bold]ARZ-TALEP (SUPDEM) BÖLGELERİ[/bold]", box=box.ROUNDED))


def print_signals(signals: List[TradeSignal]):
    if not signals:
        console.print(Panel(
            "[dim]  Son mumda güçlü sinyal bulunamadı.\n"
            "  Bekle, teyit al, acele etme.[/dim]",
            title="[bold]SİNYALLER[/bold]", box=box.ROUNDED
        ))
        return

    for sig in signals[:5]:
        dir_style = _dir_color(sig.direction)
        stars     = STAR_LABELS.get(sig.score, "?")
        confs     = "  •  ".join(sig.confirmations)

        body = (
            f"  [{dir_style}]{'◆ ALIŞ' if sig.direction == 'BUY' else '◆ SATIŞ'}[/]   "
            f"[bold white]{stars}[/bold white]   "
            f"[dim]{sig.timestamp.strftime('%d.%m %H:%M') if sig.timestamp else ''}[/dim]\n\n"
            f"  [cyan]Formasyon :[/cyan] {sig.pattern}\n"
            f"  [cyan]Giriş     :[/cyan] [bold]{sig.entry:.5f}[/bold]\n"
            f"  [red]Stop Loss :[/red] {sig.sl:.5f}\n"
            f"  [green]Take Profit:[/green] {sig.tp:.5f}   "
            f"[bold]R/R 1:{sig.rr_ratio}[/bold]\n"
            f"  [dim]Teyitler  : {confs}[/dim]"
        )
        border = "green" if sig.direction == "BUY" else "red"
        console.print(Panel(body, box=box.ROUNDED, border_style=border,
                            title=f"[bold]SİNYAL #{signals.index(sig)+1}[/bold]"))


def print_risk(rc: RiskCalc):
    table = Table(box=box.SIMPLE, show_header=False, padding=(0, 2))
    table.add_column("Parametre", style="cyan")
    table.add_column("Değer",     style="bold white")

    for k, v in rc.summary().items():
        table.add_row(k, v)

    console.print(Panel(table, title="[bold]PARA YÖNETİMİ[/bold]", box=box.ROUNDED))


def print_rules():
    rules_text = (
        "[bold yellow]PIE SİSTEMİ ALTIN KURALLARI[/bold yellow]\n\n"
        "[cyan]1.[/cyan] Her işlemde [bold]en az 2-3 teyit[/bold] al\n"
        "[cyan]2.[/cyan] [bold]Trend yönünün tersine[/bold] asla işlem açma\n"
        "[cyan]3.[/cyan] Günlük kayıp limitini [bold]aşma[/bold] — ekranı kapat\n"
        "[cyan]4.[/cyan] SL kadar karda pozun [bold]2/3'ünü kapat[/bold]\n"
        "[cyan]5.[/cyan] Supdem'ler [bold]taze</bold> iken en güçlüdür\n"
        "[cyan]6.[/cyan] İndikatör kullanma — [bold]fiyatı oku[/bold]\n"
        "[cyan]7.[/cyan] İşleme [bold]aşık olma[/bold] — SL'i koru\n"
        "[cyan]8.[/cyan] Borç/kredi ile [bold]başlama[/bold]"
    )
    console.print(Panel(rules_text, box=box.ROUNDED, border_style="yellow"))


def print_full_report(
    symbol: str,
    interval: str,
    price: float,
    change_pct: float,
    trend: dict,
    momentum_count: int,
    corr_bias: Optional[str],
    zones: List[SupdemZone],
    signals: List[TradeSignal],
    rc: Optional[RiskCalc] = None,
):
    console.clear()
    console.print()
    print_header(symbol, interval, price, change_pct)
    console.print()
    print_trend_and_momentum(trend, momentum_count, corr_bias)
    console.print()
    print_supdem_zones(zones, price)
    console.print()
    print_signals(signals)
    console.print()
    if rc:
        print_risk(rc)
        console.print()
    print_rules()
    console.print()
