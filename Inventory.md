# Detailed Inventory of NutriTalk-AI Project

## 1. Route Files in `backend/node/src/routes/`

### `auth.routes.js` — `/api/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Create account (with validation) |
| POST | `/login` | Authenticate user |
| POST | `/logout` | Clear session (protected) |
| POST | `/refresh` | Refresh JWT token |
| GET | `/me` | Get current user (protected) |
| POST | `/forgot-password` | Initiate password reset |
| POST | `/reset-password` | Complete password reset |

### `users.routes.js` — `/api/users`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get user profile (protected) |
| PUT | `/` | Update profile (protected) |
| PUT | `/preferences` | Update diet/goal preferences (protected) |
| POST | `/avatar` | Upload avatar with multer (protected) |
| DELETE | `/` | Delete account (protected) |

### `dashboard.routes.js` — `/api/dashboard`

| Method | Path | Description |
|---|---|---|
| GET | `/summary` | Get daily summary (calories, macros, meals, streak, weight, activity) (protected) |
| GET | `/weight-history` | Get weight entries by period (protected) |
| POST | `/weight` | Log weight entry (protected) |

### `meals.routes.js` — `/api/meals`

| Method | Path | Description |
|---|---|---|
| GET | `/search` | Search food database (protected) |
| GET | `/` | List meals for user (protected) |
| POST | `/` | Log meal entry (protected) |
| PUT | `/:id` | Update meal (protected) |
| DELETE | `/:id` | Delete meal (protected) |

### `dietPlans.routes.js` — `/api/diet-plans`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get saved plans (protected) |
| POST | `/generate` | Generate AI diet plan (protected) |
| GET | `/:id` | Get specific plan (protected) |
| DELETE | `/:id` | Delete plan (protected) |
| POST | `/:id/save` | Save generated plan (protected) |
| PATCH | `/:id/set-active` | Mark plan as active (protected) |
| POST | `/:id/seed-today` | Seed today's meals from plan (protected) |

### `recipes.routes.js` — `/api/recipes`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Search recipes with filters (protected) |
| GET | `/saved` | Get user's saved recipes (protected) |
| GET | `/:id` | Get recipe details (protected) |
| POST | `/:id/save` | Save recipe (protected) |

> Uses hardcoded in-memory `RECIPES` data.

### `notifications.routes.js` — `/api/notifications`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get notifications (protected) |
| PUT | `/read-all` | Mark all as read (protected) |
| GET | `/preferences` | Get notification preferences (protected) |
| PUT | `/preferences` | Update preferences (protected) |
| PUT | `/:id/read` | Mark single notification as read (protected) |

### `subscriptions.routes.js` — `/api/subscription`

| Method | Path | Description |
|---|---|---|
| POST | `/webhook` | Stripe webhook (raw body, no auth) |
| GET | `/plans` | Get subscription plans (public) |
| GET | `/current` | Get user's current subscription (protected) |
| POST | `/checkout` | Create Stripe checkout session (protected) |
| POST | `/cancel` | Cancel subscription (protected) |
| POST | `/portal` | Create customer portal session (protected) |

### `chats.routes.js` — `/api/chats`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get all past chats (protected) |
| POST | `/` | Create new chat (protected) |
| GET | `/:id` | Get chat details (protected) |
| PATCH | `/:id` | Update chat title (protected) |
| DELETE | `/:id` | Delete chat (protected) |
| GET | `/:id/messages` | Get chat messages (protected) |
| POST | `/:id/messages` | Send message (protected) |
| POST | `/:id/messages/stream` | Stream AI response (protected, SSE) |

---

## 2. Model Files in `backend/node/src/models/`

### `user.model.js` — User Schema

- `name` (String, required, trimmed)
- `email` (String, required, unique, lowercase)
- `password` (String, required, `select: false`)
- `avatar` (String, default: `null`)
- `age` (Number, default: `null`)
- `gender` (enum: `['male', 'female', 'other', 'prefer_not_to_say']`, default: `'prefer_not_to_say'`)
- `plan` (enum: `['free', 'pro', 'elite']`, default: `'free'`)
- `stripeCustomerId` (String, `select: false`)
- `stripeSubscriptionId` (String, `select: false`)
- `refreshTokens` (Array of Strings, `select: false`)
- **`preferences`**:
  - `primaryGoal` (String, default: `'Maintenance'`)
  - `dietaryRestriction` (String, default: `'None'`)
  - `dailyCalorieTarget` (Number, default: `2000`)
  - `cuisinePreferences` (Array of Strings, default: `[]`)
  - `allergies` (Array of Strings, default: `[]`)
- **`metrics`**:
  - `heightCm` (Number, default: `null`)
  - `currentWeightKg` (Number, default: `null`)
  - `targetWeightKg` (Number, default: `null`)
  - `activityLevel` (enum: `['sedentary', 'lightly_active', 'moderately_active', 'very_active']`, default: `'moderately_active'`)
- **`notifications`**:
  - `mealReminders` (Boolean, default: `true`)
  - `weeklyReport` (Boolean, default: `true`)
  - `streakAlerts` (Boolean, default: `true`)
- `passwordResetToken` (String, `select: false`)
- `passwordResetExpires` (Date, `select: false`)
- **Methods:** `comparePassword()`, `toJSON()`
- **Pre-save hook:** hashes password with `bcryptjs`

### `meal.model.js`

> **Not found** — no explicit Meal model; data stored in `MealLog` via dashboard.

### `dietPlan.model.js` — DietPlan & WeightHistory Schemas

**DietPlan**
- `user` (ObjectId ref `'User'`, required, indexed)
- `title` (String, default: `'AI Generated Plan'`)
- `goal` (String)
- `dietaryRestriction` (String)
- `dailyCalorieTarget` (Number)
- `cuisinePreferences` (Array of Strings, default: `[]`)
- `totalDays` (Number, default: `7`)
- `isSaved` (Boolean, default: `false`)
- `isActive` (Boolean, default: `false`)
- `days` (Array of day objects):
  - `day` (String)
  - `totalCalories` (Number)
  - `meals` (Object with `breakfast`, `lunch`, `dinner`, `snack`):
    - `name` (String)
    - `calories` (Number)
    - `recipeId` (String, default: `null`)
    - `microNutrients`:
      - `protein`, `carbs`, `fats`, `fiber` (all Numbers, default: `0`)

**WeightHistory**
- `user` (ObjectId ref `'User'`, required, unique)
- `entries` (Array of weight entries):
  - `date` (String, format: `"YYYY-MM-DD"`)
  - `kg` (Number, required)

### `notification.model.js` — Notification Schema

- `user` (ObjectId ref `'User'`, required, indexed)
- `type` (enum: `['meal_reminder', 'streak_milestone', 'weekly_report', 'goal_achieved', 'plan_ready', 'wearable_synced']`, required)
- `title` (String, required)
- `body` (String, required)
- `read` (Boolean, default: `false`, indexed)
- `link` (String, default: `null`)
- `timestamps: true`

### `chat.model.js` — Chat Schema

- `userId` (ObjectId ref `'User'`, required, indexed)
- `title` (String, required)
- `summary` (String, default: `null`)
- `lastMessageAt` (Date, default: `Date.now`)
- `threadId` (String, required, unique)
- `timestamps: true`

---

## 3. FastAPI Router Files in `backend/ai-service/routers/`

### `chat.py` — Router: `/api/chat` (prefix in `app.py`)

- **`POST /stream`** — Server-Sent Events streaming AI chat response
  - **Input:** `ChatRequest` (`thread_id`, `message`, `user_context`)
  - **Output:** SSE with `data: {"delta": "text"}`, `{"type": "recipe_card", "data": {...}}`, `{"done": true}`
  - **Calls:** `stream_chat()` service
- **`POST /message`** — Non-streaming fallback
  - **Input:** `ChatRequest`
  - **Output:** JSON with full response
  - **Calls:** `run_chat()` service

### `diet_plan.py` — Router: `/api/diet-plan` (prefix in `app.py`)

- **`POST /generate`** — Generate weekly meal plan
  - **Input:** `DietPlanRequest` (`days`, `goal`, `dietary_restriction`, `daily_calorie_target`, `cuisine_preferences`)
  - **Output:** JSON with normalized days array (camelCase keys, parsed microNutrients)
  - **Calls:** `generate_diet()` service
  - **Returns:** `{"data": {"days": [...], "totalDays": N}}`

### `analyze.py` — Router: `/api/analyze` (prefix in `app.py`)

- **`POST /photo`** — Analyze food photo for nutritional info
  - **Input:** Multipart file upload (image only)
  - **Validation:** max 10MB, must be image MIME type
  - **Calls:** `analyze_food_image()` service
  - **Output:** `{"data": result}` from vision service

---

## 4. Redux Slices in `frontend/src/store/slices/`

### `authSlice.js` — Manages authentication state

**State**
- `user` (full user object from server, hydrated from sessionStorage)
- `token` (JWT access token from sessionStorage)
- `isLoggedIn` (boolean convenience flag)

**Reducers**
- `setCredentials(state, action)` — store user + token after login/signup
- `clearCredentials(state)` — wipe state on logout

**Selectors:** `selectUser`, `selectIsLoggedIn`, `selectToken`

### `dashboardSlice.js` — Manages dashboard data and meal logging

**State**
- `summary` (full dashboard object: calories, macros, meals, streak, weight, activity)
- `weightHistory` (array of `{date, kg}` entries)
- `period` (`'7d'` or `'30d'`)
- `loading` (fetch in-flight flag)
- `error` (error message)
- `togglingMealIds` (array of meal IDs awaiting update response)

**Async Thunks**
- `fetchDashboardSummary()` — `GET /dashboard/summary`
- `fetchWeightHistory(period)` — `GET /dashboard/weight-history?period=`
- `toggleMealLogged({mealId, logged})` — `PUT /meals/:id`, optimistic update

**Reducers**
- `setPeriod(state, action)` — change chart period
- `clearDashboard(state)` — reset on logout

**Selectors:** `selectSummary`, `selectWeightHistory`, `selectDashboardLoading`, `selectDashboardError`, `selectPeriod`

### `dietPlanSlice.js` — Manages diet plan generation, storage, and seeding

**State**
- `savedPlans` (array of saved plans)
- `currentPlan` (plan rendered in right panel)
- `currentPlanId` (MongoDB `_id`)
- `activePlanId` (`_id` of `isActive=true` plan)
- `isSaved` (whether `currentPlan` persisted to DB)
- `isSeeded` (whether today's meals synced from plan)
- `seededCount` (number of meals created)
- **Flags:** `generating`, `saving`, `seeding`, `deleting`, `settingActive`, `loadingPlans`, `error`

**Async Thunks**
- `fetchSavedPlans()` — `GET /diet-plans`
- `generatePlan({goal, dietary_restriction, daily_calorie_target, cuisine_preferences, days})` — `POST /diet-plans/generate`
- `savePlan({planId, title})` — `POST /diet-plans/:id/save`
- `seedTodayFromPlan(planId)` — `POST /diet-plans/:id/seed-today`
- `deletePlan(planId)` — `DELETE /diet-plans/:id`
- `setActivePlan(planId)` — `PATCH /diet-plans/:id/set-active`

**Reducers**
- `setCurrentPlan(state, action)` — load saved plan into right panel
- `clearError(state)` — dismiss error
- `clearDietPlan()` — reset on logout

**Selectors:** `selectSavedPlans`, `selectCurrentPlan`, `selectCurrentPlanId`, `selectActivePlanId`, `selectIsPlanSaved`, `selectIsSeeded`, `selectSeededCount`, `selectGenerating`, `selectSaving`, `selectSeeding`, `selectDeleting`, `selectSettingActive`, `selectLoadingPlans`, `selectDietPlanError`

---

## 5. Pages in `frontend/src/pages/`

### `LoginPage.jsx`

- Form with email + password
- **Calls:** `POST /auth/login`
- **On success:** stores token + user to sessionStorage, dispatches `setCredentials()`, navigates to `/dashboard`
- **Features:** Social login buttons (Google, Apple), forgot password link, decorative left panel

### `DashboardPage.jsx`

- Main user dashboard
- **Fetches:** `GET /dashboard/summary` on mount
- **Displays:**
  - Greeting with hydration progress
  - Calorie summary with progress ring (consumed vs target)
  - Macro breakdown bars (protein, carbs, fats, fiber)
  - Weight progress bar chart (7/30 day toggle)
  - Today's meal plan cards (clickable to toggle logged status)
  - Daily activity (steps vs goal)
  - Weekly streak counter
  - Quick action buttons (Log Meal, Ask AI, Update Goal)
- **Uses Redux:** `selectSummary`, `selectWeightHistory`, `selectPeriod`, `selectUser`
- **Handlers:** `toggleMealLogged()` (optimistic update), `fetchWeightHistory(period)`

### `ChatPage.jsx`

- Real-time AI nutrition chat interface
- **Left sidebar:** list of past chats (`GET /chats`), new chat button
- **Center canvas:** message history + input
- **Streaming:** Uses raw `fetch` SSE (not Axios) to receive streaming tokens
- **Flow:**
  - **Mount:** `GET /chats` (populate sidebar)
  - **First message:** `POST /chats` (create chat) → then stream to `/chats/:id/messages/stream`
  - **Subsequent:** `POST /chats/:id/messages/stream` (same `chatId`)
  - **Click sidebar:** `GET /chats/:id/messages` (restore history)
  - **New Chat:** clears `activeChatId`; next message auto-creates new chat
- **Features:** suggestion chips, recipe card detection (parses JSON), streaming indicator, input validation
- **Uses Redux:** `selectUser`

### `DietPlanPage.jsx`

- AI diet plan generator and management
- **Left panel:** preferences form (goal, diet restriction, calorie target, cuisines)
  - TDEE calculator with goal-aware calorie recommendations
  - Cuisine toggle buttons
  - Generate button
- **Right panel:** plan display (days with meals, macros) or generation spinner
  - Save Plan button (`POST /diet-plans/:id/save`)
  - Sync Today's Meals button (`POST /diet-plans/:id/seed-today`, only after save)
  - Regenerate button
- **Saved plans list:** load, set active, delete
- **Uses Redux:** `fetchSavedPlans`, `generatePlan`, `savePlan`, `seedTodayFromPlan`, `deletePlan`, `setActivePlan`, `clearError`

### `ProfilePage.jsx`

- User profile editor
- **Sections:**
  - **Account:** name, email (read-only), age, gender
  - **Body Metrics:** height, current weight, target weight, activity level (4 buttons)
  - **Goals & Diet:** primary goal, dietary restriction, daily calorie target
- **API calls:** `GET /auth/me` (load), `PUT /users` (profile), `PUT /users/preferences` (goals/diet)
- **Features:** success flash message (3s), logout button
- **Navigation guard:** redirects to `/login` if not logged in

---

## 6. Main Entry Point in `backend/ai-service/`

### `main.py` — FastAPI Application

```python
app = FastAPI(
    title="NutriTalk AI Service",
    description="FastAPI microservice handling all AI/ML workloads: chat streaming, diet plan generation, food photo analysis.",
    version="1.0.0",
)
```

**Middleware**
- `CORSMiddleware`: origins from env var `ALLOWED_ORIGINS` (default: `"http://localhost:3000,http://localhost:5173"`)
  - `allow_credentials: true`
  - `allow_methods: ["*"]`
  - `allow_headers: ["*"]`

**Routers mounted with `/api` prefix**
```python
app.include_router(chat.router,      prefix="/api")
app.include_router(diet_plan.router, prefix="/api")
app.include_router(analyze.router,   prefix="/api")
```

**Health Check**
- `GET /health` — returns `{status: "ok", service: "nutritalk-ai-service", provider, model}`

**Entry point**
```python
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
```

---

## 7. Main Server Entry File in `backend/node/src/`

### `server.js` — Express Server Entry Point

```js
import app from './app.js'

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NutriTalk Node API running on http://localhost:${PORT}`);
  console.log(`📡 AI Service proxied from ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
```

### `app.js` — Express Application Setup

**Middleware Stack (in order)**
1. `helmet()` — Security headers
2. `cors()` — CORS with frontend URL, `credentials: true`, methods: `GET/POST/PUT/DELETE/PATCH/OPTIONS`
3. `express.json({ limit: '10mb' })` — JSON parser (10MB limit)
4. `express.urlencoded({ extended: true })` — URL-encoded parser
5. `cookieParser()` — Parse httpOnly cookies (for `refreshToken`)
6. `morgan('dev')` — Request logging

**Security**
- Global rate limiter: 300 requests per 15 minutes, returns error code `'RATE_LIMIT'`

**Health Check**
- `GET /health` — `{status: 'ok', service: 'nutritalk-node-api', timestamp}`

**Route Mounting**
```js
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/meals',         mealRoutes);
app.use('/api/diet-plans',    dietPlanRoutes);
app.use('/api/recipes',       recipeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscription',  subscriptionRoutes);
app.use('/api/chats',         chatRoutes);
```

**AI Proxy**
```js
app.use('/api/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api' }, // /api/ai/chat → /api/chat
  on: {
    error: (err, req, res) => {
      console.error('[AI Proxy Error]', err.message);
      res.status(502).json({
        error: { code: 'AI_SERVICE_UNAVAILABLE', message: 'AI service is temporarily unavailable.' }
      });
    }
  }
}));
```

**Error Handling**
- 404 handler: returns `{error: {code: 'NOT_FOUND', message: 'Endpoint not found.'}}`
- Global error handler: `errorHandler` middleware

**Database**
- MongoDB connection via `connectDB()` called on app startup

---

## 8. Proxy / Middleware Config in `backend/node/src/`

**Middleware Stack Summary**
- **Security:** `helmet`, `cors`, rate-limiting
- **Parsing:** `json` (10MB), `urlencoded`, cookie parser
- **Logging:** `morgan` (dev)
- **Authentication:** `protect` middleware (validates JWT from `Authorization` header or cookies)
- **File Upload:** `multer` (for avatar uploads, `dest: 'uploads/'`)

**Proxy Configuration (`http-proxy-middleware`)**
- **Target:** `process.env.AI_SERVICE_URL` (default: `http://localhost:8000`)
- **Path Rewrite:** `/api/ai/*` → `/api/*` (strips `/ai` prefix)
- **Change Origin:** `true` (preserves Host header)
- **Error Handling:** 502 response with `AI_SERVICE_UNAVAILABLE` code
- **Routes proxied:**

  | From | To |
  |---|---|
  | `/api/ai/chat/stream` | `/api/chat/stream` (FastAPI) |
  | `/api/ai/chat/message` | `/api/chat/message` (FastAPI) |
  | `/api/ai/diet-plan/generate` | `/api/diet-plan/generate` (FastAPI) |
  | `/api/ai/analyze/photo` | `/api/analyze/photo` (FastAPI) |

**CORS Configuration**
- **Origin:** `process.env.FRONTEND_URL` (default: `http://localhost:5173`)
- **Credentials:** `true` (allows cookies in cross-origin requests)
- **Methods:** `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- **Headers:** all

**Rate Limit Configuration**
- **Window:** 15 minutes
- **Max Requests:** 300 per window
- **Legacy Headers:** `false` (uses standard `RateLimit-*` headers)

---

## Summary

The NutriTalk-AI project is a full-stack nutrition tracking app with:

- **Frontend (React + Redux):** 5 main pages managing auth, dashboard, diet planning, chat, and profile
- **Backend (Node.js + Express):** 8 route groups covering auth, users, dashboard, meals, diet plans, recipes, notifications, subscriptions, and conversation history
- **AI Service (FastAPI):** 3 routers handling chat streaming, diet plan generation, and food photo analysis
- **Database (MongoDB):** 5 main models (`User`, `DietPlan`, `WeightHistory`, `Notification`, `Chat`)
- **Integration:** Node.js proxies `/api/ai/*` requests to FastAPI service on port 8000

All routes are protected except public endpoints (health checks, Stripe webhook, subscription plans list). The system uses JWT tokens in headers/cookies, SSE for streaming chat, and optimistic updates for instant UI feedback.
