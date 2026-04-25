import { Breadcrumb } from './Breadcrumb'

type Crumb = Parameters<typeof Breadcrumb>[0]['crumbs'][number]

type Props = {
  title: string
  subtitle?: string | null
  content?: string | null
  breadcrumbs: Crumb[]
  children?: React.ReactNode
}

export function InfoPageLayout({ title, subtitle, content, breadcrumbs, children }: Props) {
  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-12">
          <Breadcrumb crumbs={breadcrumbs} />
          <div className="mt-6 max-w-[760px]">
            <h1 className="text-[36px] lg:text-[42px] font-light text-[#1a1a1a] leading-tight mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[17px] font-light text-zinc-500">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {content && (
        <section className="bg-white mt-3">
          <div className="max-w-[1300px] mx-auto px-4 py-10">
            <div className="max-w-[760px]">
              {content.split('\n\n').map((para, i) => (
                <p key={i} className="text-[15px] font-light text-zinc-700 leading-relaxed mb-4 whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {children}
    </div>
  )
}
