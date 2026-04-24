'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'

type Props = {
  repairLabel: string
  branchesLabel: string
  ctaLabel: string
}

export function MobileMenuToggle({ repairLabel, branchesLabel, ctaLabel }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
        aria-label="Меню"
      >
        <span className={`block w-6 h-[1.5px] bg-[#1a1a1a] transition-transform origin-center ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
        <span className={`block w-6 h-[1.5px] bg-[#1a1a1a] transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-[1.5px] bg-[#1a1a1a] transition-transform origin-center ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-zinc-100 shadow-lg z-40">
          <nav className="max-w-[1300px] mx-auto px-4 py-4 flex flex-col gap-1">
            <Link
              href="/remont"
              onClick={() => setOpen(false)}
              className="text-[16px] font-light text-[#1a1a1a] py-3 border-b border-zinc-100"
            >
              {repairLabel}
            </Link>
            <Link
              href="/branches"
              onClick={() => setOpen(false)}
              className="text-[16px] font-light text-[#1a1a1a] py-3 border-b border-zinc-100"
            >
              {branchesLabel}
            </Link>
            <div className="pt-3 pb-1">
              <Link
                href="/branches"
                onClick={() => setOpen(false)}
                className="block w-full text-center bg-[#24b383] text-white text-[16px] font-medium rounded py-3 hover:bg-[#1fa070] transition-colors"
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
