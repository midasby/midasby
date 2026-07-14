// Reklam katmanı (AdMob / react-native-google-mobile-ads).
//
// Tasarım ilkesi: native reklam modülü YOKSA (Expo Go, web, testler) bu modül
// sessizce devre dışı kalır ve oyun aynen çalışır. Reklamlar yalnızca
// `npx expo prebuild` / EAS Build ile alınan gerçek derlemede etkinleşir.
//
// ÖNEMLİ — yayına çıkmadan önce:
// 1. https://admob.google.com hesabı açıp uygulama + reklam birimleri oluşturun.
// 2. Aşağıdaki TestIds değerlerini kendi birim kimliklerinizle değiştirin.
// 3. app.json'daki android_app_id / ios_app_id alanlarını güncelleyin.

let mob = null;
try {
  // eslint-disable-next-line global-require
  mob = require('react-native-google-mobile-ads');
  if (!mob || !mob.default) mob = null;
} catch (e) {
  mob = null;
}

export const adsSupported = !!mob;

// TODO: yayında gerçek reklam birimi kimlikleriyle değiştirin.
const INTERSTITIAL_ID = mob ? mob.TestIds.INTERSTITIAL : '';
const REWARDED_ID = mob ? mob.TestIds.REWARDED : '';

// Oyun bitişleri arasında en az bu kadar geçiş reklamı beklenir.
const INTERSTITIAL_EVERY_N_GAMES = 3;

let interstitial = null;
let interstitialLoaded = false;
let rewarded = null;
let rewardedLoaded = false;
let onRewardedStateChange = () => {};
let gameOverCount = 0;

export function setOnRewardedStateChange(cb) {
  onRewardedStateChange = cb || (() => {});
}

export function isRewardedReady() {
  return rewardedLoaded;
}

function loadInterstitial() {
  try {
    const { InterstitialAd, AdEventType } = mob;
    interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      loadInterstitial(); // sonraki gösterim için önceden yükle
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
    });
    interstitial.load();
  } catch (e) {
    interstitialLoaded = false;
  }
}

function loadRewarded() {
  try {
    const { RewardedAd, RewardedAdEventType, AdEventType } = mob;
    rewarded = RewardedAd.createForAdRequest(REWARDED_ID);
    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedLoaded = true;
      onRewardedStateChange(true);
    });
    rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      rewardedLoaded = false;
      onRewardedStateChange(false);
      loadRewarded();
    });
    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      rewardedLoaded = false;
      onRewardedStateChange(false);
    });
    rewarded.load();
  } catch (e) {
    rewardedLoaded = false;
  }
}

export async function initAds() {
  if (!mob) return;
  try {
    await mob.default().initialize();
    loadInterstitial();
    loadRewarded();
  } catch (e) {
    // reklam başlatılamazsa oyun reklamsız devam eder
  }
}

// Her oyun bitişinde çağrılır; N oyunda bir yüklüyse tam ekran reklam gösterir.
export function maybeShowInterstitial() {
  gameOverCount += 1;
  if (!mob) return;
  if (gameOverCount % INTERSTITIAL_EVERY_N_GAMES !== 0) return;
  if (!interstitialLoaded) return;
  try {
    interstitial.show();
  } catch (e) {
    // gösterim hatası yutulur
  }
}

// Ödüllü reklamı gösterir; oyuncu ödülü kazanırsa true ile çözülür.
// Reklam altyapısı yoksa (Expo Go / web) test edilebilsin diye doğrudan true döner.
export function showRewarded() {
  if (!mob) return Promise.resolve(true);
  if (!rewardedLoaded) return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      const { RewardedAdEventType, AdEventType } = mob;
      let earned = false;
      const offEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      const offClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        offEarned();
        offClosed();
        resolve(earned);
      });
      rewarded.show();
    } catch (e) {
      resolve(false);
    }
  });
}
