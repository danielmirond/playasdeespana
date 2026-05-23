// src/app/alquiler-catamaran/page.tsx
// Master landing alquiler de catamarán. Captura volumen 5k SV/mes
// del cluster "catamaran + ciudad" (Mallorca, Ibiza, Barcelona,
// Málaga, Valencia). Samboat débil en pos 18-38.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { DESTINOS_PREMIUM } from '@/lib/embarcaciones'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Alquiler de catamarán en España: precios día y semana | Playas de España',
  description: 'Catamarán por destino: Mallorca, Ibiza, Menorca, Costa Brava, Barcelona, Marbella. Precios reales, fondeos solo accesibles por mar y mejor temporada.',
  alternates: { canonical: '/alquiler-catamaran' },
  openGraph: {
    title: 'Alquiler de catamarán en España',
    description: 'Comparativa por destino: precios, fondeos y temporadas.',
    url: `${BASE}/alquiler-catamaran`,
    type: 'website',
  },
}

export default function AlquilerCatamaranMaster() {
  const conCat = DESTINOS_PREMIUM.filter(d => d.precios.catamaranDia)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type':    'CollectionPage',
    name:       'Alquiler de catamarán en España',
    description: 'Comparativa por destino premium.',
    hasPart: conCat.map(d => ({
      '@type': 'Service',
      name:    `Alquiler de catamarán en ${d.nombre}`,
      url:     `${BASE}/alquiler-catamaran/${d.slug}`,
      areaServed: { '@type': 'Place', name: d.nombre },
    })),
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Alquiler de catamarán</span>
        </nav>

        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.72rem', fontWeight: 600,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Por destino · 8 marinas
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
            letterSpacing: '-.02em', marginBottom: '.75rem',
          }}>
            Alquiler de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>catamarán</em> en España
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink)', maxWidth: 740, marginBottom: '0', lineHeight: 1.6 }}>
            8 destinos. Cada uno con precios reales día/semana, fondeos accesibles únicamente por mar y mejor temporada. Catamarán = estabilidad, espacio para grupos 6-12 personas, ideal para jornadas familiares o pequeños grupos.
          </p>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--ink)' }}>
            8 destinos para alquilar catamarán
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '.85rem',
          }}>
            {conCat.map(d => (
              <Link
                key={d.slug}
                href={`/alquiler-catamaran/${d.slug}`}
                style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '1.1rem 1.2rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.4rem',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {d.nombre}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                  {d.provincia} · {d.fondeos.length} fondeos top
                </div>
                {d.precios.catamaranDia && (
                  <div style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 600, marginTop: '.2rem' }}>
                    Desde {d.precios.catamaranDia[0]} €/día
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', background: 'var(--card-bg, #faf6ef)', padding: '1.5rem 1.5rem', borderRadius: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '.75rem', color: 'var(--ink)' }}>
            Catamarán vs yate vs barco
          </h2>
          <ul style={{ fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
            <li><strong>Catamarán</strong> (10-15 m): estabilidad máxima, capacidad 6-12, ideal grupos / familias / días enteros.</li>
            <li><strong>Yate</strong> (8-30 m): premium, cabinas privadas, ideal semana completa romántica.</li>
            <li><strong>Barco sin licencia</strong> (&lt; 5 m): casual, sin titulación, día corto.</li>
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '.65rem' }}>
            <Link href="/alquiler-yate" style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'underline' }}>
              Ver yate →
            </Link>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      </main>
    </>
  )
}
