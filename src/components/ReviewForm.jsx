import { useState, useRef } from 'react'
import { extractTextFromPDF } from '../lib/pdfExtract'

const APP_TYPES = [
  { value: 'college', label: '🎓 College Program' },
  { value: 'firstjob', label: '💼 First Full-Time Job' },
  { value: 'parttime', label: '⏰ Part-Time Job' },
  { value: 'internship', label: '🔬 Internship' },
]

export default function ReviewForm({ onSubmit, profile }) {
  const [resumeText, setResumeText] = useState('')
  const [appType, setAppType] = useState('internship')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const reviewsLeft = Math.max(0, 1 - (profile?.reviews_used ?? 0))
  const isPaid = profile?.access_level === 'paid'

  async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file.')
      return
    }
    setPdfError('')
    setPdfLoading(true)
    try {
      const text = await extractTextFromPDF(file)
      setResumeText(text)
    } catch {
      setPdfError('Could not read that PDF. Try copying and pasting your resume text instead.')
    } finally {
      setPdfLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!resumeText.trim()) return
    onSubmit({ resumeText: resumeText.trim(), appType })
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>
          Get your resume reviewed
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
          Paste your resume or upload a PDF. We'll give you honest, actionable feedback in about 15 seconds.
        </p>
      </div>

      {/* Usage badge */}
      {!isPaid && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: reviewsLeft === 0 ? '#FEF2F2' : 'var(--accent-light)', border: `1px solid ${reviewsLeft === 0 ? '#FECACA' : '#FCD34D'}`, borderRadius: '99px', padding: '6px 14px', marginBottom: '24px', fontSize: '13px', fontWeight: '600', color: reviewsLeft === 0 ? 'var(--red)' : 'var(--heading)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: reviewsLeft === 0 ? 'var(--red)' : 'var(--accent)', display: 'inline-block' }} />
          {reviewsLeft === 0 ? 'No free reviews left' : `${reviewsLeft} of 1 free review remaining`}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Application type */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--heading)', marginBottom: '12px' }}>
            What are you applying for?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {APP_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setAppType(t.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: appType === t.value ? '2px solid var(--accent)' : '2px solid var(--border)',
                  background: appType === t.value ? 'var(--accent-light)' : 'var(--white)',
                  fontWeight: appType === t.value ? '600' : '400',
                  fontSize: '14px',
                  color: 'var(--heading)',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* PDF upload zone */}
        <div
          className="card"
          style={{ padding: '20px 24px', borderStyle: dragOver ? 'solid' : 'dashed', borderColor: dragOver ? 'var(--accent)' : 'var(--border)', background: dragOver ? 'var(--accent-light)' : 'var(--white)', transition: 'all 0.15s', cursor: 'pointer' }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, background: 'var(--accent-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {pdfLoading
                ? <div style={{ width: 20, height: 20, border: '2.5px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                )
              }
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--heading)' }}>
                {pdfLoading ? 'Extracting text...' : 'Upload your resume PDF'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Drag & drop or click · PDF only · Text will appear below
              </p>
            </div>
          </div>
          {pdfError && <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--red)' }}>{pdfError}</p>}
        </div>

        {/* Resume textarea */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--heading)', marginBottom: '10px' }}>
            Resume text
          </label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume here, or upload a PDF above and it'll appear automatically..."
            rows={14}
            style={{ width: '100%', resize: 'vertical', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', lineHeight: '1.6', outline: 'none', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--muted)' }}>
            {resumeText.length > 0 ? `${resumeText.length} characters` : 'Tip: include all sections — experience, education, skills, summary'}
          </p>
        </div>

        <button
          type="submit"
          className="btn-accent"
          disabled={!resumeText.trim()}
          style={{ width: '100%', padding: '16px', fontSize: '16px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Review My Resume
        </button>
      </form>
    </div>
  )
}
