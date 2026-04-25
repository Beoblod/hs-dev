import { getTranslations } from 'next-intl/server'

export async function BenefitsSection() {
  const t = await getTranslations('home')

  const benefits = [
    [<DiagIcon />,      t('benefit1Title'), t('benefit1Text')],
    [<PartsIcon />,     t('benefit2Title'), t('benefit2Text')],
    [<ShieldIcon />,    t('benefit3Title'), t('benefit3Text')],
    [<ClockIcon />,     t('benefit4Title'), t('benefit4Text')],
    [<EyeIcon />,       t('benefit5Title'), t('benefit5Text')],
    [<PhoneSwapIcon />, t('benefit6Title'), t('benefit6Text')],
  ] as [React.ReactNode, string, string][]

  return (
    <section className="bg-[#f2f2f2] py-16">
      <div className="max-w-[1300px] mx-auto px-4">
        <h2 className="text-[32px] font-light text-[#1a1a1a] mb-8">{t('benefitsTitle')}</h2>
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {benefits.map(([icon, title, text], i) => {
              const isLastRow = i >= 4
              const isLeft = i % 2 === 0
              return (
                <div
                  key={i}
                  className={[
                    'flex items-start gap-4 p-6',
                    !isLastRow ? 'border-b border-zinc-100' : '',
                    isLeft ? 'sm:border-r border-zinc-100' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="w-11 h-11 rounded-full bg-[#e8f5ef] flex items-center justify-center shrink-0 text-[#24b383]">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">{title}</p>
                    <p className="text-[13px] font-light text-zinc-500 leading-snug">{text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function DiagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}
function PartsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function PhoneSwapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 7h6M9 17h2" strokeLinecap="round" />
    </svg>
  )
}
