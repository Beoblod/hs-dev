import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { FooterNewsletter } from './FooterNewsletter'
import { BackToTop } from './BackToTop'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="max-w-[1300px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Clients + Contact */}
          <div className="space-y-8">
            <div>
              <SectionTitle icon={<UserIcon />}>{t('clientsTitle')}</SectionTitle>
              <ul>
                <Item label={t('reviews')} href="/reviews" icon={<StarIcon />} />
                <Item label={t('blog')} href="/blog" icon={<BlogIcon />} />
                <Item label={t('guarantee')} href="/guarantee" icon={<ShieldIcon />} />
                <Item label={t('guide')} href="/guide" icon={<BookIcon />} />
                <Item label={t('specialOffers')} href="/special-offers" icon={<TagIcon />} />
                <Item label={t('publicOffer')} href="/public-offer" icon={<DocIcon />} />
              </ul>
            </div>
            <div>
              <SectionTitle icon={<InfoIcon />}>{t('contactTitle')}</SectionTitle>
              <ul>
                <Item label={t('branches')} href="/branches" icon={<MapIcon />} />
                <Item label={t('corporate')} href="/corporate" icon={<UserIcon />} />
                <Item label={t('suppliers')} href="/suppliers" icon={<BoxIcon />} />
                <Item label={t('vacancies')} href="/vacancies" icon={<BriefcaseIcon />} />
              </ul>
            </div>
          </div>

          {/* Col 2 — Repair */}
          <div>
            <SectionTitle icon={<WrenchIcon />}>{t('repairTitle')}</SectionTitle>
            <ul>
              <Item label={t('apple')} href="/remont" icon={<AppleIcon />} />
              <Item label={t('smartphones')} href="/remont" icon={<PhoneIcon />} />
              <Item label={t('laptops')} href="/remont" icon={<LaptopIcon />} />
              <Item label={t('tablets')} href="/remont" icon={<TabletIcon />} />
              <Item label={t('smartwatches')} href="/remont" icon={<WatchIcon />} />
              <Item label={t('diagnostics')} href="/remont" icon={<DiagIcon />} />
            </ul>
          </div>

          {/* Col 3 — Services */}
          <div>
            <SectionTitle icon={<SettingsIcon />}>{t('servicesTitle')}</SectionTitle>
            <ul>
              <Item label={t('bookService')} href="/branches" icon={<EditIcon />} />
              <Item label={t('novaPoshtaRepair')} href="/nova-poshta" icon={<NpIcon />} />
              <Item label={t('courierService')} icon={<BikeIcon />} />
              <Item label={t('trackStatus')} icon={<TrackIcon />} />
            </ul>
          </div>

          {/* Col 4 — Newsletter + Social */}
          <div>
            <SectionTitle icon={<MailIcon />}>{t('stayTitle')}</SectionTitle>
            <FooterNewsletter
              placeholder={t('emailPlaceholder')}
              buttonLabel={t('subscribe')}
            />
            <div className="mt-3 space-y-2">
              <a
                href="https://tiktok.com/@helloservice"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 border border-zinc-200 rounded text-[14px] font-light text-[#1a1a1a] hover:border-[#24b383] transition-colors"
              >
                <TiktokIcon /> helloservice
              </a>
              <a
                href="https://instagram.com/helloservice"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 border border-zinc-200 rounded text-[14px] font-light text-[#1a1a1a] hover:border-[#24b383] transition-colors"
              >
                <InstagramIcon /> helloservice
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-200">
        <div className="max-w-[1300px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] font-light text-zinc-500">{t('copyright')}</p>
          <BackToTop label={t('toTop')} />
        </div>
      </div>
    </footer>
  )
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[14px] font-medium text-[#1a1a1a] mb-3">
      <span className="text-zinc-400">{icon}</span>
      {children}
    </h3>
  )
}

function Item({
  label,
  href,
  icon,
}: {
  label: string
  href?: string
  icon: React.ReactNode
}) {
  const cls =
    'flex items-center justify-between py-2.5 border-b border-zinc-100 group'
  const textCls =
    'text-[14px] font-light text-[#1a1a1a] group-hover:text-[#24b383] transition-colors'

  const content = (
    <>
      <span className={textCls}>{label}</span>
      <span className="text-zinc-300">{icon}</span>
    </>
  )

  if (href?.startsWith('/')) {
    return (
      <li className={cls}>
        <Link href={href as any} className="contents">
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li className={cls}>
      <a href={href ?? '#'} className="contents">
        {content}
      </a>
    </li>
  )
}

/* ── Icons ── */

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M12 12v4" strokeLinecap="round" />
    </svg>
  )
}
function WrenchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  )
}
function BlogIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinejoin="round" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinejoin="round" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" />
    </svg>
  )
}
function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  )
}
function MapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function BoxIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinejoin="round" />
    </svg>
  )
}
function BriefcaseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2c1.5 0 3 .5 4 1.5-1 1-1.5 2.5-1.5 4 0 1.5.5 3 1.5 4-1 1.5-2.5 2.5-4 2.5s-2-.5-3-.5-2 .5-3 .5c-1.5 0-3-1-4-2.5 2-3 2-8 0-11C3 1.5 4.5 1 6 1c1 0 2 .5 3 .5S11 1 12 1V2z" strokeLinejoin="round" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
    </svg>
  )
}
function LaptopIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M1 21h22" strokeLinecap="round" />
    </svg>
  )
}
function TabletIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
    </svg>
  )
}
function WatchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="6" />
      <path d="M12 10v2l1.5 1.5M9 3l.5 3M15 3l-.5 3M9 21l.5-3M15 21l-.5-3" strokeLinecap="round" />
    </svg>
  )
}
function DiagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinejoin="round" />
    </svg>
  )
}
function NpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function BikeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h1l3 5.5M5.5 17.5L9 10l2-4h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TrackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TiktokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-[#1a1a1a]">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.02a8.19 8.19 0 004.79 1.54V7.12a4.85 4.85 0 01-1.02-.43z" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
