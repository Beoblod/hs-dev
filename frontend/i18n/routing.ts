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
    '/remont/[slug]/[manufacturer]/[model]/[service]': {
      uk: '/remont/[slug]/[manufacturer]/[model]/[service]',
      en: '/repair/[slug]/[manufacturer]/[model]/[service]',
    },
    '/branches': {
      uk: '/viddilennya',
      en: '/branches',
    },
    '/branches/[slug]': {
      uk: '/viddilennya/[slug]',
      en: '/branches/[slug]',
    },
    '/nova-poshta': '/nova-poshta',
    '/guarantee': '/guarantee',
    '/public-offer': '/public-offer',
    '/guide': '/guide',
    '/special-offers': '/special-offers',
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/vacancies': '/vacancies',
    '/corporate': '/corporate',
    '/suppliers': '/suppliers',
    '/reviews': '/reviews',
  },
})
