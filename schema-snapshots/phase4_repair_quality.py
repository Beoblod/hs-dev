#!/usr/bin/env python3
"""Phase 4: Create repair_quality_prices collection for quality variants per service"""
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

# ── 1. Create collection ──────────────────────────────────────────────────────
print("\n=== Creating repair_quality_prices collection ===")
refresh()

r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "repair_quality_prices",
    "meta": {
        "icon": "star_rate",
        "note": "Ціни на послугу за варіантами якості запчастин",
        "sort_field": "sort_order",
    },
    "schema": {},
    "fields": [
        {
            "field": "id", "type": "uuid",
            "meta": {"hidden": True, "readonly": True, "interface": "input", "special": ["uuid"]},
            "schema": {"is_primary_key": True, "has_auto_increment": False},
        },
        {
            "field": "model_id", "type": "uuid",
            "meta": {"interface": "select-dropdown-m2o", "display": "related-values",
                     "options": {"template": "{{name}}"}, "note": "Модель пристрою"},
            "schema": {"is_nullable": False, "foreign_key_table": "device_models", "foreign_key_column": "id"},
        },
        {
            "field": "repair_type_id", "type": "uuid",
            "meta": {"interface": "select-dropdown-m2o", "display": "related-values",
                     "options": {"template": "{{name}}"}, "note": "Тип ремонту"},
            "schema": {"is_nullable": False, "foreign_key_table": "repair_types", "foreign_key_column": "id"},
        },
        {
            "field": "quality_type_id", "type": "integer",
            "meta": {"interface": "select-dropdown-m2o", "display": "related-values",
                     "options": {"template": "{{name}}"}, "note": "Якість запчастини"},
            "schema": {"is_nullable": False, "foreign_key_table": "quality_types", "foreign_key_column": "id"},
        },
        {
            "field": "effective_price", "type": "decimal",
            "meta": {"interface": "input", "note": "Ціна (грн)"},
            "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2},
        },
        {
            "field": "warranty_months", "type": "integer",
            "meta": {"interface": "input", "note": "Гарантія (місяців)"},
            "schema": {"is_nullable": True},
        },
        {
            "field": "is_available", "type": "boolean",
            "meta": {"interface": "boolean"},
            "schema": {"is_nullable": False, "default_value": True},
        },
        {
            "field": "sort_order", "type": "integer",
            "meta": {"interface": "input"},
            "schema": {"is_nullable": True, "default_value": 0},
        },
    ],
})
chk(r, "repair_quality_prices collection")

# ── 2. Add read permission for hs_nextjs_svc role ─────────────────────────────
print("\n=== Adding read permission for hs_nextjs_svc ===")

# Get policy ID from existing branches permission
r = requests.get(
    f"{BASE}/permissions?filter[collection][_eq]=branches&limit=1",
    headers=H(), verify=False
)
policy_id = None
if r.status_code == 200:
    items = r.json().get("data", [])
    if items:
        policy_id = items[0].get("policy")
        print(f"  ✓ found policy: {policy_id}")

if policy_id:
    r = requests.post(f"{BASE}/permissions", headers=H(), verify=False, json={
        "policy": policy_id,
        "collection": "repair_quality_prices",
        "action": "read",
        "fields": "*",
    })
    chk(r, "read permission for repair_quality_prices")

# ── 3. Seed demo data ─────────────────────────────────────────────────────────
print("\n=== Seeding demo quality variants ===")

# Find iPhone 13 Pro Max
r = requests.get(
    f"{BASE}/items/device_models?filter[name][_contains]=13 Pro Max&limit=5&fields=id,name",
    headers=H(), verify=False
)
models = r.json().get("data", [])
iphone_model = next((m for m in models if "13 Pro Max" in m["name"]), None)
if iphone_model:
    print(f"  ✓ found model: {iphone_model['name']} ({iphone_model['id']})")
else:
    print("  ! iPhone 13 Pro Max not found — skipping seed")

# Find display replacement repair type
r = requests.get(
    f"{BASE}/items/repair_types?filter[name][_contains]=дисплея&limit=5&fields=id,name,slug",
    headers=H(), verify=False
)
repair_types = r.json().get("data", [])
display_repair = repair_types[0] if repair_types else None
if display_repair:
    print(f"  ✓ found repair type: {display_repair['name']} ({display_repair['id']})")
else:
    print("  ! display repair type not found — skipping seed")

# Get quality types sorted by sort_order
r = requests.get(
    f"{BASE}/items/quality_types?sort=sort_order&limit=10&fields=id,name,slug",
    headers=H(), verify=False
)
quality_types = r.json().get("data", [])
print(f"  ✓ found {len(quality_types)} quality types: {[q['name'] for q in quality_types]}")

if iphone_model and display_repair and len(quality_types) >= 3:
    seed_items = [
        {
            "model_id": iphone_model["id"],
            "repair_type_id": display_repair["id"],
            "quality_type_id": quality_types[0]["id"],
            "effective_price": 4200,
            "warranty_months": 12,
            "is_available": True,
            "sort_order": 1,
        },
        {
            "model_id": iphone_model["id"],
            "repair_type_id": display_repair["id"],
            "quality_type_id": quality_types[1]["id"],
            "effective_price": 2800,
            "warranty_months": 6,
            "is_available": True,
            "sort_order": 2,
        },
        {
            "model_id": iphone_model["id"],
            "repair_type_id": display_repair["id"],
            "quality_type_id": quality_types[2]["id"],
            "effective_price": 1400,
            "warranty_months": 3,
            "is_available": True,
            "sort_order": 3,
        },
    ]
    for item in seed_items:
        r = requests.post(
            f"{BASE}/items/repair_quality_prices",
            headers=H(), json=item, verify=False
        )
        qt_name = next(q["name"] for q in quality_types if q["id"] == item["quality_type_id"])
        chk(r, f"quality variant: {qt_name} — ₴{item['effective_price']}")
else:
    print("  ! skipped seed (missing model/repair/quality data)")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("phase4_repair_quality: done")
print("="*50)
