import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { OrderForm } from '@/app/components/OrderForm'
import { TimeIcon, CheckIcon, SearchIcon } from '@/app/components/icons'
import { JsonLd } from '@/app/components/JsonLd'

type RepairType = {
  id: string
  name: string
  slug: string
  description: string | null
  repair_time_hours: number | null
}

type CatalogEntry = {
  effective_price: number | null
}

type RepairVariant = {
  id: string
  effective_price: string | number | null
  warranty_months: number | null
  quality_type_id: {
    id: string
    name: string
    description: string | null
    sort_order: number | null
  }
}

type DeviceModel = {
  id: string
  name: string
  slug: string
}

async function getRepairType(slug: string): Promise<RepairType | null> {
  const rows = await directus.request(
    readItems('repair_types' as any, {
      filter: { slug: { _eq: slug }, is_active: { _eq: true } },
      fields: ['id', 'name', 'slug', 'description', 'repair_time_hours'],
      limit: 1,
    })
  ) as RepairType[]
  return rows[0] ?? null
}

async function getModel(slug: string, mfrSlug: string): Promise<DeviceModel | null> {
  const rows = await directus.request(
    readItems('device_models' as any, {
      filter: {
        slug: { _eq: slug },
        manufacturer_id: { slug: { _eq: mfrSlug } },
        is_active: { _eq: true },
      },
      fields: ['id', 'name', 'slug'],
      limit: 1,
    })
  ) as DeviceModel[]
  return rows[0] ?? null
}

async function getPrice(modelId: string, repairTypeId: string): Promise<number | null> {
  const rows = await directus.request(
    readItems('model_repair_catalog' as any, {
      filter: {
        model_id: { _eq: modelId },
        repair_type_id: { _eq: repairTypeId },
        is_available: { _eq: true },
      },
      fields: ['effective_price'],
      limit: 1,
    })
  ) as CatalogEntry[]
  return rows[0]?.effective_price ?? null
}

async function getCategoryName(slug: string): Promise<string | null> {
  const rows = await directus.request(
    readItems('device_categories' as any, {
      filter: { slug: { _eq: slug }, is_active: { _eq: true } },
      fields: ['name'],
      limit: 1,
    })
  ) as { name: string }[]
  return rows[0]?.name ?? null
}

async function getManufacturerName(slug: string): Promise<string | null> {
  const rows = await directus.request(
    readItems('manufacturers' as any, {
      filter: { slug: { _eq: slug }, is_active: { _eq: true } },
      fields: ['name'],
      limit: 1,
    })
  ) as { name: string }[]
  return rows[0]?.name ?? null
}

async function getQualityPrices(modelId: string, repairTypeId: string): Promise<RepairVariant[]> {
  return directus.request(
    readItems('repair_variants' as any, {
      filter: {
        catalog_id: {
          model_id: { _eq: modelId },
          repair_type_id: { _eq: repairTypeId },
          is_available: { _eq: true },
        },
        is_available: { _eq: true },
      },
      fields: ['id', 'effective_price', 'warranty_months',
               'quality_type_id.id', 'quality_type_id.name',
               'quality_type_id.description', 'quality_type_id.sort_order'],
      sort: ['quality_type_id.sort_order'],
    })
  ) as Promise<RepairVariant[]>
}

async function getRelatedServices(categorySlug: string, currentServiceId: string): Promise<RepairType[]> {
  const catRows = await directus.request(
    readItems('device_categories' as any, {
      filter: { slug: { _eq: categorySlug }, is_active: { _eq: true } },
      fields: ['id'],
      limit: 1,
    })
  ) as { id: number }[]
  if (!catRows[0]) return []

  const junction = await directus.request(
    readItems('repair_types_categories' as any, {
      filter: { device_categories_id: { _eq: catRows[0].id } },
      fields: ['repair_types_id'],
      limit: -1,
    })
  ) as { repair_types_id: string }[]

  const ids = junction.map((r) => r.repair_types_id).filter((id) => id && id !== currentServiceId)
  if (!ids.length) return []

  return directus.request(
    readItems('repair_types' as any, {
      filter: { id: { _in: ids }, is_active: { _eq: true } },
      fields: ['id', 'name', 'slug', 'repair_time_hours'],
      limit: 3,
    })
  ) as Promise<RepairType[]>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; manufacturer: string; model: string; service: string }>
}): Promise<Metadata> {
  const { slug, manufacturer: mfrSlug, model: modelSlug, service: serviceSlug } = await params
  const [repairType, model] = await Promise.all([
    getRepairType(serviceSlug),
    getModel(modelSlug, mfrSlug),
  ])
  if (!repairType || !model) return {}
  return buildMeta({
    title: `${repairType.name} ${model.name} у Києві`,
    description: `${repairType.name} ${model.name}: швидко, якісно, з гарантією. Діагностика безкоштовно.`,
    path: `/remont/${slug}/${mfrSlug}/${modelSlug}/${serviceSlug}`,
  })
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string; model: string; service: string }>
}) {
  const { slug: catSlug, manufacturer: mfrSlug, model: modelSlug, service: serviceSlug } = await params
  const [t, tRemont] = await Promise.all([
    getTranslations('service'),
    getTranslations('remont'),
  ])

  const [repairType, model, catName, mfrName] = await Promise.all([
    getRepairType(serviceSlug),
    getModel(modelSlug, mfrSlug),
    getCategoryName(catSlug),
    getManufacturerName(mfrSlug),
  ])
  if (!repairType || !model) notFound()

  const [qualityPrices, price, related] = await Promise.all([
    getQualityPrices(model.id, repairType.id),
    getPrice(model.id, repairType.id),
    getRelatedServices(catSlug, repairType.id),
  ])

  const displayPrice = qualityPrices.length > 0
    ? Math.min(...qualityPrices.map(q => q.effective_price != null ? Number(q.effective_price) : Infinity).filter(p => isFinite(p)))
    : price

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helloservice.ua'

  return (
    <div className="bg-[#f2f2f2]">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${repairType.name} ${model.name}`,
        description: repairType.description ?? `${repairType.name} ${model.name} у Києві`,
        provider: { '@type': 'LocalBusiness', name: 'HelloService', url: SITE_URL },
        areaServed: { '@type': 'City', name: 'Київ' },
        ...(displayPrice ? { offers: { '@type': 'Offer', priceCurrency: 'UAH', price: String(displayPrice) } } : {}),
        ...(repairType.repair_time_hours ? { duration: `PT${repairType.repair_time_hours}H` } : {}),
      }} />

      {/* ── Hero: image + details ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-10">
          <Breadcrumb crumbs={[
            { label: tRemont('repair'), href: '/remont' },
            { label: catName ?? catSlug, href: `/remont/${catSlug}` as any },
            { label: mfrName ?? mfrSlug, href: `/remont/${catSlug}/${mfrSlug}` as any },
            { label: model.name, href: `/remont/${catSlug}/${mfrSlug}/${modelSlug}` as any },
            { label: repairType.name },
          ]} />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
            {/* Image placeholder */}
            <div className="bg-[#f9f9f9] rounded-lg flex items-center justify-center aspect-[3/4] lg:aspect-auto lg:h-[420px]">
              <PlaceholderIcon />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-5">
              <h1 className="text-[32px] lg:text-[38px] font-light text-[#1a1a1a] leading-tight">
                {repairType.name} {model.name}
              </h1>

              {repairType.repair_time_hours && (
                <p className="flex items-center gap-2 text-[15px] font-light text-zinc-500">
                  <TimeIcon size={16} className="text-zinc-400 shrink-0" />
                  {t('timeFrom')} {repairType.repair_time_hours} {t('timeHours')}
                </p>
              )}

              {qualityPrices.length > 0 ? (
                /* ── Quality rows ── */
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] font-light text-zinc-400 uppercase tracking-wide">
                    {t('qualityTitle')}
                  </p>
                  <div className="border border-zinc-100 rounded-lg overflow-hidden">
                    {qualityPrices.map((qp, i) => (
                      <div
                        key={qp.id}
                        className={`flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-zinc-100' : ''}`}
                      >
                        {/* Name + warranty */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-normal text-[#1a1a1a] leading-snug">
                            {qp.quality_type_id.name}
                          </p>
                          {qp.quality_type_id.description && (
                            <p className="text-[12px] font-light text-zinc-400 mt-0.5 leading-snug">
                              {qp.quality_type_id.description}
                            </p>
                          )}
                          {qp.warranty_months && (
                            <p className="text-[12px] font-light text-[#24b383] mt-0.5">
                              {t('warrantyMonths', { n: qp.warranty_months })}
                            </p>
                          )}
                        </div>
                        {/* Price */}
                        <p className="text-[17px] font-medium text-[#1a1a1a] shrink-0 tabular-nums">
                          {qp.effective_price != null
                            ? `${Number(qp.effective_price).toLocaleString('uk-UA')} ₴`
                            : <span className="text-[14px] font-light text-zinc-400">{t('noPrices')}</span>
                          }
                        </p>
                        {/* CTA */}
                        <Link
                          href="/branches"
                          className="shrink-0 px-4 py-2 bg-[#24b383] text-white text-[13px] font-medium rounded hover:bg-[#1fa070] transition-colors whitespace-nowrap"
                        >
                          {t('bookBtn')}
                        </Link>
                      </div>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 text-[13px] font-light text-zinc-400">
                    <CheckIcon size={14} className="text-[#24b383] shrink-0" />
                    {t('partsIncluded')}
                  </p>
                </div>
              ) : (
                /* ── Single price (fallback) ── */
                <>
                  <div>
                    {price ? (
                      <p className="text-[15px] font-light text-zinc-400 mb-0.5">{t('priceFrom')}</p>
                    ) : null}
                    <p className="text-[32px] font-medium text-[#1a1a1a]">
                      {price ? (
                        <>{price.toLocaleString('uk-UA')} ₴</>
                      ) : (
                        <span className="text-[20px] font-light text-zinc-400">{t('noPrices')}</span>
                      )}
                    </p>
                  </div>
                  <div className="p-1 bg-[#c8ece0] rounded max-w-[280px]">
                    <Link
                      href="/branches"
                      className="flex items-center justify-center h-[52px] px-8 bg-[#24b383] text-white text-[15px] font-medium rounded hover:bg-[#1fa070] transition-colors"
                    >
                      {t('order')}
                    </Link>
                  </div>
                  {price && (
                    <p className="flex items-center gap-2 text-[14px] font-light text-zinc-500">
                      <CheckIcon size={16} className="text-[#24b383] shrink-0" />
                      {t('partsIncluded')}
                    </p>
                  )}
                </>
              )}

              <p className="flex items-center gap-2 text-[14px] font-light text-[#24b383]">
                <SearchIcon size={16} className="shrink-0" />
                {t('diagFree')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Description ── */}
      {repairType.description && (
        <section className="bg-white mt-3">
          <div className="max-w-[1300px] mx-auto px-4 py-10">
            <h2 className="text-[24px] font-light text-[#1a1a1a] mb-4">
              {tRemont('repair')} {model.name} {tRemont('repairInCity')}
            </h2>
            <p className="text-[15px] font-light text-zinc-600 leading-relaxed max-w-[760px]">
              {repairType.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Related services ── */}
      {related.length > 0 && (
        <section className="bg-white mt-3">
          <div className="max-w-[1300px] mx-auto px-4 py-10">
            <h2 className="text-[24px] font-light text-[#1a1a1a] mb-6">{t('similarServices')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((rt) => (
                <Link
                  key={rt.id}
                  href={{
                    pathname: '/remont/[slug]/[manufacturer]/[model]/[service]',
                    params: { slug: catSlug, manufacturer: mfrSlug, model: modelSlug, service: rt.slug },
                  }}
                  className="group bg-[#f9f9f9] rounded-lg p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="bg-zinc-200 rounded aspect-video flex items-center justify-center">
                    <PlaceholderIconSm />
                  </div>
                  <p className="text-[15px] font-medium text-[#1a1a1a] group-hover:text-[#24b383] transition-colors leading-snug">
                    {rt.name}
                  </p>
                  {rt.repair_time_hours && (
                    <p className="text-[13px] font-light text-zinc-400">
                      {t('timeFrom')} {rt.repair_time_hours} {t('timeHours')}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-[14px] font-light text-zinc-400">{t('noPrices')}</p>
                    <span className="text-[13px] font-medium text-[#24b383]">{t('bookBtn')} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Order form ── */}
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>

    </div>
  )
}

function PlaceholderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9l4-4 4 4 4-4 4 4M3 15l4 4 4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlaceholderIconSm() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9l4-4 4 4 4-4 4 4" strokeLinecap="round" />
    </svg>
  )
}

