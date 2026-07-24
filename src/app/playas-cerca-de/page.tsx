// src/app/playas-cerca-de/page.tsx — Índice de "playas cerca de [ciudad]"
// para las ciudades de interior con demanda real. Cada ciudad tiene guía
// editorial propia y su lista de playas por distancia verdadera.
// (No confundir con /playas-cerca-de-mi, que usa la geolocalización.)
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { CIUDADES_INTERIOR } from '@/data/ciudades-interior'

export const revalidate = 604800

const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Playas cerca de tu ciudad: guías desde el interior',
  description: 'Guías de playas para quien vive lejos del mar: las playas más cercanas a Madrid, Zaragoza, Sevilla, Córdoba y otras ciudades de interior, con distancias reales, tiempo estimado en coche y los corredores que usa la gente de cada ciudad.',
  alternates: { canonical: '/playas-cerca-de' },
  openGraph: {
    type: 'website', url: `${BASE}/playas-cerca-de`,
    images: [{ url: '/api/og?playa=Playas%20cerca%20de%20tu%20ciudad', width: 1200, height: 630 }],
  },
}

export default function PlayasCercaDePage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Playas cerca de tu ciudad</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Playas cerca de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>tu ciudad</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: 640 }}>
          Vivir lejos del mar no es excusa: guías por ciudad con las playas más cercanas por distancia real,
          el tiempo estimado en coche y los corredores que de verdad usa la gente de cada sitio.
          Si estás en la costa, usa mejor <Link href="/playas-cerca-de-mi" style={{ color: 'var(--accent)', fontWeight: 600 }}>playas cerca de mí</Link> con tu ubicación.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '.6rem' }}>
          {CIUDADES_INTERIOR.map(c => (
            <Link key={c.slug} href={`/playas-cerca-de/${c.slug}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.85rem 1rem', textDecoration: 'none' }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)' }}>Playas cerca de {c.ciudad} <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
