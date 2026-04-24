import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { directus } from '@/lib/directus'
import { readItems } from '@directus/sdk'

type Category = {
  id: number
  name: string
  slug: string
  slug_en: string
}

type Manufacturer = {
  id: string
  name: string
  slug: string
}

type DeviceModel = {
  id: string
  name: string
  slug: string
  brand_line: string | null
  is_premium: boolean
  sort: number
}

async function getCategory(slug: string, locale: string): Promise<Category | null> {
  const slugField = locale === 'en' ? 'slug_en' : 'slug'
  const rows = await directus.request(
    readItems('device_categories' as any, {
      filter: { [slugField]: { _eq: slug }, is_active: { _eq: true } },
      fields: ['id', 'name', 'slug', 'slug_en'],
      limit: 1,
    })
  ) as Category[]
  return rows[0] ?? null
}

async function getManufacturer(slug: string): Promise<Manufacturer | null> {
  const rows = await directus.request(
    readItems('manufacturers' as any, {
      filter: { slug: { _eq: slug }, is_active: { _eq: true } },
      fields: ['id', 'name', 'slug'],
      limit: 1,
    })
  ) as Manufacturer[]
  return rows[0] ?? null
}

async function getModels(categoryId: number, manufacturerId: string): Promise<DeviceModel[]> {
  return directus.request(
    readItems('device_models' as any, {
      filter: {
        category_id: { _eq: categoryId },
        manufacturer_id: { _eq: manufacturerId },
        is_active: { _eq: true },
      },
      fields: ['id', 'name', 'slug', 'brand_line', 'is_premium', 'sort'],
      sort: ['sort', 'name'],
    })
  ) as Promise<DeviceModel[]>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string }>
}): Promise<Metadata> {
  const { locale, slug, manufacturer } = await params
  const [cat, mfr] = await Promise.all([
    getCategory(slug, locale),
    getManufacturer(manufacturer),
  ])
  if (!cat || !mfr) return {}
  return {
    title: `Ремонт ${mfr.name} ${cat.name} | HelloService`,
    description: `Ремонт ${mfr.name} у Києві. Вибери модель — отримай точну ціну.`,
  }
}

export default async function ManufacturerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; manufacturer: string }>
}) {
  const { locale, slug, manufacturer: mfrSlug } = await params

  const [cat, mfr] = await Promise.all([
    getCategory(slug, locale),
    getManufacturer(mfrSlug),
  ])
  if (!cat || !mfr) notFound()

  const models = await getModels(cat.id, mfr.id)

  // Групуємо по brand_line (iPhone, iPad Pro…); null → без групи
  const groups = models.reduce<Record<string, DeviceModel[]>>((acc, m) => {
    const key = m.brand_line ?? ''
    ;(acc[key] ??= []).push(m)
    return acc
  }, {})

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">
        Ремонт {mfr.name} {cat.name}
      </h1>

      {Object.entries(groups).map(([line, lineModels]) => (
        <section key={line} className="mb-10">
          {line && (
            <h2 className="text-xl font-medium mb-4 text-zinc-700">{line}</h2>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {lineModels.map((model) => (
              <li key={model.id}>
                <Link
                  href={{
                    pathname: '/remont/[slug]/[manufacturer]/[model]',
                    params: { slug, manufacturer: mfrSlug, model: model.slug },
                  }}
                  className="block rounded-xl border border-zinc-200 p-4 text-center text-sm font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                >
                  {model.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
