import {MealLog} from '../models/MealLog.model.js';
import { success, created, notFound, error } from '../utils/response.utils.js';
// ── GET /meals?date=YYYY-MM-DD ─────────────────────────────
const getMeals = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const meals = await MealLog.find({ user: req.user._id, date }).sort({ createdAt: 1 });
    return success(res, { meals, date });
  } catch (err) { next(err); }
};

// ── POST /meals ────────────────────────────────────────────
const logMeal = async (req, res, next) => {
  try {
    const meal = await MealLog.create({ user: req.user._id, ...req.body });
    return created(res, { meal });
  } catch (err) { next(err); }
};

// ── PUT /meals/:id ─────────────────────────────────────────
const updateMeal = async (req, res, next) => {
  try {
    const meal = await MealLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!meal) return notFound(res, 'Meal not found.');
    return success(res, { meal });
  } catch (err) { next(err); }
};

// ── DELETE /meals/:id ──────────────────────────────────────
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await MealLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return notFound(res, 'Meal not found.');
    return success(res, { message: 'Meal removed.' });
  } catch (err) { next(err); }
};

// ── GET /meals/search?q= ───────────────────────────────────
const searchFoods = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    // TODO: integrate with external nutrition DB (Edamam, Open Food Facts, or your own)
    // For now, return mock results
    const mock = [
      { id: 'food_001', name: 'Oatmeal',          calories: 150, per: '100g', macros: { proteinG: 5, carbsG: 27, fatG: 3 } },
      { id: 'food_002', name: 'Grilled Chicken',  calories: 165, per: '100g', macros: { proteinG: 31, carbsG: 0, fatG: 4 } },
      { id: 'food_003', name: 'Banana',            calories: 89,  per: '100g', macros: { proteinG: 1, carbsG: 23, fatG: 0.3 } },
      { id: 'food_004', name: 'Brown Rice',        calories: 130, per: '100g', macros: { proteinG: 3, carbsG: 28, fatG: 1 } },
      { id: 'food_005', name: 'Greek Yogurt',      calories: 59,  per: '100g', macros: { proteinG: 10, carbsG: 4, fatG: 0.4 } },
    ].filter(f => f.name.toLowerCase().includes(q.toLowerCase()));

    return success(res, { results: mock, query: q });
  } catch (err) { next(err); }
};

export default { getMeals, logMeal, updateMeal, deleteMeal, searchFoods };
