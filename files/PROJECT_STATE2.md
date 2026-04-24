# HelloService — Project State
> Цей файл читає Claude Code на початку кожної сесії.
> Оновлювати в кінці кожного робочого сеансу.

---

## Meta
- **Проект:** Сервісний центр HelloService
- **ТЗ:** `tz_helloservice_v2.2.docx` (у цьому ж репозиторії)
- **Поточна фаза:** 1 — Схема даних Directus
- **Останнє оновлення:** 2026-04-24

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
- [x] n8n доступний: `http://n8n.helloservice.ua` (через nginx, port 80)
- [x] Directus доступний: `http://cms.helloservice.ua` (через nginx, port 80)
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
- [ ] Translations увімкнено для контентних колекцій

### Next.js
- [ ] Проект ініціалізовано (`create-next-app`, App Router)
- [ ] Підключено до Directus SDK
- [ ] `next-intl` встановлено (uk default, en — Фаза 5)

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
- git init, гілка `main`, 2 коміти

---

## В процесі
- [ ] **Фаза 1:** Наповнення довідників + Directus Translations (ЗАРАЗ)

---

## Наступні кроки

### Фаза 1 — Схема даних Directus
1. Довідники: `part_risk_levels`, `part_quality_types`, `device_categories`, `warranty_reserves`
2. Каталог: `manufacturers`, `manufacturers_categories`, `device_models`
3. Запчастини: `spare_parts`, `spare_part_risk_overrides`, `secondary_damage_risks`
4. Ремонти: `repair_types`, `repair_types_categories`, `repair_type_parts`
5. Прайс-лист: `model_repair_catalog`, `repair_variants`
6. Конкуренти: `competitors`, `competitor_prices`, `part_cost_update_schedule`
7. Ліди/заявки: `repair_orders`
8. SEO: `seo_pages`, `sync_log`
9. Увімкнути Directus Translations для контентних колекцій
10. Наповнити довідники стартовими значеннями

### Фаза 2 — Next.js фронтенд
1. Ініціалізація проекту (App Router, TypeScript, Tailwind)
2. Підключення Directus SDK + `next-intl`
3. SEO-сторінки: `/remont/`, `/remont/[category]/`, `/remont/[category]/[manufacturer]/`
4. Сторінка моделі: `/remont/[category]/[model]/`
5. Сторінка послуги (плоска): `/remont/[repair-model]/` — SSG
6. Сторінки брендів: `/brand/[manufacturer]/`, `/brand/[manufacturer]/[brand_line]/`
7. Форма заявки → запис у `repair_orders` у Directus
8. XML Sitemap, schema.org, canonical, breadcrumbs
9. Підтягнути дизайн з Figma
10. Підключити GA4 + Microsoft Clarity (з дня запуску)
11. Додати GSC + sitemap.xml у день міграції на helloservice.ua
12. Looker Studio dashboard: GA4 + GSC після першого місяця

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

## Формула ціноутворення
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
