from langgraph.graph import StateGraph,START,END
from typing import TypedDict, Annotated
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

model = ChatGoogleGenerativeAI(model = "gemini-2.5-flash-lite", temperature = 0.8)
class GenerativeState(TypedDict):
    query:str
    answer:str

def generate_text(state: GenerativeState)-> GenerativeState:
    query = state["query"]
    answer = model.invoke(query)
    return {"answer": answer.content}

graph = StateGraph(GenerativeState)

graph.add_node("generate_text", generate_text)
graph.add_edge(START, "generate_text")
graph.add_edge("generate_text", END)

workflow = graph.compile()

async def generate_diet(prompt: str) -> str:
    result = await workflow.ainvoke({"query": prompt})
    return result["answer"]