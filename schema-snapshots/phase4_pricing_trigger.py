#!/usr/bin/env python3
"""Phase 4: Add part_cost + calculated_price to repair_quality_prices; seed demo part_cost values"""
import requests, sys

BASE     = "https://cms.helloservice.ua"
H_BASE   = {"Content-Type": "application/json"}
EMAIL    = "admin@helloservice.ua"
PASSWORD = "TFAJZfgr3fl0accHFxhOL7tHUaX0fTRe"

import urllib3
urllib3.disable_warnings()

_tok = {"v": None, "n": 0}

def refresh():
    r = requests.post(f"{BASE}/auth/login", headers=H_BASE,
                      json={"email": EMAIL, "password": PASSWORD}, verify=False)
    d = r.json()
    if "data" not in d:
        sys.exit(f"Auth failed: {r.text}")
    _tok["v"] = d["data"]["access_token"]
    _tok["n"] = 0

def H():
    _tok["n"] += 1
    if _tok["n"] % 12 == 1:
        refresh()
    return {**H_BASE, "Authorization": f"Bearer {_tok['v']}"}

errors = []

def chk(r, label):
    if r.status_code >= 300:
        msg = f"  ✗ {label}: HTTP {r.status_code} — {r.text[:250]}"
        print(msg); errors.append(msg)
        return False
    print(f"  ✓ {label}")
    return True

# ── 1. Add fields ─────────────────────────────────────────────────────────────
print("\n=== Adding pricing fields to repair_quality_prices ===")
refresh()

fields = [
    {
        "field": "part_cost",
        "type": "decimal",
        "meta": {
            "interface": "input",
            "note": "Собівартість запчастини (₴). Вхідний параметр — effective_price розраховується автоматично.",
            "display": "formatted-value",
            "display_options": {"format": True},
        },
        "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2},
    },
    {
        "field": "calculated_price",
        "type": "decimal",
        "meta": {
            "interface": "input",
            "note": "Розрахована ціна P (до коригування конкурентами). Заповнюється автоматично тригером.",
            "readonly": True,
        },
        "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2},
    },
]

for f in fields:
    r = requests.post(f"{BASE}/fields/repair_quality_prices", headers=H(), json=f, verify=False)
    chk(r, f"field repair_quality_prices.{f['field']}")

# ── 2. Seed part_cost for demo records ────────────────────────────────────────
print("\n=== Seeding part_cost for iPhone 13 Pro Max demo records ===")

# Get all repair_quality_prices for iPhone 13 Pro Max
r = requests.get(
    f"{BASE}/items/repair_quality_prices"
    "?filter[model_id][_eq]=b7ef4e0f-4673-45b7-b5df-8eff42b82d3b"
    "&filter[repair_type_id][_eq]=715f305c-0b7e-4f00-a287-de1761afeeba"
    "&fields=id,quality_type_id.name,quality_type_id.quality_tier,part_cost"
    "&sort=quality_type_id.quality_tier",
    headers=H(), verify=False
)
if not chk(r, "fetch demo records"):
    sys.exit()

records = r.json().get("data", [])
print(f"  Found {len(records)} records")

# Map quality tier → part_cost
PART_COSTS = {
    5: 3200,   # Оригінал (OEM)     — tier 5 (highest)
    4: 1800,   # OLED-аналог        — tier 4
    2: 900,    # Відновлений        — tier 2
    3: 1200,   # IPS-аналог         — tier 3 (if exists)
    1: 600,    # TFT-аналог         — tier 1 (if exists)
}

for rec in records:
    qt = rec.get("quality_type_id") or {}
    tier = qt.get("quality_tier")
    name = qt.get("name", "?")
    part_cost = PART_COSTS.get(tier)
    if part_cost is None:
        print(f"  ! no part_cost for tier {tier} ({name}) — skip")
        continue
    r = requests.patch(
        f"{BASE}/items/repair_quality_prices/{rec['id']}",
        headers=H(), json={"part_cost": part_cost}, verify=False
    )
    chk(r, f"part_cost={part_cost} → {name} (tier {tier})")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("phase4_pricing_trigger: Directus fields added + demo part_cost seeded")
    print("Next step: run PostgreSQL triggers (pricing_triggers.sql)")
print("="*50)
