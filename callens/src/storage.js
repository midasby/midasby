import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function clearAll() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith('callens.')));
  } catch (e) {
    // no-op
  }
}
