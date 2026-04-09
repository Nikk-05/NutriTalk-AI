import json
import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from models.schemas import ChatRequest
from services.llm_service import chat_stream

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """
    Server-Sent Events endpoint for streaming AI chat responses.
    Frontend connects with EventSource or fetch with ReadableStream.

    SSE Format per chunk:
      data: {"delta": "token text"}    ← text token
      data: {"type": "recipe_card", "data": {...}}  ← structured card
      data: {"done": true}             ← stream complete
    """
    messages = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    messages.append({"role": "user", "content": request.message})

    async def event_generator():
        full_text = ""
        try:
            async for token in chat_stream(messages, request.user_context):
                full_text += token
                # Check if we have a complete <recipe> block to emit as structured card
                if "<recipe>" in full_text and "</recipe>" in full_text:
                    recipe_match = re.search(r'<recipe>(.*?)</recipe>', full_text, re.DOTALL)
                    if recipe_match:
                        try:
                            recipe_json = json.loads(recipe_match.group(1).strip())
                            yield f"data: {json.dumps({'type': 'recipe_card', 'data': recipe_json})}\n\n"
                            # Remove recipe block from streamed text
                            full_text = full_text.replace(recipe_match.group(0), "[See recipe card below]")
                        except json.JSONDecodeError:
                            pass

                yield f"data: {json.dumps({'delta': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield f"data: {json.dumps({'done': True, 'fullMessage': full_text})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/message")
async def chat_non_stream(request: ChatRequest):
    """
    Non-streaming fallback for environments that don't support SSE.
    Returns the full AI response at once.
    """
    messages = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    messages.append({"role": "user", "content": request.message})

    full_response = ""
    async for token in chat_stream(messages, request.user_context):
        full_response += token

    return {"data": {"message": full_response, "role": "ai"}}
