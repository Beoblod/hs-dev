import { Link } from '@/i18n/navigation'
import {
  MapPinFillIcon, PhoneIcon, MapPinIcon, TimeIcon,
  WalkIcon, BusIcon, CarIcon, ArrowRightIcon,
} from './icons'

type Branch = {
  id: string
  slug: string | null
  name: string
  address: string
  phone_primary: string
  phone_secondary: string | null
  working_hours: string
  directions_walk_url: string | null
  directions_transit_url: string | null
  directions_car_url: string | null
}

type Labels = {
  phone: string
  address: string
  hours: string
  directionsWalk: string
  directionsTransit: string
  directionsCar: string
}

export function BranchCard({ branch, labels }: { branch: Branch; labels: Labels }) {
  const card = (
    <div className="bg-white rounded-lg border border-zinc-100 overflow-hidden hover:border-[#24b383] transition-colors">
      {/* Name row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e9f7f3] shrink-0">
            <MapPinFillIcon size={16} className="text-[#24b383]" />
          </span>
          <span className="text-[15px] font-normal text-[#1a1a1a] leading-snug">{branch.name}</span>
        </div>
        <ArrowRightIcon size={16} className="text-zinc-300 shrink-0" />
      </div>

      {/* Info rows */}
      <div className="px-5 py-4 space-y-3">
        {/* Phone */}
        <div className="flex items-center gap-3">
          <PhoneIcon size={15} className="text-zinc-400 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <a href={`tel:${branch.phone_primary}`} className="text-[14px] font-light text-[#1a1a1a] hover:text-[#24b383] transition-colors">
              {branch.phone_primary}
            </a>
            {branch.phone_secondary && (
              <a href={`tel:${branch.phone_secondary}`} className="text-[14px] font-light text-zinc-500 hover:text-[#24b383] transition-colors">
                {branch.phone_secondary}
              </a>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPinIcon size={15} className="text-zinc-400 shrink-0 mt-0.5" />
          <span className="text-[14px] font-light text-[#1a1a1a] leading-snug">{branch.address}</span>
        </div>

        {/* Working hours */}
        <div className="flex items-center gap-3">
          <TimeIcon size={15} className="text-zinc-400 shrink-0" />
          <span className="text-[14px] font-light text-[#1a1a1a]">{branch.working_hours}</span>
        </div>

        {/* Directions */}
        {(branch.directions_walk_url || branch.directions_transit_url || branch.directions_car_url) && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-50">
            {branch.directions_walk_url && (
              <a
                href={branch.directions_walk_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] font-light text-zinc-400 hover:text-[#24b383] transition-colors"
              >
                <WalkIcon size={13} />
                {labels.directionsWalk}
              </a>
            )}
            {branch.directions_transit_url && (
              <a
                href={branch.directions_transit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] font-light text-zinc-400 hover:text-[#24b383] transition-colors"
              >
                <BusIcon size={13} />
                {labels.directionsTransit}
              </a>
            )}
            {branch.directions_car_url && (
              <a
                href={branch.directions_car_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] font-light text-zinc-400 hover:text-[#24b383] transition-colors"
              >
                <CarIcon size={13} />
                {labels.directionsCar}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (branch.slug) {
    return (
      <Link href={{ pathname: '/branches/[slug]', params: { slug: branch.slug } }} className="block">
        {card}
      </Link>
    )
  }
  return card
}
