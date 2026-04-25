// src/app/rutas/[slug]/page.tsx. Detalle de una ruta costera
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { getPlayas } from '@/lib/playas'
import { getRutas } from '@/lib/rutas'

export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const playas = await getPlayas()
  return (await getRutas(playas)).map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const playas = await getPlayas()
  const ruta = (await getRutas(playas)).find(r => r.slug === slug)
  if (!ruta) return {}
  return {
    title: `${ruta.nombre} | ${ruta.paradas.length} playas imprescindibles`,
    description: `Recorre ${ruta.paradas.length} de las mejores playas de la ${ruta.costa.nombre} en ${ruta.totalKm} km. ${ruta.costa.descripcion}`,
    alternates: { canonical: `/rutas/${slug}` },
  }
}

export default async function RutaPage({ params }: Props) {
  const { slug } = await params
  const playas = await getPlayas()
  const ruta = (await getRutas(playas)).find(r => r.slug === slug)
  if (!ruta) notFound()

  const playasRuta = ruta.paradas.map(p => p.playa)
  const avgScore = Math.round(ruta.paradas.reduce((s, p) => s + p.score, 0) / ruta.paradas.length)

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: ruta.nombre,
    description: ruta.costa.descripcion,
    numberOfItems: ruta.paradas.length,
    itemListElement: ruta.paradas.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p.playa.nombre,
      url: `https://playas-espana.com/playas/${p.playa.slug}`,
    })),
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/rutas" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Rutas</Link>
          <span aria-hidden="true">›</span>
          <span style={{ color: 'var(--muted)' }}>{ruta.costa.zonaLabel}</span>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{ruta.costa.nombre}</span>
        </nav>

        {/* Hero */}
        <div style={{
          marginBottom: '2rem', paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--line)',
          borderLeft: `4px solid ${ruta.costa.color}`,
          paddingLeft: '1.25rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
            fontWeight: 700, letterSpacing: '-.025em', color: 'var(--ink)',
            lineHeight: 1.1, marginBottom: '.4rem',
          }}>
            {ruta.nombre}
          </h1>
          <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '.35rem', maxWidth: 560, lineHeight: 1.55 }}>
            {ruta.costa.descripcion}
          </p>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
            {ruta.costa.zonaLabel} · {ruta.paradas.length} paradas · {ruta.totalKm} km · Puntuación media <strong style={{ color: 'var(--ink)' }}>{avgScore}/100</strong>
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '.55rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <a
            href={ruta.googleMapsUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'var(--accent)', color: '#fff',
              padding: '.75rem 1.25rem', borderRadius: 6,
              fontSize: '.92rem', fontWeight: 800, textDecoration: 'none',
              minHeight: 44, boxShadow: '0 4px 14px rgba(107,64,10,.2)',
            }}
          >
            🗺️ Abrir en Google Maps
          </a>
          <Link href="/rutas" style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--card-bg)', color: 'var(--accent)',
            border: '1px solid var(--line)',
            padding: '.65rem 1.15rem', borderRadius: 4,
            fontSize: '.85rem', fontWeight: 700, textDecoration: 'none', minHeight: 44,
          }}>
            Todas las rutas →
          </Link>
        </div>

        {/* Mapa */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, overflow: 'hidden', marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '.85rem 1.25rem .75rem',
          }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '.95rem', fontWeight: 700, color: 'var(--ink)' }}>
              Mapa de la ruta
            </span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{ruta.paradas.length} paradas</span>
          </div>
          <MapaPlayas playas={playasRuta} height="450px" />
        </div>

        {/* Itinerario */}
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 700,
          color: 'var(--ink)', margin: '0 0 1rem',
        }}>
          Itinerario
        </h2>

        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          {ruta.paradas.map((p, i) => {
            const sc = p.score >= 75 ? '#3d6b1f' : p.score >= 55 ? '#c48a1e' : p.score >= 35 ? '#a04818' : '#7a2818'
            return (
              <li key={p.playa.slug} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 36 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: ruta.costa.color === '#f8fafc' ? 'var(--accent)' : ruta.costa.color, color: '#fff',
                    fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                  {i < ruta.paradas.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: 'var(--line)', margin: '.3rem 0' }} />
                  )}
                </div>
                <Link href={`/playas/${p.playa.slug}`} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: 6, padding: '1rem 1.15rem', textDecoration: 'none', transition: 'all .15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{p.playa.nombre}</span>
                    <span style={{ background: sc, color: '#fff', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.82rem', padding: '.2rem .45rem', borderRadius: 6 }}>
                      {p.score}
                    </span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.35rem' }}>
                    {p.playa.municipio} · {p.playa.provincia}
                    {p.distFromPrev > 0 && <span style={{ marginLeft: '.4rem', fontWeight: 700, color: 'var(--accent)' }}>· {p.distFromPrev.toFixed(1)} km</span>}
                  </div>
                  {p.playa.descripcion && !(p.playa as any).descripcion_generada && (
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.45, marginBottom: '.35rem' }}>
                      {(p.playa.descripcion ?? '').slice(0, 120)}…
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>
                    {p.playa.bandera && <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.12rem .35rem', borderRadius: 4 }}>Bandera Azul</span>}
                    {p.playa.socorrismo && <span style={{ fontSize: '.68rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.12rem .35rem', borderRadius: 4 }}>Socorrismo</span>}
                    {p.playa.parking && <span style={{ fontSize: '.68rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.12rem .35rem', borderRadius: 4 }}>Parking</span>}
                    {p.playa.duchas && <span style={{ fontSize: '.68rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.12rem .35rem', borderRadius: 4 }}>Duchas</span>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>

        {/* CTA final */}
        <div style={{
          marginTop: '2rem', padding: '1.25rem',
          background: 'color-mix(in srgb, var(--accent) 6%, var(--card-bg))',
          border: '1px solid var(--line)', borderRadius: 6,
          textAlign: 'center',
        }}>
          <a href={ruta.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none',
          }}>
            🗺️ Abrir la {ruta.nombre} completa en Google Maps →
          </a>
        </div>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
    </>
  )
}
