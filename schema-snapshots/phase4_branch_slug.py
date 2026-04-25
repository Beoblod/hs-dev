#!/usr/bin/env python3
"""Phase 4: Add slug + detail fields to branches collection"""
import requests, sys, re

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

def sf(name, nullable=False, note=""):
    return {"field": name, "type": "string",
            "meta": {"interface": "input", "note": note},
            "schema": {"is_nullable": nullable}}

def tf(name, nullable=True, note=""):
    return {"field": name, "type": "text",
            "meta": {"interface": "input-multiline", "note": note},
            "schema": {"is_nullable": nullable}}

def ff(name, nullable=True, note=""):
    return {"field": name, "type": "float",
            "meta": {"interface": "input", "note": note},
            "schema": {"is_nullable": nullable}}

# ── 1. Add fields ─────────────────────────────────────────────────────────────
print("\n=== Adding fields to branches ===")
refresh()

fields_to_add = [
    sf("slug",        nullable=True, note="URL-ідентифікатор, напр. khreshchatyk (унікальний)"),
    tf("description", nullable=True, note="Опис відділення для сторінки"),
    ff("map_lat",     nullable=True, note="Широта (для iframe OpenStreetMap)"),
    ff("map_lng",     nullable=True, note="Довгота (для iframe OpenStreetMap)"),
]

for field in fields_to_add:
    r = requests.post(f"{BASE}/fields/branches", headers=H(), json=field, verify=False)
    chk(r, f"field branches.{field['field']}")

# ── 2. Seed slugs for existing branches ───────────────────────────────────────
print("\n=== Seeding slugs for existing branches ===")
refresh()

r = requests.get(
    f"{BASE}/items/branches?fields=id,name&limit=100",
    headers=H(), verify=False
)
if not chk(r, "fetch branches"):
    sys.exit("Cannot fetch branches")

branches = r.json().get("data", [])

def name_to_slug(name: str) -> str:
    slug = name.lower()
    # transliterate common Cyrillic
    tr = {
        'а':'a','б':'b','в':'v','г':'h','д':'d','е':'e','є':'ye','ж':'zh',
        'з':'z','и':'y','і':'i','ї':'yi','й':'y','к':'k','л':'l','м':'m',
        'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
        'х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'yu','я':'ya',
        ' ':'-','_':'-','.':'','(':'',')':'','«':'','»':'',',':'',
    }
    result = ''
    for ch in slug:
        result += tr.get(ch, ch)
    result = re.sub(r'[^a-z0-9\-]', '', result)
    result = re.sub(r'-+', '-', result).strip('-')
    return result

for branch in branches:
    slug = name_to_slug(branch['name'])
    r = requests.patch(
        f"{BASE}/items/branches/{branch['id']}",
        headers=H(), json={"slug": slug}, verify=False
    )
    chk(r, f"slug '{slug}' → {branch['name']}")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("phase4_branch_slug: all fields added and slugs seeded")
print("="*50)
