from dotenv import load_dotenv
load_dotenv()

from services.embedder import query_similar
from typing import Generator, Optional
import requests
import json
import os

TONE_MAP = {
    "Friendly":     "Be warm, friendly, and approachable.",
    "Professional": "Be professional, clear, and concise.",
    "Concise":      "Be very brief and to the point. Short answers only.",
    "Playful":      "Be fun, engaging, and use a light tone.",
}

def rag_answer(
    question:     str,
    bot_id:       str,
    bot_settings: Optional[dict] = None,
) -> Generator[str, None, None]:

    settings = bot_settings or {}

    if not question or len(question.strip()) < 2:
        yield "Please ask me a question!"
        return

    # Retrieve relevant chunks from FAISS
    context_chunks = query_similar(question, bot_id, top_k=5)

    fallback = settings.get(
        "fallbackMessage",
        "I don't have information about that in my knowledge base."
    )

    if not context_chunks:
        yield fallback
        return

    context  = "\n\n---\n\n".join(context_chunks)
    tone     = TONE_MAP.get(settings.get("tone", "Friendly"), TONE_MAP["Friendly"])
    bot_name = settings.get("name", "AI Assistant")

    system_prompt = f"""You are {bot_name}. {tone}
Answer questions ONLY based on the context below.
If the answer is not in the context, say exactly: "{fallback}"
Do not make up information. Answer naturally.

CONTEXT:
{context}"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type":  "application/json"
            },
            json={
                "model": os.getenv("LLM_MODEL", "meta-llama/llama-3.2-3b-instruct:free"),
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": question}
                ],
                "stream": True
            },
            stream=True,
            timeout=30
        )

        for line in response.iter_lines():
            if not line:
                continue

            line = line.decode("utf-8")

            if line == "data: [DONE]":
                break

            if line.startswith("data: "):
                try:
                    data  = json.loads(line[6:])
                    token = data["choices"][0]["delta"].get("content", "")
                    if token:
                        yield token
                except:
                    continue

    except requests.exceptions.Timeout:
        yield "Request timed out. Please try again."
    except Exception as e:
        print(f"OpenRouter error: {e}")
        yield "Something went wrong. Please try again."