#!/usr/bin/env python3
"""Phase 2: Create and seed branches collection"""
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

def add_field(col, field):
    r = requests.post(f"{BASE}/fields/{col}", headers=H(), json=field, verify=False)
    chk(r, f"field {col}.{field['field']}")

# ── Helpers ───────────────────────────────────────────────────────────────────
def sf(name, nullable=False, note=""):
    return {"field": name, "type": "string",
            "meta": {"interface": "input", "note": note},
            "schema": {"is_nullable": nullable}}

def tf(name, nullable=True, note=""):
    return {"field": name, "type": "text",
            "meta": {"interface": "input-multiline", "note": note},
            "schema": {"is_nullable": nullable}}

def bf(name, default=False, note=""):
    return {"field": name, "type": "boolean",
            "meta": {"interface": "boolean", "note": note},
            "schema": {"is_nullable": False, "default_value": default}}

def intf(name, nullable=True, default=None, note=""):
    s = {"is_nullable": nullable}
    if default is not None: s["default_value"] = default
    return {"field": name, "type": "integer",
            "meta": {"interface": "input", "note": note}, "schema": s}

# ── 1. Create collection ──────────────────────────────────────────────────────
print("\n=== Creating branches collection ===")
refresh()

r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "branches",
    "meta": {"icon": "store", "note": "Відділення сервісного центру"},
    "schema": {},
    "fields": [
        {"field": "id", "type": "uuid",
         "meta": {"hidden": True, "readonly": True, "interface": "input", "special": ["uuid"]},
         "schema": {"is_primary_key": True, "has_auto_increment": False}},
        sf("name",                    note="Назва відділення"),
        sf("address",                 note="Повна адреса"),
        sf("phone_primary",           note="Основний номер телефону"),
        sf("phone_secondary",         nullable=True, note="Додатковий номер (необов'язково)"),
        tf("working_hours",           note="Графік роботи, напр. «Пн–Нд: 9:00–21:00»"),
        sf("directions_walk_url",     nullable=True, note="Google Maps — пішки"),
        sf("directions_transit_url",  nullable=True, note="Google Maps — громадський транспорт"),
        sf("directions_car_url",      nullable=True, note="Google Maps — автівка"),
        intf("sort_order",            nullable=True, default=0),
        bf("is_active",               default=True),
    ],
})
chk(r, "branches collection")

# ── 2. Seed branches ──────────────────────────────────────────────────────────
print("\n=== Seeding branches ===")

branches = [
    {
        "name": "HelloService Центр",
        "address": "вул. Хрещатик 1, Київ, 01001",
        "phone_primary": "+380 44 000 00 01",
        "phone_secondary": None,
        "working_hours": "Пн–Нд: 9:00–21:00",
        "directions_walk_url":    "https://www.google.com/maps/dir/?api=1&destination=вул.+Хрещатик+1,+Київ&travelmode=walking",
        "directions_transit_url": "https://www.google.com/maps/dir/?api=1&destination=вул.+Хрещатик+1,+Київ&travelmode=transit",
        "directions_car_url":     "https://www.google.com/maps/dir/?api=1&destination=вул.+Хрещатик+1,+Київ&travelmode=driving",
        "sort_order": 1,
        "is_active": True,
    },
]

for b in branches:
    payload = {k: v for k, v in b.items() if v is not None}
    r = requests.post(f"{BASE}/items/branches", headers=H(), json=payload, verify=False)
    chk(r, f"branch: {b['name']}")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("branches collection created and seeded successfully")
print("="*50)
