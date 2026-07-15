import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PrimaryButton } from '../components/ui';
import { t } from '../i18n';
import { colors, spacing, radius } from '../theme';

// Onboarding sonu paywall — sektör verisine göre en yüksek dönüşüm noktası.
// v0.2'de RevenueCat entegre edilecek; şimdilik deneme = premium işaretler.
export default function Paywall({ onSubscribe, onSkip }) {
  const [plan, setPlan] = useState('yearly');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('pwTitle')}</Text>

      <View style={styles.features}>
        {[t('pwF1'), t('pwF2'), t('pwF3')].map((f, i) => (
          <Text key={i} style={styles.feature}>{f}</Text>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.plan, plan === 'yearly' && styles.planSelected]}
        onPress={() => setPlan('yearly')}
        activeOpacity={0.8}
      >
        <View style={styles.badge}><Text style={styles.badgeText}>{t('pwSave')}</Text></View>
        <Text style={styles.planName}>{t('pwYearly')}</Text>
        <Text style={styles.planPrice}>{t('pwYearlyPrice')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.plan, plan === 'monthly' && styles.planSelected]}
        onPress={() => setPlan('monthly')}
        activeOpacity={0.8}
      >
        <Text style={styles.planName}>{t('pwMonthly')}</Text>
        <Text style={styles.planPrice}>{t('pwMonthlyPrice')}</Text>
      </TouchableOpacity>

      <PrimaryButton title={t('pwCta')} onPress={() => onSubscribe(plan)} style={{ marginTop: spacing.l }} />
      <Text style={styles.note}>{t('pwNote')}</Text>

      <TouchableOpacity onPress={onSkip} style={styles.skip}>
        <Text style={styles.skipText}>{t('pwSkip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.l, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.l },
  features: { marginBottom: spacing.xl, alignSelf: 'center' },
  feature: { fontSize: 16, color: colors.text, marginBottom: 10, fontWeight: '600' },
  plan: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  planName: { fontSize: 17, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 17, fontWeight: '700', color: colors.text },
  badge: {
    position: 'absolute',
    top: -12,
    right: 14,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  note: { fontSize: 12, color: colors.textDim, textAlign: 'center', marginTop: spacing.m },
  skip: { marginTop: spacing.l, alignItems: 'center' },
  skipText: { fontSize: 14, color: colors.textDim, textDecorationLine: 'underline' },
});
