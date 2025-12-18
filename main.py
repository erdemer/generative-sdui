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


# Bilgisayarın IP'sini alıyoruz (Örn: 192.168.1.35)
SERVER_IP = get_local_ip()
PORT = 8000
BASE_URL = f"http://{SERVER_IP}:{PORT}"

print(f"🚀 SERVER BAŞLATILIYOR... IP ADRESİ: {SERVER_IP}")
print(f"📱 Telefondan erişim için resimler şu adresten sunulacak: {BASE_URL}/static/crops/...")

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
Sen uzman bir Android UI tasarımcısısın. Senden istenen ekran tasarımlarını aşağıdaki JSON formatında oluşturmalısın.
Yanıtın SADECE JSON olmalı. Markdown bloğu kullanma.

Kurallar:
1. Root eleman her zaman bir "screen_name" ve "layout" içermelidir.
2. "layout" içinde "type", "props" ve "children" bulunur.
3. Renkler Hex kodu olarak verilmelidir (Örn: #FFFFFF).
4. İkon isimleri Material Icon isimleri olmalıdır.
5. Görsel (Image) kullanırken eğer kullanıcı bir resim yüklediyse "image_crop" koordinatları [ymin, xmin, ymax, xmax] (0-1000 arası) olarak belirtilmelidir.

Örnek Çıktı:
{
  "screen_name": "ClayfulHome",
  "layout": {
    "type": "Column",
    "props": {
      "fillMaxSize": "true",
      "backgroundColor": "#0E1110"
    },
    "children": [
      {
        "type": "Column",
        "props": {
          "weight": 1,
          "scroll": "true",
          "padding": 0
        },
        "children": [
          {
            "type": "Row",
            "props": {
              "padding": 24,
              "horizontalArrangement": "spacebetween",
              "verticalAlignment": "center"
            },
            "children": [
              {
                "type": "Text",
                "props": {
                  "text": "Clayful",
                  "style": "h1",
                  "color": "#FFFFFF",
                  "fontWeight": "bold"
                }
              },
              {
                "type": "Icon",
                "props": {
                  "name": "search",
                  "color": "#FFFFFF",
                  "size": 28
                }
              }
            ]
          },
          {
            "type": "Card",
            "props": {
              "color": "#1F2923",
              "corner": 50,
              "elevation": 0,
              "padding": 16,
              "margin": 24
            },
            "children": [
              {
                "type": "Row",
                "props": {
                  "verticalAlignment": "center"
                },
                "children": [
                  {
                    "type": "Icon",
                    "props": {
                      "name": "search",
                      "color": "#8D9A93",
                      "size": 24
                    }
                  },
                  {
                    "type": "Text",
                    "props": {
                      "text": "   Search for ceramics",
                      "style": "body",
                      "color": "#8D9A93"
                    }
                  }
                ]
              }
            ]
          },
          {
            "type": "Text",
            "props": {
              "text": "Featured",
              "style": "h2",
              "color": "#FFFFFF",
              "padding": 24,
              "fontWeight": "bold"
            }
          },
          {
            "type": "Row",
            "props": {
              "scroll": "true",
              "padding": 24,
              "horizontalArrangement": "spacedby:16"
            },
            "children": [
              {
                "type": "Column",
                "props": {},
                "children": [
                  {
                    "type": "Image",
                    "props": {
                      "image_crop": [250, 40, 530, 650],
                      "height": 280,
                      "width": 280,
                      "corner": 24,
                      "contentScale": "crop"
                    }
                  },
                  {
                    "type": "Text",
                    "props": {
                      "text": "Handmade Vase",
                      "style": "h2",
                      "color": "#FFFFFF",
                      "padding": 8
                    }
                  },
                  {
                    "type": "Text",
                    "props": {
                      "text": "By @PotteryPlace",
                      "style": "caption",
                      "color": "#8D9A93",
                      "padding": 8
                    }
                  }
                ]
              },
              {
                "type": "Column",
                "props": {},
                "children": [
                  {
                    "type": "Image",
                    "props": {
                      "image_crop": [250, 680, 530, 1000],
                      "height": 280,
                      "width": 280,
                      "corner": 24,
                      "contentScale": "crop"
                    }
                  },
                  {
                    "type": "Text",
                    "props": {
                      "text": "Handmade Bowl",
                      "style": "h2",
                      "color": "#FFFFFF",
                      "padding": 8
                    }
                  },
                  {
                    "type": "Text",
                    "props": {
                      "text": "By @ClayCreations",
                      "style": "caption",
                      "color": "#8D9A93",
                      "padding": 8
                    }
                  }
                ]
              }
            ]
          },
          {
            "type": "Text",
            "props": {
              "text": "Categories",
              "style": "h2",
              "color": "#FFFFFF",
              "padding": 24,
              "fontWeight": "bold"
            }
          },
          {
            "type": "Column",
            "props": {
              "padding": 24
            },
            "children": [
              {
                "type": "Row",
                "props": {
                  "horizontalArrangement": "spacedby:16"
                },
                "children": [
                  {
                    "type": "Card",
                    "props": {
                      "color": "#151C18",
                      "corner": 16,
                      "padding": 12,
                      "weight": 1
                    },
                    "children": [
                      {
                        "type": "Row",
                        "props": { "verticalAlignment": "center" },
                        "children": [
                          {
                            "type": "Image",
                            "props": {
                              "image_crop": [720, 80, 770, 190],
                              "height": 50,
                              "width": 50,
                              "corner": 12,
                              "contentScale": "crop"
                            }
                          },
                          {
                            "type": "Text",
                            "props": { "text": "   Vases", "style": "h2", "color": "#FFFFFF", "fontWeight": "bold" }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "Card",
                    "props": {
                      "color": "#151C18",
                      "corner": 16,
                      "padding": 12,
                      "weight": 1
                    },
                    "children": [
                      {
                        "type": "Row",
                        "props": { "verticalAlignment": "center" },
                        "children": [
                          {
                            "type": "Image",
                            "props": {
                              "image_crop": [720, 550, 770, 660],
                              "height": 50,
                              "width": 50,
                              "corner": 12,
                              "contentScale": "crop"
                            }
                          },
                          {
                            "type": "Text",
                            "props": { "text": "   Bowls", "style": "h2", "color": "#FFFFFF", "fontWeight": "bold" }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              { "type": "Spacer", "props": { "height": 16 } },
              {
                "type": "Row",
                "props": {
                  "horizontalArrangement": "spacedby:16"
                },
                "children": [
                  {
                    "type": "Card",
                    "props": {
                      "color": "#151C18",
                      "corner": 16,
                      "padding": 12,
                      "weight": 1
                    },
                    "children": [
                      {
                        "type": "Row",
                        "props": { "verticalAlignment": "center" },
                        "children": [
                          {
                            "type": "Image",
                            "props": {
                              "image_crop": [820, 80, 870, 190],
                              "height": 50,
                              "width": 50,
                              "corner": 12,
                              "contentScale": "crop"
                            }
                          },
                          {
                            "type": "Text",
                            "props": { "text": "   Mugs", "style": "h2", "color": "#FFFFFF", "fontWeight": "bold" }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "Card",
                    "props": {
                      "color": "#151C18",
                      "corner": 16,
                      "padding": 12,
                      "weight": 1
                    },
                    "children": [
                      {
                        "type": "Row",
                        "props": { "verticalAlignment": "center" },
                        "children": [
                          {
                            "type": "Image",
                            "props": {
                              "image_crop": [820, 550, 870, 660],
                              "height": 50,
                              "width": 50,
                              "corner": 12,
                              "contentScale": "crop"
                            }
                          },
                          {
                            "type": "Text",
                            "props": { "text": "   Plates", "style": "h2", "color": "#FFFFFF", "fontWeight": "bold" }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "Card",
            "props": {
              "color": "#0E1110",
              "corner": 0,
              "padding": 16,
              "elevation": 20
            },
            "children": [
              {
                "type": "Row",
                "props": {
                  "horizontalArrangement": "spacebetween"
                },
                "children": [
                  {
                    "type": "Column",
                    "props": { "horizontalAlignment": "center" },
                    "children": [
                      { "type": "Icon", "props": { "name": "home", "color": "#FFFFFF", "size": 24 } },
                      { "type": "Text", "props": { "text": "Home", "style": "caption", "color": "#FFFFFF" } }
                    ]
                  },
                  {
                    "type": "Column",
                    "props": { "horizontalAlignment": "center" },
                    "children": [
                      { "type": "Icon", "props": { "name": "shopping_bag", "color": "#53655B", "size": 24 } },
                      { "type": "Text", "props": { "text": "Shop", "style": "caption", "color": "#53655B" } }
                    ]
                  },
                  {
                    "type": "Column",
                    "props": { "horizontalAlignment": "center" },
                    "children": [
                      { "type": "Icon", "props": { "name": "add_circle", "color": "#53655B", "size": 24 } },
                      { "type": "Text", "props": { "text": "Sell", "style": "caption", "color": "#53655B" } }
                    ]
                  },
                  {
                    "type": "Column",
                    "props": { "horizontalAlignment": "center" },
                    "children": [
                      { "type": "Icon", "props": { "name": "chat", "color": "#53655B", "size": 24 } },
                      { "type": "Text", "props": { "text": "Chat", "style": "caption", "color": "#53655B" } }
                    ]
                  },
                  {
                    "type": "Column",
                    "props": { "horizontalAlignment": "center" },
                    "children": [
                      { "type": "Icon", "props": { "name": "person", "color": "#53655B", "size": 24 } },
                      { "type": "Text", "props": { "text": "Profile", "style": "caption", "color": "#53655B" } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
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
            # Yapay Zeka Modu (Kodun kısalığı için burayı özet geçiyorum, eski kodun aynısı)
            response = model.generate_content([PROMPT_BASE, prompt])
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


# ... Diğer endpointler (update_layout, publish_ab vs) aynı ...

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def read_index():
    return FileResponse('static/index.html')


if __name__ == "__main__":
    import uvicorn

    # Host 0.0.0.0 yaparak ağdaki diğer cihazların erişimine açıyoruz
    uvicorn.run(app, host="0.0.0.0", port=8000)