'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './LocaleSwitcher'
import { CityPinIcon } from './icons'

type Props = {
  repairLabel: string
  bookLabel: string
  branchesLabel: string
  novaPoshtaLabel: string
  courierLabel: string
  cityLabel: string
}

export function MobileMenuToggle({
  repairLabel,
  bookLabel,
  branchesLabel,
  novaPoshtaLabel,
  courierLabel,
  cityLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden flex flex-col gap-[5px] p-2 -mr-2 shrink-0"
        aria-label="Меню"
      >
        <span className={`block w-5 h-[1.5px] bg-[#1a1a1a] transition-transform origin-center ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
        <span className={`block w-5 h-[1.5px] bg-[#1a1a1a] transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-[1.5px] bg-[#1a1a1a] transition-transform origin-center ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
      </button>

      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-zinc-100 shadow-lg z-40">
          <nav className="max-w-[1300px] mx-auto px-4 py-2 flex flex-col">
            <MobileLink href="/remont" onClick={close}>{repairLabel}</MobileLink>
            <MobileLink href="/branches" onClick={close}>{bookLabel}</MobileLink>
            <MobileLink href="/branches" onClick={close}>{branchesLabel}</MobileLink>
            <MobileLink href="/nova-poshta" onClick={close}>{novaPoshtaLabel}</MobileLink>
            <a href="#" onClick={close} className="text-[15px] font-light text-[#1a1a1a] py-3 border-b border-zinc-100 hover:text-[#24b383] transition-colors">
              {courierLabel}
            </a>

            {/* City + language at bottom */}
            <div className="flex items-center justify-between py-4 mt-1">
              <span className="flex items-center gap-1.5 text-[14px] font-light text-zinc-500">
                <CityPinIcon size={15} /> {cityLabel}
              </span>
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: '/remont' | '/branches' | '/nova-poshta'
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-[15px] font-light text-[#1a1a1a] py-3 border-b border-zinc-100 hover:text-[#24b383] transition-colors"
    >
      {children}
    </Link>
  )
}

