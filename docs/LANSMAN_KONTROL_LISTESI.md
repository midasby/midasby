# 🚀 Lansman Kontrol Listesi — Blok Patlat + CalLens

> Kural: **[SİZ]** = yalnızca sizin yapabileceğiniz işler (kimlik, ödeme, hesap).
> **[BEN]** = siz ilgili anahtarı/bilgiyi verdiğinizde Claude'un yapacağı işler.
> Ayrıntılı mağaza süreci: [`MAGAZAYA_YUKLEME_REHBERI.md`](./MAGAZAYA_YUKLEME_REHBERI.md)

---

## 0. Sıra önerisi

1. **Hafta 1 — Hesaplar** (toplam ~2 saat sizin işiniz + onay beklemeleri)
2. **Hafta 2 — Blok Patlat lansmanı** (basit: yalnızca AdMob; mağaza sürecini bununla öğrenin)
3. **Hafta 3-4 — CalLens lansmanı** (RevenueCat + proxy + sağlık kategorisi ek formları)

İki uygulama aynı geliştirici hesaplarını paylaşır — hesap masrafı bir kere: **~125 $**
(Google 25 $ tek sefer + Apple 99 $/yıl). RevenueCat/AdMob/Cloudflare/Expo ücretsiz katman.

---

## 1. Hafta — Hesaplar **[SİZ]**

| # | Hesap | Adres | Süre | Not |
|---|---|---|---|---|
| 1 | Expo | expo.dev | 5 dk | E-posta yeter |
| 2 | Google Play Console | play.google.com/console | 30 dk + 1-2 gün onay | 25 $, kimlik doğrulaması ister |
| 3 | Apple Developer | developer.apple.com/programs/enroll | 20 dk + 1-2 gün onay | 99 $/yıl |
| 4 | AdMob | admob.google.com | 20 dk | IBAN girin (Blok Patlat geliri) |
| 5 | RevenueCat | app.revenuecat.com | 10 dk | Ücretsiz (aylık 2.5K$ gelire kadar) |
| 6 | Cloudflare | dash.cloudflare.com | 5 dk | Ücretsiz (CalLens proxy) |
| 7 | Anthropic API | console.anthropic.com | 10 dk | Kredi yükleyin (~5-10 $ başlangıç yeter) |

**Ayrıca [SİZ]:** 15-20 kişilik test grubu toplayın (aile/arkadaş; Gmail adresleri lazım) —
Google'ın yeni-hesap kapalı test şartı için. Şimdiden bir WhatsApp grubu kurun.

---

## 2. Hafta — Blok Patlat lansmanı

### [SİZ] — AdMob panosunda (20 dk)
1. AdMob → Uygulamalar → **Uygulama ekle** ×2 (Android + iOS, "mağazada değil" seçin)
2. Her uygulamada 2 reklam birimi: **Geçiş (Interstitial)** + **Ödüllü (Rewarded)**
3. Bana şunları yapıştırın (bunlar gizli değil, paylaşması güvenli):
   - 2× App ID (`ca-app-pub-XXXX~YYYY`)
   - 4× Birim ID (`ca-app-pub-XXXX/ZZZZ`)

### [BEN] — kimlikleri alınca
- `blokpatlat/app.json` + `src/ads.js` gerçek kimliklerle güncellenir, commit + push
- `eas.json` yapılandırması hazırlanır, derleme komutları adım adım verilir

### [SİZ] — kendi bilgisayarınızda (EAS derlemesi kimlik gerektirir)
```bash
cd blokpatlat && npm install && npm i -g eas-cli
eas login                       # Expo hesabınız
eas build:configure
eas build --platform android    # keystore sorusuna Evet → .aab çıkar
eas build --platform ios        # Apple hesabınızla giriş → sertifikaları EAS halleder
```
### [SİZ] — mağaza konsollarında
- Play Console: uygulama oluştur → mağaza kaydı (görseller `blokpatlat/store/` içinde hazır)
  → içerik formları → **kapalı test** → testçileri ekleyin → süre dolunca **üretim**
- App Store Connect: uygulama oluştur → `eas submit --platform ios` → sürüm bilgileri → incelemeye gönder
- Gizlilik politikası URL'si gerekir → **[BEN]** metni + GitHub Pages kurulum adımlarını hazırlarım

---

## 3-4. Hafta — CalLens lansmanı

### [SİZ] — RevenueCat panosunda (30 dk)
1. Proje oluştur → iOS + Android uygulamalarını ekle
2. App Store Connect + Play Console'da abonelik ürünleri oluştur:
   - `callens_yearly` — 29.99 $/yıl · `callens_monthly` — 5.99 $/ay
   (mağaza konsollarında "abonelik grubu/base plan" sihirbazları yönlendirir)
3. RevenueCat'te **"premium" entitlement** oluştur, iki ürünü bağla, default offering'e ekle
4. Bana yapıştırın: **iOS public API key** (`appl_...`) + **Android public API key** (`goog_...`)
   (bunlar "public SDK key" — paylaşması güvenli)

### [SİZ] — Proxy dağıtımı (10 dk, tek seferlik)
```bash
cd callens/server && npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # Anthropic anahtarınızı buraya girin (bana göndermeyin!)
npx wrangler deploy                          # çıkan URL'yi bana verin
```
> ⚠️ Anthropic API anahtarı **gizlidir** — sohbete yapıştırmayın; yalnızca wrangler'a girin.

### [BEN] — anahtarları/URL'yi alınca
- `src/purchases.js` RevenueCat anahtarları + `eas.json` + proxy URL yapılandırması, commit + push
- App Store için 1290×2796 boyutlu ekran görüntüleri üretimi (mevcut tasarımlardan)
- Mağaza açıklama metinleri (EN + TR, ASO anahtar kelimeli)
- Gizlilik politikası metni (sağlık verisi + AdMob/RevenueCat açıklamalarıyla)

### [SİZ] — derleme + mağaza (Blok Patlat'la aynı akış)
- `eas build` ×2 → kapalı test → üretim
- Veri Güvenliği formunda: "Sağlık ve fitness" veri türü işaretlenir ama **veri cihazda kalır /
  paylaşılmaz** seçilir (fotoğraflar analiz sonrası saklanmıyor — formda böyle beyan edilir)

---

## Yayın sonrası ilk 30 gün

- **[SİZ]** Yorumlara cevap verin (sıralama sinyali), test grubundan yorum/puan isteyin
- **[SİZ]** TikTok/Reels: Blok Patlat combo klipleri · CalLens "yemeği çek-kalorisi gelsin" klipleri
  (Cal AI'ın 40M$ kanalı buydu — plan: `SAGLIK_UYGULAMALARI_ARASTIRMASI.md`)
- **[BEN]** Haftalık: yorumlardan çıkan hataları düzeltme, yeni sürümler, ASO metin denemeleri
- AdMob/RevenueCat panolarını haftada bir kontrol edin; Anthropic kredisine kullanım alarmı kurun

## Kritik güvenlik notları

1. **Bana paylaşması güvenli:** AdMob App/Birim ID'leri, RevenueCat public SDK anahtarları,
   proxy URL'si, Expo proje adı.
2. **Asla sohbete yapıştırmayın:** Anthropic API anahtarı, Apple/Google hesap şifreleri,
   keystore dosyaları. Bunlar yalnızca kendi terminalinizde/panolarınızda kullanılır.
3. CalLens yayına çıkmadan `EXPO_PUBLIC_ANTHROPIC_API_KEY` **hiçbir derlemede olmamalı** —
   yalnızca proxy kullanılmalı (kod zaten proxy'yi önceliyor).
