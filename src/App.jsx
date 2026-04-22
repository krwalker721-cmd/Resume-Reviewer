import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import ReviewForm from './components/ReviewForm'
import ReviewResults from './components/ReviewResults'
import LoadingScreen from './components/LoadingScreen'
import PaywallModal from './components/PaywallModal'
import ReviewHistory from './components/ReviewHistory'
import Success from './pages/Success'

function Navbar({ user, profile, onSignOut }) {
  const isPaid = profile?.access_level === 'paid'
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--white)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F1F3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: 'var(--heading)' }}>ResumeAI</span>
          {isPaid && (
            <span style={{ background: 'var(--accent)', color: 'var(--heading)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
              PRO
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'none' }} className="email-display">{user?.email}</span>
          <button className="btn-outline" onClick={onSignOut} style={{ padding: '7px 16px', fontSize: '13px' }}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

function MainApp({ user }) {
  const [profile, setProfile] = useState(null)
  const [view, setView] = useState('form') // 'form' | 'loading' | 'results'
  const [result, setResult] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [user])

  async function loadProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleReview({ resumeText, appType }) {
    // Check access
    if (profile?.access_level === 'free' && (profile?.reviews_used ?? 0) >= 3) {
      setShowPaywall(true)
      return
    }

    setError('')
    setView('loading')

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, appType, userId: user.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Review failed. Please try again.')

      setResult(data)
      setView('results')
      // Reload profile to update usage count
      loadProfile()
    } catch (err) {
      setError(err.message)
      setView('form')
    }
  }

  function handleReset() {
    setResult(null)
    setView('form')
    setError('')
    loadProfile()
  }

  return (
    <>
      <Navbar user={user} profile={profile} onSignOut={handleSignOut} />

      <main className="container" style={{ padding: '36px 20px 60px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {view === 'form' && (
          <>
            <ReviewForm onSubmit={handleReview} profile={profile} />
            <ReviewHistory userId={user.id} onSelectReview={r => { setResult(r); setView('results') }} />
          </>
        )}

        {view === 'loading' && <LoadingScreen />}

        {view === 'results' && result && (
          <>
            <ReviewResults result={result} onReset={handleReset} />
            <ReviewHistory userId={user.id} onSelectReview={r => { setResult(r); setView('results') }} />
          </>
        )}
      </main>

      {showPaywall && (
        <PaywallModal user={user} onClose={() => setShowPaywall(false)} />
      )}
    </>
  )
}

function AuthGate() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!session) return <Auth />
  return <MainApp user={session.user} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/success" element={<Success />} />
      <Route path="*" element={<AuthGate />} />
    </Routes>
  )
}
