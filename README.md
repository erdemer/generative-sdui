# Generative SDUI (Server Driven UI)

This project is a FastAPI-based backend that leverages Google's Gemini AI to generate Android UI layouts in JSON format, facilitating a Server Driven UI (SDUI) architecture. It allows users to describe interfaces via text prompts or upload images to generate corresponding JSON UI definitions.

## Features

- **Generative UI**: Uses Google Gemini Pro Vision (gemini-2.5-flash) to generate UI layouts from text prompts or image inputs.
- **Server Driven UI Protocol**: Outputs JSON following a specific "screen_name" and "layout" structure compatible with a matching Android SDUI client.
- **Smart Image Cropping**: Automatically detects and crops relevant parts of uploaded images to be used within the generated UI.
- **Dynamic Content Serving**: Serves generated/cropped images locally.

## Prerequisites

- Python 3.8+
- A Google Cloud API Key for Gemini.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd generative-sdui
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configuration:**
    Create a `.env` file in the root directory and add your Google API key:
    ```env
    GOOGLE_API_KEY=your_actual_api_key_here
    ```

## Usage

1.  **Start the server:**
    ```bash
    python main.py
    ```
    The server will start, typically finding your local IP address (e.g., `http://192.168.1.x:8000`).

2.  **Access the API:**
    - **UI Generation**: POST request to `/generate`
        - `prompt`: Text description of the UI (or a JSON structure).
        - `image`: (Optional) Image file to base the UI on.
        - `smart_crop`: (Optional Boolean) Enable automatic image cropping.
    - **Frontend**: Open `http://localhost:8000` (or the printed IP) in your browser to inspect served files (if index.html exists).

## API Endpoints

- **`POST /generate`**: Generates the UI JSON.
- **`GET /`**: Serves the `static/index.html` file (if available).
- **`GET /static/...`**: Serves static files (images, crops).

## Project Structure

- `main.py`: Main entry point for the FastAPI application.
- `static/`: Directory for static assets and generated crops.
- `.env`: Environment variables (not committed).
