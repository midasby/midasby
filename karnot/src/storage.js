import AsyncStorage from '@react-native-async-storage/async-storage';

const TRADES_KEY = 'karnot.trades.v1';
const SETTINGS_KEY = 'karnot.settings.v1';

export const defaultSettings = {
  currency: '₺',
  premium: false,
};

export async function loadTrades() {
  try {
    const raw = await AsyncStorage.getItem(TRADES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveTrades(trades) {
  try {
    await AsyncStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  } catch (e) {
    // yerel kayıt başarısız olursa sessizce geç; sonraki kayıtta tekrar denenir
  }
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
  } catch (e) {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // no-op
  }
}

export async function clearAll() {
  await AsyncStorage.multiRemove([TRADES_KEY, SETTINGS_KEY]);
}
