import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { OrderForm } from '@/app/components/OrderForm'
import { TimeIcon, CheckIcon, SearchIcon } from '@/app/components/icons'

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
  const { manufacturer: mfrSlug, model: modelSlug, service: serviceSlug } = await params
  const [repairType, model] = await Promise.all([
    getRepairType(serviceSlug),
    getModel(modelSlug, mfrSlug),
  ])
  if (!repairType || !model) return {}
  return {
    title: `${repairType.name} ${model.name} у Києві | HelloService`,
    description: `${repairType.name} ${model.name}: швидко, якісно, з гарантією. Діагностика безкоштовно.`,
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string; model: string; service: string }>
}) {
  const { slug: catSlug, manufacturer: mfrSlug, model: modelSlug, service: serviceSlug } = await params
  const t = await getTranslations('service')

  const [repairType, model] = await Promise.all([
    getRepairType(serviceSlug),
    getModel(modelSlug, mfrSlug),
  ])
  if (!repairType || !model) notFound()

  const [price, related] = await Promise.all([
    getPrice(model.id, repairType.id),
    getRelatedServices(catSlug, repairType.id),
  ])

  return (
    <div className="bg-[#f2f2f2]">

      {/* ── Hero: image + details ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-10">
          <Breadcrumb crumbs={[
            { label: 'Ремонт', href: '/remont' },
            { label: catSlug, href: `/remont/${catSlug}` as any },
            { label: mfrSlug, href: `/remont/${catSlug}/${mfrSlug}` as any },
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
              Ремонт {model.name} у Києві
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

