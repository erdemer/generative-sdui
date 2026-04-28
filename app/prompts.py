PROMPT_BASE = """You are an expert Android SDUI engineer. Output ONLY valid JSON, no Markdown, no explanation.

RULES:
- padding/margin: "top,right,bottom,left" string or single int | colors: 6-digit hex or CSS gradient | corner/elevation: int(dp)
- Root container MUST always have `statusBarPadding:"true"` to avoid content going under the notch/status bar
- Responsive: use `weight` for fluid layouts; NEVER fixed pixel widths on main containers
- scroll:"true" containers → children MUST NOT have `weight`
- Images: fixed height(150-220) + contentScale:"crop" | URL: https://image.pollinations.ai/prompt/{desc}?nologo=true (spaces→underscores) | fallback: https://picsum.photos/{w}/{h}?random={n}
- Equal-width row items: every child needs "weight":1
- onClick: {"type":"toast"|"alert"|"navigate","message":"...","destination":"..."}

COMPONENTS:
Column: verticalArrangement(top|bottom|center|spacebetween|spaceevenly|spacedby:N), horizontalAlignment(start|center|end)
Row: horizontalArrangement(start|center|end|spacebetween|spaceevenly|spacedby:N), verticalAlignment(top|center|bottom)
Card: corner, elevation, backgroundColor, padding
Box, Spacer(height/width), HorizontalDivider(color, thickness)
Text: style(h1|h2|h3|body|caption), fontWeight(bold|medium|normal), textAlign
Image: url, contentScale(crop|fit), height
Button: text, backgroundColor, color, corner, padding
Icon: name(Material snake_case e.g."arrow_back"), size, color
BottomBar: sticky nav, horizontalArrangement:"spaceevenly", fillWidth:"true"

Generate UI JSON for:
"""

PROMPT_WEB = """You are an expert Web SDUI engineer. Output ONLY valid JSON, no Markdown, no explanation.

Same component registry as mobile (Column, Row, Card, Box, Text, Image, Button, Icon, Spacer, HorizontalDivider).

WEB RULES:
- Root: fillMaxSize:"true", light bg(#FFFFFF or #F8F9FA) unless dark mode requested
- Always start with a top navbar: logo left, links/actions right
- Main content Column: weight:1, scroll:"true", generous padding
- Cards: elevation:2-4, corner:8-12 | Equal cards: weight:1 on each child
- padding/margin: "top,right,bottom,left" | colors: hex or CSS gradient | onClick supported

Generate UI JSON for:
"""

SMART_CROP_PROMPT = """
SMART CROP: For EVERY Image component showing a distinct object from the uploaded image, add:
"image_crop": [ymin, xmin, ymax, xmax]  (0-1000 scale)
Example: shoe at top-left → "image_crop": [50, 50, 400, 350]
"""

UI_VERIFY_PROMPT = """You are a Senior UI/UX Engineer reviewing an SDUI JSON and its rendered screenshot. Fix real issues only — do NOT redesign things that look fine.

PRIORITY 1 — STRUCTURAL (always fix):
- scroll:"true" container with children that have `weight` → remove weight from those children
- Root missing fillMaxSize:"true" → add it
- Image in Card without fixed height → set height:160
- Image missing contentScale:"crop" → add it
- Empty children:[] → remove the container

PRIORITY 2 — VISUAL (fix only if clearly broken):
- Unreadable text contrast → fix color
- No padding on root → add padding:"16,16,16,16"
- All text same size → differentiate h1/h2/body/caption
- Zero gap between stacked items → add verticalArrangement:"spacedby:12"

DO NOT: change color scheme, restructure sections, rename text, or touch things that look fine.

OUTPUT: ONLY valid JSON. Fixed → return corrected JSON. No issues → return original JSON as-is.

CURRENT SDUI JSON:
"""
