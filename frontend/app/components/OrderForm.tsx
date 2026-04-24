'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type ServiceOption = 'branch' | 'nova_poshta' | 'courier'

type FormState = {
  name: string
  phone: string
  device_type: string
  device_model: string
  comment: string
  service_option: ServiceOption
  confirm_terms: boolean
  confirm_privacy: boolean
  confirm_no_call: boolean
}

const DEVICE_TYPES = [
  'Смартфон',
  'Ноутбук',
  'Планшет',
  'Смарт-годинник',
  'Навушники',
]

export function OrderForm() {
  const t = useTranslations('orderForm')

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    device_type: '',
    device_model: '',
    comment: '',
    service_option: 'branch',
    confirm_terms: false,
    confirm_privacy: false,
    confirm_no_call: false,
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-medium text-[#1a1a1a] mb-2">{t('successTitle')}</p>
        <p className="text-zinc-500">{t('successText')}</p>
      </div>
    )
  }

  const inputClass =
    'w-full h-[52px] px-4 bg-[#f9f9f9] rounded text-[16px] font-light text-[#1a1a1a] placeholder:text-[#bbbbbb] border-0 outline-none focus:ring-1 focus:ring-zinc-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-[32px] font-light text-[#1a1a1a]">{t('title')}</h2>

      {/* Contact + Device — 2 columns on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact */}
        <div className="space-y-3">
          <p className="text-[16px] font-normal text-[#1a1a1a] flex items-center gap-2">
            <ContactIcon /> {t('contactTitle')}
          </p>
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={t('namePlaceholder')}
            className={inputClass}
          />
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder={t('phonePlaceholder')}
            className={inputClass}
          />
        </div>

        {/* Device */}
        <div className="space-y-3">
          <p className="text-[16px] font-normal text-[#1a1a1a] flex items-center gap-2">
            <DeviceIcon /> {t('deviceTitle')}
          </p>
          <div className="relative">
            <select
              value={form.device_type}
              onChange={(e) => set('device_type', e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer ${form.device_type ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]'}`}
            >
              <option value="" disabled>{t('deviceTypePlaceholder')}</option>
              {DEVICE_TYPES.map((dt) => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]" />
          </div>
          <input
            value={form.device_model}
            onChange={(e) => set('device_model', e.target.value)}
            placeholder={t('modelPlaceholder')}
            className={inputClass}
          />
        </div>
      </div>

      {/* Problem description */}
      <div className="space-y-3">
        <p className="text-[16px] font-normal text-[#1a1a1a] flex items-start gap-2">
          <EditIcon className="mt-0.5 shrink-0" /> {t('problemTitle')}
        </p>
        <textarea
          value={form.comment}
          onChange={(e) => set('comment', e.target.value)}
          placeholder={t('commentPlaceholder')}
          rows={4}
          className="w-full px-4 py-3 bg-[#f9f9f9] rounded text-[16px] font-light text-[#1a1a1a] placeholder:text-[#bbbbbb] border-0 outline-none focus:ring-1 focus:ring-zinc-300 resize-none"
        />
        <label className="flex items-center gap-3 h-[52px] px-4 bg-[#f9f9f9] rounded cursor-pointer">
          <AttachIcon />
          <span className="text-[16px] font-light text-[#1a1a1a]">{t('attachPhoto')}</span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>

      {/* Service options + Confirmation — 2 columns on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Service options */}
        <div className="space-y-3">
          <p className="text-[16px] font-normal text-[#1a1a1a] flex items-center gap-2">
            <HandshakeIcon /> {t('serviceTitle')}
          </p>
          <div className="space-y-3">
            {(['branch', 'nova_poshta', 'courier'] as ServiceOption[]).map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${form.service_option === opt ? 'border-[#24b383]' : 'border-zinc-300'}`}>
                  {form.service_option === opt && <span className="w-2.5 h-2.5 rounded-full bg-[#24b383]" />}
                </span>
                <input
                  type="radio"
                  name="service_option"
                  value={opt}
                  checked={form.service_option === opt}
                  onChange={() => set('service_option', opt)}
                  className="hidden"
                />
                <span className="text-[16px] font-light text-[#1a1a1a]">
                  {t(`option${opt === 'branch' ? 'Branch' : opt === 'nova_poshta' ? 'NovaPoshta' : 'Courier'}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Confirmation */}
        <div className="space-y-3">
          <p className="text-[16px] font-normal text-[#1a1a1a] flex items-center gap-2">
            <CheckboxIcon /> {t('confirmTitle')}
          </p>
          <div className="space-y-3">
            <Checkbox
              checked={form.confirm_terms}
              onChange={(v) => set('confirm_terms', v)}
            >
              {t('confirmTerms')}{' '}
              <a href="/terms" className="underline">{t('confirmTermsLink')}</a>
            </Checkbox>
            <Checkbox
              checked={form.confirm_privacy}
              onChange={(v) => set('confirm_privacy', v)}
            >
              {t('confirmPrivacy')}{' '}
              <a href="/privacy" className="underline">{t('confirmPrivacyLink')}</a>
            </Checkbox>
            <Checkbox
              checked={form.confirm_no_call}
              onChange={(v) => set('confirm_no_call', v)}
            >
              {t('confirmNoCall')}
            </Checkbox>
          </div>
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <p className="text-red-500 text-sm">{t('errorText')}</p>
      )}

      {/* Submit */}
      <div className="p-1 bg-[#c8ece0] rounded">
        <button
          type="submit"
          disabled={status === 'sending' || !form.confirm_terms || !form.confirm_privacy}
          className="w-full h-[63px] bg-[#24b383] rounded text-white text-[18px] font-medium flex items-center justify-center gap-3 hover:bg-[#1fa070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? t('sending') : t('submit')}
        </button>
      </div>
    </form>
  )
}

// ── Small icon helpers ────────────────────────────────────────────────────────

function ContactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}

function DeviceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" className={className}>
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  )
}

function AttachIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
      <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
    </svg>
  )
}

function HandshakeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
      <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
    </svg>
  )
}

function CheckboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" className={className}>
      <path d="M19 9l-7 7-7-7"/>
    </svg>
  )
}

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${checked ? 'border-[#24b383] bg-[#24b383]' : 'border-zinc-300'}`}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </span>
      <span className="text-[16px] font-light text-[#1a1a1a] leading-snug">{children}</span>
    </label>
  )
}
