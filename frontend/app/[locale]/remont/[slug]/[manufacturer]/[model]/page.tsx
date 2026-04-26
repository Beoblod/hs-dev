import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'

type DeviceModel = {
  id: string
  name: string
  slug: string
  brand_line_id: { name: string } | null
  is_premium: boolean
}

type RepairType = {
  id: string
  name: string
  slug: string
}

async function getModel(
  modelSlug: string,
  mfrSlug: string
): Promise<DeviceModel | null> {
  const rows = await directus.request(
    readItems('device_models' as any, {
      filter: {
        slug: { _eq: modelSlug },
        manufacturer_id: { slug: { _eq: mfrSlug } },
        is_active: { _eq: true },
      },
      fields: ['id', 'name', 'slug', 'brand_line_id.name', 'is_premium'],
      limit: 1,
    })
  ) as DeviceModel[]
  return rows[0] ?? null
}

async function getCategory(slug: string): Promise<{ id: number; name: string } | null> {
  const rows = await directus.request(
    readItems('device_categories' as any, {
      filter: { slug: { _eq: slug }, is_active: { _eq: true } },
      fields: ['id', 'name'],
      limit: 1,
    })
  ) as { id: number; name: string }[]
  return rows[0] ?? null
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

async function getRepairTypes(categoryId: number): Promise<RepairType[]> {
  const junction = await directus.request(
    readItems('repair_types_categories' as any, {
      filter: { device_categories_id: { _eq: categoryId } },
      fields: ['repair_types_id'],
      limit: -1,
    })
  ) as { repair_types_id: string }[]
  const ids = junction.map((r) => r.repair_types_id).filter(Boolean)
  if (!ids.length) return []
  return directus.request(
    readItems('repair_types' as any, {
      filter: { id: { _in: ids }, is_active: { _eq: true } },
      fields: ['id', 'name', 'slug'],
    })
  ) as Promise<RepairType[]>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string; model: string }>
}): Promise<Metadata> {
  const { slug, manufacturer: mfrSlug, model: modelSlug } = await params
  const [model, t] = await Promise.all([
    getModel(modelSlug, mfrSlug),
    getTranslations('remont'),
  ])
  if (!model) return {}
  return buildMeta({
    title: `${t('repair')} ${model.name} ${t('repairInCity')}`,
    description: `${t('repair')} ${model.name}: заміна дисплея, батареї, роз'єму та інших компонентів. Діагностика безкоштовно.`,
    path: `/remont/${slug}/${mfrSlug}/${modelSlug}`,
  })
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string; model: string }>
}) {
  const { slug: catSlug, manufacturer: mfrSlug, model: modelSlug } = await params
  const [t, tRemont] = await Promise.all([
    getTranslations('model'),
    getTranslations('remont'),
  ])

  const [model, category, mfrName] = await Promise.all([
    getModel(modelSlug, mfrSlug),
    getCategory(catSlug),
    getManufacturerName(mfrSlug),
  ])
  if (!model || !category) notFound()

  const repairTypes = await getRepairTypes(category.id)

  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4 py-16">
        <Breadcrumb crumbs={[
          { label: tRemont('repair'), href: '/remont' },
          { label: category.name, href: `/remont/${catSlug}` as any },
          { label: mfrName ?? mfrSlug, href: `/remont/${catSlug}/${mfrSlug}` as any },
          { label: model.name },
        ]} />

        <h1 className="text-[40px] font-light text-[#1a1a1a] leading-tight mb-3">
          {tRemont('repair')} {model.name}
        </h1>
        <p className="text-[16px] font-light text-zinc-500 mb-12">{t('repairTypes')}</p>

        {repairTypes.length === 0 ? (
          <p className="text-[16px] font-light text-zinc-400">{t('noRepairs')}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {repairTypes.map((rt) => (
              <li key={rt.id}>
                <Link
                  href={{
                    pathname: '/remont/[slug]/[manufacturer]/[model]/[service]',
                    params: { slug: catSlug, manufacturer: mfrSlug, model: modelSlug, service: rt.slug },
                  }}
                  className="group flex items-center justify-between bg-white rounded-lg px-6 py-5 hover:shadow-md transition-shadow"
                >
                  <span className="text-[15px] font-light text-[#1a1a1a] group-hover:text-[#24b383] transition-colors">
                    {rt.name}
                  </span>
                  <span className="text-zinc-300 group-hover:text-[#24b383] transition-colors text-xl">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 p-1 bg-[#c8ece0] rounded max-w-sm">
          <Link
            href="/branches"
            className="flex items-center justify-center w-full h-[56px] bg-[#24b383] rounded text-white text-[16px] font-medium hover:bg-[#1fa070] transition-colors"
          >
            {tRemont('bookRepair')}
          </Link>
        </div>
      </div>
    </div>
  )
}
