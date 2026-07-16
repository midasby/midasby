import React, { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { PrimaryButton, LabeledInput } from './ui';
import { lookupBarcode } from '../food';
import { t } from '../i18n';
import { colors, spacing, radius } from '../theme';

// Kamera yalnızca native'de; web/izin yokken elle giriş her zaman mevcut.
let CameraView = null;
let useCameraPermissions = () => [null, async () => {}];
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line global-require
    const cam = require('expo-camera');
    CameraView = cam.CameraView;
    useCameraPermissions = cam.useCameraPermissions;
  } catch (e) {
    CameraView = null;
  }
}

export default function BarcodeScan({ onFound, onNotFound }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const scannedRef = useRef(false); // aynı barkodun art arda taranmasını engelle

  const lookup = async (code) => {
    if (busy) return;
    setBusy(true);
    try {
      const product = await lookupBarcode(code);
      if (product) onFound(product);
      else {
        scannedRef.current = false;
        onNotFound();
      }
    } catch (e) {
      scannedRef.current = false;
      onNotFound();
    } finally {
      setBusy(false);
    }
  };

  const handleScan = ({ data }) => {
    if (scannedRef.current || busy) return;
    scannedRef.current = true;
    lookup(data);
  };

  const cameraReady = CameraView && permission?.granted;

  return (
    <View>
      {CameraView && !permission?.granted ? (
        <PrimaryButton title={t('bcAllowCamera')} tone="soft" onPress={requestPermission} style={{ marginBottom: spacing.m }} />
      ) : null}

      {cameraReady ? (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
            onBarcodeScanned={handleScan}
          />
          <View style={styles.scanLine} />
        </View>
      ) : (
        <Text style={styles.noCamera}>{t('bcNoCamera')}</Text>
      )}

      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.busyText}>{t('bcLooking')}</Text>
        </View>
      ) : (
        <View>
          <LabeledInput
            label={t('bcManual')}
            value={manual}
            onChangeText={setManual}
            placeholder="8690504065555"
            keyboardType="number-pad"
          />
          <PrimaryButton title={t('bcLookup')} onPress={() => manual.trim() && lookup(manual)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraWrap: {
    height: 240,
    borderRadius: radius.m,
    overflow: 'hidden',
    marginBottom: spacing.m,
    backgroundColor: '#000',
  },
  camera: { flex: 1 },
  scanLine: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '50%',
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },
  noCamera: { color: colors.textDim, fontSize: 13, marginBottom: spacing.m, lineHeight: 19 },
  busy: { alignItems: 'center', paddingVertical: spacing.l },
  busyText: { color: colors.textDim, marginTop: spacing.s, fontSize: 14 },
});
