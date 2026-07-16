import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_KEY = 'blokpatlat.best.v1';
const SOUND_KEY = 'blokpatlat.sound.v1';

export async function loadBest() {
  try {
    const raw = await AsyncStorage.getItem(BEST_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    return 0;
  }
}

export async function saveBest(score) {
  try {
    await AsyncStorage.setItem(BEST_KEY, String(score));
  } catch (e) {
    // yerel kayıt başarısız olursa oyun akışını bozma
  }
}

export async function loadSoundOn() {
  try {
    const raw = await AsyncStorage.getItem(SOUND_KEY);
    return raw === null ? true : raw === '1';
  } catch (e) {
    return true;
  }
}

export async function saveSoundOn(on) {
  try {
    await AsyncStorage.setItem(SOUND_KEY, on ? '1' : '0');
  } catch (e) {
    // no-op
  }
}
