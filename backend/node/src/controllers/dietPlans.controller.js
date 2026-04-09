import axios from 'axios';
import { DietPlan } from '../models/DietPlan.model.js';
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
      days: generated.days,
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
const savePlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isSaved: true, title: req.body.title || 'My AI Diet Plan' },
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

export default { getPlans, generatePlan, getPlan, savePlan, deletePlan };
