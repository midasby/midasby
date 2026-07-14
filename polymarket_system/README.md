# Polymarket Araştırması ve Fırsat Tarayıcı Sistemi

## Önce dürüst gerçek

Araştırmanın en önemli bulgusu şu: **Dune verilerine göre Polymarket cüzdanlarının
sadece ~%7,6'sı kârda.** Yaklaşık 120 bin kişi para kazanırken 1,5 milyondan fazla
kişi para kaybediyor. "Çok yüksek oranda kazanç garantisi" veren bir sistem yoktur;
öyle bir şey vaat eden herkes ya yanılıyor ya da dolandırıyordur.

Kazanan azınlık **tahmin yaparak değil**, üç yapısal kenardan para kazanıyor:

### 1. Arbitraj (matematiksel, "garanti" kenar)
- **Binary arbitraj:** Bir piyasada YES + NO fiyat toplamı 1$'ın altına düşerse,
  ikisini birden alan kişi çözümde kesin 1$ alır → aradaki fark garanti kâr.
- **Negatif-risk arbitrajı:** Çok adaylı piyasalarda (seçim gibi) tüm YES'lerin
  toplamı < 1 veya tüm NO'ların toplamı < n−1 ise set halinde alım garanti kâr verir.
- **Platformlar arası arbitraj:** Aynı olayın Polymarket ve Kalshi'deki fiyat farkı.

Sofistike ekipler bu yolla toplamda ~40 milyon $ çıkardı. **Ama:** 2024'te ortalama
12,3 saniye açık kalan arbitraj pencereleri 2026'da ortalama **2,7 saniyeye** düştü
ve kârın %73'ünü 100 milisaniyenin altında işlem yapan botlar kapıyor. Elle yakalamak
neredeyse imkânsız; ev kullanıcısının botu da hız yarışında genelde kaybediyor.

### 2. Piyasa yapıcılık (spread toplama)
Az likit piyasalarda iki yönlü kotasyon verip alış-satış farkını toplamak.
İstikrarlı ama **garanti değil** — haber çıktığında yanlış tarafta envanterle
kalma riski var.

### 3. Bilgi/hız kenarı
Örneğin kripto 15-dakika piyasalarında Polymarket fiyatının Binance spot
momentumundan birkaç saniye geride kalmasını sömüren botlar. Bu tamamen
altyapı yarışıdır.

**Sonuç:** Gerçekçi hedef "çok yüksek oran" değil; düşük riskli, küçük ama pozitif
kenarları disiplinle toplamaktır. Kaybetmeyi göze alamayacağın parayla asla girme.

---

## Bu depodaki sistem ne yapar?

`polymarket_system/` — Polymarket'in **halka açık, anahtarsız** API'lerini
(Gamma + CLOB) kullanan, **sadece okuma yapan** bir fırsat tarayıcısı:

| Dosya | Görev |
|---|---|
| `api.py` | Gamma/CLOB istemcisi: aktif piyasalar + emir defterleri |
| `scanner.py` | 3 tarayıcı: binary arbitraj, negatif-risk arbitraj, piyasa yapıcılık adayları |
| `paper.py` | Kâğıt portföy: fırsatları sanal parayla işler, getiriyi ölçer |
| `demo.py` | İnternetsiz test için sentetik veri |
| `main.py` | Komut satırı arayüzü |

Gerçek emir **göndermez**, cüzdan/özel anahtar **istemez**. Önce kâğıt üstünde
stratejinin gerçekten kenar bulup bulmadığını ölç, sonra karar ver.

## Kurulum ve kullanım

```bash
cd polymarket_system
pip install -r requirements.txt

python main.py scan                  # canlı tarama (internet gerekir)
python main.py scan --demo           # sentetik veriyle çevrimdışı test
python main.py scan --paper          # bulunan arbitrajları kâğıt portföye işle
python main.py watch --every 30      # 30 sn'de bir sürekli tara
python main.py paper                 # kâğıt portföy özeti
```

Önemli parametreler:
- `--min-edge 0.01` → adet başına en az 1 sent garanti kenar iste (gürültüyü eler)
- `--limit 500` → daha çok piyasa tara (rate limit'e dikkat)

## Riskler ve sınırlar

1. **Hız:** Bu tarayıcı saniyeler mertebesinde çalışır; HFT botlarının kaptığı
   2-3 saniyelik pencerelerin çoğunu kaçırır. Bulduğu fırsatlar genelde daha az
   likit, daha uzun yaşayan olanlardır.
2. **Sermaye kilidi:** Arbitraj kârı piyasa **çözülünce** gerçekleşir; para o
   zamana kadar kilitli kalır (getiriyi yıllıklaştırırken bunu hesaba kat).
3. **Kısmi dolum:** Emrin bir bacağı dolar, diğeri kaçarsa arbitraj yönlü bahse
   dönüşür — gerçek uygulamada FOK (fill-or-kill) emir kullanılmalı.
4. **Hukuk:** Polymarket bazı ülkelerde erişime kapalı/kısıtlı. Kendi ülkendeki
   yasal durumu kontrol etmek senin sorumluluğun.
5. **Bu yatırım tavsiyesi değildir.** Araç eğitim/araştırma amaçlıdır.

## Kaynaklar

- [Polymarket API dokümantasyonu](https://docs.polymarket.com/api-reference/introduction)
- [Yahoo Finance — Arbitraj botları Polymarket'te milyonlar kazanıyor](https://finance.yahoo.com/news/arbitrage-bots-dominate-polymarket-millions-100000888.html)
- [HTX Insights — Polymarket arbitraj panoraması: 5 ana strateji](https://www.htx.com/news/polymarket-arbitrage-panorama-five-mainstream-strategies-and-BnYkNbEA/)
- [QuantVPS — Polymarket HFT: AI ile arbitraj ve fiyatlama hatası tespiti](https://www.quantvps.com/blog/polymarket-hft-traders-use-ai-arbitrage-mispricing)
- [Medium/ILLUMINATION — Botların 2026'da gerçekten kâr ettiği 4 strateji](https://medium.com/illumination/beyond-simple-arbitrage-4-polymarket-strategies-bots-actually-profit-from-in-2026-ddacc92c5b4f)
- [Cryptonews — Polymarket stratejileri 2026 rehberi](https://cryptonews.com/cryptocurrency/polymarket-strategies/)
- [Chainstack — Geliştiriciler için Polymarket API](https://chainstack.com/polymarket-api-for-developers/)
