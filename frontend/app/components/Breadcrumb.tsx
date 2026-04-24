import { Link } from '@/i18n/navigation'

type Crumb = { label: string; href?: string }

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
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
  )
}
