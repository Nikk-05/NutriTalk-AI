# NutriTalk AI — Backend & Frontend Data Contract

> **Purpose**: This document defines every piece of data the frontend requires from the backend, every piece of data handled purely on the frontend, and the API contract between both. It also outlines further requirements to build the complete production-ready product.
>
> **Stack**: Frontend → React 18 + Vite + Tailwind CSS v3 | Backend → Node.js/FastAPI (REST) | AI → Google Gemini / OpenAI GPT-4o

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Authentication & Session](#2-authentication--session)
3. [User Profile & Onboarding](#3-user-profile--onboarding)
4. [Dashboard](#4-dashboard)
5. [Meal Logging & Calorie Tracking](#5-meal-logging--calorie-tracking)
6. [AI Chat (NutriTalk Curator)](#6-ai-chat-nutritalk-curator)
7. [Diet Plan Generator](#7-diet-plan-generator)
8. [Recipes & Food Database](#8-recipes--food-database)
9. [Wearable & Activity Integration](#9-wearable--activity-integration)
10. [Notifications](#10-notifications)
11. [Subscription & Upgrade](#11-subscription--upgrade)
12. [Frontend-Only State](#12-frontend-only-state-no-api-needed)
13. [Shared Data Models](#13-data-models-shared-schemas)
14. [Error Handling Contract](#14-error-handling-contract)
15. [Further Requirements & Roadmap](#15-further-requirements--roadmap)

---

## 1. Project Overview

**NutriTalk AI** is an AI-powered nutrition management platform. Users get:
- Personalized AI diet plans generated weekly
- Real-time calorie and macro tracking
- A conversational AI nutritionist (chat interface)
- Progress dashboards (weight, calories, macros, streaks)
- Wearable sync (Apple Watch, Fitbit, Oura Ring, Garmin)
- Subscription tiers (Starter Free / Pro $12/mo / Elite $29/mo)

**Core Principle**: The frontend handles **display and interaction**. The backend handles **persistence, computation, and AI calls**. API keys (Gemini, OpenAI, Stripe) are **never exposed to the browser**.

---

## 2. Authentication & Session

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/auth/signup` | POST | Register user with name, email, password |
| `/auth/login` | POST | Return JWT access token + refresh token |
| `/auth/logout` | POST | Invalidate refresh token server-side |
| `/auth/refresh` | POST | Get new access token using refresh token |
| `/auth/me` | GET | Return currently authenticated user |
| `/auth/google` | GET | OAuth2 redirect for Google sign-in |
| `/auth/apple` | GET | OAuth2 redirect for Apple sign-in |
| `/auth/forgot-password` | POST | Send password reset email |
| `/auth/reset-password` | POST | Set new password via reset token |

### Request / Response Shapes

```json
// POST /auth/login
Request:  { "email": "alex@email.com", "password": "••••••••" }
Response: {
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "user": { "id": "u_123", "name": "Alex", "email": "alex@email.com", "plan": "pro" }
}
```

### What Frontend Handles

- Store `accessToken` in **React memory / Zustand** only — never localStorage
- Store `refreshToken` in **httpOnly cookie** (set by backend `Set-Cookie`)
- Axios interceptor: auto-attach `Authorization: Bearer <token>` header to every request
- On 401: silently call `/auth/refresh` → retry original request with new token
- On refresh failure: clear state → redirect to `/login`
- Signup page sends Step 1 (account) to `/auth/signup`, then Steps 2+3 to `PUT /users/me/preferences`
- Show inline form errors mapped from `error.field` in API response

---

## 3. User Profile & Onboarding

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/users/me` | GET | Full user profile with preferences and metrics |
| `/users/me` | PUT | Update any profile fields |
| `/users/me/preferences` | PUT | Update dietary preferences and goals |
| `/users/me/avatar` | POST | Upload profile photo (multipart/form-data) |
| `/users/me` | DELETE | Delete account and all associated data |

### User Profile Schema

```json
{
  "id": "u_123",
  "name": "Alex Johnson",
  "email": "alex@email.com",
  "avatar": "https://cdn.nutritalk.ai/avatars/u_123.jpg",
  "plan": "pro",
  "createdAt": "2024-01-15T10:00:00Z",
  "preferences": {
    "primaryGoal": "Weight Loss",
    "dietaryRestriction": "Vegetarian",
    "dailyCalorieTarget": 1800,
    "cuisinePreferences": ["Indian", "Mediterranean"],
    "allergies": ["Peanuts"]
  },
  "metrics": {
    "heightCm": 175,
    "currentWeightKg": 78.2,
    "targetWeightKg": 72.0,
    "activityLevel": "moderately_active"
  },
  "notifications": {
    "mealReminders": true,
    "weeklyReport": true,
    "streakAlerts": true
  }
}
```

### What Frontend Handles

- Store full user object in Zustand / React Context global store
- Derive greeting time-of-day from system clock: "Good Morning / Afternoon / Evening, {name}"
- Show `plan` badge in Chat sidebar ("Premium Access"), and gate features by plan tier
- Signup 3-step wizard saves preferences after signup completes
- Profile page (to be built): read/edit name, photo, metrics, preferences

---

## 4. Dashboard

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/dashboard/summary` | GET | All today's dashboard data in one call |
| `/dashboard/weight-history` | GET?period=7d\|30d | Weight entries array for chart |
| `/dashboard/streak` | GET | Current streak + longest streak |
| `/dashboard/activity` | GET?date= | Steps, active minutes, calories burned |

### Dashboard Summary Response

```json
{
  "date": "2024-04-06",
  "calories": {
    "consumed": 1540,
    "target": 2400,
    "remaining": 860,
    "burned": 320
  },
  "macros": {
    "protein": { "consumed": 120, "target": 180 },
    "carbs":   { "consumed": 210, "target": 250 },
    "fats":    { "consumed": 45,  "target": 70  }
  },
  "hydration": { "consumedMl": 1300, "targetMl": 2000 },
  "weightHistory": [
    { "date": "2024-03-31", "kg": 79.5 },
    { "date": "2024-04-06", "kg": 78.2 }
  ],
  "streak": { "current": 5, "longestEver": 12 },
  "activity": {
    "steps": 4230,
    "stepGoal": 10000,
    "activeMinutes": 35,
    "caloriesBurned": 320
  },
  "todaysMeals": [
    { "id": "ml_1", "type": "breakfast", "name": "Oatmeal & Berries", "calories": 340, "logged": true },
    { "id": "ml_2", "type": "lunch",     "name": "Salmon Salad",       "calories": 520, "logged": true },
    { "id": "ml_3", "type": "dinner",    "name": "Grilled Chicken",    "calories": 680, "logged": false }
  ]
}
```

### What Frontend Handles

- Fetch `/dashboard/summary` on mount; show skeleton loaders during fetch
- Compute calorie ring percentage: `(consumed / target) * 100`
- Render `ProgressRing` SVG with gradient stroke
- Render 3x `ProgressBar` for protein, carbs, fats
- Weight chart: sort `weightHistory` by date, render bar heights as percentage of max
- "7 Days / 30 Days" toggle refetches `/dashboard/weight-history?period=...`
- Streak card shows flame emoji animation above threshold (≥3 days)
- Activity card step progress bar: `(steps / stepGoal) * 100`

---

## 5. Meal Logging & Calorie Tracking

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/meals` | GET?date= | All logged meals for a given date |
| `/meals` | POST | Log a new meal entry |
| `/meals/:id` | PUT | Edit a logged meal |
| `/meals/:id` | DELETE | Remove a logged meal |
| `/meals/search` | GET?q= | Search food database |
| `/meals/photo-analyze` | POST | Upload food photo → AI returns macro breakdown |
| `/meals/barcode` | GET?upc= | Nutritional lookup by barcode UPC |

### Meal Log Request

```json
{
  "date": "2024-04-06",
  "type": "breakfast",
  "name": "Oatmeal with Blueberries",
  "servings": 1.5,
  "foodItemId": "food_oatmeal_123",
  "calories": 340,
  "macros": { "proteinG": 12, "carbsG": 58, "fatG": 6, "fiberG": 8 },
  "imageUrl": null
}
```

### What Frontend Handles

- **Log Meal Modal** (to be built): 3 tabs — Search / Photo / Manual
  - Search: debounced input → `/meals/search`, show results list
  - Photo: `<input type="file">` → POST to `/meals/photo-analyze` → prefill form
  - Manual: controlled form for name, calories, macros
- Optimistic UI: add meal to list immediately, revert on API error
- Each MealCard has a delete/edit swipe or context menu
- Date navigation: past/future date picker → refetch `/meals?date=`

---

## 6. AI Chat (NutriTalk Curator)

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/chat/sessions` | GET | All user's chat history sessions |
| `/chat/sessions` | POST | Start a new chat session |
| `/chat/sessions/:id` | GET | Full message history of one session |
| `/chat/sessions/:id` | DELETE | Delete a conversation |
| `/chat/sessions/:id/messages` | POST | Send message; receive streaming AI response |

> **Streaming**: AI response must be delivered via **Server-Sent Events (SSE)** for real-time token display. Frontend renders each `delta` token as it arrives.

### Message Shapes

```json
// POST /chat/sessions/:id/messages
Request:
{ "role": "user", "content": "Give me a high-protein dinner under 20 minutes" }

// SSE Stream Response
data: {"delta": "Great"}
data: {"delta": " choice!"}
data: {"type": "recipe_card", "data": { ...Recipe object... }}
data: {"done": true, "messageId": "msg_99"}
```

### What Frontend Handles

- Sidebar: fetch session list → render "Recent Curations"
- New Chat: `POST /chat/sessions` → clear message area → show empty state with suggestion chips
- On user send: append user message immediately (optimistic), open SSE connection
- Render AI tokens one by one as they stream (typewriter effect)
- Detect `type: "recipe_card"` delta → render `<RecipeCard />` component inline
- Show animated typing indicator until first token arrives
- Session auto-title: use first 6 words of user's first message
- Scroll-to-bottom on every new message

---

## 7. Diet Plan Generator

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/diet-plans` | GET | All saved plans for the user |
| `/diet-plans/generate` | POST | AI generates a new 7-day plan |
| `/diet-plans/:id` | GET | Retrieve a specific plan |
| `/diet-plans/:id/save` | POST | Save generated plan to library |
| `/diet-plans/:id` | DELETE | Delete a saved plan |

### Generate Plan Request / Response

```json
// POST /diet-plans/generate
Request:
{
  "goal": "Weight Loss",
  "dietaryRestriction": "Vegetarian",
  "dailyCalorieTarget": 1800,
  "cuisinePreferences": ["Indian", "Mediterranean"],
  "days": 7
}

Response:
{
  "id": "plan_temp_xyz",
  "generatedAt": "2024-04-06T10:00:00Z",
  "totalDays": 7,
  "days": [
    {
      "day": "Monday",
      "totalCalories": 1820,
      "meals": {
        "breakfast": { "name": "Oatmeal & Berries",  "calories": 340, "recipeId": "r_001" },
        "lunch":     { "name": "Chickpea Salad",      "calories": 480, "recipeId": "r_002" },
        "dinner":    { "name": "Lentil Dal & Rice",   "calories": 620, "recipeId": "r_003" },
        "snack":     { "name": "Greek Yogurt",         "calories": 120, "recipeId": null }
      }
    }
  ]
}
```

### What Frontend Handles

- All preference form state is local (`useState`) — only sent on "Generate"
- Loading skeleton while API call is in progress
- "Regenerate" button re-calls same endpoint with same payload
- "Save Plan" → `POST /diet-plans/:id/save` → show success toast
- Meal names are eventually clickable → open Recipe Detail Modal (Phase 2)

---

## 8. Recipes & Food Database

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/recipes` | GET?q=&diet=&cuisine=&maxCal= | Search and filter recipes |
| `/recipes/:id` | GET | Full recipe: ingredients, steps, macros |
| `/recipes/:id/save` | POST | Favourite a recipe |
| `/recipes/saved` | GET | User's favourite recipes |
| `/foods/search` | GET?q= | Raw food item search (for meal logging) |
| `/foods/:id` | GET | Nutritional data for a food item |

### Recipe Schema

```json
{
  "id": "r_123",
  "name": "Spiced Chickpea & Quinoa Power Bowl",
  "imageUrl": "https://cdn.nutritalk.ai/recipes/r_123.jpg",
  "prepTimeMin": 18,
  "servings": 2,
  "tags": ["Vegan", "High-Protein", "Mediterranean"],
  "macrosPerServing": { "calories": 480, "proteinG": 24, "carbsG": 62, "fatG": 12, "fiberG": 10 },
  "ingredients": [
    { "name": "Chickpeas (canned)", "amount": "400g" },
    { "name": "Quinoa", "amount": "180g" }
  ],
  "steps": ["Rinse and drain chickpeas...", "Cook quinoa in stock..."],
  "source": "ai_generated"
}
```

### What Frontend Handles

- `RecipeCard` (already built) renders summary data
- Recipe Detail Modal (Phase 2): full ingredient list, step-by-step, save button
- Recipes page (Phase 2): filter chips by tag and calorie range

---

## 9. Wearable & Activity Integration

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/integrations` | GET | List connected wearables |
| `/integrations/connect` | POST | Initiate OAuth flow for provider |
| `/integrations/:provider/disconnect` | DELETE | Disconnect a wearable |
| `/integrations/sync` | POST | Trigger manual data sync |
| `/activity/summary` | GET?date= | Unified steps, sleep, HRV data |

### Supported Providers (Phase 1)

| Provider | Data |
|---|---|
| Apple HealthKit | Steps, calories, sleep, HRV |
| Fitbit | Steps, calories, sleep stages |
| Oura Ring | Sleep score, readiness, HRV |
| Garmin | Steps, VO2 max, stress score |

> Backend handles all OAuth redirects and token storage. Frontend only reads from `/activity/summary` regardless of provider.

### What Frontend Handles

- Integrations settings page (Phase 2): connected/disconnected cards per provider
- "Connect" → backend OAuth → callback handled server-side → redirect back to app
- Activity card on Dashboard reads from dashboard summary (already bundled)

---

## 10. Notifications

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/notifications` | GET | List recent notifications |
| `/notifications/:id/read` | PUT | Mark one as read |
| `/notifications/read-all` | PUT | Mark all as read |
| `/notifications/preferences` | GET + PUT | Read/write notification settings |

### Notification Types

```
meal_reminder       → "Time to log your lunch!"
streak_milestone    → "You're on a 7-day streak! 🔥"
weekly_report       → "Your weekly nutrition report is ready"
goal_achieved       → "You hit your protein goal today! 🎉"
plan_ready          → "Your AI diet plan has been generated"
wearable_synced     → "Fitbit synced: 8,230 steps today"
```

> Real-time delivery via **WebSocket** or **Firebase Cloud Messaging (FCM)**.

### What Frontend Handles

- Notification bell in Navbar with **unread count badge** (red dot or number)
- Dropdown panel listing 10 most recent notifications
- Mark as read on click → optimistic UI (remove badge immediately)
- Link from notification to relevant page (e.g., plan_ready → `/diet-plan`)

---

## 11. Subscription & Upgrade

### Backend Endpoints Required

| Endpoint | Method | Description |
|---|---|---|
| `/subscription/plans` | GET | Available plans with pricing |
| `/subscription/current` | GET | User's active subscription |
| `/subscription/checkout` | POST | Create Stripe Checkout session URL |
| `/subscription/cancel` | POST | Cancel at period end |
| `/subscription/portal` | POST | Create Stripe Customer Portal URL |
| `/subscription/webhook` | POST | Stripe webhook (backend only, no frontend) |

### Plan Schema

```json
{
  "plans": [
    { "id": "plan_starter", "name": "Starter", "price": 0,    "period": null,      "features": [...] },
    { "id": "plan_pro",     "name": "Pro",     "price": 1200, "period": "monthly", "features": [...] },
    { "id": "plan_elite",   "name": "Elite",   "price": 2900, "period": "monthly", "features": [...] }
  ]
}
```

> Prices in cents (USD). `stripePriceId` used by backend to create checkout sessions.

### What Frontend Handles

- Upgrade page fetches `/subscription/plans` to replace current static mock data
- On CTA click → `POST /subscription/checkout` → redirect browser to `response.checkoutUrl`
- On return from Stripe: query `/subscription/current` to confirm upgrade → update user store
- Gate features by `user.plan` (e.g., hide wearable sync if `plan === "free"`)
- "Manage Billing" → `POST /subscription/portal` → redirect to Stripe Customer Portal

---

## 12. Frontend-Only State (No API Needed)

| Feature | Mechanism |
|---|---|
| Dark / Light mode toggle | `localStorage` + `class="dark"` on `<html>` |
| Active nav tab | `useLocation()` from React Router |
| Dashboard chart period toggle (7d/30d) | `useState` + re-fetch with param |
| Diet Plan form preferences | `useState` — only sent on "Generate" click |
| Signup multi-step progress | `useState` step index (0, 1, 2) |
| Chat input text | Controlled `useState` input |
| FAQ accordion open/close | `useState` for `openFaq` index |
| Calorie ring animation | CSS `transition` on SVG `strokeDashoffset` |
| Macro bar animations | `transition-all duration-700` on width |
| Loading skeletons | `isLoading` boolean, cleared on fetch resolve |
| Toast / snackbar messages | `react-hot-toast` global instance |
| Suggested chat chips | Hardcoded pre-prompt array |
| Recipe card expand | Local modal open state |

---

## 13. Data Models (Shared Schemas)

```typescript
type User = {
  id: string
  name: string
  email: string
  avatar: string | null
  plan: 'free' | 'pro' | 'elite'
  preferences: {
    primaryGoal: string
    dietaryRestriction: string
    dailyCalorieTarget: number
    cuisinePreferences: string[]
    allergies: string[]
  }
  metrics: {
    heightCm: number
    currentWeightKg: number
    targetWeightKg: number
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
  }
}

type MealLog = {
  id: string
  date: string             // "YYYY-MM-DD"
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  calories: number
  macros: { proteinG: number; carbsG: number; fatG: number; fiberG?: number }
  logged: boolean
  imageUrl?: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'ai'
  content: string
  recipeCard?: Recipe
  createdAt: string        // ISO 8601
}

type Recipe = {
  id: string
  name: string
  imageUrl: string
  prepTimeMin: number
  tags: string[]
  macrosPerServing: { calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number }
}

type Notification = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}
```

---

## 14. Error Handling Contract

### HTTP Status Conventions

| Status | Meaning | Frontend Action |
|---|---|---|
| 200 OK | Success | Render data |
| 201 Created | Resource created | Show success toast |
| 400 Bad Request | Validation error | Inline field error |
| 401 Unauthorized | Expired/invalid token | Silent refresh; on failure → `/login` |
| 403 Forbidden | Plan restriction | Show "Upgrade to Pro" modal |
| 404 Not Found | Resource missing | Empty state UI |
| 429 Too Many Requests | Rate limited | "Please wait X seconds" message |
| 500 Server Error | Backend failure | "Something went wrong" + retry button |

### Error Response Shape (all endpoints)

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "The email address is already in use.",
    "field": "email"
  }
}
```

### Frontend Strategy

- Central `api.js` Axios wrapper: handles token injection, refresh on 401, global error toasts
- Form errors: map `error.field` → show message under matching input
- Non-form errors: `react-hot-toast` notification
- Plan gate (403): intercept globally → show `<UpgradeModal />` overlay

---

## 15. Further Requirements & Roadmap

### 🔴 MVP — Must Build Next

- [ ] `src/services/api.js` — Axios instance with auth interceptors + token refresh
- [ ] `src/store/useStore.js` — Zustand store: user, notifications, currentSession
- [ ] `src/components/ProtectedRoute.jsx` — Redirect unauthenticated users to `/login`
- [ ] `src/components/SkeletonLoader.jsx` — Replace all hardcoded mock data with loadable skeletons
- [ ] `src/components/Toast.jsx` — react-hot-toast setup in App.jsx
- [ ] `src/pages/ProfilePage.jsx` — View/edit name, metrics, preferences, avatar
- [ ] `src/components/MealLogModal.jsx` — Search / Photo / Manual tabs for logging meals
- [ ] `.env` file with `VITE_API_BASE_URL` and `VITE_STRIPE_PUBLIC_KEY`
- [ ] Connect all pages to real API endpoints (replace mock data)

### 🟡 Phase 2 — Important

- [ ] Streaming chat via SSE (typewriter AI response effect)
- [ ] Notification bell dropdown with unread badge
- [ ] `/recipes` page — searchable, filterable recipe library
- [ ] Recipe Detail Modal — full ingredients + steps
- [ ] Wearable integrations settings page
- [ ] Dark mode toggle across all components
- [ ] Weight log entry form on Dashboard
- [ ] Water / hydration tracker widget

### 🟢 Phase 3 — Backlog

- [ ] Food barcode scanner (camera access in mobile browser)
- [ ] Progress photo upload (tied to dates, private to user)
- [ ] Dietitian consultation booking (Elite plan, calendar widget)
- [ ] Offline mode with Service Worker + IndexedDB caching for meals
- [ ] Weekly email digest archive page
- [ ] React Native (Expo) mobile app sharing this same API contract
- [ ] AI-generated shopping list from diet plan
- [ ] Social features: share achievements, challenges

### 🔵 Backend Architecture Notes

- Use **JWT** (15-min access token) + **httpOnly cookie** for refresh token
- Use **SSE** for chat streaming — not polling, not WebSocket for this use case
- Rate limit AI endpoints: Free = 10 req/day, Pro = 100 req/day, Elite = unlimited
- All AI calls server-side only — never expose LLM API keys to browser
- Serve recipe/food images via CDN (CloudFront / Cloudflare) not raw storage URLs
- CORS: allow only `https://nutritalk.ai` and `http://localhost:5173` (dev)
- Weight history stored as time-series entries, not overwrites
- Unified `/dashboard/summary` endpoint to minimize page-load round trips

---

*Document Version: 1.0 | Last updated: April 2026 | NutriTalk AI Engineering*
