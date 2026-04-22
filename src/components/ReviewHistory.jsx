import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const APP_TYPE_LABELS = {
  college: '🎓 College Program',
  firstjob: '💼 First Job',
  parttime: '⏰ Part-Time',
  internship: '🔬 Internship',
}

function ScorePill({ score }) {
  const color = score >= 75 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626'
  const bg = score >= 75 ? 'var(--wins-bg)' : score >= 50 ? 'var(--accent-light)' : '#FEF2F2'
  return (
    <span style={{ background: bg, color, fontWeight: '700', fontSize: '13px', padding: '3px 10px', borderRadius: '99px' }}>
      {score}
    </span>
  )
}

export default function ReviewHistory({ userId, onSelectReview }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('reviews')
        .select('id, application_type, feedback, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      setReviews(data || [])
      setLoading(false)
    }
    load()
  }, [userId, open])

  return (
    <div style={{ marginTop: '40px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: '600', padding: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
        </svg>
        Review History
      </button>

      {open && (
        <div className="card fade-in" style={{ marginTop: '12px' }}>
          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>Loading...</p>
          ) : reviews.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>No reviews yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => onSelectReview(r.feedback)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', background: 'none', border: 'none', borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--heading)' }}>
                      {APP_TYPE_LABELS[r.application_type] || r.application_type}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {r.feedback?.overallScore != null && <ScorePill score={r.feedback.overallScore} />}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
