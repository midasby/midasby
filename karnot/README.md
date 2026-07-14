# KârNot 📒 — Trader'ın Cep Günlüğü

iPhone ve Android için **işlem günlüğü + risk hesaplayıcı**. Tek kod tabanı (React Native + Expo).

> İş planı, pazar araştırması ve gelir modeli: [`../docs/ARASTIRMA_VE_PLAN.md`](../docs/ARASTIRMA_VE_PLAN.md)

## Özellikler (v1.0)
- 📊 **Panel**: toplam K/Z, kazanma oranı, profit factor, ortalama kazanç/kayıp, kazanç/kayıp serisi, son işlemler grafiği
- 📒 **İşlem günlüğü**: sembol, Long/Short, giriş/çıkış, miktar, komisyon, strateji etiketi (Harmonik, PIE…), duygu etiketi (FOMO, intikam…), not
- 🛡️ **Risk hesaplayıcı**: hesap + risk % + giriş/stop → pozisyon büyüklüğü ve 1R/2R/3R hedefleri
- 📤 CSV dışa aktarma (paylaş menüsü)
- 🔒 Tüm veriler cihazda (AsyncStorage) — internet ve üyelik gerekmez
- ⭐ Freemium: ayda 30 ücretsiz işlem; Premium aboneliği v1.1'de RevenueCat ile bağlanacak

## Çalıştırma

```bash
cd karnot
npm install
npx expo start
```

- Telefonda **Expo Go** uygulamasını indirip QR kodu okutun (iPhone + Android).
- Mağaza derlemesi için: `npx eas build --platform all` (ücretsiz EAS hesabı yeterli, iOS için Mac gerekmez).

## Proje yapısı

```
karnot/
├── App.js                     # Sekmeler, durum yönetimi, veri akışı
├── app.json                   # Expo yapılandırması (bundle id: com.midasby.karnot)
└── src/
    ├── theme.js               # Renkler (koyu tema + altın vurgu)
    ├── constants.js           # Ücretsiz plan sınırı
    ├── storage.js             # AsyncStorage kalıcılık katmanı
    ├── stats.js               # K/Z, istatistik, CSV, sayı ayrıştırma
    ├── components/ui.js       # Card, StatBox, Input, Button, Chip
    └── screens/
        ├── DashboardScreen.js
        ├── TradesScreen.js
        ├── AddTradeModal.js
        ├── CalculatorScreen.js
        └── SettingsScreen.js
```

## Yol haritası
v1.1: RevenueCat abonelik + onboarding + EN dil · v1.2: strateji/duygu raporları, widget · v2.0: bulut yedek, grafik görselli işlemler. Detay için plan belgesine bakın.

---
*KârNot yatırım tavsiyesi vermez; yalnızca kişisel kayıt/hesaplama aracıdır.*
