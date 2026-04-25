import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { OrderForm } from '@/app/components/OrderForm'
import { WorkStages } from '@/app/components/WorkStages'
import { BenefitsSection } from '@/app/components/BenefitsSection'

export const metadata: Metadata = buildMeta({
  title: 'Ремонт телефонів та гаджетів',
  description: 'Ремонт смартфонів, ноутбуків, планшетів та інших гаджетів у Києві. Швидко, якісно, з гарантією.',
  path: '/remont',
})

type DeviceCategory = {
  id: number
  name: string
  slug: string
  slug_en: string
  icon: string | null
}

const SLUG_ICONS: Record<string, React.FC<{ size?: number }>> = {
  telefony:        PhoneIcon,
  noutbuky:        LaptopIcon,
  planshety:       TabletIcon,
  'smart-hodynnyky': WatchIcon,
  navushnyky:      HeadphonesIcon,
}

export default async function RemontPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('remont')

  const categories = await directus.request(
    readItems('device_categories' as any, {
      filter: { is_active: { _eq: true } },
      sort: ['sort_order'],
      fields: ['id', 'name', 'slug', 'slug_en', 'icon'],
    })
  ) as DeviceCategory[]

  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4 py-16">

        {/* Title */}
        <div className="mb-12">
          <h1 className="text-[40px] font-light text-[#1a1a1a] leading-tight mb-3">
            {t('title')}
          </h1>
          <p className="text-[16px] font-light text-zinc-500">{t('chooseDevice')}</p>
        </div>

        {/* Category cards */}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => {
            const slug = locale === 'en' ? cat.slug_en : cat.slug
            const Icon = SLUG_ICONS[cat.slug] ?? PhoneIcon
            return (
              <li key={cat.id}>
                <Link
                  href={{
                    pathname: '/remont/[slug]',
                    params: { slug },
                  }}
                  className="group flex flex-col items-center gap-4 bg-white rounded-lg p-8 hover:shadow-md transition-shadow"
                >
                  <span className="text-[#1a1a1a] group-hover:text-[#24b383] transition-colors">
                    <Icon size={40} />
                  </span>
                  <span className="text-[15px] font-light text-[#1a1a1a] text-center leading-snug">
                    {cat.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Popular repairs hint */}
        <div className="mt-16 bg-white rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-[18px] font-light text-[#1a1a1a] mb-1">{t('ctaTitle')}</p>
            <p className="text-[14px] font-light text-zinc-500">{t('ctaText')}</p>
          </div>
          <Link
            href="/branches"
            className="shrink-0 h-[48px] px-8 bg-[#24b383] text-white text-[15px] font-medium rounded flex items-center hover:bg-[#1fa070] transition-colors"
          >
            {t('ctaButton')}
          </Link>
        </div>

      </div>

      <WorkStages />
      <BenefitsSection />

      {/* Order form */}
      <div className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PhoneIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function LaptopIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M1 22h22" strokeLinecap="round" />
    </svg>
  )
}

function TabletIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function WatchIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="7" y="7" width="10" height="10" rx="5" />
      <path d="M9 4l-.5-2h7L15 4M9 20l-.5 2h7L15 20" strokeLinecap="round" />
      <path d="M12 10v2l1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeadphonesIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
    </svg>
  )
}
