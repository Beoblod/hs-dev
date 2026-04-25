import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { InfoPageLayout } from '@/app/components/InfoPageLayout'
import { FaqAccordion } from '@/app/components/FaqAccordion'
import { OrderForm } from '@/app/components/OrderForm'

export const metadata: Metadata = buildMeta({
  title: 'Ремонт Новою Поштою',
  description: 'Відправте пристрій на ремонт через Нову Пошту з будь-якого міста України.',
  path: '/nova-poshta',
})

type Step = { id: string; title: string; description: string; sort_order: number }
type FaqItem = { id: string; question: string; answer: string; sort_order: number }

export default async function NovaPoshtaPage() {
  const t = await getTranslations('infoPages')

  const [steps, faqItems] = await Promise.all([
    directus.request(
      readItems('nova_poshta_steps' as any, {
        filter: { is_active: { _eq: true } },
        sort: ['sort_order'],
        fields: ['id', 'title', 'description', 'sort_order'],
      })
    ) as Promise<Step[]>,
    directus.request(
      readItems('faq_items' as any, {
        filter: { page_slug: { _eq: 'nova-poshta' }, is_active: { _eq: true } },
        sort: ['sort_order'],
        fields: ['id', 'question', 'answer'],
      })
    ) as Promise<FaqItem[]>,
  ])

  return (
    <InfoPageLayout
      title="Ремонт Новою Поштою"
      subtitle="Відправте пристрій з будь-якого міста України — відремонтуємо і повернемо"
      breadcrumbs={[{ label: 'Ремонт Новою Поштою' }]}
    >
      {/* Steps */}
      {steps.length > 0 && (
        <section className="bg-[#f2f2f2] py-12">
          <div className="max-w-[1300px] mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {steps.map((step, i) => (
                <div key={step.id} className="bg-white rounded-lg p-6 flex flex-col gap-4">
                  <span className="text-[12px] font-light text-zinc-300 tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[14px] font-medium text-[#1a1a1a] leading-snug">{step.title}</p>
                  <p className="text-[13px] font-light text-zinc-500 leading-snug">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="bg-white mt-3">
          <div className="max-w-[1300px] mx-auto px-4 py-10">
            <h2 className="text-[24px] font-light text-[#1a1a1a] mb-6">{t('faqTitle')}</h2>
            <div className="max-w-[760px]">
              <FaqAccordion items={faqItems} />
            </div>
          </div>
        </section>
      )}

      {/* Order form */}
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>
    </InfoPageLayout>
  )
}
