import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home')
  return (
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
    </main>
  )
}
