import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { directus } from '@/lib/directus'
import { readItems } from '@directus/sdk'

type DeviceCategory = {
  id: number
  name: string
  slug: string
  slug_en: string
  icon: string
}

export default async function RemontPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = useTranslations('remont')

  const categories = await directus.request(
    readItems('device_categories' as any, {
      filter: { is_active: { _eq: true } },
      sort: ['sort_order'],
      fields: ['id', 'name', 'slug', 'slug_en', 'icon'],
    })
  ) as DeviceCategory[]

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4">{t('title')}</h1>
      <p className="text-lg mb-8 text-zinc-600">{t('chooseDevice')}</p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={{
                pathname: '/remont/[slug]',
                params: { slug: locale === 'en' ? cat.slug_en : cat.slug },
              }}
              className="block rounded-xl border border-zinc-200 p-6 text-center font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
