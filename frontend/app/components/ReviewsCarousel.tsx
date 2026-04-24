'use client'

import { useState } from 'react'

type Review = {
  id: number
  name: string
  date: string
  rating: number
  text: string
  initials: string
  color: string
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Катя Новікова',
    date: '5 квітня 2024',
    rating: 5,
    text: 'Дуже ввічливі співробітники! Був зламаний нижній дік на iPhone 11, швидко замінили, у той же день забрала! Також поставили стікер герметичності, щоб волога не потрапляла :)',
    initials: 'КН',
    color: '#e8f5ef',
  },
  {
    id: 2,
    name: 'Олександр Шевченко',
    date: '4 квітня 2024',
    rating: 5,
    text: 'Якісне обслуговування. Швидке виконання робіт.',
    initials: 'ОШ',
    color: '#e8f0f5',
  },
  {
    id: 3,
    name: 'Ірина Кравченко',
    date: '3 квітня 2024',
    rating: 5,
    text: 'Допомогли полагодити годинник Apple Watch SE, якісно зробили ремонт та головне швидко. Замінили акумулятор та поставили захисне скло.',
    initials: 'ІК',
    color: '#f5eee8',
  },
  {
    id: 4,
    name: 'Микола Петренко',
    date: '1 квітня 2024',
    rating: 5,
    text: 'Замінили екран на Samsung Galaxy S23. Зробили за 40 хвилин, ціна відповідає якості. Рекомендую!',
    initials: 'МП',
    color: '#f0e8f5',
  },
  {
    id: 5,
    name: 'Марина Коваль',
    date: '28 березня 2024',
    rating: 5,
    text: 'Замінили батарею на MacBook Pro. Майстер пояснив причину швидкого розряду та що саме замінив. Ноутбук тепер тримає заряд весь день.',
    initials: 'МК',
    color: '#e8f5f0',
  },
]

export function ReviewsCarousel({
  titleLabel,
  allLabel,
}: {
  titleLabel: string
  allLabel: string
}) {
  const [offset, setOffset] = useState(0)
  const perPage = 3
  const canPrev = offset > 0
  const canNext = offset + perPage < REVIEWS.length
  const visible = REVIEWS.slice(offset, offset + perPage)

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-[32px] font-light text-[#1a1a1a]">{titleLabel}</h2>
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="text-[14px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors flex items-center gap-1">
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
            onClick={() => setOffset((o) => Math.min(REVIEWS.length - perPage, o + 1))}
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
            {/* Author row */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium text-[#1a1a1a] shrink-0"
                style={{ backgroundColor: review.color }}
              >
                {review.initials}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1a1a1a] leading-tight">{review.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-light text-zinc-400">{review.date}</span>
                  <Stars rating={review.rating} />
                </div>
              </div>
            </div>
            {/* Text */}
            <p className="text-[14px] font-light text-[#1a1a1a] leading-relaxed">{review.text}</p>
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
