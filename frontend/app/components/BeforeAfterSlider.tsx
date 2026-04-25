'use client'

import { useState, useRef, useCallback } from 'react'

type Props = {
  title?: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({ title, beforeLabel = 'До', afterLabel = 'Після' }: Props) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  return (
    <section className="bg-[#f2f2f2] py-12">
      <div className="max-w-[1300px] mx-auto px-4">
        {title && (
          <h2 className="text-[28px] font-light text-[#1a1a1a] mb-8">{title}</h2>
        )}
        <div
          ref={containerRef}
          className="relative select-none cursor-ew-resize overflow-hidden rounded-lg"
          style={{ height: 360 }}
          onMouseDown={(e) => { dragging.current = true; update(e.clientX) }}
          onMouseMove={(e) => { if (dragging.current) update(e.clientX) }}
          onMouseUp={() => { dragging.current = false }}
          onMouseLeave={() => { dragging.current = false }}
          onTouchStart={(e) => update(e.touches[0].clientX)}
          onTouchMove={(e) => { e.preventDefault(); update(e.touches[0].clientX) }}
        >
          {/* Before panel */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
            <PhoneBrokenIcon />
          </div>

          {/* After panel — clipped to left side */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#e8f5ef] to-[#c8ece0] flex items-center justify-center overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          >
            <PhoneFixedIcon />
          </div>

          {/* Divider line + handle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-md pointer-events-none"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Corner labels */}
          <div className="absolute bottom-4 left-4 bg-black/25 text-white text-[12px] font-light px-2.5 py-1 rounded pointer-events-none">
            {beforeLabel}
          </div>
          <div className="absolute bottom-4 right-4 bg-[#24b383]/80 text-white text-[12px] font-light px-2.5 py-1 rounded pointer-events-none">
            {afterLabel}
          </div>
        </div>
      </div>
    </section>
  )
}

function PhoneBrokenIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 2l6 10M9 12l3 5" strokeLinecap="round" />
    </svg>
  )
}

function PhoneFixedIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#24b383" strokeWidth="1">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
