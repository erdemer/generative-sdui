import os
import shutil
import io
import json
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
PROJECTS_DIR = os.path.join(BASE_DIR, "projects")

# Klasörleri oluştur (Garanti olsun)
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(CROPS_DIR, exist_ok=True)
os.makedirs(PROJECTS_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
# Global State
current_layout_mobile = None
current_layout_web = None
# Backwards compatibility / Default
current_layout = None 

variant_a = None
variant_b = None
ab_test_active = False

# API Key
api_key = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemini-3-flash-preview")

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
- **Column**: `verticalArrangement` (top, bottom, center, spacebetween, spacedby:N), `horizontalAlignment` (start, center, end).
- **Row**: `horizontalArrangement` (starts, center, end, spacebetween, spacedby:N), `verticalAlignment` (top, center, bottom).
- **Box**: Basic container. Good for distinct background blocks or overlays.
- **Spacer**: `height`, `width`.
- **BottomBar**: Fixed bottom navigation. Positioned at screen bottom, fills full width. Use for tab bars/navigation.
  - Props: `backgroundColor`, `horizontalArrangement` (spaceevenly, spacebetween, center), `padding`, `elevation`.
  - Children: Usually Icons with onClick handlers.


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

### 5. LIST & SETTINGS PATTERNS (CRITICAL)
- **Settings Groups**: Wrap list items in a `Card` or `Box` with `backgroundColor: "#FFFFFF"` and `corner: 16`.
- **List Items**: Use `Row` with `fillWidth: "true"` and `horizontalArrangement: "spacebetween"` (Left: Text, Right: Arrow Icon).
- **Separators**: Use `horizontalArrangement: "spacedby:0"` or generic Spacers if needed, but `spacedby` on parent Column is preferred for vertical rhythm.

### 6. ICON ROW ALIGNMENT (CRITICAL)
When creating rows of icons (action bars, navigation bars, toolbars):
- **ALWAYS** use `horizontalArrangement: "spaceevenly"` for equal spacing across the row.
- **ALWAYS** set `verticalAlignment: "center"` on the Row.
- **ALWAYS** set `fillWidth: "true"` on the Row to span full width.
### 7. MENU GRIDS (e.g., Dashboard Buttons)
When creating a row of equal-width buttons (e.g., "Bildirimler", "Cüzdanım", "Siparişlerim"):
- **CRITICAL**: EVERY child in the Row MUST have `"weight": 1`.
- This ensures they are perfectly equal width, regardless of text length.
- Example:
  ```json
  { "type": "Row", "children": [
      { "type": "Card", "props": { "weight": 1, ... } },
      { "type": "Card", "props": { "weight": 1, ... } }
  ]}
  ```

### 8. COMPONENT SPECIFICS
```json
{
  "type": "Row",
  "props": { "fillWidth": "true", "horizontalArrangement": "spaceevenly", "verticalAlignment": "center", "padding": "12, 16, 12, 16" },
  "children": [
    { "type": "Icon", "props": { "name": "refresh", "size": 28, "color": "#FFA726" } },
    { "type": "Icon", "props": { "name": "close", "size": 28, "color": "#EF5350" } },
    { "type": "Icon", "props": { "name": "star", "size": 28, "color": "#42A5F5" } }
  ]
}
```

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

PROMPT_WEB = """
You are an expert Web UI Engineer and Visual Designer. Your job is to transform user requests into "High Engineered" Server-Driven UI (SDUI) JSON responses for a Responsive Web Application.


### 1. RESPONSE FORMAT
You must output ONLY valid JSON. No Markdown, no explanations.

### 2. WEB PRINCIPLES
- **Full Width**: Web apps usually take full width. Use `fillMaxSize: "true"` for the root container.
- **Responsive Layout**:
  - Use `Row` with `horizontalArrangement: "spacebetween"` for Navigation bars.
  - Use `Row` with `weight` children for grid-like layouts (e.g. 3 cards side-by-side).
- **Navigation**:
  - Almost always start with a Top Navigation Bar (Logo left, Links/Profile right).
- **Scrolling**:
  - The main content should be scrollable (`scroll: "true"`).
- **Styling**:
  - Use plenty of whitespace (padding).
  - Use `shadow` or `elevation` for cards to make them pop on white backgrounds.
  - `backgroundColor` should generally be light (#FFFFFF, #F8F9FA) unless dark mode is requested.

### 3. COMPONENT REGISTRY (Same as Mobile)
- **Column**: `verticalArrangement` (top, bottom, center, spacebetween), `horizontalAlignment` (start, center, end).
- **Row**: `horizontalArrangement` (starts, center, end, spacebetween, spacedby:N), `verticalAlignment` (top, center, bottom).
- **Box**: Basic container.
- **Spacer**: `height`, `width`.
- **Text**, **Image**, **Button**, **Icon**: Standard props.

### 4. EXAMPLE (Web Dashboard)
Request: "A CRM Dashboard"
Output:
```json
{
  "screen_name": "WebCRM",
  "layout": {
    "type": "Column",
    "props": { "fillMaxSize": "true", "backgroundColor": "#F5F7FB" },
    "children": [
      {
         "type": "Row",
         "props": { "fillWidth": "true", "padding": "16, 32, 16, 32", "backgroundColor": "#FFFFFF", "elevation": 4, "horizontalArrangement": "spacebetween", "verticalAlignment": "center" },
         "children": [
            { "type": "Text", "props": { "text": "CRM Pro", "style": "h2", "fontWeight": "bold", "color": "#333" } },
            { "type": "Row", "props": { "horizontalArrangement": "spacedby:20" }, "children": [
                { "type": "Text", "props": { "text": "Dashboard", "color": "#666" } },
                { "type": "Text", "props": { "text": "Reports", "color": "#666" } },
                { "type": "Button", "props": { "text": "Logout", "backgroundColor": "#FF5252", "textColor": "#FFF" } }
            ]}
         ]
      },
      {
         "type": "Column",
         "props": { "weight": 1, "scroll": "true", "padding": "32" },
         "children": [
            { "type": "Text", "props": { "text": "Overview", "style": "h1", "marginBottom": 24 } },
            { "type": "Row", "props": { "fillWidth": "true", "horizontalArrangement": "spacedby:24" }, "children": [
                { "type": "Card", "props": { "weight": 1, "backgroundColor": "#FFF", "padding": 24, "corner": 8, "elevation": 2 }, "children": [...] },
                { "type": "Card", "props": { "weight": 1, "backgroundColor": "#FFF", "padding": 24, "corner": 8, "elevation": 2 }, "children": [...] }
            ]}
         ]
      }
    ]
  }
}
```

### 5. TASK
Generate the UI JSON for the following user request. Ensure strict JSON usage.
"""

SMART_CROP_PROMPT = """
### SMART CROP INSTRUCTIONS (CRITICAL)
- The user has uploaded an image and requested "Smart Crop".
- You MUST identify key objects or regions in the uploaded image that correspond to UI elements (e.g., product photos, header backgrounds).
- For EVERY `Image` component that represents a distinct object from the source image:
  - Add `image_crop`: [ymin, xmin, ymax, xmax] (0-1000 scale) to the `props`.
  - Example: If the user wants a layout with 2 shoes from the image:
    - Shoe 1: "image_crop": [200, 100, 400, 300]
    - Shoe 2: "image_crop": [500, 600, 800, 900]
- This allows the system to slice the original image and server them as high-quality assets.
"""

UI_VERIFY_PROMPT = """
You are an expert UI Quality Assurance reviewer. You will receive:
1. An SDUI JSON layout definition
2. A screenshot of how this JSON renders visually

Your job is to compare the rendered screenshot against the JSON and identify ANY visual or structural issues.

### VISUAL ISSUES TO CHECK:
- **Padding/Margin**: Elements too cramped or too spread out. Text touching edges without padding.
- **Colors**: Poor contrast (e.g., light text on light background), inconsistent color scheme, unreadable text.
- **Alignment**: Misaligned elements, uneven spacing between similar items.
- **Layout**: Overlapping elements, content cut off or overflowing, empty gaps where content should be.
- **Images**: Missing images, broken aspect ratios, images too small or too large for their container.
- **Typography**: Text too small to read, inconsistent font sizes for similar elements.
- **Overall Polish**: Does it look like a professional, well-designed app screen?

### STRUCTURAL JSON ISSUES TO CHECK:
- `scroll: "true"` on a container whose children have `weight` (causes infinite size error).
- Missing `fillWidth: "true"` on containers that should span full width.
- Missing `fillMaxSize: "true"` on root containers.
- Image components without `height` specified inside cards/lists (causes collapse).
- Empty `children` arrays.
- Missing `contentScale` on Image components.
- Rows without proper `horizontalArrangement` or `verticalAlignment`.

### RESPONSE FORMAT:
You must output ONLY valid JSON. No Markdown, no explanations, no commentary.

If issues are found:
- Fix ALL issues in the JSON and return the COMPLETE corrected JSON.
- Ensure the fix addresses both visual AND structural problems.

If no issues are found:
- Return the original JSON exactly as-is.

### CURRENT SDUI JSON:
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
        smart_crop: bool = Form(False),
        platform: str = Form("mobile"),
        language: str = Form("tr")
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
            
            # ALWAYS SELECT PROMPT BASED ON PLATFORM FIRST
            if platform == "web":
                print(f"🌐 Web Modu Seçildi")
                input_content.append(PROMPT_WEB)
            else:
                print(f"📱 Mobile Modu Seçildi")
                input_content.append(PROMPT_BASE)
            
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
            else:
                input_content.append(prompt)
                
            # Language Instruction
            if language == "en":
                input_content.append("IMPORTANT: Write all generated user interface text, titles, buttons, and content in English.")
            else:
                input_content.append("IMPORTANT: Write all generated user interface text, titles, buttons, and content in Turkish.")

            if pil_image:
                if smart_crop:
                    input_content.append(SMART_CROP_PROMPT)
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


@app.post("/verify")
async def verify_ui(
        json_data: str = Form(...),
        screenshot: UploadFile = File(...)
):
    """Verify and fix SDUI JSON by analyzing both the JSON structure and a visual screenshot."""
    try:
        print("🔍 UI Doğrulama başlatılıyor...")

        # Parse the incoming JSON
        original_json = json_repair.loads(json_data)

        # Read the screenshot image
        img_bytes = await screenshot.read()
        pil_screenshot = Image.open(io.BytesIO(img_bytes))

        # Build the verification prompt with the JSON embedded
        verify_input = [
            UI_VERIFY_PROMPT,
            json.dumps(original_json, indent=2, ensure_ascii=False) if hasattr(json, 'dumps') else str(original_json),
            "\n\n### RENDERED SCREENSHOT (analyze this visually):",
            pil_screenshot
        ]

        # Call Gemini Vision
        response = model.generate_content(verify_input)
        verified_json = json_repair.loads(response.text)

        # Check if changes were made
        if verified_json != original_json:
            print("✅ UI Doğrulama: Sorunlar bulundu ve düzeltildi!")
        else:
            print("✅ UI Doğrulama: Tasarım sorunsuz.")

        return verified_json

    except Exception as e:
        print(f"⚠️ UI Doğrulama hatası (orijinal JSON döndürülüyor): {e}")
        # Fail-open: return original JSON if verification fails
        try:
            return json_repair.loads(json_data)
        except:
            return {"detail": str(e), "layout": None}


@app.post("/update_layout")
async def update_layout(
    layout: dict = Body(...), 
    screen_name: str = Body("Untitled"), 
    platform: str = Body("mobile")
):
    global current_layout, current_layout_mobile, current_layout_web
    
    # Reconstruct the full SDUI response
    full_data = {
        "screen_name": screen_name,
        "layout": layout
    }
    
    # Store based on platform
    if platform == "web":
        current_layout_web = full_data
    else:
        current_layout_mobile = full_data
        
    # Keep legacy for fallback or default
    current_layout = full_data
    
    print(f"✅ Tasarım Güncellendi (Platform: {platform})")
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
async def get_current_ui(platform: str = "mobile"):
    import random
    
    candidate = None
    
    # Platforma göre layout getir
    if platform == "web" and current_layout_web:
        candidate = current_layout_web
    elif platform == "mobile" and current_layout_mobile:
        candidate = current_layout_mobile

    # A/B testi aktifse rastgele birini dön
    if not candidate and ab_test_active and variant_a and variant_b and platform != "web":
        chosen = random.choice(["A", "B"])
        print(f"🎲 A/B İsteği: Varyant {chosen} gönderildi.")
        candidate = variant_a if chosen == "A" else variant_b

    # Fallback legacy - REMOVED to prevent cross-platform leakage
    # if not candidate and current_layout:
    #     candidate = current_layout

    # VALIDATION: Check if candidate has required fields
    if candidate and "screen_name" in candidate and "layout" in candidate:
        return candidate

    # Hiçbir şey yoksa veya geçersizse default yapı dön

    # Hiçbir şey yoksa boş yerine default yapı dön
    return {
        "screen_name": "EmptyState",
        "layout": {
            "type": "Column",
            "props": {
                "fillMaxSize": "true",
                "verticalArrangement": "center",
                "horizontalAlignment": "center",
                "backgroundColor": "#FAFAFA"
            },
            "children": [
                {
                    "type": "Icon",
                    "props": {
                        "name": "palette",
                        "size": 48,
                        "color": "#D1D5DB"
                    }
                },
                {
                    "type": "Text",
                    "props": {
                        "text": "Henüz Tasarım Yok",
                        "style": "h3",
                        "color": "#9CA3AF",
                        "marginTop": 16,
                        "textAlign": "center"
                    }
                },
                {
                    "type": "Text",
                    "props": {
                        "text": "Sol menüden bir tasarım üretin.",
                        "style": "body",
                        "color": "#D1D5DB",
                        "marginTop": 8,
                        "textAlign": "center"
                    }
                }
            ]
        }
    }

@app.get("/api/fs/tree")
async def get_fs_tree():
    def get_tree(path):
        tree = []
        for item in os.listdir(path):
            if item.startswith('.'):
                continue
            item_path = os.path.join(path, item)
            rel_path = os.path.relpath(item_path, PROJECTS_DIR)
            is_dir = os.path.isdir(item_path)
            node = {
                "name": item,
                "path": rel_path,
                "is_dir": is_dir
            }
            if is_dir:
                node["children"] = get_tree(item_path)
            tree.append(node)
        return tree
    return {"status": "success", "tree": get_tree(PROJECTS_DIR)}


@app.post("/api/fs/folder")
async def create_folder(path: str):
    full_path = os.path.join(PROJECTS_DIR, path)
    os.makedirs(full_path, exist_ok=True)
    return {"status": "success"}


@app.post("/api/fs/file")
async def create_file(path: str):
    full_path = os.path.join(PROJECTS_DIR, path)
    if not full_path.endswith('.json'):
        full_path += '.json'
    if not os.path.exists(full_path):
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump({
                "screen_name": os.path.basename(full_path).replace('.json', ''),
                "layout": {
                    "type": "Column",
                    "props": {
                        "fillMaxSize": "true",
                        "backgroundColor": "#FFFFFF"
                    },
                    "children": []
                }
            }, f)
    return {"status": "success"}


@app.get("/api/fs/file")
async def get_file(path: str):
    full_path = os.path.join(PROJECTS_DIR, path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except:
                return {}
    raise HTTPException(status_code=404, detail="File not found")


@app.put("/api/fs/file")
async def update_file(path: str, data: dict = Body(...)):
    full_path = os.path.join(PROJECTS_DIR, path)
    with open(full_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return {"status": "success"}


@app.delete("/api/fs/item")
async def delete_item(path: str):
    full_path = os.path.join(PROJECTS_DIR, path)
    if os.path.exists(full_path):
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)
    return {"status": "success"}


@app.put("/api/fs/move")
async def move_item(source_path: str, target_path: str):
    full_source = os.path.join(PROJECTS_DIR, source_path)
    full_target = os.path.join(PROJECTS_DIR, target_path) if target_path else PROJECTS_DIR

    if not os.path.exists(full_source):
        raise HTTPException(status_code=404, detail="Source not found")
        
    basename = os.path.basename(full_source)
    final_destination = os.path.join(full_target, basename)
    
    # Prevent moving into itself
    if os.path.isdir(full_source) and full_target.startswith(full_source):
        raise HTTPException(status_code=400, detail="Cannot move a directory into itself")
        
    shutil.move(full_source, final_destination)
    return {"status": "success"}

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def read_index():
    return FileResponse('static/index.html')


if __name__ == "__main__":
    import uvicorn

    # Host 0.0.0.0 yaparak ağdaki diğer cihazların erişimine açıyoruz
    uvicorn.run(app, host="0.0.0.0", port=8000)