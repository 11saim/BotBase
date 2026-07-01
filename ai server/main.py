from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routes.ingest import router as ingest_router
from routes.chat import router as chat_router
from services.embedder import load_model

app = FastAPI(title="BotBase API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router, prefix="/api/ingest")
app.include_router(chat_router, prefix="/api/chat")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "BotBase Python server is running"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3001)),
        reload=False,   # Production
    )