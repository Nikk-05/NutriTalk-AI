# NutriTalk AI — Backend

Dual-service backend architecture:

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| **node/** | Node.js + Express + MongoDB | `3000` | Auth, Users, Dashboard, Meals, Diet Plans, Recipes, Notifications, Subscriptions |
| **ai-service/** | Python + FastAPI | `8000` | AI Chat (SSE streaming), Diet Plan Generation, Food Photo Analysis |

## Architecture Diagram

```
Frontend (React, :5173)
        │
        ▼
Node.js API (:3000)
  ├─ /api/auth          → auth.controller.js
  ├─ /api/users         → users.controller.js
  ├─ /api/dashboard     → dashboard.controller.js
  ├─ /api/meals         → meals.controller.js
  ├─ /api/diet-plans    → dietPlans.controller.js  ──calls──▶ FastAPI /api/diet-plan/generate
  ├─ /api/recipes       → recipes.routes.js
  ├─ /api/notifications → notifications.controller.js
  ├─ /api/subscription  → subscriptions.controller.js
  └─ /api/ai/*  (proxy)─────────────────────────────────────▶ FastAPI (:8000)

FastAPI AI Service (:8000)
  ├─ /api/chat/stream       → SSE streaming chat (Gemini / OpenAI)
  ├─ /api/chat/message      → Non-streaming fallback
  ├─ /api/diet-plan/generate → AI weekly plan generator
  └─ /api/analyze/photo      → Food photo vision analysis
```

## Quick Start

### 1. Node.js API

```bash
cd node/
cp .env.example .env      # Fill in your MongoDB URI, JWT secrets, Stripe keys
npm install
npm run dev               # Starts on http://localhost:3000
```

### 2. FastAPI AI Service

```bash
cd ai-service/
cp .env.example .env      # Fill in GEMINI_API_KEY or OPENAI_API_KEY
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py            # Starts on http://localhost:8000
# OR: uvicorn main:app --reload --port 8000
```

### 3. API Documentation

- Node.js: No built-in docs (REST)
- FastAPI: **http://localhost:8000/docs** (Swagger UI auto-generated)

## Environment Variables

### node/.env
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | JWT signing secret (access token) |
| `JWT_REFRESH_SECRET` | JWT signing secret (refresh token) |
| `AI_SERVICE_URL` | FastAPI URL (`http://localhost:8000`) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FRONTEND_URL` | Frontend URL for CORS |

### ai-service/.env
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key (optional fallback) |
| `AI_PROVIDER` | `"gemini"` or `"openai"` |
| `AI_MODEL` | Model name (`gemini-1.5-flash`, `gpt-4o`) |
| `JWT_ACCESS_SECRET` | Same as Node.js (for direct token verification) |

## Key Design Decisions

1. **Node.js → FastAPI proxy**: `GET /api/ai/*` in Node.js is transparently proxied to FastAPI via `http-proxy-middleware`. The frontend can call AI endpoints through the same Node.js port.

2. **SSE Streaming**: Chat uses `sse-starlette` in FastAPI. Responds with `text/event-stream` — each token is a `data: {"delta": "..."}` line.

3. **JWT shared secret**: Both services share `JWT_ACCESS_SECRET` so FastAPI can independently verify tokens without calling back to Node.js.

4. **AI Provider switching**: Change `AI_PROVIDER=gemini|openai` in `.env` to switch between Gemini and OpenAI with zero code changes.

5. **Stripe webhook**: Uses `express.raw()` middleware before `express.json()` to preserve raw body for Stripe signature verification.
