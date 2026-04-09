import express from 'express';
import ctrl from '../controllers/dietPlans.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, ctrl.getPlans);
router.route('/generate').post(protect, ctrl.generatePlan);
router.route('/:id').get(protect, ctrl.getPlan);
router.route('/:id/save').post(protect, ctrl.savePlan);
router.route('/:id').delete(protect, ctrl.deletePlan);

export default router;
