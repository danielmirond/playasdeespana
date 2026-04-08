'use client'

export default function BeachError({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#b06820' }}>Could not load beach data</h2>
      <p style={{ color: '#6b5a3e', marginBottom: '1.5rem' }}>The beach may be unavailable or there is a temporary issue with weather data.</p>
      <button onClick={reset} style={{ background: '#b06820', color: '#fff', border: 'none', borderRadius: '8px', padding: '.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  )
}
