import type { Metadata } from 'next'

const SITE_NAME = 'HelloService'
const DEFAULT_DESCRIPTION = 'Ремонт телефонів, ноутбуків та планшетів у Києві. Безкоштовна діагностика, гарантія на роботи.'

export function buildMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: {
  title: string
  description?: string
  path: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  }
}
