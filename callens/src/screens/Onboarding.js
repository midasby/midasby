import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Chip, LabeledInput, PrimaryButton } from '../components/ui';
import { dailyTarget, parseNum, ACTIVITY_LEVELS } from '../calc';
import { t } from '../i18n';
import { colors, spacing } from '../theme';

// Kanıtlanmış dönüşüm hunisi: kısa anket → kişiselleştirilmiş plan → paywall.
export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState(null);

  const totalSteps = 5;

  const buildProfile = () => ({
    goal,
    gender,
    age: parseNum(age),
    height: parseNum(height),
    weight: parseNum(weight),
    activity,
  });

  const bodyValid = () => {
    const a = parseNum(age);
    const h = parseNum(height);
    const w = parseNum(weight);
    return a >= 10 && a <= 100 && h >= 100 && h <= 250 && w >= 30 && w <= 300;
  };

  const next = () => setStep((s) => s + 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {step > 0 && step < totalSteps ? (
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
          ))}
        </View>
      ) : null}

      {step === 0 && (
        <View style={styles.center}>
          <Text style={styles.logo}>
            Cal<Text style={{ color: colors.primary }}>Lens</Text> 🍽️
          </Text>
          <Text style={styles.welcomeTitle}>{t('obWelcomeTitle')}</Text>
          <Text style={styles.welcomeSub}>{t('obWelcomeSub')}</Text>
          <PrimaryButton title={t('obStart')} onPress={next} style={{ alignSelf: 'stretch', marginTop: spacing.xl }} />
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.question}>{t('obGoal')}</Text>
          <Chip big label={t('obLose')} selected={goal === 'lose'} onPress={() => setGoal('lose')} />
          <Chip big label={t('obMaintain')} selected={goal === 'maintain'} onPress={() => setGoal('maintain')} />
          <Chip big label={t('obGain')} selected={goal === 'gain'} onPress={() => setGoal('gain')} />
          {goal ? <PrimaryButton title={t('obNext')} onPress={next} style={{ marginTop: spacing.l }} /> : null}
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.question}>{t('obGender')}</Text>
          <Text style={styles.hint}>{t('obGenderWhy')}</Text>
          <Chip big label={t('obMale')} selected={gender === 'male'} onPress={() => setGender('male')} />
          <Chip big label={t('obFemale')} selected={gender === 'female'} onPress={() => setGender('female')} />
          {gender ? <PrimaryButton title={t('obNext')} onPress={next} style={{ marginTop: spacing.l }} /> : null}
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.question}>{t('obBody')}</Text>
          <LabeledInput label={t('obAge')} value={age} onChangeText={setAge} placeholder="25" keyboardType="number-pad" />
          <LabeledInput label={t('obHeight')} value={height} onChangeText={setHeight} placeholder="175" keyboardType="number-pad" />
          <LabeledInput label={t('obWeight')} value={weight} onChangeText={setWeight} placeholder="75" keyboardType="decimal-pad" />
          <PrimaryButton
            title={t('obNext')}
            onPress={() => (bodyValid() ? next() : Alert.alert('', t('obInvalid')))}
          />
        </View>
      )}

      {step === 4 && (
        <View>
          <Text style={styles.question}>{t('obActivity')}</Text>
          {[t('obAct1'), t('obAct2'), t('obAct3'), t('obAct4')].map((label, i) => (
            <Chip
              key={i}
              big
              label={label}
              selected={activity === ACTIVITY_LEVELS[i]}
              onPress={() => setActivity(ACTIVITY_LEVELS[i])}
            />
          ))}
          {activity ? <PrimaryButton title={t('obNext')} onPress={next} style={{ marginTop: spacing.l }} /> : null}
        </View>
      )}

      {step === 5 && (
        <View style={styles.center}>
          <Text style={styles.resultEmoji}>🎯</Text>
          <Text style={styles.resultTitle}>{t('obResultTitle')}</Text>
          <Text style={styles.resultSub}>{t('obResultSub')}</Text>
          <Text style={styles.resultKcal}>{dailyTarget(buildProfile())}</Text>
          <Text style={styles.resultUnit}>{t('obKcalDay')}</Text>
          <PrimaryButton
            title={t('obFinish')}
            onPress={() => onComplete(buildProfile())}
            style={{ alignSelf: 'stretch', marginTop: spacing.xl }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.l, paddingTop: 70, flexGrow: 1, justifyContent: 'center' },
  progress: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.xl },
  progressDot: { width: 34, height: 5, borderRadius: 3, backgroundColor: colors.ringTrack, marginHorizontal: 3 },
  progressDotActive: { backgroundColor: colors.primary },
  center: { alignItems: 'center' },
  logo: { fontSize: 34, fontWeight: '900', color: colors.text, marginBottom: spacing.xl },
  welcomeTitle: { fontSize: 30, fontWeight: '900', color: colors.text, textAlign: 'center', lineHeight: 38 },
  welcomeSub: { fontSize: 15, color: colors.textDim, textAlign: 'center', marginTop: spacing.m, lineHeight: 22 },
  question: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.l },
  hint: { fontSize: 13, color: colors.textDim, marginTop: -spacing.m, marginBottom: spacing.m },
  resultEmoji: { fontSize: 52, marginBottom: spacing.m },
  resultTitle: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center' },
  resultSub: { fontSize: 15, color: colors.textDim, marginTop: spacing.l },
  resultKcal: { fontSize: 64, fontWeight: '900', color: colors.primary },
  resultUnit: { fontSize: 15, color: colors.textDim, fontWeight: '600' },
});
