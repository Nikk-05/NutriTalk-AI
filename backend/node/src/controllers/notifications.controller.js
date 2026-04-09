import {Notification} from '../models/Notification.model.js';
import { success } from '../utils/response.utils.js';

// ── GET /notifications ─────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    return success(res, { notifications, unreadCount });
  } catch (err) { next(err); }
};

// ── PUT /notifications/:id/read ────────────────────────────
const markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    return success(res, { message: 'Marked as read.' });
  } catch (err) { next(err); }
};

// ── PUT /notifications/read-all ────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    return success(res, { message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

// ── GET /notifications/preferences ────────────────────────
const getPreferences = (req, res) => success(res, { preferences: req.user.notifications });

// ── PUT /notifications/preferences ────────────────────────
const updatePreferences = async (req, res, next) => {
  try {
    const user = await require('../models/User.model').findByIdAndUpdate(
      req.user._id,
      { $set: { notifications: req.body } },
      { new: true }
    );
    return success(res, { preferences: user.notifications });
  } catch (err) { next(err); }
};

export default { getNotifications, markRead, markAllRead, getPreferences, updatePreferences };
