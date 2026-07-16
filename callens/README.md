# CalLens 🍽️ — Snap your meal. Know your calories.

**AI foto-kalori takip uygulaması** (iPhone + Android, React Native + Expo). Ana hedef pazar: 🌍 global
(varsayılan dil İngilizce; Türkçe cihazlarda otomatik Türkçe).

> Pazar araştırması ve gelir modeli: [`../docs/SAGLIK_UYGULAMALARI_ARASTIRMASI.md`](../docs/SAGLIK_UYGULAMALARI_ARASTIRMASI.md)
> (Cal AI vakası: aynı model 12 ayda 40M$ yaptı)

## Nasıl çalışır (MVP)
1. **Onboarding anketi** (hedef → cinsiyet → yaş/boy/kilo → aktivite) →
   Mifflin-St Jeor denklemiyle **kişisel günlük kalori planı** hesaplanır.
2. **Paywall**: 7 gün denemeli yıllık/aylık abonelik sunumu (kanıtlanmış en yüksek dönüşüm noktası;
   v0.2'de RevenueCat ile gerçek ödeme bağlanacak — şimdilik deneme = premium işareti).
3. **Ana ekran**: kalan kalori halkası + protein/karb/yağ makro çubukları + öğün listesi.
4. **📸 Yemeğini çek** → Claude vision fotoğrafı analiz eder → ad/kalori/makro/porsiyon tahmini
   (yapılandırılmış JSON çıktıyla) → düzenle & kaydet. Elle giriş de var.
5. **Freemium**: ücretsiz planda günde 3 fotoğraf analizi; Premium sınırsız.

## Çalıştırma

```bash
cd callens
npm install
npx expo start          # telefonda Expo Go ile QR okutun
# veya tarayıcıda: npx expo start --web
```

**API anahtarı olmadan da çalışır** — "demo mod"da gerçekçi örnek sonuçlar döner (arayüz akışını
test etmek için). Gerçek AI analizi için:

```bash
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-... npx expo start
```

Model varsayılanı `claude-opus-4-8`'dir (en isabetli tahmin). Maliyeti düşürmek isterseniz
`EXPO_PUBLIC_AI_MODEL` ile farklı bir model seçebilirsiniz — isabet/maliyet dengesi sizin kararınız.

## ⚠️ Yayın öncesi zorunlu: backend proxy

`EXPO_PUBLIC_*` değişkenleri uygulama paketine gömülür — **API anahtarı asla mağaza sürümüne
konmaz** (çıkarılıp kötüye kullanılabilir). Yayına çıkmadan önce `src/ai.js`'teki çağrı, anahtarı
sunucuda tutan küçük bir uç noktaya taşınmalı (Cloudflare Workers / Vercel Functions, ~50 satır):
istemci fotoğrafı proxy'ye yollar, proxy Claude'u çağırır, sonucu döndürür. Bu ayrıca kullanım
kotası ve kötüye kullanım kontrolü de sağlar.

## Yapı

```
callens/
├── App.js                    # Akış kontrolü: onboarding → paywall → ana ekran
├── metro.config.js           # Anthropic SDK'nın Node modülleri için mobil shim
└── src/
    ├── calc.js               # BMR/TDEE/makro hesapları — birim testli
    ├── ai.js                 # Claude vision analizi + demo mod
    ├── i18n.js               # EN (varsayılan) / TR otomatik dil
    ├── storage.js            # Profil + günlük öğünler (AsyncStorage)
    ├── components/ui.js      # ProgressRing (SVG), MacroBar, Chip, Button…
    └── screens/              # Onboarding, Paywall, Home, AddMeal, Settings
```

## v0.2 ile gelenler ✅
- **RevenueCat aboneliği** (`src/purchases.js`): gerçek satın alma + geri yükleme; native modül
  yoksa (Expo Go/web) huni simüle edilir. Yayın öncesi yapılacaklar dosyanın başında yorum olarak.
- **Backend proxy** (`server/`): Cloudflare Worker — API anahtarı sunucuda kalır;
  dağıtım 5 dakika (`server/README.md`). `EXPO_PUBLIC_PROXY_URL` verilince istemci proxy'yi kullanır.
- **Geçmiş sekmesi 📊**: son 7 gün çubuk grafiği (hedef çizgisiyle), günlük ortalama,
  "hedefte gün" sayısı ve gün gün döküm.
- **Mağaza görselleri**: uygulama ikonu + adaptive icon + splash (`assets/`) ve
  Google Play öne çıkan görseli + 3 İngilizce tanıtım ekranı (`store/`).

## v0.3 ile gelenler ✅
- **🔍 Barkod tarama**: kamerayla EAN/UPC tarama (expo-camera) ya da elle numara girişi →
  Open Food Facts'ten (3M+ ürün, ücretsiz) besin verisi → gram girince kalori/makrolar
  otomatik ölçeklenir. Barkod araması AI kotasından düşmez.
- **🔔 Günlük hatırlatma**: Ayarlar'dan açılan yerel bildirim — her akşam 20:30
  "öğünlerini kaydetmeyi unutma" (sunucu gerekmez; web'de gizlenir).
- **⚖️ Kilo grafiği**: Geçmiş sekmesinde kilo günlüğü + SVG çizgi grafiği + başlangıçtan
  bugüne fark; kilo kaydı günlük kalori planını da otomatik günceller.

## Yol haritası
- **v1.0**: mağaza lansmanı — ASO + TikTok içerik motoru (plan belgesindeki Cal AI oyun kitabı);
  adaylar: su takibi, yemek favorileri, Apple Health / Google Fit senkronu

---
*CalLens tahminleri bilgilendirme amaçlıdır; tıbbi veya diyetetik tavsiye değildir.*
