import { useState, useEffect } from 'react'

const messages = [
  'Reading your resume...',
  'Checking bullet strength...',
  'Scoring your sections...',
  'Almost done...',
]

export default function LoadingScreen() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % messages.length)
    }, 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
      {/* Animated logo */}
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <div style={{ width: 72, height: 72, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--heading)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p key={index} style={{ fontSize: '18px', fontWeight: '600', color: 'var(--heading)', animation: 'fadeIn 0.4s ease' }}>
          {messages[index]}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>
          Claude is analyzing your resume. Usually takes 10–20 seconds.
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {messages.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i <= index ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
