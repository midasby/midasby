# Blok Patlat! 🧩

iPhone ve Android için **blok yerleştirme bulmaca oyunu** — 2026'nın en çok indirilen mobil oyun türü
(Block Blast tarzı). Tek kod tabanı: React Native + Expo.

> Pazar araştırması, gelir modeli ve yol haritası: [`../docs/ARASTIRMA_VE_PLAN.md`](../docs/ARASTIRMA_VE_PLAN.md)

## Oynanış
- 8×8 tahta, altta 3 rastgele taş (29 farklı şekil: çizgiler, kareler, L/T/S/Z).
- Taşı sürükle → hayalet önizleme göster → bırak → yerleşsin.
- Satır veya sütunu doldur → **parlama + parçacık patlamasıyla** temizlenir, puan uçar. ✨
- Üst üste patlat → **COMBO çarpanı** (x2…x6). 🔥
- Hiçbir taş sığmazsa oyun biter; **reklam izleyerek devam** edebilirsin (oyun başına 1 kez). 🎬
- Rekorun cihazda saklanır. 👑

## v1.1 ile gelenler
- 🔊 **Sentezlenmiş ses efektleri** (yerleştirme, patlama, combo, rekor, oyun sonu) + ses açma/kapama
  düğmesi. Sesler `scripts/gen_sounds.js` ile koddan üretilir → telifsiz, yeniden üretilebilir.
- 💥 **Parçacık patlamaları**: temizlenen her hücreden savrulan, yerçekimli, dönen kırıntılar
  (native driver, 60 fps, üst sınır 48 parçacık).
- 📺 **AdMob**: her 3 oyun bitişinde geçiş reklamı + "Reklam İzle & Devam Et" ödüllü videosu.
- 🎨 **Uygulama ikonu, adaptive icon, splash** (`assets/`) ve **mağaza görselleri** (`store/`:
  Google Play öne çıkan görseli + 3 tanıtım ekranı).

## Çalıştırma (Expo Go — reklamsız test)

```bash
cd blokpatlat
npm install
npx expo start
```

Telefona **Expo Go** indirip QR kodu okutun (iOS + Android). Tarayıcıda denemek için: `npx expo start --web`.

> Not: AdMob native modül gerektirdiğinden **Expo Go'da reklamlar görünmez**; oyun reklamsız
> çalışır ve "Devam Et" test için serbesttir. Reklamlı gerçek derleme için aşağıya bakın.

## Reklamlı derleme (EAS Build)

1. [admob.google.com](https://admob.google.com) hesabı açın; uygulama + 1 geçiş + 1 ödüllü reklam birimi oluşturun.
2. `app.json` içindeki `android_app_id` / `ios_app_id` test kimliklerini kendi **App ID**'lerinizle değiştirin.
3. `src/ads.js` içindeki `TestIds` satırlarını kendi **birim kimliklerinizle** değiştirin.
4. Derleyin: `npx eas build --platform all` (ücretsiz EAS hesabı; iOS için Mac gerekmez).

Şu an test kimlikleri tanımlı olduğundan derleme, Google'ın **test reklamlarını** gösterir — politika ihlali olmadan uçtan uca deneyebilirsiniz.

## Yapı

```
blokpatlat/
├── App.js                    # Oyun ekranı: sürükleme, animasyon, skor, reklam/ses bağlantıları
├── app.json                  # Expo yapılandırması + AdMob eklentisi
├── assets/
│   ├── icon.png / adaptive-icon.png / splash-icon.png
│   └── sfx/*.wav             # sentezlenmiş ses efektleri
├── store/                    # mağaza pazarlama görselleri (uygulamaya paketlenmez)
│   ├── feature-graphic.png   # Google Play öne çıkan görseli (1024×500)
│   └── promo-1..3.png        # tanıtım ekranları (1080×1920)
├── scripts/gen_sounds.js     # ses efektlerini yeniden üretir
└── src/
    ├── engine.js             # saf oyun mantığı — birim testli
    ├── theme.js              # renk paleti
    ├── storage.js            # rekor + ses tercihi (AsyncStorage)
    ├── sound.js              # expo-audio katmanı
    ├── ads.js                # AdMob katmanı (native yoksa kendini kapatır)
    ├── ads.web.js            # web stub'ı
    └── components/
        ├── Block.js          # bevel'li blok karesi
        ├── PieceView.js      # taş çizimi
        └── Particles.js      # parçacık patlama sistemi
```

## Yol haritası
v1.2: "Reklamları Kaldır" IAP + tema paketleri · v2.0: günlük görevler, başarımlar, skor paylaşım kartı.
