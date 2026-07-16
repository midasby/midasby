import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, radius } from '../theme';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ title, onPress, tone = 'primary', style, testID }) {
  const bg = tone === 'danger' ? colors.danger : tone === 'soft' ? colors.primarySoft : colors.primary;
  const fg = tone === 'soft' ? colors.primaryDark : '#FFFFFF';
  return (
    <TouchableOpacity testID={testID} style={[styles.button, { backgroundColor: bg }, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, selected, onPress, big = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, big && styles.chipBig, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, big && styles.chipTextBig, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function LabeledInput({ label, value, onChangeText, placeholder, keyboardType }) {
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
      />
    </View>
  );
}

// Kalori halkası: hedefe göre ilerleme (SVG)
export function ProgressRing({ size = 190, stroke = 14, progress = 0, over = false, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.ringTrack} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? colors.danger : colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - clamped)}
        />
      </Svg>
      {children}
    </View>
  );
}

export function MacroBar({ label, value, target, color }) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  return (
    <View style={styles.macroWrap}>
      <View style={styles.macroHead}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {Math.round(value)}<Text style={styles.macroTarget}>/{target}g</Text>
        </Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
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
  button: { borderRadius: radius.s + 4, paddingVertical: 16, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.s,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipBig: { width: '100%', paddingVertical: 18, marginRight: 0 },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { color: colors.textDim, fontSize: 14, fontWeight: '600' },
  chipTextBig: { fontSize: 17 },
  chipTextSelected: { color: colors.primaryDark },
  inputWrap: { marginBottom: spacing.m },
  inputLabel: { color: colors.textDim, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.s,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    fontSize: 16,
  },
  macroWrap: { flex: 1, marginHorizontal: 4 },
  macroHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroLabel: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  macroValue: { color: colors.text, fontSize: 12, fontWeight: '800' },
  macroTarget: { color: colors.textDim, fontWeight: '600' },
  macroTrack: { height: 8, borderRadius: 4, backgroundColor: colors.ringTrack, overflow: 'hidden' },
  macroFill: { height: 8, borderRadius: 4 },
});
