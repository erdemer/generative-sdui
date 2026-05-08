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
