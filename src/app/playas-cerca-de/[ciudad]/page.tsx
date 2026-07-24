// src/app/playas-cerca-de/[ciudad]/page.tsx — "Playas cerca de Madrid/
// Zaragoza/…": la búsqueda de las ciudades de interior. Volumen alto y
// competencia floja (listículos sin datos). Nuestra ventaja: el dataset
// real — playas ordenadas por distancia verdadera, con estado del mar
// enlazado y texto editorial propio por ciudad (corredores y consejos
// reales, nada de plantilla).
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import EnlacesGeoHubs from '@/components/seo/EnlacesGeoHubs'
import { getPlayasCercaDe } from '@/lib/playas'
import { CIUDADES_INTERIOR, getCiudadInterior } from '@/data/ciudades-interior'
import { getCamperCity } from '@/lib/autocaravana-localities'

export const revalidate = 86400

const BASE = 'https://playas-espana.com'

interface Props { params: Promise<{ ciudad: string }> }

export function generateStaticParams() {
  return CIUDADES_INTERIOR.map(c => ({ ciudad: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad } = await params
  const c = getCiudadInterior(ciudad)
  if (!c) return {}
  return {
    title: `Playas cerca de ${c.ciudad}: cuáles elegir y cómo llegar`,
    description: `Las playas más cercanas a ${c.ciudad} ordenadas por distancia real, con tiempo estimado en coche, estado del mar en tiempo real y los corredores que usa la gente de ${c.ciudad} para escaparse al mar.`,
    alternates: { canonical: `/playas-cerca-de/${ciudad}` },
    openGraph: {
      type: 'article', url: `${BASE}/playas-cerca-de/${ciudad}`,
      images: [{ url: `/api/og?playa=${encodeURIComponent(`Playas cerca de ${c.ciudad}`)}`, width: 1200, height: 630 }],
    },
  }
}

// Estimación honesta de coche: distancia en línea recta × factor de
// carretera (1,25) a 100 km/h de media. La página lo declara como estimado.
function tiempoCoche(kmRecta: number): string {
  const h = (kmRecta * 1.25) / 100
  const horas = Math.floor(h)
  const min = Math.round((h - horas) * 60 / 5) * 5
  if (horas === 0) return `≈ ${min} min`
  return `≈ ${horas} h ${min > 0 ? `${min} min` : ''}`.trim()
}

export default async function PlayasCercaDeCiudadPage({ params }: Props) {
  const { ciudad } = await params
  const c = getCiudadInterior(ciudad)
  if (!c) notFound()

  const playas = await getPlayasCercaDe(c.lat, c.lng, 12)
  const camper = getCamperCity(ciudad)

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Playas cerca de ${c.ciudad}`,
    numberOfItems: playas.length,
    itemListElement: playas.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p.nombre,
      url: `${BASE}/playas/${p.slug}`,
    })),
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          <Link href="/playas-cerca-de">Playas cerca de tu ciudad</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{c.ciudad}</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Playas cerca de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{c.ciudad}</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 1.5rem', maxWidth: 640 }}>
          Las {playas.length} playas con parking más cercanas a {c.ciudad}, ordenadas por distancia real.
          Cada una enlaza a su ficha con el estado del mar de ahora mismo.
        </p>

        {/* Guía editorial única por ciudad */}
        <section style={{ maxWidth: 700, marginBottom: '2rem' }}>
          {c.guia.map((p, i) => (
            <p key={i} style={{ color: 'var(--ink)', lineHeight: 1.7, fontSize: '.95rem', margin: i === c.guia.length - 1 ? 0 : '0 0 1rem' }}>{p}</p>
          ))}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.65rem' }}>
          {playas.map((p, i) => (
            <Link key={p.slug} href={`/playas/${p.slug}`} style={{ display: 'flex', gap: '.7rem', alignItems: 'baseline', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.8rem .95rem', textDecoration: 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.72rem', color: 'var(--muted)', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)' }}>
                  {p.bandera && <span title="Bandera azul" aria-label="Bandera azul" style={{ marginRight: '.3rem' }}>🔵</span>}
                  {p.nombre}
                </span>
                <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</span>
              </span>
              <span style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: '.78rem', fontWeight: 700, color: 'var(--accent)' }}>{Math.round(p.km)} km</span>
                <span style={{ fontSize: '.68rem', color: 'var(--muted)' }}>{tiempoCoche(p.km)}</span>
              </span>
            </Link>
          ))}
        </div>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', margin: '.8rem 0 0' }}>
          Distancia en línea recta; el tiempo en coche es estimado (factor de carretera). Solo playas con parking.
        </p>

        {/* Cross a autocaravana si la ciudad tiene página de alquiler */}
        {camper && (
          <Link href={`/alquiler-autocaravana/${camper.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'linear-gradient(135deg,#0c4a6e,#0b7285)', color: '#fff', borderRadius: 10, padding: '1rem 1.25rem', textDecoration: 'none', marginTop: '1.5rem' }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.02rem' }}>¿Y si te llevas la casa a la playa? <span aria-hidden="true">🚐</span></span>
              <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)' }}>Alquiler de autocaravanas y campers en {camper.ciudad}: precios, rutas y consejos.</span>
            </span>
            <span style={{ flexShrink: 0, background: '#fff', color: '#0c4a6e', fontWeight: 800, fontSize: '.82rem', borderRadius: 7, padding: '.55rem .9rem', whiteSpace: 'nowrap' }}>Ver guía →</span>
          </Link>
        )}

        <EnlacesGeoHubs nombre={c.ciudad} />
      </main>
    </>
  )
}
