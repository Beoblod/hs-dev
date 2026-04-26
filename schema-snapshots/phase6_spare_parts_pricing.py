#!/usr/bin/env python3
"""Phase 6: Migrate pricing to spare_parts
Steps:
  1. Add pricing fields to spare_parts
  2. Create M2M junction spare_parts_device_models
  3. Create Directus relation spare_parts.repair_type_id → repair_types
  4. Add repair_time_hours to model_repair_catalog
  5. Add read permissions for spare_parts + junction
  6. Migrate demo data from repair_variants → spare_parts
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

def skip_if_exists(r, label):
    if r.status_code >= 300:
        if "already" in r.text.lower() or "exist" in r.text.lower():
            print(f"  ~ {label}: already exists, skipping")
            return True
        return chk(r, label)
    print(f"  ✓ {label}")
    return True

# ── 1. Add pricing fields to spare_parts ─────────────────────────────────────
print("\n=== 1. Adding fields to spare_parts ===")
refresh()

sp_fields = [
    {
        "field": "repair_type_id",
        "type": "uuid",
        "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"],
                 "note": "Тип ремонту, для якого використовується ця запчастина"},
        "schema": {"is_nullable": True},
    },
    {
        "field": "reference_price",
        "type": "decimal",
        "meta": {"interface": "input",
                 "note": "Довідкова закупівельна ціна (₴). Вхідний параметр для розрахунку effective_price.",
                 "display": "formatted-value", "display_options": {"format": True}},
        "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2},
    },
    {
        "field": "calculated_price",
        "type": "decimal",
        "meta": {"interface": "input", "readonly": True,
                 "note": "Розрахована ціна. Заповнюється автоматично тригером."},
        "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2},
    },
    {
        "field": "effective_price",
        "type": "decimal",
        "meta": {"interface": "input", "readonly": True,
                 "note": "Фінальна ціна для клієнта. Заповнюється автоматично тригером."},
        "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2},
    },
    {
        "field": "is_serviceable",
        "type": "boolean",
        "meta": {"interface": "boolean",
                 "note": "Запчастина доступна до встановлення"},
        "schema": {"is_nullable": False, "default_value": True},
    },
    {
        "field": "warranty_months",
        "type": "integer",
        "meta": {"interface": "input",
                 "note": "Гарантія (міс)"},
        "schema": {"is_nullable": True},
    },
]

for f in sp_fields:
    r = requests.post(f"{BASE}/fields/spare_parts", headers=H(), json=f, verify=False)
    skip_if_exists(r, f"spare_parts.{f['field']}")

# ── 2. Create M2M junction spare_parts_device_models ─────────────────────────
print("\n=== 2. Creating M2M junction spare_parts_device_models ===")

# 2a. Create collection
r = requests.post(f"{BASE}/collections", headers=H(), json={
    "collection": "spare_parts_device_models",
    "meta": {"hidden": True, "icon": "import_export"},
    "schema": {},
    "fields": [
        {"field": "id", "type": "integer",
         "meta": {"hidden": True}, "schema": {"is_primary_key": True, "has_auto_increment": True}},
    ]
}, verify=False)
skip_if_exists(r, "collection spare_parts_device_models")

# 2b. Add FK fields
for fld in [
    {"field": "spare_parts_id", "type": "uuid",
     "meta": {"hidden": True}, "schema": {"is_nullable": False}},
    {"field": "device_models_id", "type": "uuid",
     "meta": {"hidden": True}, "schema": {"is_nullable": False}},
]:
    r = requests.post(f"{BASE}/fields/spare_parts_device_models", headers=H(), json=fld, verify=False)
    skip_if_exists(r, f"spare_parts_device_models.{fld['field']}")

# 2c. M2O relation: junction.spare_parts_id → spare_parts
r = requests.post(f"{BASE}/relations", headers=H(), json={
    "collection": "spare_parts_device_models",
    "field": "spare_parts_id",
    "related_collection": "spare_parts",
    "meta": {"many_collection": "spare_parts_device_models", "many_field": "spare_parts_id",
             "one_collection": "spare_parts", "one_field": "spare_parts_device_models",
             "junction_field": "device_models_id",
             "sort_field": None, "one_allowed_collections": None,
             "one_collection_field": None, "one_deselect_action": "nullify"},
    "schema": {"on_delete": "CASCADE"},
}, verify=False)
skip_if_exists(r, "relation spare_parts_device_models.spare_parts_id → spare_parts")

# 2d. M2O relation: junction.device_models_id → device_models
r = requests.post(f"{BASE}/relations", headers=H(), json={
    "collection": "spare_parts_device_models",
    "field": "device_models_id",
    "related_collection": "device_models",
    "meta": {"many_collection": "spare_parts_device_models", "many_field": "device_models_id",
             "one_collection": "device_models", "one_field": None,
             "junction_field": "spare_parts_id",
             "sort_field": None, "one_allowed_collections": None,
             "one_collection_field": None, "one_deselect_action": "nullify"},
    "schema": {"on_delete": "CASCADE"},
}, verify=False)
skip_if_exists(r, "relation spare_parts_device_models.device_models_id → device_models")

# ── 3. M2O relation: spare_parts.repair_type_id → repair_types ───────────────
print("\n=== 3. Creating spare_parts.repair_type_id relation ===")

r = requests.post(f"{BASE}/relations", headers=H(), json={
    "collection": "spare_parts",
    "field": "repair_type_id",
    "related_collection": "repair_types",
    "meta": {"many_collection": "spare_parts", "many_field": "repair_type_id",
             "one_collection": "repair_types", "one_field": None,
             "junction_field": None, "sort_field": None,
             "one_allowed_collections": None, "one_collection_field": None,
             "one_deselect_action": "nullify"},
    "schema": {"on_delete": "SET NULL"},
}, verify=False)
skip_if_exists(r, "relation spare_parts.repair_type_id → repair_types")

# ── 4. Add repair_time_hours to model_repair_catalog ─────────────────────────
print("\n=== 4. Adding repair_time_hours to model_repair_catalog ===")

r = requests.post(f"{BASE}/fields/model_repair_catalog", headers=H(), json={
    "field": "repair_time_hours",
    "type": "decimal",
    "meta": {"interface": "input",
             "note": "Час ремонту (год) для цієї моделі. Якщо порожньо — береться з repair_types."},
    "schema": {"is_nullable": True, "numeric_precision": 5, "numeric_scale": 2},
}, verify=False)
skip_if_exists(r, "model_repair_catalog.repair_time_hours")

# ── 5. Read permissions ───────────────────────────────────────────────────────
print("\n=== 5. Adding read permissions ===")

for collection in ["spare_parts", "spare_parts_device_models"]:
    check = requests.get(
        f"{BASE}/permissions?filter[policy][_eq]={POLICY}"
        f"&filter[collection][_eq]={collection}&filter[action][_eq]=read",
        headers=H(), verify=False
    )
    if check.json().get("data"):
        print(f"  ~ permission {collection} read already exists, skipping")
        continue
    r = requests.post(f"{BASE}/permissions", headers=H(),
                      json={"policy": POLICY, "collection": collection,
                            "action": "read", "fields": ["*"]},
                      verify=False)
    chk(r, f"permission {collection} read")

# ── 6. Migrate demo data from repair_variants → spare_parts ──────────────────
print("\n=== 6. Migrating demo data ===")

# Fetch repair_variants with all needed data
r = requests.get(
    f"{BASE}/items/repair_variants"
    "?fields=id,catalog_id,quality_type_id,part_cost,warranty_months,is_available"
    "&limit=-1",
    headers=H(), verify=False
)
if not chk(r, "fetch repair_variants"):
    sys.exit()
variants = r.json().get("data", [])
print(f"  Found {len(variants)} repair_variants records")

if not variants:
    print("  Nothing to migrate.")
else:
    # Fetch model_repair_catalog to get model_id + repair_type_id
    catalog_ids = list({v["catalog_id"] for v in variants if v.get("catalog_id")})
    r = requests.get(
        f"{BASE}/items/model_repair_catalog"
        f"?filter[id][_in]={',' .join(catalog_ids)}"
        "&fields=id,model_id,repair_type_id&limit=-1",
        headers=H(), verify=False
    )
    chk(r, "fetch model_repair_catalog")
    catalog_map = {c["id"]: c for c in r.json().get("data", [])}

    # Fetch device model names
    model_ids = list({c["model_id"] for c in catalog_map.values()})
    r = requests.get(
        f"{BASE}/items/device_models"
        f"?filter[id][_in]={',' .join(model_ids)}"
        "&fields=id,name&limit=-1",
        headers=H(), verify=False
    )
    chk(r, "fetch device_models")
    model_map = {m["id"]: m["name"] for m in r.json().get("data", [])}

    # Fetch quality type names
    qt_ids = list({v["quality_type_id"] for v in variants if v.get("quality_type_id")})
    r = requests.get(
        f"{BASE}/items/part_quality_types"
        f"?filter[id][_in]={',' .join(qt_ids)}"
        "&fields=id,name&limit=-1",
        headers=H(), verify=False
    )
    chk(r, "fetch part_quality_types")
    qt_map = {q["id"]: q["name"] for q in r.json().get("data", [])}

    # Check existing spare_parts to avoid duplicates
    r = requests.get(f"{BASE}/items/spare_parts?fields=name&limit=-1", headers=H(), verify=False)
    chk(r, "fetch existing spare_parts")
    existing_names = {sp["name"] for sp in r.json().get("data", [])}

    created = 0
    skipped = 0
    for v in variants:
        catalog = catalog_map.get(v["catalog_id"])
        if not catalog:
            print(f"  ! no catalog entry for {v['catalog_id']}, skipping")
            continue

        model_id    = catalog["model_id"]
        repair_type = catalog["repair_type_id"]
        model_name  = model_map.get(model_id, "Unknown")
        qt_name     = qt_map.get(v["quality_type_id"], "Запчастина")
        sp_name     = f"{qt_name} {model_name}"

        if sp_name in existing_names:
            print(f"  ~ '{sp_name}' already exists, skipping")
            skipped += 1
            continue

        # Create slug from name
        slug = sp_name.lower()
        for old, new in [(" ", "-"), ("(", ""), (")", ""), ("'", ""),
                          ("і", "i"), ("а", "a"), ("е", "e"), ("о", "o"),
                          ("у", "u"), ("и", "y")]:
            slug = slug.replace(old, new)
        import re
        slug = re.sub(r"[^a-z0-9\-]", "", slug)
        slug = re.sub(r"-+", "-", slug).strip("-")

        payload = {
            "name":          sp_name,
            "slug":          slug,
            "repair_type_id": repair_type,
            "is_serviceable": v.get("is_available", True),
            "is_active":     True,
        }
        if v.get("part_cost") is not None:
            payload["reference_price"] = v["part_cost"]
        if v.get("warranty_months") is not None:
            payload["warranty_months"] = v["warranty_months"]

        r = requests.post(f"{BASE}/items/spare_parts", headers=H(),
                          json=payload, verify=False)
        if not chk(r, f"create spare_part '{sp_name}'"):
            continue
        sp_id = r.json()["data"]["id"]
        existing_names.add(sp_name)

        # Link to model via junction
        r = requests.post(f"{BASE}/items/spare_parts_device_models", headers=H(),
                          json={"spare_parts_id": sp_id, "device_models_id": model_id},
                          verify=False)
        chk(r, f"  junction '{sp_name}' ↔ model")
        created += 1

    print(f"  Created: {created}, Skipped: {skipped}")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors:
        print(e)
else:
    print("phase6_spare_parts_pricing: All steps completed successfully")
    print("Next: run spare_parts_triggers.sql in PostgreSQL")
print("="*60)
