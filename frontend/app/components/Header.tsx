import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { MobileMenuToggle } from './MobileMenuToggle'

export async function Header() {
  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-100">
      <div className="max-w-[1300px] mx-auto px-4 h-[68px] flex items-center justify-between relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoIcon />
          <span className="text-[18px] font-medium text-[#1a1a1a] tracking-tight">
            Hello<span className="text-[#24b383]">Service</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/remont"
            className="text-[15px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors"
          >
            {t('repair')}
          </Link>
          <Link
            href="/branches"
            className="text-[15px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors"
          >
            {t('branches')}
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/branches"
            className="h-[42px] px-6 bg-[#24b383] text-white text-[15px] font-medium rounded flex items-center hover:bg-[#1fa070] transition-colors"
          >
            {t('cta')}
          </Link>
        </div>

        {/* Mobile burger */}
        <MobileMenuToggle
          repairLabel={t('repair')}
          branchesLabel={t('branches')}
          ctaLabel={t('cta')}
        />
      </div>
    </header>
  )
}

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#24b383" />
      <path
        d="M8 10h4v8H8v-8zm8 0h4v3h-4v-3zm0 5h4v3h-4v-3z"
        fill="white"
      />
    </svg>
  )
}
