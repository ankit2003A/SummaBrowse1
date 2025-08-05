import fitz  # PyMuPDF

def process_pdf(filepath):
    try:
        doc = fitz.open(filepath)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        if not text.strip():
            raise ValueError("No text found in PDF.")
        return text[:1000] + "..." if len(text) > 1000 else text
    except Exception as e:
        raise RuntimeError(f"PDF processing failed: {str(e)}")