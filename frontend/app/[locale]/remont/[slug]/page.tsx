import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { directus } from '@/lib/directus'
import { readItems } from '@directus/sdk'

// ── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: number
  name: string
  slug: string
  slug_en: string
  h1_text: string
  meta_title: string
  meta_description: string
}

type Manufacturer = {
  id: string
  name: string
  slug: string
  sort_order: number
}

type RepairType = {
  id: string
  name: string
  slug: string
}

type DeviceModel = {
  id: string
  name: string
  slug: string
}

type ServiceData = {
  repairType: RepairType
  model: DeviceModel
  price: number | null
}

// ── Data helpers ─────────────────────────────────────────────────────────────

async function getCategory(slug: string, locale: string): Promise<Category | null> {
  const slugField = locale === 'en' ? 'slug_en' : 'slug'
  const rows = await directus.request(
    readItems('device_categories' as any, {
      filter: { [slugField]: { _eq: slug }, is_active: { _eq: true } },
      fields: ['id', 'name', 'slug', 'slug_en', 'h1_text', 'meta_title', 'meta_description'],
      limit: 1,
    })
  ) as Category[]
  return rows[0] ?? null
}

async function getManufacturers(categoryId: number): Promise<Manufacturer[]> {
  const rows = await directus.request(
    readItems('manufacturers_categories' as any, {
      filter: { device_categories_id: { _eq: categoryId } },
      fields: [
        'manufacturers_id.id',
        'manufacturers_id.name',
        'manufacturers_id.slug',
        'manufacturers_id.sort_order',
      ],
      sort: ['manufacturers_id.sort_order'],
    })
  ) as { manufacturers_id: Manufacturer }[]
  return rows.map((r) => r.manufacturers_id)
}

async function resolveService(slug: string): Promise<ServiceData | null> {
  const repairTypes = await directus.request(
    readItems('repair_types' as any, {
      filter: { is_active: { _eq: true } },
      fields: ['id', 'name', 'slug'],
      limit: 100,
    })
  ) as RepairType[]

  // Sort longest slug first to avoid prefix collisions
  repairTypes.sort((a, b) => b.slug.length - a.slug.length)

  for (const rt of repairTypes) {
    const prefix = rt.slug + '-'
    if (!slug.startsWith(prefix)) continue

    const modelSlug = slug.slice(prefix.length)
    const models = await directus.request(
      readItems('device_models' as any, {
        filter: { slug: { _eq: modelSlug }, is_active: { _eq: true } },
        fields: ['id', 'name', 'slug'],
        limit: 1,
      })
    ) as DeviceModel[]

    if (!models[0]) continue

    // Fetch price if available
    const catalog = await directus.request(
      readItems('model_repair_catalog' as any, {
        filter: {
          repair_type_id: { _eq: rt.id },
          model_id: { _eq: models[0].id },
          is_available: { _eq: true },
        },
        fields: ['effective_price'],
        limit: 1,
      })
    ) as { effective_price: number | null }[]

    return {
      repairType: rt,
      model: models[0],
      price: catalog[0]?.effective_price ?? null,
    }
  }

  return null
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  const cat = await getCategory(slug, locale)
  if (cat) {
    return { title: cat.meta_title, description: cat.meta_description }
  }

  const svc = await resolveService(slug)
  if (svc) {
    return {
      title: `${svc.repairType.name} ${svc.model.name} | HelloService`,
      description: `${svc.repairType.name} ${svc.model.name} у Києві. Діагностика безкоштовно. Гарантія на роботи.`,
    }
  }

  return {}
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function RemontSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  // ── Branch 1: Category page ───────────────────────────────────────────────
  const cat = await getCategory(slug, locale)
  if (cat) {
    const manufacturers = await getManufacturers(cat.id)
    return <CategoryView cat={cat} manufacturers={manufacturers} slug={slug} />
  }

  // ── Branch 2: Service page ────────────────────────────────────────────────
  const svc = await resolveService(slug)
  if (svc) {
    return <ServiceView svc={svc} />
  }

  notFound()
}

// ── Category view ─────────────────────────────────────────────────────────────

function CategoryView({
  cat,
  manufacturers,
  slug,
}: {
  cat: Category
  manufacturers: Manufacturer[]
  slug: string
}) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">{cat.h1_text}</h1>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {manufacturers.map((mfr) => (
          <li key={mfr.id}>
            <Link
              href={{
                pathname: '/remont/[slug]/[manufacturer]',
                params: { slug, manufacturer: mfr.slug },
              }}
              className="block rounded-xl border border-zinc-200 p-6 text-center font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              {mfr.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

// ── Service view ──────────────────────────────────────────────────────────────

function ServiceView({ svc }: { svc: ServiceData }) {
  const t = useTranslations('service')
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-2">
        {svc.repairType.name} {svc.model.name}
      </h1>
      <p className="text-zinc-500 mb-8">{t('diagFree')}</p>

      <div className="rounded-xl border border-zinc-200 p-6 mb-8">
        <p className="text-sm text-zinc-500 mb-1">{t('price')}</p>
        {svc.price !== null ? (
          <p className="text-3xl font-bold">
            {t('priceFrom')} {svc.price.toLocaleString('uk-UA')} ₴
          </p>
        ) : (
          <p className="text-xl text-zinc-400">{t('noPrices')}</p>
        )}
      </div>

      <button
        disabled
        className="w-full rounded-full bg-zinc-900 text-white py-4 text-lg font-medium opacity-50 cursor-not-allowed"
      >
        {t('order')}
      </button>
    </main>
  )
}
