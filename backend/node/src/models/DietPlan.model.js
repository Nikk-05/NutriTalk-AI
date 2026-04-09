import mongoose from 'mongoose';

const weightEntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  kg:   { type: Number, required: true },
});

const dietPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'AI Generated Plan' },
  goal: { type: String },
  dietaryRestriction: { type: String },
  dailyCalorieTarget: { type: Number },
  cuisinePreferences: { type: [String], default: [] },
  totalDays: { type: Number, default: 7 },
  isSaved: { type: Boolean, default: false },
  days: [
    {
      day: String,
      totalCalories: Number,
      meals: {
        breakfast: { name: String, calories: Number, recipeId: { type: String, default: null } },
        lunch:     { name: String, calories: Number, recipeId: { type: String, default: null } },
        dinner:    { name: String, calories: Number, recipeId: { type: String, default: null } },
        snack:     { name: String, calories: Number, recipeId: { type: String, default: null } },
      },
    },
  ],
}, { timestamps: true });

const weightHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  entries: [weightEntrySchema],
}, { timestamps: true });

export const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export const WeightHistory = mongoose.model('WeightHistory', weightHistorySchema);