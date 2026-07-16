// Ses katmanı: expo-audio üzerinden kısa efektler.
// Ses dosyaları scripts/gen_sounds.js ile sentezlenir (telifsiz).
// Herhangi bir hata oyunu asla durdurmaz; ses sessizce devre dışı kalır.

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SOURCES = {
  place: require('../assets/sfx/place.wav'),
  clear: require('../assets/sfx/clear.wav'),
  combo: require('../assets/sfx/combo.wav'),
  gameover: require('../assets/sfx/gameover.wav'),
  record: require('../assets/sfx/record.wav'),
};

let players = {};
let enabled = true;

export async function initSounds() {
  try {
    // iOS'ta sessiz anahtar açıkken de oyun sesi duyulsun
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch (e) {
    // web/emülatörde desteklenmeyebilir
  }
  try {
    for (const [name, src] of Object.entries(SOURCES)) {
      players[name] = createAudioPlayer(src);
    }
  } catch (e) {
    players = {};
  }
}

export function setSoundEnabled(v) {
  enabled = v;
}

export function playSound(name) {
  if (!enabled) return;
  const p = players[name];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch (e) {
    // tek bir ses hatası oyunu etkilemesin
  }
}
