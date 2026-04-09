import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  name: { type: String, required: true, trim: true },
  servings: { type: Number, default: 1 },
  foodItemId: { type: String, default: null }, // ref to food database
  calories: { type: Number, required: true },
  macros: {
    proteinG: { type: Number, default: 0 },
    carbsG:   { type: Number, default: 0 },
    fatG:     { type: Number, default: 0 },
    fiberG:   { type: Number, default: 0 },
  },
  imageUrl: { type: String, default: null },
  logged: { type: Boolean, default: true },
}, { timestamps: true });

export const MealLog = mongoose.model('MealLog', mealLogSchema);
