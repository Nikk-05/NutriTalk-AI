import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['meal_reminder', 'streak_milestone', 'weekly_report', 'goal_achieved', 'plan_ready', 'wearable_synced'],
    required: true,
  },
  title:  { type: String, required: true },
  body:   { type: String, required: true },
  read:   { type: Boolean, default: false, index: true },
  link:   { type: String, default: null },
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
