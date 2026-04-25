'use client'

import { useState, useEffect } from 'react'

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

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

export function ReviewsCarousel({
  titleLabel,
  allLabel,
  allHref = '/reviews',
}: {
  titleLabel: string
  allLabel: string
  allHref?: string
}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [offset, setOffset] = useState(0)
  const perPage = 3

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setReviews(data) })
      .catch(() => {})
  }, [])

  if (reviews.length === 0) return null

  const canPrev = offset > 0
  const canNext = offset + perPage < reviews.length
  const visible = reviews.slice(offset, offset + perPage)

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-[32px] font-light text-[#1a1a1a]">{titleLabel}</h2>
        <div className="flex items-center gap-3 shrink-0">
          <a href={allHref} className="text-[14px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors flex items-center gap-1">
            {allLabel} <span className="text-[12px]">↗</span>
          </a>
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={!canPrev}
            className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-[#1a1a1a] hover:border-[#24b383] hover:text-[#24b383] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Назад"
          >
            ←
          </button>
          <button
            onClick={() => setOffset((o) => Math.min(reviews.length - perPage, o + 1))}
            disabled={!canNext}
            className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-[#1a1a1a] hover:border-[#24b383] hover:text-[#24b383] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Вперед"
          >
            →
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((review) => (
          <div key={review.id} className="bg-white rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium text-[#1a1a1a] shrink-0"
                style={{ backgroundColor: avatarColor(review.id) }}
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
    </div>
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
