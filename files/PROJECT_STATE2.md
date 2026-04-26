# HelloService — Project State
> Цей файл читає Claude Code на початку кожної сесії.
> Оновлювати в кінці кожного робочого сеансу.

---

## Meta
- **Проект:** Сервісний центр HelloService
- **ТЗ:** `tz_helloservice_v2.2.docx` (у цьому ж репозиторії)
- **Поточна фаза:** 3 — Підготовка до міграції (дизайн + контент + форма)
- **Останнє оновлення:** 2026-04-26 (сесія 7)

## Сервери
| Роль | Сервер | Деталі |
|------|--------|--------|
| VPS (єдиний) | 173.242.59.158 | 2 CPU / 6 GB RAM / 50 GB NVMe / Ubuntu 24.04 |

**Директорія на сервері:** `/root/helloservice/`
**Домен (розробка):** `dev.helloservice.ua`
**Домен (production):** `helloservice.ua` — після завершення Фази 3

---

## Поточний стан системи

### VPS
- [x] Ubuntu 24.04 встановлено
- [x] Docker + Docker Compose встановлено
- [x] `/root/helloservice/` створено (ubuntu user відсутній → використовуємо root)
- [x] `docker-compose.yml` розгорнуто (4 сервіси: postgres, directus, n8n, nginx)
- [x] n8n доступний: `https://n8n.helloservice.ua` ✓ SSL
- [x] Directus доступний: `https://cms.helloservice.ua` ✓ SSL
- [x] HTTPS (Let's Encrypt) — сертифікат до 2026-07-23, авторенювання щопонеділка
- [x] PostgreSQL доступний лише локально (internal Docker network)
- [x] Nginx налаштовано як reverse proxy (internal + web networks)
- [x] `.env` у `.gitignore`, `.env.example` є у репозиторії
- [x] Автозапуск через `restart: always` у docker-compose
- [x] git репозиторій ініціалізовано у `/root/helloservice/`

### Directus
- [x] Версія: directus/directus:11 (остання 11.x)
- [x] Snapshot порожньої схеми: `schema-snapshots/schema-phase0-empty.json`
- [x] Адмін-акаунт створено: `admin@helloservice.ua`
- [x] 21 колекція створена (Phase 1 schema)
- [x] PostgreSQL тригер `trg_device_models_novelty` на `device_models`
- [x] Snapshot: `schema-snapshots/schema-phase1-complete.json` (312 KB)
- [x] Роль `Редактор даних` — CRUD на всі 21 колекцію, без доступу до схеми
- [ ] Translations — відкладено до Фази 5 (EN-поля порожні, UK вже в базових полях)

### Ціноутворення (Phase 4–6) ✓
- [x] `branches.slug` + `/viddilennya/[slug]` — сторінка відділення з OSM картою
- [x] `spare_parts` — поля: `repair_type_id`, `reference_price`, `calculated_price`, `effective_price`, `is_serviceable`, `warranty_months`
- [x] `spare_parts_device_models` — M2M junction (spare_part ↔ device_model)
- [x] `model_repair_catalog.repair_time_hours` — override часу ремонту для моделі
- [x] PostgreSQL тригер `fn_calc_spare_part` — розраховує effective_price автоматично
  - Формула: `part_price = reference_price × (1 + risk_rate)`, `labor_adj = labor_rate × hours`, `effective_price = part_price + labor_adj + labor_adj × warranty_rate`
  - `hours` = COALESCE(model_repair_catalog.repair_time_hours, repair_types.repair_time_hours, 1)
  - Без novelty_markup_coefficient (Variant A — спрощено)
  - Cascade тригери на `repair_types` і `model_repair_catalog`
- [x] `trg_autocreate_catalog` — при додаванні spare_part до моделі auto-створює model_repair_catalog entry
- [x] Сторінка послуги (`/remont/.../[service]`) відображає варіанти запчастин з цінами
- [x] `repair_quality_prices`, `repair_variants` — видалено (дані мігровано до spare_parts)
- [x] `spare_part_risk_overrides`, `repair_type_parts`, `part_quality_types` — видалено (надлишкові)
- [x] Scripts: `phase6_spare_parts_pricing.py` | SQL: `spare_parts_triggers.sql`, `autocreate_catalog_trigger.sql`

### Directus UI (сесія 6) ✓
- [x] M2O relations налаштовано для всіх UUID-полів: `device_models.category_id/manufacturer_id`, `model_repair_catalog.model_id/repair_type_id`, `repair_types.part_risk_level_id`, `spare_parts.category_id/repair_type_id`
- [x] `display_template: "{{name}}"` встановлено на: `device_categories`, `manufacturers`, `device_models`, `repair_types`, `part_risk_levels`, `part_categories`, `brand_lines`
- [x] `brand_lines` — нова колекція (23 записи). `device_models.brand_line` (string) → `brand_line_id` (M2O FK). Міграція 58 моделей.
- [x] `device_models.spare_parts` — O2M alias для перегляду запчастин з картки моделі
- [x] `model_repair_catalog` — unique constraint `(model_id, repair_type_id)`
- [x] Фронтенд: `brand_line` → `brand_line_id.name` у `[manufacturer]/page.tsx` і `[model]/page.tsx`

### Деплой ✓
- [x] `/root/helloservice/frontend` → symlink до `/root/helloservice-src/frontend` (єдине джерело коду)

### Next.js (`frontend/`)
- [x] Проект ініціалізовано (`create-next-app`, Next.js 16, App Router, TypeScript, Tailwind 4)
- [x] Підключено до Directus SDK (`@directus/sdk` v21, `lib/directus.ts`)
- [x] `next-intl` v4 встановлено: `proxy.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`
- [x] Локалі: uk (default, без префіксу), en (`/en/`)
- [x] Локалізовані pathnames: `/remont` (uk) ↔ `/repair` (en), `/viddilennya` (uk) ↔ `/branches` (en)
- [x] `app/[locale]/layout.tsx` — root layout з `NextIntlClientProvider`
- [x] `app/[locale]/page.tsx` — home page
- [x] `app/[locale]/remont/page.tsx` — список категорій з Directus
- [x] `app/[locale]/remont/[slug]/page.tsx` — catch-all: категорія АБО сторінка послуги
- [x] `app/[locale]/remont/[slug]/[manufacturer]/page.tsx` — список моделей виробника
- [x] `app/[locale]/remont/[slug]/[manufacturer]/[model]/page.tsx` — сторінка моделі з типами ремонту
- [x] `app/[locale]/branches/page.tsx` — відділення + форма заявки
- [x] `components/BranchCard.tsx` — картка відділення (по Figma дизайну)
- [x] `components/OrderForm.tsx` — форма заявки (Client Component, POST → /api/leads)
- [x] `app/api/leads/route.ts` — запис у Directus `leads` + n8n webhook (best-effort)
- [x] `lib/directus-server.ts` — server-side Directus client зі static token
- [x] `messages/uk.json` + `messages/en.json` — всі i18n ключі
- [x] `device_categories.slug` = `telefony`, `slug_en` = `phones`
- [x] XML Sitemap, schema.org, canonical, og:image — Sprint 5 ✓
- [x] Deploy → `dev.helloservice.ua` ✓ (2026-04-25)

---

## Виконано

### Фаза 0 — Інфраструктура ✓
- Диск розширено: 19 GB → 50 GB (growpart + resize2fs, без даунтайму)
- Старий стек видалено: `docker system prune -af --volumes` (звільнено 1.2 GB)
- Директорія `/root/helloservice/` зі структурою `nginx/`, `schema-snapshots/`, `ssl/`
- `docker-compose.yml` з 4 сервісами: postgres:15-alpine, directus:11, n8nio/n8n:latest, nginx:alpine
- `.env` (chmod 600) з безпечними credentials + `.env.example` у git
- `nginx/default.conf`: reverse proxy для cms / n8n / dev + default reject
- `schema-snapshots/schema-phase0-empty.json` — порожня базова схема
- git init, гілка `main`; репо: github.com/Beoblod/hs-dev

### Фаза 1 — Схема даних Directus ✓
- 21 колекція через Directus API (всі без помилок)
- PostgreSQL тригер `trg_device_models_novelty` для `novelty_markup_coefficient`
- Довідники: 5 рівнів ризику, 5 типів якості, 5 категорій пристроїв, 5 ставок гарантії
- Каталог: 6 виробників, 57 моделей (Apple/Samsung/Xiaomi/Google/Sony/Huawei)
- 10 типів ремонту + M2M зв'язки (18 mfr↔cat, 34 repair↔cat) через PostgreSQL
- HTTPS: Let's Encrypt, авторенювання cron щопонеділка
- Роль `Редактор даних`: CRUD на 21 колекцію, без схеми (Directus 11 Policy API)
- Snapshot: `schema-snapshots/schema-phase1-seeded.json`
- Колекція `branches` додана (Phase 2): address, phone, working_hours, directions_url, sort
- Колекція `leads` додана (Phase 2): client_name, client_phone, device_type, device_model, problem_description, service_option, no_call, status, source_url
- Роль `hs_nextjs_svc` (service account): write-only на `leads`, read-only на публічні колекції
- n8n workflow `HelloService Leads`: Webhook → Telegram (hsleads_bot → Filip), статус: ACTIVE

---

### Конкурентний моніторинг (сесія 7) ✓ (відкладено до після міграції)
- [x] `competitor_pages` — нова колекція (competitor_id, model_id, repair_type_id, url, price_selector, is_active) + M2O relations
- [x] M2O relations виправлено на `competitor_prices` (competitor_id, model_id, repair_type_id)
- [x] 8 конкурентів засіяно: MasterFix, MasterFon, Samsung Service, ServiceInUA, RobimGood, Jabko, App Lab, Skeleton
- [x] 8 `competitor_pages` для Samsung Galaxy S25 Ultra × Заміна дисплея (4 active, 4 inactive)
- [x] n8n workflow "Competitor Price Scraper" (ID: mof4Wo12IVDt96SV) — **INACTIVE**, weekly Mon 9:00
- [x] PostgreSQL VIEW `v_stale_competitor_prices` — deployed на VPS
- [x] Статичний API токен для n8n: `hs-n8n-scraper-token-2026` (admin user)
- [x] Scripts: `phase7_competitor_monitoring.py`, `stale_prices_view.sql`
- [x] Тест: 4 ціни зібрано (MasterFix 4999 / ServiceInUA 6799 / MasterFon 11950 / Samsung Service 20010 грн)
- [ ] **Активувати workflow** — натиснути Publish в n8n після міграції
- [ ] RobimGood selector — Elementor JS-tabs, потребує ручного DevTools інспекту
- [ ] Jabko / App Lab / Skeleton — знайти URL з цінами або виключити

## В процесі (до міграції домену)
- [ ] **Дизайн** — відполірувати UI
- [ ] **Інформаційні сторінки** — заповнити контентом (pages у Directus)
- [ ] **Форма заявки** — допрацювати
- [ ] **Контент** — згенерувати для сторінок категорій, моделей, послуг
- [ ] **Наповнення spare_parts** — додати реальні запчастини (reference_price → auto effective_price)

### Фаза 2 — Next.js фронтенд (виконано)
- [x] Ініціалізація проекту (App Router, TypeScript, Tailwind, Geologica font)
- [x] Підключення Directus SDK + `next-intl` (uk/en, localePrefix as-needed)
- [x] `/remont` — список категорій
- [x] `/remont/[slug]` — список виробників категорії
- [x] `/remont/[slug]/[manufacturer]` — список моделей виробника
- [x] `/remont/[slug]/[manufacturer]/[model]` — типи ремонту моделі
- [x] `/remont/[slug]/[manufacturer]/[model]/[service]` — сторінка послуги (ціна, час, related)
- [x] `/branches` (`/viddilennya`) — відділення + карта OpenStreetMap + форма
- [x] Header (3 breakpoints, Remix Icons, LocaleSwitcher, city badge)
- [x] Footer (4 колонки, newsletter, social links)
- [x] OrderForm (client component, POST → /api/leads, n8n webhook)
- [x] BranchCard (Remix Icons з Figma Components)
- [x] ReviewsCarousel → дані з Directus `reviews`
- [x] icons.tsx — 15 Remix Icons з Figma Components (ToolsIcon, EditIcon, BuildingIcon, …)
- [x] Breadcrumb компонент + BreadcrumbList JSON-LD
- [x] Figma Pro API підключено (token збережено в memory)

### Фаза 2 — Деталізований план робіт (Sprint 1-5) ✓ ВИКОНАНО
> Складено 2026-04-25. Всі спринти закрито 2026-04-25.

#### Sprint 1 ✓
- [x] Breadcrumbs: slug → реальна назва на всіх 4 рівнях remont
- [x] i18n: hardcoded рядки → `getTranslations('remont')` у 4 файлах

#### Sprint 2 ✓
- [x] `WorkStages.tsx` — додано на /remont, /remont/[slug], /remont/[slug]/[mfr], /remont/[slug]/[mfr]/[model]
- [x] `BenefitsSection.tsx` — рефактор з Home, додано на ті самі сторінки
- [x] `BeforeAfterSlider.tsx` — drag/touch, Home

#### Sprint 3 ✓
- [x] `/nova-poshta`, `/guarantee`, `/public-offer`, `/guide`, `/special-offers`, `/corporate`, `/suppliers` — Directus `pages` + `faq_items` + `nova_poshta_steps`
- [x] `/blog` + `/blog/[slug]` — Directus `blog_posts`
- [x] `/vacancies` — Directus `vacancies`
- [x] Footer href + Header nova-poshta link + MobileMenu

#### Sprint 4 ✓
- [x] `/reviews` — Directus `reviews` (6 seed записів)
- [x] `ReviewsCarousel` → `/api/reviews` (live data)
- [x] OrderForm device types → `/api/device-categories` (live data)

#### Sprint 5 ✓
- [x] `app/sitemap.ts` — динамічний XML (категорії, mfr-комбо, моделі, блог)
- [x] `app/robots.ts` — env-based (Disallow: / на dev, Allow: / на prod)
- [x] `lib/metadata.ts` → `buildMeta()` — canonical + og:* + twitter:* на всіх 18 сторінках
- [x] `app/[locale]/layout.tsx` — `metadataBase` + title template
- [x] `LocalBusiness` JSON-LD (Home), `BreadcrumbList` (Breadcrumb), `Service` (service page)
- [x] `opengraph-image.tsx` — auto-generated og:image (1200×630, next/og)

#### Deploy ✓
- [x] `dev.helloservice.ua` — live, всі 11 ендпоінтів 200 ✓ (2026-04-25)

#### Поза планом (Фаза 5+)
- File upload у формі (потребує Directus Files API)
- Newsletter backend
- `/branches/[slug]` з галереєю (Figma `1108:492`)
- `/customers`, `/vacancies` (низький пріоритет)

#### Відомі відсутні UI-елементи (Figma → не реалізовано)
- Фільтр міст на сторінці відділень (`#11`)
- Логотипи виробників у картках `/remont` (`#22`)
- Фото пристроїв на сервісній сторінці (placeholder SVG замість реального фото) (`#23`, `#24`)

### Фаза 3 — Конкурентний моніторинг + міграція домену
1. [x] Розгорнути `competitor_pages`, `competitors`, n8n workflow, PostgreSQL VIEW ✓
2. [x] Тестовий парсинг: 4 конкуренти × S25 Ultra дисплей ✓
3. [ ] Відполірувати дизайн
4. [ ] Заповнити інформаційні сторінки контентом
5. [ ] Допрацювати форму заявки
6. [ ] Згенерувати контент для категорій / моделей / послуг
7. [ ] Наповнити spare_parts реальними reference_price
8. [ ] Активувати n8n competitor workflow (Publish)
9. [ ] Directus Flow: нагадування про застарілі ціни (30/90/180 днів)
10. [ ] Weekly Flow: оновлення `novelty_markup_coefficient`
11. [ ] SEO-аудит, підготовка 301-редіректів
12. [ ] Міграція: `dev.helloservice.ua` → `helloservice.ua` (змінити DOMAIN_FRONTEND + NEXT_PUBLIC_SITE_ENV=production)

### Фаза 4 — Remonline CRM
1. API-аудит Remonline
2. Маппінг `repair_types` → Remonline service types
3. Flow: нове замовлення (`repair_orders`) → тикет Remonline
4. Дашборд операційних метрик у Directus

### Фаза 5 — Ітерація 2: Товари, Оплата, Кабінет
1. Колекція `products` у Directus
2. Сторінки товарів у Next.js
3. Інтеграція LiqPay або Stripe
4. Кабінет користувача: Directus Auth + `/account/` у Next.js
5. Відстеження замовлень по ремонту та товарах
6. Система знижок (`discount_level` у профілі)
7. Мультимовність: заповнення `slug_en` + en-перекладів у Directus Translations
8. `/en/` маршрути у Next.js через `next-intl`

---

## Відомі проблеми / Ризики
- `novelty_markup_coefficient` потребує weekly Flow (не оновлюється само по собі) — ТЗ §13 #1
- `is_stale` для `competitor_prices` — реалізовано як VIEW `v_stale_competitor_prices` ✓
- RobimGood price selector — Elementor JS-tabs, ціни не в статичному HTML; потребує DevTools інспекту
- competitor_pages для Jabko / App Lab / Skeleton — inactive, URL з цінами не знайдено
- Staging середовище відсутнє — рекомендується Docker на тому ж VPS, інший порт — ТЗ §13 #11

---

## Ключові рішення (не змінювати без обговорення)
- **Стек:** Directus (CMS/API) + Next.js (фронтенд) + PostgreSQL + n8n (автопарсинг)
- **URL послуг:** `/remont/{repair_slug}-{model_slug}/` — плоско, depth 2
- **URL категорій:** `/remont/{category}/` та `/remont/{category}/{manufacturer}/` — ієрархічно
- **Вторинний ризик:** лише в `Labor_Price`, у кошторисі не відображається
- **Slug формат послуг:** `{repair_slug}-{model_slug}` (напр. `zamina-displeya-iphone-15-pro`)
- **Мультимовність:** uk (default) + en (Фаза 5); поля `slug_en` резервуються вже у Фазі 1
- **Sync:** немає — Directus є єдиним джерелом правди, Next.js читає напряму
- **Оплата та кабінет:** Фаза 5

---

## Формула ціноутворення (Phase 6, поточна)
```
part_price      = reference_price × (1 + risk_markup_rate)
hours           = COALESCE(model_repair_catalog.repair_time_hours, repair_types.repair_time_hours, 1)
labor_adj       = labor_rate × hours
warranty_res    = labor_adj × warranty_rate
effective_price = part_price + labor_adj + warranty_res
```
- `reference_price` вноситься вручну в `spare_parts` (довідкова закупівельна ціна)
- `effective_price` розраховується автоматично тригером `fn_calc_spare_part`
- Novelty coefficient навмисно виключений (Variant A — спрощення)
- Фаза 3: `effective_price = MAX(calculated, min_competitor_price)` — після впровадження конкурентного моніторингу

## Формула ціноутворення (оригінальна ТЗ, Фаза 3+)
```
Part_Price   = part_cost × (1 + effective_risk_markup_rate)
Labor_Adj    = (labor_rate × repair_time_hours × novelty_coef) + secondary_risk_surcharge
Warranty_Res = Labor_Adj × warranty_reserve_rate
Delivery     = delivery_cost_inbound + delivery_cost_outbound

P            = Part_Price + Labor_Adj + Warranty_Res + Delivery
Effective_P  = MAX(P, min_competitor_price)  -- тільки is_target_service=true

novelty_coef  = base_max_coef − (base_max_coef − 1.0) × LEAST(age_months, 60) / 60
base_max_coef = 1.30 (is_premium) або 1.15 (standard)
```

---

## Шаблон початку нової сесії
```
Прочитай files/PROJECT_STATE2.md та tz_helloservice_v2.2.docx.
Ми налаштовуємо Directus + Next.js для сервісного центру HelloService.
Один VPS (6G).
Поточна фаза: [X]. Продовж з розділу "В процесі" / "Наступні кроки".
```

## Шаблон завершення сесії
```
Оновлення PROJECT_STATE.md:
- Перенеси виконані пункти до "Виконано"
- Оновити "В процесі" та "Наступні кроки"
- Зафіксувати нові проблеми у "Відомі проблеми"
- Оновити дату "Останнє оновлення"
Після — git commit: "chore: update PROJECT_STATE YYYY-MM-DD"
```
