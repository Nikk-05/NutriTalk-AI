"""
Cross-session memory service.

Pattern: trigger-based extraction, batched (fire-and-forget after stream).
- should_extract(): cheap regex/length filter to skip noise
- extract_memories(): one Gemini call returning JSON array of durable facts
- persist_memories(): dedup against recent memories, write to Mongo
- load_memories(): fetch active memories for prompt injection
"""

import json
import re
from datetime import datetime
from bson import ObjectId
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

# Reuse the same Mongo connection style as chat_service.py
_mongo_client = MongoClient(
    os.getenv("MONGODB_URI"),
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=3000,
)
_db = _mongo_client["Nutritalk_ai"]
_memories = _db["usermemories"]  # Mongoose pluralises 'UserMemory' → 'usermemories'

# Cheap, structured-output model for extraction. Same family as the main chat
# model, but we keep it isolated so we can swap to an even smaller model later.
_extractor_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0.0,
    response_mime_type="application/json",
)

# ── Trigger heuristic ──────────────────────────────────────────────
# Phrases that signal the user just revealed a durable fact about themselves.
# Tuned for nutrition/health domain. Keep this list short and biased toward
# false positives — extractor will discard non-facts.
_TRIGGER_PATTERNS = re.compile(
    r"\b(i am|i'm|i have|i don't|i do not|i can't|i cannot|i hate|i love|"
    r"i prefer|i like|i dislike|allergic|allergy|intoler|vegan|vegetarian|"
    r"pescatarian|keto|paleo|diabet|lactose|gluten|my goal|i want to|"
    r"i'm trying|i need to|i avoid|never eat|always eat)\b",
    re.IGNORECASE,
)


def should_extract(user_message: str) -> bool:
    """Cheap filter: only run extraction when the message looks fact-bearing."""
    if not user_message or len(user_message.strip()) < 15:
        return False
    if user_message.strip().endswith("?") and len(user_message) < 80:
        # Short questions almost never contain durable facts.
        return False
    return bool(_TRIGGER_PATTERNS.search(user_message))


# ── Extraction prompt ──────────────────────────────────────────────
_EXTRACTION_PROMPT = """You extract DURABLE user facts from a nutrition chat exchange.

Return a JSON array of facts the assistant should remember in FUTURE conversations.
Each fact: {"content": "...", "category": "...", "confidence": 0.0-1.0}

Categories: preference, allergy, dislike, goal, habit, health, other

RULES:
- Only durable facts (allergies, goals, dietary identity, strong dislikes, health conditions).
- IGNORE ephemeral states ("I'm hungry", "I had a bad day", "today I ate X").
- IGNORE general questions ("what should I eat?").
- IGNORE the assistant's suggestions — only facts ABOUT the user.
- Phrase facts in third person, terse: "Allergic to peanuts" not "I am allergic to peanuts".
- Return [] if nothing durable was revealed.
- Maximum 3 facts per exchange.

Exchange:
USER: {user_message}
ASSISTANT: {assistant_message}

JSON array:"""


def extract_memories(user_message: str, assistant_message: str) -> list[dict]:
    """One LLM call. Returns parsed list of {content, category, confidence}."""
    try:
        prompt = _EXTRACTION_PROMPT.format(
            user_message=user_message[:2000],     # hard cap input
            assistant_message=assistant_message[:2000],
        )
        response = _extractor_model.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Gemini sometimes wraps JSON in ```json ... ```; strip if present.
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()

        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            return []

        # Sanitise each entry — drop anything malformed.
        valid_categories = {"preference", "allergy", "dislike", "goal", "habit", "health", "other"}
        cleaned = []
        for item in parsed[:3]:
            if not isinstance(item, dict):
                continue
            content = str(item.get("content", "")).strip()
            if not content or len(content) > 200:
                continue
            category = item.get("category", "other")
            if category not in valid_categories:
                category = "other"
            confidence = float(item.get("confidence", 0.7))
            confidence = max(0.0, min(1.0, confidence))
            cleaned.append({"content": content, "category": category, "confidence": confidence})
        return cleaned
    except Exception as e:
        print(f"[memory] extraction failed: {e}")
        return []


def _is_duplicate(user_id: ObjectId, content: str) -> bool:
    """Simple normalised string match against the user's recent memories."""
    norm = re.sub(r"\W+", " ", content.lower()).strip()
    if not norm:
        return True
    recent = _memories.find(
        {"userId": user_id, "active": True},
        {"content": 1},
    ).sort("createdAt", -1).limit(50)
    for doc in recent:
        existing_norm = re.sub(r"\W+", " ", doc["content"].lower()).strip()
        if existing_norm == norm:
            return True
        # Substring match: don't save "Vegan" if "Vegan, no dairy" exists, etc.
        if norm in existing_norm or existing_norm in norm:
            return True
    return False


def persist_memories(user_id: str, chat_id: str | None, memories: list[dict]) -> int:
    """Write extracted memories to Mongo, skipping duplicates. Returns count saved."""
    if not memories:
        return 0
    try:
        uid = ObjectId(user_id)
        cid = ObjectId(chat_id) if chat_id else None
    except Exception:
        return 0

    saved = 0
    docs = []
    for m in memories:
        if _is_duplicate(uid, m["content"]):
            continue
        docs.append({
            "userId": uid,
            "content": m["content"],
            "category": m["category"],
            "confidence": m["confidence"],
            "sourceChatId": cid,
            "active": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        })
    if docs:
        _memories.insert_many(docs)
        saved = len(docs)
    return saved


def load_memories(user_id: str, limit: int = 30) -> list[str]:
    """Fetch active memories for a user, newest first. Returns content strings."""
    try:
        uid = ObjectId(user_id)
    except Exception:
        return []
    cursor = _memories.find(
        {"userId": uid, "active": True},
        {"content": 1, "category": 1},
    ).sort([("confidence", -1), ("createdAt", -1)]).limit(limit)
    return [doc["content"] for doc in cursor]


async def extract_and_persist(user_id: str, chat_id: str, user_message: str, assistant_message: str):
    """Background task: gate on heuristic, extract, persist. Never raises."""
    try:
        if not user_id or not should_extract(user_message):
            return
        facts = extract_memories(user_message, assistant_message)
        if facts:
            saved = persist_memories(user_id, chat_id, facts)
            if saved:
                print(f"[memory] saved {saved} fact(s) for user {user_id}")
    except Exception as e:
        print(f"[memory] background task failed: {e}")
