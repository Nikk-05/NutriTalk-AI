import { MealLog } from '../models/MealLog.model.js';
import { DietPlan } from '../models/DietPlan.model.js';

// Today's date as "YYYY-MM-DD" and today's weekday name (e.g. "Monday").
function todayParts() {
  return {
    date:    new Date().toISOString().slice(0, 10),
    dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

// Materializes today's meals from a plan's day array into MealLog entries
// (logged: false → planned, not yet eaten). Removes any previously planned
// (unlogged) meals for today first so swapping plans replaces cleanly. Meals
// the user already marked as eaten (logged: true) are preserved.
//
// Returns the number of MealLog docs created plus a small status object.
export async function seedTodayFromPlan(userId, plan) {
  if (!plan) return { seeded: 0, day: null, reason: 'no_plan' };

  const { date, dayName } = todayParts();
  const dayData = plan.days?.find(d => d.day?.toLowerCase() === dayName.toLowerCase());
  if (!dayData) return { seeded: 0, day: dayName, reason: 'no_day_in_plan' };

  // Clean planned-but-not-eaten meals for today so we don't double up.
  await MealLog.deleteMany({ user: userId, date, logged: false });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const docs = [];
  for (const type of mealTypes) {
    const meal = dayData.meals?.[type];
    if (!meal?.name) continue;
    docs.push({
      user:     userId,
      date,
      type,
      name:     meal.name,
      calories: meal.calories || 0,
      logged:   false,
      macros: {
        proteinG: meal.microNutrients?.protein || 0,
        carbsG:   meal.microNutrients?.carbs   || 0,
        fatG:     meal.microNutrients?.fats    || 0,
        fiberG:   meal.microNutrients?.fiber   || 0,
      },
    });
  }
  if (docs.length) await MealLog.insertMany(docs);
  return { seeded: docs.length, day: dayName };
}

// Convenience: auto-seed today's meals for the user from whichever plan is
// currently marked active+saved. Used by the dashboard summary endpoint so
// signed-in users see their planned meals without manually triggering Sync.
// No-op if there is no active plan, or if any MealLog already exists for today
// (we only seed an empty day to avoid clobbering the user's manual logs).
export async function autoSeedTodayIfEmpty(userId) {
  const { date } = todayParts();
  const existing = await MealLog.countDocuments({ user: userId, date });
  if (existing > 0) return { seeded: 0, reason: 'meals_already_exist' };

  const activePlan = await DietPlan.findOne({ user: userId, isActive: true, isSaved: true });
  if (!activePlan) return { seeded: 0, reason: 'no_active_plan' };

  return seedTodayFromPlan(userId, activePlan);
}
