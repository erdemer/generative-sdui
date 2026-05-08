"""Figma REST API client — extracts design tokens (colors, typography)."""

import re
import httpx

FIGMA_BASE = "https://api.figma.com/v1"

# Semantic role heuristics (ordered — first match wins)
_COLOR_ROLES = [
    ("bg",      ["background", "/bg", "base", "canvas", "page", "app-bg", "app bg"]),
    ("surface", ["surface", "card", "elevated", "panel", "container", "overlay", "layer"]),
    ("accent",  ["primary", "accent", "brand", "cta", "action", "interactive", "link", "blue", "indigo", "violet", "purple"]),
    ("fg",      ["foreground", "on-background", "on-surface", "text-primary", "label", "/fg", "fg-1", "fg1", "default-text"]),
    ("fg3",     ["secondary", "muted", "subtle", "tertiary", "caption", "placeholder", "disabled", "fg-2", "fg-3", "fg2", "fg3"]),
]

_TYPO_ROLES = [
    ("h1",      ["display", "headline1", "h1", "title1", "large-title", "hero"]),
    ("h2",      ["headline2", "h2", "title2", "title-medium"]),
    ("h3",      ["headline3", "h3", "title3", "subtitle", "title-small"]),
    ("body",    ["body", "paragraph", "text", "regular"]),
    ("caption", ["caption", "label", "overline", "small", "micro"]),
]


def extract_file_key(url_or_key: str) -> str:
    match = re.search(r"figma\.com/(?:file|design)/([A-Za-z0-9_-]+)", url_or_key)
    return match.group(1) if match else url_or_key.strip()


def _rgb_to_hex(r: float, g: float, b: float) -> str:
    return "#{:02x}{:02x}{:02x}".format(
        min(255, round(r * 255)),
        min(255, round(g * 255)),
        min(255, round(b * 255)),
    )


def _match_role(name: str, role_map: list) -> str | None:
    lower = name.lower().replace("/", " ").replace("-", " ").replace("_", " ")
    for role, keywords in role_map:
        if any(kw in lower for kw in keywords):
            return role
    return None


def _assign_color_roles(raw_colors: dict[str, str]) -> dict:
    """Map {name: hex} to {role: hex}. Unmatched colors preserved in 'extra'."""
    roles: dict[str, str] = {}
    extra: list[dict] = []

    for name, hex_val in raw_colors.items():
        role = _match_role(name, _COLOR_ROLES)
        if role and role not in roles:
            roles[role] = hex_val
        else:
            extra.append({"name": name, "hex": hex_val})

    # If we don't have all 5 core roles, fill from extras in order
    defaults = ["bg", "surface", "accent", "fg", "fg3"]
    remaining = [e["hex"] for e in extra]
    idx = 0
    for role in defaults:
        if role not in roles and idx < len(remaining):
            roles[role] = remaining[idx]
            idx += 1

    return {"roles": roles, "extra": extra[:20]}


def _assign_typo_roles(raw_typo: dict) -> dict:
    roles: dict[str, dict] = {}
    for name, style in raw_typo.items():
        role = _match_role(name, _TYPO_ROLES)
        if role and role not in roles:
            roles[role] = style
    return roles


async def import_design_system(file_url: str, token: str) -> dict:
    """Fetch Figma file styles and return structured design tokens."""
    file_key = extract_file_key(file_url)
    headers = {"X-Figma-Token": token}

    raw_colors: dict[str, str] = {}
    raw_typo: dict[str, dict] = {}

    async with httpx.AsyncClient(timeout=30) as client:
        # ── 1. Try modern Variables API first ─────────────────────────────
        try:
            r = await client.get(f"{FIGMA_BASE}/files/{file_key}/variables/local", headers=headers)
            if r.status_code == 200:
                meta = r.json().get("meta", {})
                variables = meta.get("variables", {})
                collections = meta.get("variableCollections", {})

                mode_map = {
                    cid: coll["modes"][0]["modeId"]
                    for cid, coll in collections.items()
                    if coll.get("modes")
                }

                for var in variables.values():
                    if var.get("resolvedType") != "COLOR":
                        continue
                    mode_id = mode_map.get(var.get("variableCollectionId", ""))
                    if not mode_id:
                        continue
                    value = var.get("valuesByMode", {}).get(mode_id)
                    if value and isinstance(value, dict) and "r" in value:
                        raw_colors[var["name"]] = _rgb_to_hex(value["r"], value["g"], value["b"])
        except Exception:
            pass

        # ── 2. Styles API (fallback / supplement) ─────────────────────────
        styles_r = await client.get(f"{FIGMA_BASE}/files/{file_key}/styles", headers=headers)
        styles_r.raise_for_status()
        styles = styles_r.json().get("meta", {}).get("styles", [])
        node_to_name = {s["node_id"]: s["name"] for s in styles}

        fill_ids = [s["node_id"] for s in styles if s["style_type"] == "FILL"]
        text_ids = [s["node_id"] for s in styles if s["style_type"] == "TEXT"]

        async def fetch_nodes(ids: list[str]) -> dict:
            if not ids:
                return {}
            ids_str = ",".join(ids[:60])
            r2 = await client.get(f"{FIGMA_BASE}/files/{file_key}/nodes?ids={ids_str}", headers=headers)
            r2.raise_for_status()
            return r2.json().get("nodes", {})

        # Colors from styles
        for node_id, node_info in (await fetch_nodes(fill_ids)).items():
            doc = (node_info or {}).get("document", {})
            fills = doc.get("fills", [])
            if fills and fills[0].get("type") == "SOLID":
                c = fills[0]["color"]
                name = node_to_name.get(node_id, node_id)
                if name not in raw_colors:
                    raw_colors[name] = _rgb_to_hex(c["r"], c["g"], c["b"])

        # Typography from styles
        for node_id, node_info in (await fetch_nodes(text_ids)).items():
            doc = (node_info or {}).get("document", {})
            style = doc.get("style", {})
            if style and style.get("fontFamily"):
                name = node_to_name.get(node_id, node_id)
                raw_typo[name] = {
                    "fontFamily": style.get("fontFamily"),
                    "fontSize": style.get("fontSize"),
                    "fontWeight": style.get("fontWeight"),
                    "lineHeight": style.get("lineHeightPx"),
                    "letterSpacing": style.get("letterSpacing"),
                }

    color_result = _assign_color_roles(raw_colors)
    typo_result = _assign_typo_roles(raw_typo)

    # Detect primary font family
    font_families = list({
        v["fontFamily"]
        for v in raw_typo.values()
        if v.get("fontFamily")
    })

    return {
        "file_key": file_key,
        "source_url": file_url,
        "colors": color_result["roles"],
        "extra_colors": color_result["extra"],
        "typography": typo_result,
        "font_families": font_families[:3],
        "raw_color_count": len(raw_colors),
        "raw_typo_count": len(raw_typo),
    }
