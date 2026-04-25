import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { OrderForm } from '@/app/components/OrderForm'

export const metadata: Metadata = {
  title: 'Вакансії | HelloService',
  description: 'Відкриті вакансії в HelloService. Приєднуйтесь до нашої команди.',
}

type Vacancy = {
  id: string
  title: string
  department: string | null
  description: string
  requirements: string | null
}

export default async function VacanciesPage() {
  const t = await getTranslations('infoPages')

  const vacancies = await directus.request(
    readItems('vacancies' as any, {
      filter: { is_active: { _eq: true } },
      sort: ['sort_order'],
      fields: ['id', 'title', 'department', 'description', 'requirements'],
    })
  ) as Vacancy[]

  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-12">
          <Breadcrumb crumbs={[{ label: 'Вакансії' }]} />
          <h1 className="text-[36px] lg:text-[42px] font-light text-[#1a1a1a] leading-tight mt-6">
            Вакансії
          </h1>
        </div>
      </section>

      <section className="bg-[#f2f2f2] py-10">
        <div className="max-w-[1300px] mx-auto px-4">
          {vacancies.length === 0 ? (
            <p className="text-[16px] font-light text-zinc-400">{t('noVacancies')}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {vacancies.map((v) => (
                <div key={v.id} className="bg-white rounded-lg p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-[20px] font-light text-[#1a1a1a]">{v.title}</h2>
                      {v.department && (
                        <p className="text-[13px] font-light text-zinc-400 mt-1">{v.department}</p>
                      )}
                    </div>
                    <a
                      href="tel:+380000000000"
                      className="shrink-0 h-[44px] px-6 bg-[#24b383] text-white text-[14px] font-medium rounded flex items-center hover:bg-[#1fa070] transition-colors"
                    >
                      {t('applyBtn')}
                    </a>
                  </div>
                  <p className="text-[14px] font-light text-zinc-600 leading-relaxed whitespace-pre-line mb-4">
                    {v.description}
                  </p>
                  {v.requirements && (
                    <div>
                      <p className="text-[13px] font-medium text-zinc-500 mb-2">{t('requirements')}:</p>
                      <p className="text-[14px] font-light text-zinc-600 leading-relaxed whitespace-pre-line">
                        {v.requirements}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>
    </div>
  )
}
