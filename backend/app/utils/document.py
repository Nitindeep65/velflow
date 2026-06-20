import io
from pypdf import PdfReader
import docx

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Extracts raw text from PDF or DOCX file bytes. Falls back to plain text reading if parsing fails.
    """
    ext = ""
    if "." in filename:
        ext = filename[filename.rfind("."):].lower()

    text = ""

    try:
        if ext == ".pdf":
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as pdf_err:
                print(f"PdfReader failed on {filename}, attempting text read fallback: {pdf_err}")
                # Try fallback to reading as plain text
                try:
                    text = file_bytes.decode("utf-8", errors="ignore")
                except:
                    pass
        elif ext == ".docx":
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
        else:
            text = file_bytes.decode("utf-8", errors="ignore")
            
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        return ""

    # If we still got nothing, try reading the file as text as a last resort
    if not text.strip():
        try:
            fallback_text = file_bytes.decode("utf-8", errors="ignore")
            if fallback_text.strip() and not fallback_text.strip().startswith("%PDF"):
                return fallback_text.strip()
        except Exception:
            pass

    return text.strip()

