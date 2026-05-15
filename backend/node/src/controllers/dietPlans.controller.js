import axios from 'axios';
import { DietPlan } from '../models/DietPlan.model.js';
import { MealLog } from '../models/MealLog.model.js';
import { success, created, notFound, serverError } from '../utils/response.utils.js';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ── GET /diet-plans ────────────────────────────────────────
const getPlans = async (req, res, next) => {
  try {
    const plans = await DietPlan.find({ user: req.user._id, isSaved: true }).sort({ createdAt: -1 });
    return success(res, { plans });
  } catch (err) { next(err); }
};

// ── POST /diet-plans/generate ──────────────────────────────
// Calls FastAPI AI service to generate weekly plan
const generatePlan = async (req, res, next) => {
  try {
    const { goal, dietaryRestriction, dailyCalorieTarget, cuisinePreferences, days = 7 } = req.body;

    // Forward to FastAPI with user context
    const aiResponse = await axios.post(`${AI_URL}/api/diet-plan/generate`, {
      goal,
      dietary_restriction: dietaryRestriction,
      daily_calorie_target: dailyCalorieTarget,
      cuisine_preferences: cuisinePreferences || [],
      days,
    });

    const generated = aiResponse.data;

    // Save temp plan to DB (unsaved until user explicitly saves)
    const plan = await DietPlan.create({
      user: req.user._id,
      goal,
      dietaryRestriction,
      dailyCalorieTarget,
      cuisinePreferences,
      totalDays: days,
      isSaved: false,
      days: generated.data.days,
    });


    return created(res, { plan });
  } catch (err) {
    if (err.response) {
      return serverError(res, 'AI service returned an error generating the plan.');
    }
    next(err);
  }
};

// ── GET /diet-plans/:id ────────────────────────────────────
const getPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return notFound(res, 'Diet plan not found.');
    return success(res, { plan });
  } catch (err) { next(err); }
};

// ── POST /diet-plans/:id/save ──────────────────────────────
// Saves the plan and marks it as the active plan for this user.
const savePlan = async (req, res, next) => {
  try {
    // Deactivate all other plans for this user first
    await DietPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });

    const plan = await DietPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isSaved: true, isActive: true, title: req.body.title || 'My AI Diet Plan' },
      { new: true }
    );
    if (!plan) return notFound(res, 'Plan not found.');
    return success(res, { plan });
  } catch (err) { next(err); }
};

// ── PATCH /diet-plans/:id/set-active ──────────────────────
// Marks one plan as active and deactivates all others for this user.
const setActivePlan = async (req, res, next) => {
  try {
    await DietPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });
    const plan = await DietPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isSaved: true },
      { isActive: true },
      { new: true }
    );
    if (!plan) return notFound(res, 'Plan not found.');
    return success(res, { plan });
  } catch (err) { next(err); }
};

// ── DELETE /diet-plans/:id ─────────────────────────────────
const deletePlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return notFound(res, 'Plan not found.');
    return success(res, { message: 'Plan deleted.' });
  } catch (err) { next(err); }
};

// ── POST /diet-plans/:id/seed-today ───────────────────────────
// Finds today's day in the saved plan and creates MealLog entries
// (logged: false = planned but not yet eaten) so the dashboard can
// display the day's meals without the user manually logging each one.
// Idempotent — skips any meal that is already in MealLog for today.
const seedToday = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return notFound(res, 'Plan not found.');

    const today   = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // "Monday"

    // Match today's day name against the plan's days array
    const dayData = plan.days.find(d => d.day?.toLowerCase() === dayName.toLowerCase());
    if (!dayData) return success(res, { message: `No meals planned for ${dayName}.`, seeded: 0 });

    // Remove any previously planned (unlogged) meals for today so the new active
    // plan replaces them cleanly. Meals the user already marked as eaten are kept.
    await MealLog.deleteMany({ user: req.user._id, date: today, logged: false });

    // Mark this plan as the active one (deactivate others)
    await DietPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });
    plan.isActive = true;
    await plan.save();

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    let seeded = 0;

    for (const type of mealTypes) {
      const meal = dayData.meals?.[type];
      if (!meal?.name) continue;

      await MealLog.create({
        user:     req.user._id,
        date:     today,
        type,
        name:     meal.name,
        calories: meal.calories || 0,
        logged:   false, // planned, not yet eaten — user marks true when they eat it
        macros:   { proteinG: meal.microNutrients?.protein || 0, carbsG: meal.microNutrients?.carbs || 0, fatG: meal.microNutrients?.fats || 0, fiberG: meal.microNutrients?.fiber || 0 },
      });
      seeded++;
    }

    return success(res, { message: `Seeded ${seeded} meal(s) for today (${dayName}).`, seeded, day: dayName });
  } catch (err) { next(err); }
};

export default { getPlans, generatePlan, getPlan, savePlan, setActivePlan, deletePlan, seedToday };
