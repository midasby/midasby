import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { Card } from '../components/ui';
import { loadRecentDays } from '../storage';
import { sumMeals } from '../calc';
import { t, currentLang } from '../i18n';
import { colors, spacing } from '../theme';

const CHART_H = 150;

function WeekChart({ days, target }) {
  const totals = days.map((d) => sumMeals(d.meals).kcal);
  const maxVal = Math.max(target * 1.25, ...totals, 1);
  const locale = currentLang() === 'tr' ? 'tr-TR' : 'en-US';
  const targetY = CHART_H - (target / maxVal) * CHART_H;

  return (
    <View>
      <View style={styles.chartRow}>
        <Svg width="100%" height={CHART_H} viewBox={`0 0 350 ${CHART_H}`} preserveAspectRatio="none">
          {totals.map((v, i) => {
            const h = Math.max(3, (v / maxVal) * CHART_H);
            const withinTarget = v > 0 && v <= target * 1.05;
            return (
              <Rect
                key={i}
                x={i * 50 + 11}
                y={CHART_H - h}
                width={28}
                height={h}
                rx={6}
                fill={v === 0 ? colors.ringTrack : withinTarget ? colors.primary : colors.accent}
              />
            );
          })}
          <Line x1="0" y1={targetY} x2="350" y2={targetY} stroke={colors.textDim} strokeWidth="1.5" strokeDasharray="6 5" />
        </Svg>
      </View>
      <View style={styles.labels}>
        {days.map((d, i) => (
          <Text key={i} style={styles.dayLabel}>
            {d.date.toLocaleDateString(locale, { weekday: 'short' })}
          </Text>
        ))}
      </View>
      <Text style={styles.targetNote}>- - {t('histTargetLine')}: {target} kcal</Text>
    </View>
  );
}

// todayMeals prop'u yalnızca yenileme tetikleyicisidir: bugün öğün eklenince geçmiş de tazelenir.
export default function History({ profile, todayMeals }) {
  const [days, setDays] = useState(null);

  useEffect(() => {
    loadRecentDays(7).then(setDays);
  }, [todayMeals]);

  if (!days) return <View style={styles.container} />;

  const target = profile.dailyTarget;
  const loggedDays = days.filter((d) => d.meals.length > 0);
  const avg = loggedDays.length
    ? Math.round(loggedDays.reduce((a, d) => a + sumMeals(d.meals).kcal, 0) / loggedDays.length)
    : 0;
  const onTarget = loggedDays.filter((d) => sumMeals(d.meals).kcal <= target * 1.05).length;
  const locale = currentLang() === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.m, paddingBottom: 120 }}>
      <Text style={styles.title}>{t('histTitle')}</Text>

      <Card>
        <Text style={styles.sectionTitle}>{t('histWeek')}</Text>
        <WeekChart days={days} target={target} />
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{avg}</Text>
          <Text style={styles.statLabel}>{t('histAvg')}</Text>
        </Card>
        <Card style={[styles.statCard, { marginRight: 0 }]}>
          <Text style={styles.statValue}>{onTarget}/{loggedDays.length || 0}</Text>
          <Text style={styles.statLabel}>{t('histOnTarget')}</Text>
        </Card>
      </View>

      {[...days].reverse().map((d) => {
        const total = sumMeals(d.meals);
        const within = total.kcal > 0 && total.kcal <= target * 1.05;
        return (
          <Card key={d.key} style={styles.dayRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dayName}>
                {d.date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}
              </Text>
              <Text style={styles.dayMeta}>
                {d.meals.length ? `${d.meals.length} ${t('histMealCount')} · P ${Math.round(total.protein)}g` : t('histNoLog')}
              </Text>
            </View>
            {d.meals.length > 0 ? (
              <View style={styles.dayright}>
                <Text style={[styles.dayKcal, { color: within ? colors.primaryDark : colors.accent }]}>
                  {Math.round(total.kcal)}
                </Text>
                <Text style={styles.dayUnit}>kcal</Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.m },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.m },
  chartRow: { height: CHART_H },
  labels: { flexDirection: 'row', marginTop: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: colors.textDim, fontWeight: '600' },
  targetNote: { fontSize: 11, color: colors.textDim, marginTop: 8, textAlign: 'right' },
  statsRow: { flexDirection: 'row' },
  statCard: { flex: 1, alignItems: 'center', marginRight: spacing.m },
  statValue: { fontSize: 26, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textDim, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  dayName: { fontSize: 15, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  dayMeta: { fontSize: 12, color: colors.textDim, marginTop: 3 },
  dayright: { alignItems: 'flex-end' },
  dayKcal: { fontSize: 18, fontWeight: '900' },
  dayUnit: { fontSize: 10, color: colors.textDim },
});
