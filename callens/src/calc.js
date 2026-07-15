// Kalori planı hesapları — Mifflin-St Jeor denklemi (klinik standart).

export const ACTIVITY_LEVELS = [1.2, 1.375, 1.55, 1.725];

export function bmr({ gender, age, height, weight }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

// Günlük kalori hedefi: bazal metabolizma × aktivite + hedef ayarı.
// Kilo verme -500 kcal (haftada ~0,5 kg), kas kazanma +300 kcal.
export function dailyTarget(profile) {
  const tdee = bmr(profile) * profile.activity;
  const adjust = profile.goal === 'lose' ? -500 : profile.goal === 'gain' ? 300 : 0;
  return Math.max(1200, Math.round(tdee + adjust));
}

// Makro hedefleri: %30 protein, %40 karbonhidrat, %30 yağ (gram)
export function macroTargets(kcal) {
  return {
    protein: Math.round((kcal * 0.3) / 4),
    carbs: Math.round((kcal * 0.4) / 4),
    fat: Math.round((kcal * 0.3) / 9),
  };
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function sumMeals(meals) {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function parseNum(text) {
  if (text === null || text === undefined) return NaN;
  const cleaned = String(text).trim().replace(',', '.');
  if (cleaned === '') return NaN;
  return Number(cleaned);
}
