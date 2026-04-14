// src/app/rutas/page.tsx — Índice de rutas costeras de playas
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import { getRutas } from '@/lib/rutas'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Rutas de playas por la costa de España — Itinerarios',
  description: 'Rutas de 5 playas por cada provincia costera de España. Itinerarios para recorrer en coche las mejores playas de Cádiz, Málaga, Barcelona, Canarias y más.',
  alternates: { canonical: '/rutas' },
}

export default async function RutasPage() {
  const playas = await getPlayas()
  const rutas = await getRutas(playas)

  // Agrupar por comunidad
  const porComunidad = new Map<string, typeof rutas>()
  for (const r of rutas) {
    const list = porComunidad.get(r.comunidad) ?? []
    list.push(r)
    porComunidad.set(r.comunidad, list)
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Rutas de playas</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 900, letterSpacing: '-.025em', color: 'var(--ink)',
          lineHeight: 1, marginBottom: '.5rem',
        }}>
          Rutas de playas por la costa
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2.5rem', maxWidth: 560 }}>
          Itinerarios de 5 playas para recorrer en coche cada provincia costera de España.
          Las mejores playas por puntuación, ordenadas geográficamente para minimizar el recorrido.
        </p>

        {Array.from(porComunidad.entries()).map(([comunidad, rutas]) => (
          <section key={comunidad} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 800,
              color: 'var(--ink)', margin: '0 0 1rem', letterSpacing: '-.015em',
            }}>
              {comunidad}
            </h2>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '.65rem',
            }}>
              {rutas.map(r => (
                <Link
                  key={r.slug}
                  href={`/rutas/${r.slug}`}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                    borderRadius: 14, padding: '1.1rem 1.2rem',
                    textDecoration: 'none', transition: 'all .15s',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '.25rem' }}>
                    {r.nombre}
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.55rem' }}>
                    {r.paradas.length} paradas · {r.totalKm} km de recorrido
                  </div>
                  <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {r.paradas.slice(0, 3).map((p, i) => (
                      <span key={p.playa.slug} style={{
                        fontSize: '.72rem', fontWeight: 600,
                        color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 8%, var(--card-bg))',
                        padding: '.15rem .4rem', borderRadius: 4,
                      }}>
                        {i + 1}. {p.playa.nombre}
                      </span>
                    ))}
                    {r.paradas.length > 3 && (
                      <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
                        +{r.paradas.length - 3} más
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
