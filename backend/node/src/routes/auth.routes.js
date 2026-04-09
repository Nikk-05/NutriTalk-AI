import express from 'express';
import { body } from 'express-validator';
import ctrl from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signupRules = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.route("/signup").post(signupRules, ctrl.signup);
router.route("/login").post(loginRules, ctrl.login);
router.route("/logout").post(protect, ctrl.logout);
router.route("/refresh").post(ctrl.refresh);
router.route("/me").get(protect, ctrl.getMe);
router.route("/forgot-password").post(ctrl.forgotPassword);
router.post('/reset-password',                ctrl.resetPassword);

export default router;
