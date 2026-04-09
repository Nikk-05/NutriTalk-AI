import express from 'express';
import ctrl from '../controllers/subscriptions.controller.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

// Stripe webhook needs raw body — must come BEFORE express.json()
router.route('/webhook').post(express.raw({ type: 'application/json' }), ctrl.handleWebhook);

router.route('/plans').get(ctrl.getPlans);
router.route('/current').get(protect, ctrl.getCurrent);
router.route('/checkout').post(protect, ctrl.createCheckout);
router.route('/cancel').post(protect, ctrl.cancelSubscription);
router.route('/portal').post(protect, ctrl.createPortalSession);

export default router;