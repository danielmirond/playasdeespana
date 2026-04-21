// src/app/top/page.tsx — Top 10 mejores playas por costa
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { COSTAS } from '@/lib/rutas'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Top 10 mejores playas de España por costa — Rankings',
  description: 'Rankings de las 10 mejores playas de cada costa de España: Costa del Sol, Costa Brava, Costa de la Luz, Rías Baixas y más. Puntuación por servicios y accesibilidad.',
  alternates: { canonical: '/top' },
}

const ZONAS = [
  { key: 'cantabrica', label: 'Cantábrica' },
  { key: 'atlantica', label: 'Atlántica' },
  { key: 'mediterranea', label: 'Mediterránea' },
  { key: 'insular', label: 'Islas' },
]

export default function TopPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Top 10 Rankings</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.02,
          letterSpacing: '-.02em', marginBottom: '.5rem',
        }}>
          Las <em style={{ fontWeight: 500, color: 'var(--accent)' }}>10 mejores playas</em> por costa
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2.5rem', maxWidth: 560, lineHeight: 1.6 }}>
          Rankings de las 10 mejores playas de cada costa de España, puntuadas por servicios, accesibilidad, bandera azul y ocupación.
        </p>

        {ZONAS.map(zona => {
          const costas = COSTAS.filter(c => c.zona === zona.key)
          return (
            <section key={zona.key} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>
                {zona.label}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.65rem' }}>
                {costas.map(c => (
                  <Link key={c.slug} href={`/top/${c.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: '.75rem',
                    padding: '1rem 1.15rem',
                    background: 'var(--card-bg)', border: '1px solid var(--line)',
                    borderLeft: `3px solid ${c.color === '#f8fafc' ? 'var(--accent)' : c.color}`,
                    borderRadius: 6, textDecoration: 'none', transition: 'border-color .15s',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>
                        Top 10 {c.nombre}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.15rem' }}>
                        {c.provincias.join(', ')}
                      </div>
                    </div>
                    <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)' }}>→</span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </>
  )
}
