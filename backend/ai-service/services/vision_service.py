import io
import os
import base64
import json
import re
from dotenv import load_dotenv

load_dotenv()

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini")


async def analyze_food_image(image_bytes: bytes) -> dict:
    """
    Send food image to Gemini Vision / OpenAI Vision and get nutritional breakdown.
    Returns: { name, estimated_calories, macros, confidence, note }
    """
    prompt = """Analyze this food image and provide a nutritional estimate.
Respond ONLY with valid JSON in this exact format:
{
  "name": "Food name",
  "estimated_calories": 350,
  "macros": {
    "proteinG": 12,
    "carbsG": 45,
    "fatG": 8,
    "fiberG": 4
  },
  "confidence": 0.85,
  "note": "Optional note about portion size or assumptions"
}
Be realistic. If you cannot identify the food, set confidence < 0.5 and name as "Unknown food"."""

    if AI_PROVIDER == "gemini":
        import google.generativeai as genai
        model = genai.GenerativeModel(os.getenv("AI_MODEL", "gemini-1.5-flash"))
        image_part = {"mime_type": "image/jpeg", "data": base64.b64encode(image_bytes).decode()}
        response = await model.generate_content_async([prompt, image_part])
        raw = response.text
    else:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        b64 = base64.b64encode(image_bytes).decode()
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                ],
            }],
        )
        raw = response.choices[0].message.content

    # Extract JSON from response
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        return json.loads(match.group())
    return {
        "name": "Unknown food",
        "estimated_calories": 0,
        "macros": {"proteinG": 0, "carbsG": 0, "fatG": 0, "fiberG": 0},
        "confidence": 0.0,
        "note": "Could not parse AI response.",
    }
