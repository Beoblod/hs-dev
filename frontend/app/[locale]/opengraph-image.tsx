import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'HelloService — Ремонт телефонів та гаджетів у Києві'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '64px',
        }}
      >
        {/* Green accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: '#24b383' }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: '#24b383',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M9 11h5v10H9V11zm9 0h5v3.5h-5V11zm0 6.5h5V21h-5v-3.5z" fill="white" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 600, color: '#ffffff' }}>Hello</span>
            <span style={{ fontSize: '28px', fontWeight: 600, color: '#24b383' }}>Service</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ fontSize: '52px', fontWeight: 300, color: '#ffffff', lineHeight: 1.2, maxWidth: '860px' }}>
          Ремонт телефонів, ноутбуків та планшетів у Києві
        </div>

        {/* Subline */}
        <div style={{ marginTop: '24px', fontSize: '24px', fontWeight: 300, color: '#a1a1aa' }}>
          Безкоштовна діагностика · Гарантія на роботи · Ремонт Новою Поштою
        </div>
      </div>
    ),
    { ...size }
  )
}
