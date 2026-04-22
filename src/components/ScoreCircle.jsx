export default function ScoreCircle({ score }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius // ~283
  const offset = circumference - (score / 100) * circumference

  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'
  const label = score >= 75 ? 'Great shape!' : score >= 50 ? 'Good start' : 'Needs work'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className="score-animate"
          style={{ '--target-offset': offset, transition: 'stroke 0.3s' }}
        />
        {/* Score number */}
        <text x="50" y="46" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', fill: 'var(--heading)', fontWeight: '400' }}>
          {score}
        </text>
        <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '9px', fill: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          / 100
        </text>
      </svg>
      <span style={{ fontSize: '13px', fontWeight: '600', color, background: color === 'var(--green)' ? 'var(--wins-bg)' : color === 'var(--yellow)' ? 'var(--accent-light)' : '#FEF2F2', padding: '3px 10px', borderRadius: '99px' }}>
        {label}
      </span>
    </div>
  )
}
