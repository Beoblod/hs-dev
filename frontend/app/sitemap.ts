import type { MetadataRoute } from 'next'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helloservice.ua'

function url(path: string, priority = 0.7, changefreq: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly'): MetadataRoute.Sitemap[number] {
  return { url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: changefreq, priority }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, manufacturers, models, blogPosts] = await Promise.all([
    directus.request(readItems('device_categories' as any, {
      filter: { is_active: { _eq: true } },
      fields: ['id', 'slug'],
      limit: -1,
    })) as Promise<{ id: string; slug: string }[]>,

    directus.request(readItems('manufacturers' as any, {
      filter: { is_active: { _eq: true } },
      fields: ['id', 'slug'],
      limit: -1,
    })) as Promise<{ id: string; slug: string }[]>,

    directus.request(readItems('device_models' as any, {
      filter: { is_active: { _eq: true } },
      fields: ['slug', 'category_id', 'manufacturer_id'],
      limit: -1,
    })) as Promise<{ slug: string; category_id: string; manufacturer_id: string }[]>,

    directus.request(readItems('blog_posts' as any, {
      filter: { is_published: { _eq: true } },
      fields: ['slug'],
      limit: -1,
    })) as Promise<{ slug: string }[]>,
  ])

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.slug]))
  const mfrMap = Object.fromEntries(manufacturers.map((m) => [m.id, m.slug]))

  // Deduplicated category+manufacturer combos derived from models
  const mfrCatSet = new Set<string>()
  for (const m of models) {
    const catSlug = catMap[m.category_id]
    const mfrSlug = mfrMap[m.manufacturer_id]
    if (catSlug && mfrSlug) mfrCatSet.add(`${catSlug}|${mfrSlug}`)
  }

  return [
    // ── Static pages ────────────────────────────────────────────────────────
    url('/', 1.0, 'daily'),
    url('/branches', 0.8, 'weekly'),
    url('/nova-poshta', 0.8, 'monthly'),
    url('/guarantee', 0.6, 'monthly'),
    url('/reviews', 0.6, 'weekly'),
    url('/blog', 0.7, 'daily'),
    url('/vacancies', 0.5, 'weekly'),
    url('/guide', 0.5, 'monthly'),
    url('/special-offers', 0.7, 'weekly'),
    url('/corporate', 0.5, 'monthly'),
    url('/suppliers', 0.5, 'monthly'),
    url('/public-offer', 0.3, 'yearly'),

    // ── /remont ─────────────────────────────────────────────────────────────
    url('/remont', 0.9, 'weekly'),

    // ── /remont/[slug] ──────────────────────────────────────────────────────
    ...categories.map((c) => url(`/remont/${c.slug}`, 0.8, 'weekly')),

    // ── /remont/[slug]/[manufacturer] ───────────────────────────────────────
    ...[...mfrCatSet].map((key) => {
      const [catSlug, mfrSlug] = key.split('|')
      return url(`/remont/${catSlug}/${mfrSlug}`, 0.7, 'weekly')
    }),

    // ── /remont/[slug]/[manufacturer]/[model] ───────────────────────────────
    ...models.flatMap((m) => {
      const catSlug = catMap[m.category_id]
      const mfrSlug = mfrMap[m.manufacturer_id]
      if (!catSlug || !mfrSlug) return []
      return [url(`/remont/${catSlug}/${mfrSlug}/${m.slug}`, 0.6, 'monthly')]
    }),

    // ── /blog/[slug] ────────────────────────────────────────────────────────
    ...blogPosts.map((p) => url(`/blog/${p.slug}`, 0.6, 'weekly')),
  ]
}
