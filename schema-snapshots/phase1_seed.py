#!/usr/bin/env python3
"""Phase 1: Seed lookup tables with initial values"""
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
    _tok["n"]  = 0

def H():
    _tok["n"] += 1
    if _tok["n"] % 12 == 1:
        refresh()
    return {**H_BASE, "Authorization": f"Bearer {_tok['v']}"}

errors = []

def insert(collection, item):
    item.setdefault("id", str(uuid.uuid4()))
    r = requests.post(f"{BASE}/items/{collection}", headers=H(), json=item)
    if r.status_code >= 300:
        msg = f"  ✗ {collection} [{item.get('name','?')}]: {r.status_code} {r.text[:200]}"
        print(msg); errors.append(msg)
        return None
    data = r.json().get("data", {})
    print(f"  ✓ {collection}: {item.get('name','?')}")
    return data.get("id")

# ── 1. part_risk_levels ───────────────────────────────────────────────────────
print("\n=== part_risk_levels ===")
risk_ids = {}

risks = [
    {"name": "Мінімальний", "slug": "minimal",  "risk_markup_rate": 0.03, "sort_order": 1,
     "description": "Стандартні аксесуари та кабелі. Майже без ризику несправності.", "is_active": True},
    {"name": "Низький",     "slug": "low",       "risk_markup_rate": 0.07, "sort_order": 2,
     "description": "Корпусні елементи, кнопки. Рідко виявляються несправними.", "is_active": True},
    {"name": "Середній",    "slug": "medium",    "risk_markup_rate": 0.12, "sort_order": 3,
     "description": "Батареї, динаміки, мікрофони. Помірний ризик.", "is_active": True},
    {"name": "Високий",     "slug": "high",      "risk_markup_rate": 0.20, "sort_order": 4,
     "description": "Дисплеї, плати живлення. Значний ризик DOA або несумісності.", "is_active": True},
    {"name": "Критичний",   "slug": "critical",  "risk_markup_rate": 0.30, "sort_order": 5,
     "description": "Материнські плати, Touch ID/Face ID модулі. Максимальний ризик.", "is_active": True},
]

for r in risks:
    rid = insert("part_risk_levels", r)
    if rid:
        risk_ids[r["slug"]] = rid

# ── 2. part_quality_types ─────────────────────────────────────────────────────
print("\n=== part_quality_types ===")
quality_ids = {}

qualities = [
    {"name": "Оригінал (OEM)",   "slug": "original",      "quality_tier": 5,
     "warranty_days_default": 365,
     "description": "Оригінальна деталь від виробника або OEM-постачальника.", "is_active": True, "sort_order": 1},
    {"name": "OLED-аналог",      "slug": "oled-analog",   "quality_tier": 4,
     "warranty_days_default": 180,
     "description": "OLED-матриця стороннього виробника. Якість близька до оригіналу.", "is_active": True, "sort_order": 2},
    {"name": "IPS-аналог",       "slug": "ips-analog",    "quality_tier": 3,
     "warranty_days_default": 90,
     "description": "IPS-матриця. Доступна альтернатива з хорошою якістю зображення.", "is_active": True, "sort_order": 3},
    {"name": "TFT-аналог",       "slug": "tft-analog",    "quality_tier": 2,
     "warranty_days_default": 60,
     "description": "TFT-матриця. Бюджетний варіант.", "is_active": True, "sort_order": 4},
    {"name": "Відновлений",      "slug": "refurbished",   "quality_tier": 2,
     "warranty_days_default": 30,
     "description": "Відновлена деталь. Нижча вартість, знижена гарантія.", "is_active": True, "sort_order": 5},
]

for q in qualities:
    qid = insert("part_quality_types", q)
    if qid:
        quality_ids[q["slug"]] = qid

# ── 3. device_categories ──────────────────────────────────────────────────────
print("\n=== device_categories ===")
cat_ids = {}

categories = [
    {"name": "Смартфони",       "slug": "smartfony",    "slug_en": "smartphones",
     "h1_text": "Ремонт смартфонів у Києві",
     "meta_title": "Ремонт смартфонів — швидко та з гарантією | HelloService",
     "meta_description": "Професійний ремонт смартфонів будь-якого бренду. Діагностика безкоштовно. Гарантія на всі види робіт.",
     "icon": "smartphone", "sort_order": 1, "is_active": True},
    {"name": "Ноутбуки",        "slug": "noutbuky",     "slug_en": "laptops",
     "h1_text": "Ремонт ноутбуків у Києві",
     "meta_title": "Ремонт ноутбуків — діагностика та заміна деталей | HelloService",
     "meta_description": "Ремонт ноутбуків Apple, Dell, HP, Lenovo та інших брендів. Заміна матриці, клавіатури, батареї.",
     "icon": "laptop", "sort_order": 2, "is_active": True},
    {"name": "Планшети",        "slug": "planshety",    "slug_en": "tablets",
     "h1_text": "Ремонт планшетів у Києві",
     "meta_title": "Ремонт планшетів iPad та Android | HelloService",
     "meta_description": "Ремонт планшетів Apple iPad, Samsung Galaxy Tab та інших. Заміна екрану, роз'єму, батареї.",
     "icon": "tablet", "sort_order": 3, "is_active": True},
    {"name": "Смарт-годинники", "slug": "smart-hodynnyky", "slug_en": "smartwatches",
     "h1_text": "Ремонт смарт-годинників у Києві",
     "meta_title": "Ремонт Apple Watch та Android Wear | HelloService",
     "meta_description": "Ремонт Apple Watch, Samsung Galaxy Watch, Garmin. Заміна екрану, батареї, корпусу.",
     "icon": "watch", "sort_order": 4, "is_active": True},
    {"name": "Навушники",       "slug": "navushnyky",   "slug_en": "headphones",
     "h1_text": "Ремонт навушників у Києві",
     "meta_title": "Ремонт AirPods та навушників | HelloService",
     "meta_description": "Ремонт AirPods, Sony, Bose, Samsung Galaxy Buds. Заміна батареї, вушних чашок, кабелю.",
     "icon": "headphones", "sort_order": 5, "is_active": True},
]

for c in categories:
    cid = insert("device_categories", c)
    if cid:
        cat_ids[c["slug"]] = cid

# ── 4. warranty_reserves ──────────────────────────────────────────────────────
print("\n=== warranty_reserves ===")

warranty_rates = [
    ("smartfony",       0.04, "Смартфони — 4%"),
    ("noutbuky",        0.05, "Ноутбуки — 5%"),
    ("planshety",       0.04, "Планшети — 4%"),
    ("smart-hodynnyky", 0.03, "Смарт-годинники — 3%"),
    ("navushnyky",      0.03, "Навушники — 3%"),
]

for slug, rate, name in warranty_rates:
    cid = cat_ids.get(slug)
    if not cid:
        print(f"  ✗ warranty_reserves: category '{slug}' not found — skipping")
        continue
    insert("warranty_reserves", {"category_id": cid, "rate": rate, "name": name})

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*55}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("ALL LOOKUP TABLES SEEDED SUCCESSFULLY")
print('='*55)
