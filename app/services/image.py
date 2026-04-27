import uuid
import os
from PIL import Image
from app.config import CROPS_DIR, BASE_URL


def process_crops(ui_data: dict, original_image: Image.Image) -> dict:
    img_w, img_h = original_image.size

    def _crop_node(node):
        if not node:
            return
        if "props" in node and "image_crop" in node["props"]:
            try:
                bbox = node["props"]["image_crop"]
                if not isinstance(bbox, list) or len(bbox) != 4:
                    return
                ymin, xmin, ymax, xmax = bbox
                left   = max(0, int((xmin / 1000) * img_w))
                top    = max(0, int((ymin / 1000) * img_h))
                right  = min(img_w, int((xmax / 1000) * img_w))
                bottom = min(img_h, int((ymax / 1000) * img_h))
                if right > left and bottom > top:
                    cropped = original_image.crop((left, top, right, bottom))
                    filename = f"crop_{uuid.uuid4().hex}.png"
                    cropped.save(os.path.join(CROPS_DIR, filename))
                    node["props"]["url"] = f"{BASE_URL}/static/crops/{filename}"
                    print(f"✅ Crop saved: {filename}")
            except Exception as e:
                print(f"⚠️ Crop error: {e}")
            finally:
                node["props"].pop("image_crop", None)
        for child in node.get("children", []):
            _crop_node(child)

    if "layout" in ui_data:
        _crop_node(ui_data["layout"])
    return ui_data
