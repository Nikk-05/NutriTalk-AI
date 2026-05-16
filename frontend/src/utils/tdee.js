/**
 * tdee.js — TDEE calculation and goal-aware calorie recommendations.
 *
 * Formula: Mifflin-St Jeor BMR × activity multiplier
 *   Male:   BMR = 10w + 6.25h - 5a + 5
 *   Female: BMR = 10w + 6.25h - 5a - 161
 *   Other:  midpoint of above two
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary:          1.2,
  lightly_active:     1.375,
  moderately_active:  1.55,
  very_active:        1.725,
}

// Goal → kcal adjustment relative to TDEE
const GOAL_ADJUSTMENTS = {
  'Weight Loss':     -450,  // ~0.5 kg/week deficit
  'Muscle Gain':     +300,  // lean bulk surplus
  'Maintenance':       0,
  'Improved Energy': -100,  // very light deficit
  'Better Sleep':      0,
}

/**
 * Computes TDEE from the Redux user object.
 * Returns null if the profile is incomplete (missing weight, height, or age).
 */
export function calculateTDEE(user) {
  const weight   = user?.metrics?.currentWeightKg
  const height   = user?.metrics?.heightCm
  const age      = user?.age
  const gender   = user?.gender
  const activity = user?.metrics?.activityLevel || 'moderately_active'

  if (!weight || !height || !age) return null

  let bmr
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  } else {
    // 'other' or 'prefer_not_to_say' — average of male and female formula
    bmr = 10 * weight + 6.25 * height - 5 * age - 78
  }

  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity] ?? 1.55))
}

/**
 * Returns the recommended daily calorie target for a given goal and TDEE.
 * Clamps to 1200–3500 to stay in a safe physiological range.
 */
export function getGoalCalories(tdee, goal) {
  if (!tdee) return null
  const adjustment = GOAL_ADJUSTMENTS[goal] ?? 0
  return Math.min(3500, Math.max(1200, Math.round(tdee + adjustment)))
}

/**
 * Returns a warning object { type: 'error'|'warning'|'info', msg: string }
 * when the user's chosen calorie level conflicts with their goal, or null if fine.
 *
 * Thresholds:
 *   Weight Loss:
 *     calories >= TDEE           → error   (no deficit at all)
 *     calories <= TDEE - 900     → warning (extreme deficit, muscle loss risk)
 *     TDEE - 150 <= cal < TDEE   → info    (deficit too mild, very slow progress)
 *
 *   Muscle Gain:
 *     calories < TDEE            → error   (deficit — muscle gain impossible)
 *     calories >= TDEE + 700     → warning (large surplus, excess fat gain)
 *
 *   Maintenance:
 *     |calories - TDEE| > 300    → info    (drifting far from maintenance)
 */
export function getCalorieWarning(calories, tdee, goal) {
  if (!tdee || !calories) return null

  const deficit  = tdee - calories   // positive = deficit, negative = surplus
  const surplus  = calories - tdee   // positive = surplus, negative = deficit

  switch (goal) {
    case 'Weight Loss':
      if (calories >= tdee)
        return { type: 'error', msg: `At or above your TDEE (${tdee} kcal) — you won't lose weight. Reduce by at least 300 kcal.` }
      if (deficit >= 900)
        return { type: 'warning', msg: `Deficit of ${deficit} kcal/day is aggressive. High risk of muscle loss and fatigue. Aim for 300–600 kcal below TDEE.` }
      if (deficit < 150)
        return { type: 'info', msg: `Only a ${deficit} kcal deficit — weight loss will be very slow. Try ${tdee - 400} kcal for steady progress.` }
      return null

    case 'Muscle Gain':
      if (calories < tdee)
        return { type: 'error', msg: `You're ${deficit} kcal below your TDEE. A calorie surplus is required to build muscle.` }
      if (surplus >= 700)
        return { type: 'warning', msg: `Surplus of ${surplus} kcal/day is high. Excess calories will likely be stored as fat. Aim for 200–400 kcal above TDEE.` }
      return null

    case 'Maintenance':
      if (Math.abs(deficit) > 300)
        return { type: 'info', msg: `${Math.abs(deficit)} kcal ${deficit > 0 ? 'below' : 'above'} your TDEE (${tdee} kcal). For true maintenance, aim closer to ${tdee} kcal.` }
      return null

    default:
      return null
  }
}
