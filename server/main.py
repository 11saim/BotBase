from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from routes.ingest import router as ingest_router
from routes.chat import router as chat_router
from services.embedder import load_model

app = FastAPI(title="BotBase API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router, prefix="/api/ingest")
app.include_router(chat_router,   prefix="/api/chat")

@app.on_event("startup")
async def startup():
    # Pre-load the embedding model so first request isn't slow
    # Downloads ~90MB on first ever run, then cached locally forever
    print("\n⏳ Loading embedding model (first run downloads ~90MB)...")
    load_model()
    print("✓ Embedding model ready")
    print("✓ ChromaDB ready (local, no setup needed)")
    print(f"✓ Server running at http://localhost:{os.getenv('PORT', 3001)}\n")

@app.get("/health")
def health():
    return {"status": "ok", "message": "BotBase Python server is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 3001)), reload=True)
