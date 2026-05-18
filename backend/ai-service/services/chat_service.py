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


def _build_personalisation(user_context: dict = None) -> list[BaseMessage]:
    personalisation = ""
    if not user_context:
        return ""
    
    goal = user_context.get("primaryGoal", "")
    diet = user_context.get("dietaryRestriction", "")
    cals = user_context.get("dailyCalorieTarget", "")
    personalisation = f"\nUser context: Goal={goal}, Diet={diet}, CalorieTarget={cals}"
    return personalisation





def run_chat(thread_id: str,new_message: str, user_context: dict = None) -> str:
    config = {"configurable": {"thread_id": thread_id}}

    # Check if this thread_id already has a conversation history in the DB, and if so, load it as context
    state = workflow.get_state(config=config)
    is_new_thread = not state.values.get("messages")  # If no messages, it's a new thread

    lc_messages = []

    if is_new_thread:
        personalisation = _build_personalisation(user_context)
        lc_messages.append(SystemMessage(content=SYSTEM_PROMPT + personalisation))

    lc_messages.append(HumanMessage(content=new_message))

    result = workflow.invoke({"messages": lc_messages}, config=config)
    return result["messages"][-1].content


async def stream_chat(thread_id: str, new_message: str, user_context: dict = None):
    """
    Async generator that yields response tokens one chunk at a time
    as the LLM produces them. Use with FastAPI StreamingResponse / SSE.
    """
    config = {"configurable": {"thread_id": thread_id}}
    state = workflow.get_state(config=config)
    is_new_thread = not state.values.get("messages")

    lc_messages = []
    if is_new_thread:
        personalisation = _build_personalisation(user_context)
        lc_messages.append(SystemMessage(content=SYSTEM_PROMPT + personalisation))
    lc_messages.append(HumanMessage(content=new_message))

    async for event in workflow.astream_events(
        {"messages": lc_messages},
        config=config,
        version="v2",
    ):
        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield chunk.content
