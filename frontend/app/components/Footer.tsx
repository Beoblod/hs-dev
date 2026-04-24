import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-[1300px] mx-auto px-4 py-14">

        {/* Top row */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <LogoIcon />
              <span className="text-[18px] font-medium tracking-tight">
                Hello<span className="text-[#24b383]">Service</span>
              </span>
            </Link>
            <p className="text-[14px] font-light text-zinc-400 leading-relaxed max-w-[260px]">
              {t('tagline')}
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-[12px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
              {t('navTitle')}
            </p>
            <ul className="space-y-3">
              <li>
                <Link href="/remont" className="text-[14px] font-light text-zinc-300 hover:text-[#24b383] transition-colors">
                  {t('repair')}
                </Link>
              </li>
              <li>
                <Link href="/branches" className="text-[14px] font-light text-zinc-300 hover:text-[#24b383] transition-colors">
                  {t('branches')}
                </Link>
              </li>
              <li>
                <Link href="/branches" className="text-[14px] font-light text-zinc-300 hover:text-[#24b383] transition-colors">
                  {t('bookRepair')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[12px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
              {t('contactTitle')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[14px] font-light text-zinc-300">
                <PhoneIcon />
                <a href={`tel:${t('phone').replace(/\s/g, '')}`} className="hover:text-[#24b383] transition-colors">
                  {t('phone')}
                </a>
              </li>
              <li className="flex items-center gap-2 text-[14px] font-light text-zinc-400">
                <ClockIcon />
                {t('workHours')}
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[13px] font-light text-zinc-500">{t('copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] font-light text-zinc-500 hover:text-zinc-300 transition-colors">
              {t('terms')}
            </a>
            <a href="#" className="text-[13px] font-light text-zinc-500 hover:text-zinc-300 transition-colors">
              {t('privacy')}
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#24b383" />
      <path d="M8 10h4v8H8v-8zm8 0h4v3h-4v-3zm0 5h4v3h-4v-3z" fill="white" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-[#24b383]">
      <path d="M2 3h6l2 5-2.5 1.5a11 11 0 005 5L14 12l5 2v6a1 1 0 01-1 1C6.716 21 2 16.284 2 10a1 1 0 011-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-zinc-500">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
