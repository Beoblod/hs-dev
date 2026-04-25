import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { BranchCard } from '@/app/components/BranchCard'
import { OrderForm } from '@/app/components/OrderForm'

type Branch = {
  id: string
  name: string
  city: string | null
  address: string
  phone_primary: string
  phone_secondary: string | null
  working_hours: string
  directions_walk_url: string | null
  directions_transit_url: string | null
  directions_car_url: string | null
  sort_order: number
}

export const metadata: Metadata = buildMeta({
  title: 'Відділення HelloService — адреси та контакти',
  description: 'Знайдіть найближче відділення HelloService у Києві. Адреси, телефони, графік роботи та маршрути.',
  path: '/branches',
})

export default async function BranchesPage() {
  const t = await getTranslations('branches')

  const branches = await directus.request(
    readItems('branches' as any, {
      filter: { is_active: { _eq: true } },
      sort: ['sort_order', 'name'],
      fields: [
        'id', 'name', 'city', 'address',
        'phone_primary', 'phone_secondary',
        'working_hours',
        'directions_walk_url', 'directions_transit_url', 'directions_car_url',
        'sort_order',
      ],
    })
  ) as Branch[]

  const labels = {
    phone: t('phone'),
    address: t('address'),
    hours: t('hours'),
    directionsWalk: t('directionsWalk'),
    directionsTransit: t('directionsTransit'),
    directionsCar: t('directionsCar'),
  }

  return (
    <div className="bg-[#f2f2f2]">

      {/* ── Header ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-10">
          <Breadcrumb crumbs={[
            { label: t('title') },
          ]} />

          <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-[32px] lg:text-[40px] font-light text-[#1a1a1a] leading-tight">
                {t('title')}
              </h1>
              <p className="mt-1 text-[15px] font-light text-zinc-400">
                {branches.length} {t('branchCount')} · Київ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Branch cards ── */}
      <section className="mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} labels={labels} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-10">
          <h2 className="text-[22px] font-light text-[#1a1a1a] mb-6">{t('mapTitle')}</h2>
        </div>
        <div className="w-full h-[440px]">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=30.28%2C50.36%2C30.68%2C50.54&layer=mapnik&marker=50.4501%2C30.5234"
            width="100%"
            height="440"
            style={{ border: 0, display: 'block' }}
            title={t('mapTitle')}
            loading="lazy"
          />
        </div>
      </section>

      {/* ── Order form ── */}
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>

    </div>
  )
}
