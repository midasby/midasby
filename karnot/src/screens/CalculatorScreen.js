import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card, SectionTitle, LabeledInput, StatBox } from '../components/ui';
import { parseNum, formatMoney } from '../stats';
import { colors, spacing } from '../theme';

export default function CalculatorScreen({ settings }) {
  const [account, setAccount] = useState('');
  const [riskPct, setRiskPct] = useState('1');
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');

  const a = parseNum(account);
  const r = parseNum(riskPct);
  const e = parseNum(entry);
  const s = parseNum(stop);
  const c = settings.currency;

  const valid = !isNaN(a) && a > 0 && !isNaN(r) && r > 0 && !isNaN(e) && e > 0 && !isNaN(s) && s > 0 && e !== s;

  let riskAmount = 0;
  let perUnit = 0;
  let size = 0;
  let positionValue = 0;
  let targets = [];
  let isLong = true;

  if (valid) {
    riskAmount = (a * r) / 100;
    perUnit = Math.abs(e - s);
    size = riskAmount / perUnit;
    positionValue = size * e;
    isLong = s < e;
    targets = [1, 2, 3].map((n) => (isLong ? e + n * perUnit : e - n * perUnit));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}>
      <Text style={styles.title}>Risk Hesaplayıcı</Text>
      <Text style={styles.subtitle}>Pozisyon büyüklüğünü riskine göre hesapla — hesabını tek işlemde yakma. 🛡️</Text>

      <Card>
        <LabeledInput label={`Hesap büyüklüğü (${c})`} value={account} onChangeText={setAccount} placeholder="100000" keyboardType="decimal-pad" />
        <LabeledInput label="İşlem başına risk (%)" value={riskPct} onChangeText={setRiskPct} placeholder="1" keyboardType="decimal-pad" />
        <View style={styles.twoCol}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <LabeledInput label="Giriş fiyatı" value={entry} onChangeText={setEntry} placeholder="0.00" keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <LabeledInput label="Stop fiyatı" value={stop} onChangeText={setStop} placeholder="0.00" keyboardType="decimal-pad" />
          </View>
        </View>
      </Card>

      {valid ? (
        <>
          <Card>
            <SectionTitle>Sonuç · {isLong ? 'LONG ▲' : 'SHORT ▼'}</SectionTitle>
            <View style={styles.statRow}>
              <StatBox label="Riske edilen" value={formatMoney(riskAmount, c)} tone="gold" />
              <StatBox label="Pozisyon (adet)" value={size >= 100 ? size.toFixed(0) : size.toFixed(2)} />
            </View>
            <View style={styles.statRow}>
              <StatBox label="Pozisyon tutarı" value={formatMoney(positionValue, c)} />
              <StatBox label="Birim risk" value={perUnit.toFixed(4)} />
            </View>
          </Card>

          <Card>
            <SectionTitle>Hedefler (R katları)</SectionTitle>
            {targets.map((t, i) => (
              <View key={i} style={styles.targetRow}>
                <Text style={styles.targetLabel}>{i + 1}R hedef</Text>
                <Text style={styles.targetPrice}>{t.toFixed(4)}</Text>
                <Text style={[styles.targetGain, { color: colors.green }]}>+{formatMoney(riskAmount * (i + 1), c)}</Text>
              </View>
            ))}
            <Text style={styles.hint}>
              1R = stop mesafen. 2R hedefle %40 kazanma oranı bile hesabı büyütür.
            </Text>
          </Card>
        </>
      ) : (
        <Card>
          <Text style={styles.placeholder}>Değerleri doldurunca pozisyon büyüklüğü ve 1R/2R/3R hedefleri burada görünecek.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textDim, fontSize: 13, marginTop: 4, marginBottom: spacing.m, lineHeight: 18 },
  twoCol: { flexDirection: 'row' },
  statRow: { flexDirection: 'row', marginHorizontal: -spacing.xs, marginBottom: spacing.s },
  targetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  targetLabel: { color: colors.textDim, width: 80, fontSize: 14 },
  targetPrice: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '700' },
  targetGain: { fontSize: 14, fontWeight: '700' },
  hint: { color: colors.textDim, fontSize: 12, marginTop: 10, lineHeight: 17 },
  placeholder: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
});
