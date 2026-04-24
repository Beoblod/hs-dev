import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directus } from '@/lib/directus'
import { readItems } from '@directus/sdk'

type DeviceModel = {
  id: string
  name: string
  slug: string
  brand_line: string | null
  is_premium: boolean
  category_id: { id: number; slug: string; slug_en: string }
}

type RepairType = {
  repair_types_id: {
    id: string
    name: string
    slug: string
  }
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
      fields: ['id', 'name', 'slug', 'brand_line', 'is_premium', 'category_id.id', 'category_id.slug', 'category_id.slug_en'],
      limit: 1,
    })
  ) as DeviceModel[]
  return rows[0] ?? null
}

async function getRepairTypes(categoryId: number): Promise<RepairType[]> {
  return directus.request(
    readItems('repair_types_categories' as any, {
      filter: { device_categories_id: { _eq: categoryId } },
      fields: ['repair_types_id.id', 'repair_types_id.name', 'repair_types_id.slug'],
      sort: ['repair_types_id.sort'],
    })
  ) as Promise<RepairType[]>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string; model: string }>
}): Promise<Metadata> {
  const { locale, manufacturer: mfrSlug, model: modelSlug } = await params
  const model = await getModel(modelSlug, mfrSlug)
  if (!model) return {}
  return {
    title: `Ремонт ${model.name} у Києві | HelloService`,
    description: `Ремонт ${model.name}: заміна дисплея, батареї, роз'єму та інших компонентів. Діагностика безкоштовно.`,
  }
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string; model: string }>
}) {
  const { slug, manufacturer: mfrSlug, model: modelSlug } = await params
  const t = await getTranslations('model')

  const model = await getModel(modelSlug, mfrSlug)
  if (!model) notFound()

  const repairTypes = await getRepairTypes(model.category_id.id)

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Ремонт {model.name}</h1>

      <h2 className="text-xl font-medium mb-4 text-zinc-700">{t('repairTypes')}</h2>

      {repairTypes.length === 0 ? (
        <p className="text-zinc-500">{t('noRepairs')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {repairTypes.map((rt) => (
            <li key={rt.repair_types_id.id}>
              <Link
                href={`/remont/${rt.repair_types_id.slug}-${modelSlug}` as any}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4 font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
              >
                <span>{rt.repair_types_id.name}</span>
                <span className="text-zinc-400 text-sm">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
