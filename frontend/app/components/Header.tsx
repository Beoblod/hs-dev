import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { MobileMenuToggle } from './MobileMenuToggle'
import { LocaleSwitcher } from './LocaleSwitcher'

export async function Header() {
  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-100">
      <div className="max-w-[1300px] mx-auto px-4 h-[68px] flex items-center gap-2">

        {/* Logo */}
        <Link href="/" className="shrink-0 mr-2 flex items-center gap-2">
          <LogoIcon />
          <span className="text-[17px] font-semibold text-[#1a1a1a] tracking-tight leading-none">
            Hello<span className="text-[#24b383]">Service</span>
          </span>
        </Link>

        {/* Desktop nav (lg+): all 6 items */}
        <nav className="hidden lg:flex items-center flex-1">
          <NavItem href="/remont"><>{t('repair')} <RepairIcon /></></NavItem>
          <NavItem href="/branches"><>{t('book')} <BookIcon /></></NavItem>
          <NavItem href="/branches"><>{t('branches')} <BranchIcon /></></NavItem>
          <NavItem href="#"><>{t('novaPoshta')} <NpIcon /></></NavItem>
          <NavItem href="#"><>{t('courier')} <CourierIcon /></></NavItem>
          <NavItem href="#"><>{t('search')} <SearchIcon /></></NavItem>
        </nav>

        {/* Tablet nav (md–lg): 4 items */}
        <nav className="hidden md:flex lg:hidden items-center flex-1">
          <NavItem href="/remont"><>{t('repair')} <RepairIcon /></></NavItem>
          <NavItem href="/branches"><>{t('book')} <BookIcon /></></NavItem>
          <NavItem href="/branches"><>{t('branches')} <BranchIcon /></></NavItem>
          <NavItem href="#"><>{t('search')} <SearchIcon /></></NavItem>
        </nav>

        {/* Mobile search placeholder (hidden md+) */}
        <div className="flex md:hidden flex-1 items-center h-9 px-3 bg-[#f9f9f9] rounded gap-2 text-[13px] font-light text-zinc-400 cursor-pointer">
          <SearchIcon />
          {t('search')}
        </div>

        {/* Desktop right: city + language (lg+) */}
        <div className="hidden lg:flex items-center gap-5 shrink-0 ml-2">
          <span className="flex items-center gap-1.5 text-[14px] font-light text-[#1a1a1a]">
            <CityIcon />
            {t('city')}
          </span>
          <LocaleSwitcher />
        </div>

        {/* Burger (hidden lg+) */}
        <MobileMenuToggle
          repairLabel={t('repair')}
          bookLabel={t('book')}
          branchesLabel={t('branches')}
          novaPoshtaLabel={t('novaPoshta')}
          courierLabel={t('courier')}
          cityLabel={t('city')}
        />
      </div>
    </header>
  )
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const cls =
    'flex items-center gap-1.5 px-3 py-2 text-[14px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors whitespace-nowrap [&>svg]:text-zinc-400 [&>svg]:shrink-0'

  if (href === '/remont' || href === '/branches') {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  )
}

/* ── Icons ── */

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#24b383" />
      <path d="M9 11h5v10H9V11zm9 0h5v3.5h-5V11zm0 6.5h5V21h-5v-3.5z" fill="white" />
    </svg>
  )
}

function RepairIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BranchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" strokeLinejoin="round" />
    </svg>
  )
}

function NpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M14 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CourierIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M15 6h2l3 5.5M5.5 17.5L9 10l2-4h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}

function CityIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="10" height="13" /><rect x="13" y="3" width="8" height="18" />
      <path d="M6 11h4M6 14h4M6 17h4M16 6h2M16 9h2M16 12h2M16 15h2" strokeLinecap="round" />
    </svg>
  )
}
