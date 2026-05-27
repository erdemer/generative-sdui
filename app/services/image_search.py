"""
Real product image search service.

Strategy (in order):
  1. GSMarena direct URL  → fastest; clean white-bg product shots for phones/tablets
  2. Wikipedia image list → scan all .jpg files on the page, pick best scoring one
  3. DuckDuckGo images    → broader web search (rate-limited; used as fallback)
  4. Pollinations AI      → always available, AI-generated product shot

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

# Words that indicate a non-product / lifestyle image — reject these
_BAD_KEYWORDS = [
    # generic non-product
    "flag", "icon", "logo", "map", "chart", "symbol", "diagram",
    "screenshot", "screen", "ui", "interface", "wallpaper",
    "frame", "00.", "fps", "kbit",
    # technical detail shots
    "camera_control", "close_up", "detail", "teardown", "disassembly",
    "comparison", "vs_", "_vs_", "benchmark", "antutu",
    # hands / in-store / event photos
    "hand", "hands", "_with_", "lifestyle", "promo",
    "store", "retail", "display", "booth",
    "event", "launch", "mwc", "ces", "unbox", "review",
    "handson", "hands_on", "in_use",
]

# Filename keywords that signal a clean product shot — used in scoring
_GOOD_KEYWORDS = [
    "official", "press", "render", "product", "studio",
    "white", "isolated", "front", "back", "side",
]

# Domains that are unlikely to have clean product shots (DDG filter)
_BAD_DDG_DOMAINS = [
    "vecteezy", "shutterstock", "freepik", "istockphoto",
    "ostseeappartements", "blogspot", "wordpress.com",
    "pinterest", "reddit", "twitter", "facebook", "instagram",
]

# Domains preferred for DDG scoring
_PREFERRED_DOMAINS = [
    "upload.wikimedia.org",
    "fdn2.gsmarena.com", "cdn.gsmarena.com",
    "samsung.com", "mi.com", "xiaomi.com", "apple.com",
    "sony.com", "motorola.com", "oneplus.com",
    "gsmarena.com", "phonearena.com", "91mobiles.com",
]


# ── GSMarena direct resolver ───────────────────────────────────

# Curated slug overrides for phones where the auto-generated slug doesn't match
# GSMarena's actual CDN filename. Verified with HEAD requests.
_GSMARENA_SLUG_OVERRIDES: dict[str, str] = {
    # Samsung Galaxy S-series
    "samsung galaxy s25 ultra":        "samsung-galaxy-s25-ultra-sm-s938",
    "samsung galaxy s25+":             "samsung-galaxy-s25-sm-s936",
    "samsung galaxy s25 plus":         "samsung-galaxy-s25-sm-s936",
    "samsung galaxy s25":              "samsung-galaxy-s25-sm-s931",
    "samsung galaxy s24 ultra":        "samsung-galaxy-s24-ultra-5g",
    "samsung galaxy s24+":             "samsung-galaxy-s24-5g",
    "samsung galaxy s24":              "samsung-galaxy-s24-5g",
    "samsung galaxy s23 ultra":        "samsung-galaxy-s23-ultra-5g",
    # Samsung Galaxy A-series
    "samsung galaxy a56 5g":           "samsung-galaxy-a56-",
    "samsung galaxy a55 5g":           "samsung-galaxy-a55-5g",
    "samsung galaxy a35 5g":           "samsung-galaxy-a35-5g",
    "samsung galaxy a25 5g":           "samsung-galaxy-a25-5g",
    # iPhone
    "iphone 16 pro max":               "apple-iphone-16-pro-max",
    "iphone 16 pro":                   "apple-iphone-16-pro",
    "iphone 16 plus":                  "apple-iphone-16-plus",
    "iphone 16":                       "apple-iphone-16",
    "iphone 15 pro max":               "apple-iphone-15-pro-max",
    "iphone 15 pro":                   "apple-iphone-15-pro",
    "iphone 15":                       "apple-iphone-15",
    # Xiaomi
    "xiaomi 15 ultra":                 "xiaomi-15-ultra-",
    "xiaomi 15 pro":                   "xiaomi-15-pro",
    "xiaomi 15":                       "xiaomi-15",
    "xiaomi 14 ultra":                 "xiaomi-14-ultra",
    "xiaomi 14":                       "xiaomi-14",
    "redmi note 14 pro":               "xiaomi-redmi-note-14-pro",
    "redmi note 13 pro":               "xiaomi-redmi-note-13-pro-5g",
    # OnePlus
    "oneplus 13":                      "oneplus-13",
    "oneplus 13r":                     "oneplus-13r",
    "oneplus 12":                      "oneplus-12",
    # Google Pixel
    "google pixel 9 pro":              "google-pixel-9-pro",
    "google pixel 9":                  "google-pixel-9",
    "pixel 9 pro":                     "google-pixel-9-pro",
    "pixel 9":                         "google-pixel-9",
    # Motorola
    "motorola moto g85":               "motorola-moto-g85",
    "motorola edge 50 pro":            "motorola-edge-50-pro",
    # Sony
    "sony xperia 1 vi":                "sony-xperia-1-vi",
    "sony xperia 5 vi":                "sony-xperia-5-vi",
    # Oppo / Realme
    "oppo find x8 pro":                "oppo-find-x8-pro",
    "realme 13 pro":                   "realme-13-pro-plus-5g",
}


def _gsmarena_slug(query: str) -> str:
    """
    Return the GSMarena bigpic slug for a product name.
    Checks the curated override table first; falls back to auto-generation.
    """
    # Normalize: strip storage suffix, lowercase
    key = re.sub(r"\s+\d+\s*gb\b", "", query.strip(), flags=re.IGNORECASE).lower().strip()

    # Curated lookup (exact match)
    if key in _GSMARENA_SLUG_OVERRIDES:
        return _GSMARENA_SLUG_OVERRIDES[key]

    # Partial match: check if any override key is contained in the query
    for override_key, slug in _GSMARENA_SLUG_OVERRIDES.items():
        if override_key in key:
            return slug

    # Auto-generate slug
    name = re.sub(r"[^a-z0-9\s]", "", key).strip()
    if re.match(r"^i(phone|pad)\b", name):
        name = "apple " + name
    return re.sub(r"\s+", "-", name)


async def _gsmarena_image(client: httpx.AsyncClient, query: str) -> Optional[str]:
    """
    Attempt a direct hit on GSMarena's product-shot CDN.
    Uses curated slug overrides for maximum hit rate.
    """
    slug = _gsmarena_slug(query)
    url = f"https://fdn2.gsmarena.com/vv/bigpic/{slug}.jpg"
    try:
        r = await client.head(url, headers=_HTTP_HEADERS, timeout=5)
        if r.status_code == 200:
            return url
    except Exception:
        pass
    return None


# ── Wikipedia helpers ──────────────────────────────────────────

async def _wikipedia_image_list(client: httpx.AsyncClient, query: str) -> Optional[str]:
    """
    Search Wikipedia for the page, then scan its image list for the best JPG.
    Scores candidates by how many query words appear in the filename and by
    whether the filename contains "product shot" keywords.
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
                "imlimit": 50,
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

        # 4. Score: query-word matches + good-keyword bonus
        query_words = set(re.sub(r"\d+gb", "", query.lower()).split())

        def _img_score(title: str) -> int:
            lower_t = title.lower()
            score = sum(1 for w in query_words if w in lower_t)
            score += sum(2 for gk in _GOOD_KEYWORDS if gk in lower_t)
            return score

        good_images.sort(key=_img_score, reverse=True)

        # 5. Resolve best image to a direct URL (800 px wide)
        fname = good_images[0].replace("File:", "")
        r3 = await client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": f"File:{fname}",
                "prop": "imageinfo",
                "iiprop": "url",
                "iiurlwidth": 800,
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

async def _ddg_gsmarena_search(query: str) -> Optional[str]:
    """
    Search DuckDuckGo specifically for fdn2.gsmarena.com bigpic URLs.
    These are always clean, white-background product shots.
    """
    try:
        from ddgs import DDGS

        def _sync() -> Optional[str]:
            ddgs = DDGS()
            # First try: search for the exact GSMarena bigpic URL
            results = ddgs.text(
                keywords=f'site:fdn2.gsmarena.com/vv/bigpic {query}',
                max_results=5,
            )
            for r in (results or []):
                href = r.get("href", "")
                if "fdn2.gsmarena.com" in href and href.endswith(".jpg"):
                    return href
            return None

        return await asyncio.to_thread(_sync)
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠️  DDG GSMarena search error for '{query}': {e}")
    return None


async def _ddg_image_search(query: str) -> Optional[str]:
    """
    DuckDuckGo image search targeting tech review sites with clean product shots.
    Rate-limited; used only when GSMarena + Wikipedia have no result.
    """
    try:
        from ddgs import DDGS

        def _sync() -> Optional[str]:
            ddgs = DDGS()
            search_q = f"{query} official press render product photo white background"
            results = ddgs.images(
                query=search_q,
                type_image="photo",
                size="Medium",
                max_results=12,
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

def _is_good_image_url(url: str) -> bool:
    if not url.startswith("https://"):
        return False
    lower = url.lower()
    if any(bad in lower for bad in _BAD_KEYWORDS):
        return False
    if ".svg" in lower:
        return False
    if not any(ext in lower for ext in (".jpg", ".jpeg", ".png")):
        return False
    return True


def _score_url(url: str) -> int:
    score = 0
    lower = url.lower()
    for domain in _PREFERRED_DOMAINS:
        if domain in lower:
            score += 10
            break
    if "jpg" in lower or "jpeg" in lower:
        score += 2
    if any(s in lower for s in ["600", "800", "960", "1200", "large", "full", "big"]):
        score += 1
    # Bonus for "product shot" signals in URL
    for gk in _GOOD_KEYWORDS:
        if gk in lower:
            score += 3
    return score


# ── Device query detection ─────────────────────────────────────

# Known smartphone/tablet brand keywords — if query matches, Wikipedia tends
# to return editorial/in-store shots rather than clean product renders.
# For these we skip Wikipedia and jump straight to Pollinations after GSMarena.
_DEVICE_BRANDS = {
    "samsung", "iphone", "ipad", "xiaomi", "redmi", "poco",
    "oppo", "vivo", "oneplus", "realme", "huawei", "honor",
    "google", "pixel", "motorola", "nokia", "sony", "xperia",
    "lg", "asus", "rog", "tecno", "infinix", "nothing",
}

def _is_device_query(query: str) -> bool:
    """Return True if the query looks like a smartphone/tablet model name."""
    lower = query.lower()
    return any(brand in lower for brand in _DEVICE_BRANDS)


# ── Public API ────────────────────────────────────────────────

async def search_product_image(query: str) -> Optional[str]:
    """
    Find a real, clean product image for the given query string.
    Returns a direct image URL, or None if all sources fail.

    Strategy for device/phone queries:
      GSMarena → Pollinations (skip Wikipedia — editorial shots look bad)

    Strategy for other queries:
      GSMarena → Wikipedia → DDG → Pollinations
    """
    cache_key = query.strip().lower()
    if cache_key in _cache:
        print(f"📦 Image cache hit: '{query}'")
        return _cache[cache_key]

    is_device = _is_device_query(query)

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        # ① GSMarena direct slug (fastest — clean white-bg shots)
        url = await _gsmarena_image(client, query)
        if url:
            print(f"📷 GSMarena → '{query}': {url}")
            _cache[cache_key] = url
            return url

        # ② For non-device queries, try Wikipedia image list
        if not is_device:
            url = await _wikipedia_image_list(client, query)
            if url:
                print(f"📷 Wikipedia → '{query}': {url[:70]}…")
                _cache[cache_key] = url
                return url

    # ③ For device queries: search DDG specifically for GSMarena CDN URLs
    if is_device:
        url = await _ddg_gsmarena_search(query)
        if url:
            print(f"📷 DDG→GSMarena → '{query}': {url}")
            _cache[cache_key] = url
            return url

    # ④ For non-device queries, try broader DDG image search
    if not is_device:
        url = await _ddg_image_search(query)
        if url:
            print(f"📷 DuckDuckGo → '{query}': {url[:70]}…")
            _cache[cache_key] = url
            return url

    # ⑤ Pollinations AI fallback — clean studio render, always works
    print(f"📷 Pollinations fallback for '{query}' (device={is_device})")
    return None  # caller uses _pollinations_fallback()


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

    resolved = await asyncio.gather(*[search_product_image(q) for q in queries])
    results: dict[str, Optional[str]] = dict(zip(queries, resolved))

    for query, nodes in found.items():
        url = results.get(query) or _pollinations_fallback(query)
        for node in nodes:
            node["url"] = url

    return data
