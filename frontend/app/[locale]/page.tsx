import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { ReviewsCarousel } from '@/app/components/ReviewsCarousel'

export const metadata: Metadata = {
  title: 'HelloService — Ремонт телефонів та гаджетів у Києві',
  description: 'Ремонт смартфонів, ноутбуків, планшетів та інших гаджетів. Діагностика безкоштовно. Гарантія на всі роботи.',
}

type DeviceCategory = {
  id: number
  name: string
  slug: string
  slug_en: string
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('home')

  const categories = await directus.request(
    readItems('device_categories' as any, {
      filter: { is_active: { _eq: true } },
      sort: ['sort_order'],
      fields: ['id', 'name', 'slug', 'slug_en'],
    })
  ) as DeviceCategory[]

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-[640px]">
            <span className="inline-block text-[13px] font-light text-[#24b383] uppercase tracking-widest mb-6">
              {t('heroLabel')}
            </span>
            <h1 className="text-[48px] lg:text-[64px] font-light text-[#1a1a1a] leading-[1.1] mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-[18px] font-light text-zinc-500 mb-10 leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="p-1 bg-[#c8ece0] rounded">
                <Link
                  href="/branches"
                  className="flex items-center justify-center h-[56px] px-10 bg-[#24b383] text-white text-[16px] font-medium rounded hover:bg-[#1fa070] transition-colors"
                >
                  {t('heroCta')}
                </Link>
              </div>
              <Link
                href="/remont"
                className="flex items-center justify-center h-[56px] px-10 text-[#1a1a1a] text-[16px] font-light hover:text-[#24b383] transition-colors"
              >
                {t('heroSecondary')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-[#f2f2f2] border-t border-zinc-200">
        <div className="max-w-[1300px] mx-auto px-4 py-10">
          <ul className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={{
                    pathname: '/remont/[slug]',
                    params: { slug: locale === 'en' ? cat.slug_en : cat.slug },
                  }}
                  className="flex items-center gap-2 bg-white rounded-lg px-5 py-3 text-[15px] font-light text-[#1a1a1a] hover:shadow-md hover:text-[#24b383] transition-all"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-[#f2f2f2]">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <h2 className="text-[32px] font-light text-[#1a1a1a] mb-10">{t('benefitsTitle')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BenefitCard icon={<DiagIcon />} title={t('benefit1Title')} text={t('benefit1Text')} />
            <BenefitCard icon={<ShieldIcon />} title={t('benefit2Title')} text={t('benefit2Text')} />
            <BenefitCard icon={<ClockIcon />} title={t('benefit3Title')} text={t('benefit3Text')} />
            <BenefitCard icon={<PriceIcon />} title={t('benefit4Title')} text={t('benefit4Text')} />
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="bg-[#f2f2f2]">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <ReviewsCarousel
            titleLabel={t('reviewsTitle')}
            allLabel={t('reviewsAll')}
          />
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <div className="bg-[#f2f2f2] rounded-lg p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="text-[28px] font-light text-[#1a1a1a] mb-2">{t('ctaTitle')}</h2>
              <p className="text-[15px] font-light text-zinc-500">{t('ctaText')}</p>
            </div>
            <div className="shrink-0 p-1 bg-[#c8ece0] rounded">
              <Link
                href="/branches"
                className="flex items-center justify-center h-[52px] px-10 bg-[#24b383] text-white text-[15px] font-medium rounded hover:bg-[#1fa070] transition-colors"
              >
                {t('ctaButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function BenefitCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="text-[#24b383] mb-4">{icon}</div>
      <p className="text-[16px] font-medium text-[#1a1a1a] mb-2">{title}</p>
      <p className="text-[14px] font-light text-zinc-500 leading-snug">{text}</p>
    </div>
  )
}

function DiagIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function PriceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
    </svg>
  )
}
