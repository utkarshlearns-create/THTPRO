
import sys
from pypdf import PdfReader

try:
    reader = PdfReader("c:/Users/brahm/.gemini/antigravity/brain/161659fa-6cd2-4a7b-8440-07fce1d68b82/requirements.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open("c:/Users/brahm/THTPRO/requirements.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
