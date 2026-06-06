from sentence_transformers import SentenceTransformer
from typing import List, Optional
import faiss
import numpy as np
import json
import os

_model = None

def load_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def get_embeddings(texts: List[str]) -> np.ndarray:
    model = load_model()
    return model.encode(texts, show_progress_bar=False)

# ── Storage ───────────────────────────────────────────────────────────────────
# Each bot gets two files in ./faiss_db/{botId}/
#   index.faiss  → vectors
#   chunks.json  → [{ "text": "...", "sourceId": "..." }, ...]
# ─────────────────────────────────────────────────────────────────────────────

DB_PATH = os.path.join(os.path.dirname(__file__), "../faiss_db")

def get_bot_dir(bot_id: str) -> str:
    path = os.path.join(DB_PATH, bot_id)
    os.makedirs(path, exist_ok=True)
    return path

def embed_and_store(chunks: List[str], bot_id: str, source_id: str) -> int:
    print(f"Embedding {len(chunks)} chunks for bot: {bot_id}, source: {source_id}")

    embeddings = get_embeddings(chunks).astype("float32")
    faiss.normalize_L2(embeddings)

    bot_dir     = get_bot_dir(bot_id)
    index_path  = os.path.join(bot_dir, "index.faiss")
    chunks_path = os.path.join(bot_dir, "chunks.json")

    # Load existing index and chunks if bot already has sources
    if os.path.exists(index_path):
        index           = faiss.read_index(index_path)
        with open(chunks_path, "r", encoding="utf-8") as f:
            existing_chunks = json.load(f)
    else:
        dim             = embeddings.shape[1]  # 384
        index           = faiss.IndexFlatIP(dim)
        existing_chunks = []

    # Append new vectors to existing index
    index.add(embeddings)

    # Append new chunk metadata — store sourceId alongside text
    new_chunks = [{"text": chunk, "sourceId": source_id} for chunk in chunks]
    all_chunks = existing_chunks + new_chunks

    faiss.write_index(index, index_path)
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False)

    print(f"✓ Saved {len(chunks)} vectors to {bot_dir}")
    return len(chunks)


def query_similar(
    question:          str,
    bot_id:            str,
    top_k:             int       = 5,
    active_source_ids: List[str] = []
) -> List[str]:

    bot_dir     = get_bot_dir(bot_id)
    index_path  = os.path.join(bot_dir, "index.faiss")
    chunks_path = os.path.join(bot_dir, "chunks.json")

    if not os.path.exists(index_path):
        return []

    index = faiss.read_index(index_path)
    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    q_embedding = get_embeddings([question]).astype("float32")
    faiss.normalize_L2(q_embedding)

    # Fetch more than top_k so we have room to filter by sourceId
    fetch_k        = min(top_k * 3, len(chunks))
    distances, ids = index.search(q_embedding, fetch_k)

    results = []
    for dist, idx in zip(distances[0], ids[0]):
        if idx == -1:
            continue

        chunk = chunks[idx]

        # chunks.json may have old format (plain strings) — handle both
        if isinstance(chunk, str):
            results.append(chunk)
        else:
            # Filter out paused/deleted sources
            if active_source_ids and chunk["sourceId"] not in active_source_ids:
                continue
            results.append(chunk["text"])

        if len(results) == top_k:
            break

    return results


def delete_source(bot_id: str, source_id: str):
    """Remove all chunks belonging to a source — called on hard delete"""
    bot_dir     = get_bot_dir(bot_id)
    chunks_path = os.path.join(bot_dir, "chunks.json")

    if not os.path.exists(chunks_path):
        return

    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    # Keep only chunks not belonging to this source
    remaining = [c for c in chunks if isinstance(c, dict) and c["sourceId"] != source_id]

    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(remaining, f, ensure_ascii=False)

    print(f"✓ Removed chunks for source: {source_id} from bot: {bot_id}")


def delete_bot(bot_id: str):
    import shutil
    bot_dir = os.path.join(DB_PATH, bot_id)
    if os.path.exists(bot_dir):
        shutil.rmtree(bot_dir)
        print(f"✓ Deleted bot: {bot_id}")