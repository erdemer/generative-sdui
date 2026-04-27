# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Generative SDUI is a FastAPI backend that uses Google Gemini AI to generate Server-Driven UI (SDUI) layouts in JSON format. It provides both an API for mobile/web clients and a web-based visual editor (SDUI Studio Pro) for creating and editing UI layouts.

## Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server (runs on port 8000, accessible from network)
python main.py
```

The server auto-detects local IP for network access. Set `RENDER_EXTERNAL_URL` environment variable for cloud deployment.

## Architecture

### Backend (`main.py`)
- **FastAPI application** with CORS enabled for all origins
- **AI Integration**: Uses `gemini-3-flash-preview` model via `google-generativeai` SDK
- **Two platform modes**: Mobile (default) and Web, each with specialized prompts (`PROMPT_BASE` for mobile, `PROMPT_WEB` for web)
- **Smart Crop feature**: When enabled, AI generates `image_crop` coordinates (0-1000 scale), which are processed to slice uploaded images into separate assets stored in `static/crops/`

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generate` | POST | Generate UI JSON from text prompt or image (supports `platform`, `smart_crop`, `current_json` for refinement) |
| `/update_layout` | POST | Store generated layout on server (per-platform: mobile/web) |
| `/current-ui` | GET | Retrieve stored layout (supports `platform` query param and A/B testing) |
| `/verify` | POST | Verify and fix SDUI JSON using Gemini Vision (accepts `json_data` + `screenshot` image) |
| `/publish_ab` | POST | Activate A/B testing with two layout variants |

### Frontend (`static/index.html`)
Single-page application providing:
- Text prompt input for AI generation
- Image upload with optional smart cropping
- Visual component tree editor
- Live preview panel (mobile phone mockup)
- Attributes panel for editing component properties
- JSON code view with syntax highlighting
- Light/dark theme support

### SDUI JSON Schema
The generated JSON follows this structure:
```json
{
  "screen_name": "ScreenName",
  "layout": {
    "type": "Column|Row|Box|Card|...",
    "props": { /* component properties */ },
    "children": [ /* nested components */ ]
  }
}
```

Key component types: `Column`, `Row`, `Box`, `Card`, `Text`, `Image`, `Button`, `Icon`, `Spacer`

### Configuration
- `GOOGLE_API_KEY`: Required in `.env` file for Gemini API access
- Generated crop images are stored in `static/crops/` (gitignored)
