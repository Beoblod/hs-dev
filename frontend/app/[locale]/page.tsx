import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { ReviewsCarousel } from '@/app/components/ReviewsCarousel'
import { OrderForm } from '@/app/components/OrderForm'
import { BenefitsSection } from '@/app/components/BenefitsSection'
import { BeforeAfterSlider } from '@/app/components/BeforeAfterSlider'

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

      {/* ── Before / After slider ── */}
      <BeforeAfterSlider
        title={t('beforeAfterTitle')}
        beforeLabel="До"
        afterLabel="Після"
      />

      {/* ── Benefits ── */}
      <BenefitsSection />

      {/* ── Reviews ── */}
      <section className="bg-[#f2f2f2]">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <ReviewsCarousel
            titleLabel={t('reviewsTitle')}
            allLabel={t('reviewsAll')}
          />
        </div>
      </section>

      {/* ── Order form ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
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

