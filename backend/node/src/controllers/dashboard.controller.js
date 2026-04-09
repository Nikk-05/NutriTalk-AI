import {MealLog} from '../models/MealLog.model.js';
import { WeightHistory } from '../models/DietPlan.model.js';
import { success } from '../utils/response.utils.js';

// ── GET /dashboard/summary ─────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const user = req.user;

    // Meals logged today
    const meals = await MealLog.find({ user: userId, date: today });

    const consumed = meals.reduce((sum, m) => sum + m.calories, 0);
    const protein  = meals.reduce((sum, m) => sum + (m.macros?.proteinG || 0), 0);
    const carbs    = meals.reduce((sum, m) => sum + (m.macros?.carbsG || 0), 0);
    const fats     = meals.reduce((sum, m) => sum + (m.macros?.fatG || 0), 0);

    const target = user.preferences?.dailyCalorieTarget || 2000;

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
    }));

    return success(res, {
      date: today,
      calories: { consumed, target, remaining: Math.max(0, target - consumed), burned: 0 },
      macros: {
        protein: { consumed: protein, target: user.preferences?.dailyCalorieTarget ? Math.round(target * 0.075) : 180 },
        carbs:   { consumed: carbs,   target: Math.round(target * 0.5 / 4) },
        fats:    { consumed: fats,    target: Math.round(target * 0.25 / 9) },
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
