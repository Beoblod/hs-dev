import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { OrderForm } from '@/app/components/OrderForm'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  published_at: string | null
  meta_title: string | null
  meta_desc: string | null
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const rows = await directus.request(
    readItems('blog_posts' as any, {
      filter: { slug: { _eq: slug }, is_published: { _eq: true } },
      fields: ['id', 'slug', 'title', 'excerpt', 'content', 'published_at', 'meta_title', 'meta_desc'],
      limit: 1,
    })
  ) as BlogPost[]
  return rows[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post?.meta_title ?? (post ? `${post.title} | HelloService Blog` : ''),
    description: post?.meta_desc ?? post?.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const t = await getTranslations('infoPages')
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-12">
          <Breadcrumb crumbs={[
            { label: 'Блог', href: '/blog' },
            { label: post.title },
          ]} />

          <div className="mt-6 max-w-[760px]">
            {post.published_at && (
              <p className="text-[13px] font-light text-zinc-400 mb-3">
                {t('publishedAt')} {new Date(post.published_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            <h1 className="text-[32px] lg:text-[40px] font-light text-[#1a1a1a] leading-tight mb-6">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-10">
          <div className="max-w-[760px]">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-[15px] font-light text-zinc-700 leading-relaxed mb-4 whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/blog" className="text-[14px] font-light text-[#24b383] hover:underline">
              {t('backToBlog')}
            </Link>
          </div>
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
