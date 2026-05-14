// appConstants.js — single source of truth for all hardcoded values.
// Import from here instead of scattering literals across pages and components.

// ── API ─────────────────────────────────────────────────────
export const API = {
  /** Node.js backend base URL (no trailing slash) */
  NODE_BASE_URL: 'http://localhost:3000/api',
  /** FastAPI AI-service base URL (no trailing slash) */
  AI_SERVICE_URL: 'http://localhost:8000',
}

// ── Navigation ───────────────────────────────────────────────
export const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat',      label: 'AI Chat'   },
  { to: '/diet-plan', label: 'Diet Plan' },
]

// ── User option lists ────────────────────────────────────────
// Shared by SignupPage, ProfilePage, DietPlanPage, ChatPage

export const GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Maintenance',
  'Improved Energy',
  'Better Sleep',
]

export const DIETS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Keto',
  'Paleo',
  'Mediterranean',
]

export const CUISINES = [
  'Indian',
  'Mediterranean',
  'Asian',
  'Mexican',
  'American',
  'Italian',
]

export const GENDERS = [
  { key: 'male',             label: 'Male',             icon: 'male'        },
  { key: 'female',           label: 'Female',           icon: 'female'      },
  { key: 'other',            label: 'Other',            icon: 'transgender' },
  { key: 'prefer_not_to_say',label: 'Prefer not to say',icon: 'block'       },
]

export const ACTIVITY_LEVELS = [
  { key: 'sedentary',         label: 'Sedentary',          desc: 'Little to no exercise'  },
  { key: 'lightly_active',    label: 'Lightly Active',     desc: '1–3 days / week'        },
  { key: 'moderately_active', label: 'Moderately Active',  desc: '3–5 days / week'        },
  { key: 'very_active',       label: 'Very Active',        desc: '6–7 days / week'        },
]

// ── Form defaults ────────────────────────────────────────────
export const DEFAULTS = {
  age:              25,
  gender:           'prefer_not_to_say',
  activityLevel:    'moderately_active',
  heightCm:         170,
  currentWeightKg:  70,
  targetWeightKg:   65,
  dailyCalorieTarget: 1800,
  primaryGoal:      'Weight Loss',
  dietaryRestriction: 'None',
}

// ── Slider / input range bounds ──────────────────────────────
export const RANGES = {
  age:      { min: 13,   max: 100, step: 1  },
  height:   { min: 120,  max: 220, step: 1  },
  weight:   { min: 30,   max: 200, step: 1  },
  calories: { min: 1200, max: 3200, step: 50 },
}

// ── Dashboard ────────────────────────────────────────────────
export const DASHBOARD = {
  defaultCalorieTarget: 2000,
  stepGoal:             10000,
  hydrationTargetMl:    2000,
  /** Number of days shown in the weight chart by default */
  defaultChartPeriod:   '7d',
}

// ── Diet plan ────────────────────────────────────────────────
export const DIET_PLAN = {
  /** Number of days to generate */
  planDays: 7,
  /** Meal slots rendered on each day card, in display order */
  MEAL_SLOTS: [
    { key: 'breakfast', label: 'Breakfast', icon: 'wb_sunny',     color: 'text-secondary' },
    { key: 'lunch',     label: 'Lunch',     icon: 'lunch_dining', color: 'text-primary'   },
    { key: 'dinner',    label: 'Dinner',    icon: 'nights_stay',  color: 'text-tertiary'  },
    { key: 'snack',     label: 'Snack',     icon: 'cookie',       color: 'text-outline'   },
  ],
}

// ── Chat ────────────────────────────────────────────────────
export const CHAT = {
  /** Greeting shown when the page first loads */
  WELCOME_MESSAGE: "Hello! I'm your AI Nutrition Curator. I can help you design meal plans, analyze macros, or understand the science behind your diet. What's on your mind today?",
  /** Quick-start suggestion chips */
  SUGGESTIONS: [
    { icon: 'restaurant',   title: 'Create a 1500 calorie plan', sub: 'Tailored to weight loss' },
    { icon: 'nutrition',    title: "What's in an avocado?",      sub: 'Macro breakdown'         },
    { icon: 'fitness_center', title: 'Best pre-workout meal?',   sub: 'Energy optimization'     },
  ],
}

// ── Meal type → MealCard colour mapping ─────────────────────
export const MEAL_COLOR = {
  breakfast: 'primary',
  lunch:     'secondary',
  dinner:    'muted',
  snack:     'secondary',
}