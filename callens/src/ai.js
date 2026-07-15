// AI katmanı: yemek fotoğrafı → kalori/makro tahmini (Claude vision).
//
// GELİŞTİRME: EXPO_PUBLIC_ANTHROPIC_API_KEY ortam değişkeniyle doğrudan çağrı yapılır.
// ÜRETİM: API anahtarı asla uygulamaya gömülmez! Yayına çıkmadan önce bu çağrı,
// anahtarı sunucuda tutan küçük bir backend proxy'ye taşınmalıdır (README'ye bakın).
// Anahtar yoksa uygulama "demo modda" çalışır — arayüz akışı testi için sahte sonuç döner.

import Anthropic from '@anthropic-ai/sdk';
import { currentLang } from './i18n';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'claude-opus-4-8';

export const aiAvailable = !!API_KEY;

let client = null;
function getClient() {
  if (!client) {
    // dangerouslyAllowBrowser: web önizlemesi için gerekli; native'de etkisiz.
    client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  }
  return client;
}

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Short name of the dish' },
    kcal: { type: 'integer', description: 'Estimated calories for the visible portion' },
    protein_g: { type: 'integer' },
    carbs_g: { type: 'integer' },
    fat_g: { type: 'integer' },
    portion: { type: 'string', description: 'Portion description, e.g. "1 plate (~350g)"' },
    confidence: { type: 'number', description: '0-1 confidence in the estimate' },
    no_food: { type: 'boolean', description: 'true if no food is visible in the image' },
  },
  required: ['name', 'kcal', 'protein_g', 'carbs_g', 'fat_g', 'portion', 'confidence', 'no_food'],
  additionalProperties: false,
};

// Demo mod: API anahtarı yokken arayüzü test etmek için gerçekçi örnekler döndürür.
const DEMO_FOODS = {
  en: [
    { name: 'Grilled chicken with rice', kcal: 520, protein: 38, carbs: 55, fat: 14, portion: '1 plate (~400g)' },
    { name: 'Margherita pizza (2 slices)', kcal: 460, protein: 18, carbs: 58, fat: 17, portion: '2 slices (~220g)' },
    { name: 'Caesar salad', kcal: 320, protein: 22, carbs: 12, fat: 21, portion: '1 bowl (~300g)' },
  ],
  tr: [
    { name: 'Izgara tavuk ve pilav', kcal: 520, protein: 38, carbs: 55, fat: 14, portion: '1 tabak (~400g)' },
    { name: 'Karışık pide', kcal: 610, protein: 26, carbs: 68, fat: 24, portion: '1 porsiyon (~280g)' },
    { name: 'Mercimek çorbası ve ekmek', kcal: 290, protein: 13, carbs: 44, fat: 7, portion: '1 kase + 1 dilim' },
  ],
};
let demoIndex = 0;

export async function analyzeFoodPhoto({ base64, mediaType = 'image/jpeg' }) {
  const lang = currentLang();

  if (!aiAvailable) {
    // demo mod — kısa gecikmeyle gerçek analiz hissi
    await new Promise((r) => setTimeout(r, 1200));
    const list = DEMO_FOODS[lang] || DEMO_FOODS.en;
    const food = list[demoIndex++ % list.length];
    return { ...food, confidence: 0.9, demo: true };
  }

  const prompt =
    `Estimate the nutrition of the food in this photo for the visible portion. ` +
    `Respond with the dish name in ${lang === 'tr' ? 'Turkish' : 'English'}. ` +
    `Be realistic about portion size; when unsure, estimate conservatively and lower the confidence.`;

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { format: { type: 'json_schema', schema: RESULT_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('refused');
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  const data = JSON.parse(textBlock.text);
  if (data.no_food) {
    const err = new Error('no_food');
    err.code = 'no_food';
    throw err;
  }

  return {
    name: data.name,
    kcal: data.kcal,
    protein: data.protein_g,
    carbs: data.carbs_g,
    fat: data.fat_g,
    portion: data.portion,
    confidence: data.confidence,
    demo: false,
  };
}
