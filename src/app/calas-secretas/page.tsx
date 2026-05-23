// src/app/calas-secretas/page.tsx
// Master "Calas secretas de España" — captura 'cala secreta' SV 880
// + 'calas secretas' SV 170 + cluster long-tail por destino.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { DESTINOS_CALAS } from '@/lib/calasSecretas'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Calas secretas de España: las menos conocidas por destino | Playas de España',
  description: 'Selección automática a partir del dataset oficial MITECO: calas pequeñas (≤200 m), sin chiringuitos ni parking, fuera del radar turístico. Por destino: Mallorca, Ibiza, Menorca, Costa Brava, Cabo de Gata, Asturias, Galicia.',
  alternates: { canonical: '/calas-secretas' },
  openGraph: {
    title: 'Calas secretas de España',
    description: 'Las menos conocidas — filtradas desde el dataset oficial MITECO, no opinión editorial.',
    url: `${BASE}/calas-secretas`,
    type: 'website',
  },
}

export default function CalasSecretasMaster() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type':    'CollectionPage',
    name:       'Calas secretas de España',
    description: 'Selección por destino aplicando criterio objetivo sobre dataset MITECO.',
    hasPart: DESTINOS_CALAS.map(d => ({
      '@type': 'WebPage',
      name:    `Calas secretas de ${d.nombre}`,
      url:     `${BASE}/calas-secretas/${d.slug}`,
    })),
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Calas secretas</span>
        </nav>

        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.72rem', fontWeight: 600,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Editorial · sin opinión · datos oficiales
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
            letterSpacing: '-.02em', marginBottom: '.75rem',
          }}>
            Calas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>secretas</em> de España
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink)', maxWidth: 740, marginBottom: '1.5rem', lineHeight: 1.6 }}>
            La mayoría de listados de "calas secretas" son opinión subjetiva con poco fundamento. Aquí usamos un criterio objetivo sobre el <strong>dataset oficial MITECO</strong>: calas de menos de 200 m de longitud, sin socorrismo, sin parking, sin duchas, sin bandera azul. Lo que filtra automáticamente las playas turísticas y deja las pequeñas y poco urbanizadas.
          </p>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--ink)' }}>
            8 destinos con calas escondidas
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '.85rem',
          }}>
            {DESTINOS_CALAS.map(d => (
              <Link
                key={d.slug}
                href={`/calas-secretas/${d.slug}`}
                style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '1.1rem 1.2rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.3rem',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {d.nombre}
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {d.filterDescr}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', background: 'var(--card-bg, #faf6ef)', padding: '1.5rem 1.5rem', borderRadius: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '.75rem', color: 'var(--ink)' }}>
            ¿Qué hace que una cala sea "secreta"?
          </h2>
          <p style={{ fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.7, margin: '0 0 .65rem' }}>
            Nuestro criterio es <strong>objetivo y reproducible</strong>, no opinión:
          </p>
          <ul style={{ fontSize: '.9rem', color: 'var(--ink)', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
            <li><strong>Longitud ≤ 200 m</strong> (cala/caleta pequeña — capacidad limitada)</li>
            <li><strong>Sin socorrismo</strong> oficial (no en circuito de Cruz Roja/playas turísticas)</li>
            <li><strong>Sin parking habilitado</strong> (acceso difícil = menos gente)</li>
            <li><strong>Sin duchas / sin servicios</strong> (no urbanizada)</li>
            <li><strong>Sin Bandera Azul</strong> (no en lista turística oficial)</li>
            <li><strong>Nombre con "cala", "caleta", "ensenada"</strong> (lingüísticamente local, no rebautizada turísticamente)</li>
          </ul>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      </main>
    </>
  )
}
