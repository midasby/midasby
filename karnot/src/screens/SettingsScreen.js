import React from 'react';
import { ScrollView, View, Text, Share, Alert, StyleSheet } from 'react-native';
import { Card, SectionTitle, PrimaryButton, Chip } from '../components/ui';
import { tradesToCsv, monthTradeCount } from '../stats';
import { FREE_MONTHLY_LIMIT } from '../constants';
import { colors, spacing } from '../theme';

const CURRENCIES = ['₺', '$', '€', '£'];

export default function SettingsScreen({ trades, settings, onUpdateSettings, onClearAll }) {
  const used = monthTradeCount(trades);

  const exportCsv = async () => {
    if (trades.length === 0) {
      Alert.alert('Veri yok', 'Dışa aktarılacak işlem bulunmuyor.');
      return;
    }
    try {
      await Share.share({
        title: 'KârNot işlem günlüğü',
        message: tradesToCsv(trades, settings.currency),
      });
    } catch (e) {
      // kullanıcı paylaşımı iptal etti
    }
  };

  const confirmClear = () => {
    Alert.alert('Tüm veriyi sil', 'Bütün işlemler ve ayarlar kalıcı olarak silinecek. Emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Hepsini sil', style: 'destructive', onPress: onClearAll },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}>
      <Text style={styles.title}>Ayarlar</Text>

      <Card style={styles.premiumCard}>
        <Text style={styles.premiumTitle}>⭐ KârNot Premium</Text>
        <Text style={styles.premiumText}>
          Sınırsız işlem, strateji & duygu raporları, bulut yedekleme ve Excel dışa aktarım.
        </Text>
        <Text style={styles.usage}>
          Bu ay: {used}/{FREE_MONTHLY_LIMIT} ücretsiz işlem kullanıldı
        </Text>
        <PrimaryButton
          title="Premium'a Geç"
          onPress={() =>
            Alert.alert('Çok yakında', 'Premium abonelik v1.1 sürümüyle App Store ve Google Play üzerinden aktif olacak.')
          }
        />
      </Card>

      <Card>
        <SectionTitle>Para birimi</SectionTitle>
        <View style={styles.chipWrap}>
          {CURRENCIES.map((c) => (
            <Chip key={c} label={c} selected={settings.currency === c} onPress={() => onUpdateSettings({ ...settings, currency: c })} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>Veri</SectionTitle>
        <PrimaryButton title="CSV olarak dışa aktar" tone="soft" onPress={exportCsv} style={{ marginBottom: spacing.s }} />
        <PrimaryButton title="Tüm veriyi sil" tone="danger" onPress={confirmClear} />
        <Text style={styles.privacy}>Verilerin yalnızca bu cihazda saklanır; hiçbir sunucuya gönderilmez. 🔒</Text>
      </Card>

      <Text style={styles.disclaimer}>
        KârNot bir kayıt ve hesaplama aracıdır; yatırım tavsiyesi vermez. Geçmiş performans geleceğin garantisi değildir.
      </Text>
      <Text style={styles.version}>KârNot v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.m },
  premiumCard: { borderColor: colors.goldDim },
  premiumTitle: { color: colors.gold, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  premiumText: { color: colors.text, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  usage: { color: colors.textDim, fontSize: 12, marginBottom: spacing.m },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  privacy: { color: colors.textDim, fontSize: 12, marginTop: 10, textAlign: 'center' },
  disclaimer: { color: colors.textDim, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: spacing.s },
  version: { color: colors.textDim, fontSize: 11, textAlign: 'center', marginTop: spacing.m },
});
