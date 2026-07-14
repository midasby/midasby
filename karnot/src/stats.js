// İşlem kâr/zarar ve istatistik hesapları. Tüm tutarlar kullanıcı para biriminde.

export function tradePnl(t) {
  const dir = t.direction === 'SHORT' ? -1 : 1;
  const gross = (t.exit - t.entry) * t.qty * dir;
  return gross - (t.fee || 0);
}

export function computeStats(trades) {
  const pnls = trades.map(tradePnl);
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const totalPL = pnls.reduce((a, b) => a + b, 0);
  const grossWin = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));

  // Seri: en son işlemden geriye doğru aynı yönde kaç sonuç var
  let streak = 0;
  for (let i = 0; i < pnls.length; i++) {
    const p = pnls[i];
    if (p === 0) break;
    if (streak === 0) streak = p > 0 ? 1 : -1;
    else if (streak > 0 && p > 0) streak++;
    else if (streak < 0 && p < 0) streak--;
    else break;
  }

  return {
    count: trades.length,
    totalPL,
    winRate: pnls.length ? (wins.length / pnls.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    best: pnls.length ? Math.max(...pnls) : 0,
    worst: pnls.length ? Math.min(...pnls) : 0,
    streak,
  };
}

export function monthTradeCount(trades, date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return trades.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

export function formatMoney(value, currency) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const fixed = abs >= 1000 ? abs.toFixed(0) : abs.toFixed(2);
  const withThousands = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${currency}${withThousands}`;
}

export function parseNum(text) {
  if (text === null || text === undefined) return NaN;
  const cleaned = String(text).trim().replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return NaN;
  return Number(cleaned);
}

export function tradesToCsv(trades, currency) {
  const header = 'tarih;sembol;yon;giris;cikis;miktar;komisyon;kar_zarar;strateji;duygu;not';
  const rows = trades.map((t) => {
    const cells = [
      new Date(t.date).toISOString().slice(0, 10),
      t.symbol,
      t.direction,
      t.entry,
      t.exit,
      t.qty,
      t.fee || 0,
      tradePnl(t).toFixed(2),
      t.strategy || '',
      t.emotion || '',
      (t.note || '').replace(/[;\n]/g, ' '),
    ];
    return cells.join(';');
  });
  return [header, ...rows].join('\n') + `\n\npara birimi: ${currency}`;
}
