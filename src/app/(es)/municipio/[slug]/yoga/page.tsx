// /municipio/[slug]/yoga — estudios de yoga y pilates de un municipio,
// con la playa que le queda al lado a cada uno.
//
// Solo existe donde hay al menos UMBRAL_ESTUDIOS (3): 52 municipios que
// reúnen el 64 % de los estudios. Los demás no tienen página en vez de
// tener una con dos tarjetas.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import SubirAProvincia from '@/components/seo/SubirAProvincia'
import { getYogaPorMunicipio, getYogaMunicipio } from '@/lib/yoga-municipios'

export const revalidate = 86400
const BASE = 'https://playas-espana.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return [...(await getYogaPorMunicipio()).keys()].map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = await getYogaMunicipio(slug)
  if (!m) return {}
  return {
    title: `Yoga y pilates en ${m.nombre}: estudios cerca de la playa`,
    description: `Los ${m.estudios.length} estudios de yoga y pilates de ${m.nombre}, con su valoración en Google y la playa que le queda más cerca a cada uno.`,
    alternates: { canonical: `/municipio/${slug}/yoga` },
    openGraph: { type: 'website', url: `${BASE}/municipio/${slug}/yoga` },
  }
}

const dist = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`)

export default async function YogaMunicipioPage({ params }: Props) {
  const { slug } = await params
  const m = await getYogaMunicipio(slug)
  if (!m) notFound()

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Estudios de yoga y pilates en ${m.nombre}`,
    numberOfItems: m.estudios.length,
    itemListElement: m.estudios.slice(0, 10).map((e, i) => ({
      '@type': 'ListItem', position: i + 1, name: e.nombre,
    })),
  }

  // La playa más repetida: el ancla concreta que hace que la página hable
  // de este municipio y no de cualquiera con tres estudios.
  const cuenta = new Map<string, { nombre: string; slug: string; n: number }>()
  for (const e of m.estudios) {
    if (!e.playaCercana) continue
    const k = e.playaCercana.slug
    const y = cuenta.get(k)
    if (y) y.n++
    else cuenta.set(k, { nombre: e.playaCercana.nombre, slug: k, n: 1 })
  }
  const playaTop = [...cuenta.values()].sort((a, b) => b.n - a.n)[0]

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          <Link href={`/provincia/${m.provinciaSlug}`}>{m.provincia}</Link><span aria-hidden="true">›</span>
          <Link href={`/municipio/${m.slug}`}>{m.nombre}</Link><span aria-hidden="true">›</span>
          <span aria-current="page">Yoga y pilates</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.3rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Yoga y pilates en <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{m.nombre}</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: 640 }}>
          {m.estudios.length} estudios en {m.nombre}, ordenados por número de reseñas en Google.
          {playaTop && <> El que más se repite al lado es <Link href={`/playas/${playaTop.slug}`} style={{ color: 'var(--accent)' }}>{playaTop.nombre}</Link>.</>}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.7rem' }}>
          {m.estudios.map(e => (
            <div key={e.googleId} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', padding: '.95rem 1.05rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
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

        <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.6, margin: '1.5rem 0 0', maxWidth: 640 }}>
          Los estudios y sus valoraciones salen de Google Places; la distancia se mide
          en línea recta hasta la playa de nuestra guía más cercana, no por carretera.
          Horarios y precios, en cada centro.
        </p>

        <SubirAProvincia vertical="yoga-playa" provincia={m.provincia} municipio={m.nombre} />

        <p style={{ margin: '14px 0 0' }}>
          <Link href={`/municipio/${m.slug}`} style={{ fontSize: '.88rem', color: 'var(--ink)', textDecoration: 'none' }}>
            Todo sobre las playas de {m.nombre} <span aria-hidden="true">→</span>
          </Link>
        </p>
      </main>
    </>
  )
}
