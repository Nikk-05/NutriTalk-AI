import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, diet_plan, analyze

load_dotenv()

app = FastAPI(
    title="NutriTalk AI Service",
    description="FastAPI microservice handling all AI/ML workloads: chat streaming, diet plan generation, food photo analysis.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────
# All routes prefixed with /api to match Node.js proxy rewrite
app.include_router(chat.router,      prefix="/api")
app.include_router(diet_plan.router, prefix="/api")
app.include_router(analyze.router,   prefix="/api")


# ── Health Check ───────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "nutritalk-ai-service",
        "provider": os.getenv("AI_PROVIDER", "gemini"),
        "model": os.getenv("AI_MODEL", "gemini-1.5-flash"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
