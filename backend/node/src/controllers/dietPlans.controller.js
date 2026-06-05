import axios from 'axios';
import { DietPlan } from '../models/DietPlan.model.js';
import { seedTodayFromPlan } from '../services/dietPlan.service.js';
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

    // Mark this plan as the active one (deactivate others) so subsequent
    // dashboard requests pick it up via autoSeedTodayIfEmpty.
    await DietPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });
    plan.isActive = true;
    await plan.save();

    // Delegate the actual MealLog materialization to the shared helper so the
    // dashboard auto-seed and this manual endpoint stay in lock-step.
    const result = await seedTodayFromPlan(req.user._id, plan);
    if (result.reason === 'no_day_in_plan') {
      return success(res, { message: `No meals planned for ${result.day}.`, seeded: 0 });
    }
    return success(res, {
      message: `Seeded ${result.seeded} meal(s) for today (${result.day}).`,
      seeded:  result.seeded,
      day:     result.day,
    });
  } catch (err) { next(err); }
};

export default { getPlans, generatePlan, getPlan, savePlan, setActivePlan, deletePlan, seedToday };
