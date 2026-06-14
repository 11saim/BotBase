from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json, uuid, os, shutil

from services.pdf_parser import parse_pdf
from services.chunker    import chunk_text
from services.embedder   import embed_and_store

router     = APIRouter()
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


# ── POST /api/ingest/file ─────────────────────────────────────
@router.post("/file")
async def ingest_file(
    file:     UploadFile = File(...),
    botId:    str        = Form(""),
    sourceId: str        = Form(""),
    botName:  str        = Form(""),
):
    allowed = [".pdf", ".txt"]
    ext     = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, "Only PDF and TXT files are supported")

    if not botId:
        raise HTTPException(400, "botId is required")
    if not sourceId:
        raise HTTPException(400, "sourceId is required")

    name     = botName or file.filename.replace(ext, "")
    tmp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")

    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    async def generate():
        try:
            yield sse({"message": f"Reading {file.filename}..."})

            if ext == ".pdf":
                result = parse_pdf(tmp_path)
                text   = result["text"]
                yield sse({"message": f"Extracted {result['pages']} pages"})
            else:
                with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                yield sse({"message": "Read text file"})

            if len(text) < 50:
                yield sse({"message": "Could not extract enough text", "error": True})
                return

            yield sse({"message": f"Extracted {len(text):,} characters"})

            yield sse({"message": "Splitting into chunks..."})
            chunks = chunk_text(text)
            yield sse({"message": f"Split into {len(chunks)} chunks"})

            yield sse({"message": "Generating embeddings..."})
            count = embed_and_store(chunks, botId, source_id=sourceId)
            yield sse({"message": f"Stored {count} vectors"})

            yield sse({
                "message":    "Ready!",
                "done":       True,
                "chunkCount": count,
                "sourceType": "file"
            })

        except Exception as e:
            yield sse({"message": str(e), "error": True})
            print("error while uploading pdf", e)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── POST /api/ingest/text ─────────────────────────────────────
class TextRequest(BaseModel):
    text:     str
    botId:    str
    sourceId: str           # added
    botName:  Optional[str] = "Text Bot"

@router.post("/text")
async def ingest_text(body: TextRequest):
    if len(body.text.strip()) < 50:
        raise HTTPException(400, "Text must be at least 50 characters")
    if not body.botId:
        raise HTTPException(400, "botId is required")
    if not body.sourceId:
        raise HTTPException(400, "sourceId is required")

    async def generate():
        try:
            yield sse({"message": f"Processing {len(body.text):,} characters..."})

            chunks = chunk_text(body.text)
            yield sse({"message": f"Split into {len(chunks)} chunks"})

            yield sse({"message": "Generating embeddings..."})
            count = embed_and_store(chunks, body.botId, source_id=body.sourceId)
            yield sse({"message": f"Stored {count} vectors"})

            yield sse({
                "message":    "Ready!",
                "done":       True,
                "chunkCount": count,
                "sourceType": "text"
            })

        except Exception as e:
            yield sse({"message": str(e), "error": True})

    return StreamingResponse(generate(), media_type="text/event-stream")