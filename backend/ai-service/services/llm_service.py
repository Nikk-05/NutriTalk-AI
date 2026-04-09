import os
from dotenv import load_dotenv

load_dotenv()

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini")
AI_MODEL    = os.getenv("AI_MODEL", "gemini-1.5-flash")

# ─── Gemini setup ───────────────────────────────────────────
if AI_PROVIDER == "gemini":
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    _gemini_model = genai.GenerativeModel(AI_MODEL)
else:
    from openai import AsyncOpenAI
    _openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


SYSTEM_PROMPT = """You are NutriTalk AI — an expert AI nutritionist and digital health curator.
You provide evidence-based, personalized nutrition advice.
You are warm, encouraging, and precise. Always prioritize user safety.
When generating recipes, include realistic nutritional data.
If a user asks about medical conditions, always advise consulting a healthcare professional.
Format responses concisely. Use bullet points for lists.
When you return a recipe, wrap it in <recipe> JSON tags so the frontend can render it as a card."""


async def chat_stream_gemini(messages: list, user_context: dict = None):
    """Stream chat response from Gemini."""
    history = []
    for msg in messages[:-1]:
        history.append({
            "role": "user" if msg["role"] == "user" else "model",
            "parts": [msg["content"]],
        })

    personalisation = ""
    if user_context:
        goal  = user_context.get("primaryGoal", "")
        diet  = user_context.get("dietaryRestriction", "")
        cals  = user_context.get("dailyCalorieTarget", "")
        personalisation = f"\nUser context: Goal={goal}, Diet={diet}, CalorieTarget={cals}"

    system = SYSTEM_PROMPT + personalisation
    last_user_msg = messages[-1]["content"]

    chat = _gemini_model.start_chat(history=history)
    response = await chat.send_message_async(
        f"{system}\n\nUser: {last_user_msg}",
        stream=True,
    )
    async for chunk in response:
        if chunk.text:
            yield chunk.text


async def chat_stream_openai(messages: list, user_context: dict = None):
    """Stream chat response from OpenAI."""
    personalisation = ""
    if user_context:
        goal = user_context.get("primaryGoal", "")
        diet = user_context.get("dietaryRestriction", "")
        personalisation = f" User goal: {goal}, Diet: {diet}."

    formatted = [{"role": "system", "content": SYSTEM_PROMPT + personalisation}]
    for msg in messages:
        formatted.append({"role": msg["role"] if msg["role"] == "user" else "assistant", "content": msg["content"]})

    stream = await _openai_client.chat.completions.create(
        model=AI_MODEL,
        messages=formatted,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def chat_stream(messages: list, user_context: dict = None):
    """Dispatch to the configured provider."""
    if AI_PROVIDER == "gemini":
        async for token in chat_stream_gemini(messages, user_context):
            yield token
    else:
        async for token in chat_stream_openai(messages, user_context):
            yield token


async def generate_text(prompt: str) -> str:
    """Non-streaming text generation (for diet plans)."""
    if AI_PROVIDER == "gemini":
        response = await _gemini_model.generate_content_async(prompt)
        return response.text
    else:
        response = await _openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
