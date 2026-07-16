# CalLens Analiz Proxy'si (Cloudflare Workers)

API anahtarını uygulamadan çıkarır: istemci fotoğrafı bu uç noktaya gönderir,
worker Claude'u sunucu tarafında çağırır. Cloudflare ücretsiz katmanı günde
100.000 istek içerir — MVP için fazlasıyla yeterli.

## Dağıtım (5 dakika)

```bash
cd callens/server
npm install
npx wrangler login                          # Cloudflare hesabı (ücretsiz)
npx wrangler secret put ANTHROPIC_API_KEY   # anahtarınızı girin
npx wrangler deploy                         # → https://callens-proxy.<hesap>.workers.dev
```

## Uygulamayı proxy'ye bağlama

```bash
EXPO_PUBLIC_PROXY_URL=https://callens-proxy.<hesap>.workers.dev npx expo start
```

Proxy tanımlıyken istemci Anthropic'e doğrudan bağlanmaz; `EXPO_PUBLIC_ANTHROPIC_API_KEY`
tamamen kaldırılabilir. Öncelik sırası: proxy → doğrudan anahtar (yalnızca geliştirme) → demo mod.

## Uç nokta

`POST /analyze` — gövde: `{ "base64": "...", "mediaType": "image/jpeg", "lang": "en" }`
→ `{ name, kcal, protein_g, carbs_g, fat_g, portion, confidence, no_food }`

Hatalar: 400 (geçersiz istek), 422 (`refused`), 502 (`analysis_failed`).

## Sonraki sertleştirmeler (yayın hacmi artınca)
- Cihaz başına kota: Workers KV ile günlük sayaç (ücretsiz kullanıcı sınırının sunucu tarafı kopyası)
- `Access-Control-Allow-Origin`'i kendi alan adınıza daraltın (native istekler etkilenmez)
- RevenueCat webhook'u ile premium doğrulaması (yalnızca aboneler sınırsız çağırabilsin)
