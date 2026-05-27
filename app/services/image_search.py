"""
Real product image search service.

Strategy (in order):
  1. Wikipedia REST summary → fast, returns page's main image
  2. Wikipedia image list  → scan all .jpg files on the page, pick best
  3. DuckDuckGo images     → broader web search (rate-limited; used as fallback)
  4. Pollinations AI       → always available, AI-generated product shot

Resolves  search://<product name>  URLs that the AI embeds in generated JSON.
Results are cached in-memory (product images rarely change).
"""

import asyncio
import re
from typing import Optional

import httpx

# ── In-memory cache ────────────────────────────────────────────
_cache: dict[str, str] = {}

_HTTP_HEADERS = {
    "User-Agent": "SDUI-Studio/1.0 (product-image-search; contact: erdemer1999@gmail.com)"
}

# Words that indicate a non-product image (flag, map, chart, diagram, …)
_BAD_KEYWORDS = [
    "flag", "icon", "logo", "map", "chart", "symbol", "diagram",
    "screenshot", "screen", "ui", "interface", "wallpaper",
    "frame", "00.", "fps", "kbit",  # video thumbnails
    "camera_control", "close_up", "detail", "teardown", "comparison",
    "vs_", "_vs_", "benchmark", "antutu", "disassembly",
]

# Domains that are unlikely to have clean product shots (DDG filter)
_BAD_DDG_DOMAINS = [
    "vecteezy", "shutterstock", "freepik", "istockphoto",
    "ostseeappartements", "blogspot", "wordpress.com",
    "pinterest", "reddit", "twitter", "facebook", "instagram",
]


# ── Wikipedia helpers ──────────────────────────────────────────

async def _wikipedia_rest_summary(client: httpx.AsyncClient, query: str) -> Optional[str]:
    """Try the fast Wikipedia REST summary endpoint (returns main page image)."""
    slug = query.strip().replace(" ", "_")
    try:
        r = await client.get(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}",
            headers=_HTTP_HEADERS,
        )
        if r.status_code != 200:
            return None
        data = r.json()
        # Prefer original (full-size), fall back to thumbnail
        src = (
            data.get("originalimage", {}).get("source")
            or data.get("thumbnail", {}).get("source")
        )
        if src and _is_good_image_url(src):
            return src
    except Exception:
        pass
    return None


async def _wikipedia_image_list(client: httpx.AsyncClient, query: str) -> Optional[str]:
    """
    Search Wikipedia for the page, then scan its image list for the best JPG.
    Returns the highest-resolution thumbnail URL found.
    """
    try:
        # 1. Find the canonical page title
        r = await client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": 1,
                "utf8": 1,
            },
            headers=_HTTP_HEADERS,
        )
        results = r.json().get("query", {}).get("search", [])
        if not results:
            return None
        page_title = results[0]["title"]

        # 2. Get all images on the page
        r2 = await client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": page_title,
                "prop": "images",
                "format": "json",
                "utf8": 1,
                "imlimit": 30,
            },
            headers=_HTTP_HEADERS,
        )
        pages = r2.json().get("query", {}).get("pages", {})
        all_images: list[str] = []
        for p in pages.values():
            all_images = [img["title"] for img in p.get("images", [])]

        # 3. Filter: keep only JPEGs with no bad keywords in name
        good_images = [
            t for t in all_images
            if t.lower().endswith((".jpg", ".jpeg"))
            and not any(bad in t.lower() for bad in _BAD_KEYWORDS)
        ]
        if not good_images:
            return None

        # 4. Prefer images whose filename contains words from the query
        query_words = set(query.lower().split())
        def _img_score(title: str) -> int:
            lower_t = title.lower()
            return sum(1 for w in query_words if w in lower_t)

        good_images.sort(key=_img_score, reverse=True)

        # 5. Resolve the best image to a direct URL (600 px wide)
        fname = good_images[0].replace("File:", "")
        r3 = await client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": f"File:{fname}",
                "prop": "imageinfo",
                "iiprop": "url",
                "iiurlwidth": 600,
                "format": "json",
                "utf8": 1,
            },
            headers=_HTTP_HEADERS,
        )
        for p in r3.json().get("query", {}).get("pages", {}).values():
            info = p.get("imageinfo", [{}])
            if info:
                url = info[0].get("thumburl") or info[0].get("url", "")
                if url and _is_good_image_url(url):
                    return url

    except Exception as e:
        print(f"⚠️  Wikipedia image list error: {e}")
    return None


# ── DuckDuckGo fallback ────────────────────────────────────────

async def _ddg_image_search(query: str) -> Optional[str]:
    """
    DuckDuckGo image search via the ddgs package.
    Rate-limited; used only when Wikipedia has no result.
    """
    try:
        from ddgs import DDGS  # ddgs package (renamed from duckduckgo-search)

        def _sync() -> Optional[str]:
            ddgs = DDGS()
            results = ddgs.images(
                query=f"{query} official product photo",
                type_image="photo",
                size="Medium",
                max_results=8,
            )
            scored = [
                (r["image"], _score_url(r["image"]))
                for r in (results or [])
                if r.get("image", "").startswith("https://")
                and _is_good_image_url(r["image"])
                and not any(bad in r["image"].lower() for bad in _BAD_DDG_DOMAINS)
            ]
            if not scored:
                return None
            scored.sort(key=lambda x: x[1], reverse=True)
            return scored[0][0]

        return await asyncio.to_thread(_sync)
    except ImportError:
        print("⚠️  ddgs not installed — run: pip install ddgs")
    except Exception as e:
        print(f"⚠️  DDG search error for '{query}': {e}")
    return None


# ── URL quality helpers ────────────────────────────────────────

_PREFERRED_DOMAINS = [
    "upload.wikimedia.org",   # Wikipedia — very reliable
    "samsung.com", "mi.com", "xiaomi.com", "apple.com",
    "sony.com", "motorola.com", "oneplus.com",
    "gsmarena.com", "phonearena.com", "91mobiles.com",
]


def _is_good_image_url(url: str) -> bool:
    if not url.startswith("https://"):
        return False
    lower = url.lower()
    if any(bad in lower for bad in _BAD_KEYWORDS):
        return False
    # Reject anything that originates from an SVG (even if Wikimedia renders it as PNG)
    if ".svg" in lower:
        return False
    # Only allow rasterized formats
    if not any(ext in lower for ext in (".jpg", ".jpeg", ".png")):
        return False
    return True


def _score_url(url: str) -> int:
    score = 0
    for domain in _PREFERRED_DOMAINS:
        if domain in url:
            score += 10
            break
    if "jpg" in url.lower() or "jpeg" in url.lower():
        score += 2
    if any(s in url for s in ["600", "800", "960", "1200", "large", "full"]):
        score += 1
    return score


# ── Public API ────────────────────────────────────────────────

async def search_product_image(query: str) -> Optional[str]:
    """
    Find a real product image for the given query string.
    Returns a direct image URL, or None if all sources fail.
    """
    cache_key = query.strip().lower()
    if cache_key in _cache:
        print(f"📦 Image cache hit: '{query}'")
        return _cache[cache_key]

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        # ① Wikipedia REST summary (fastest)
        url = await _wikipedia_rest_summary(client, query)
        if url:
            print(f"📷 Wikipedia (REST) → '{query}': {url[:70]}…")
            _cache[cache_key] = url
            return url

        # ② Wikipedia image list (more thorough)
        url = await _wikipedia_image_list(client, query)
        if url:
            print(f"📷 Wikipedia (list) → '{query}': {url[:70]}…")
            _cache[cache_key] = url
            return url

    # ③ DuckDuckGo (rate-limited but broader)
    url = await _ddg_image_search(query)
    if url:
        print(f"📷 DuckDuckGo → '{query}': {url[:70]}…")
        _cache[cache_key] = url
        return url

    print(f"⚠️  No real image found for '{query}' — will use Pollinations fallback")
    return None


# ── JSON tree processor ───────────────────────────────────────

def _collect_search_nodes(node, found: dict[str, list]) -> None:
    """Walk the JSON tree; collect every node whose url starts with search://"""
    if isinstance(node, list):
        for item in node:
            _collect_search_nodes(item, found)
    elif isinstance(node, dict):
        url = node.get("url", "")
        if isinstance(url, str) and url.startswith("search://"):
            query = url[len("search://"):]
            found.setdefault(query, []).append(node)
        for v in node.values():
            if isinstance(v, (dict, list)):
                _collect_search_nodes(v, found)


def _pollinations_fallback(query: str) -> str:
    """Generate a Pollinations AI product-shot URL for a named device."""
    desc = re.sub(r"[^a-zA-Z0-9\s]", "", query).strip().replace(" ", "_").lower()
    return (
        f"https://image.pollinations.ai/prompt/"
        f"{desc},product_photography,studio_lighting,clean_white_background,centered_object"
        f"?nologo=true&width=400&height=400&model=flux"
    )


async def resolve_search_urls(data: dict) -> dict:
    """
    Find every Image node whose url is 'search://<product name>',
    resolve them in parallel, and replace in-place.
    Falls back to Pollinations if no real image is found.
    """
    found: dict[str, list] = {}
    _collect_search_nodes(data, found)

    if not found:
        return data

    queries = list(found.keys())
    print(f"🔍 Resolving {len(queries)} real product image(s): {queries}")

    # Search all queries in parallel
    resolved = await asyncio.gather(*[search_product_image(q) for q in queries])
    results: dict[str, Optional[str]] = dict(zip(queries, resolved))

    # Patch each collected node
    for query, nodes in found.items():
        url = results.get(query) or _pollinations_fallback(query)
        for node in nodes:
            node["url"] = url

    return data
