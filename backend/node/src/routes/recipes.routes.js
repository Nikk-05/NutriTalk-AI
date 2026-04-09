import express from 'express';
import { protect } from '../middleware/auth.js';
import { success } from '../utils/response.utils.js';

const router = express.Router()
// Placeholder recipes controller since recipes are largely read-only
// In production these would come from a curated DB seeded from external sources

const RECIPES = [
  { id: 'r_001', name: 'Spiced Chickpea & Quinoa Power Bowl', imageUrl: '', prepTimeMin: 18, tags: ['Vegan', 'High-Protein'], macrosPerServing: { calories: 480, proteinG: 24, carbsG: 62, fatG: 12, fiberG: 10 } },
  { id: 'r_002', name: 'Grilled Salmon with Asparagus',       imageUrl: '', prepTimeMin: 25, tags: ['Keto', 'Omega-3'],     macrosPerServing: { calories: 520, proteinG: 38, carbsG: 8,  fatG: 32, fiberG: 4  } },
  { id: 'r_003', name: 'Avocado Toast with Poached Egg',      imageUrl: '', prepTimeMin: 10, tags: ['Vegetarian'],           macrosPerServing: { calories: 320, proteinG: 14, carbsG: 28, fatG: 18, fiberG: 8  } },
];

router.route('/').get(protect, (req, res) => {
  const { q = '', diet, maxCal } = req.query;
  let results = [...RECIPES];
  if (q) results = results.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
  if (diet) results = results.filter(r => r.tags.includes(diet));
  if (maxCal) results = results.filter(r => r.macrosPerServing.calories <= +maxCal);
  return success(res, { recipes: results });
});

router.route('/saved').get(protect, (req, res) => success(res, { recipes: [] }));

router.route('/:id').get(protect, (req, res) => {
  const recipe = RECIPES.find(r => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Recipe not found.' } });
  return success(res, { recipe });
});

router.route('/:id/save').post(protect, (req, res) => success(res, { message: 'Recipe saved.' }));

export default router;
