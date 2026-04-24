import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'

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
      fields: ['id', 'name', 'slug', 'brand_line', 'is_premium'],
      sort: ['name'],
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
    <div className="bg-[#f2f2f2] min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4 py-16">
        <Breadcrumb crumbs={[
          { label: 'Ремонт', href: '/remont' },
          { label: cat.name, href: `/remont/${slug}` as any },
          { label: mfr.name },
        ]} />

        <h1 className="text-[40px] font-light text-[#1a1a1a] leading-tight mb-12">
          Ремонт {mfr.name} {cat.name}
        </h1>

        {Object.entries(groups).map(([line, lineModels]) => (
          <section key={line} className="mb-12">
            {line && (
              <h2 className="text-[20px] font-light text-zinc-500 mb-4">{line}</h2>
            )}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {lineModels.map((model) => (
                <li key={model.id}>
                  <Link
                    href={{
                      pathname: '/remont/[slug]/[manufacturer]/[model]',
                      params: { slug, manufacturer: mfrSlug, model: model.slug },
                    }}
                    className="group flex items-center justify-between bg-white rounded-lg px-5 py-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-[15px] font-light text-[#1a1a1a] group-hover:text-[#24b383] transition-colors">
                      {model.name}
                    </span>
                    <span className="text-zinc-300 group-hover:text-[#24b383] transition-colors text-lg">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
