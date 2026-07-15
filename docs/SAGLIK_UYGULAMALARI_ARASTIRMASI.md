# 🩺 Kişisel Sağlık Uygulamaları Pazarı — Araştırma ve Değerlendirme

> Tarih: Temmuz 2026 · Soru: "Sağlık uygulamaları gerçekten çok mu kazandırıyor? Daha iyisini yapabilir miyiz?"

---

## 1. Kısa cevap

**Evet, sezginiz doğru — mobil dünyasında kullanıcı başına en çok para kazandıran kategori sağlık/wellness.**
Ve tek kişilik ekiplerin bile devasa kazandığı kanıtlanmış: 2 lise öğrencisinin yaptığı fotoğraftan
kalori sayan Cal AI, 12 ayda **40 milyon dolar** gelir yapıp MyFitnessPal'a satıldı.
Ama bu paranın motoru kod değil; **onboarding + paywall + TikTok pazarlaması** üçlüsü.
"Daha iyisini yapmak" teknik olarak mümkün; kazanmak pazarlama disiplini ister.

---

## 2. Pazar büyüklüğü (2026 verileri)

- Fitness uygulamaları pazarı 2026'da **~9,2 milyar $** gelir bekliyor; sağlık uygulamaları
  segmenti 2025'te 3,5 milyar $ yaparak yıllık **%23,5 büyüdü** (kategorilerin en hızlılarından).
- Zirvedekiler (yıllık abonelik geliri):
  - **MyFitnessPal** (kalori takibi): **310 M$**
  - **Flo** (kadın döngü takibi): **275 M$**
  - **Calm / Headspace** (meditasyon): wellness, 5 yıldır pazarın en hızlı büyüyen alt segmenti
- Gelir modeli hemen tamamen **abonelik** (oyunlardaki gibi reklam değil).

## 3. Neden bu kadar kazandırıyor? (oyunla karşılaştırma)

| | Oyun (Blok Patlat) | Sağlık uygulaması |
|---|---|---|
| Gelir modeli | Reklam (kullanıcı başına ayda ~0,1-0,3 $) | Abonelik (kullanıcı başına ayda 3-15 $) |
| Kullanıcı motivasyonu | Eğlence | Kimlik/istek: "kilo vereceğim, iyi görüneceğim" |
| Dönüşüm verileri | — | Sağlık kategorisi **deneme→ödeme %35-62 ile tüm kategorilerin lideri** |
| Paywall | Kabul görmez | Onboarding sonu sert paywall LTV'yi **%21 artırıyor** |
| Maliyet | Sıfır sunucu | AI özellikleri API maliyeti getirir |
| Risk | Klon rekabeti | Rekabet + tıbbi iddia yasakları + veri hassasiyeti |

Sağlık kategorisinin oyun kurucu formülü (Cal AI, Flo, Calm hepsinde aynı):
**uzun onboarding anketi ("hedefin ne?") → kişiselleştirilmiş plan vaadi → deneme'li sert paywall →
TikTok/Instagram etkileyici pazarlaması.**

## 4. Cal AI vakası — "iki genç 40 M$" nasıl oldu?

- Mayıs 2024'te çıktı: yemeğin fotoğrafını çek → AI kalori/makro tahmini (~%90 doğruluk iddiası).
- Fiyat: 2,49 $/ay veya 29,99 $/yıl. İlk ay 28 bin $, ikinci ay 115 bin $...
  12 ayda **40 M$ gelir, ayda ~1,4 M$ brüt kâr**, ~30 çalışan, sonunda MyFitnessPal satın aldı.
- Başarının gerçek sırrı (kurucuların kendi ifadesiyle): ürün basit, **dağıtım kanalı** kraldı —
  binlerce mikro-TikTok/Instagram fitness fenomeniyle gelir paylaşımlı tanıtım.
- Ders: AI + kamera + abonelik formülü tek başına yetmiyor; **içerik üretme/pazarlama kası** şart.

## 5. Biz ne yapabiliriz? Aday fikirler (dürüst değerlendirme)

| Fikir | Artı | Eksi | Puan |
|---|---|---|---|
| **AI foto-kalori, Türk mutfağı odaklı** | Kanıtlanmış model; global uygulamalar Türk/Ortadoğu mutfağında kötü (mantı, çiğ köfte, künefe...) — gerçek boşluk; TR + gurbetçi + Ortadoğu pazarı | API maliyeti; Cal AI klonları çoğalıyor | ⭐ en güçlü |
| Su/oruç/adım takipçisi | Çok basit | Aşırı doygun, düşük ödeme isteği | zayıf |
| Meditasyon/uyku | Yüksek ARPU | İçerik üretimi (ses/koçluk) tek kişiyi aşar | orta |
| AI cilt/saç/postür analizi | Viral potansiyel | Beklenti/etik riski, iade oranı yüksek | riskli |
| Kadın döngü takibi | Kanıtlanmış (Flo) | Hassas veri, güven bariyeri yüksek | zor |

### Önerilen konsept: **"KaloriCep"** (EN: SnapCal TR)
"Yemeğinin fotoğrafını çek, Türk mutfağını gerçekten tanıyan AI kalorini söylesin."

- **Ayrışma:** Türkçe yemek veritabanı + porsiyon kültürü (kepçe, dilim, kase), Ramazan/oruç modu,
  TR fiyatlaması (₺59,99/ay gibi — Cal AI'ın 2,49 $/ay stratejisinin yerelleştirilmişi).
- **Teknoloji:** mevcut Expo altyapımız + kamera + görüntü analizi API'si (Claude/GPT vision) +
  RevenueCat aboneliği. MVP tek geliştiriciyle 3-4 haftalık iş.
- **Maliyet gerçeği:** analiz başına ~0,5-1 ¢ API maliyeti → ücretsiz katmana günlük 3 analiz sınırı şart.
- **Kanıtlanmış gelir matematiği** (muhafazakâr): ayda 3.000 indirme → %11 deneme → %35 ödeme
  ≈ ayda ~115 yeni abone; yıllık plan ağırlıklı karışımla 12. ayda **2.000-4.000 $/ay** civarı;
  TikTok kanalı tutarsa Cal AI'ın gösterdiği gibi tavan çok yüksek.
- **Yasal çerçeve:** "kalori tahmini/bilgi amaçlı" konumlanır, teşhis/tedavi iddiası yok;
  yeme bozukluğu koruma metinleri eklenir; sağlık verisi cihazda/kullanıcı hesabında tutulur (KVKK).

## 6. Stratejik tavsiye

1. **Blok Patlat'ı rafa kaldırmayın** — yayına hazır; mağaza sürecini onunla öğrenin
   (hesaplar, inceleme, ASO). Bu deneyim sağlık uygulamasında altın değerinde.
2. Sağlık uygulaması **"ciddi para" bahsi** olarak ikinci ürün olsun: oyun = hacim + reklam,
   sağlık = düşük hacim + yüksek abonelik. İki ayrı gelir bacağı.
3. Sağlıkta başarının %70'i pazarlamadır: TikTok'ta "yemeğini çek, kalorisini gör" videoları
   üretmeye hazır olun (yüz göstermeden ekran kaydı formatı yeterli, Cal AI da böyle başladı).

## 7. Kaynaklar

[Business of Apps – Health & Fitness App Report 2026](https://www.businessofapps.com/data/health-fitness-app-report/) ·
[Business of Apps – Health App Market](https://www.businessofapps.com/data/health-app-market/) ·
[Business of Apps – MyFitnessPal](https://www.businessofapps.com/data/myfitnesspal-statistics/) ·
[Business of Apps – Flo](https://www.businessofapps.com/data/flo-statistics/) ·
[Statista – Fitness Apps Worldwide](https://www.statista.com/outlook/hmo/digital-health/digital-fitness-well-being/health-wellness-coaching/fitness-apps/worldwide) ·
[CNBC – Cal AI hikâyesi](https://www.cnbc.com/2025/09/06/cal-ai-how-a-teenage-ceo-built-a-fast-growing-calorie-tracking-app.html) ·
[TechCrunch – Cal AI](https://techcrunch.com/2025/03/16/photo-calorie-app-cal-ai-downloaded-over-a-million-times-was-built-by-two-teenagers/) ·
[Inc. – Cal AI 40M$ ve satış](https://www.inc.com/ben-sherry/he-built-an-ai-app-in-high-school-made-40m-and-sold-to-myfitnesspal-now-hes-aiming-even-bigger/91307748) ·
[Adapty – Health & Fitness Subscription Benchmarks 2026](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) ·
[RevenueCat – State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps) ·
[Airbridge – Kategoriye göre abonelik fiyatları 2026](https://www.airbridge.io/en/blog/subscription-app-pricing-by-category-2026-benchmark)
