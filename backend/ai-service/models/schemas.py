from pydantic import BaseModel, Field
from typing import Optional, List, Literal

# ── Chat ──────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[dict] = None  # user prefs for personalisation

# ── Diet Plan ──────────────────────────────────────────────────
class DietPlanRequest(BaseModel):
    goal: str = "Maintenance"
    dietary_restriction: str = "None"
    daily_calorie_target: int = 2000
    cuisine_preferences: List[str] = []
    days: int = Field(default=7, ge=1, le=14)

class MealInPlan(BaseModel):
    name: str
    calories: int
    recipe_id: Optional[str] = None

class DayPlan(BaseModel):
    day: str
    total_calories: int
    meals: dict  # breakfast, lunch, dinner, snack

class DietPlanResponse(BaseModel):
    days: List[DayPlan]

# ── Photo Analysis ─────────────────────────────────────────────
class PhotoAnalysisResponse(BaseModel):
    name: str
    estimated_calories: int
    macros: dict
    confidence: float
    note: Optional[str] = None
