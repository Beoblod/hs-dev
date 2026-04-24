'use client'

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-zinc-700 text-white text-[13px] font-medium rounded transition-colors"
    >
      {label} ↑
    </button>
  )
}
