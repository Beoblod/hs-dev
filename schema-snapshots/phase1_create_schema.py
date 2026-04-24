#!/usr/bin/env python3
"""Phase 1: Build Directus schema for HelloService — 21 collections"""
import requests, json, sys

BASE    = "http://localhost:80"
H_BASE  = {"Host": "cms.helloservice.ua", "Content-Type": "application/json"}
EMAIL   = "admin@helloservice.ua"
PASSWORD = "TFAJZfgr3fl0accHFxhOL7tHUaX0fTRe"

# ── Auth ─────────────────────────────────────────────────────────────────────
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

def chk(r, label):
    if r.status_code >= 300:
        msg = f"  ✗ {label}: HTTP {r.status_code} — {r.text[:250]}"
        print(msg); errors.append(msg)
        return False
    print(f"  ✓ {label}")
    return True

# ── Helpers ───────────────────────────────────────────────────────────────────
def create_col(name, fields, icon="box", note=""):
    r = requests.post(f"{BASE}/collections", headers=H(), json={
        "collection": name, "fields": fields,
        "schema": {}, "meta": {"icon": icon, "note": note}
    })
    chk(r, f"collection: {name}")

def add_field(col, f):
    r = requests.post(f"{BASE}/fields/{col}", headers=H(), json=f)
    chk(r, f"  field {col}.{f['field']}")

def add_rel(many_col, many_field, one_col):
    r = requests.post(f"{BASE}/relations", headers=H(), json={
        "collection": many_col, "field": many_field,
        "related_collection": one_col,
        "schema": {"on_delete": "SET NULL"},
        "meta": {"many_collection": many_col, "many_field": many_field,
                 "one_collection": one_col, "one_field": None}
    })
    chk(r, f"  rel {many_col}.{many_field} → {one_col}")

# ── Field builders ────────────────────────────────────────────────────────────
def pk_uuid():
    return {"field":"id","type":"uuid",
            "meta":{"hidden":True,"readonly":True,"interface":"input","special":["uuid"]},
            "schema":{"is_primary_key":True,"has_auto_increment":False}}

def pk_int():
    return {"field":"id","type":"integer",
            "meta":{"hidden":True,"interface":"input"},
            "schema":{"is_primary_key":True,"has_auto_increment":True}}

def sf(name, nullable=False, unique=False, note=""):
    return {"field":name,"type":"string",
            "meta":{"interface":"input","note":note},
            "schema":{"is_nullable":nullable,"is_unique":unique}}

def tf(name, nullable=True, note=""):
    return {"field":name,"type":"text",
            "meta":{"interface":"input-multiline","note":note},
            "schema":{"is_nullable":nullable}}

def bf(name, default=False, note=""):
    return {"field":name,"type":"boolean",
            "meta":{"interface":"boolean","note":note},
            "schema":{"is_nullable":False,"default_value":default}}

def intf(name, nullable=True, default=None, note=""):
    s = {"is_nullable":nullable}
    if default is not None: s["default_value"] = default
    return {"field":name,"type":"integer","meta":{"interface":"input","note":note},"schema":s}

def df(name, nullable=True, prec=10, scale=2, default=None, note=""):
    s = {"is_nullable":nullable,"numeric_precision":prec,"numeric_scale":scale}
    if default is not None: s["default_value"] = default
    return {"field":name,"type":"decimal","meta":{"interface":"input","note":note},"schema":s}

def datef(name, nullable=True, note=""):
    return {"field":name,"type":"date",
            "meta":{"interface":"datetime","note":note},"schema":{"is_nullable":nullable}}

def tsf(name, nullable=True, note=""):
    return {"field":name,"type":"timestamp",
            "meta":{"interface":"datetime","note":note},"schema":{"is_nullable":nullable}}

def jf(name, nullable=True, note=""):
    return {"field":name,"type":"json",
            "meta":{"interface":"input-code","options":{"language":"json"},"note":note},
            "schema":{"is_nullable":nullable}}

def fkf(name, rel_col, nullable=True, note=""):
    return {"field":name,"type":"uuid",
            "meta":{"interface":"select-dropdown-m2o","note":note},
            "schema":{"is_nullable":nullable,"foreign_key_table":rel_col,"foreign_key_column":"id"}}

def imgf(name):
    return {"field":name,"type":"uuid",
            "meta":{"interface":"file-image","special":["file"]},"schema":{"is_nullable":True}}

def sortf():
    return intf("sort_order", nullable=True, default=0)

def statusf(choices, default, note=""):
    return {"field":"status","type":"string",
            "meta":{"interface":"select-dropdown",
                    "options":{"choices":[{"text":c,"value":c} for c in choices]},"note":note},
            "schema":{"is_nullable":False,"default_value":default}}

def created_at_f():
    return {"field":"date_created","type":"timestamp",
            "meta":{"interface":"datetime","readonly":True,"special":["date-created"]},
            "schema":{"is_nullable":True}}

# ═══════════════════════════════════════════════════════════════════════════════
refresh()

# ── 1. LOOKUP TABLES ──────────────────────────────────────────────────────────
print("\n=== 1/8  Lookup tables ===")

create_col("part_risk_levels", [
    pk_uuid(),
    sf("name"),
    sf("slug", unique=True),
    df("risk_markup_rate", nullable=False, default=0, note="0.05 = 5%"),
    tf("description"),
    sortf(),
    bf("is_active", default=True),
], icon="warning", note="Рівні ризику запчастини")

create_col("part_quality_types", [
    pk_uuid(),
    sf("name"),
    sf("slug", unique=True),
    intf("quality_tier", nullable=False, default=1, note="1=нижній, 5=вищий"),
    intf("warranty_days_default", nullable=True),
    tf("description"),
    sortf(),
    bf("is_active", default=True),
], icon="star", note="Типи якості запчастин")

create_col("device_categories", [
    pk_uuid(),
    sf("name"),
    sf("slug", unique=True),
    sf("slug_en", nullable=True, unique=True, note="Фаза 5"),
    sf("h1_text", nullable=True),
    sf("meta_title", nullable=True),
    tf("meta_description"),
    tf("seo_text"),
    sf("icon", nullable=True),
    sortf(),
    bf("is_active", default=True),
], icon="category", note="Категорії пристроїв. Translations: name, h1, meta_title, meta_description, seo_text")

create_col("warranty_reserves", [
    pk_uuid(),
    fkf("category_id", "device_categories", nullable=False),
    df("rate", nullable=False, default=0.03, note="0.03–0.05"),
    sf("name", nullable=True, note="Опис ставки"),
], icon="shield", note="Ставки гарантійного резерву за категорією")

# ── 2. CATALOG ────────────────────────────────────────────────────────────────
print("\n=== 2/8  Catalog ===")

create_col("manufacturers", [
    pk_uuid(),
    sf("name"),
    sf("slug", unique=True),
    sf("slug_en", nullable=True, unique=True, note="Фаза 5"),
    imgf("logo"),
    sortf(),
    bf("is_active", default=True),
], icon="business", note="Виробники")

create_col("manufacturers_categories", [
    pk_int(),
    fkf("manufacturers_id", "manufacturers", nullable=False),
    fkf("device_categories_id", "device_categories", nullable=False),
], icon="import_export", note="M2M: Виробник ↔ Категорія")

create_col("device_models", [
    pk_uuid(),
    sf("name"),
    sf("slug", note="Унікальний у межах manufacturer_id (uk)"),
    sf("slug_en", nullable=True, note="Фаза 5"),
    fkf("category_id", "device_categories", nullable=False),
    fkf("manufacturer_id", "manufacturers", nullable=False),
    sf("brand_line", nullable=True, note="iPhone, iPad Pro, MacBook Air…"),
    sf("brand_line_slug", nullable=True),
    sf("brand_line_slug_en", nullable=True, note="Фаза 5"),
    bf("is_premium", default=False, note="×1.30 vs ×1.15"),
    datef("model_release_date", note="Для novelty_markup_coefficient"),
    imgf("image"),
    sortf(),
    bf("is_active", default=True),
    intf("age_months", nullable=True, note="PostgreSQL trigger — не редагувати"),
    df("novelty_markup_coefficient", nullable=False, prec=6, scale=4, default=1.0,
       note="PostgreSQL trigger — не редагувати"),
], icon="smartphone", note="Моделі пристроїв")

# ── 3. SPARE PARTS ────────────────────────────────────────────────────────────
print("\n=== 3/8  Spare parts ===")

create_col("spare_parts", [
    pk_uuid(),
    sf("name"),
    sf("slug", unique=True),
    fkf("category_id", "device_categories", nullable=True),
    tf("description"),
    tf("notes"),
    sortf(),
    bf("is_active", default=True),
], icon="build", note="Запчастини")

create_col("spare_part_risk_overrides", [
    pk_uuid(),
    fkf("model_id", "device_models", nullable=False),
    fkf("spare_part_id", "spare_parts", nullable=False),
    df("risk_markup_rate", nullable=False, note="Override ризику для конкретної моделі"),
    tf("notes"),
], icon="tune", note="Моделе-специфічні override ризику запчастини")

create_col("secondary_damage_risks", [
    pk_uuid(),
    fkf("repair_type_id", "repair_types", nullable=False,
        note="Ремонт що може спричинити вторинне пошкодження"),
    fkf("spare_part_id", "spare_parts", nullable=False,
        note="Компонент під ризиком"),
    df("secondary_risk_rate", nullable=False, note="Ймовірність пошкодження 0–1"),
    df("secondary_risk_cost_base", nullable=False, default=0,
       note="Базова вартість для Labor_Adj"),
    tf("description"),
], icon="report_problem", note="Ризики вторинного пошкодження (у Labor_Price)")

# ── 4. REPAIR TYPES ───────────────────────────────────────────────────────────
print("\n=== 4/8  Repair types ===")

create_col("repair_types", [
    pk_uuid(),
    sf("name"),
    sf("slug", unique=True),
    sf("slug_en", nullable=True, unique=True, note="Фаза 5"),
    tf("description"),
    df("labor_rate", nullable=False, default=0, note="Вартість нормо-години (грн/год)"),
    df("repair_time_hours", nullable=False, default=1, prec=5, scale=2,
       note="Тривалість ремонту в годинах"),
    fkf("part_risk_level_id", "part_risk_levels", nullable=True,
        note="Базовий ризик запчастини"),
    bf("is_target_service", default=False,
       note="Цільова послуга — конкурентний моніторинг"),
    sortf(),
    bf("is_active", default=True),
], icon="construction", note="Типи ремонту")

create_col("repair_types_categories", [
    pk_int(),
    fkf("repair_types_id", "repair_types", nullable=False),
    fkf("device_categories_id", "device_categories", nullable=False),
], icon="import_export", note="M2M: Тип ремонту ↔ Категорія")

create_col("repair_type_parts", [
    pk_int(),
    fkf("repair_types_id", "repair_types", nullable=False),
    fkf("spare_parts_id", "spare_parts", nullable=False),
    bf("is_required", default=True, note="Обов'язкова запчастина?"),
], icon="import_export", note="M2M: Тип ремонту ↔ Запчастини")

# ── 5. PRICE CATALOG ──────────────────────────────────────────────────────────
print("\n=== 5/8  Price catalog ===")

create_col("model_repair_catalog", [
    pk_uuid(),
    fkf("model_id", "device_models", nullable=False),
    fkf("repair_type_id", "repair_types", nullable=False),
    bf("is_available", default=True),
    df("calculated_price", nullable=True,
       note="P з формули (без конкурентного коригування)"),
    df("effective_price", nullable=True,
       note="MAX(P, min_competitor_price)"),
    tsf("last_recalculated_at"),
    tf("notes"),
], icon="price_check", note="Матриця модель × ремонт")

create_col("repair_variants", [
    pk_uuid(),
    fkf("catalog_id", "model_repair_catalog", nullable=False),
    fkf("quality_type_id", "part_quality_types", nullable=False),
    df("part_cost", nullable=False, default=0, note="Собівартість запчастини"),
    df("delivery_cost_inbound", nullable=False, default=0),
    df("delivery_cost_outbound", nullable=False, default=0),
    df("calculated_price", nullable=True),
    df("effective_price", nullable=True),
    bf("is_available", default=True),
    tf("notes"),
], icon="layers", note="Варіанти якості для одного ремонту")

# ── 6. COMPETITORS ────────────────────────────────────────────────────────────
print("\n=== 6/8  Competitors ===")

create_col("competitors", [
    pk_uuid(),
    sf("name"),
    sf("website_url", note="https://…"),
    bf("is_active", default=True),
    tf("notes"),
], icon="people", note="Конкуренти")

create_col("competitor_prices", [
    pk_uuid(),
    fkf("competitor_id", "competitors", nullable=False),
    fkf("model_id", "device_models", nullable=False),
    fkf("repair_type_id", "repair_types", nullable=False),
    df("price", nullable=False),
    sf("source_url", nullable=True),
    tsf("checked_at", nullable=False),
    created_at_f(),
    tf("notes"),
], icon="attach_money", note="Ціни конкурентів. is_stale — PostgreSQL VIEW (ТЗ §13 #5)")

create_col("part_cost_update_schedule", [
    pk_uuid(),
    fkf("model_id", "device_models", nullable=True),
    fkf("repair_type_id", "repair_types", nullable=True),
    fkf("spare_part_id", "spare_parts", nullable=True),
    intf("threshold_days", nullable=False, default=90, note="30/60/90/180 днів"),
    tsf("last_updated_at"),
    tsf("next_check_at"),
    tf("notes"),
], icon="schedule", note="Розклад оновлення цін закупівлі")

# ── 7. ORDERS & LOGS ─────────────────────────────────────────────────────────
print("\n=== 7/8  Orders & Logs ===")

create_col("repair_orders", [
    pk_uuid(),
    fkf("model_id", "device_models", nullable=True),
    fkf("repair_type_id", "repair_types", nullable=True),
    fkf("quality_type_id", "part_quality_types", nullable=True),
    sf("client_name"),
    sf("client_phone"),
    sf("client_email", nullable=True),
    df("quoted_price", nullable=True, note="Ціна на момент подачі форми"),
    statusf(["new","contacted","in_progress","done","cancelled"], "new"),
    sf("source_url", nullable=True, note="Сторінка з якої подана форма"),
    tf("notes"),
    sf("remonline_ticket_id", nullable=True, note="Фаза 4"),
    created_at_f(),
], icon="receipt", note="Заявки з форми сайту")

create_col("sync_log", [
    pk_uuid(),
    sf("event_type", note="flow_run / n8n_webhook / price_recalc"),
    sf("source", note="directus_flow / n8n / manual"),
    statusf(["success","error","warning"], "success"),
    tf("message"),
    jf("metadata"),
    created_at_f(),
], icon="receipt_long", note="Логи Directus Flows та n8n")

# ── 8. SEO ────────────────────────────────────────────────────────────────────
print("\n=== 8/8  SEO ===")

create_col("seo_pages", [
    pk_uuid(),
    sf("page_type", note="category / manufacturer / brand_line / repair_type"),
    fkf("category_id", "device_categories", nullable=True),
    fkf("manufacturer_id", "manufacturers", nullable=True),
    sf("brand_line", nullable=True),
    fkf("repair_type_id", "repair_types", nullable=True),
    sf("h1", nullable=True),
    sf("meta_title", nullable=True),
    tf("meta_description"),
    tf("seo_text"),
    bf("is_active", default=True),
], icon="search", note="SEO-тексти для категорійних та брендових сторінок")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*55}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("ALL 21 COLLECTIONS CREATED SUCCESSFULLY")
print('='*55)
