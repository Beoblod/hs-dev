'use client'

import { useState } from 'react'

export function FooterNewsletter({
  placeholder,
  buttonLabel,
}: {
  placeholder: string
  buttonLabel: string
}) {
  const [email, setEmail] = useState('')

  return (
    <div className="space-y-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-[14px] font-light border border-zinc-200 rounded bg-white text-[#1a1a1a] placeholder:text-zinc-400 focus:outline-none focus:border-[#24b383] transition-colors"
      />
      <button
        onClick={() => setEmail('')}
        className="w-full px-3 py-2.5 bg-[#24b383] hover:bg-[#1fa070] text-white text-[14px] font-medium rounded transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
