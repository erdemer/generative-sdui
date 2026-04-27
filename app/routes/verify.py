import io
import json
import json_repair
from fastapi import APIRouter, Form, File, UploadFile
from PIL import Image

from app.ai_client import model
from app.prompts import UI_VERIFY_PROMPT

router = APIRouter()


@router.post("/verify")
async def verify_ui(
    json_data: str = Form(...),
    screenshot: UploadFile = File(...),
):
    try:
        print("🔍 UI doğrulama başladı")
        original = json_repair.loads(json_data)
        img_bytes = await screenshot.read()
        pil_screenshot = Image.open(io.BytesIO(img_bytes))

        verify_input = [
            UI_VERIFY_PROMPT,
            json.dumps(original, indent=2, ensure_ascii=False),
            "\n\n### RENDERED SCREENSHOT:",
            pil_screenshot,
        ]
        response = model.generate_content(verify_input)
        verified = json_repair.loads(response.text)

        if verified != original:
            print("✅ Auditor: sorunlar düzeltildi")
        else:
            print("✅ Auditor: tasarım sorunsuz")

        return verified

    except Exception as e:
        print(f"⚠️ Verify hatası (orijinal döndürülüyor): {e}")
        try:
            return json_repair.loads(json_data)
        except Exception:
            return {"detail": str(e), "layout": None}
