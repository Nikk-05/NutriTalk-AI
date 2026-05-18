import json
import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from models.schemas import ChatRequest
from services.chat_service import run_chat, stream_chat

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
    async def event_generator():
        full_text = ""
        emitted_text = ""  # tracks what has actually been sent to the client as deltas
        recipe_emitted = False

        try:
            async for token in stream_chat(thread_id=request.thread_id, new_message=request.message, user_context=request.user_context):
                full_text += token

                # When the full <recipe>...</recipe> block is accumulated, emit card and replace inline
                if not recipe_emitted and "<recipe>" in full_text and "</recipe>" in full_text:
                    recipe_match = re.search(r'<recipe>(.*?)</recipe>', full_text, re.DOTALL)
                    if recipe_match:
                        try:
                            recipe_json = json.loads(recipe_match.group(1).strip())
                            yield f"data: {json.dumps({'type': 'recipe_card', 'data': recipe_json})}\n\n"
                            full_text = re.sub(r'<recipe>.*?</recipe>', '[See recipe card below]', full_text, flags=re.DOTALL)
                            recipe_emitted = True
                        except json.JSONDecodeError:
                            pass

                # Compute the "safe" text to emit — stop before any open <recipe> tag
                if "<recipe>" in full_text and not recipe_emitted:
                    safe_text = full_text[:full_text.index("<recipe>")]
                else:
                    safe_text = full_text

                # Only emit the newly safe portion (diff from what was already sent)
                if len(safe_text) > len(emitted_text):
                    new_delta = safe_text[len(emitted_text):]
                    emitted_text = safe_text
                    yield f"data: {json.dumps({'delta': new_delta})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            clean_message = re.sub(r'<recipe>.*?</recipe>', '[See recipe card below]', full_text, flags=re.DOTALL)
            # Strip any incomplete <recipe> tag that never closed
            if "<recipe>" in clean_message:
                clean_message = clean_message[:clean_message.index("<recipe>")]
            yield f"data: {json.dumps({'done': True, 'fullMessage': clean_message.strip()})}\n\n"

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
    full_response = run_chat(thread_id = request.thread_id, new_message = request.message, user_context = request.user_context)

    return {"data": {"message": full_response, "role": "ai"}}
