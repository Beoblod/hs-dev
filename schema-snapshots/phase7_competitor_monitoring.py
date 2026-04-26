#!/usr/bin/env python3
"""Phase 7: Competitor Price Monitoring
Steps:
  1. Fix M2O relations on competitor_prices (competitor_id, model_id, repair_type_id)
  2. Create competitor_pages collection + fields + relations
  3. Set display_template on competitors collection
  4. Add read permissions for hs_nextjs_svc policy
  5. Seed 7 competitors
  6. Seed test batch: competitor_pages for Samsung Galaxy S25 Ultra × Заміна дисплея
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
        if "already" in r.text.lower() or "exist" in r.text.lower() or "duplicate" in r.text.lower():
            print(f"  ~ {label}: already exists, skipping")
            return True
        return chk(r, label)
    print(f"  ✓ {label}")
    return True

# ── 1. Fix M2O relations on competitor_prices ────────────────────────────────
print("\n=== 1. Fixing M2O relations on competitor_prices ===")
refresh()

for rel in [
    {
        "collection": "competitor_prices",
        "field": "competitor_id",
        "related_collection": "competitors",
        "meta": {
            "many_collection": "competitor_prices", "many_field": "competitor_id",
            "one_collection": "competitors", "one_field": None,
            "junction_field": None, "sort_field": None,
            "one_allowed_collections": None, "one_collection_field": None,
            "one_deselect_action": "nullify",
        },
        "schema": {"on_delete": "CASCADE"},
    },
    {
        "collection": "competitor_prices",
        "field": "model_id",
        "related_collection": "device_models",
        "meta": {
            "many_collection": "competitor_prices", "many_field": "model_id",
            "one_collection": "device_models", "one_field": None,
            "junction_field": None, "sort_field": None,
            "one_allowed_collections": None, "one_collection_field": None,
            "one_deselect_action": "nullify",
        },
        "schema": {"on_delete": "CASCADE"},
    },
    {
        "collection": "competitor_prices",
        "field": "repair_type_id",
        "related_collection": "repair_types",
        "meta": {
            "many_collection": "competitor_prices", "many_field": "repair_type_id",
            "one_collection": "repair_types", "one_field": None,
            "junction_field": None, "sort_field": None,
            "one_allowed_collections": None, "one_collection_field": None,
            "one_deselect_action": "nullify",
        },
        "schema": {"on_delete": "CASCADE"},
    },
]:
    r = requests.post(f"{BASE}/relations", headers=H(), json=rel, verify=False)
    skip_if_exists(r, f"relation competitor_prices.{rel['field']}")

# Also fix field interfaces so they render as M2O dropdowns
for fld_name, related in [
    ("competitor_id", "competitors"),
    ("model_id", "device_models"),
    ("repair_type_id", "repair_types"),
]:
    r = requests.patch(f"{BASE}/fields/competitor_prices/{fld_name}", headers=H(), json={
        "meta": {
            "interface": "select-dropdown-m2o",
            "special": ["m2o"],
            "display": "related-values",
            "display_options": {"template": "{{name}}"},
        }
    }, verify=False)
    chk(r, f"competitor_prices.{fld_name} interface → m2o")

# ── 2. Create competitor_pages collection ─────────────────────────────────────
print("\n=== 2. Creating competitor_pages collection ===")

r = requests.post(f"{BASE}/collections", headers=H(), json={
    "collection": "competitor_pages",
    "meta": {
        "icon": "travel_explore",
        "display_template": "{{competitor_id.name}} — {{model_id.name}} — {{repair_type_id.name}}",
        "note": "Конфіг парсера: одна сторінка = одна ціна для моніторингу",
    },
    "schema": {},
    "fields": [
        {
            "field": "id",
            "type": "uuid",
            "meta": {"hidden": True, "special": ["uuid"]},
            "schema": {"is_primary_key": True},
        },
    ],
}, verify=False)
skip_if_exists(r, "collection competitor_pages")

# Fields
cp_fields = [
    {
        "field": "competitor_id",
        "type": "uuid",
        "meta": {
            "interface": "select-dropdown-m2o",
            "special": ["m2o"],
            "display": "related-values",
            "display_options": {"template": "{{name}}"},
            "note": "Конкурент",
            "required": True,
        },
        "schema": {"is_nullable": False},
    },
    {
        "field": "model_id",
        "type": "uuid",
        "meta": {
            "interface": "select-dropdown-m2o",
            "special": ["m2o"],
            "display": "related-values",
            "display_options": {"template": "{{name}}"},
            "note": "Модель пристрою",
            "required": True,
        },
        "schema": {"is_nullable": False},
    },
    {
        "field": "repair_type_id",
        "type": "uuid",
        "meta": {
            "interface": "select-dropdown-m2o",
            "special": ["m2o"],
            "display": "related-values",
            "display_options": {"template": "{{name}}"},
            "note": "Тип ремонту",
            "required": True,
        },
        "schema": {"is_nullable": False},
    },
    {
        "field": "url",
        "type": "string",
        "meta": {
            "interface": "input",
            "note": "URL сторінки з ціною конкурента",
            "required": True,
        },
        "schema": {"is_nullable": False, "max_length": 1000},
    },
    {
        "field": "price_selector",
        "type": "string",
        "meta": {
            "interface": "input",
            "note": "CSS selector для витягування ціни з HTML",
        },
        "schema": {"is_nullable": True, "max_length": 500},
    },
    {
        "field": "is_active",
        "type": "boolean",
        "meta": {
            "interface": "boolean",
            "note": "Активний для моніторингу",
        },
        "schema": {"is_nullable": False, "default_value": True},
    },
]

for f in cp_fields:
    r = requests.post(f"{BASE}/fields/competitor_pages", headers=H(), json=f, verify=False)
    skip_if_exists(r, f"competitor_pages.{f['field']}")

# M2O relations for competitor_pages
print("\n=== 2b. Creating competitor_pages relations ===")

for rel in [
    {
        "collection": "competitor_pages",
        "field": "competitor_id",
        "related_collection": "competitors",
        "meta": {
            "many_collection": "competitor_pages", "many_field": "competitor_id",
            "one_collection": "competitors", "one_field": None,
            "junction_field": None, "sort_field": None,
            "one_allowed_collections": None, "one_collection_field": None,
            "one_deselect_action": "nullify",
        },
        "schema": {"on_delete": "CASCADE"},
    },
    {
        "collection": "competitor_pages",
        "field": "model_id",
        "related_collection": "device_models",
        "meta": {
            "many_collection": "competitor_pages", "many_field": "model_id",
            "one_collection": "device_models", "one_field": None,
            "junction_field": None, "sort_field": None,
            "one_allowed_collections": None, "one_collection_field": None,
            "one_deselect_action": "nullify",
        },
        "schema": {"on_delete": "CASCADE"},
    },
    {
        "collection": "competitor_pages",
        "field": "repair_type_id",
        "related_collection": "repair_types",
        "meta": {
            "many_collection": "competitor_pages", "many_field": "repair_type_id",
            "one_collection": "repair_types", "one_field": None,
            "junction_field": None, "sort_field": None,
            "one_allowed_collections": None, "one_collection_field": None,
            "one_deselect_action": "nullify",
        },
        "schema": {"on_delete": "CASCADE"},
    },
]:
    r = requests.post(f"{BASE}/relations", headers=H(), json=rel, verify=False)
    skip_if_exists(r, f"relation competitor_pages.{rel['field']}")

# ── 3. Set display_template on competitors ────────────────────────────────────
print("\n=== 3. Setting display_template on competitors ===")

r = requests.patch(f"{BASE}/collections/competitors", headers=H(), json={
    "meta": {
        "display_template": "{{name}}",
        "icon": "business",
    }
}, verify=False)
chk(r, "competitors display_template")

# ── 4. Read permissions for hs_nextjs_svc ────────────────────────────────────
print("\n=== 4. Adding read permissions ===")

for coll in ["competitor_pages", "competitor_prices", "competitors"]:
    r = requests.post(f"{BASE}/permissions", headers=H(), json={
        "policy": POLICY,
        "collection": coll,
        "action": "read",
        "fields": ["*"],
        "permissions": {},
        "validation": {},
    }, verify=False)
    skip_if_exists(r, f"read permission {coll}")

# ── 5. Seed competitors ────────────────────────────────────────────────────────
print("\n=== 5. Seeding competitors ===")

competitors = [
    {"name": "RobimGood",        "website_url": "https://robimgood.com.ua",       "is_active": True},
    {"name": "Jabko",             "website_url": "https://jabko.ua",               "is_active": True},
    {"name": "MasterFix",        "website_url": "https://masterfix.com.ua",        "is_active": True},
    {"name": "MasterFon",        "website_url": "https://masterfon.kiev.ua",       "is_active": True},
    {"name": "Skeleton",         "website_url": "https://skeleton.ua",             "is_active": True},
    {"name": "Samsung Service",  "website_url": "https://samsungservice.com.ua",   "is_active": True},
    {"name": "App Lab",          "website_url": "https://app-lab.com.ua",          "is_active": True},
]

comp_ids = {}
for c in competitors:
    # Check if already exists
    r = requests.get(
        f"{BASE}/items/competitors",
        headers=H(),
        params={"filter[name][_eq]": c["name"], "fields": "id,name"},
        verify=False,
    )
    data = r.json().get("data", [])
    if data:
        comp_ids[c["name"]] = data[0]["id"]
        print(f"  ~ competitor '{c['name']}': already exists ({data[0]['id']})")
        continue
    r = requests.post(f"{BASE}/items/competitors", headers=H(), json=c, verify=False)
    if chk(r, f"competitor '{c['name']}'"):
        comp_ids[c["name"]] = r.json()["data"]["id"]

print(f"\n  Competitor IDs: {json.dumps(comp_ids, ensure_ascii=False, indent=2)}")

# ── 6. Seed competitor_pages test batch ───────────────────────────────────────
print("\n=== 6. Seeding competitor_pages test batch (Samsung Galaxy S25 Ultra × Заміна дисплея) ===")

# Look up Samsung Galaxy S25 Ultra model ID
r = requests.get(
    f"{BASE}/items/device_models",
    headers=H(),
    params={"filter[name][_contains]": "S25 Ultra", "fields": "id,name", "limit": 5},
    verify=False,
)
models = r.json().get("data", [])
print(f"  Found models matching 'S25 Ultra': {[m['name'] for m in models]}")

if not models:
    print("  ✗ Samsung Galaxy S25 Ultra not found — skipping competitor_pages seed")
    model_id = None
else:
    model_id = models[0]["id"]
    print(f"  Using model: {models[0]['name']} ({model_id})")

# Look up "Заміна дисплея" repair type
r = requests.get(
    f"{BASE}/items/repair_types",
    headers=H(),
    params={"filter[name][_contains]": "дисплея", "fields": "id,name", "limit": 5},
    verify=False,
)
rtypes = r.json().get("data", [])
print(f"  Found repair types matching 'дисплея': {[rt['name'] for rt in rtypes]}")

if not rtypes:
    print("  ✗ Заміна дисплея not found — skipping competitor_pages seed")
    repair_type_id = None
else:
    repair_type_id = rtypes[0]["id"]
    print(f"  Using repair type: {rtypes[0]['name']} ({repair_type_id})")

if model_id and repair_type_id:
    # Test batch: S25 Ultra display pages per competitor
    # CSS selectors to be filled in after manual HTML inspection
    pages_batch = [
        {
            "name": "RobimGood",
            "url": "https://robimgood.com.ua/remont-samsung/samsung-galaxy-s25-ultra/zamena-displeya-samsung-galaxy-s25-ultra/",
            "price_selector": "table td:contains('грн')",
        },
        {
            "name": "Jabko",
            "url": "https://jabko.ua/remont-samsung/s-seriya/galaxy-s25-ultra/zamena-displeja/",
            "price_selector": ".price, [class*='price']",
        },
        {
            "name": "MasterFix",
            "url": "https://masterfix.com.ua/samsung/galaxy-s25-ultra/display/",
            "price_selector": "tr td:nth-child(2)",
        },
        {
            "name": "MasterFon",
            "url": "https://masterfon.kiev.ua/remont-samsung/galaxy-s25-ultra/",
            "price_selector": "table tr td:nth-child(2)",
        },
        {
            "name": "Skeleton",
            "url": "https://skeleton.ua/remont/samsung/galaxy-s25-ultra/zamena-stekla-i-displeya/",
            "price_selector": "table td:nth-child(2)",
        },
        {
            "name": "Samsung Service",
            "url": "https://samsungservice.com.ua/remont-samsung/galaxy-s25-ultra/display/",
            "price_selector": ".service-price, .price",
        },
        {
            "name": "App Lab",
            "url": "https://app-lab.com.ua/remont-samsung/s25-ultra/zamena-displeya/",
            "price_selector": ".price, [class*='price']",
        },
    ]

    for p in pages_batch:
        comp_id = comp_ids.get(p["name"])
        if not comp_id:
            print(f"  ✗ No competitor ID for {p['name']} — skipping")
            continue

        r = requests.post(f"{BASE}/items/competitor_pages", headers=H(), json={
            "competitor_id": comp_id,
            "model_id": model_id,
            "repair_type_id": repair_type_id,
            "url": p["url"],
            "price_selector": p["price_selector"],
            "is_active": True,
        }, verify=False)
        chk(r, f"competitor_page {p['name']} — S25 Ultra дисплей")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "="*60)
if errors:
    print(f"Completed with {len(errors)} error(s):")
    for e in errors:
        print(e)
else:
    print("All steps completed successfully.")
