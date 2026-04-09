import express from 'express';
import ctrl from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router()

router.route("/summary").get(protect, ctrl.getSummary);
router.route("/weight-history").get(protect, ctrl.getWeightHistory);
router.route("/weight").post(protect, ctrl.logWeight);

export default router;
