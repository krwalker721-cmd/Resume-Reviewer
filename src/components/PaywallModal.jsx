import { useState } from 'react'

export default function PaywallModal({ user, onClose }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  async function checkout(plan) {
    setError('')
    setLoading(plan)
    try {
      const priceId = plan === 'monthly'
        ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY // placeholder — real mapping below
        : null

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Icon */}
        <div style={{ width: 56, height: 56, background: 'var(--accent-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>You've used your free review!</h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', lineHeight: '1.5' }}>
          Unlock unlimited reviews to keep leveling up your resume. No limits, ever.
        </p>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Lifetime — highlighted */}
          <button
            className="btn-accent"
            onClick={() => checkout('lifetime')}
            disabled={!!loading}
            style={{ width: '100%', padding: '16px', position: 'relative' }}
          >
            {loading === 'lifetime' ? 'Redirecting...' : (
              <>
                <span>$13 Lifetime Access</span>
                <span style={{ fontSize: '12px', fontWeight: '400', opacity: 0.8, marginLeft: 6 }}>— pay once, done forever</span>
              </>
            )}
          </button>

          {/* Monthly */}
          <button
            className="btn-outline"
            onClick={() => checkout('monthly')}
            disabled={!!loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading === 'monthly' ? 'Redirecting...' : '$4.99 / month — cancel anytime'}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', textDecoration: 'underline' }}
        >
          Maybe later
        </button>

        <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--muted)' }}>
          Secure checkout via Stripe · No subscription surprises
        </p>
      </div>
    </div>
  )
}
