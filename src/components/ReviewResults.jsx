import ScoreCircle from './ScoreCircle'

const SECTION_ORDER = ['formatting', 'bulletPoints', 'skills', 'missingSections']

function SectionCard({ section, delay }) {
  const score = section.score
  const barColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="card fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: '600', color: 'var(--heading)' }}>
          {section.label}
        </h3>
        <span style={{ fontSize: '20px', fontFamily: 'DM Serif Display, serif', color: barColor, minWidth: '40px', textAlign: 'right' }}>
          {score}
        </span>
      </div>

      {/* Score bar */}
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', marginBottom: '14px', overflow: 'hidden' }}>
        <div
          className="bar-animate"
          style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: '99px' }}
        />
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '12px', lineHeight: '1.6' }}>
        {section.feedback}
      </p>

      {section.tips?.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {section.tips.map((tip, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '700', flexShrink: 0 }}>→</span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ReviewResults({ result, onReset }) {
  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '30px', marginBottom: '6px' }}>Your Resume Review</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{result.summary}</p>
        </div>
        <button className="btn-outline" onClick={onReset} style={{ flexShrink: 0 }}>
          ← Review Another
        </button>
      </div>

      {/* Overall score */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <ScoreCircle score={result.overallScore} />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Overall Score</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {SECTION_ORDER.map(key => {
              const s = result.sections[key]
              if (!s) return null
              const c = s.score >= 75 ? 'var(--green)' : s.score >= 50 ? 'var(--yellow)' : 'var(--red)'
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: '700', color: c, marginLeft: 'auto' }}>{s.score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Wins & Top Fixes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Wins */}
        <div className="card fade-in" style={{ background: 'var(--wins-bg)', border: '1px solid #BBF7D0', animationDelay: '100ms' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#16A34A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span>✓</span> Top Wins
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.topWins?.map((win, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#166534' }}>
                <span style={{ color: 'var(--wins)', fontWeight: '700', flexShrink: 0 }}>✓</span>
                {win}
              </li>
            ))}
          </ul>
        </div>

        {/* Fixes */}
        <div className="card fade-in" style={{ background: 'var(--fixes-bg)', border: '1px solid #FED7AA', animationDelay: '200ms' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--fixes)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span>⚡</span> Top Fixes
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.topFixes?.map((fix, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#9A3412' }}>
                <span style={{ color: 'var(--fixes)', fontWeight: '700', flexShrink: 0 }}>→</span>
                {fix}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SECTION_ORDER.map((key, i) => {
          const section = result.sections[key]
          if (!section) return null
          return <SectionCard key={key} section={section} delay={300 + i * 80} />
        })}
      </div>

      {/* Review another CTA */}
      <div style={{ textAlign: 'center', marginTop: '36px', paddingBottom: '40px' }}>
        <button className="btn-accent" onClick={onReset} style={{ padding: '14px 36px', fontSize: '15px' }}>
          Review Another Resume
        </button>
      </div>
    </div>
  )
}
