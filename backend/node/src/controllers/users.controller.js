import {User} from '../models/User.model.js';
import { success, error } from '../utils/response.utils.js';

// ── GET /users/me ──────────────────────────────────────────
const getProfile = (req, res) => success(res, { user: req.user });

// ── PUT /users/me ──────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'metrics', 'notifications'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    return success(res, { user });
  } catch (err) { next(err); }
};

// ── PUT /users/me/preferences ──────────────────────────────
const updatePreferences = async (req, res, next) => {
  try {
    const { primaryGoal, dietaryRestriction, dailyCalorieTarget, cuisinePreferences, allergies } = req.body;
    const prefs = {};
    if (primaryGoal !== undefined)       prefs['preferences.primaryGoal'] = primaryGoal;
    if (dietaryRestriction !== undefined) prefs['preferences.dietaryRestriction'] = dietaryRestriction;
    if (dailyCalorieTarget !== undefined) prefs['preferences.dailyCalorieTarget'] = dailyCalorieTarget;
    if (cuisinePreferences !== undefined) prefs['preferences.cuisinePreferences'] = cuisinePreferences;
    if (allergies !== undefined)          prefs['preferences.allergies'] = allergies;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: prefs }, { new: true });
    return success(res, { user });
  } catch (err) { next(err); }
};

// ── POST /users/me/avatar ──────────────────────────────────
const uploadAvatar = async (req, res, next) => {
  try {
    // Expects multer middleware to have processed the file
    if (!req.file) return error(res, 'NO_FILE', 'No file uploaded.', 400);
    // TODO: Upload to S3/Cloudflare and store URL
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    return success(res, { user });
  } catch (err) { next(err); }
};

// ── DELETE /users/me ───────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // TODO: cascade delete all user data (meals, plans, sessions, etc.)
    return success(res, { message: 'Account deleted successfully.' });
  } catch (err) { next(err); }
};

export default { getProfile, updateProfile, updatePreferences, uploadAvatar, deleteAccount };
