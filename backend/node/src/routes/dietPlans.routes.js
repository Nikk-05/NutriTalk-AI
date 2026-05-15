import express from 'express';
import ctrl from '../controllers/dietPlans.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, ctrl.getPlans);
router.route('/generate').post(protect, ctrl.generatePlan);
router.route('/:id').get(protect, ctrl.getPlan).delete(protect, ctrl.deletePlan);
router.route('/:id/save').post(protect, ctrl.savePlan);
router.route('/:id/set-active').patch(protect, ctrl.setActivePlan);
router.route('/:id/seed-today').post(protect, ctrl.seedToday);

export default router;
