#!/usr/bin/env python3
"""Phase 3: Create informational pages collections (pages, faq_items, nova_poshta_steps, blog_posts, vacancies)"""
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

# ── Field helpers ─────────────────────────────────────────────────────────────
def sf(name, nullable=False, note="", unique=False):
    s = {"is_nullable": nullable}
    if unique: s["is_unique"] = True
    return {"field": name, "type": "string",
            "meta": {"interface": "input", "note": note}, "schema": s}

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

def dtf(name, nullable=True, note=""):
    return {"field": name, "type": "dateTime",
            "meta": {"interface": "datetime", "note": note},
            "schema": {"is_nullable": nullable}}

UUID_PK = {
    "field": "id", "type": "uuid",
    "meta": {"hidden": True, "readonly": True, "interface": "input", "special": ["uuid"]},
    "schema": {"is_primary_key": True, "has_auto_increment": False},
}

refresh()

# ── 1. pages ──────────────────────────────────────────────────────────────────
print("\n=== Creating pages collection ===")
r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "pages",
    "meta": {"icon": "article", "note": "Інформаційні сторінки (гарантія, оферта, довідник…)"},
    "schema": {},
    "fields": [
        UUID_PK,
        sf("slug",     unique=True, note='Унікальний slug: "guarantee", "public-offer", "guide", "corporate", "suppliers", "special-offers"'),
        sf("title",                 note="Заголовок h1"),
        sf("subtitle", nullable=True, note="Підзаголовок (необов'язково)"),
        tf("content",  nullable=True, note="Основний текст. Нові рядки зберігаються."),
        sf("meta_title", nullable=True, note="SEO title"),
        tf("meta_desc",  nullable=True, note="SEO description"),
        bf("is_active", default=True),
        intf("sort_order", nullable=True, default=0),
    ],
})
chk(r, "pages collection")

# ── 2. faq_items ──────────────────────────────────────────────────────────────
print("\n=== Creating faq_items collection ===")
r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "faq_items",
    "meta": {"icon": "help", "note": 'FAQ для сторінок. page_slug: "guarantee", "nova-poshta" тощо.'},
    "schema": {},
    "fields": [
        UUID_PK,
        sf("page_slug", note='Яка сторінка: "guarantee", "nova-poshta"…'),
        sf("question",  note="Питання"),
        tf("answer",    nullable=False, note="Відповідь"),
        intf("sort_order", nullable=True, default=0),
        bf("is_active", default=True),
    ],
})
chk(r, "faq_items collection")

# ── 3. nova_poshta_steps ──────────────────────────────────────────────────────
print("\n=== Creating nova_poshta_steps collection ===")
r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "nova_poshta_steps",
    "meta": {"icon": "local_shipping", "note": "Кроки відправлення через Нову Пошту"},
    "schema": {},
    "fields": [
        UUID_PK,
        sf("title",       note="Назва кроку"),
        tf("description", nullable=False, note="Опис кроку"),
        intf("sort_order", nullable=True, default=0),
        bf("is_active",   default=True),
    ],
})
chk(r, "nova_poshta_steps collection")

# ── 4. blog_posts ─────────────────────────────────────────────────────────────
print("\n=== Creating blog_posts collection ===")
r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "blog_posts",
    "meta": {"icon": "edit_note", "note": "Статті блогу"},
    "schema": {},
    "fields": [
        UUID_PK,
        sf("slug",         unique=True, note="URL-slug статті (латиниця, дефіси)"),
        sf("title",                     note="Заголовок"),
        tf("excerpt",      nullable=True,  note="Короткий анонс для лістингу (1–2 речення)"),
        tf("content",      nullable=False, note="Тіло статті. Нові рядки зберігаються."),
        dtf("published_at", nullable=True, note="Дата публікації"),
        bf("is_published", default=False,  note="Показувати на сайті?"),
        sf("meta_title",   nullable=True,  note="SEO title"),
        tf("meta_desc",    nullable=True,  note="SEO description"),
    ],
})
chk(r, "blog_posts collection")

# ── 5. vacancies ──────────────────────────────────────────────────────────────
print("\n=== Creating vacancies collection ===")
r = requests.post(f"{BASE}/collections", headers=H(), verify=False, json={
    "collection": "vacancies",
    "meta": {"icon": "work", "note": "Вакансії"},
    "schema": {},
    "fields": [
        UUID_PK,
        sf("title",           note="Назва посади"),
        sf("department",   nullable=True,  note="Відділ (необов'язково)"),
        tf("description",  nullable=False, note="Опис вакансії та умови"),
        tf("requirements", nullable=True,  note="Вимоги до кандидата (необов'язково)"),
        bf("is_active",    default=True),
        intf("sort_order", nullable=True, default=0),
    ],
})
chk(r, "vacancies collection")

# ── Seed: pages ───────────────────────────────────────────────────────────────
print("\n=== Seeding pages ===")
pages_seed = [
    {
        "slug": "guarantee",
        "title": "Гарантія",
        "subtitle": "Ми гарантуємо якість кожного ремонту",
        "content": "HelloService надає гарантію на всі виконані роботи та використані запчастини.\n\nСтандартний строк гарантії — 30 днів на роботи та 90 днів на запчастини.\n\nЯкщо в гарантійний термін виникне та сама несправність — усунемо безкоштовно.",
        "meta_title": "Гарантія на ремонт | HelloService",
        "meta_desc": "Умови гарантії на ремонт смартфонів та гаджетів у HelloService.",
        "is_active": True, "sort_order": 1,
    },
    {
        "slug": "public-offer",
        "title": "Договір публічної оферти",
        "content": "Цей договір є публічною офертою відповідно до статті 633 Цивільного кодексу України.\n\n1. ЗАГАЛЬНІ ПОЛОЖЕННЯ\n\n1.1. Цей документ є офіційною пропозицією HelloService (далі — Виконавець) укласти договір на надання послуг з ремонту цифрових пристроїв.\n\n1.2. Акцептом цього договору є факт передачі пристрою в ремонт.\n\n2. ПРЕДМЕТ ДОГОВОРУ\n\n2.1. Виконавець зобов'язується виконати діагностику та ремонт пристрою Замовника на умовах цього договору.\n\n3. ВАРТІСТЬ ПОСЛУГ\n\n3.1. Вартість послуг узгоджується до початку ремонту та не змінюється в односторонньому порядку.\n\n4. ГАРАНТІЯ\n\n4.1. На виконані роботи та встановлені запчастини надається гарантія відповідно до умов гарантійної політики Виконавця.",
        "meta_title": "Договір публічної оферти | HelloService",
        "meta_desc": "Договір публічної оферти HelloService.",
        "is_active": True, "sort_order": 2,
    },
    {
        "slug": "guide",
        "title": "Довідник",
        "subtitle": "Корисна інформація про ремонт та обслуговування гаджетів",
        "content": "У цьому розділі ви знайдете корисні статті та поради щодо обслуговування та ремонту цифрових пристроїв.\n\nОновлюється регулярно.",
        "meta_title": "Довідник | HelloService",
        "meta_desc": "Корисні статті та поради щодо ремонту гаджетів.",
        "is_active": True, "sort_order": 3,
    },
    {
        "slug": "special-offers",
        "title": "Спеціальні пропозиції",
        "subtitle": "Актуальні акції та знижки",
        "content": "Наразі спеціальних пропозицій немає.\n\nСлідкуйте за оновленнями в наших соцмережах.",
        "meta_title": "Спеціальні пропозиції | HelloService",
        "meta_desc": "Акції та знижки на ремонт гаджетів у HelloService.",
        "is_active": True, "sort_order": 4,
    },
    {
        "slug": "corporate",
        "title": "Корпоративним клієнтам",
        "subtitle": "Комплексне обслуговування бізнес-техніки",
        "content": "Пропонуємо корпоративним клієнтам вигідні умови обслуговування парку техніки:\n\n— Виїзна діагностика в офіс\n— Пріоритетний ремонт без черги\n— Персональний менеджер\n— Щомісячний звіт про стан техніки\n— Гнучка система оплати\n\nЗв'яжіться з нами для обговорення умов співпраці.",
        "meta_title": "Корпоративним клієнтам | HelloService",
        "meta_desc": "Корпоративне обслуговування техніки у HelloService.",
        "is_active": True, "sort_order": 5,
    },
    {
        "slug": "suppliers",
        "title": "Постачальникам",
        "subtitle": "Співпраця з постачальниками запчастин",
        "content": "Ми відкриті до співпраці з постачальниками якісних запчастин та комплектуючих для ремонту техніки.\n\nВимоги до постачальників:\n— Офіційна реєстрація в Україні\n— Документи якості на продукцію\n— Стабільне постачання\n\nНадішліть комерційну пропозицію на нашу електронну пошту.",
        "meta_title": "Постачальникам | HelloService",
        "meta_desc": "Умови співпраці для постачальників запчастин.",
        "is_active": True, "sort_order": 6,
    },
]
for p in pages_seed:
    payload = {k: v for k, v in p.items() if v is not None}
    r = requests.post(f"{BASE}/items/pages", headers=H(), json=payload, verify=False)
    chk(r, f"page: {p['slug']}")

# ── Seed: nova_poshta_steps ───────────────────────────────────────────────────
print("\n=== Seeding nova_poshta_steps ===")
steps = [
    {"title": "Упакуйте пристрій",     "description": "Покладіть пристрій у міцну коробку з захисним наповнювачем (бульбашкова плівка, пінопласт). Якщо є тріщина на екрані — захистіть скотчем.", "sort_order": 1, "is_active": True},
    {"title": "Оформіть відправлення", "description": "У відділенні Нової Пошти або через застосунок np.ua. Отримувач: HelloService. Адресу відділення для вашого міста дивіться на сторінці «Відділення».", "sort_order": 2, "is_active": True},
    {"title": "Повідомте нас",         "description": "Надішліть номер ТТН і опис проблеми на наш номер телефону або заповніть форму нижче. Ми підтвердимо отримання.", "sort_order": 3, "is_active": True},
    {"title": "Діагностика та ремонт", "description": "Після отримання пристрою зв'яжемося з вами для узгодження вартості. Ремонт виконується тільки після вашого підтвердження.", "sort_order": 4, "is_active": True},
    {"title": "Повернення пристрою",   "description": "Після ремонту відправляємо пристрій назад Новою Поштою з гарантійним талоном. Оплата доставки — при отриманні.", "sort_order": 5, "is_active": True},
]
for s in steps:
    r = requests.post(f"{BASE}/items/nova_poshta_steps", headers=H(), json=s, verify=False)
    chk(r, f"step {s['sort_order']}: {s['title']}")

# ── Seed: faq_items ───────────────────────────────────────────────────────────
print("\n=== Seeding faq_items ===")
faqs = [
    {"page_slug": "guarantee", "question": "На що поширюється гарантія?",         "answer": "Гарантія поширюється на встановлені запчастини та виконані роботи. Якщо в гарантійний термін виникне та сама несправність — усунемо безкоштовно.", "sort_order": 1, "is_active": True},
    {"page_slug": "guarantee", "question": "Який строк гарантії?",                "answer": "Стандартний термін — 30 днів на роботи та 90 днів на запчастини. Для деяких видів ремонту строк може бути збільшено.", "sort_order": 2, "is_active": True},
    {"page_slug": "guarantee", "question": "Що не є гарантійним випадком?",       "answer": "Механічні пошкодження після ремонту, потрапляння рідини, самостійне розбирання пристрою клієнтом.", "sort_order": 3, "is_active": True},
    {"page_slug": "nova-poshta", "question": "Скільки коштує доставка?",          "answer": "Відправлення до нас — за тарифами Нової Пошти за рахунок клієнта. Повернення відремонтованого пристрою також Новою Поштою, оплата при отриманні.", "sort_order": 1, "is_active": True},
    {"page_slug": "nova-poshta", "question": "Як швидко виконується ремонт?",     "answer": "Зазвичай 1–3 робочих дні після отримання та узгодження. Для складних випадків — до 7 днів. Ми завжди повідомляємо про терміни.", "sort_order": 2, "is_active": True},
    {"page_slug": "nova-poshta", "question": "Що якщо ремонт неможливий?",        "answer": "Ми повернемо пристрій у тому самому стані без оплати за роботу. Вартість зворотньої доставки — за рахунок клієнта.", "sort_order": 3, "is_active": True},
]
for f in faqs:
    r = requests.post(f"{BASE}/items/faq_items", headers=H(), json=f, verify=False)
    chk(r, f"faq ({f['page_slug']}): {f['question'][:45]}")

# ── Seed: blog_posts ──────────────────────────────────────────────────────────
print("\n=== Seeding blog_posts ===")
r = requests.post(f"{BASE}/items/blog_posts", headers=H(), verify=False, json={
    "slug": "yak-podovzhyty-zhyttya-batareyi",
    "title": "Як подовжити життя батареї смартфона",
    "excerpt": "Прості поради, які допоможуть зберегти ємність акумулятора на довший термін.",
    "content": "Акумулятор — один із перших компонентів, що зношується у смартфоні. Але є прості правила, які суттєво сповільнять цей процес.\n\nПорада 1: Не заряджайте до 100% і не розряджайте до 0%\nОптимальний діапазон — від 20% до 80%. Сучасні чіпсети автоматично сповільнюють зарядку після 80%, але тримати телефон постійно на зарядці все одно шкідливо.\n\nПорада 2: Уникайте зарядки в спеку\nТепло — ворог акумулятора. Не залишайте телефон на сонці або в гарячому автомобілі під час зарядки.\n\nПорада 3: Вимикайте непотрібні функції\nBluetooth, Wi-Fi, геолокація у фоновому режимі — все це прискорює розряд і додаткові цикли зарядки.\n\nЯкщо батарея вже дає менше 80% ємності — зверніться до нас. Заміна займає від 20 хвилин.",
    "is_published": True,
    "published_at": "2026-01-15T10:00:00",
    "meta_title": "Як подовжити життя батареї смартфона | HelloService Blog",
    "meta_desc": "Прості поради щодо збереження ємності акумулятора смартфона.",
})
chk(r, "blog post")

# ── Seed: vacancies ───────────────────────────────────────────────────────────
print("\n=== Seeding vacancies ===")
r = requests.post(f"{BASE}/items/vacancies", headers=H(), verify=False, json={
    "title": "Майстер з ремонту смартфонів",
    "department": "Технічний відділ",
    "description": "Шукаємо досвідченого майстра з ремонту смартфонів та планшетів.\n\nЩо ми пропонуємо:\n— Офіційне працевлаштування\n— Конкурентна заробітна плата\n— Навчання за рахунок компанії\n— Зручний графік роботи",
    "requirements": "— Досвід ремонту мобільних пристроїв від 1 року\n— Знання сервісних технологій Apple та Samsung\n— Відповідальність та акуратність\n— Бажання розвиватися у сфері",
    "is_active": True,
    "sort_order": 1,
})
chk(r, "vacancy")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
if errors:
    print(f"DONE WITH {len(errors)} ERRORS:")
    for e in errors: print(e)
else:
    print("Phase 3: all collections created and seeded successfully!")
print("="*50)
