from dotenv import load_dotenv
load_dotenv()

from services.embedder import query_similar
from typing import Generator, Optional, List
import requests
import json
import os

STYLE_MAP = {
    "friendly": "Be warm, friendly, and approachable.",
    "formal":   "Be professional, clear, and concise.",
    "concise":  "Be very brief and to the point. Short answers only.",
}

def rag_answer(
    question:          str,
    bot_id:            str,
    active_source_ids: List[str]  = [],
    bot_settings:      Optional[dict] = None,
) -> Generator[str, None, None]:

    settings = bot_settings or {}

    if not question or len(question.strip()) < 2:
        yield "Please ask me a question!"
        return

    # Retrieve relevant chunks — filtered to active sources only
    context_chunks = query_similar(
        question,
        bot_id,
        top_k=5,
        active_source_ids=active_source_ids  # paused/deleted sources excluded
    )

    fallback = settings.get(
        "fallbackReply",  # matches widgetConfig.fallbackReply in Node.js
        "I don't have information about that in my knowledge base."
    )

    if not context_chunks:
        yield fallback
        return

    context       = "\n\n---\n\n".join(context_chunks)
    style         = STYLE_MAP.get(settings.get("responseStyle", "friendly"), STYLE_MAP["friendly"])
    language      = settings.get("language", "en")

    system_prompt = f"""You are an AI assistant. {style}
Answer questions ONLY based on the context below.
If the answer is not in the context, say exactly: "{fallback}"
Do not make up information. Answer naturally.
Respond in language code: {language}

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