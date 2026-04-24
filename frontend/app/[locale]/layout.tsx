import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'use-intl'
import { Geist } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HelloService',
  description: 'Ремонт телефонів та гаджетів у Києві',
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
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
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
