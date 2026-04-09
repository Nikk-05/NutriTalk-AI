import express from 'express';
import ctrl from '../controllers/users.controller.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.route('/').get(protect, ctrl.getProfile);
router.route('/').put(protect, ctrl.updateProfile);
router.route('/preferences').put(protect, ctrl.updatePreferences);
router.route('/avatar').post(protect, upload.single('avatar'), ctrl.uploadAvatar);
router.route('/').delete(protect, ctrl.deleteAccount);

export default router;
