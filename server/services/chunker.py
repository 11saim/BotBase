from typing import List
import re

CHUNK_SIZE = 800   # reduced from 1800 — better for small PDFs
OVERLAP    = 100

def chunk_text(text: str) -> List[str]:
    # Split on sentence endings for better boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks  = []
    current = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        if len(current) + len(sentence) > CHUNK_SIZE and current:
            chunks.append(current.strip())
            # overlap: keep last part of previous chunk
            words        = current.split()
            current      = " ".join(words[-20:]) + " " + sentence
        else:
            current = (current + " " + sentence).strip()

    if current.strip() and len(current.strip()) > 30:
        chunks.append(current.strip())

    return [c for c in chunks if len(c) > 30]