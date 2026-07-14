# KârNot — Mobil Uygulama Araştırması ve İş Planı

> Tarih: Temmuz 2026 · Hedef: iPhone + Android · Tek geliştirici / düşük bütçe

---

## 1. Neden bu uygulama? (Konsept seçimi)

İstenen kriterler: **basit, güzel, insanların seveceği ve para kazandıracak** bir uygulama.
Değerlendirilen adaylar ve eleme nedenleri:

| Aday | Artı | Eksi | Karar |
|---|---|---|---|
| Alışkanlık takipçisi | Kanıtlanmış model | Aşırı doygun pazar, düşük ödeme isteği | ❌ |
| Su içme hatırlatıcısı | Çok basit | Binlerce klon, reklam geliri çok düşük | ❌ |
| Harcama takibi | Büyük pazar | Banka entegrasyonu olmadan zayıf, rekabet çok yüksek | ❌ |
| **Trade günlüğü + risk hesaplayıcı** | Ödemeye hazır niş kitle, mobil boşluk, **sizin mevcut trading birikiminizle birebir uyumlu** | Niş pazar (ama bu bir avantaj) | ✅ |

**Seçilen konsept: "KârNot" (EN: ProfitNote)** — Trader'lar için cebe sığan, sade ve şık bir
**işlem günlüğü + pozisyon/risk hesaplayıcı**. "İşlemlerini yaz, istatistiğini gör, riskini hesapla."

### Bu depoyla sinerji
Depoda zaten PIE sistemi ve Harmonik Formasyon Bulucu (TradingView Pine Script) var.
KârNot'ta işlemler "Harmonik", "PIE", "Destek/Direnç" gibi strateji etiketleriyle kaydediliyor —
yani indikatörlerinizi kullanan kitle, uygulamanın doğal ilk kullanıcısı. TradingView yayınlarınız
ücretsiz pazarlama kanalı olur.

---

## 2. Pazar araştırması (Temmuz 2026)

### 2.1 Rakipler ve fiyatlar
- **TradeZella**: 29–49 $/ay. Güçlü ama pahalı ve **özel mobil uygulaması yok**.
- **Edgewonk**: 169 $/yıl. **Mobil uygulaması yok**, aylık ödeme seçeneği yok.
- **TraderSync**: Gerçek iOS/Android uygulaması olan neredeyse tek ciddi oyuncu.
- **Tradervue, TradesViz, Myfxbook**: masaüstü odaklı.

➡ **Boşluk:** Mobil öncelikli, sade, uygun fiyatlı (aylık bir kahve parası) trade günlüğü.
Türkçe pazarda bu boşluk daha da büyük: BIST + kripto + Forex kitlesi için yerli, Türkçe bir
günlük uygulaması neredeyse yok.

### 2.2 Para kazanma verileri
- Mağazalar üzerinden işlenen abonelik geliri 2026 Q1'de yıllık **%105 büyüdü** — en hızlı büyüyen gelir modeli.
- Abonelik uygulamaları, yalnızca reklamla kazanan uygulamalara göre **4,6 kat daha yüksek ARPU** üretiyor; şirket değerlemesinde 4–8 kat çarpan farkı var.
- Trading uygulamaları sektörü 2025'te ~12,4 milyar $ gelir üretti; 2028'de 18 milyar $+ bekleniyor. Premium katmanlar tipik olarak **9,99–19,99 $/ay**.
- Oyun dışı uygulamalar için en iyi başlangıç: **freemium + 7 gün ücretsiz deneme**.
- Aboneliğin yanına tek seferlik "ömür boyu" satın alma eklemek toplam dönüşümü **%15–25 artırıyor**.
- Gerçekçi beklenti (tek geliştirici): yeni abonelik uygulamalarının %57,7'si toplamda 1.000 $ geliri geçemiyor — bu fiyat değil, **ürün-pazar uyumu** sorunu. Sıkı niş konumlandırma + abonelik ile 12–18 ayda üst çeyrek solo sonuç: **3.000–15.000 $/ay**. İlk yıl hedefini mütevazı tutmak gerekir.

Kaynaklar:
[RevenueCat – State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps) ·
[RevenueCat – 2026 trendleri ve kıyaslamalar](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/) ·
[AppsFlyer – State of App Monetization 2026](https://www.appsflyer.com/resources/reports/app-marketing-monetization-report/) ·
[Adapty – Mobile App Monetization 2026](https://adapty.io/blog/mobile-app-monetization-2026/) ·
[Trading app monetization 2026](https://www.mobileappdevelopmentcompany.us/blog/monetize-your-mobile-trading-app/) ·
[Fungies – Indie Developer Market 2026](https://fungies.io/indie-developer-market-analysis-2026/) ·
[Tradervue – Best Trading Journals 2026](https://www.tradervue.com/blog/best-trading-journal) ·
[StockBrokers.com – Best Trading Journals 2026](https://www.stockbrokers.com/guides/best-trading-journals) ·
[TradersSecondBrain – Best Trading Journal Apps](https://traderssecondbrain.com/guides/best-trading-journal-app) ·
[Apps Finboard – Monetization Strategies 2026](https://appsfinboard.com/blog/mobile-app-monetization-strategies-2026/)

---

## 3. Ürün tanımı

### 3.1 Tek cümle
"İşlemini 10 saniyede kaydet; kazandıran ve kaybettiren alışkanlıklarını gör."

### 3.2 MVP özellikleri (bu depoda kodlandı ✅)
1. **Panel (Dashboard)**: Toplam K/Z, kazanma oranı, profit factor, ortalama kazanç/kayıp, seri (streak), son işlemlerin K/Z çubuk grafiği.
2. **İşlem günlüğü**: Sembol, yön (Long/Short), giriş/çıkış fiyatı, miktar, komisyon, strateji etiketi (Harmonik, PIE, Destek/Direnç…), duygu etiketi (😎 disiplinli / 😰 FOMO / 😤 intikam işlemi…), not.
3. **Risk hesaplayıcı**: Hesap büyüklüğü + risk % + giriş/stop → pozisyon büyüklüğü, risk tutarı, 1R/2R/3R hedef fiyatları.
4. **Ücretsiz sınır**: ayda 30 işlem; sonrası Premium.
5. **CSV dışa aktarma** (paylaş menüsüyle) ve yerel veri (internet gerekmez, gizlilik dostu).

### 3.3 Premium (v1.1'de mağaza aboneliğiyle bağlanacak)
- Sınırsız işlem, gelişmiş istatistikler (strateji/duygu bazlı kırılım), CSV/Excel dışa aktarım, bulut yedekleme, widget.
- **Fiyat önerisi**: TR: ₺59,99/ay veya ₺399,99/yıl · Global: 3,99 $/ay, 24,99 $/yıl, 59,99 $ ömür boyu.
  (Rakipler 29–49 $/ay iken "ucuz ve mobil" konumlandırma bilinçli bir stratejidir.)
- Reklam **önerilmez**: trader kitlesi reklamdan nefret eder, güven satıyoruz. Gerekirse yalnızca ücretsiz katmanda tek native banner.

### 3.4 Neden insanlar sevecek?
- 10 saniyede kayıt (rakiplerde dakikalar sürüyor, masaüstü gerekiyor).
- Duygu etiketi = benzersiz "trading psikolojisi" açısı; kullanıcı FOMO işlemlerinin toplam maliyetini görünce "aha!" anı yaşıyor.
- Karanlık, altın vurgulu şık arayüz; internet ve üyelik zorunluluğu yok.

---

## 4. Teknoloji

| Konu | Seçim | Neden |
|---|---|---|
| Çatı | **React Native + Expo** | Tek kod tabanıyla iOS+Android; EAS Build ile Mac'siz iOS derleme; OTA güncelleme |
| Veri | AsyncStorage (yerel) → v2'de Supabase bulut yedek | MVP için sunucu maliyeti sıfır |
| Ödeme | RevenueCat + StoreKit/Google Play Billing | Abonelik yönetimini tek SDK'da çözer |
| Analitik | PostHog / Firebase (ücretsiz katman) | Dönüşüm hunisini ölçmek için |

**Maliyet**: Apple Developer 99 $/yıl + Google Play 25 $ (tek sefer) + EAS ücretsiz katman → **ilk yıl ~125 $**.

---

## 5. Yol haritası

| Faz | Süre | İçerik |
|---|---|---|
| **v1.0 MVP** ✅ | bu depo | Günlük + panel + hesaplayıcı + CSV, tamamen yerel |
| v1.1 | 2–3 hafta | RevenueCat aboneliği, onboarding + 7 gün deneme, TR/EN dil desteği |
| v1.2 | +1 ay | Strateji/duygu kırılım raporları, grafik ekranı, widget |
| v2.0 | +2 ay | Bulut yedek (Supabase), fotoğraflı işlem (grafik ekran görüntüsü ekleme), Apple Watch özeti |

### Lansman / pazarlama (bütçesiz)
1. TradingView'daki PIE ve Harmonik indikatör açıklamalarına uygulama linki.
2. Türk trading Telegram/Discord grupları + X (Twitter) fintwit'te "işlem karnesi" paylaşım görselleri (uygulama K/Z kartını paylaşma özelliği viral döngü yaratır).
3. ASO anahtar kelimeler: "trade günlüğü, işlem defteri, trading journal, position size calculator, risk hesaplama, borsa günlüğü, kripto not".
4. Product Hunt + r/Daytrading lansmanı (EN sürümüyle).

### İlk yıl gerçekçi hedef
1.000 indirme/ay → %35 kayıt tamamlar → %4–6 deneme → %40 deneme→ödeme
≈ ay başına 15–25 yeni abone → 12. ayda **~150–250 aktif abone ≈ 500–900 $/ay** (yıllık planlar dahil).
Viral paylaşım kartı + TradingView trafiği tutarsa üst senaryo bunun 3–5 katı.

---

## 6. Yasal notlar
- Uygulama **yatırım tavsiyesi vermez**; yalnızca kullanıcının kendi kayıt/hesap aracıdır (SPK açısından güvenli bölge). Ayarlar ekranına ve mağaza açıklamasına feragat metni eklendi.
- "Midas" adı Türkiye'de bilinen bir aracı kurum markası olduğundan uygulama adında **kullanılmadı** (marka riski). Seçilen ad: **KârNot / ProfitNote**.
- Veriler cihazda tutulur → KVKK/GDPR yükü minimal; yine de mağaza için basit bir gizlilik politikası sayfası gerekir.
