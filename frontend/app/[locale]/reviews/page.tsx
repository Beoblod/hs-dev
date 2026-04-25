import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { OrderForm } from '@/app/components/OrderForm'

type Review = {
  id: number
  author_name: string
  rating: number
  text: string
  source: string | null
  device_type: string | null
}

const AVATAR_COLORS = ['#e8f5ef', '#e8f0f5', '#f5eee8', '#f0e8f5', '#e8f5f0', '#f5f0e8']

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

async function getReviews(): Promise<Review[]> {
  return directus.request(
    readItems('reviews' as any, {
      filter: { is_active: { _eq: true } },
      fields: ['id', 'author_name', 'rating', 'text', 'source', 'device_type'],
      sort: ['sort_order' as any],
      limit: 100,
    })
  ) as Promise<Review[]>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Відгуки клієнтів | HelloService',
    description: 'Читайте відгуки клієнтів про ремонт телефонів, ноутбуків та планшетів у сервісному центрі HelloService.',
  }
}

export default async function ReviewsPage() {
  const [reviews, t] = await Promise.all([getReviews(), getTranslations('home')])

  return (
    <>
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 py-8">
          <Breadcrumb crumbs={[{ label: t('reviewsTitle') }]} />
          <h1 className="text-[36px] font-light text-[#1a1a1a] mt-4">{t('reviewsTitle')}</h1>
        </div>
      </section>

      <section className="bg-[#f2f2f2]">
        <div className="max-w-[1300px] mx-auto px-4 py-12">
          {reviews.length === 0 ? (
            <p className="text-zinc-500 font-light">Відгуків поки немає.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium text-[#1a1a1a] shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[review.id % AVATAR_COLORS.length] }}
                    >
                      {initials(review.author_name)}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1a1a1a] leading-tight">{review.author_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {review.source && (
                          <span className="text-[12px] font-light text-zinc-400">{review.source}</span>
                        )}
                        <Stars rating={review.rating} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] font-light text-[#1a1a1a] leading-relaxed">{review.text}</p>
                  {review.device_type && (
                    <span className="text-[12px] font-light text-zinc-400">{review.device_type}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>
    </>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < rating ? '#f59e0b' : 'none'} stroke={i < rating ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  )
}
