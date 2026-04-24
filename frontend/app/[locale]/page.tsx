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
          <h2 className="text-[32px] font-light text-[#1a1a1a] mb-8">{t('benefitsTitle')}</h2>
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {([
                [<DiagIcon key="d" />,    t('benefit1Title'), t('benefit1Text')],
                [<PartsIcon key="p" />,   t('benefit2Title'), t('benefit2Text')],
                [<ShieldIcon key="s" />,  t('benefit3Title'), t('benefit3Text')],
                [<ClockIcon key="c" />,   t('benefit4Title'), t('benefit4Text')],
                [<EyeIcon key="e" />,     t('benefit5Title'), t('benefit5Text')],
                [<PhoneSwapIcon key="ph" />, t('benefit6Title'), t('benefit6Text')],
              ] as [React.ReactNode, string, string][]).map(([icon, title, text], i) => {
                const isLastRow = i >= 4
                const isLeft = i % 2 === 0
                return (
                  <div
                    key={i}
                    className={[
                      'flex items-start gap-4 p-6',
                      !isLastRow ? 'border-b border-zinc-100' : '',
                      isLeft ? 'sm:border-r border-zinc-100' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#e8f5ef] flex items-center justify-center shrink-0 text-[#24b383]">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">{title}</p>
                      <p className="text-[13px] font-light text-zinc-500 leading-snug">{text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
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

function DiagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}
function PartsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function PhoneSwapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 7h6M9 17h2" strokeLinecap="round" />
    </svg>
  )
}
