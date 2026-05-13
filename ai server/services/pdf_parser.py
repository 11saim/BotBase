from pypdf import PdfReader
import re

def parse_pdf(file_path: str) -> dict:
    reader = PdfReader(file_path)
    pages  = []

    for i, page in enumerate(reader.pages):
        try:
            # Try layout mode first
            text = page.extract_text(extraction_mode="layout")
        except Exception:
            try:
                # Fall back to plain mode
                text = page.extract_text()
            except Exception as e:
                print(f"Skipping page {i+1}: {e}")
                continue

        if text and text.strip():
            pages.append(text)

    if not pages:
        raise Exception("Could not extract any text from this PDF. It may be a scanned image.")

    raw_text = "\n\n".join(pages)

    # Fix broken words like "Embe ddabl e" → "Embeddable"
    text = re.sub(r'(?<=[a-zA-Z]) (?=[a-zA-Z])', '', raw_text)

    # Clean up
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return {
        "text": text,
        "pages": len(reader.pages)
    }