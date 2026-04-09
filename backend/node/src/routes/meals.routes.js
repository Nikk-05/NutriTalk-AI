import express from 'express';
import ctrl from '../controllers/meals.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.route('/search').get(protect, ctrl.searchFoods);
router.route('/').get(protect, ctrl.getMeals);
router.route('/').post(protect, ctrl.logMeal);
router.route('/:id').put(protect, ctrl.updateMeal);
router.route('/:id').delete(protect, ctrl.deleteMeal);

export default router;
