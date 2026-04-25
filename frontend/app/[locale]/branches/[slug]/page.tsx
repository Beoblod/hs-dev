import type { Metadata } from 'next'
import { buildMeta } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'
import { Breadcrumb } from '@/app/components/Breadcrumb'
import { OrderForm } from '@/app/components/OrderForm'
import {
  PhoneIcon, MapPinIcon, TimeIcon,
  WalkIcon, BusIcon, CarIcon,
} from '@/app/components/icons'

type Branch = {
  id: string
  slug: string
  name: string
  city: string | null
  address: string
  phone_primary: string
  phone_secondary: string | null
  working_hours: string
  description: string | null
  map_lat: number | null
  map_lng: number | null
  directions_walk_url: string | null
  directions_transit_url: string | null
  directions_car_url: string | null
}

async function getBranch(slug: string): Promise<Branch | null> {
  const rows = await directus.request(
    readItems('branches' as any, {
      filter: { slug: { _eq: slug }, is_active: { _eq: true } },
      fields: [
        'id', 'slug', 'name', 'city', 'address',
        'phone_primary', 'phone_secondary',
        'working_hours', 'description',
        'map_lat', 'map_lng',
        'directions_walk_url', 'directions_transit_url', 'directions_car_url',
      ],
      limit: 1,
    })
  ) as Branch[]
  return rows[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const branch = await getBranch(slug)
  if (!branch) return {}
  return buildMeta({
    title: `${branch.name} — адреса та контакти`,
    description: branch.description ?? `${branch.name}: адреса ${branch.address}, телефон ${branch.phone_primary}, графік ${branch.working_hours}.`,
    path: `/branches/${slug}`,
  })
}

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const t = await getTranslations('branches')
  const branch = await getBranch(slug)
  if (!branch) notFound()

  const mapSrc = branch.map_lat && branch.map_lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${branch.map_lng - 0.01}%2C${branch.map_lat - 0.005}%2C${branch.map_lng + 0.01}%2C${branch.map_lat + 0.005}&layer=mapnik&marker=${branch.map_lat}%2C${branch.map_lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=30.28%2C50.36%2C30.68%2C50.54&layer=mapnik`

  return (
    <div className="bg-[#f2f2f2]">

      {/* ── Header ── */}
      <section className="bg-white">
        <div className="max-w-[1300px] mx-auto px-4 pt-6 pb-10">
          <Breadcrumb crumbs={[
            { label: t('title'), href: '/branches' },
            { label: branch.name },
          ]} />

          <div className="mt-6">
            <h1 className="text-[32px] lg:text-[40px] font-light text-[#1a1a1a] leading-tight">
              {branch.name}
            </h1>
            {branch.city && (
              <p className="mt-1 text-[15px] font-light text-zinc-400">{branch.city}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Details + Map ── */}
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left: contact info */}
            <div className="space-y-5">
              {branch.description && (
                <p className="text-[15px] font-light text-zinc-600 leading-relaxed">
                  {branch.description}
                </p>
              )}

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPinIcon size={18} className="text-[#24b383] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-light text-zinc-400 mb-0.5">{t('address')}</p>
                  <p className="text-[15px] font-light text-[#1a1a1a] leading-snug">{branch.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <PhoneIcon size={18} className="text-[#24b383] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-light text-zinc-400 mb-0.5">{t('phone')}</p>
                  <a href={`tel:${branch.phone_primary}`} className="text-[15px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors block">
                    {branch.phone_primary}
                  </a>
                  {branch.phone_secondary && (
                    <a href={`tel:${branch.phone_secondary}`} className="text-[15px] font-light text-zinc-500 hover:text-[#24b383] transition-colors block">
                      {branch.phone_secondary}
                    </a>
                  )}
                </div>
              </div>

              {/* Working hours */}
              <div className="flex items-start gap-3">
                <TimeIcon size={18} className="text-[#24b383] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-light text-zinc-400 mb-0.5">{t('hours')}</p>
                  <p className="text-[15px] font-light text-[#1a1a1a]">{branch.working_hours}</p>
                </div>
              </div>

              {/* Directions */}
              {(branch.directions_walk_url || branch.directions_transit_url || branch.directions_car_url) && (
                <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-100">
                  {branch.directions_walk_url && (
                    <a
                      href={branch.directions_walk_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f2f2f2] text-[14px] font-light text-zinc-600 hover:bg-[#e9f7f3] hover:text-[#24b383] transition-colors"
                    >
                      <WalkIcon size={15} />
                      {t('directionsWalk')}
                    </a>
                  )}
                  {branch.directions_transit_url && (
                    <a
                      href={branch.directions_transit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f2f2f2] text-[14px] font-light text-zinc-600 hover:bg-[#e9f7f3] hover:text-[#24b383] transition-colors"
                    >
                      <BusIcon size={15} />
                      {t('directionsTransit')}
                    </a>
                  )}
                  {branch.directions_car_url && (
                    <a
                      href={branch.directions_car_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f2f2f2] text-[14px] font-light text-zinc-600 hover:bg-[#e9f7f3] hover:text-[#24b383] transition-colors"
                    >
                      <CarIcon size={15} />
                      {t('directionsCar')}
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/branches"
                  className="text-[14px] font-light text-[#24b383] hover:underline"
                >
                  {t('backToBranches')}
                </Link>
              </div>
            </div>

            {/* Right: map */}
            <div className="rounded-xl overflow-hidden h-[400px] lg:h-auto min-h-[300px]">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: 300 }}
                title={t('mapAlt')}
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Order form ── */}
      <section className="bg-white mt-3">
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <OrderForm />
        </div>
      </section>

    </div>
  )
}
