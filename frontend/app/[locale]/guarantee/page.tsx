import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { InfoPageLayout } from '@/app/components/InfoPageLayout'
import { FaqAccordion } from '@/app/components/FaqAccordion'
import { OrderForm } from '@/app/components/OrderForm'

type Page = { title: string; subtitle: string | null; content: string | null; meta_title: string | null; meta_desc: string | null }
type FaqItem = { id: string; question: string; answer: string }

async function getPage(): Promise<Page | null> {
  const rows = await directus.request(
    readItems('pages' as any, {
      filter: { slug: { _eq: 'guarantee' }, is_active: { _eq: true } },
      fields: ['title', 'subtitle', 'content', 'meta_title', 'meta_desc'],
      limit: 1,
    })
  ) as Page[]
  return rows[0] ?? null
}

async function getFaq(): Promise<FaqItem[]> {
  return directus.request(
    readItems('faq_items' as any, {
      filter: { page_slug: { _eq: 'guarantee' }, is_active: { _eq: true } },
      sort: ['sort_order'],
      fields: ['id', 'question', 'answer'],
    })
  ) as Promise<FaqItem[]>
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage()
  return {
    title: page?.meta_title ?? 'Гарантія | HelloService',
    description: page?.meta_desc ?? 'Умови гарантії на ремонт у HelloService.',
  }
}

export default async function GuaranteePage() {
  const t = await getTranslations('infoPages')
  const [page, faqItems] = await Promise.all([getPage(), getFaq()])
  if (!page) notFound()

  return (
    <InfoPageLayout
      title={page.title}
      subtitle={page.subtitle}
      content={page.content}
      breadcrumbs={[{ label: page.title }]}
    >
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

      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>
    </InfoPageLayout>
  )
}
