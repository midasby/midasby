import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, SectionTitle, StatBox } from '../components/ui';
import { computeStats, tradePnl, formatMoney } from '../stats';
import { colors, spacing } from '../theme';

function PnlBars({ trades, currency }) {
  const recent = trades.slice(0, 12).reverse();
  if (recent.length === 0) {
    return <Text style={styles.empty}>Henüz işlem yok. İlk işlemini ekle, grafiğin burada oluşsun. 📈</Text>;
  }
  const pnls = recent.map(tradePnl);
  const maxAbs = Math.max(...pnls.map(Math.abs), 1);
  return (
    <View>
      <View style={styles.barsRow}>
        {pnls.map((p, i) => {
          const h = Math.max(6, (Math.abs(p) / maxAbs) * 70);
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barHalf}>
                {p >= 0 && <View style={[styles.bar, { height: h, backgroundColor: colors.green }]} />}
              </View>
              <View style={styles.axis} />
              <View style={[styles.barHalf, { justifyContent: 'flex-start' }]}>
                {p < 0 && <View style={[styles.bar, { height: h, backgroundColor: colors.red }]} />}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.barsCaption}>Son {recent.length} işlem · en büyük: {formatMoney(maxAbs, currency)}</Text>
    </View>
  );
}

export default function DashboardScreen({ trades, settings }) {
  const s = computeStats(trades);
  const c = settings.currency;
  const pfText = s.profitFactor === Infinity ? '∞' : s.profitFactor.toFixed(2);
  const streakText =
    s.streak > 0 ? `🔥 ${s.streak} kazanç` : s.streak < 0 ? `❄️ ${-s.streak} kayıp` : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}>
      <Text style={styles.hello}>Panel</Text>

      <Card>
        <SectionTitle>Toplam Kâr / Zarar</SectionTitle>
        <Text style={[styles.totalPl, { color: s.totalPL >= 0 ? colors.green : colors.red }]}>
          {formatMoney(s.totalPL, c)}
        </Text>
        <Text style={styles.subInfo}>
          {s.count} işlem · seri: {streakText}
        </Text>
      </Card>

      <View style={styles.statRow}>
        <StatBox label="Kazanma Oranı" value={`%${s.winRate.toFixed(0)}`} tone={s.winRate >= 50 ? 'good' : 'bad'} />
        <StatBox label="Profit Factor" value={pfText} tone={s.profitFactor >= 1 ? 'good' : 'bad'} />
      </View>
      <View style={[styles.statRow, { marginBottom: spacing.m }]}>
        <StatBox label="Ort. Kazanç" value={formatMoney(s.avgWin, c)} tone="good" />
        <StatBox label="Ort. Kayıp" value={formatMoney(-s.avgLoss, c)} tone="bad" />
      </View>

      <Card>
        <SectionTitle>İşlem Grafiği</SectionTitle>
        <PnlBars trades={trades} currency={c} />
      </Card>

      <View style={styles.statRow}>
        <StatBox label="En İyi İşlem" value={formatMoney(s.best, c)} tone="gold" />
        <StatBox label="En Kötü İşlem" value={formatMoney(s.worst, c)} tone="bad" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hello: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.m },
  totalPl: { fontSize: 36, fontWeight: '800' },
  subInfo: { color: colors.textDim, marginTop: 6, fontSize: 13 },
  statRow: { flexDirection: 'row', marginHorizontal: -spacing.xs, marginBottom: spacing.s },
  empty: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  barsRow: { flexDirection: 'row', alignItems: 'stretch', height: 150 },
  barCol: { flex: 1, marginHorizontal: 2 },
  barHalf: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 3, width: '100%' },
  axis: { height: 1, backgroundColor: colors.border },
  barsCaption: { color: colors.textDim, fontSize: 12, marginTop: 8, textAlign: 'center' },
});
