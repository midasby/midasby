import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function StatBox({ label, value, tone = 'neutral' }) {
  const valueColor =
    tone === 'good' ? colors.green : tone === 'bad' ? colors.red : tone === 'gold' ? colors.gold : colors.text;
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

export function LabeledInput({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
      />
    </View>
  );
}

export function PrimaryButton({ title, onPress, tone = 'gold', style }) {
  const bg = tone === 'danger' ? colors.red : tone === 'soft' ? colors.cardSoft : colors.gold;
  const fg = tone === 'soft' ? colors.text : '#141414';
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: bg }, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.s,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.s,
    padding: spacing.m,
    marginHorizontal: spacing.xs,
  },
  statLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  inputWrap: { marginBottom: spacing.m },
  inputLabel: { color: colors.textDim, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.s,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    borderRadius: radius.s,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#141414' },
});
