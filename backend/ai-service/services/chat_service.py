from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated
from dotenv import load_dotenv

load_dotenv()


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
workflow = graph.compile()


SYSTEM_PROMPT = """You are NutriTalk AI — an expert AI nutritionist and digital health curator.
You provide evidence-based, personalized nutrition advice.
You are warm, encouraging, and precise. Always prioritize user safety.
When generating recipes, include realistic nutritional data.
If a user asks about medical conditions, always advise consulting a healthcare professional.
Format responses concisely. Use bullet points for lists.
When you return a recipe, wrap it in <recipe> JSON tags so the frontend can render it as a card."""


def _build_lc_messages(messages: list, user_context: dict = None) -> list[BaseMessage]:
    personalisation = ""
    if user_context:
        goal = user_context.get("primaryGoal", "")
        diet = user_context.get("dietaryRestriction", "")
        cals = user_context.get("dailyCalorieTarget", "")
        personalisation = f"\nUser context: Goal={goal}, Diet={diet}, CalorieTarget={cals}"

    lc_messages: list[BaseMessage] = [SystemMessage(content=SYSTEM_PROMPT + personalisation)]
    for msg in messages:
        if msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        else:
            lc_messages.append(AIMessage(content=msg["content"]))
    return lc_messages


def run_chat(messages: list, user_context: dict = None) -> str:
    lc_messages = _build_lc_messages(messages, user_context)
    result = workflow.invoke({"messages": lc_messages})
    return result["messages"][-1].content


async def stream_chat(messages: list, user_context: dict = None):
    """
    Async generator that yields response tokens one chunk at a time
    as the LLM produces them. Use with FastAPI StreamingResponse / SSE.
    """
    lc_messages = _build_lc_messages(messages, user_context)

    async for event in workflow.astream_events(
        {"messages": lc_messages},
        version="v2",
    ):
        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield chunk.content
