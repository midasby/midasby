// Dil katmanı: cihaz Türkçe ise Türkçe, aksi halde İngilizce.
// Oyunda çok az metin var — blok bulmacanın global gücü de bu.

import { getLocales } from 'expo-localization';

const STRINGS = {
  tr: {
    title: 'BLOK PATLAT!',
    gameOver: 'Oyun Bitti',
    newRecord: '🎉 YENİ REKOR! 🎉',
    best: 'En iyi',
    playAgain: 'YENİDEN OYNA',
    watchContinue: '🎬 REKLAM İZLE & DEVAM ET',
    continueFree: '▶️ DEVAM ET',
    reviveHint: 'tahta temizlenir, skorun korunur',
  },
  en: {
    title: 'BLOCK POP!',
    gameOver: 'Game Over',
    newRecord: '🎉 NEW RECORD! 🎉',
    best: 'Best',
    playAgain: 'PLAY AGAIN',
    watchContinue: '🎬 WATCH AD & CONTINUE',
    continueFree: '▶️ CONTINUE',
    reviveHint: 'board clears, your score is kept',
  },
};

let lang = 'en';
try {
  const code = getLocales()[0]?.languageCode;
  if (code === 'tr') lang = 'tr';
} catch (e) {
  // dil algılanamazsa İngilizce kal
}

export const t = (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
export const currentLang = () => lang;
