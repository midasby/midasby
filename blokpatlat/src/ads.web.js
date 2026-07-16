// Web için reklam katmanı stub'ı: AdMob native-only olduğundan web derlemesinde
// bu dosya kullanılır (Metro, .web.js uzantısını otomatik seçer). Oyun web'de
// reklamsız çalışır; "devam et" test amaçlı serbest bırakılır.

export const adsSupported = false;

export function setOnRewardedStateChange() {}

export function isRewardedReady() {
  return false;
}

export async function initAds() {}

export function maybeShowInterstitial() {}

export function showRewarded() {
  return Promise.resolve(true);
}
