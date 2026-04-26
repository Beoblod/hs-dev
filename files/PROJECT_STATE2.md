# HelloService — Project State
> Цей файл читає Claude Code на початку кожної сесії.
> Оновлювати в кінці кожного робочого сеансу.

---

## Meta
- **Проект:** Сервісний центр HelloService
- **ТЗ:** `tz_helloservice_v2.2.docx` (у цьому ж репозиторії)
- **Поточна фаза:** 2/3 — Ціноутворення (spare_parts)
- **Останнє оновлення:** 2026-04-26 (сесія 5)

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

### Ціноутворення (Phase 4–6)
- [x] `branches.slug` + `/viddilennya/[slug]` — сторінка відділення з OSM картою
- [x] `spare_parts` — додані поля: `repair_type_id`, `reference_price`, `calculated_price`, `effective_price`, `is_serviceable`, `warranty_months`
- [x] `spare_parts_device_models` — M2M junction (spare_part ↔ device_model)
- [x] `model_repair_catalog.repair_time_hours` — override часу ремонту для моделі
- [x] PostgreSQL тригер `fn_calc_spare_part` — розраховує effective_price автоматично
  - Формула: `part_price = reference_price × (1 + risk_rate)`, `labor_adj = labor_rate × hours`, `effective_price = part_price + labor_adj + labor_adj × warranty_rate`
  - `hours` = COALESCE(model_repair_catalog.repair_time_hours, repair_types.repair_time_hours, 1)
  - Без novelty_markup_coefficient (Variant A — спрощено)
  - Cascade тригери на `repair_types` і `model_repair_catalog`
- [x] Сторінка послуги (`/remont/.../[service]`) відображає варіанти запчастин з цінами
- [x] `repair_quality_prices`, `repair_variants` — очікують cleanup (дані мігровано)
- [x] Scripts: `phase4_repair_quality.py`, `phase4_pricing_trigger.py`, `phase5_migrate_to_variants.py`, `phase6_spare_parts_pricing.py`
- [x] SQL: `pricing_triggers.sql`, `variant_triggers.sql`, `spare_parts_triggers.sql`

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

## В процесі
- [ ] **Cleanup:** видалити `repair_quality_prices` і `repair_variants` з Directus + PostgreSQL
- [ ] **Наповнення spare_parts:** додати реальні запчастини через Directus UI (reference_price → auto effective_price)

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

### Фаза 3 — Конкурентне ціноутворення та міграція домену
1. Наповнити `competitors`, `competitor_prices`
2. n8n: налаштувати Workflows для автопарсингу цін конкурентів (§7 ТЗ)
3. Directus Flow: перерахунок `effective_price`
3. Directus Flow: нагадування про застарілі ціни (30/90/180 днів)
4. Weekly Flow: оновлення `novelty_markup_coefficient`
5. Daily Flow: Directus API Self-Check
6. SEO-аудит, підготовка 301-редіректів
7. Міграція: `dev.helloservice.ua` → `helloservice.ua`

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
- `is_stale` для `competitor_prices` — реалізувати як PostgreSQL VIEW, не STORED column — ТЗ §13 #5
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
