# Blok Patlat! 🧩 — Oyun Araştırması ve Gelir Planı

> Tarih: Temmuz 2026 · Hedef: iPhone + Android · Tek geliştirici / düşük bütçe

---

## 1. Neden bu oyun? (Güncel veriler)

**"Güncel olarak en çok oynanabilecek oyun" sorusunun net bir cevabı var:**

- **Block Blast!** (blok yerleştirme bulmacası) 2026'nın Ocak, Şubat ve Mart aylarında art arda
  **dünyanın en çok indirilen mobil oyunu** oldu (Sensor Tower verisi).
- Ocak 2026'da tek başına **28,1 milyon indirme**; Nisan'da 23,8 milyon.
- **70 milyon günlük / 300 milyon aylık aktif kullanıcı**, 200+ ülke.
- 2025'te 5 yıldır zirvede olan Subway Surfers'ı geçerek yılın en çok indirilen gündelik (casual)
  oyunu oldu; en yakın rakibi Candy Crush'ın 3 katından fazla indirme aldı.

Yani tür kanıtlanmış, talep devasa ve mekanik tek geliştiricinin yapabileceği kadar basit:
**sürükle → yerleştir → satır/sütun doldur → patlat.** Tetris'in zamansız çekiciliği + zaman
baskısı yok = herkes oynayabiliyor (çocuk, yetişkin, oyuncu olmayan herkes).

**Bizim oyunumuz: "Blok Patlat!"** — Block Blast formülünün Türkçe, görsel olarak parlak
(neon/şeker estetiği) ve tamamen çevrimdışı çalışan yerli versiyonu. Global için EN adı: **Block Pop!**

### Türün riski ve cevabımız
Tür popüler olduğu için klon sayısı da yüksek. Ayrışma noktalarımız:
1. **Görsel kalite**: koyu lacivert zemin + canlı bevel'li bloklar + combo/patlama efektleri (v1'de var), parçacık ve tema sistemleri (v1.1).
2. **Türkçe-öncelikli**: mağaza sayfası, kelime oyunlu isim, TR sosyal medya pazarlaması. Block Blast Türkçe yerelleştirmede zayıf.
3. **Küçük ama akıllı dokunuşlar**: combo serisi, haptik titreşim, rekor kutlaması.

---

## 2. Para kazanma modeli (araştırma verisiyle)

Gündelik/hiper-gündelik oyunlarda gelir **%85–95 reklam, %5–15 uygulama içi satın alma**:

- **Ödüllü video reklam** (ör. "reklam izle → hamleni geri al / tahtayı karıştır"): oyun
  uygulamalarında reklam gelirinin **%50–70'ini** tek başına üretiyor; eCPM Tier-1 ülkelerde
  **18–45 $**, global ortalama 10–22 $. Interstitial'a göre 2–3 kat etkileşim ve retention'ı bozmuyor.
- **Geçiş reklamı (interstitial)**: her 2–3 oyun bitişinde bir; agresif olmayan sıklık şart.
- **"Reklamları Kaldır" IAP**: tek seferlik ₺99,99 / 2,99 $ — hibrit model tek modele göre LTV'yi ~%30 artırıyor.
- Örnek ölçek: benzer türde Color Block Jam tek çeyrekte 21,8 M indirme ile **~42 M $** gelir yaptı.

**Gerçekçi ilk yıl senaryosu** (tek geliştirici, organik + küçük tanıtım):
günde 1.000 aktif oyuncu · oyuncu başına günde 2–3 reklam gösterimi · 8–12 $ eCPM
≈ **aylık 500–900 $**; viral bir TikTok/ASO dalgası yakalanırsa 10–50 katına çıkabilen bir tavan var
(türün kanıtladığı şey tam olarak bu).

### Uygulama planı
| Sürüm | Gelir özelliği |
|---|---|
| v1.0 (bu depo) | Gelir yok — önce oynanış ve his mükemmelleşir |
| v1.1 | AdMob: oyun sonu interstitial + "hamle geri al / devam et" ödüllü video |
| v1.2 | "Reklamları Kaldır" IAP + tema paketleri (kozmetik IAP) |
| v2.0 | Günlük görevler, lig/başarımlar (retention → reklam geliri çarpanı) |

---

## 3. Oyun tasarımı (v1.0'da kodlandı ✅)

- **8×8 tahta**, altta rastgele **3 taş** (çizgiler, kareler, L/T/S/Z varyantları — 29 şekil).
- Taşı sürükle: parmağın üstüne kalkar, tahtada **hayalet önizleme** gösterilir, bırakınca oturur.
- Dolan satır/sütunlar **beyaz parlama animasyonuyla patlar**; skor uçan "+puan" yazısıyla kutlanır.
- **Combo sistemi**: üst üste patlatan yerleştirmelerde çarpan (x2…x6) — "bir tur daha" hissinin motoru.
- 3 taş bitince yeni 3 taş gelir; **hiçbir taş sığmıyorsa oyun biter** → skor + rekor ekranı.
- Puanlama: hücre başına 1 + satır başına artan bonus × combo çarpanı.
- **Haptik geri bildirim** (yerleştirme/patlama/oyun sonu), rekor kaydı cihazda (çevrimdışı çalışır).
- Görsel dil: koyu lacivert zemin (#171A3B), 8 renkli canlı "şeker" paleti, bevel'li 3B blok görünümü,
  çok renkli logo, altın vurgular.

### v1.1 görsel/his iyileştirmeleri
Parçacık patlaması (expo'da Skia/reanimated), blok yerleşme "squash" animasyonu, ses efektleri
(expo-audio), tema mağazası (neon / pastel / retro), gece-gündüz temaları.

---

## 4. Teknoloji ve maliyet

| Konu | Seçim | Neden |
|---|---|---|
| Çatı | React Native + Expo SDK 53 | Tek kod tabanı iOS+Android; EAS Build ile Mac'siz iOS derleme |
| Oyun mantığı | Saf JS modülü (`src/engine.js`) | Framework'ten bağımsız, birim testli |
| Sürükleme | PanResponder + Animated | Ek bağımlılık yok, 60fps yeterli |
| Reklam (v1.1) | react-native-google-mobile-ads (AdMob) | Ödüllü + interstitial tek SDK |
| Kalıcılık | AsyncStorage | Sunucu maliyeti sıfır, çevrimdışı |

**Maliyet**: Apple Developer 99 $/yıl + Google Play 25 $ (tek sefer) → **ilk yıl ~125 $**.

---

## 5. Lansman planı (bütçesiz)

1. **ASO**: "blok bulmaca", "block puzzle", "blok patlatma", "zeka oyunu", "offline oyun" anahtar
   kelimeleri; parlak bloklu ikon (ikon A/B testi Google Play'de ücretsiz).
2. **TikTok/Reels/Shorts**: "yüksek combo" ve "son saniye kurtarış" klipleri — türün viral motoru bu.
   Oyun içi "skorunu paylaş" görseli v1.1'de.
3. Google Play'de **açık test → üretim** kademesi; ilk 2 hafta yorumlara birebir cevap (mağaza sıralamasını etkiler).
4. Reklamlar ancak D1 retention %35+ olduktan sonra açılır (önce his, sonra gelir).

---

## 6. Kaynaklar

[Business Wire – Block Blast Q1 2026 #1](https://www.businesswire.com/news/home/20260423998721/en/Block-Blast-Ends-Q1-2026-as-the-No.-1-Most-Downloaded-Mobile-Game-Worldwide) ·
[Business of Apps – Most Popular Mobile Games 2026](https://www.businessofapps.com/data/most-popular-mobile-games/) ·
[Talk Android – Block Blast #1 puzzle](https://www.talkandroid.com/524709-why-block-blast-is-officially-the-worlds-no-1-most-downloaded-mobile-puzzle-game-for-stress-free-downtime/) ·
[Game Growth Advisor – Hybrid Casual 2026](https://gamegrowthadvisor.com/blog/2026-04-16-hybrid-casual-game-design-strategy-2026/) ·
[MonetizeMore – AdMob Playbook 2026](https://www.monetizemore.com/blog/admob-monetization/) ·
[Audiencelab – Ads vs IAP 2026](https://audiencelab.ai/blog/mobile-game-monetization-strategies) ·
[Cinevva – Casual Games Trends 2026](https://app.cinevva.com/guides/casual-games-trends-2026) ·
[Yield Solutions – Casual vs Hypercasual monetization](https://www.yieldsolutions.com/blog/monetizing-casual-games-vs-hypercasual-games-a-publishers-breakdown)

---

*Not: Önceki konsept (KârNot trade günlüğü) istek üzerine kaldırıldı; git geçmişinde (`21764c0`) duruyor, istenirse geri getirilebilir.*
