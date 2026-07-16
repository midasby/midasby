import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, PrimaryButton, LabeledInput } from '../components/ui';
import BarcodeScan from '../components/BarcodeScan';
import { analyzeFoodPhoto, aiAvailable } from '../ai';
import { scalePer100 } from '../food';
import { parseNum } from '../calc';
import { t } from '../i18n';
import { colors, spacing, radius } from '../theme';

// Öğün ekleme akışı: fotoğraf çek/seç → AI analizi → düzenlenebilir sonuç → kaydet.
// mode: 'photo' (varsayılan) | 'manual'
export default function AddMeal({ visible, mode, onClose, onSave, canUseAi }) {
  const [phase, setPhase] = useState('pick'); // pick | scan | analyzing | edit
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [meta, setMeta] = useState(null); // {portion, confidence, demo}
  const [product100, setProduct100] = useState(null); // barkod ürünü: 100g başına değerler
  const [grams, setGrams] = useState('100');

  const reset = () => {
    setPhase('pick');
    setName('');
    setKcal('');
    setProtein('');
    setCarbs('');
    setFat('');
    setMeta(null);
    setProduct100(null);
    setGrams('100');
  };

  const applyScaled = (per100, g) => {
    const scaled = scalePer100(per100, g);
    setKcal(String(scaled.kcal));
    setProtein(String(scaled.protein));
    setCarbs(String(scaled.carbs));
    setFat(String(scaled.fat));
  };

  const handleBarcodeFound = (product) => {
    setName(product.name);
    setProduct100(product.per100);
    setGrams('100');
    applyScaled(product.per100, 100);
    setMeta(null);
    setPhase('edit');
  };

  const handleGramsChange = (text) => {
    setGrams(text);
    const g = parseNum(text);
    if (product100 && g > 0 && g <= 5000) applyScaled(product100, g);
  };

  const close = () => {
    reset();
    onClose();
  };

  const pickImage = async (fromCamera) => {
    if (!canUseAi()) {
      Alert.alert('', t('amLimit'));
      return;
    }
    try {
      const options = { quality: 0.5, base64: true, allowsEditing: false };
      const result = fromCamera
        ? await (async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) return { canceled: true };
            return ImagePicker.launchCameraAsync(options);
          })()
        : await ImagePicker.launchImageLibraryAsync({ ...options, mediaTypes: ['images'] });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setPhase('analyzing');
      const asset = result.assets[0];
      const mediaType = asset.mimeType && asset.mimeType.startsWith('image/') ? asset.mimeType : 'image/jpeg';
      const food = await analyzeFoodPhoto({ base64: asset.base64, mediaType });

      setName(food.name);
      setKcal(String(food.kcal));
      setProtein(String(food.protein));
      setCarbs(String(food.carbs));
      setFat(String(food.fat));
      setMeta({ portion: food.portion, confidence: food.confidence, demo: food.demo });
      setPhase('edit');
    } catch (e) {
      setPhase('pick');
      Alert.alert('', e.code === 'no_food' ? t('amNoFood') : t('amError'));
    }
  };

  const save = () => {
    const k = parseNum(kcal);
    if (!name.trim() || isNaN(k) || k <= 0) {
      Alert.alert('', t('amInvalid'));
      return;
    }
    const now = new Date();
    onSave({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      name: name.trim(),
      kcal: Math.round(k),
      protein: Math.round(parseNum(protein) || 0),
      carbs: Math.round(parseNum(carbs) || 0),
      fat: Math.round(parseNum(fat) || 0),
      usedAi: !!meta,
      demo: !!meta?.demo,
    });
    reset();
  };

  const showPick = phase === 'pick' && mode !== 'manual';
  const showManual = phase === 'edit' || mode === 'manual';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('amTitle')}</Text>
            <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
            {showPick && (
              <View>
                <PrimaryButton title={t('amCamera')} onPress={() => pickImage(true)} style={{ marginBottom: spacing.m }} />
                <PrimaryButton title={t('amGallery')} tone="soft" onPress={() => pickImage(false)} style={{ marginBottom: spacing.m }} />
                <PrimaryButton title={t('amBarcode')} tone="soft" onPress={() => setPhase('scan')} />
                {!aiAvailable ? <Text style={styles.demoNote}>{t('amDemoNote')}</Text> : null}
              </View>
            )}

            {phase === 'scan' && (
              <BarcodeScan
                onFound={handleBarcodeFound}
                onNotFound={() => Alert.alert('', t('bcNotFound'))}
              />
            )}

            {phase === 'analyzing' && (
              <View style={styles.analyzing}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.analyzingText}>{t('amAnalyzing')}</Text>
              </View>
            )}

            {showManual && phase !== 'analyzing' && (
              <View>
                {meta ? (
                  <Card style={styles.aiCard}>
                    <Text style={styles.aiTitle}>
                      ✨ {t('amResult')} {meta.demo ? <Text style={styles.demoBadge}> {t('amDemo')} </Text> : null}
                    </Text>
                    <Text style={styles.aiMeta}>
                      {meta.portion} · %{Math.round((meta.confidence || 0) * 100)} {t('amConfidence')}
                    </Text>
                  </Card>
                ) : product100 ? (
                  <Card style={styles.aiCard}>
                    <Text style={styles.aiTitle}>🔍 {name}</Text>
                    <Text style={styles.aiMeta}>
                      {product100.kcal} kcal / 100g
                    </Text>
                  </Card>
                ) : (
                  <Text style={styles.manualTitle}>{t('amManualTitle')}</Text>
                )}
                {product100 ? (
                  <LabeledInput
                    label={t('bcGrams')}
                    value={grams}
                    onChangeText={handleGramsChange}
                    placeholder="100"
                    keyboardType="number-pad"
                  />
                ) : null}
                <LabeledInput label={t('amName')} value={name} onChangeText={setName} placeholder="…" />
                <LabeledInput label={t('amKcal')} value={kcal} onChangeText={setKcal} placeholder="0" keyboardType="number-pad" />
                <View style={styles.row}>
                  <View style={styles.col}>
                    <LabeledInput label={t('amProtein')} value={protein} onChangeText={setProtein} placeholder="0" keyboardType="number-pad" />
                  </View>
                  <View style={styles.col}>
                    <LabeledInput label={t('amCarbs')} value={carbs} onChangeText={setCarbs} placeholder="0" keyboardType="number-pad" />
                  </View>
                  <View style={[styles.col, { marginRight: 0 }]}>
                    <LabeledInput label={t('amFat')} value={fat} onChangeText={setFat} placeholder="0" keyboardType="number-pad" />
                  </View>
                </View>
                <PrimaryButton title={t('amSave')} onPress={save} />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    padding: spacing.l,
    maxHeight: '92%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  title: { fontSize: 22, fontWeight: '900', color: colors.text },
  close: { fontSize: 20, color: colors.textDim },
  demoNote: { fontSize: 12, color: colors.accent, textAlign: 'center', marginTop: spacing.m, fontWeight: '600' },
  analyzing: { alignItems: 'center', paddingVertical: 60 },
  analyzingText: { marginTop: spacing.m, color: colors.textDim, fontSize: 15, fontWeight: '600' },
  aiCard: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  aiTitle: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  demoBadge: { fontSize: 11, color: colors.accent, fontWeight: '900' },
  aiMeta: { fontSize: 13, color: colors.primaryDark, marginTop: 4 },
  manualTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.m },
  row: { flexDirection: 'row' },
  col: { flex: 1, marginRight: 8 },
});
