import json
import re
from fastapi import APIRouter, HTTPException
from models.schemas import DietPlanRequest, DietPlanResponse
from services.llm_service import generate_text

router = APIRouter(prefix="/diet-plan", tags=["AI Diet Plan"])

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@router.post("/generate")
async def generate_diet_plan(request: DietPlanRequest):
    """
    Generate a personalized weekly diet plan using AI.
    Called by Node.js backend on POST /diet-plans/generate.
    """
    cuisines = ", ".join(request.cuisine_preferences) if request.cuisine_preferences else "any cuisine"

    prompt = f"""You are a certified nutritionist AI. Generate a {request.days}-day meal plan.

User Profile:
- Goal: {request.goal}
- Dietary Restriction: {request.dietary_restriction}
- Daily Calorie Target: {request.daily_calorie_target} kcal
- Preferred Cuisines: {cuisines}

Return ONLY a valid JSON array with exactly {request.days} objects in this exact format — no extra text:
[
  {{
    "day": "Monday",
    "total_calories": 1820,
    "meals": {{
      "breakfast": {{"name": "Meal name", "calories": 340}},
      "lunch":     {{"name": "Meal name", "calories": 520}},
      "dinner":    {{"name": "Meal name", "calories": 680}},
      "snack":     {{"name": "Meal name", "calories": 120}}
    }}
  }}
]

Rules:
- Total daily calories should be close to {request.daily_calorie_target}
- All meals must comply with: {request.dietary_restriction}
- Vary meals across days — no repeats
- Meal names should be descriptive and appetising
- Reflect {cuisines} cuisine preferences where possible
"""

    raw = await generate_text(prompt)

    # Extract JSON array from response
    match = re.search(r'\[.*\]', raw, re.DOTALL)
    if not match:
        raise HTTPException(status_code=500, detail="AI returned invalid format. Please try again.")

    try:
        days_data = json.loads(match.group())
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Could not parse AI response. Please try again.")

    # Normalize keys: snake_case → camelCase for Node.js consumption
    normalized = []
    for d in days_data:
        normalized.append({
            "day": d.get("day", ""),
            "totalCalories": d.get("total_calories", d.get("totalCalories", 0)),
            "meals": d.get("meals", {}),
        })

    return {"data": {"days": normalized, "totalDays": len(normalized)}}
