from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json, uuid, os, shutil

from services.pdf_parser import parse_pdf
from services.scraper    import scrape_url
from services.chunker    import chunk_text
from services.embedder   import embed_and_store

router     = APIRouter()
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def make_bot_id() -> str:
    return f"bot_{uuid.uuid4().hex[:12]}"

def sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


# ── POST /api/ingest/file ─────────────────────────────────────
@router.post("/file")
async def ingest_file(
    file:    UploadFile = File(...),
    botName: str        = Form(""),
    botId:   str        = Form("")
):
    # Validate file type
    allowed = [".pdf", ".txt"]
    ext     = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, "Only PDF and TXT files are supported")

    bot_id  = botId or make_bot_id()
    name    = botName or file.filename.replace(ext, "")

    # Save uploaded file temporarily
    tmp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")
    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    async def generate():
        try:
            yield sse({"message": f"Reading {file.filename}..."})

            # Extract text
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

            # Chunk
            yield sse({"message": "Splitting into chunks..."})
            chunks = chunk_text(text)
            print(f"DEBUG — extracted text length: {len(text)}")
            print(f"DEBUG — first 300 chars: {text[:300]}")
            print(f"DEBUG — chunk count: {len(chunks)}")
            yield sse({"message": f"Split into {len(chunks)} chunks"})

            # Embed + store (this is the heavy step)
            yield sse({"message": "Generating embeddings (runs on your CPU, free)..."})
            count = embed_and_store(chunks, bot_id)
            yield sse({"message": f"Stored {count} vectors in ChromaDB"})

            yield sse({
                "message":    "Bot is ready!",
                "done":       True,
                "botId":      bot_id,
                "botName":    name,
                "chunkCount": count,
                "source":     file.filename,
                "sourceType": "file"
            })

        except Exception as e:
            yield sse({"message": str(e), "error": True})
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── POST /api/ingest/url ──────────────────────────────────────
class URLRequest(BaseModel):
    url:     str
    botName: Optional[str] = ""
    botId:   Optional[str] = ""

@router.post("/url")
async def ingest_url(body: URLRequest):
    bot_id = body.botId or make_bot_id()

    async def generate():
        try:
            yield sse({"message": f"Fetching {body.url}..."})

            result = scrape_url(body.url)
            text   = result["text"]
            title  = result["title"]

            if len(text) < 50:
                yield sse({"message": "Could not extract text from URL", "error": True})
                return

            yield sse({"message": f'Scraped "{title}" — {len(text):,} characters'})

            yield sse({"message": "Splitting into chunks..."})
            chunks = chunk_text(text)
            yield sse({"message": f"Split into {len(chunks)} chunks"})

            yield sse({"message": "Generating embeddings..."})
            count = embed_and_store(chunks, bot_id)
            yield sse({"message": f"Stored {count} vectors in ChromaDB"})

            yield sse({
                "message":    "Bot is ready!",
                "done":       True,
                "botId":      bot_id,
                "botName":    body.botName or title,
                "chunkCount": count,
                "source":     body.url,
                "sourceType": "url"
            })

        except Exception as e:
            yield sse({"message": str(e), "error": True})

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── POST /api/ingest/text ─────────────────────────────────────
class TextRequest(BaseModel):
    text:    str
    botName: Optional[str] = "Text Bot"
    botId:   Optional[str] = ""

@router.post("/text")
async def ingest_text(body: TextRequest):
    if len(body.text.strip()) < 50:
        raise HTTPException(400, "Text must be at least 50 characters")

    bot_id = body.botId or make_bot_id()

    async def generate():
        try:
            yield sse({"message": f"Processing {len(body.text):,} characters..."})

            chunks = chunk_text(body.text)
            yield sse({"message": f"Split into {len(chunks)} chunks"})

            yield sse({"message": "Generating embeddings..."})
            count = embed_and_store(chunks, bot_id)
            yield sse({"message": f"Stored {count} vectors in ChromaDB"})

            yield sse({
                "message":    "Bot is ready!",
                "done":       True,
                "botId":      bot_id,
                "botName":    body.botName or "Text Bot",
                "chunkCount": count,
                "source":     "Pasted text",
                "sourceType": "text"
            })

        except Exception as e:
            yield sse({"message": str(e), "error": True})

    return StreamingResponse(generate(), media_type="text/event-stream")
