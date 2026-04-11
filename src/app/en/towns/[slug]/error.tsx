'use client'
import Link from 'next/link'

export default function TownError({ reset }: { reset: () => void }) {
  return (
    <main role="main" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b400a' }}>Could not load town data</h1>
      <p style={{ color: '#5a3d12', marginBottom: '1.5rem', maxWidth: '440px' }}>There may be a temporary issue. Please try again.</p>
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" onClick={reset} aria-label="Retry loading town" style={{ background: '#6b400a', color: '#fff', border: 'none', borderRadius: '8px', padding: '.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer', minHeight: '44px' }}>
          Retry
        </button>
        <Link href="/en" style={{ background: 'transparent', color: '#6b400a', border: '1.5px solid #6b400a', borderRadius: '8px', padding: '.72rem 1.5rem', fontSize: '1rem', textDecoration: 'none', fontWeight: 600, minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>
          Back to home
        </Link>
      </div>
    </main>
  )
}
