import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Card, Chip, LabeledInput, PrimaryButton } from '../components/ui';
import { dailyTarget, parseNum } from '../calc';
import { t } from '../i18n';
import { colors, spacing } from '../theme';

export default function Settings({ profile, onUpdateProfile, onReset }) {
  const [goal, setGoal] = useState(profile.goal);
  const [weight, setWeight] = useState(String(profile.weight));

  const update = () => {
    const w = parseNum(weight);
    if (isNaN(w) || w < 30 || w > 300) {
      Alert.alert('', t('obInvalid'));
      return;
    }
    const next = { ...profile, goal, weight: w };
    next.dailyTarget = dailyTarget(next);
    onUpdateProfile(next);
    Alert.alert('', t('updated'));
  };

  const confirmReset = () => {
    Alert.alert('', t('setResetConfirm'), [
      { text: t('setCancel'), style: 'cancel' },
      { text: t('setDelete'), style: 'destructive', onPress: onReset },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.m, paddingBottom: 120 }}>
      <Text style={styles.title}>{t('setTitle')}</Text>

      <Card>
        <Text style={styles.sectionTitle}>{t('setPremium')}</Text>
        <Text style={styles.premiumStatus}>{profile.premium ? t('setPremiumOn') : t('setPremiumOff')}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('setPlan')} · {profile.dailyTarget} kcal</Text>
        <Text style={styles.label}>{t('setGoal')}</Text>
        <View style={styles.chipRow}>
          <Chip label={t('obLose')} selected={goal === 'lose'} onPress={() => setGoal('lose')} />
          <Chip label={t('obMaintain')} selected={goal === 'maintain'} onPress={() => setGoal('maintain')} />
          <Chip label={t('obGain')} selected={goal === 'gain'} onPress={() => setGoal('gain')} />
        </View>
        <LabeledInput label={t('setWeight')} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
        <PrimaryButton title={t('setRecalc')} tone="soft" onPress={update} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('setData')}</Text>
        <PrimaryButton title={t('setReset')} tone="danger" onPress={confirmReset} />
        <Text style={styles.privacy}>{t('setPrivacy')}</Text>
      </Card>

      <Text style={styles.disclaimer}>{t('setDisclaimer')}</Text>
      <Text style={styles.version}>CalLens v0.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.m },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.s },
  premiumStatus: { fontSize: 14, color: colors.textDim },
  label: { fontSize: 13, color: colors.textDim, fontWeight: '600', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.s },
  privacy: { fontSize: 12, color: colors.textDim, textAlign: 'center', marginTop: spacing.m, lineHeight: 17 },
  disclaimer: { fontSize: 11, color: colors.textDim, textAlign: 'center', lineHeight: 16, marginTop: spacing.s },
  version: { fontSize: 11, color: colors.textDim, textAlign: 'center', marginTop: spacing.m },
});
