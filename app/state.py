"""Global in-memory layout state shared across routes."""

current_layout_mobile = None
current_layout_web = None
current_layout = None   # legacy fallback

variant_a = None
variant_b = None
ab_test_active = False
