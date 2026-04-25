import { Link } from '@/i18n/navigation'
import { JsonLd } from './JsonLd'

type Crumb = { label: string; href?: string }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helloservice.ua'

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const allCrumbs = [{ label: 'Головна', href: '/' }, ...crumbs]

  const ldItems = allCrumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
  }))

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: ldItems }} />
      <nav className="flex items-center gap-2 text-[13px] font-light text-zinc-400 mb-8">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            {c.href ? (
              <Link href={c.href as any} className="hover:text-[#1a1a1a] transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="text-[#1a1a1a]">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
