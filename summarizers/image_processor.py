from PIL import Image
import pytesseract

def process_image(filepath):
    try:
        img = Image.open(filepath)
        text = pytesseract.image_to_string(img)
        if not text.strip():
            raise ValueError("No text extracted from image.")
        return text[:1000] + "..." if len(text) > 1000 else text
    except Exception as e:
        raise RuntimeError(f"Image processing failed: {str(e)}")