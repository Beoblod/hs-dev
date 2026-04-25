import { getTranslations } from 'next-intl/server'

export async function WorkStages() {
  const t = await getTranslations('workStages')

  const steps = [
    { num: '01', icon: <BookIcon />,   title: t('step1Title'), text: t('step1Text') },
    { num: '02', icon: <DiagIcon />,   title: t('step2Title'), text: t('step2Text') },
    { num: '03', icon: <WrenchIcon />, title: t('step3Title'), text: t('step3Text') },
    { num: '04', icon: <CheckIcon />,  title: t('step4Title'), text: t('step4Text') },
    { num: '05', icon: <StarIcon />,   title: t('step5Title'), text: t('step5Text') },
  ]

  return (
    <section className="bg-[#f2f2f2] py-12">
      <div className="max-w-[1300px] mx-auto px-4">
        <h2 className="text-[28px] font-light text-[#1a1a1a] mb-8">{t('title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-lg p-6 flex flex-col gap-4">
              <span className="text-[12px] font-light text-zinc-300 tracking-wider">{step.num}</span>
              <div className="w-10 h-10 rounded-full bg-[#e8f5ef] flex items-center justify-center text-[#24b383]">
                {step.icon}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1a1a1a] mb-1 leading-snug">{step.title}</p>
                <p className="text-[13px] font-light text-zinc-500 leading-snug">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DiagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
