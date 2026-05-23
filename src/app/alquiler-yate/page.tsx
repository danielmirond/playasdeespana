// src/app/alquiler-yate/page.tsx
// Master landing alquiler de yate. Captura "alquiler yate" + "yate"
// queries (CPC 5-25€). Cluster premium con Samboat débil en SERP.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { DESTINOS_PREMIUM } from '@/lib/embarcaciones'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Alquiler de yate en España: precios por destino | Playas de España',
  description: 'Comparativa real de alquiler de yate en Ibiza, Mallorca, Menorca, Tenerife, Marbella y Costa Brava. Precios por semana, calas accesibles solo por mar, mejor temporada.',
  alternates: { canonical: '/alquiler-yate' },
  openGraph: {
    title: 'Alquiler de yate en España: precios por destino',
    description: 'Comparativa real de alquiler de yate en los 6 destinos premium de España.',
    url: `${BASE}/alquiler-yate`,
    type: 'website',
  },
}

export default function AlquilerYateMaster() {
  const conYate = DESTINOS_PREMIUM.filter(d => d.precios.yateSemana)

  // Schema CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type':    'CollectionPage',
    name:       'Alquiler de yate en España',
    description: 'Comparativa por destino premium.',
    hasPart: conYate.map(d => ({
      '@type': 'Service',
      name:    `Alquiler de yate en ${d.nombre}`,
      url:     `${BASE}/alquiler-yate/${d.slug}`,
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
          <span aria-current="page">Alquiler de yate</span>
        </nav>

        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.72rem', fontWeight: 600,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Premium · 6 destinos
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
            letterSpacing: '-.02em', marginBottom: '.75rem',
          }}>
            Alquiler de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>yate</em> en España
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink)', maxWidth: 740, marginBottom: '0', lineHeight: 1.6 }}>
            Comparativa por destino premium. Cada landing tiene precios reales del mercado, calas accesibles únicamente por mar, mejor temporada y trucos de local que no encontrarás en las plataformas generalistas.
          </p>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--ink)' }}>
            6 destinos para alquilar yate
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '.85rem',
          }}>
            {conYate.map(d => (
              <Link
                key={d.slug}
                href={`/alquiler-yate/${d.slug}`}
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
                {d.precios.yateSemana && (
                  <div style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 600, marginTop: '.2rem' }}>
                    Desde {d.precios.yateSemana[0].toLocaleString('es')} €/semana
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', background: 'var(--card-bg, #faf6ef)', padding: '1.5rem 1.5rem', borderRadius: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '.75rem', color: 'var(--ink)' }}>
            ¿Yate o catamarán? Cuál te conviene
          </h2>
          <ul style={{ fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
            <li><strong>Yate</strong> (8-30 m): premium, 1 cabina por pareja, ideal semana completa. Ticket 8k-35k€/semana.</li>
            <li><strong>Catamarán</strong> (10-15 m): estabilidad, grupos 6-12 personas, ideal día o fin de semana. 500-2.500€/día.</li>
            <li><strong>Barco sin licencia</strong> (&lt; 5 m): casual, día/jornada, sin titulación. 120-360€/día.</li>
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '.65rem' }}>
            <Link href="/alquiler-catamaran" style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'underline' }}>
              Ver catamarán →
            </Link>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      </main>
    </>
  )
}
