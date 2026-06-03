import asyncio
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated
from pymongo import MongoClient
from langgraph.checkpoint.mongodb import MongoDBSaver
import os
import certifi
from dotenv import load_dotenv

from services.memory_service import load_memories, extract_and_persist

# Strong references to background extraction tasks so they don't get GC'd
# before completing. Tasks remove themselves from the set on done.
_background_tasks: set[asyncio.Task] = set()


def _spawn_extraction(user_id: str, chat_id: str, user_msg: str, ai_msg: str):
    task = asyncio.create_task(extract_and_persist(user_id, chat_id, user_msg, ai_msg))
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)

load_dotenv()

mongo_client = MongoClient(
    os.getenv("MONGODB_URI"),
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=3000,
    )

checkpointer = MongoDBSaver(
    client= mongo_client,
    db_name="Nutritalk_ai",
    checkpoint_collection_name = "checkpoints",
    writes_collection_name = "checkpoint_writes",
)


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.9)


def chat_node(state: ChatState) -> ChatState:
    response = model.invoke(state["messages"])
    return {"messages": [response]}


graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)
workflow = graph.compile(checkpointer=checkpointer)


SYSTEM_PROMPT = """You are NutriTalk AI — an expert AI nutritionist and digital health curator.
You provide evidence-based, personalized nutrition advice.
You are warm, encouraging, and precise. Always prioritize user safety.
If a user asks about medical conditions, always advise consulting a healthcare professional.
Format responses using markdown: **bold** for emphasis, bullet lists with `* item`, numbered lists with `1. item`.
When you include a recipe, embed exactly one JSON block wrapped in <recipe>...</recipe> tags using this schema:
<recipe>{"title":"Recipe Name","description":"One-line description","prep":"25 min","calories":350,"protein":28,"fiber":8}</recipe>
All numeric fields (calories, protein, fiber) must be plain integers — no units or strings."""


def _format_profile_block(user_context: dict) -> str:
    """Render the static profile facts that live in the User collection.
    These come from signup/profile pages — 100% reliable, never inferred."""
    if not user_context:
        return ""

    # Read every potentially-present field; skip empties on output.
    name     = user_context.get("name")
    age      = user_context.get("age")
    gender   = user_context.get("gender")
    height   = user_context.get("heightCm")
    weight   = user_context.get("currentWeightKg")
    target   = user_context.get("targetWeightKg")
    activity = user_context.get("activityLevel")
    goal     = user_context.get("primaryGoal")
    diet     = user_context.get("dietaryRestriction")
    cals     = user_context.get("dailyCalorieTarget")
    cuisines = user_context.get("cuisinePreferences") or []
    allergies = user_context.get("allergies") or []

    lines = ["USER PROFILE (from their account — always treat as ground truth):"]
    if name:                                  lines.append(f"- Name: {name}")
    if age:                                   lines.append(f"- Age: {age}")
    if gender and gender != "prefer_not_to_say": lines.append(f"- Gender: {gender}")
    if height:                                lines.append(f"- Height: {height} cm")
    if weight:                                lines.append(f"- Current weight: {weight} kg")
    if target:                                lines.append(f"- Target weight: {target} kg")
    if activity:                              lines.append(f"- Activity level: {activity}")
    if goal:                                  lines.append(f"- Primary goal: {goal}")
    if diet and diet != "None":               lines.append(f"- Dietary restriction: {diet}")
    if cals:                                  lines.append(f"- Daily calorie target: {cals}")
    if cuisines:                              lines.append(f"- Preferred cuisines: {', '.join(cuisines)}")
    if allergies:                             lines.append(f"- Allergies: {', '.join(allergies)}")

    # Only worth emitting if we got more than just the header.
    return "\n".join(lines) if len(lines) > 1 else ""


def _format_memory_block(user_id: str) -> str:
    """Render learned facts from past conversations.
    These come from the extractor — best-effort, can be edited by the user."""
    if not user_id:
        return ""
    memories = load_memories(user_id, limit=30)
    if not memories:
        return ""
    bullets = "\n".join(f"- {m}" for m in memories)
    return (
        "REMEMBERED FROM PAST CONVERSATIONS "
        "(learned in chat — treat as personal context):\n"
        f"{bullets}"
    )


def _build_personalisation(user_context: dict = None, user_id: str = None) -> str:
    """Compose the personalisation suffix appended to SYSTEM_PROMPT on a new thread.

    Two layers:
      1. Profile block  — structured data from the User collection (name, goals, etc.)
      2. Memory block   — facts the user revealed in earlier chats

    Both are injected together so the model sees the user holistically."""
    blocks = [
        _format_profile_block(user_context or {}),
        _format_memory_block(user_id),
    ]
    blocks = [b for b in blocks if b]
    if not blocks:
        return ""

    instruction = (
        "When the user asks about themselves (name, age, goal, weight, diet, etc.), "
        "answer directly from the information above. Greet them by name when natural."
    )
    return "\n\n" + "\n\n".join(blocks) + "\n\n" + instruction




def run_chat(thread_id: str, new_message: str, user_context: dict = None,
             user_id: str = None, chat_id: str = None) -> str:
    config = {"configurable": {"thread_id": thread_id}}

    # Check if this thread_id already has a conversation history in the DB, and if so, load it as context
    state = workflow.get_state(config=config)
    is_new_thread = not state.values.get("messages")  # If no messages, it's a new thread

    lc_messages = []

    if is_new_thread:
        personalisation = _build_personalisation(user_context, user_id)
        lc_messages.append(SystemMessage(content=SYSTEM_PROMPT + personalisation))

    lc_messages.append(HumanMessage(content=new_message))

    result = workflow.invoke({"messages": lc_messages}, config=config)
    reply = result["messages"][-1].content

    # Fire-and-forget cross-session memory extraction
    if user_id:
        try:
            asyncio.get_running_loop()
            _spawn_extraction(user_id, chat_id, new_message, reply)
        except RuntimeError:
            # No running loop (sync call) — run extraction inline as fallback
            asyncio.run(extract_and_persist(user_id, chat_id, new_message, reply))

    return reply


async def stream_chat(thread_id: str, new_message: str, user_context: dict = None,
                      user_id: str = None, chat_id: str = None):
    """
    Async generator that yields response tokens one chunk at a time
    as the LLM produces them. Use with FastAPI StreamingResponse / SSE.

    After the stream completes, fires a background task to extract durable
    user facts into the cross-session memory store.
    """
    config = {"configurable": {"thread_id": thread_id}}
    state = workflow.get_state(config=config)
    is_new_thread = not state.values.get("messages")

    lc_messages = []
    if is_new_thread:
        personalisation = _build_personalisation(user_context, user_id)
        lc_messages.append(SystemMessage(content=SYSTEM_PROMPT + personalisation))
    lc_messages.append(HumanMessage(content=new_message))

    accumulated = ""
    async for event in workflow.astream_events(
        {"messages": lc_messages},
        config=config,
        version="v2",
    ):
        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                accumulated += chunk.content
                yield chunk.content

    # Stream finished — kick off memory extraction in the background.
    # Doesn't block the SSE response from closing.
    if user_id and accumulated:
        _spawn_extraction(user_id, chat_id, new_message, accumulated)
