"""Global in-memory layout state shared across routes."""

current_layout_mobile = None
current_layout_web = None
current_layout = None   # legacy fallback

variant_a = None
variant_b = None
ab_test_active = False

# Design systems list — each entry: {id, name, active, ...figma tokens}
# Persisted to disk via app/services/ds_store.py
design_systems: list[dict] = []

# Auth sessions: token -> {username, role}
sessions: dict[str, dict] = {}

# Pending publish requests waiting for admin approval
# Each: {id, user, screen_name, platform, layout, submitted_at, status,
#        reviewed_by, reviewed_at, reject_reason}
pending_publishes: list[dict] = []

# Free-text brand rules injected into every AI generation prompt.
# Persisted to disk via app/services/brand_store.py
brand_rules: str = ""
