def build_design_system_block(ds: dict) -> str:
    """Build a strict design-system constraint block to prepend to any generation prompt."""
    if not ds:
        return ""

    lines = [
        "╔══════════════════════════════════════════════════════════════╗",
        "║  FIGMA DESIGN SYSTEM — MANDATORY COMPLIANCE                  ║",
        "║  You MUST use ONLY the values below. Never invent new ones.  ║",
        "╚══════════════════════════════════════════════════════════════╝",
        "",
    ]

    colors = ds.get("colors", {})
    if colors:
        lines.append("COLOR PALETTE (use these exact hex values — no exceptions):")
        role_labels = {
            "bg":      "Background (bg)",
            "surface": "Surface / Cards (surface)",
            "accent":  "Accent / Primary / CTA (accent)",
            "fg":      "Foreground / Text (fg)",
            "fg3":     "Secondary Text (fg3)",
        }
        for role, label in role_labels.items():
            if role in colors:
                lines.append(f"  {label}: {colors[role]}")
        # Extra named colors the AI can reference by name
        extra = ds.get("extra_colors", [])
        if extra:
            lines.append("  Additional brand colors (use by name if needed):")
            for e in extra[:8]:
                lines.append(f"    {e['name']}: {e['hex']}")
        lines.append("")

    typo = ds.get("typography", {})
    font_families = ds.get("font_families", [])
    if font_families or typo:
        lines.append("TYPOGRAPHY (use these exact fonts and sizes):")
        if font_families:
            lines.append(f"  Primary font: {font_families[0]}")
            if len(font_families) > 1:
                lines.append(f"  Secondary font: {font_families[1]}")
        role_labels_t = {"h1": "H1 (hero)", "h2": "H2 (section)", "h3": "H3 (card title)", "body": "Body", "caption": "Caption"}
        for role, label in role_labels_t.items():
            if role in typo:
                t = typo[role]
                parts = []
                if t.get("fontFamily"):
                    parts.append(t["fontFamily"])
                if t.get("fontSize"):
                    parts.append(f'{t["fontSize"]}sp')
                if t.get("fontWeight"):
                    parts.append(f'weight:{t["fontWeight"]}')
                if parts:
                    lines.append(f"  {label}: {', '.join(parts)}")
        lines.append("")

    lines += [
        "STRICT RULES:",
        "  • backgroundColor, color, accent, fg, fg3 → use ONLY the hex values above",
        "  • Do NOT use any other colors. If unsure, use bg or surface.",
        "  • For text on dark surfaces use fg; for secondary info use fg3",
        "  • For all buttons, active states, prices, icons → use accent",
        "  • If font families were provided, set them as the default font throughout",
        "",
    ]

    return "\n".join(lines)


PROMPT_BASE = """You are a senior Android SDUI engineer. Output ONLY valid JSON, no Markdown, no explanation.

TECHNICAL RULES:
- Root props: statusBarPadding:"true", fillMaxSize:"true", backgroundColor (from palette)
- padding: "top,right,bottom,left" | colors: 6-digit hex | corner/elevation: int(dp)
- Scrollable content: wrap body Column in scroll:"true" — its children MUST NOT have weight
- Equal-width siblings: weight:1 on each child
- onClick: {"type":"navigate","destination":"screen"} | {"type":"toast","message":"..."}

IMAGES — photorealistic quality:
- Hero:      h:240, url: https://image.pollinations.ai/prompt/{vivid_scene},professional_photography,cinematic_lighting,high_detail?nologo=true&width=800&height=480&model=flux
- Card img:  h:155, url: https://image.pollinations.ai/prompt/{desc},product_shot,studio_lighting?nologo=true&width=400&height=320&model=flux
- Thumbnail: h:72,  url: https://image.pollinations.ai/prompt/{desc},clean_background?nologo=true&width=200&height=200&model=flux
- Always contentScale:"crop" | use underscores in desc, be vivid (e.g. steaming_espresso_dark_wooden_table_cafe)

LAYOUT PATTERNS — apply these exact structures:

① HERO OVERLAY (mandatory on main screens):
Box children:[
  Image(fillMaxWidth, h:240, crop),
  Box(fillMaxSize, backgroundColor:"linear-gradient(0deg,#000000e8,#00000000)"),
  Column(verticalArrangement:bottom, padding:"0,16,28,16", spacedby:8) children:[
    Text(h1, white, bold, "Real tagline"),
    Text(body, color:#ffffffbb, "Real subtitle"),
    Button(bg:accent, color:white, corner:28, padding:"13,32,13,32", "Real CTA label")
  ]
]

② SECTION HEADER (before every list/grid):
Row(horizontalArrangement:spacebetween, verticalAlignment:center, padding:"20,0,10,0") children:[
  Text(h2, bold, fg),
  Text("Tümü →", caption, color:accent, onClick:navigate)
]

③ CATEGORY STRIP (horizontal scroll):
Row(scroll:"true", horizontalArrangement:spacedby:10, padding:"2,0,8,0") children — each item:
  Column(horizontalAlignment:center, verticalArrangement:spacedby:6) children:[
    Image(h:72, corner:36, crop),
    Text(caption, center, color:fg3, "Category Name")
  ]

④ CONTENT GRID (2-column):
Row(horizontalArrangement:spacedby:12) children — each:
  Card(weight:1, corner:16, elevation:2, backgroundColor:surface) children:[
    Image(h:150, crop),
    Column(padding:"8,12,14,12", verticalArrangement:spacedby:3) children:[
      Text(h3, bold, color:fg, "Real Name"),
      Row(horizontalArrangement:spacedby:3, verticalAlignment:center) children:[
        Icon(star, size:12, color:#F59E0B),
        Text(caption, color:fg3, "4.8  ·  124")
      ],
      Row(horizontalArrangement:spacebetween, verticalAlignment:center) children:[
        Text(body, bold, color:accent, "$12.90"),
        Icon(shopping_cart, size:18, color:accent, onClick:toast)
      ]
    ]
  ]

⑤ LIST ROW:
Card(corner:12, elevation:1, padding:"12,12,12,12", backgroundColor:surface) children:[
  Row(horizontalArrangement:spacedby:12, verticalAlignment:center) children:[
    Image(h:68, corner:10, crop),
    Column(weight:1, verticalArrangement:spacedby:2) children:[
      Text(h3, bold, color:fg, "Real Name"),
      Text(body, color:fg3, "Real description"),
      Row(horizontalArrangement:spacedby:4, verticalAlignment:center) children:[
        Icon(star, size:11, color:#F59E0B),
        Text(caption, color:fg3, "4.5  ·  20 min")
      ]
    ],
    Column(horizontalAlignment:end, verticalArrangement:spacedby:2) children:[
      Text(h3, bold, color:accent, "$9.99"),
      Text(caption, color:fg3, "Popüler")
    ]
  ]
]

QUALITY — every output must pass all:
✓ Real copy: actual names, real prices, real labels — zero placeholder text ever
✓ PALETTE: choose bg + surface + accent + fg + fg3 — use consistently (accent only on CTAs/prices/active icons)
✓ HEADER: Row(spacebetween,center,padding:"12,16,12,16") > [Row(spacedby:8) > [Icon(domain,accent), Text(h3,bold,accent,"App Name")], Row(spacedby:12) > [Icon(search,fg3), Icon(notifications,fg3)]]
✓ HERO OVERLAY (pattern ①) immediately after header — vivid, contextual image prompt
✓ SCROLL WRAPPER: Column(scroll:"true") wraps all body sections after header+hero
✓ 3 content sections inside scroll using patterns ②–⑤ with real content
✓ RATINGS on every product/place card (Row + star Icon + Text "4.8 · 124")
✓ BADGES on 1-2 featured cards: extra Box child over Card with accent bg + caption white text
✓ BottomBar: items:[{"icon":"home","label":"Ana Sayfa","onClick":{"type":"navigate","destination":"home"}},{"icon":"menu_book","label":"Menü","onClick":{"type":"navigate","destination":"menu"}},{"icon":"favorite","label":"Favoriler","onClick":{"type":"navigate","destination":"favorites"}},{"icon":"person","label":"Profil","onClick":{"type":"navigate","destination":"profile"}}]
✓ Typography hierarchy: h1 hero > h2 section heads > h3 card titles > body > caption

COMPONENTS:
Column: verticalArrangement(top|bottom|center|spacebetween|spaceevenly|spacedby:N), horizontalAlignment(start|center|end), scroll:"true"
Row: horizontalArrangement(start|end|center|spacebetween|spaceevenly|spacedby:N), verticalAlignment(top|center|bottom), scroll:"true"
Box: stacks children as z-layers (image+overlay+badge combos)
Card: corner, elevation, backgroundColor, padding, onClick
Text: style(h1|h2|h3|body|caption), fontWeight(bold|medium|normal), textAlign, color
Image: url, contentScale(crop|fit), height, corner, fillMaxWidth:"true"
Button: text, backgroundColor, color, corner, padding, onClick
Icon: name(Material snake_case — star, home, search, person, favorite, shopping_cart, notifications, local_cafe, menu_book, chevron_right, add, share), size, color, onClick
Spacer: height | HorizontalDivider: color, thickness
BottomBar: items:[{"icon":"..","label":"..","onClick":{..}}], fillWidth:"true"

Generate UI JSON for:
"""

PROMPT_WEB = """You are a senior Web SDUI engineer. Output ONLY valid JSON, no Markdown, no explanation.

Components: Column, Row, Card, Box, Text, Image, Button, Icon, Spacer, HorizontalDivider (same props as mobile).

TECHNICAL RULES:
- Root: fillMaxSize:"true", scroll:"true", backgroundColor from palette | padding: "t,r,b,l"
- onClick on any component | colors: 6-digit hex or CSS gradient

IMAGES: https://image.pollinations.ai/prompt/{vivid_desc},professional_photography,high_detail?nologo=true&width=1200&height=600&model=flux | contentScale:"crop"

LAYOUT PATTERNS:

① NAVBAR:
Row(spacebetween, center, padding:"0,48,0,48", backgroundColor:surface, elevation:1) children:[
  Text(h2, bold, color:accent, "Brand"),
  Row(spacedby:36) > [Text(body,fg,"Home"), Text(body,fg,"Menu"), Text(body,fg,"About")],
  Row(spacedby:12) > [Button(surface,"Log in",corner:8), Button(accent,"Sign up",color:white,corner:8)]
]

② HERO:
Card(corner:0, backgroundColor:"linear-gradient(135deg,accent_light,bg)", padding:"88,48,88,48") children:[
  Column(center, spacedby:20) children:[
    Text(h1, bold, center, fg, "Real headline"),
    Text(body, center, fg3, "Real subheadline — 2 sentences"),
    Row(center, spacedby:12) > [Button(accent,"Primary CTA",color:white,corner:8), Button(surface,"Secondary",corner:8)]
  ]
]

③ FEATURE GRID (3-col):
Row(spacedby:24, padding:"0,48,0,48") — 3x Card(weight:1, corner:12, elevation:2, padding:"28,24,28,24") children:[
  Column(spacedby:14) > [Icon(name,size:36,color:accent), Text(h2,bold,fg), Text(body,fg3)]
]

④ CONTENT GRID (3-col):
Row(spacedby:20, padding:"0,48,0,48") — 3x Card(weight:1, corner:12, elevation:2) children:[
  Image(h:200,crop), Column(padding:"16,20,20,20",spacedby:6) > [Text(h3,bold,fg), Text(body,fg3), Text(body,bold,color:accent,"$price")]
]

QUALITY:
✓ Real copy everywhere | ✓ NAVBAR (①) | ✓ HERO with gradient bg (②) | ✓ Features (③) | ✓ Content grid (④)
✓ Stats Row(spaceevenly): 3x Column(center) > [Text(h1,bold,accent,"42K"), Text(caption,fg3,"Label")]
✓ Testimonial Card | ✓ Footer: Row(spacebetween) > [brand+tagline, 3x link columns, social Icons]
✓ Consistent palette: bg, surface, accent throughout | ✓ All Cards elevation:2+

Generate UI JSON for:
"""

SMART_CROP_PROMPT = """
SMART CROP: For EVERY Image component showing a distinct object from the uploaded image, add:
"image_crop": [ymin, xmin, ymax, xmax]  (0-1000 scale)
Example: shoe at top-left → "image_crop": [50, 50, 400, 350]
"""

CLARIFY_PROMPT = """You produce UI design-decision questions for a {platform} SDUI generator. Given a brief prompt, output exactly 3 questions that unlock the highest-impact design choices.

{lang_note}

Output ONLY valid JSON:
{{"questions":[{{"id":"q1","text":"...","options":["...","...","...","..."]}}]}}

Rules:
- Q1 MUST be visual style — options MUST start with: Koyu, Açık, Sıcak, Canlı, or Pastel (TR) / Dark, Light, Warm, Vibrant, Pastel (EN) then add descriptor (e.g. "Koyu & Premium", "Açık & Minimal", "Sıcak & Organik", "Canlı & Bold")
- Q2: primary screen/layout (e.g. "Ana ekran?" → "Hero + öne çıkan ürünler", "Kategori grid", "Keşfet akışı", "Adım adım sipariş")
- Q3: key features (e.g. "Temel özellik?" → "Sepet & ödeme", "Sadakat & ödüller", "Rezervasyon", "Sosyal & yorumlar")
- Options: concrete, max 4 per question, short text

Prompt: """

UI_VERIFY_PROMPT = """You are a Senior UI/UX Engineer reviewing an SDUI JSON and its rendered screenshot. Fix real issues only — do NOT redesign anything that looks fine.

PRIORITY 1 — STRUCTURAL (always fix):
- scroll:"true" container children with weight → remove weight
- Root missing fillMaxSize:"true" or statusBarPadding:"true" → add them
- Image in Card without fixed height → set height:155
- Image missing contentScale:"crop" → add it
- Empty children:[] → remove the container

PRIORITY 2 — VISUAL (fix only if clearly broken):
- Text on dark surface without explicit light color → set color:#ffffff or color:#ffffffcc
- No padding on root → add padding:"0,16,16,16"
- All text same size/weight → differentiate: at least h2 + body + caption with bold variants
- Zero gap between siblings → add verticalArrangement:"spacedby:12"
- Missing BottomBar on multi-section screen → add 4-tab BottomBar
- Content items not in Cards → wrap in Card(corner:12,elevation:1)

DO NOT: change color scheme, restructure sections, rename copy, or touch anything that looks fine.

OUTPUT: ONLY valid JSON. Fixed → corrected JSON. No issues → original JSON as-is.

CURRENT SDUI JSON:
"""
