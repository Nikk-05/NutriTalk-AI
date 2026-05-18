# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Commands

Each service runs independently — there is no root-level script.

**Frontend** (`frontend/`)
```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build
```

**Node.js API** (`backend/node/`)
```bash
npm run dev      # nodemon → http://localhost:3000
npm start        # production
npm run lint     # eslint src/
```

**AI Service** (`backend/ai-service/`)
```bash
python main.py                        # uvicorn with reload → http://localhost:8000
uvicorn main:app --reload --port 8000 # explicit alternative
```

All three services must run simultaneously for full functionality.

## Environment Setup

- `backend/node/.env` — copy from `.env.example`; requires `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AI_SERVICE_URL=http://localhost:8000`
- `backend/ai-service/.env` — requires `GOOGLE_API_KEY` (Gemini) or `OPENAI_API_KEY`; current model is `gemini-2.5-flash-lite` via LangGraph

## Architecture

Three-tier system: React SPA → Express API → FastAPI AI microservice.

```
frontend (Vite/React :5173)
    └── axios via fetchAPI()  →  Node.js API (:3000)
                                    ├── MongoDB (Mongoose)
                                    └── /api/ai/* proxy  →  FastAPI (:8000)
                                                              ├── /api/chat/stream   (SSE)
                                                              ├── /api/diet-plan/generate
                                                              └── /api/analyze/photo
```

**AI proxy pattern:** The frontend never calls FastAPI directly. All AI requests go to Node.js at `/api/ai/*`, which rewrites to `/api/*` on FastAPI via `http-proxy-middleware`. So `POST /api/ai/chat/stream` on Node → `POST /api/chat/stream` on FastAPI.

## API Conventions

All Node.js responses use a standard envelope from `response.utils.js`:
- Success: `{ status: 'success', data: { ... } }`
- Created: `{ status: 'success', data: { ... } }` with HTTP 201
- Error: `{ status: 'error', error: { code, message } }`

Every protected route uses the `protect` middleware which verifies the JWT from `Authorization: Bearer <token>` and attaches `req.user`.

Auth uses a dual-token pattern: short-lived access token (15m) in sessionStorage + httpOnly refresh token cookie (7d). The Axios interceptor in `frontend/src/utils/apiCalls.js` automatically retries failed requests after token refresh, queueing concurrent 401s.

## Frontend State Architecture

Redux store has three slices (`frontend/src/store/`):

| Slice | What it owns |
|---|---|
| `auth` | user object, token, isLoggedIn — hydrated from sessionStorage on load |
| `dashboard` | summary (calories, macros, todaysMeals), weightHistory, togglingMealIds |
| `dietPlan` | savedPlans, currentPlan, activePlanId, generating/saving/seeding states |

**Key pattern — optimistic meal toggle:** `toggleMealLogged.pending` in `dashboardSlice` immediately flips the `logged` flag and runs `recalcFromMeals()` to recompute calories/macros from scratch. On rejection it rolls back. This is why progress bars update instantly on checkbox click.

**Key pattern — diet plan → dashboard flow:**
1. User generates a plan (FastAPI) → saved to `DietPlan` collection
2. User saves plan → marked `isSaved: true`, `isActive: true` (all others deactivated)
3. User clicks "Sync Today" → `POST /diet-plans/:id/seed-today` deletes today's unlogged `MealLog` entries and recreates them from the plan's meals for today's weekday
4. Dashboard `GET /dashboard/summary` reads those `MealLog` entries; toggling them feeds back into macro calculations

Only one plan can be `isActive: true` per user. The dashboard always reflects the seeded meals from the active plan.

## Data Models (MongoDB)

**User** — `preferences.dailyCalorieTarget` is computed server-side on signup using Mifflin-St Jeor BMR × activity multiplier + goal adjustment. Frontend `frontend/src/utils/tdee.js` mirrors this logic for live previews only — backend is the source of truth.

**DietPlan** — each day stores `meals.{breakfast,lunch,dinner,snack}` each with `{ name, calories, microNutrients: { protein, carbs, fats, fiber } }`. Also has `isSaved` and `isActive` flags.

**MealLog** — one document per meal per day per user. `logged: false` means planned (seeded from diet plan), `logged: true` means eaten. Only `logged: true` entries count toward dashboard calorie/macro totals.

## Frontend Styling

Tailwind with a Material Design 3-inspired token system. All colours are custom tokens defined in `tailwind.config.js` (e.g. `bg-surface-container-lowest`, `text-on-surface-variant`, `text-primary`). Icons use Google Material Symbols via CDN — rendered as `<span className="material-symbols-outlined">icon_name</span>`. Fill state is controlled via `fontVariationSettings: "'FILL' 1"` inline style.

Fonts: `font-headline` = Space Grotesk, `font-body` / `font-label` = Manrope.

## Key File Locations

- API call utility + token interceptor: `frontend/src/utils/apiCalls.js`
- TDEE calculation (frontend preview): `frontend/src/utils/tdee.js`
- App constants (goals, diets, cuisines, ranges, MEAL_SLOTS): `frontend/src/constants/appConstants.js`
- Auth middleware: `backend/node/src/middleware/auth.js`
- Response helpers: `backend/node/src/utils/response.utils.js`
- AI chat streaming: `backend/ai-service/routers/chat.py` + `services/chat_service.py`
- Diet plan AI generation: `backend/ai-service/routers/diet_plan.py`
