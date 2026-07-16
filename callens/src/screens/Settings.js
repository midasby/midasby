import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Switch, StyleSheet } from 'react-native';
import { Card, Chip, LabeledInput, PrimaryButton } from '../components/ui';
import { dailyTarget, parseNum } from '../calc';
import { restore, purchasesSupported } from '../purchases';
import { enableReminder, disableReminder, notificationsSupported } from '../notifications';
import { logWeight } from '../storage';
import { colors as themeColors } from '../theme';
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
    logWeight(w); // kilo grafiğine de işle
    Alert.alert('', t('updated'));
  };

  const toggleReminder = async (value) => {
    if (value) {
      const ok = await enableReminder();
      if (!ok) {
        Alert.alert('', t('notifDenied'));
        return;
      }
    } else {
      await disableReminder();
    }
    onUpdateProfile({ ...profile, reminder: value });
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
        {!profile.premium && purchasesSupported ? (
          <PrimaryButton
            title={t('setRestore')}
            tone="soft"
            style={{ marginTop: spacing.m }}
            onPress={async () => {
              const ok = await restore();
              if (ok) onUpdateProfile({ ...profile, premium: true });
              Alert.alert('', ok ? t('restoreOk') : t('restoreFail'));
            }}
          />
        ) : null}
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

      {notificationsSupported ? (
        <Card>
          <View style={styles.notifRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.sectionTitle}>🔔 {t('notifRow')}</Text>
              <Text style={styles.notifDesc}>{t('notifDesc')}</Text>
            </View>
            <Switch
              value={!!profile.reminder}
              onValueChange={toggleReminder}
              trackColor={{ true: themeColors.primary, false: themeColors.ringTrack }}
            />
          </View>
        </Card>
      ) : null}

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
  notifRow: { flexDirection: 'row', alignItems: 'center' },
  notifDesc: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  label: { fontSize: 13, color: colors.textDim, fontWeight: '600', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.s },
  privacy: { fontSize: 12, color: colors.textDim, textAlign: 'center', marginTop: spacing.m, lineHeight: 17 },
  disclaimer: { fontSize: 11, color: colors.textDim, textAlign: 'center', lineHeight: 16, marginTop: spacing.s },
  version: { fontSize: 11, color: colors.textDim, textAlign: 'center', marginTop: spacing.m },
});
