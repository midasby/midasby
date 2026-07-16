import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayKey } from './calc';

const PROFILE_KEY = 'callens.profile.v1';
const MEALS_PREFIX = 'callens.meals.'; // + YYYY-MM-DD
const AI_COUNT_PREFIX = 'callens.aicount.'; // + YYYY-MM-DD

export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    // yerel kayıt hatası akışı bozmasın
  }
}

export async function loadMeals(dateKey) {
  try {
    const raw = await AsyncStorage.getItem(MEALS_PREFIX + dateKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveMeals(dateKey, meals) {
  try {
    await AsyncStorage.setItem(MEALS_PREFIX + dateKey, JSON.stringify(meals));
  } catch (e) {
    // no-op
  }
}

// Son n günün öğünleri (bugün dahil), eskiden yeniye sıralı: [{key, date, meals}]
export async function loadRecentDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: todayKey(d), date: new Date(d) });
  }
  try {
    const results = await AsyncStorage.multiGet(days.map((d) => MEALS_PREFIX + d.key));
    return days.map((d, i) => ({ ...d, meals: results[i][1] ? JSON.parse(results[i][1]) : [] }));
  } catch (e) {
    return days.map((d) => ({ ...d, meals: [] }));
  }
}

export async function getAiCount(dateKey) {
  try {
    const raw = await AsyncStorage.getItem(AI_COUNT_PREFIX + dateKey);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    return 0;
  }
}

export async function bumpAiCount(dateKey) {
  const n = (await getAiCount(dateKey)) + 1;
  try {
    await AsyncStorage.setItem(AI_COUNT_PREFIX + dateKey, String(n));
  } catch (e) {
    // no-op
  }
  return n;
}

const WEIGHTS_KEY = 'callens.weights.v1';

// Kilo günlüğü: [{date:'YYYY-MM-DD', kg}] — tarihe göre artan sıralı.
export async function loadWeights() {
  try {
    const raw = await AsyncStorage.getItem(WEIGHTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Bugünün kaydını ekler/günceller; güncel listeyi döndürür.
export async function logWeight(kg) {
  const list = (await loadWeights()).filter((w) => w.date !== todayKey());
  list.push({ date: todayKey(), kg });
  list.sort((a, b) => (a.date < b.date ? -1 : 1));
  try {
    await AsyncStorage.setItem(WEIGHTS_KEY, JSON.stringify(list));
  } catch (e) {
    // no-op
  }
  return list;
}

export async function clearAll() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith('callens.')));
  } catch (e) {
    // no-op
  }
}
