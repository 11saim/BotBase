from sentence_transformers import SentenceTransformer
from typing import List
import faiss
import numpy as np
import json
import os

# Embedding model — same as before, no change
_model = None

def load_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def get_embeddings(texts: List[str]) -> np.ndarray:
    model = load_model()
    return model.encode(texts, show_progress_bar=False)

# ── Storage ──────────────────────────────────────────────────────
# Each bot gets two files saved in ./faiss_db/{botId}/
#   index.faiss  → the vectors (FAISS binary)
#   chunks.json  → the original text chunks
# ─────────────────────────────────────────────────────────────────

DB_PATH = os.path.join(os.path.dirname(__file__), "../faiss_db")

def get_bot_dir(bot_id: str) -> str:
    path = os.path.join(DB_PATH, bot_id)
    os.makedirs(path, exist_ok=True)
    return path

def embed_and_store(chunks: List[str], bot_id: str) -> int:
    print(f"Embedding {len(chunks)} chunks for bot: {bot_id}")

    # Get embeddings — shape: (num_chunks, 384)
    embeddings = get_embeddings(chunks).astype("float32")

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    # Create FAISS index
    dim   = embeddings.shape[1]  # 384
    index = faiss.IndexFlatIP(dim)  # Inner product = cosine on normalized vectors
    index.add(embeddings)

    # Save index + chunks
    bot_dir     = get_bot_dir(bot_id)
    index_path  = os.path.join(bot_dir, "index.faiss")
    chunks_path = os.path.join(bot_dir, "chunks.json")

    faiss.write_index(index, index_path)

    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False)

    print(f"✓ Saved {len(chunks)} vectors to {bot_dir}")
    return len(chunks)


def query_similar(question: str, bot_id: str, top_k: int = 5) -> List[str]:
    bot_dir     = get_bot_dir(bot_id)
    index_path  = os.path.join(bot_dir, "index.faiss")
    chunks_path = os.path.join(bot_dir, "chunks.json")

    # Bot doesn't exist
    if not os.path.exists(index_path):
        return []

    # Load index + chunks
    index  = faiss.read_index(index_path)

    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    # Embed the question
    q_embedding = get_embeddings([question]).astype("float32")
    faiss.normalize_L2(q_embedding)

    # Search — returns distances and indices of top_k matches
    k              = min(top_k, len(chunks))
    distances, ids = index.search(q_embedding, k)

    # Filter low relevance
    results = []
    for dist, idx in zip(distances[0], ids[0]):
        if idx != -1:
            results.append(chunks[idx])

    return results


def delete_bot(bot_id: str):
    import shutil
    bot_dir = os.path.join(DB_PATH, bot_id)
    if os.path.exists(bot_dir):
        shutil.rmtree(bot_dir)
        print(f"✓ Deleted bot: {bot_id}")