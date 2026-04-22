import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created! Check your email to confirm, then log in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Logo / Hero */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F1F3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', margin: 0 }}>ResumeAI</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '340px' }}>
          Get smart, student-friendly feedback on your resume in seconds.
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'var(--wins-bg)', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', color: '#16A34A', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--heading)' }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.15s', background: 'var(--bg)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--heading)' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.15s', background: 'var(--bg)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '4px' }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '14px', padding: 0, textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>

      <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--muted)' }}>
        1 free review · No credit card required
      </p>
    </div>
  )
}
