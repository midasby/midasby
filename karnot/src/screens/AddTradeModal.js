import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LabeledInput, PrimaryButton, Chip, SectionTitle } from '../components/ui';
import { parseNum } from '../stats';
import { colors, spacing, radius } from '../theme';

const STRATEGIES = ['Harmonik', 'PIE', 'Destek/Direnç', 'Trend', 'Haber', 'Diğer'];
const EMOTIONS = [
  { key: '😎', label: '😎 Disiplinli' },
  { key: '🧘', label: '🧘 Sakin' },
  { key: '😰', label: '😰 FOMO' },
  { key: '😤', label: '😤 İntikam' },
  { key: '🎲', label: '🎲 Şans' },
];

export default function AddTradeModal({ visible, onClose, onSave }) {
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState('LONG');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [qty, setQty] = useState('');
  const [fee, setFee] = useState('');
  const [strategy, setStrategy] = useState('');
  const [emotion, setEmotion] = useState('');
  const [note, setNote] = useState('');

  const reset = () => {
    setSymbol('');
    setDirection('LONG');
    setEntry('');
    setExit('');
    setQty('');
    setFee('');
    setStrategy('');
    setEmotion('');
    setNote('');
  };

  const handleSave = () => {
    const e = parseNum(entry);
    const x = parseNum(exit);
    const q = parseNum(qty);
    const f = fee.trim() === '' ? 0 : parseNum(fee);

    if (!symbol.trim()) return Alert.alert('Eksik bilgi', 'Sembol girmelisin (örn. THYAO, BTCUSDT).');
    if (isNaN(e) || e <= 0) return Alert.alert('Eksik bilgi', 'Geçerli bir giriş fiyatı gir.');
    if (isNaN(x) || x <= 0) return Alert.alert('Eksik bilgi', 'Geçerli bir çıkış fiyatı gir.');
    if (isNaN(q) || q <= 0) return Alert.alert('Eksik bilgi', 'Geçerli bir miktar gir.');
    if (isNaN(f) || f < 0) return Alert.alert('Eksik bilgi', 'Komisyon geçersiz.');

    onSave({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      symbol: symbol.trim().toUpperCase(),
      direction,
      entry: e,
      exit: x,
      qty: q,
      fee: f,
      strategy,
      emotion,
      note: note.trim(),
    });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Yeni İşlem</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
            <LabeledInput
              label="Sembol"
              value={symbol}
              onChangeText={setSymbol}
              placeholder="THYAO, BTCUSDT, XAUUSD…"
              autoCapitalize="characters"
            />

            <SectionTitle>Yön</SectionTitle>
            <View style={styles.dirRow}>
              <TouchableOpacity
                style={[styles.dirButton, direction === 'LONG' && { backgroundColor: '#123524', borderColor: colors.green }]}
                onPress={() => setDirection('LONG')}
              >
                <Text style={[styles.dirText, direction === 'LONG' && { color: colors.green }]}>▲ LONG</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dirButton, direction === 'SHORT' && { backgroundColor: '#3A1A1A', borderColor: colors.red }]}
                onPress={() => setDirection('SHORT')}
              >
                <Text style={[styles.dirText, direction === 'SHORT' && { color: colors.red }]}>▼ SHORT</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <LabeledInput label="Giriş fiyatı" value={entry} onChangeText={setEntry} placeholder="0.00" keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput label="Çıkış fiyatı" value={exit} onChangeText={setExit} placeholder="0.00" keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <LabeledInput label="Miktar (adet/lot)" value={qty} onChangeText={setQty} placeholder="0" keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput label="Komisyon (ops.)" value={fee} onChangeText={setFee} placeholder="0" keyboardType="decimal-pad" />
              </View>
            </View>

            <SectionTitle>Strateji</SectionTitle>
            <View style={styles.chipWrap}>
              {STRATEGIES.map((s) => (
                <Chip key={s} label={s} selected={strategy === s} onPress={() => setStrategy(strategy === s ? '' : s)} />
              ))}
            </View>

            <SectionTitle>O anki ruh halin</SectionTitle>
            <View style={styles.chipWrap}>
              {EMOTIONS.map((e) => (
                <Chip
                  key={e.key}
                  label={e.label}
                  selected={emotion === e.key}
                  onPress={() => setEmotion(emotion === e.key ? '' : e.key)}
                />
              ))}
            </View>

            <LabeledInput label="Not (ops.)" value={note} onChangeText={setNote} placeholder="Neden girdin, ne öğrendin?" />

            <PrimaryButton title="Kaydet" onPress={handleSave} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    maxHeight: '92%',
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
  sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  close: { color: colors.textDim, fontSize: 20 },
  dirRow: { flexDirection: 'row', marginBottom: spacing.m },
  dirButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.s,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  dirText: { color: colors.textDim, fontWeight: '700', fontSize: 15 },
  twoCol: { flexDirection: 'row' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.s },
});
