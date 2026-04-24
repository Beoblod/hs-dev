import { useTranslations } from 'next-intl'

type Branch = {
  id: string
  name: string
  address: string
  phone_primary: string
  phone_secondary: string | null
  working_hours: string
  directions_walk_url: string | null
  directions_transit_url: string | null
  directions_car_url: string | null
}

export function BranchCard({ branch }: { branch: Branch }) {
  const t = useTranslations('branches')

  return (
    <div className="bg-[#f2f2f2] rounded overflow-hidden">
      {/* Title row */}
      <div className="bg-white px-5 py-4 flex items-center gap-3">
        <span className="shrink-0 inline-flex items-center justify-center w-14 h-10 rounded-full border border-zinc-200 text-zinc-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </span>

        <span className="flex-1 text-[18px] font-normal text-[#1a1a1a]">{branch.name}</span>

        {(branch.directions_walk_url || branch.directions_car_url) && (
          <a
            href={branch.directions_car_url ?? branch.directions_walk_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 hover:border-zinc-400 text-zinc-500 transition-colors"
            title={t('directionsCar')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </a>
        )}
      </div>

      {/* Gap */}
      <div className="h-px bg-[#f2f2f2]" />

      {/* Contact info */}
      <div className="bg-white px-5 py-4 space-y-3 text-sm text-[#1a1a1a]">
        {/* Phone */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" className="shrink-0">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <a href={`tel:${branch.phone_primary}`} className="hover:underline">{branch.phone_primary}</a>
          {branch.phone_secondary && (
            <a href={`tel:${branch.phone_secondary}`} className="text-zinc-500 hover:underline">
              {branch.phone_secondary}
            </a>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" className="shrink-0 mt-0.5">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>{branch.address}</span>
        </div>

        {/* Working hours */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" className="shrink-0">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3"/>
          </svg>
          <span>{branch.working_hours}</span>
        </div>

        {/* Direction links */}
        {(branch.directions_walk_url || branch.directions_transit_url || branch.directions_car_url) && (
          <div className="flex gap-3 pt-1 text-xs text-zinc-500">
            {branch.directions_walk_url && (
              <a href={branch.directions_walk_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] hover:underline">
                🚶 {t('directionsWalk')}
              </a>
            )}
            {branch.directions_transit_url && (
              <a href={branch.directions_transit_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] hover:underline">
                🚌 {t('directionsTransit')}
              </a>
            )}
            {branch.directions_car_url && (
              <a href={branch.directions_car_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] hover:underline">
                🚗 {t('directionsCar')}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
