// CalLens analiz proxy'si — Cloudflare Worker.
//
// Amaç: Anthropic API anahtarını UYGULAMADAN ÇIKARIP sunucuda tutmak.
// İstemci fotoğrafı buraya gönderir; worker Claude'u çağırıp sonucu döndürür.
// Dağıtım adımları: server/README.md
//
// Not: RESULT_SCHEMA ve istem, src/ai.js ile aynı tutulmalıdır (tek kaynak:
// proxy kullanılıyorsa istemcideki kopya devre dışıdır).

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-4-8';
const MAX_BASE64_LENGTH = 8_000_000; // ~6 MB görsel

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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/analyze') {
      return json({ error: 'not_found' }, 404);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'bad_request' }, 400);
    }

    const { base64, mediaType = 'image/jpeg', lang = 'en' } = body || {};
    if (!base64 || typeof base64 !== 'string' || base64.length > MAX_BASE64_LENGTH) {
      return json({ error: 'bad_request' }, 400);
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(mediaType)) {
      return json({ error: 'bad_media_type' }, 400);
    }

    const prompt =
      `Estimate the nutrition of the food in this photo for the visible portion. ` +
      `Respond with the dish name in ${lang === 'tr' ? 'Turkish' : 'English'}. ` +
      `Be realistic about portion size; when unsure, estimate conservatively and lower the confidence.`;

    try {
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: env.AI_MODEL || MODEL,
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

      if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 422);

      const textBlock = response.content.find((b) => b.type === 'text');
      return json(JSON.parse(textBlock.text));
    } catch (e) {
      return json({ error: 'analysis_failed' }, 502);
    }
  },
};
