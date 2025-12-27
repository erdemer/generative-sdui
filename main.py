import os
import io
import uuid
import socket
import json_repair
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

app = FastAPI()


# --- OTOMATİK IP BULMA ---
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"


RENDER_URL = os.environ.get("RENDER_EXTERNAL_URL")

if RENDER_URL:
    BASE_URL = RENDER_URL
    print(f"☁️ BULUT MODU (Render): {BASE_URL}")
else:
    SERVER_IP = get_local_ip()
    PORT = 8000
    BASE_URL = f"http://{SERVER_IP}:{PORT}"
    print(f"🏠 YEREL MOD (Local): {BASE_URL}")


# Klasör Ayarları
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
CROPS_DIR = os.path.join(STATIC_DIR, "crops")

# Klasörleri oluştur (Garanti olsun)
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(CROPS_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
current_layout = None
variant_a = None
variant_b = None
ab_test_active = False

# API Key
api_key = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemini-2.5-flash")

# Promptlar
PROMPT_BASE = """
You are an expert Android UI Engineer and Visual Designer. Your job is to transform user requests into "High Engineered" Server-Driven UI (SDUI) JSON responses.

### 1. RESPONSE FORMAT
You must output ONLY valid JSON. No Markdown, no explanations.

### 2. CORE PRINCIPLES (High Engineering)
- **Responsive**: Use `weight` for fluid layouts. NEVER calculate fixed pixel widths for main containers.
- **Scroll Safety**:
  - `Column` with `scroll: "true"` can contain `Row`s.
  - `Row` with `scroll: "true"` can contain `Column`s.
  - **CRITICAL**: If a container parses `scroll: "true"`, its children MUST NOT have `weight`. Infinite height/width error will occur.
- **Data Types**:
  - `padding`/`margin`: Use string "top, right, bottom, left" (e.g., "16, 24, 16, 24") or single integer for all sides.
  - `colors`: ALWAYS use 6-digit Hex codes (e.g., "#0E1110") OR CSS Gradients (e.g., "linear-gradient(135deg, #FF0000, #0000FF)").
  - `corner`: Integer (dp).
  - `elevation`: Integer (dp).
  - `elevation`: Integer (dp).

### 3. CONSISTENCY RULES
- **Images**:
  - For images in Cards, Lists, or Grids, ALWAYS specify a fixed `height` (e.g., 150, 180, 200) and set `contentScale: 'crop'`.
  - **URL SOURCE**:
    - IF the user provides a specific URL, USE IT EXACTLY AS IS.
    - **PREFERRED**: Use `https://image.pollinations.ai/prompt/{description}?nologo=true`
      - Replace `{description}` with a SHORT, VISUAL English description.
      - **CRITICAL**: YOU MUST replace ALL SPACES with UNDERSCORES `_`. (e.g. `hot_coffee_cup` NOT `hot coffee cup`).
      - Usage of this service allows you to "generate" images matching the UI.
    - FALLBACK: `https://picsum.photos/{width}/{height}?random={random_int}`
    - **FORBIDDEN**: DO NOT generate `unsplash.com` URLs.
    - NEVER leave image dimensions auto in these contexts.

### 4. COMPONENT REGISTRY

#### Structure
- **Column**: `verticalArrangement` (top, bottom, center, spacebetween), `horizontalAlignment` (start, center, end).
- **Row**: `horizontalArrangement` (starts, center, end, spacebetween, spacedby:N), `verticalAlignment` (top, center, bottom).
- **Box**: Basic container. Good for distinct background blocks or overlays.
- **Spacer**: `height`, `width`.

#### Content
- **Text**:
  - `style`: "h1" (Header), "h2" (Subheader), "h3" (Title), "body", "caption".
  - `fontWeight`: "bold", "medium", "normal".
  - `textAlign`: "left", "center", "right".
- **Image**:
  - `url`: Absolute URL.
  - `contentScale`: "crop" (Cover), "fit" (Contain).
  - `image_crop`: [ymin, xmin, ymax, xmax] (0-1000 scale) IF creating from user uploaded image.
- **Button**:
  - `backgroundColor`, `textColor`, `corner`.
  - `text`.
- **Icon**:
  - `name`: Material Icon name (snake_case preferred, e.g., "arrow_back", "search", "shopping_bag").
  - `size`: Integer.

### 5. INTERACTIVITY & ACTIONS (NEW)
You can make any component interactive by adding an `onClick` property.
- `onClick`:
  - `type`: "toast", "alert", "navigate".
  - `message`: String (for toast/alert).
  - `destination`: String (for navigate, e.g. "ScreenName").
  - `url`: String (for openUrl).

**Example**:
```json
{
  "type": "Button",
  "props": {
    "text": "Buy Now",
    "onClick": { "type": "toast", "message": "Added to cart!" }
  }
}
```

### 4. EXAMPLE (Clayful Variant)

Request: "A dark mode ceramics store home page"

Output:
```json
{
  "screen_name": "ClayfulHome",
  "layout": {
    "type": "Column",
    "props": {
      "fillMaxSize": "true",
      "backgroundColor": "#121413"
    },
    "children": [
      {
        "type": "Row",
        "props": {
          "fillWidth": "true",
          "padding": "24, 16, 24, 16",
          "horizontalArrangement": "spacebetween",
          "verticalAlignment": "center"
        },
        "children": [
          {
            "type": "Text",
            "props": { "text": "Clayful", "style": "h1", "color": "#F0F2F1", "fontWeight": "bold" }
          },
          {
            "type": "Icon",
            "props": { "name": "search", "color": "#F0F2F1", "size": 24 }
          }
        ]
      },
      {
        "type": "Column",
        "props": {
          "weight": 1,
          "scroll": "true",
          "padding": "0, 24, 0, 24"
        },
        "children": [
          {
            "type": "Text",
            "props": { "text": "Featured", "style": "h2", "color": "#F0F2F1", "marginBottom": 16 }
          },
          {
             "type": "Row",
             "props": { "fillWidth": "true", "horizontalArrangement": "spacedby:16" },
             "children": [
                {
                   "type": "Card",
                   "props": { "weight": 1, "corner": 16, "backgroundColor": "#1E2220", "padding": 12 },
                   "children": [
                      { "type": "Image", "props": { "url": "...", "height": 180, "corner": 12 } },
                      { "type": "Text", "props": { "text": "Vase", "color": "#FFF", "marginTop": 8 } }
                   ]
                },
                {
                   "type": "Card",
                   "props": { "weight": 1, "corner": 16, "backgroundColor": "#1E2220", "padding": 12 },
                   "children": [
                      { "type": "Image", "props": { "url": "...", "height": 180, "corner": 12 } },
                      { "type": "Text", "props": { "text": "Bowl", "color": "#FFF", "marginTop": 8 } }
                   ]
                }
             ]
          }
        ]
      }
    ]
  }
}
```

### 5. TASK
Generate the UI JSON for the following user request. Ensure strict JSON usage.
"""


# --- RESİM KESME VE URL GÜNCELLEME ---
def process_crops(ui_data, original_image: Image.Image):
    img_w, img_h = original_image.size

    def recursive_crop(node):
        if not node: return

        # Props kontrolü
        if "props" in node and "image_crop" in node["props"]:
            try:
                bbox = node["props"]["image_crop"]
                # Liste değilse veya boşsa atla
                if not isinstance(bbox, list) or len(bbox) != 4: return

                ymin, xmin, ymax, xmax = bbox

                # Koordinat hesapla
                left = max(0, int((xmin / 1000) * img_w))
                top = max(0, int((ymin / 1000) * img_h))
                right = min(img_w, int((xmax / 1000) * img_w))
                bottom = min(img_h, int((ymax / 1000) * img_h))

                # Geçerli bir alan mı?
                if right > left and bottom > top:
                    cropped_img = original_image.crop((left, top, right, bottom))
                    filename = f"crop_{uuid.uuid4().hex}.png"
                    filepath = os.path.join(CROPS_DIR, filename)
                    cropped_img.save(filepath)

                    # URL OLUŞTURMA (IP ADRESİ İLE)
                    file_url = f"{BASE_URL}/static/crops/{filename}"
                    node["props"]["url"] = file_url

                    print(f"✅ Resim Kesildi ve Linklendi: {file_url}")

                # Temizlik
                del node["props"]["image_crop"]

            except Exception as e:
                print(f"⚠️ Kesme Hatası: {e}")

        if "children" in node:
            for child in node["children"]:
                recursive_crop(child)

    if "layout" in ui_data:
        recursive_crop(ui_data["layout"])

    return ui_data


@app.post("/generate")
async def generate_ui(
        prompt: str = Form(...),
        image: UploadFile = File(None),
        current_json: str = Form(None),
        smart_crop: bool = Form(False)
):
    try:
        parsed_json = None
        pil_image = None

        if image:
            img_bytes = await image.read()
            pil_image = Image.open(io.BytesIO(img_bytes))

        # --- MANUEL JSON MODU ---
        if prompt.strip().startswith("{"):
            print("📥 Manuel JSON algılandı, işleniyor...")
            parsed_json = json_repair.loads(prompt)
        else:
            # Yapay Zeka Modu
            input_content = []
            
            if current_json:
                print("✨ Revize Modu: Mevcut tasarım güncelleniyor...")
                REFINE_PROMPT = f"""
                You are modifying an existing SDUI JSON layout based on a user request.
                
                ### EXISTING JSON:
                {current_json}
                
                ### USER REQUEST:
                {prompt}
                
                ### INSTRUCTIONS:
                1. Modify the EXISTING JSON to satisfy the user request.
                2. Preserve the overall structure and existing components unless explicitly asked to change them.
                3. Keep existing `_id` values if possible to maintain state, or generate new ones if adding items.
                4. Output ONLY the valid, updated JSON. No Markdown.
                """
                input_content.append(REFINE_PROMPT)
                # Note: We don't necessarily need PROMPT_BASE here if we trust the model to follow the structure of the input JSON, 
                # but adding it creates consistency. Let's try appending the user prompt concept + base rules if needed. 
                # Actually, for refinement, specific instructions + existing JSON is usually better.
                # Let's keep it simple.
            else:
                input_content.append(PROMPT_BASE)
                input_content.append(prompt)

            if pil_image:
                input_content.append(pil_image)
            
            response = model.generate_content(input_content)
            parsed_json = json_repair.loads(response.text)

        # RESİM KESME İŞLEMİ
        # Resim yüklendiyse VE (Smart Crop seçiliyse YA DA Manuel JSON girdiysek)
        if pil_image and parsed_json:
            if smart_crop or prompt.strip().startswith("{"):
                print("✂️ Görsel kesim işlemi başlatılıyor...")
                parsed_json = process_crops(parsed_json, pil_image)

        return parsed_json

    except Exception as e:
        print(f"🔥 HATA: {e}")
        return {"detail": str(e), "layout": None}


@app.post("/update_layout")
async def update_layout(layout: dict = Body(...)):
    global current_layout
    current_layout = layout
    print("✅ Tasarım Güncellendi (Tekil Yayın)")
    return {"status": "success"}


@app.post("/publish_ab")
async def publish_ab(data: dict = Body(...)):
    global variant_a, variant_b, ab_test_active
    variant_a = data.get('layout_a')
    variant_b = data.get('layout_b')
    ab_test_active = True
    print("🚀 A/B Testi Başlatıldı")
    return {"status": "success"}


@app.get("/current-ui")
async def get_current_ui():
    import random
    # A/B testi aktifse rastgele birini dön
    if ab_test_active and variant_a and variant_b:
        chosen = random.choice(["A", "B"])
        print(f"🎲 A/B İsteği: Varyant {chosen} gönderildi.")
        return variant_a if chosen == "A" else variant_b

    # Değilse normal layoutu dön
    if current_layout:
        return current_layout

    # Hiçbir şey yoksa boş dön
    return {}

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def read_index():
    return FileResponse('static/index.html')


if __name__ == "__main__":
    import uvicorn

    # Host 0.0.0.0 yaparak ağdaki diğer cihazların erişimine açıyoruz
    uvicorn.run(app, host="0.0.0.0", port=8000)