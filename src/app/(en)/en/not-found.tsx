// 404 del árbol inglés. Sin esto, una URL inexistente bajo /en caía en la
// (es)/not-found y respondía en castellano.
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFoundEn() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', margin: '0 0 .6rem' }}>
          This page does not exist
        </h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 1.6rem' }}>
          The link may be old, or the beach may have been removed from the official inventory.
        </p>
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/en" style={{ padding: '.7rem 1.2rem', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)' }}>Home</Link>
          <Link href="/en/beaches" style={{ padding: '.7rem 1.2rem', background: 'var(--ink)', color: 'var(--surface)', borderRadius: 8 }}>All beaches</Link>
        </div>
      </main>
    </>
  )
}
