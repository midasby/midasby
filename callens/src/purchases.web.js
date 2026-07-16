// Web stub'ı: RevenueCat native-only olduğundan web derlemesinde bu dosya kullanılır.
// Satın alma akışı web önizlemesinde simüle edilir.

export const purchasesSupported = false;

export async function initPurchases() {}

export async function checkPremium() {
  return null;
}

export async function purchase() {
  return true; // önizlemede huniyi test etmek için başarılı say
}

export async function restore() {
  return false;
}
