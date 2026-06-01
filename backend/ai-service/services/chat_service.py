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


def _build_personalisation(user_context: dict = None, user_id: str = None) -> str:
    """Build the personalisation block appended to the system prompt on a new thread.
    Combines static profile facts (from user_context) with cross-session memories
    (from the user_memories collection, keyed by user_id)."""
    parts = []

    if user_context:
        goal = user_context.get("primaryGoal", "")
        diet = user_context.get("dietaryRestriction", "")
        cals = user_context.get("dailyCalorieTarget", "")
        parts.append(f"\nUser context: Goal={goal}, Diet={diet}, CalorieTarget={cals}")

    if user_id:
        memories = load_memories(user_id, limit=30)
        if memories:
            bullets = "\n".join(f"- {m}" for m in memories)
            parts.append(f"\nKnown facts about this user (from past conversations):\n{bullets}")

    return "".join(parts)




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
            asyncio.get_event_loop().create_task(
                extract_and_persist(user_id, chat_id, new_message, reply)
            )
        except RuntimeError:
            # No running loop (called from sync context) — run inline as a fallback
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
        asyncio.create_task(
            extract_and_persist(user_id, chat_id, new_message, accumulated)
        )
