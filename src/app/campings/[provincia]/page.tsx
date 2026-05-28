// src/app/campings/[provincia]/page.tsx
// Listado real de campings (no playas) en la provincia, cada uno con
// la playa más cercana, servicios y datos de contacto.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getProvinciasCosteras, getPlayasByProvinciaSlug } from '@/lib/provinciaTopicHelpers'
import { getCampingsEnBbox, type CampingConPlaya } from '@/lib/campings'

// Semanal: campings cambian poco (604800 = 86400 * 7).
// Next.js requiere literal numérico estáticamente analizable, no una expresión.
export const maxDuration = 30
export const revalidate = 604800
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export async function generateStaticParams() {
  const provs = await getProvinciasCosteras()
  return provs.map(p => ({ provincia: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) return {}
  const title = `Campings cerca de la playa en ${data.provincia.nombre}`
  return {
    title: `${title} | Listado real con servicios y distancia`,
    description: `Campings, glamping y áreas de autocaravanas en ${data.provincia.nombre} con la playa más cercana, distancia real, servicios y datos de contacto. ${data.provincia.count} playas en la provincia.`,
    alternates: { canonical: `/campings/${provincia}` },
    openGraph: { title, url: `${BASE}/campings/${provincia}`, type: 'article' },
  }
}


function tipoLabel(tipo: CampingConPlaya['tipo']) {
  return tipo === 'Glamping' ? 'Glamping' : tipo === 'Autocaravanas' ? 'Áreas de autocaravanas' : 'Camping'
}

function tipoEmoji(tipo: CampingConPlaya['tipo']) {
  return tipo === 'Glamping' ? '🏕️' : tipo === 'Autocaravanas' ? '🚐' : '⛺'
}


export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()

  // Una sola query Overpass para todo el bbox de la provincia
  const campings = await getCampingsEnBbox(
    data.playas.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, lat: p.lat, lng: p.lng })),
    { max: 80 }
  )

  const camping = campings.filter(c => c.tipo === 'Camping')
  const glamping = campings.filter(c => c.tipo === 'Glamping')
  const autocaravanas = campings.filter(c => c.tipo === 'Autocaravanas')

  const title = `Campings cerca de la playa en ${data.provincia.nombre}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: campings.length,
    itemListElement: campings.slice(0, 50).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.nombre,
      item: {
        '@type': 'Campground',
        name: c.nombre,
        address: { '@type': 'PostalAddress', addressLocality: c.playa?.municipio, addressRegion: data.provincia.nombre },
        ...(c.website ? { url: c.website } : {}),
        ...(c.telefono ? { telephone: c.telefono } : {}),
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <Link href="/campings">Campings</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">{data.provincia.nombre}</span>
        </nav>

        <div style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>
          {campings.length} campings · {data.provincia.count} playas en {data.provincia.nombre}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-.02em',
          marginBottom: '.75rem',
        }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 720, lineHeight: 1.6, marginBottom: '2rem' }}>
          Listado completo de campings, glamping y áreas de autocaravanas en {data.provincia.nombre}, con la playa
          más cercana a cada uno. Datos extraídos de OpenStreetMap, actualizados semanalmente.
        </p>

        {campings.length === 0 ? (
          <div style={{
            padding: '2rem', background: 'var(--card-bg)', border: '1px solid var(--line)',
            borderRadius: 8, textAlign: 'center', color: 'var(--muted)',
          }}>
            No se han encontrado campings catalogados en OSM en {data.provincia.nombre}. Si conoces alguno, contribuye al mapa libre en{' '}
            <a href="https://www.openstreetmap.org/edit" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>OpenStreetMap</a>.
          </div>
        ) : (
          <>
            {camping.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
                  ⛺ Campings ({camping.length})
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.75rem' }}>
                  {camping.map(c => <CampingCard key={c.id} c={c} />)}
                </ul>
              </section>
            )}

            {glamping.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
                  🏕️ Glamping ({glamping.length})
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.75rem' }}>
                  {glamping.map(c => <CampingCard key={c.id} c={c} />)}
                </ul>
              </section>
            )}

            {autocaravanas.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
                  🚐 Áreas de autocaravanas ({autocaravanas.length})
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.75rem' }}>
                  {autocaravanas.map(c => <CampingCard key={c.id} c={c} />)}
                </ul>
              </section>
            )}
          </>
        )}

        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
            Preguntas frecuentes
          </h2>
          {[
            { q: `¿Cuánto cuesta un camping en ${data.provincia.nombre}?`, a: 'El precio medio por parcela en temporada alta es 25-45 €/noche. Glamping y bungalows 60-150 €/noche. En temporada baja los precios bajan un 30-50 %.' },
            { q: `¿Se puede acampar libremente en ${data.provincia.nombre}?`, a: 'No. La acampada libre está prohibida en toda la costa española. Usa siempre campings regulados o áreas habilitadas para autocaravanas.' },
            { q: `¿Cuándo reservar camping en ${data.provincia.nombre}?`, a: 'Con 1-2 meses de antelación en julio-agosto. El resto del año hay disponibilidad puntual, pero los mejores se llenan los fines de semana.' },
            { q: '¿Hay áreas gratuitas para autocaravanas?', a: `Sí, en ${data.provincia.nombre} hay áreas municipales gratuitas o de pago simbólico (1-5 €). Muchas incluyen vaciado y agua potable. Consulta Park4Night o Caramaps para ver las disponibles.` },
          ].map((f, i) => (
            <details key={i} style={{ borderBottom: '1px solid var(--line)', padding: '.85rem 0' }}>
              <summary style={{ fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.55, marginTop: '.5rem' }}>{f.a}</p>
            </details>
          ))}
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            También te puede interesar
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            <Link href="/campings" style={chipStyle}>Todos los campings</Link>
            <Link href="/playas-autocaravana" style={chipStyle}>Autocaravana en España</Link>
            <Link href={`/provincia/${provincia}`} style={chipStyle}>Playas de {data.provincia.nombre}</Link>
            <Link href="/rutas" style={chipStyle}>Rutas por la costa</Link>
          </div>
        </section>
      </main>
    </>
  )
}


const chipStyle = {
  padding: '.5rem 1rem',
  borderRadius: 99,
  background: 'var(--card-bg)',
  border: '1px solid var(--line)',
  color: 'var(--ink)',
  fontSize: '.85rem',
  textDecoration: 'none',
} as const


function CampingCard({ c }: { c: CampingConPlaya }) {
  return (
    <li style={{
      background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8,
      padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.4rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
          <span style={{ marginRight: '.4rem' }} aria-hidden="true">{tipoEmoji(c.tipo)}</span>
          {c.nombre}
        </h3>
        <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '.04em' }}>
          {tipoLabel(c.tipo)} · {c.categoria}★
        </span>
      </div>

      {c.playa && (
        <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
          A {(c.distancia_m / 1000).toFixed(1)} km de{' '}
          <Link href={`/playas/${c.playa.slug}`} style={{ color: 'var(--accent, #6b400a)', fontWeight: 600 }}>
            {c.playa.nombre}
          </Link>
          {' '}({c.playa.municipio})
        </div>
      )}

      {c.servicios.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginTop: '.15rem' }}>
          {c.servicios.slice(0, 8).map(s => (
            <span key={s} style={{
              fontSize: '.7rem', padding: '.15rem .55rem', borderRadius: 99,
              background: 'rgba(61,107,31,.08)', color: 'var(--ink)',
            }}>{s}</span>
          ))}
          {c.bungalows && <span style={{ fontSize: '.7rem', padding: '.15rem .55rem', borderRadius: 99, background: 'rgba(196,138,30,.1)' }}>Bungalows</span>}
          {c.perros === true && <span style={{ fontSize: '.7rem', padding: '.15rem .55rem', borderRadius: 99, background: 'rgba(122,40,24,.08)' }}>Perros 🐕</span>}
        </div>
      )}

      {(c.website || c.telefono) && (
        <div style={{ marginTop: '.35rem', display: 'flex', gap: '.85rem', flexWrap: 'wrap', fontSize: '.78rem' }}>
          {c.website && (
            <a href={c.website} target="_blank" rel="noopener noreferrer nofollow"
              style={{ color: 'var(--accent, #6b400a)', textDecoration: 'underline' }}>
              Web →
            </a>
          )}
          {c.telefono && (
            <a href={`tel:${c.telefono}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
              {c.telefono}
            </a>
          )}
        </div>
      )}
    </li>
  )
}
