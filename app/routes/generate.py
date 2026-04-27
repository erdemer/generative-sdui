import io
import json_repair
from fastapi import APIRouter, Form, File, UploadFile
from PIL import Image

from app.ai_client import model
from app.prompts import PROMPT_BASE, PROMPT_WEB, SMART_CROP_PROMPT
from app.services.image import process_crops

router = APIRouter()


@router.post("/generate")
async def generate_ui(
    prompt: str = Form(None),
    image: UploadFile = File(None),
    current_json: str = Form(None),
    smart_crop: bool = Form(False),
    platform: str = Form("mobile"),
    language: str = Form("tr"),
):
    try:
        if not prompt and not image:
            raise ValueError("prompt veya image gerekli")

        pil_image = None
        if image:
            img_bytes = await image.read()
            pil_image = Image.open(io.BytesIO(img_bytes))

        # Manual JSON mode
        if prompt and prompt.strip().startswith("{"):
            print("📥 Manuel JSON modu")
            parsed_json = json_repair.loads(prompt)
        else:
            input_content = [PROMPT_WEB if platform == "web" else PROMPT_BASE]
            print(f"{'🌐 Web' if platform == 'web' else '📱 Mobile'} modu")

            if current_json:
                print("✨ Revize modu")
                user_request = prompt or "Analyse the uploaded image and improve the existing design to match it."
                input_content.append(f"""
You are modifying an existing SDUI JSON layout based on a user request.

### EXISTING JSON:
{current_json}

### USER REQUEST:
{user_request}

### INSTRUCTIONS:
1. Modify the EXISTING JSON to satisfy the user request.
2. Preserve overall structure unless explicitly asked to change.
3. Keep existing `_id` values where possible.
4. If the request mentions a `$label`, target components with that sduiLabel.
5. Output ONLY valid JSON. No Markdown.
""")
            elif prompt:
                input_content.append(prompt)
            else:
                input_content.append("Generate a beautiful UI based on the uploaded image.")

            lang_note = (
                "IMPORTANT: Write all UI text, titles, buttons in English."
                if language == "en"
                else "IMPORTANT: Write all UI text, titles, buttons in Turkish."
            )
            input_content.append(lang_note)

            if pil_image:
                if smart_crop:
                    input_content.append(SMART_CROP_PROMPT)
                input_content.append(pil_image)

            response = model.generate_content(input_content)
            parsed_json = json_repair.loads(response.text)

        if pil_image and parsed_json:
            if smart_crop or (prompt and prompt.strip().startswith("{")):
                print("✂️ Smart crop başlatılıyor")
                parsed_json = process_crops(parsed_json, pil_image)

        return parsed_json

    except Exception as e:
        print(f"🔥 Generate hatası: {e}")
        return {"detail": str(e), "layout": None}
