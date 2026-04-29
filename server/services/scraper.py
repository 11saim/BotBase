import requests
from bs4 import BeautifulSoup
import re

def scrape_url(url: str) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; BotBase/1.0)"
    }

    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "noscript", "iframe", "form"]):
        tag.decompose()

    # Extract text
    text = soup.get_text(separator="\n")
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = text.strip()

    title = soup.title.string.strip() if soup.title else url

    return {
        "text": text,
        "title": title,
        "url": url
    }
