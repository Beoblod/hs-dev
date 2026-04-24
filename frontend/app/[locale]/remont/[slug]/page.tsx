import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'

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
      ],
    })
  ) as { manufacturers_id: Manufacturer }[]
  return rows.map((r) => r.manufacturers_id).sort((a, b) => a.name.localeCompare(b.name))
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
    const t = await getTranslations('service')
    return <ServiceView svc={svc} t={t} />
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
    <div className="bg-[#f2f2f2] min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4 py-16">
        <Breadcrumb crumbs={[
          { label: 'Ремонт', href: '/remont' },
          { label: cat.name },
        ]} />
        <h1 className="text-[40px] font-light text-[#1a1a1a] leading-tight mb-12">
          {cat.h1_text || cat.name}
        </h1>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {manufacturers.map((mfr) => (
            <li key={mfr.id}>
              <Link
                href={{
                  pathname: '/remont/[slug]/[manufacturer]',
                  params: { slug, manufacturer: mfr.slug },
                }}
                className="group flex flex-col items-center justify-center gap-3 bg-white rounded-lg p-8 hover:shadow-md transition-shadow min-h-[120px]"
              >
                <span className="text-[17px] font-light text-[#1a1a1a] group-hover:text-[#24b383] transition-colors">
                  {mfr.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Service view ──────────────────────────────────────────────────────────────

function ServiceView({ svc, t }: { svc: ServiceData; t: (key: string) => string }) {
  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4 py-16">
        <Breadcrumb crumbs={[
          { label: 'Ремонт', href: '/remont' },
          { label: `${svc.repairType.name} ${svc.model.name}` },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: title + price */}
          <div>
            <h1 className="text-[40px] font-light text-[#1a1a1a] leading-tight mb-3">
              {svc.repairType.name}
            </h1>
            <p className="text-[20px] font-light text-zinc-500 mb-8">{svc.model.name}</p>

            <div className="bg-white rounded-lg p-8 mb-6">
              <p className="text-[13px] font-light text-zinc-400 uppercase tracking-wider mb-2">
                {t('price')}
              </p>
              {svc.price !== null ? (
                <p className="text-[40px] font-light text-[#1a1a1a]">
                  <span className="text-[20px] text-zinc-400 mr-2">{t('priceFrom')}</span>
                  {svc.price.toLocaleString('uk-UA')} ₴
                </p>
              ) : (
                <p className="text-[24px] font-light text-zinc-400">{t('noPrices')}</p>
              )}
            </div>

            <p className="text-[14px] font-light text-zinc-500 mb-6">✓ {t('diagFree')}</p>

            <div className="p-1 bg-[#c8ece0] rounded">
              <Link
                href="/branches"
                className="flex items-center justify-center w-full h-[63px] bg-[#24b383] rounded text-white text-[18px] font-medium hover:bg-[#1fa070] transition-colors"
              >
                {t('order')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
