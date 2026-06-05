// appConstants.js — single source of truth for all hardcoded values.
// Import from here instead of scattering literals across pages and components.

// ── API ─────────────────────────────────────────────────────
// URLs come from Vite env vars at build time so the production bundle can
// point at a real backend without code changes. Defaults are for local dev.
// Set these in frontend/.env (or in Cloudflare Pages project settings) — see
// frontend/.env.example for the canonical list.
export const API = {
  /** Node.js backend base URL (no trailing slash) */
  NODE_BASE_URL:  import.meta.env.VITE_NODE_BASE_URL  || 'http://localhost:3000/api',
  /** FastAPI AI-service base URL (no trailing slash) */
  AI_SERVICE_URL: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000',
}

// ── Navigation ───────────────────────────────────────────────
// Shown to authenticated users — real protected routes.
export const APP_NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat',      label: 'AI Chat'   },
  { to: '/diet-plan', label: 'Diet Plan' },
]

// Shown to visitors — anchor links into landing-page sections.
// Each `to` is a hash anchor handled by the smooth-scroll logic in Navbar.
export const MARKETING_NAV_LINKS = [
  { to: '/#features',     label: 'Features'     },
  { to: '/#how-it-works', label: 'How it Works' },
  { to: '/#pricing',      label: 'Pricing'      },
  { to: '/#faq',          label: 'FAQ'          },
]

// ── Motivational quotes (Daily Check-In modal) ──────────────
export const MOTIVATIONAL_QUOTES = [
  { text: 'Small daily improvements lead to stunning long-term results.', author: 'Robin Sharma' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'The groundwork for all happiness is good health.', author: 'Leigh Hunt' },
  { text: 'You don’t have to be extreme, just consistent.', author: '—' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'A healthy outside starts from the inside.', author: 'Robert Urich' },
  { text: 'Your body hears everything your mind says.', author: 'Naomi Judd' },
  { text: 'The only bad workout is the one that didn’t happen.', author: '—' },
  { text: 'Strive for progress, not perfection.', author: '—' },
  { text: 'Every meal is a chance to nourish your future self.', author: '—' },
]

// ── FAQ entries (Landing page FAQ section) ──────────────────
export const FAQ_ITEMS = [
  {
    q: 'Is NutriTalk really free to start?',
    a: 'Yes. The free tier gives you AI chat, basic diet planning and dashboard tracking. Upgrade only if you want advanced features like wearable integration or unlimited plan generations.',
  },
  {
    q: 'How does the AI build my plan?',
    a: 'We use Gemini 2.5 with your profile (age, weight, activity, goal, allergies and cuisine preferences) to generate a 7-day plan with macros. You can regenerate or tweak it any time.',
  },
  {
    q: 'Do I need to log every meal?',
    a: 'No. Your saved plan auto-seeds today’s meals on the dashboard. Just tick the ones you actually ate — calories and macros update instantly.',
  },
  {
    q: 'Can I use NutriTalk with dietary restrictions?',
    a: 'Yes. We support vegetarian, vegan, keto, paleo, Mediterranean and allergy-aware planning. Set them once in your profile and every plan respects them.',
  },
  {
    q: 'Is my data private?',
    a: 'Your data is stored securely and never sold. AI requests are processed for plan generation only — we don’t train models on your personal data.',
  },
]

// ── Pricing tiers (Landing page pricing section) ────────────
export const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    cadence: '/ forever',
    description: 'Everything you need to start.',
    features: [
      'AI chat (50 messages / day)',
      '1 active diet plan',
      'Calorie & macro tracking',
      '7-day weight history',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    cadence: '/ month',
    description: 'For consistent trackers.',
    features: [
      'Unlimited AI chat',
      'Unlimited plan regenerations',
      '30-day weight history',
      'Photo meal logging',
      'Priority AI response',
    ],
    cta: 'Go Pro',
    highlighted: true,
  },
  {
    name: 'Elite',
    price: '$24',
    cadence: '/ month',
    description: 'For serious athletes.',
    features: [
      'Everything in Pro',
      'Wearable data integration',
      'Custom macro targets',
      '1-on-1 nutritionist chat',
      'Advanced analytics',
    ],
    cta: 'Go Elite',
    highlighted: false,
  },
]

// ── "How it works" steps (Landing page) ─────────────────────
export const HOW_IT_WORKS_STEPS = [
  {
    icon: 'person_add',
    title: 'Tell us about you',
    description: 'Share your goals, activity level, and dietary preferences in under 2 minutes.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI builds your plan',
    description: 'Gemini-powered planner generates a 7-day meal plan tailored to your TDEE and macros.',
  },
  {
    icon: 'monitoring',
    title: 'Track & adapt',
    description: 'Tick what you ate, log your weight, and watch your progress unfold day by day.',
  },
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
  age:      { min: 13,   max: 100, step: 1   },
  height:   { min: 120,  max: 220, step: 0.5 },
  weight:   { min: 30,   max: 200, step: 0.1 },
  calories: { min: 1200, max: 5000, step: 50 },
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