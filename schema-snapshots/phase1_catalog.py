#!/usr/bin/env python3
"""Phase 1: Seed catalog — manufacturers, device_models, repair_types"""
import requests, uuid, sys

BASE     = "http://localhost:80"
H_BASE   = {"Host": "cms.helloservice.ua", "Content-Type": "application/json"}
EMAIL    = "admin@helloservice.ua"
PASSWORD = "TFAJZfgr3fl0accHFxhOL7tHUaX0fTRe"

_tok = {"v": None, "n": 0}

def refresh():
    r = requests.post(f"{BASE}/auth/login", headers=H_BASE,
                      json={"email": EMAIL, "password": PASSWORD})
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

def insert(col, item):
    item.setdefault("id", str(uuid.uuid4()))
    r = requests.post(f"{BASE}/items/{col}", headers=H(), json=item)
    if r.status_code >= 300:
        msg = f"  ✗ {col} [{item.get('name', item.get('id','?'))}]: {r.status_code} {r.text[:200]}"
        print(msg); errors.append(msg)
        return None
    label = item.get("name") or item.get("slug") or "ok"
    print(f"  ✓ {col}: {label}")
    return r.json()["data"]["id"]

def fetch_all(col, fields="id,slug,name"):
    r = requests.get(f"{BASE}/items/{col}?fields={fields}&limit=100", headers=H())
    return {i["slug"]: i["id"] for i in r.json().get("data", [])}

# ── Load existing lookup IDs ──────────────────────────────────────────────────
refresh()
print("Loading existing lookup IDs…")
cat_ids  = fetch_all("device_categories")   # slug → id
risk_ids = fetch_all("part_risk_levels")    # slug → id
print(f"  categories : {list(cat_ids.keys())}")
print(f"  risk levels: {list(risk_ids.keys())}")

# ── 1. MANUFACTURERS ─────────────────────────────────────────────────────────
print("\n=== manufacturers ===")
mfr_ids = {}  # slug → id

manufacturers = [
    {"name": "Apple",    "slug": "apple",   "slug_en": "apple",   "sort_order": 1, "is_active": True},
    {"name": "Samsung",  "slug": "samsung", "slug_en": "samsung", "sort_order": 2, "is_active": True},
    {"name": "Xiaomi",   "slug": "xiaomi",  "slug_en": "xiaomi",  "sort_order": 3, "is_active": True},
    {"name": "Google",   "slug": "google",  "slug_en": "google",  "sort_order": 4, "is_active": True},
    {"name": "Sony",     "slug": "sony",    "slug_en": "sony",    "sort_order": 5, "is_active": True},
    {"name": "Huawei",   "slug": "huawei",  "slug_en": "huawei",  "sort_order": 6, "is_active": True},
]

for m in manufacturers:
    mid = insert("manufacturers", m)
    if mid:
        mfr_ids[m["slug"]] = mid

# ── 2. MANUFACTURERS ↔ CATEGORIES ────────────────────────────────────────────
print("\n=== manufacturers_categories ===")

mfr_cat_map = {
    "apple":   ["smartfony", "noutbuky", "planshety", "smart-hodynnyky", "navushnyky"],
    "samsung": ["smartfony", "planshety", "smart-hodynnyky", "navushnyky"],
    "xiaomi":  ["smartfony", "navushnyky"],
    "google":  ["smartfony"],
    "sony":    ["smartfony", "navushnyky"],
    "huawei":  ["smartfony", "noutbuky", "planshety", "navushnyky"],
}

for mfr_slug, cat_slugs in mfr_cat_map.items():
    mid = mfr_ids.get(mfr_slug)
    if not mid:
        continue
    for cs in cat_slugs:
        cid = cat_ids.get(cs)
        if cid:
            insert("manufacturers_categories",
                   {"manufacturers_id": mid, "device_categories_id": cid})

# ── 3. DEVICE MODELS ─────────────────────────────────────────────────────────
print("\n=== device_models ===")

# helper: (name, slug, brand_line, brand_line_slug, is_premium, release_date, category_slug, mfr_slug)
MODELS = [
    # ── Apple / iPhone ──────────────────────────────────────────────────────
    ("iPhone 16 Pro Max", "iphone-16-pro-max", "iPhone", "iphone", True,  "2024-09-20", "smartfony", "apple"),
    ("iPhone 16 Pro",     "iphone-16-pro",     "iPhone", "iphone", True,  "2024-09-20", "smartfony", "apple"),
    ("iPhone 16 Plus",    "iphone-16-plus",    "iPhone", "iphone", False, "2024-09-20", "smartfony", "apple"),
    ("iPhone 16",         "iphone-16",         "iPhone", "iphone", False, "2024-09-20", "smartfony", "apple"),
    ("iPhone 15 Pro Max", "iphone-15-pro-max", "iPhone", "iphone", True,  "2023-09-22", "smartfony", "apple"),
    ("iPhone 15 Pro",     "iphone-15-pro",     "iPhone", "iphone", True,  "2023-09-22", "smartfony", "apple"),
    ("iPhone 15 Plus",    "iphone-15-plus",    "iPhone", "iphone", False, "2023-09-22", "smartfony", "apple"),
    ("iPhone 15",         "iphone-15",         "iPhone", "iphone", False, "2023-09-22", "smartfony", "apple"),
    ("iPhone 14 Pro Max", "iphone-14-pro-max", "iPhone", "iphone", True,  "2022-09-16", "smartfony", "apple"),
    ("iPhone 14 Pro",     "iphone-14-pro",     "iPhone", "iphone", True,  "2022-09-16", "smartfony", "apple"),
    ("iPhone 14 Plus",    "iphone-14-plus",    "iPhone", "iphone", False, "2022-09-16", "smartfony", "apple"),
    ("iPhone 14",         "iphone-14",         "iPhone", "iphone", False, "2022-09-16", "smartfony", "apple"),
    ("iPhone 13 Pro Max", "iphone-13-pro-max", "iPhone", "iphone", True,  "2021-09-24", "smartfony", "apple"),
    ("iPhone 13 Pro",     "iphone-13-pro",     "iPhone", "iphone", True,  "2021-09-24", "smartfony", "apple"),
    ("iPhone 13",         "iphone-13",         "iPhone", "iphone", False, "2021-09-24", "smartfony", "apple"),
    ("iPhone SE (3rd gen)","iphone-se-3",      "iPhone", "iphone", False, "2022-03-18", "smartfony", "apple"),
    # ── Apple / MacBook ──────────────────────────────────────────────────────
    ('MacBook Pro 16" M4',  "macbook-pro-16-m4",  "MacBook Pro", "macbook-pro", True,  "2024-11-08", "noutbuky", "apple"),
    ('MacBook Pro 14" M4',  "macbook-pro-14-m4",  "MacBook Pro", "macbook-pro", True,  "2024-11-08", "noutbuky", "apple"),
    ('MacBook Air 15" M3',  "macbook-air-15-m3",  "MacBook Air", "macbook-air", False, "2024-03-08", "noutbuky", "apple"),
    ('MacBook Air 13" M3',  "macbook-air-13-m3",  "MacBook Air", "macbook-air", False, "2024-03-08", "noutbuky", "apple"),
    # ── Apple / iPad ─────────────────────────────────────────────────────────
    ('iPad Pro 13" M4',     "ipad-pro-13-m4",     "iPad Pro",  "ipad-pro",  True,  "2024-05-15", "planshety", "apple"),
    ('iPad Pro 11" M4',     "ipad-pro-11-m4",     "iPad Pro",  "ipad-pro",  True,  "2024-05-15", "planshety", "apple"),
    ('iPad Air 13" M2',     "ipad-air-13-m2",     "iPad Air",  "ipad-air",  False, "2024-05-15", "planshety", "apple"),
    ('iPad Air 11" M2',     "ipad-air-11-m2",     "iPad Air",  "ipad-air",  False, "2024-05-15", "planshety", "apple"),
    ("iPad 10th gen",       "ipad-10",            "iPad",      "ipad",      False, "2022-10-26", "planshety", "apple"),
    ("iPad mini 7th gen",   "ipad-mini-7",        "iPad mini", "ipad-mini", False, "2024-10-23", "planshety", "apple"),
    # ── Apple / Watch ────────────────────────────────────────────────────────
    ("Apple Watch Series 10 46mm", "apple-watch-s10-46", "Apple Watch", "apple-watch", False, "2024-09-20", "smart-hodynnyky", "apple"),
    ("Apple Watch Series 10 42mm", "apple-watch-s10-42", "Apple Watch", "apple-watch", False, "2024-09-20", "smart-hodynnyky", "apple"),
    ("Apple Watch Ultra 2",        "apple-watch-ultra-2","Apple Watch Ultra","apple-watch-ultra",True,"2023-09-22","smart-hodynnyky","apple"),
    ("Apple Watch SE (2nd gen)",   "apple-watch-se-2",   "Apple Watch SE","apple-watch-se",False,"2022-09-16","smart-hodynnyky","apple"),
    # ── Apple / AirPods ──────────────────────────────────────────────────────
    ("AirPods Pro 2nd gen", "airpods-pro-2",    "AirPods Pro", "airpods-pro", True,  "2022-09-23", "navushnyky", "apple"),
    ("AirPods 4th gen",     "airpods-4",        "AirPods",     "airpods",     False, "2024-09-09", "navushnyky", "apple"),
    ("AirPods Max USB-C",   "airpods-max-usb-c","AirPods Max", "airpods-max", True,  "2024-09-09", "navushnyky", "apple"),
    # ── Samsung / Galaxy S ───────────────────────────────────────────────────
    ("Samsung Galaxy S25 Ultra", "galaxy-s25-ultra", "Galaxy S", "galaxy-s", True,  "2025-01-22", "smartfony", "samsung"),
    ("Samsung Galaxy S25+",      "galaxy-s25-plus",  "Galaxy S", "galaxy-s", False, "2025-01-22", "smartfony", "samsung"),
    ("Samsung Galaxy S25",       "galaxy-s25",       "Galaxy S", "galaxy-s", False, "2025-01-22", "smartfony", "samsung"),
    ("Samsung Galaxy S24 Ultra", "galaxy-s24-ultra", "Galaxy S", "galaxy-s", True,  "2024-01-17", "smartfony", "samsung"),
    ("Samsung Galaxy S24+",      "galaxy-s24-plus",  "Galaxy S", "galaxy-s", False, "2024-01-17", "smartfony", "samsung"),
    ("Samsung Galaxy S24",       "galaxy-s24",       "Galaxy S", "galaxy-s", False, "2024-01-17", "smartfony", "samsung"),
    # ── Samsung / Galaxy A ───────────────────────────────────────────────────
    ("Samsung Galaxy A55",  "galaxy-a55", "Galaxy A", "galaxy-a", False, "2024-03-11", "smartfony", "samsung"),
    ("Samsung Galaxy A35",  "galaxy-a35", "Galaxy A", "galaxy-a", False, "2024-03-11", "smartfony", "samsung"),
    ("Samsung Galaxy A15",  "galaxy-a15", "Galaxy A", "galaxy-a", False, "2023-12-13", "smartfony", "samsung"),
    # ── Samsung / Tab ────────────────────────────────────────────────────────
    ("Samsung Galaxy Tab S10+", "galaxy-tab-s10-plus", "Galaxy Tab S", "galaxy-tab-s", True,  "2024-08-28", "planshety", "samsung"),
    ("Samsung Galaxy Tab S9",   "galaxy-tab-s9",       "Galaxy Tab S", "galaxy-tab-s", False, "2023-08-11", "planshety", "samsung"),
    # ── Samsung / Watch ──────────────────────────────────────────────────────
    ("Samsung Galaxy Watch 7",     "galaxy-watch-7",     "Galaxy Watch", "galaxy-watch", False, "2024-07-10", "smart-hodynnyky", "samsung"),
    ("Samsung Galaxy Watch Ultra", "galaxy-watch-ultra", "Galaxy Watch", "galaxy-watch", True,  "2024-07-10", "smart-hodynnyky", "samsung"),
    # ── Samsung / Buds ───────────────────────────────────────────────────────
    ("Samsung Galaxy Buds 3 Pro", "galaxy-buds-3-pro", "Galaxy Buds", "galaxy-buds", True,  "2024-07-10", "navushnyky", "samsung"),
    ("Samsung Galaxy Buds FE",    "galaxy-buds-fe",    "Galaxy Buds", "galaxy-buds", False, "2023-10-04", "navushnyky", "samsung"),
    # ── Xiaomi ───────────────────────────────────────────────────────────────
    ("Xiaomi 14 Ultra",        "xiaomi-14-ultra",        "Xiaomi",     "xiaomi",     True,  "2024-02-25", "smartfony", "xiaomi"),
    ("Xiaomi 14",              "xiaomi-14",              "Xiaomi",     "xiaomi",     False, "2023-10-26", "smartfony", "xiaomi"),
    ("Redmi Note 13 Pro+",     "redmi-note-13-pro-plus", "Redmi Note", "redmi-note", False, "2024-01-15", "smartfony", "xiaomi"),
    ("Redmi Note 13 Pro",      "redmi-note-13-pro",      "Redmi Note", "redmi-note", False, "2024-01-15", "smartfony", "xiaomi"),
    ("Redmi 13C",              "redmi-13c",              "Redmi",      "redmi",      False, "2024-01-15", "smartfony", "xiaomi"),
    # ── Google ───────────────────────────────────────────────────────────────
    ("Google Pixel 9 Pro",  "pixel-9-pro",  "Pixel", "pixel", True,  "2024-08-13", "smartfony", "google"),
    ("Google Pixel 9",      "pixel-9",      "Pixel", "pixel", False, "2024-08-13", "smartfony", "google"),
    # ── Sony ─────────────────────────────────────────────────────────────────
    ("Sony Xperia 1 VI", "xperia-1-vi", "Xperia", "xperia", True,  "2024-05-17", "smartfony", "sony"),
    ("Sony Xperia 5 VI", "xperia-5-vi", "Xperia", "xperia", False, "2024-09-17", "smartfony", "sony"),
]

model_count = 0
for (name, slug, bl, bl_slug, is_prem, rel_date, cat_slug, mfr_slug) in MODELS:
    cid = cat_ids.get(cat_slug)
    mid = mfr_ids.get(mfr_slug)
    if not cid or not mid:
        print(f"  ✗ SKIP {name}: missing cat={cat_slug} or mfr={mfr_slug}")
        continue
    insert("device_models", {
        "name": name, "slug": slug,
        "brand_line": bl, "brand_line_slug": bl_slug,
        "is_premium": is_prem,
        "model_release_date": rel_date,
        "category_id": cid, "manufacturer_id": mid,
        "is_active": True, "sort_order": model_count + 1,
    })
    model_count += 1

print(f"\n  Total models: {model_count}")

# ── 4. REPAIR TYPES ───────────────────────────────────────────────────────────
print("\n=== repair_types ===")
rt_ids = {}  # slug → id

# (name, slug, slug_en, labor_rate, repair_time_hours, risk_slug, is_target)
REPAIRS = [
    ("Заміна дисплея",              "zamina-displeya",           "screen-replacement",
     450, 1.0,  "high",     True),
    ("Заміна батареї",              "zamina-batareyi",           "battery-replacement",
     350, 0.5,  "medium",   True),
    ("Заміна роз'єму зарядки",      "zamina-rozyemu-zaryadky",   "charging-port-replacement",
     400, 1.0,  "medium",   True),
    ("Заміна задньої кришки",       "zamina-zadnoyi-kryshky",    "back-cover-replacement",
     300, 0.5,  "low",      False),
    ("Заміна камери",               "zamina-kamery",             "camera-replacement",
     400, 1.0,  "high",     True),
    ("Ремонт після потрапляння рідини","remont-pislya-vology",   "water-damage-repair",
     500, 2.0,  "critical", True),
    ("Заміна динаміка / мікрофона", "zamina-dynamika-mikrofona", "speaker-mic-replacement",
     350, 0.75, "medium",   False),
    ("Ремонт материнської плати",   "remont-materynsk-platy",    "motherboard-repair",
     600, 3.0,  "critical", True),
    ("Заміна кнопки живлення / Home","zamina-knopky-zhyvlennya", "power-home-button-replacement",
     300, 0.5,  "medium",   False),
    ("Заміна SIM-лотку",            "zamina-sim-lotku",          "sim-tray-replacement",
     250, 0.25, "minimal",  False),
]

for (name, slug, slug_en, lr, rth, risk_slug, is_target) in REPAIRS:
    risk_id = risk_ids.get(risk_slug)
    item = {
        "name": name, "slug": slug, "slug_en": slug_en,
        "labor_rate": lr, "repair_time_hours": rth,
        "is_target_service": is_target, "is_active": True,
        "sort_order": len(rt_ids) + 1,
    }
    if risk_id:
        item["part_risk_level_id"] = risk_id
    rid = insert("repair_types", item)
    if rid:
        rt_ids[slug] = rid

# ── 5. REPAIR TYPES ↔ CATEGORIES ─────────────────────────────────────────────
print("\n=== repair_types_categories ===")

# repair_slug → [category_slugs]
RT_CAT_MAP = {
    "zamina-displeya":          ["smartfony","noutbuky","planshety","smart-hodynnyky"],
    "zamina-batareyi":          ["smartfony","noutbuky","planshety","smart-hodynnyky","navushnyky"],
    "zamina-rozyemu-zaryadky":  ["smartfony","planshety","navushnyky"],
    "zamina-zadnoyi-kryshky":   ["smartfony","planshety"],
    "zamina-kamery":            ["smartfony","planshety","noutbuky"],
    "remont-pislya-vology":     ["smartfony","noutbuky","planshety","smart-hodynnyky","navushnyky"],
    "zamina-dynamika-mikrofona":["smartfony","planshety","noutbuky","navushnyky"],
    "remont-materynsk-platy":   ["smartfony","noutbuky","planshety"],
    "zamina-knopky-zhyvlennya": ["smartfony","planshety","smart-hodynnyky"],
    "zamina-sim-lotku":         ["smartfony","planshety"],
}

for rt_slug, cat_slugs in RT_CAT_MAP.items():
    rtid = rt_ids.get(rt_slug)
    if not rtid:
        continue
    for cs in cat_slugs:
        cid = cat_ids.get(cs)
        if cid:
            insert("repair_types_categories",
                   {"repair_types_id": rtid, "device_categories_id": cid})

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*55}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("CATALOG SEEDED SUCCESSFULLY")
    print(f"  {len(mfr_ids)} manufacturers")
    print(f"  {model_count} device models")
    print(f"  {len(rt_ids)} repair types")
print('='*55)
