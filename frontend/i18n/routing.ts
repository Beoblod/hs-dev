import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/remont': {
      uk: '/remont',
      en: '/repair',
    },
    '/remont/[slug]': {
      uk: '/remont/[slug]',
      en: '/repair/[slug]',
    },
    '/remont/[slug]/[manufacturer]': {
      uk: '/remont/[slug]/[manufacturer]',
      en: '/repair/[slug]/[manufacturer]',
    },
    '/remont/[slug]/[manufacturer]/[model]': {
      uk: '/remont/[slug]/[manufacturer]/[model]',
      en: '/repair/[slug]/[manufacturer]/[model]',
    },
    '/branches': {
      uk: '/viddilennya',
      en: '/branches',
    },
  },
})
