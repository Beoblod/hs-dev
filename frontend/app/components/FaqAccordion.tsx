'use client'

import { useState } from 'react'

type FaqItem = {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-zinc-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-5 text-left"
          >
            <span className="text-[15px] font-light text-[#1a1a1a] leading-snug">
              {item.question}
            </span>
            <span className={`shrink-0 w-6 h-6 rounded-full bg-[#e8f5ef] flex items-center justify-center text-[#24b383] transition-transform ${open === i ? 'rotate-45' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="pb-5">
              <p className="text-[14px] font-light text-zinc-600 leading-relaxed whitespace-pre-line">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
