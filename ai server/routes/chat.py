from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from services.rag import rag_answer

router = APIRouter()

def sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"

class ChatRequest(BaseModel):
    botId:       str
    message:     str
    botSettings: Optional[dict] = {}

@router.post("/")
async def chat(body: ChatRequest):

    async def generate():
        try:
            # rag_answer is a generator that yields tokens
            for token in rag_answer(body.message, body.botId, body.botSettings):
                yield sse({"token": token})

            yield sse({"done": True})

        except Exception as e:
            yield sse({"error": str(e)})

    return StreamingResponse(generate(), media_type="text/event-stream")
