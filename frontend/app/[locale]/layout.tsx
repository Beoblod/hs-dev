import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'use-intl'
import { Geologica } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import '../globals.css'

const geologica = Geologica({
  variable: '--font-geologica',
  subsets: ['latin', 'cyrillic'],
  weight: ['200', '300', '400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helloservice.ua'),
  title: {
    template: '%s | HelloService',
    default: 'HelloService — Ремонт телефонів та гаджетів у Києві',
  },
  description: 'Ремонт телефонів, ноутбуків та планшетів у Києві. Безкоштовна діагностика, гарантія на роботи.',
  openGraph: {
    siteName: 'HelloService',
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${geologica.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
