import {User} from '../models/User.model.js';
import { WeightHistory } from '../models/DietPlan.model.js';
import { success, error } from '../utils/response.utils.js';
import { computeCalorieTarget } from '../utils/tdee.utils.js';

const todayStr = () => new Date().toISOString().slice(0, 10);

// Append a new weight entry, or overwrite the same-day entry if one exists.
// Keeps the timeline one-per-day so the chart isn't noisy after a profile edit.
async function recordWeight(userId, kg) {
  if (!kg) return;
  const today = todayStr();
  const doc = await WeightHistory.findOne({ user: userId });
  if (!doc) {
    await WeightHistory.create({ user: userId, entries: [{ date: today, kg }] });
    return;
  }
  const sameDay = doc.entries.find(e => e.date === today);
  if (sameDay) sameDay.kg = kg;
  else doc.entries.push({ date: today, kg });
  await doc.save();
}

// ── GET /users/me ──────────────────────────────────────────
const getProfile = (req, res) => success(res, { user: req.user });

// ── PUT /users/me ──────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'age', 'gender', 'metrics', 'notifications'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    // Recompute TDEE if anything that feeds into it has changed.
    // Merge incoming values with current user record so we always have a full set.
    const tdeeInputsChanged =
      updates.age !== undefined || updates.gender !== undefined || updates.metrics !== undefined;

    if (tdeeInputsChanged) {
      const age     = updates.age     ?? req.user.age;
      const gender  = updates.gender  ?? req.user.gender;
      const metrics = { ...req.user.metrics?.toObject?.() ?? req.user.metrics, ...(updates.metrics || {}) };
      const goal    = req.user.preferences?.primaryGoal;
      const computed = computeCalorieTarget(metrics, age, gender, goal);
      if (computed) updates['preferences.dailyCalorieTarget'] = computed;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });

    // Mirror current weight into WeightHistory whenever the user changes it.
    if (req.body.metrics?.currentWeightKg) {
      await recordWeight(req.user._id, req.body.metrics.currentWeightKg);
    }

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

    // Recompute TDEE when goal changes — adjustment delta depends on it.
    // Skip if client explicitly sent a dailyCalorieTarget (manual override wins).
    if (primaryGoal !== undefined && dailyCalorieTarget === undefined) {
      const computed = computeCalorieTarget(req.user.metrics, req.user.age, req.user.gender, primaryGoal);
      if (computed) prefs['preferences.dailyCalorieTarget'] = computed;
    }

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
