import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: null },
  plan: { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
  stripeCustomerId: { type: String, select: false },
  stripeSubscriptionId: { type: String, select: false },
  refreshTokens: { type: [String], select: false },

  preferences: {
    primaryGoal: { type: String, default: 'Maintenance' },
    dietaryRestriction: { type: String, default: 'None' },
    dailyCalorieTarget: { type: Number, default: 2000 },
    cuisinePreferences: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
  },

  metrics: {
    heightCm: { type: Number, default: null },
    currentWeightKg: { type: Number, default: null },
    targetWeightKg: { type: Number, default: null },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
      default: 'moderately_active',
    },
  },

  notifications: {
    mealReminders: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    streakAlerts: { type: Boolean, default: true },
  },

  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from toJSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.stripeCustomerId;
  delete obj.stripeSubscriptionId;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
