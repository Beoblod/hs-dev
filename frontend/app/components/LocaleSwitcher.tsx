'use client'

import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  function toggle() {
    router.replace(pathname as any, { locale: locale === 'uk' ? 'en' : 'uk' })
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-[14px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors whitespace-nowrap"
    >
      <GlobeIcon />
      {locale === 'uk' ? 'Українська' : 'English'}
    </button>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" strokeLinecap="round" />
    </svg>
  )
}
