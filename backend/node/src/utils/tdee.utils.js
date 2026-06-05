// Mifflin-St Jeor BMR × activity multiplier + goal adjustment.
// Single source of truth on backend — used by signup AND profile updates.
// Mirrors frontend frontend/src/utils/tdee.js for live previews only.
export function computeCalorieTarget(metrics, age, gender, goal) {
  const w = metrics?.currentWeightKg;
  const h = metrics?.heightCm;
  const activityLevel = metrics?.activityLevel || 'moderately_active';

  if (!w || !h || !age) return null;

  const multipliers = {
    sedentary: 1.2, lightly_active: 1.375,
    moderately_active: 1.55, very_active: 1.725,
  };
  const goalAdjustments = {
    'Weight Loss': -450, 'Muscle Gain': 300,
    'Maintenance': 0, 'Improved Energy': -100, 'Better Sleep': 0,
  };

  let bmr;
  if (gender === 'male')        bmr = 10*w + 6.25*h - 5*age + 5;
  else if (gender === 'female') bmr = 10*w + 6.25*h - 5*age - 161;
  else                          bmr = 10*w + 6.25*h - 5*age - 78;

  const tdee = Math.round(bmr * (multipliers[activityLevel] ?? 1.55));
  const adjustment = goalAdjustments[goal] ?? 0;
  return Math.min(3500, Math.max(1200, Math.round(tdee + adjustment)));
}
