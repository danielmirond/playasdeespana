// src/app/chiringuitos/[provincia]/page.tsx — Chiringuitos reales de una provincia costera, con valoración de Google, reseñas,
// playa más cercana de nuestra guía y deep-link a Maps por place_id.
// Datos del sidecar (scripts/build-chiringuitos.mjs); cero llamadas a
// Places en runtime.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import chiringuitosData from '@/data/chiringuitos.json'

export const revalidate = 86400

const BASE = 'https://playas-espana.com'

interface Estudio {
  googleId: string; nombre: string; rating: number; reseñas: number
  tipo: string; lat: number; lng: number
  playaCercana: { slug: string; nombre: string; distM: number } | null
}
interface ProvEntry { provincia: string; comunidad: string; estudios: Estudio[] }
const DATA = chiringuitosData as Record<string, ProvEntry>

interface Props { params: Promise<{ provincia: string }> }

export function generateStaticParams() {
  return Object.keys(DATA).map(provincia => ({ provincia }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { provincia } = await params
  const d = DATA[provincia]
  if (!d) return {}
  return {
    title: `Chiringuitos en ${d.provincia}: los mejores a pie de playa`,
    description: `Chiringuitos reales en las playas de ${d.provincia}, con valoraciones y reseñas de Google y la playa en la que está cada uno. Del baño a la mesa sin sacudirse la arena.`,
    alternates: { canonical: `/chiringuitos/${provincia}` },
    openGraph: { type: 'website', url: `${BASE}/chiringuitos/${provincia}` },
  }
}

const dist = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`)

export default async function ChiringuitosProvinciaPage({ params }: Props) {
  const { provincia } = await params
  const d = DATA[provincia]
  if (!d) notFound()

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Chiringuitos en ${d.provincia}`,
    numberOfItems: d.estudios.length,
    itemListElement: d.estudios.slice(0, 10).map((e, i) => ({
      '@type': 'ListItem', position: i + 1, name: e.nombre,
    })),
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          <Link href="/chiringuitos">Chiringuitos</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{d.provincia}</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.3rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Chiringuitos en <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{d.provincia}</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: 640 }}>
          {d.estudios.length} chiringuitos reales en las playas de {d.provincia}, ordenados por número de
          reseñas. Junto a cada uno, la playa de nuestra guía en la que está (o la que le queda al lado).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.7rem' }}>
          {d.estudios.map(e => (
            <div key={e.googleId} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.95rem 1.05rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.3 }}>{e.nombre}</span>
                {e.rating > 0 && (
                  <span style={{ flexShrink: 0, fontFamily: 'var(--font-mono, monospace)', fontSize: '.8rem', fontWeight: 700, color: 'var(--accent)' }}>{String(e.rating).replace('.', ',')}★</span>
                )}
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                {e.tipo} · {e.reseñas.toLocaleString('es')} reseñas
              </div>
              {e.playaCercana && (
                <Link href={`/playas/${e.playaCercana.slug}`} style={{ fontSize: '.78rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                  A {dist(e.playaCercana.distM)} de {e.playaCercana.nombre} →
                </Link>
              )}
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${e.googleId}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '.72rem', color: 'var(--muted)', textDecoration: 'none', marginTop: 'auto' }}
              >
                Ver en Google Maps ↗
              </a>
            </div>
          ))}
        </div>

        {/* Cross-links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.6rem', maxWidth: 800, marginTop: '2.5rem' }}>
          <Link href={`/provincia/${provincia}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Playas de {d.provincia} <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Todas, con estado del mar en tiempo real.</span>
          </Link>
          <Link href="/chiringuitos" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Todas las provincias <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Chiringuitos de toda la costa.</span>
          </Link>
          <Link href="/temperatura-del-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Temperatura del agua hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>El baño de después, informado.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
