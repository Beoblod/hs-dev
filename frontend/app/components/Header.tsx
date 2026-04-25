import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { MobileMenuToggle } from './MobileMenuToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import {
  ToolsIcon, EditIcon, BuildingIcon, RidingIcon, SearchIcon, CityPinIcon,
} from './icons'

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
          <NavItem href="/remont"><>{t('repair')} <ToolsIcon size={14} /></></NavItem>
          <NavItem href="/branches"><>{t('book')} <EditIcon size={14} /></></NavItem>
          <NavItem href="/branches"><>{t('branches')} <BuildingIcon size={14} /></></NavItem>
          <NavItem href="#"><>{t('novaPoshta')} <NpIcon /></></NavItem>
          <NavItem href="#"><>{t('courier')} <RidingIcon size={14} /></></NavItem>
          <NavItem href="#"><>{t('search')} <SearchIcon size={14} /></></NavItem>
        </nav>

        {/* Tablet nav (md–lg): 4 items */}
        <nav className="hidden md:flex lg:hidden items-center flex-1">
          <NavItem href="/remont"><>{t('repair')} <ToolsIcon size={14} /></></NavItem>
          <NavItem href="/branches"><>{t('book')} <EditIcon size={14} /></></NavItem>
          <NavItem href="/branches"><>{t('branches')} <BuildingIcon size={14} /></></NavItem>
          <NavItem href="#"><>{t('search')} <SearchIcon size={14} /></></NavItem>
        </nav>

        {/* Mobile search placeholder (hidden md+) */}
        <div className="flex md:hidden flex-1 items-center h-9 px-3 bg-[#f9f9f9] rounded gap-2 text-[13px] font-light text-zinc-400 cursor-pointer">
          <SearchIcon size={14} />
          {t('search')}
        </div>

        {/* Desktop right: city + language (lg+) */}
        <div className="hidden lg:flex items-center gap-5 shrink-0 ml-2">
          <span className="flex items-center gap-1.5 text-[14px] font-light text-[#1a1a1a]">
            <CityPinIcon size={15} />
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

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#24b383" />
      <path d="M9 11h5v10H9V11zm9 0h5v3.5h-5V11zm0 6.5h5V21h-5v-3.5z" fill="white" />
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
