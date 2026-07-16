# 📲 Blok Patlat! — Mağazaya Yükleme Rehberi (A'dan Z'ye)

Bu rehber, oyunu **Google Play** ve **App Store**'a yüklemenin her adımını, hiç yapmamış biri için anlatır.
Sıra önemlidir; maddeleri yukarıdan aşağı takip edin.

---

## 0. Genel bakış: ne gerekiyor, ne kadar tutar?

| Gereken | Ücret | Not |
|---|---|---|
| Google Play geliştirici hesabı | **25 $ (tek seferlik)** | play.google.com/console |
| Apple Developer Program | **99 $/yıl** | developer.apple.com |
| Expo (EAS) hesabı | Ücretsiz | expo.dev — derleme bulutta yapılır, **Mac gerekmez** |
| AdMob hesabı | Ücretsiz | admob.google.com — reklam geliri buradan |
| Gizlilik politikası sayfası | Ücretsiz | GitHub Pages ile (aşağıda anlatılıyor) |

**Önerilen sıra:** Önce Google Play (ucuz, basit), sonra App Store.
**Gerçekçi takvim:** Google Play ~1-3 hafta (yeni hesap test şartı yüzünden), App Store ~1 hafta.

---

## 1. Hesapları açın

### 1a. Expo hesabı (derleme için)
1. https://expo.dev → **Sign Up** (e-posta yeterli).
2. Bilgisayarınızda terminale: `npm install -g eas-cli` → `eas login`.

### 1b. Google Play geliştirici hesabı
1. https://play.google.com/console → Google hesabınızla girin, 25 $ ödeyin.
2. Kimlik doğrulaması ister (kimlik/adres belgesi) — 1-2 gün sürebilir.
3. ⚠️ **Önemli:** Yeni bireysel hesaplarda Google, uygulamayı yayınlamadan önce
   **kapalı testte belirli sayıda testçiyle ~14 gün test** şartı koyuyor (yazım tarihinde ~12 kişi;
   güncel kural Console'da görünür). Arkadaş/aile/trading topluluğunuzdan 15-20 kişilik
   bir WhatsApp/Telegram test grubu hazırlamanız işi çok hızlandırır.

### 1c. Apple Developer (iPhone için)
1. https://developer.apple.com/programs/enroll → Apple Kimliğinizle bireysel kayıt, 99 $/yıl.
2. Onay genelde 1-2 gün.

### 1d. AdMob hesabı (gelir)
1. https://admob.google.com → hesap açın, ödeme bilgilerinizi (IBAN) girin.
2. **Uygulamalar → Uygulama ekle** ile 2 uygulama oluşturun: Android ve iOS
   ("Uygulama mağazada yayında mı?" → Hayır deyin, sonra bağlarsınız).
3. Her uygulama için 2'şer **reklam birimi** oluşturun: 1 **Geçiş reklamı (Interstitial)** + 1 **Ödüllü (Rewarded)**.
4. Elinizde şunlar olacak:
   - 2 adet **Uygulama Kimliği** (`ca-app-pub-XXXX~YYYY` — içinde `~` var)
   - 4 adet **Reklam Birimi Kimliği** (`ca-app-pub-XXXX/ZZZZ` — içinde `/` var)

---

## 2. Koddaki reklam kimliklerini değiştirin (2 dosya)

**Dosya 1 — `blokpatlat/app.json`** (en alttaki blok):
```json
"react-native-google-mobile-ads": {
  "android_app_id": "ca-app-pub-SİZİN~ANDROID_APP_ID",
  "ios_app_id": "ca-app-pub-SİZİN~IOS_APP_ID"
}
```

**Dosya 2 — `blokpatlat/src/ads.js`** (üst kısımdaki iki satır):
```js
const INTERSTITIAL_ID = 'ca-app-pub-SİZİN/GECIS_BIRIMI';
const REWARDED_ID = 'ca-app-pub-SİZİN/ODULLU_BIRIMI';
```
> Platforma göre farklı birim vermek isterseniz:
> `Platform.OS === 'ios' ? 'ca-app-pub-.../ios_birim' : 'ca-app-pub-.../android_birim'`

⚠️ Kendi reklamlarınıza **asla kendiniz tıklamayın** — AdMob hesabı kalıcı kapatır.
Test ederken test kimlikleri (şu anki varsayılan) yeterli.

---

## 3. Gizlilik politikası sayfası (zorunlu)

İki mağaza da reklam kullanan uygulamadan **herkese açık bir gizlilik politikası URL'si** ister.
Ücretsiz yöntem — GitHub Pages:
1. GitHub'da `blokpatlat-gizlilik` adında herkese açık bir depo açın.
2. İçine `index.html` olarak gizlilik metni koyun (oyun veri toplamaz; AdMob'un reklam kimliği
   kullandığını belirtir — hazır metni benden isteyebilirsiniz, 1 dakikada üretirim).
3. Depo ayarları → Pages → yayınlayın. URL'niz: `https://KULLANICI.github.io/blokpatlat-gizlilik`

---

## 4. Android derlemesi ve Google Play'e yükleme

### 4a. Derleme (bilgisayarınızda, ~15-20 dk)
```bash
cd blokpatlat
eas login                 # bir kez
eas build:configure       # bir kez — eas.json oluşturur, "All" seçin
eas build --platform android --profile production
```
- İlk seferde "keystore oluşturayım mı?" der → **Evet** (EAS saklar, siz uğraşmazsınız).
- Bittiğinde size bir **.aab** dosyası linki verir → indirin.

### 4b. Play Console'da uygulama oluşturma
1. Play Console → **Uygulama oluştur** → Ad: `Blok Patlat!` · Varsayılan dil: **İngilizce (ABD)**
   (globalde İngilizce görünsün diye) · Tür: Oyun · Ücretsiz.
2. Sol menüde **Büyüme → Mağaza kaydı**:
   - **İngilizce (varsayılan):** Ad `Block Pop!`, kısa/uzun açıklama İngilizce,
     görseller: `blokpatlat/store/en/` klasöründekiler + `assets/icon.png` (512×512'ye küçültün — Console kendisi de kabul eder).
   - **Çeviri ekle → Türkçe:** Ad `Blok Patlat!`, açıklamalar Türkçe, görseller `blokpatlat/store/` kökündekiler.
3. **Politika → Uygulama içeriği** bölümünde sırayla doldurun:
   - **Gizlilik politikası:** 3. adımdaki URL.
   - **Reklamlar:** "Evet, reklam içeriyor".
   - **İçerik derecelendirmesi:** anketi doldurun (bulmaca, şiddet yok → herkes/PEGI 3).
   - **Hedef kitle:** 13+ seçmenizi öneririm (çocuk hedeflerseniz Google'ın "Aileler" politikası
     çok daha sıkı reklam kuralı uygular).
   - **Veri güvenliği formu:** "Veri topluyor musunuz?" → Evet →
     **Cihaz veya diğer kimlikler → Reklam Kimliği** → amaç: **Reklamcılık**, "veri şifreli iletiliyor" → Evet,
     "silme talebi" → Hayır (üçüncü taraf AdMob). Oyunun kendisi hiçbir kişisel veri toplamıyor; skor cihazda.
4. **Test et ve yayınla → Kapalı test → Sürüm oluştur** → .aab dosyasını sürükleyin →
   test grubuna testçilerinizin e-postalarını ekleyin → yayınla.
5. Test şartı süresi dolunca (Console'da sayaç görünür) → **Üretime geç** düğmesi açılır → basın.
   İnceleme genelde 1-3 gün, sonrasında 🎉 **oyun Google Play'de**.

---

## 5. iPhone derlemesi ve App Store'a yükleme

### 5a. Derleme
```bash
eas build --platform ios --profile production
```
- Apple hesabınızla giriş ister; **sertifika/provizyon işlerinin hepsini EAS halleder** (Mac gerekmez).

### 5b. App Store Connect
1. https://appstoreconnect.apple.com → **Uygulamalarım → +** → Yeni Uygulama:
   Ad `Block Pop!` · Bundle ID: `com.midasby.blokpatlat` (listede görünür) · SKU: `blokpatlat`.
2. Derlemeyi göndermek için: `eas submit --platform ios` (build listesinden seçersiniz — dosya indirme yok).
3. App Store Connect'te sürüm sayfası:
   - **Ekran görüntüleri:** iPhone 6.7" için **1290×2796** ister — elimizdeki 1080×1920'ler doğrudan
     olmaz; bana "iOS boyutlarında üret" deyin, aynı tasarımları o boyutta üreteyim.
   - Açıklama/anahtar kelimeler (EN varsayılan; **Türkçe yerelleştirme** sekmesinden TR ekleyin).
   - Gizlilik politikası URL'si + **App Privacy** formu: "Identifiers → Advertising Data → used for advertising".
   - Yaş: 4+.
4. **İncelemeye gönder.** Apple incelemesi genelde 1-2 gün. Reddederse korkmayın — nedenini yazar,
   düzeltip tekrar gönderirsiniz (ilk uygulamada 1-2 ret normaldir).

---

## 6. Yayın sonrası (önemli!)

1. **AdMob'u mağazaya bağlayın:** AdMob → Uygulamalar → uygulamanız → "Mağaza ile bağla".
   Onaylanana kadar reklam doluluk oranı düşük olabilir; birkaç gün sabır.
2. **app-ads.txt** (önerilir): AdMob'un verdiği satırı gizlilik sayfanızın domain'ine koyun — gelir doğrulaması artar.
3. **Güncelleme çıkarma:**
   - Kod değişikliği yaptınız → `app.json`'da `version`'ı artırın (ör. 1.1.1) →
     `eas build` → mağazalara yeniden yükleyin.
   - Yalnızca JS/görsel değişikliği için **EAS Update** (OTA) ile mağaza incelemesi olmadan anında güncelleme de mümkün (`eas update`).
4. **İlk 2 hafta yorumlara cevap verin** — mağaza sıralamasını doğrudan etkiler.
5. Pazarlama planı için: [`ARASTIRMA_VE_PLAN.md`](./ARASTIRMA_VE_PLAN.md) 5. bölüm (ASO + TikTok stratejisi).

---

## Sık takılınan yerler

| Sorun | Çözüm |
|---|---|
| `eas build` "keystore" soruyor | Evet deyin; EAS oluşturur ve saklar |
| Play Console "kapalı test şartı" | Test grubunuzu önceden hazırlayın; süre dolmadan üretim açılmaz |
| Apple "missing compliance" uyarısı | Şifreleme sorusuna "standart/muaf" (oyun özel şifreleme kullanmıyor) |
| Reklamlar görünmüyor | AdMob-mağaza bağlantısı onaylanana kadar normaldir; test kimlikleriyle deneyin |
| "Version code already used" | `app.json` → `version` artırın, yeniden derleyin |

---

*Sonraki adımda yardım isterseniz: iOS boyutunda ekran görüntüleri, gizlilik politikası metni,
mağaza açıklama metinleri (TR+EN ASO uyumlu) — hepsini üretebilirim.*
