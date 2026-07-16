// RevenueCat abonelik katmanı.
//
// Native modül yoksa (Expo Go / testler) katman "geliştirme moduna" düşer:
// satın alma çağrıları başarılı sayılır ki huni uçtan uca test edilebilsin.
// Gerçek derlemede (eas build) RevenueCat devreye girer.
//
// YAYIN ÖNCESİ YAPILACAKLAR:
// 1. https://app.revenuecat.com hesabı açın; iOS + Android uygulamalarını ekleyin.
// 2. App Store Connect / Play Console'da abonelik ürünlerini oluşturun
//    (önerilen: callens_yearly 29.99$, callens_monthly 5.99$) ve RevenueCat'te
//    "premium" adlı entitlement'a bağlayın; default offering'e paket olarak ekleyin.
// 3. Aşağıdaki API anahtarlarını RevenueCat panosundan alıp değiştirin.

import { Platform } from 'react-native';

let Purchases = null;
try {
  // eslint-disable-next-line global-require
  Purchases = require('react-native-purchases').default;
} catch (e) {
  Purchases = null;
}

// TODO: RevenueCat panosundaki gerçek anahtarlarla değiştirin.
const API_KEYS = {
  ios: 'appl_REVENUECAT_IOS_KEY',
  android: 'goog_REVENUECAT_ANDROID_KEY',
};

const ENTITLEMENT = 'premium';

export const purchasesSupported = !!Purchases;

export async function initPurchases() {
  if (!Purchases) return;
  try {
    await Purchases.configure({
      apiKey: Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android,
    });
  } catch (e) {
    // yapılandırma hatası satın alma dışı akışı etkilemesin
  }
}

function hasPremium(customerInfo) {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT];
}

// Mağazadan gerçek premium durumunu okur (cihaz değişikliği/yeniden kurulum sonrası).
export async function checkPremium() {
  if (!Purchases) return null; // bilinmiyor — yerel duruma güven
  try {
    return hasPremium(await Purchases.getCustomerInfo());
  } catch (e) {
    return null;
  }
}

// plan: 'yearly' | 'monthly'. Premium kazanıldıysa true döner.
export async function purchase(plan) {
  if (!Purchases) return true; // geliştirme modu: huni testi için başarılı say
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings?.current;
    const pkg =
      plan === 'yearly'
        ? current?.annual || current?.availablePackages?.find((p) => p.identifier === '$rc_annual')
        : current?.monthly || current?.availablePackages?.find((p) => p.identifier === '$rc_monthly');
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasPremium(customerInfo);
  } catch (e) {
    // kullanıcı iptali dahil — premium verilmez
    return false;
  }
}

export async function restore() {
  if (!Purchases) return false;
  try {
    return hasPremium(await Purchases.restorePurchases());
  } catch (e) {
    return false;
  }
}
