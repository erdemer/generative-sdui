def build_data_context_block(ctx: dict) -> str:
    """Build a personalization context block from connected flow node data."""
    if not ctx:
        return ""

    lines = [
        "╔══════════════════════════════════════════════════════════════╗",
        "║  KİŞİSELLEŞTİRME BAĞLAMI — BU VERİYİ KULLAN               ║",
        "╚══════════════════════════════════════════════════════════════╝",
        "Bu UI aşağıdaki GERÇEK kullanıcı için üretiliyor. Verileri birebir yansıt:",
        "",
    ]

    if user := ctx.get("user_profile"):
        lines.append(
            f"KULLANICI: {user.get('name')} | Segment: {user.get('segment')} "
            f"| Şehir: {user.get('city')} | Yaş: {user.get('age')}"
        )
        if interests := user.get("interests"):
            lines.append(f"İlgi Alanları: {', '.join(interests)}")
        lines.append(
            f"Sadakat: {user.get('loyaltyTier')} üye, {user.get('loyaltyPoints')} puan"
        )
        lines.append(
            f"Son Alışveriş: {user.get('lastPurchase')} | Aylık Harcama: {user.get('monthlySpend')}"
        )
        lines.append("")

    if catalog := ctx.get("product_catalog"):
        recs = catalog.get("recommended", [])
        if recs:
            lines.append("ÖNERİLEN ÜRÜNLER (bu ürünleri UI'da göster — gerçek isim ve fiyatlarıyla):")
            for p in recs[:4]:
                badge = f" [{p.get('badge')}]" if p.get("badge") else ""
                lines.append(f"  • {p['name']}: {p['price']} | ★{p.get('rating', '')}{badge}")
            lines.append("")

    if camps := ctx.get("campaigns"):
        active = camps.get("active", [])
        if active:
            lines.append("AKTİF KAMPANYALAR (UI'da banner/kart olarak öne çıkar):")
            for c in active[:3]:
                exp = f" (son: {c['expires']})" if c.get("expires") else ""
                lines.append(f"  • {c['title']}: {c['desc']}{exp}")
            lines.append("")

    if txn := ctx.get("transactions"):
        recent = txn.get("recent", [])
        if recent:
            lines.append("SON İŞLEMLER (alışveriş geçmişini yansıt):")
            for t in recent[:3]:
                lines.append(f"  • {t['date']}: {t['product']} — {t['amount']} ({t.get('points', '')})")
            lines.append("")

    if loyalty := ctx.get("loyalty"):
        lines.append(
            f"SADAKAT: {loyalty.get('tier')} üye | {loyalty.get('points')} puan "
            f"| {loyalty.get('toNextTier')} puan → {loyalty.get('nextTier')}"
        )
        if benefits := loyalty.get("benefits"):
            lines.append(f"Avantajlar: {', '.join(benefits[:3])}")
        if exp := loyalty.get("expiring"):
            lines.append(f"DİKKAT: {exp}")
        lines.append("")

    lines += [
        "KURALLAR:",
        "  • Tüm ürün adları, fiyatlar ve içerikler yukarıdaki GERÇEK verilerden olsun",
        "  • Kullanıcının sadakat tierını hero alanında öne çıkar",
        "  • Aktif kampanyaları promosyon kartı/banner olarak göster",
        f"  • Kullanıcıya ismiyle hitap et (örn. 'Merhaba, {(ctx.get('user_profile') or {}).get('name', 'Kullanıcı').split()[0]}!')",
        "  • Kullanıcının ilgi alanlarına göre içerik öner",
        "",
    ]

    return "\n".join(lines)


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

    components = ds.get("components", {})
    if components:
        lines.append("COMPONENTS (replicate these exact specs — do NOT invent new values):")
        type_labels = {
            "button":     "Button",
            "card":       "Card",
            "input":      "Input / TextField",
            "chip":       "Chip / Badge",
            "list_item":  "List Item / Row",
            "bottom_bar": "Bottom Bar / Tab Bar",
            "header":     "Header / Navbar",
            "avatar":     "Avatar",
            "modal":      "Modal / Sheet",
            "icon_button":"Icon Button",
            "other":      "Component",
        }
        for key, comp in list(components.items())[:16]:
            ctype = comp.get("type", "other")
            label = type_labels.get(ctype, "Component")
            name = comp.get("name", key)
            parts = []
            if comp.get("bg"):        parts.append(f'bg={comp["bg"]}')
            if comp.get("textColor"): parts.append(f'color={comp["textColor"]}')
            if comp.get("corner"):    parts.append(f'corner={comp["corner"]}')
            if comp.get("height"):    parts.append(f'height={comp["height"]}')
            if comp.get("padding"):   parts.append(f'padding={comp["padding"]}')
            if comp.get("border"):    parts.append(f'border={comp["border"]}')
            if comp.get("elevation"): parts.append(f'elevation={comp["elevation"]}')
            if parts:
                lines.append(f"  {label} [{name}]: {', '.join(parts)}")
        lines.append("")

    lines += [
        "STRICT RULES:",
        "  • backgroundColor, color, accent, fg, fg3 → use ONLY the hex values above",
        "  • Do NOT use any other colors. If unsure, use bg or surface.",
        "  • For text on dark surfaces use fg; for secondary info use fg3",
        "  • For all buttons, active states, prices, icons → use accent",
        "  • If font families were provided, set them as the default font throughout",
        "  • COMPONENTS: when generating a Button/Card/Input, use the exact specs above",
        "  • Match corner radius, padding, colors exactly from the component specs",
        "",
    ]

    return "\n".join(lines)


PROMPT_BASE = """You are a senior Android SDUI engineer specializing in production-ready, pixel-perfect mobile UI. Output ONLY valid JSON, no Markdown, no explanation.

TECHNICAL RULES:
- Root props: statusBarPadding:"true", fillMaxSize:"true", backgroundColor (from palette)
- padding: "top,right,bottom,left" | colors: 6-digit hex | corner/elevation: int(dp)
- Scrollable content: wrap body Column in scroll:"true" — its children MUST NOT have weight
- Equal-width siblings: weight:1 on each child
- onClick: {"type":"navigate","destination":"screen"} | {"type":"toast","message":"..."}

IMAGES — photorealistic quality:
- Hero:      h:240, url: https://image.pollinations.ai/prompt/{vivid_scene},professional_photography,cinematic_lighting,high_detail?nologo=true&width=800&height=480&model=flux
- Card img:  h:155, url: https://image.pollinations.ai/prompt/{desc},product_shot,studio_lighting?nologo=true&width=400&height=320&model=flux
- Product:   h:180, url: https://image.pollinations.ai/prompt/{device_name}_smartphone,product_shot,studio_lighting,white_background,clean?nologo=true&width=400&height=400&model=flux
- Thumbnail: h:72,  url: https://image.pollinations.ai/prompt/{desc},clean_background?nologo=true&width=200&height=200&model=flux
- Always contentScale:"crop" for hero, contentScale:"fit" for product shots | use underscores in desc, be vivid

LAYOUT PATTERNS — apply these exact structures:

① HERO OVERLAY (mandatory on main screens):
Box(fillMaxWidth:"true", contentAlignment:"bottomCenter") children:[
  Image(fillMaxWidth:"true", h:240, contentScale:"crop"),
  Box(fillMaxSize:"true", backgroundColor:"linear-gradient(0deg,#000000e8,#00000000)"),
  Column(fillMaxWidth:"true", padding:"0,16,28,16", verticalArrangement:"spacedby:8") children:[
    Text(h1, white, bold, "Real tagline"),
    Text(body, color:#ffffffbb, "Real subtitle"),
    Button(bg:accent, color:white, corner:28, padding:"13,32,13,32", "Real CTA label")
  ]
]
→ contentAlignment:"bottomCenter" pins text+button to bottom of image.
→ NEVER put title/button outside the Box or above the image.

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

③-B FILTER CHIP STRIP (horizontal scroll — for brand/category filtering):
Row(scroll:"true", horizontalArrangement:spacedby:8, padding:"4,0,10,0") children:[
  Card(corner:20, backgroundColor:accent, padding:"8,16,8,16") > Text(caption, bold, color:#FFFFFF, "Tümü"),
  Card(corner:20, backgroundColor:surface, padding:"8,16,8,16") > Text(caption, color:fg3, "Samsung"),
  Card(corner:20, backgroundColor:surface, padding:"8,16,8,16") > Text(caption, color:fg3, "iPhone"),
  Card(corner:20, backgroundColor:surface, padding:"8,16,8,16") > Text(caption, color:fg3, "Xiaomi")
]
→ First chip (active): accent bg + white text. Others: surface bg + fg3 text.

④ CONTENT GRID (2-column):
Row(horizontalArrangement:spacedby:12) children — EACH card MUST follow this EXACT structure:
  Card(weight:1, corner:16, elevation:2, backgroundColor:surface) children:[
    Image(fillMaxWidth:"true", h:150, contentScale:"crop"),
    Column(fillMaxWidth:"true", weight:1, padding:"8,12,14,12", verticalArrangement:"spacedby:4") children:[
      Text(h3, bold, color:fg, "Real Name"),
      Text(caption, color:fg3, "Short description"),
      Spacer(weight:1),          ← MANDATORY — pushes footer to bottom of card
      Row(horizontalArrangement:spacedby:3, verticalAlignment:center) children:[
        Icon(star, size:12, color:#F59E0B),
        Text(caption, color:fg3, "4.8  ·  124 reviews")
      ],
      Row(horizontalArrangement:spacebetween, verticalAlignment:center) children:[
        Text(body, bold, color:accent, "₺12.90"),
        Icon(shopping_cart, size:18, color:accent, onClick:toast)
      ]
    ]
  ]
→ ALL cards in the same Row MUST have identical structure so rating & price align across columns.
→ weight:1 on Column + Spacer(weight:1) = footer always anchored to card bottom.

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

⑥ DEVICE / PRODUCT CAMPAIGN CARD (2-col — for phone/device campaigns):
Row(horizontalArrangement:spacedby:12) children — EACH card:
  Card(weight:1, corner:12, elevation:2, backgroundColor:#FFFFFF) children:[
    Box(fillMaxWidth:"true") children:[
      Image(fillMaxWidth:"true", h:180, contentScale:"fit"),
      Box(padding:"6,8,6,8", backgroundColor:accent, corner:12) > Text(caption, bold, color:#FFFFFF, "5G")
    ],
    Column(fillMaxWidth:"true", weight:1, padding:"10,12,14,12", verticalArrangement:"spacedby:4") children:[
      Text(h3, bold, color:fg, "Samsung Galaxy S25 Ultra"),
      Text(caption, color:fg3, "256GB · Titanium Siyah"),
      Spacer(weight:1),
      Text(caption, color:fg3, textDecoration:"line-through", "64.999 TL"),
      Text(body, bold, color:accent, "₺54.999"),
      Text(caption, color:accent, "₺2.291/ay × 24 taksit"),
      Button(backgroundColor:accent, color:#FFFFFF, corner:8, fillMaxWidth:"true", padding:"10,0,10,0", "Sepete Ekle")
    ]
  ]
→ Badge overlay via Box z-stack (top-left "5G" or "%25 İndirim")
→ Old price with line-through + new price in accent bold
→ Installment info below price in caption accent
→ Full-width CTA button at bottom of every card

⑦ PROMO BANNER (campaign highlight — between sections):
Card(corner:12, backgroundColor:"linear-gradient(135deg,#E60000,#BE0000)", padding:"16,16,16,16") children:[
  Row(horizontalArrangement:spacedby:12, verticalAlignment:center) children:[
    Column(weight:1, verticalArrangement:spacedby:4) children:[
      Text(h3, bold, color:#FFFFFF, "Eski cihazını getir, yenisini al!"),
      Text(caption, color:#FFFFFFcc, "Takas kampanyasıyla ekstra 5.000 TL indirim")
    ],
    Button(backgroundColor:#FFFFFF, color:accent, corner:8, padding:"10,20,10,20", "Başvur")
  ]
]

QUALITY — every output must pass ALL of these:
✓ Real copy: actual names, real prices, real labels — zero placeholder text ever
✓ PALETTE: choose bg + surface + accent + fg + fg3 — use consistently (accent only on CTAs/prices/active icons)
✓ HEADER: Row(spacebetween,center,padding:"12,16,12,16") > [Row(spacedby:8) > [Icon(domain,accent), Text(h3,bold,accent,"App Name")], Row(spacedby:12) > [Icon(search,fg3), Icon(notifications,fg3)]]
✓ HERO OVERLAY (pattern ①) immediately after header — Box with contentAlignment:"bottomCenter" — vivid contextual image
✓ SCROLL WRAPPER: Column(scroll:"true") wraps all body sections after header+hero
✓ 3+ content sections inside scroll using patterns ②–⑦ with real content
✓ RATINGS on every product/place card (Row + star Icon + Text "4.8 · 124")
✓ BADGES on 1-2 featured cards: extra Box child over Card with accent bg + caption white text
✓ BottomBar: items:[{"icon":"home","label":"Ana Sayfa","onClick":{"type":"navigate","destination":"home"}},{"icon":"menu_book","label":"Menü","onClick":{"type":"navigate","destination":"menu"}},{"icon":"favorite","label":"Favoriler","onClick":{"type":"navigate","destination":"favorites"}},{"icon":"person","label":"Profil","onClick":{"type":"navigate","destination":"profile"}}]
✓ Typography hierarchy: h1 hero > h2 section heads > h3 card titles > body > caption
✓ If campaign/device prompt: use pattern ⑥ for product grid + pattern ⑦ for promo banner + pattern ③-B for filter chips
✓ Prices in ₺ (TL) format with realistic Turkey market values
✓ Old price with textDecoration:"line-through" + new campaign price in bold accent

CARD CONSISTENCY RULES (Figma quality):
✓ All Image components → always set fillMaxWidth:"true" unless image has explicit width
✓ Cards in the SAME Row → identical internal structure (same children types in same order)
✓ Multi-line card content → Column(weight:1) + Spacer(weight:1) before footer section
✓ Price/CTA row → always the LAST child of card Column, anchored to bottom via Spacer
✓ Never truncate card titles differently in the same row — use the same style
✓ Discount badges → Box child overlay (not inside the Column body)
✓ Two-column grid cards → BOTH must have: image → title → desc → Spacer → rating → price (exact same sequence)
✓ Product campaign cards → BOTH must have: image+badge → name → specs → Spacer → old price → new price → installment → CTA (exact same sequence)

COMPONENTS:
Column: verticalArrangement(top|bottom|center|spacebetween|spaceevenly|spacedby:N), horizontalAlignment(start|center|end), scroll:"true"
Row: horizontalArrangement(start|end|center|spacebetween|spaceevenly|spacedby:N), verticalAlignment(top|center|bottom), scroll:"true"
Box: stacks children as z-layers (image+overlay+badge combos)
Card: corner, elevation, backgroundColor, padding, onClick
Text: style(h1|h2|h3|body|caption), fontWeight(bold|medium|normal), textAlign, color, textDecoration("line-through"|"underline")
Image: url, contentScale(crop|fit), height, corner, fillMaxWidth:"true"
Button: text, backgroundColor, color, corner, padding, fillMaxWidth, onClick
Icon: name(Material snake_case — star, home, search, person, favorite, shopping_cart, notifications, local_cafe, menu_book, chevron_right, add, share, phone_android, local_offer, swap_horiz), size, color, onClick
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
- Image missing fillMaxWidth:"true" when it should fill container → add it
- Empty children:[] → remove the container
- Hero Box missing contentAlignment:"bottomCenter" → add it

PRIORITY 2 — VISUAL (fix only if clearly broken):
- Text on dark surface without explicit light color → set color:#ffffff or color:#ffffffcc
- No padding on root → add padding:"0,16,16,16"
- All text same size/weight → differentiate: at least h2 + body + caption with bold variants
- Zero gap between siblings → add verticalArrangement:"spacedby:12"
- Missing BottomBar on multi-section screen → add 4-tab BottomBar
- Content items not in Cards → wrap in Card(corner:12,elevation:1)
- Cards in same Row with inconsistent structure → add Spacer(weight:1) before footer in each card
- Card Column missing weight:1 → add weight:1 so all cards in the row stretch to same height

PRIORITY 3 — CAMPAIGN / PRODUCT CARDS (fix if applicable):
- Product card without badge overlay → add Box z-stack with badge (e.g. "5G", "Yeni")
- Old price without textDecoration:"line-through" → add it
- Campaign price not bold or not in accent color → fix to bold + accent
- Installment text missing → add caption with accent color (e.g. "₺2.291/ay × 24 taksit")
- Product cards in same Row with different structure → normalize to identical sequence
- Filter chips all same style (no active state) → make first chip accent bg + white text

DO NOT: change color scheme, restructure sections, rename copy, or touch anything that looks fine.

OUTPUT: ONLY valid JSON. Fixed → corrected JSON. No issues → original JSON as-is.

CURRENT SDUI JSON:
"""
