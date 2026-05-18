import { MealLog } from '../models/MealLog.model.js';
import { DietPlan, WeightHistory } from '../models/DietPlan.model.js';
import { success } from '../utils/response.utils.js';

// ── GET /dashboard/summary ─────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const user = req.user;

    // Meals logged today (all — planned and eaten)
    const meals = await MealLog.find({ user: userId, date: today });

    // Consumed = only meals the user has actually eaten (logged: true)
    const loggedMeals = meals.filter(m => m.logged);
    const consumed = loggedMeals.reduce((sum, m) => sum + m.calories, 0);
    const protein = loggedMeals.reduce((sum, m) => sum + (m.macros?.proteinG || 0), 0);
    const carbs = loggedMeals.reduce((sum, m) => sum + (m.macros?.carbsG || 0), 0);
    const fats = loggedMeals.reduce((sum, m) => sum + (m.macros?.fatG || 0), 0);
    const fiber = loggedMeals.reduce((sum, m) => sum + (m.macros?.fiberG || 0), 0);

    // Macro targets = sum of ALL today's planned meals (logged or not) — the full day's plan
    const proteinTarget = meals.reduce((sum, m) => sum + (m.macros?.proteinG || 0), 0);
    const carbsTarget = meals.reduce((sum, m) => sum + (m.macros?.carbsG || 0), 0);
    const fatsTarget = meals.reduce((sum, m) => sum + (m.macros?.fatG || 0), 0);
    const fiberTarget = meals.reduce((sum, m) => sum + (m.macros?.fiberG || 0), 0);

    // Calorie target: prefer active diet plan's target, fallback to profile TDEE
    const activePlan = await DietPlan.findOne({ user: userId, isActive: true, isSaved: true }).lean();
    const target = activePlan?.dailyCalorieTarget || user.preferences?.dailyCalorieTarget || 2000;

    // Fallback macro targets when no meals are seeded (use % of calorie target)
    const macroProteinTarget = proteinTarget || Math.round(target * 0.075);
    const macroCarbsTarget = carbsTarget || Math.round(target * 0.5 / 4);
    const macroFatsTarget = fatsTarget || Math.round(target * 0.25 / 9);
    const macroFiberTarget = fiberTarget || 30;

    // Weight history (last 7 days)
    const wh = await WeightHistory.findOne({ user: userId });
    const weightHistory = wh ? wh.entries.slice(-7) : [];

    // Streak — count consecutive logged days
    const streak = await calculateStreak(userId);

    const todaysMeals = meals.map(m => ({
      id: m._id,
      type: m.type,
      name: m.name,
      calories: m.calories,
      logged: m.logged,
      imageUrl: m.imageUrl,
      // Include macros so the frontend can recalculate totals on meal toggle
      macros: {
        proteinG: m.macros?.proteinG || 0,
        carbsG: m.macros?.carbsG || 0,
        fatG: m.macros?.fatG || 0,
        fiberG: m.macros?.fiberG || 0,
      },
    }));

    return success(res, {
      date: today,
      calories: { consumed, target, remaining: Math.max(0, target - consumed), burned: 0 },
      macros: {
        protein: { consumed: protein, target: macroProteinTarget },
        carbs: { consumed: carbs, target: macroCarbsTarget },
        fats: { consumed: fats, target: macroFatsTarget },
        fiber: { consumed: fiber, target: macroFiberTarget },
      },
      hydration: { consumedMl: 0, targetMl: 2000 }, // TODO: implement hydration logging
      weightHistory,
      streak,
      activity: { steps: 0, stepGoal: 10000, activeMinutes: 0, caloriesBurned: 0 }, // TODO: wearable data
      todaysMeals,
    });
  } catch (err) { next(err); }
};

// ── GET /dashboard/weight-history ─────────────────────────
const getWeightHistory = async (req, res, next) => {
  try {
    const period = req.query.period || '7d';
    const days = period === '30d' ? 30 : 7;
    const wh = await WeightHistory.findOne({ user: req.user._id });
    const entries = wh ? wh.entries.slice(-days) : [];
    return success(res, { weightHistory: entries, period });
  } catch (err) { next(err); }
};

// ── POST /dashboard/weight (log weight) ────────────────────
const logWeight = async (req, res, next) => {
  try {
    const { kg } = req.body;
    const date = new Date().toISOString().slice(0, 10);

    let wh = await WeightHistory.findOne({ user: req.user._id });
    if (!wh) wh = new WeightHistory({ user: req.user._id, entries: [] });
    // Update or push
    const idx = wh.entries.findIndex(e => e.date === date);
    if (idx >= 0) wh.entries[idx].kg = kg;
    else wh.entries.push({ date, kg });
    await wh.save();

    // Update current weight on user
    await require('../models/User.model').findByIdAndUpdate(req.user._id, { 'metrics.currentWeightKg': kg });
    return success(res, { date, kg });
  } catch (err) { next(err); }
};

// ── Helper: calculate streak ───────────────────────────────
async function calculateStreak(userId) {
  const logs = await MealLog.distinct('date', { user: userId, logged: true });
  if (!logs.length) return { current: 0, longestEver: 0 };

  const sorted = logs.sort().reverse(); // latest first
  let current = 0;
  let d = new Date();

  for (const dateStr of sorted) {
    const expected = d.toISOString().slice(0, 10);
    if (dateStr === expected) {
      current++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return { current, longestEver: current }; // longestEver would need separate tracking
}

export default { getSummary, getWeightHistory, logWeight };
