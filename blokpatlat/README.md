# Blok Patlat! 🧩

iPhone ve Android için **blok yerleştirme bulmaca oyunu** — 2026'nın en çok indirilen mobil oyun türü
(Block Blast tarzı). Tek kod tabanı: React Native + Expo.

> Pazar araştırması, gelir modeli ve yol haritası: [`../docs/ARASTIRMA_VE_PLAN.md`](../docs/ARASTIRMA_VE_PLAN.md)

## Oynanış
- 8×8 tahta, altta 3 rastgele taş (29 farklı şekil: çizgiler, kareler, L/T/S/Z).
- Taşı sürükle → hayalet önizleme göster → bırak → yerleşsin.
- Satır veya sütunu doldur → **beyaz parlama ile patlar**, puan uçar. ✨
- Üst üste patlat → **COMBO çarpanı** (x2…x6). 🔥
- Hiçbir taş sığmazsa oyun biter; rekorun cihazda saklanır. 👑

## Çalıştırma

```bash
cd blokpatlat
npm install
npx expo start
```

Telefona **Expo Go** indirip QR kodu okutun (iOS + Android). Mağaza derlemesi: `npx eas build --platform all`.

## Yapı

```
blokpatlat/
├── App.js                    # Oyun ekranı: sürükleme, animasyon, skor, oyun sonu
├── app.json                  # Expo yapılandırması (com.midasby.blokpatlat)
└── src/
    ├── engine.js             # Saf oyun mantığı (şekiller, yerleştirme, temizleme, puan) — birim testli
    ├── theme.js              # Renk paleti + açma/koyulaştırma yardımcıları
    ├── storage.js            # Rekor kaydı (AsyncStorage)
    └── components/
        ├── Block.js          # Bevel'li "şeker" blok karesi
        └── PieceView.js      # Taş (şekil) çizimi
```

## Yol haritası
v1.1: AdMob (ödüllü video + interstitial), ses, parçacık efektleri · v1.2: "Reklamları Kaldır" IAP + temalar · v2.0: günlük görevler, başarımlar.
