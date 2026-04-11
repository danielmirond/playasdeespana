'use client'

export default function TownError({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b400a' }}>Could not load town data</h2>
      <p style={{ color: '#6b5a3e', marginBottom: '1.5rem' }}>There may be a temporary issue. Please try again.</p>
      <button onClick={reset} style={{ background: '#6b400a', color: '#fff', border: 'none', borderRadius: '8px', padding: '.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  )
}
