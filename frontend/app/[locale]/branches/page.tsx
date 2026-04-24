import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { directus } from '@/lib/directus'
import { readItems } from '@directus/sdk'
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

export const metadata: Metadata = {
  title: 'Відділення HelloService — адреси та контакти',
  description: 'Знайдіть найближче відділення HelloService. Адреси, телефони, графік роботи та маршрути.',
}

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

  // Group by city
  const cities = Array.from(new Set(branches.map((b) => b.city ?? ''))).filter(Boolean)

  return (
    <main className="bg-[#f2f2f2] min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4 py-16">

        {/* Section title */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-[32px] font-light text-[#1a1a1a]">{t('title')}</h1>
        </div>

        {/* Branch grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </div>

      {/* Order form */}
      <div className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </div>
    </main>
  )
}
