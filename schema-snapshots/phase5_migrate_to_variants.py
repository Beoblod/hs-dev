#!/usr/bin/env python3
"""Phase 5: Migrate repair_quality_prices → repair_variants + model_repair_catalog
Steps:
  1. Add repair_time_hours + warranty_months to repair_variants
  2. Create Directus M2O relations (catalog_id, quality_type_id)
  3. Add read permissions for repair_variants + model_repair_catalog
  4. Migrate data from repair_quality_prices
"""
import requests, sys, json

BASE     = "https://cms.helloservice.ua"
H_BASE   = {"Content-Type": "application/json"}
EMAIL    = "admin@helloservice.ua"
PASSWORD = "TFAJZfgr3fl0accHFxhOL7tHUaX0fTRe"
POLICY   = "8f61dab1-961e-489c-8d93-9dd79b26b012"   # hs_nextjs_svc

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
        msg = f"  ✗ {label}: HTTP {r.status_code} — {r.text[:300]}"
        print(msg); errors.append(msg)
        return False
    print(f"  ✓ {label}")
    return True

# ── 1. Add missing fields to repair_variants ──────────────────────────────────
print("\n=== 1. Adding fields to repair_variants ===")
refresh()

new_fields = [
    {
        "field": "repair_time_hours",
        "type": "decimal",
        "meta": {
            "interface": "input",
            "note": "Час ремонту (год) для цієї моделі. Якщо порожньо — береться з repair_types.",
        },
        "schema": {"is_nullable": True, "numeric_precision": 5, "numeric_scale": 2},
    },
    {
        "field": "warranty_months",
        "type": "integer",
        "meta": {
            "interface": "input",
            "note": "Гарантія (міс). Заповнюється автоматично тригером із part_quality_types.warranty_days_default.",
        },
        "schema": {"is_nullable": True},
    },
]

for f in new_fields:
    r = requests.post(f"{BASE}/fields/repair_variants", headers=H(), json=f, verify=False)
    if r.status_code == 400 and "already" in r.text.lower():
        print(f"  ~ repair_variants.{f['field']} already exists, skipping")
    else:
        chk(r, f"field repair_variants.{f['field']}")

# ── 2. Create Directus relations ──────────────────────────────────────────────
print("\n=== 2. Creating Directus relations ===")

relations = [
    {
        "collection": "repair_variants",
        "field": "catalog_id",
        "related_collection": "model_repair_catalog",
        "meta": {"many_collection": "repair_variants", "many_field": "catalog_id",
                 "one_collection": "model_repair_catalog", "one_field": None,
                 "junction_field": None, "sort_field": None, "one_allowed_collections": None,
                 "one_collection_field": None, "one_deselect_action": "nullify"},
        "schema": {"on_delete": "SET NULL"},
    },
    {
        "collection": "repair_variants",
        "field": "quality_type_id",
        "related_collection": "part_quality_types",
        "meta": {"many_collection": "repair_variants", "many_field": "quality_type_id",
                 "one_collection": "part_quality_types", "one_field": None,
                 "junction_field": None, "sort_field": None, "one_allowed_collections": None,
                 "one_collection_field": None, "one_deselect_action": "nullify"},
        "schema": {"on_delete": "SET NULL"},
    },
]

for rel in relations:
    r = requests.post(f"{BASE}/relations", headers=H(), json=rel, verify=False)
    if r.status_code == 400 and "already" in r.text.lower():
        print(f"  ~ relation {rel['collection']}.{rel['field']} already exists, skipping")
    else:
        chk(r, f"relation {rel['collection']}.{rel['field']} → {rel['related_collection']}")

# ── 3. Read permissions for hs_nextjs_svc ─────────────────────────────────────
print("\n=== 3. Adding read permissions ===")

perms = [
    {"collection": "repair_variants",    "action": "read", "fields": ["*"]},
    {"collection": "model_repair_catalog","action": "read", "fields": ["*"]},
]

for p in perms:
    # Check if already exists
    check = requests.get(
        f"{BASE}/permissions?filter[policy][_eq]={POLICY}"
        f"&filter[collection][_eq]={p['collection']}&filter[action][_eq]=read",
        headers=H(), verify=False
    )
    existing = check.json().get("data", [])
    if existing:
        print(f"  ~ permission {p['collection']} read already exists, skipping")
        continue
    r = requests.post(f"{BASE}/permissions",
                      headers=H(),
                      json={"policy": POLICY, **p},
                      verify=False)
    chk(r, f"permission {p['collection']} read")

# ── 4. Migrate data: repair_quality_prices → repair_variants ─────────────────
print("\n=== 4. Migrating data ===")

# 4a. Fetch all repair_quality_prices
r = requests.get(
    f"{BASE}/items/repair_quality_prices"
    "?fields=id,model_id,repair_type_id,quality_type_id,part_cost,effective_price"
    ",warranty_months,is_available,sort_order&limit=-1",
    headers=H(), verify=False
)
if not chk(r, "fetch repair_quality_prices"):
    sys.exit("Cannot fetch source data")

rqp_rows = r.json().get("data", [])
print(f"  Found {len(rqp_rows)} repair_quality_prices records")

if not rqp_rows:
    print("  Nothing to migrate.")
else:
    # 4b. Build catalog map: (model_id, repair_type_id) → catalog_id
    catalog_map = {}

    # First fetch existing model_repair_catalog entries
    r = requests.get(
        f"{BASE}/items/model_repair_catalog?fields=id,model_id,repair_type_id&limit=-1",
        headers=H(), verify=False
    )
    if chk(r, "fetch existing model_repair_catalog"):
        for row in r.json().get("data", []):
            key = (row["model_id"], row["repair_type_id"])
            catalog_map[key] = row["id"]

    # Create missing catalog entries
    unique_pairs = set()
    for rqp in rqp_rows:
        key = (rqp["model_id"], rqp["repair_type_id"])
        unique_pairs.add(key)

    for (model_id, repair_type_id) in unique_pairs:
        key = (model_id, repair_type_id)
        if key in catalog_map:
            continue
        r = requests.post(
            f"{BASE}/items/model_repair_catalog",
            headers=H(),
            json={"model_id": model_id, "repair_type_id": repair_type_id, "is_available": True},
            verify=False
        )
        if chk(r, f"create catalog ({model_id[:8]}… × {repair_type_id[:8]}…)"):
            catalog_map[key] = r.json()["data"]["id"]

    # 4c. Fetch existing repair_variants to avoid duplicates
    r = requests.get(
        f"{BASE}/items/repair_variants?fields=id,catalog_id,quality_type_id&limit=-1",
        headers=H(), verify=False
    )
    existing_variants = set()
    if chk(r, "fetch existing repair_variants"):
        for row in r.json().get("data", []):
            existing_variants.add((row["catalog_id"], row["quality_type_id"]))

    # 4d. Create repair_variants entries
    created = 0
    skipped = 0
    for rqp in rqp_rows:
        key = (rqp["model_id"], rqp["repair_type_id"])
        catalog_id = catalog_map.get(key)
        if not catalog_id:
            print(f"  ! no catalog entry for {key}, skipping")
            continue

        qt_id = rqp.get("quality_type_id")
        if isinstance(qt_id, dict):
            qt_id = qt_id.get("id")

        variant_key = (catalog_id, qt_id)
        if variant_key in existing_variants:
            skipped += 1
            continue

        payload = {
            "catalog_id":    catalog_id,
            "quality_type_id": qt_id,
            "is_available":  rqp.get("is_available", True),
        }
        if rqp.get("part_cost") is not None:
            payload["part_cost"] = rqp["part_cost"]
        if rqp.get("warranty_months") is not None:
            payload["warranty_months"] = rqp["warranty_months"]

        r = requests.post(f"{BASE}/items/repair_variants",
                          headers=H(), json=payload, verify=False)
        if chk(r, f"create variant catalog={catalog_id[:8]}… qt={str(qt_id)[:8]}…"):
            existing_variants.add(variant_key)
            created += 1

    print(f"  Created: {created}, Skipped (already exist): {skipped}")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors:
        print(e)
else:
    print("phase5_migrate_to_variants: All steps completed successfully")
    print("Next: run variant_triggers.sql in PostgreSQL")
print("="*60)
