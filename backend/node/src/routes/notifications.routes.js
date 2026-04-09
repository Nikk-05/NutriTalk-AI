import express from 'express';
import ctrl from '../controllers/notifications.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.route('/').get(protect, ctrl.getNotifications);
router.route("/read-all").put(protect, ctrl.markAllRead);
router.route('/preferences').get(protect, ctrl.getPreferences);
router.route('/preferences').put(protect, ctrl.updatePreferences);
router.route('/:id/read').put(protect, ctrl.markRead);

export default router;
