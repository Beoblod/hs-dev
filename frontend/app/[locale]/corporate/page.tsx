import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { InfoPageLayout } from '@/app/components/InfoPageLayout'
import { OrderForm } from '@/app/components/OrderForm'

type Page = { title: string; subtitle: string | null; content: string | null; meta_title: string | null; meta_desc: string | null }

async function getPage(): Promise<Page | null> {
  const rows = await directus.request(
    readItems('pages' as any, {
      filter: { slug: { _eq: 'corporate' }, is_active: { _eq: true } },
      fields: ['title', 'subtitle', 'content', 'meta_title', 'meta_desc'],
      limit: 1,
    })
  ) as Page[]
  return rows[0] ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage()
  return buildMeta({
    title: page?.meta_title ?? 'Корпоративним клієнтам',
    description: page?.meta_desc ?? 'Корпоративний ремонт техніки для юридичних осіб та компаній.',
    path: '/corporate',
  })
}

export default async function CorporatePage() {
  const page = await getPage()
  if (!page) notFound()
  return (
    <InfoPageLayout title={page.title} subtitle={page.subtitle} content={page.content} breadcrumbs={[{ label: page.title }]}>
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>
    </InfoPageLayout>
  )
}
