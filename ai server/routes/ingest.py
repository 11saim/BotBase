from fastapi import APIRouter, HTTPException, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json, uuid, os, httpx

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
    fileUrl:  str = Form(...),
    botId:    str = Form(""),
    sourceId: str = Form(""),
    botName:  str = Form(""),
    fileName: str = Form(""),  # pass original filename from Express for extension check
):
    if not botId:
        raise HTTPException(400, "botId is required")
    if not sourceId:
        raise HTTPException(400, "sourceId is required")
    if not fileUrl:
        raise HTTPException(400, "fileUrl is required")

    ext = os.path.splitext(fileName)[1].lower() if fileName else ".pdf"
    if ext not in [".pdf"]:
        raise HTTPException(400, "Only PDF files are supported")

    tmp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")

    async def generate():
        try:
            # Download from Supabase signed URL instead of reading UploadFile
            yield sse({"message": "Downloading file..."})
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.get(fileUrl)
                    resp.raise_for_status()
                with open(tmp_path, "wb") as f:
                    f.write(resp.content)
            except httpx.HTTPError:
                yield sse({"message": "Failed to download file from storage", "error": True})
                return

            yield sse({"message": f"Reading {fileName or 'file'}..."})

            result = parse_pdf(tmp_path)
            text   = result["text"]
            yield sse({"message": f"Extracted {result['pages']} pages"})

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

@router.get("/debug/disk-check")
async def disk_check():
    try:
        test_path = os.path.join(UPLOAD_DIR, "test.txt")
        with open(test_path, "w") as f:
            f.write("ok")
        os.remove(test_path)
        return {"writable": True}
    except Exception as e:
        return {"writable": False, "error": str(e)}