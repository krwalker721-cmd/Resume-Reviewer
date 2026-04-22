import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Success() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/'), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '48px 36px' }}>
        <div style={{ width: 64, height: 64, background: 'var(--wins-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>You're all set!</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', lineHeight: '1.6' }}>
          Your payment went through. You now have unlimited resume reviews. Let's get you that job!
        </p>
        <button className="btn-accent" onClick={() => navigate('/')} style={{ padding: '13px 32px' }}>
          Start reviewing →
        </button>
        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted)' }}>
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  )
}
