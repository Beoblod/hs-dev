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

type Labels = {
  phone: string
  address: string
  hours: string
  directionsWalk: string
  directionsTransit: string
  directionsCar: string
}

export function BranchCard({ branch, labels }: { branch: Branch; labels: Labels }) {
  return (
    <div className="bg-white rounded-lg border border-zinc-100 overflow-hidden">
      {/* Name row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e9f7f3] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#24b383" strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </span>
          <span className="text-[15px] font-normal text-[#1a1a1a] leading-snug">{branch.name}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="shrink-0">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Info rows */}
      <div className="px-5 py-4 space-y-3">
        {/* Phone */}
        <div className="flex items-center gap-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="shrink-0">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="shrink-0 mt-0.5">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className="text-[14px] font-light text-[#1a1a1a] leading-snug">{branch.address}</span>
        </div>

        {/* Working hours */}
        <div className="flex items-center gap-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="shrink-0">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
                <WalkIcon />
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
                <TransitIcon />
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
                <CarIcon />
                {labels.directionsCar}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function WalkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="5" r="1.5"/>
      <path d="M9 10l1.5 2.5L9 17M15 10l-1.5 2.5L15 17M12 7.5v4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TransitIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="13" rx="2"/>
      <path d="M3 9h18M8 19l-2 2M16 19l2 2M8 19h8" strokeLinecap="round"/>
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2h-2M5 17h14M5 17a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round"/>
      <path d="M3 9l2-4h14l2 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
