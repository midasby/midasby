import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Card, PrimaryButton, ProgressRing, MacroBar } from '../components/ui';
import { dailyTarget, macroTargets, sumMeals } from '../calc';
import { t } from '../i18n';
import { colors, spacing, radius } from '../theme';

export default function Home({ profile, meals, onSnap, onManual, onDeleteMeal }) {
  const target = profile.dailyTarget || dailyTarget(profile);
  const totals = sumMeals(meals);
  const remaining = target - totals.kcal;
  const over = remaining < 0;
  const macros = macroTargets(target);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.m, paddingBottom: 130 }}>
      <Text style={styles.title}>{t('homeToday')}</Text>

      <Card style={styles.ringCard}>
        <ProgressRing progress={totals.kcal / target} over={over}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.remaining, over && { color: colors.danger }]}>{Math.abs(Math.round(remaining))}</Text>
            <Text style={styles.remainingLabel}>{over ? t('homeOver') : `kcal ${t('homeRemaining')}`}</Text>
          </View>
        </ProgressRing>
        <View style={styles.ringMeta}>
          <Text style={styles.ringMetaText}>
            {Math.round(totals.kcal)} {t('homeEaten')} · {target} {t('homeTarget')}
          </Text>
        </View>
        <View style={styles.macroRow}>
          <MacroBar label={t('homeProtein')} value={totals.protein} target={macros.protein} color={colors.protein} />
          <MacroBar label={t('homeCarbs')} value={totals.carbs} target={macros.carbs} color={colors.carbs} />
          <MacroBar label={t('homeFat')} value={totals.fat} target={macros.fat} color={colors.fat} />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>{t('homeMeals')}</Text>
      {meals.length === 0 ? (
        <Card>
          <Text style={styles.empty}>{t('homeEmpty')}</Text>
        </Card>
      ) : (
        meals.map((m) => (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.7}
            onLongPress={() =>
              Alert.alert(m.name, '', [
                { text: t('setCancel'), style: 'cancel' },
                { text: t('setDelete'), style: 'destructive', onPress: () => onDeleteMeal(m.id) },
              ])
            }
          >
            <Card style={styles.mealRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>
                  {m.name} {m.demo ? <Text style={styles.demoTag}>{t('amDemo')}</Text> : null}
                </Text>
                <Text style={styles.mealMeta}>
                  {m.time} · P {m.protein}g · C {m.carbs}g · F {m.fat}g
                </Text>
              </View>
              <Text style={styles.mealKcal}>{m.kcal}</Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <PrimaryButton title={t('homeSnap')} onPress={onSnap} style={{ marginTop: spacing.m }} />
      <TouchableOpacity onPress={onManual} style={styles.manualLink}>
        <Text style={styles.manualText}>{t('homeManual')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.m },
  ringCard: { alignItems: 'center', paddingVertical: spacing.l },
  remaining: { fontSize: 44, fontWeight: '900', color: colors.text },
  remainingLabel: { fontSize: 13, color: colors.textDim, fontWeight: '600' },
  ringMeta: { marginTop: spacing.m },
  ringMetaText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  macroRow: { flexDirection: 'row', marginTop: spacing.l, alignSelf: 'stretch' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.s, marginTop: spacing.s },
  empty: { color: colors.textDim, textAlign: 'center', lineHeight: 22, paddingVertical: spacing.m },
  mealRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  mealName: { fontSize: 15, fontWeight: '700', color: colors.text },
  demoTag: { fontSize: 10, color: colors.accent, fontWeight: '900' },
  mealMeta: { fontSize: 12, color: colors.textDim, marginTop: 3 },
  mealKcal: { fontSize: 18, fontWeight: '900', color: colors.primaryDark, marginLeft: spacing.m },
  manualLink: { alignItems: 'center', marginTop: spacing.m },
  manualText: { color: colors.textDim, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
