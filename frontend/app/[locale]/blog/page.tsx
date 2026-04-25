import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Блог | HelloService',
  description: 'Корисні статті та поради з ремонту та обслуговування гаджетів.',
}

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  published_at: string | null
}

export default async function BlogPage() {
  const t = await getTranslations('infoPages')

  const posts = await directus.request(
    readItems('blog_posts' as any, {
      filter: { is_published: { _eq: true } },
      sort: ['-published_at'],
      fields: ['id', 'slug', 'title', 'excerpt', 'published_at'],
    })
  ) as BlogPost[]

  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-12">
          <Breadcrumb crumbs={[{ label: 'Блог' }]} />
          <h1 className="text-[36px] lg:text-[42px] font-light text-[#1a1a1a] leading-tight mt-6">
            Блог
          </h1>
        </div>
      </section>

      <section className="bg-[#f2f2f2] py-10">
        <div className="max-w-[1300px] mx-auto px-4">
          {posts.length === 0 ? (
            <p className="text-[16px] font-light text-zinc-400">{t('noPosts')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }}
                  className="group bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-zinc-100 aspect-video flex items-center justify-center">
                    <ArticleIcon />
                  </div>
                  <div className="p-6">
                    {post.published_at && (
                      <p className="text-[12px] font-light text-zinc-400 mb-2">
                        {t('publishedAt')} {new Date(post.published_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    <h2 className="text-[16px] font-medium text-[#1a1a1a] group-hover:text-[#24b383] transition-colors leading-snug mb-3">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[13px] font-light text-zinc-500 leading-snug line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-block text-[13px] font-medium text-[#24b383]">
                      {t('readMore')} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ArticleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
