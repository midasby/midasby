// Barkod → besin verisi: Open Food Facts (ücretsiz, 3M+ ürün, anahtar gerekmez).
// API v2 belgeleri: https://openfoodfacts.github.io/openfoodfacts-server/api/

import { currentLang } from './i18n';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'product_name,product_name_tr,product_name_en,generic_name,nutriments';

// OFF yanıtını normalize eder; ürün yoksa veya kalori verisi eksikse null döner.
export function parseOffProduct(json) {
  if (!json || json.status !== 1 || !json.product) return null;
  const p = json.product;
  const n = p.nutriments || {};

  // kcal alanı yoksa kJ'den çevir (1 kcal = 4.184 kJ)
  let kcal100 = n['energy-kcal_100g'];
  if (kcal100 == null && n.energy_100g != null) kcal100 = n.energy_100g / 4.184;
  if (kcal100 == null || !(kcal100 >= 0)) return null;

  const lang = currentLang();
  const name =
    (lang === 'tr' && p.product_name_tr) ||
    p.product_name ||
    p.product_name_en ||
    p.generic_name ||
    'Product';

  return {
    name: String(name).slice(0, 60),
    per100: {
      kcal: Math.round(kcal100),
      protein: Math.round(n.proteins_100g || 0),
      carbs: Math.round(n.carbohydrates_100g || 0),
      fat: Math.round(n.fat_100g || 0),
    },
  };
}

export async function lookupBarcode(code) {
  const clean = String(code).replace(/\D/g, '');
  if (clean.length < 6 || clean.length > 14) return null;
  const res = await fetch(`${OFF_BASE}/${clean}.json?fields=${FIELDS}`, {
    headers: { 'User-Agent': 'CalLens/0.3 (mobile app)' },
  });
  if (!res.ok) return null;
  return parseOffProduct(await res.json());
}

// 100g başına değerleri girilen grama ölçekler.
export function scalePer100(per100, grams) {
  const f = grams / 100;
  return {
    kcal: Math.round(per100.kcal * f),
    protein: Math.round(per100.protein * f),
    carbs: Math.round(per100.carbs * f),
    fat: Math.round(per100.fat * f),
  };
}
