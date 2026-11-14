// src/app/campings/[provincia]/page.tsx
// Listado real de campings (no playas) en la provincia, cada uno con
// la playa más cercana, servicios y datos de contacto.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasByProvinciaSlug } from '@/lib/provinciaTopicHelpers'
import { type CampingConPlaya } from '@/lib/campings'
import { campingsDeProvincia, provinciasConCampings, ACTUALIZADO_CAMPINGS } from '@/lib/campings-sidecar'
import PieLanding from '@/components/seo/PieLanding'
import { toSlug } from '@/lib/playas'

// Semanal: campings cambian poco (604800 = 86400 * 7).
// Next.js requiere literal numérico estáticamente analizable, no una expresión.
export const maxDuration = 60
// 1 hora, no 7 días.
//
// Los campings salen de Overpass en RUNTIME: durante `next build` el
// buildGuard corta la red y devuelve lista vacía, así que la página
// nace sin datos y espera a la primera revalidación para llenarse. Con
// 604.800 segundos esa espera era de SIETE DÍAS, y cada despliegue
// reinicia el ciclo con la versión vacía del build.
//
// Comprobado en producción: /campings/girona, /cadiz, /alicante,
// /tarragona y /cantabria decían todas «No se han encontrado campings».
// Las 24 landings llevaban meses vacías, y eso explica su CTR del
// 0,28 % en posición 26 mucho mejor que cualquier título: Google
// indexaba páginas sin contenido.
//
// Una hora significa, como mucho, una consulta a Overpass por provincia
// y hora —y solo si alguien la pide—, que es lo que ya hacen las otras
// tres verticales con el mismo patrón sin problema.
// Una semana: el sidecar solo cambia cuando se vuelve a cosechar, y
// entonces entra con el despliegue. No hay nada que revalidar.
export const revalidate = 604800
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// Vuelven a prerenderizarse TODAS, y ahora sí tiene sentido.
//
// Mientras los campings se pedían a Overpass en runtime, prerenderizar
// aquí producía páginas vacías —el buildGuard corta la red en el build—
// y por eso se desactivó. Con el sidecar el dato está en disco: el
// build lo lee sin pedir nada a nadie y cada provincia sale completa y
// estática.
export async function generateStaticParams() {
  return provinciasConCampings().map(provincia => ({ provincia }))
}

// Una landing vacía NO se indexa.
//
// Mientras las 24 estuvieron sin datos, Google siguió rastreándolas e
// indexándolas: 6.702 impresiones en 90 días para páginas que decían
// «No se han encontrado campings». Eso no es tráfico perdido, es
// confianza gastada. Si por lo que sea Overpass no responde, la página
// se sirve igual —el usuario que llega ve el aviso y los enlaces del
// pie— pero se marca noindex y deja de competir consigo misma.
export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) return {}
  const title = `Campings cerca de la playa en ${data.provincia.nombre}`

  const campings = campingsDeProvincia(provincia)

  return {
    // Una landing vacía NO se indexa. Mientras las 24 estuvieron sin
    // datos, Google siguió rastreándolas: 6.702 impresiones en 90 días
    // para páginas que decían «No se han encontrado campings». Eso no es
    // tráfico perdido, es confianza gastada. Si Overpass no responde, la
    // página se sirve igual —quien llegue ve el aviso y los enlaces—
    // pero se marca noindex y deja de competir consigo misma.
    ...(campings.length === 0 ? { robots: { index: false, follow: true } } : {}),
    // «a pie de playa» y «bungalows» son las dos segundas intenciones
    // medidas, y el título no decía ninguna. Caben las dos en 60
    // caracteres para una provincia de nombre corto; en las largas se
    // corta por el final y lo primero sigue siendo lo importante.
    title: `Campings a pie de playa en ${data.provincia.nombre}, con bungalows`,
    description: `Campings de ${data.provincia.nombre} ordenados por distancia a la arena: cuáles están a menos de 300 m, cuáles tienen bungalows y a qué playa queda cada uno.`,
    alternates: { canonical: `/campings/${provincia}` },
    openGraph: { title, url: `${BASE}/campings/${provincia}`, type: 'article' },
  }
}


/**
 * La nota de Google con su número de reseñas. Las dos cifras van juntas
 * siempre: un 5,0 con tres reseñas no dice lo mismo que un 4,2 con
 * seiscientas, y mostrar la primera sin la segunda engaña. Los cámpings
 * sin valoración no muestran nada en lugar de un hueco o un cero.
 */
function Nota({ c }: { c: CampingConPlaya }) {
  if (!c.rating) return null
  return (
    <span style={{ fontSize: '.78rem', color: 'var(--muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{c.rating.toFixed(1)}</strong>
      {c.reseñas ? ` · ${c.reseñas.toLocaleString('es-ES')} reseñas` : ''}
    </span>
  )
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
  const campings = campingsDeProvincia(provincia)

  // DOS SEGUNDAS INTENCIONES, medidas en Search Console a 180 días sobre
  // 10.667 consultas de alojamiento:
  //
  //   «a pie de playa» — 503 consultas, 3.683 impresiones, 180 de ellas
  //   ya en posición 11-20. Cuatro variantes de «campings en Girona a
  //   pie de playa» suman 361 impresiones. Es LITERALMENTE lo que este
  //   sidecar ordena —distancia a la arena— y ninguna OTA puede decirlo.
  //
  //   «bungalows» — 192 consultas, 935 impresiones y CERO clics. El
  //   campo `bungalows` ya venía en el sidecar y no se usaba en ninguna
  //   parte.
  //
  // No hacen falta URLs nuevas: la página ya existe y ya está en
  // posición 26. Lo que le faltaba era responder, que es la lección de
  // las fichas de alquiler de barcos.
  const aPieDePlaya = campings.filter(c => c.distancia_m <= 300).sort((a, b) => a.distancia_m - b.distancia_m)
  const conBungalows = campings.filter(c => c.bungalows)

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
          más cercana a cada uno. Datos de OpenStreetMap y Google, cosechados el {ACTUALIZADO_CAMPINGS}.
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
            {aPieDePlaya.length > 0 && (
              <section id="a-pie-de-playa" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
                  Campings a pie de playa en {data.provincia.nombre}
                </h2>
                <p style={{ fontSize: '.9rem', color: 'var(--muted)', margin: '0 0 1rem', maxWidth: 640 }}>
                  Los {aPieDePlaya.length} que están a menos de 300 metros de la arena, medidos en línea
                  recta hasta la playa de nuestra guía más cercana. Es la distancia que se anda descalzo.
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {aPieDePlaya.slice(0, 20).map(c => (
                    <li key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'baseline', padding: '11px 0' }}>
                        <span style={{ fontSize: '.95rem' }}>
                          {c.nombre}
                          {c.playa && <span style={{ color: 'var(--muted)', fontSize: '.84rem' }}>
                            {' · '}<Link href={`/playas/${c.playa.slug}`} style={{ color: 'var(--accent)' }}>{c.playa.nombre}</Link>
                          </span>}
                        </span>
                        <span style={{ display: 'flex', gap: 10, alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                          <Nota c={c} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {c.distancia_m} m
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {conBungalows.length > 0 && (
              <section id="bungalows" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
                  Campings con bungalows en {data.provincia.nombre}
                </h2>
                <p style={{ fontSize: '.9rem', color: 'var(--muted)', margin: '0 0 1rem', maxWidth: 640 }}>
                  {conBungalows.length} campings con cabañas o mobil-homes, para quien no quiere montar
                  tienda. Lo que dice OpenStreetMap: conviene confirmarlo con el camping.
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {conBungalows.slice(0, 20).map(c => (
                    <li key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'baseline', padding: '11px 0' }}>
                        <span style={{ fontSize: '.95rem' }}>{c.nombre}</span>
                        <span style={{ display: 'flex', gap: 10, alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                          <Nota c={c} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {c.distancia_m} m
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
        {/* Mismo pie que las demás landings: municipios, otras
            verticales de la provincia y breadcrumb en JSON-LD. */}
        <PieLanding
          provincia={data.provincia.nombre}
          provinciaSlug={provincia}
          vertical="campings"
          etiqueta="Campings"
          municipios={[...new Map(data.playas.filter(p => p.municipio).map(p => [toSlug(p.municipio), { slug: toSlug(p.municipio), nombre: p.municipio }])).values()]}
        />
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
        <span style={{ display: 'flex', gap: '.6rem', alignItems: 'baseline' }}>
          <Nota c={c} />
          <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '.04em' }}>
            {tipoLabel(c.tipo)} · {c.categoria}★
          </span>
        </span>
      </div>

      {c.playa && (
        <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
          A {(c.distancia_m / 1000).toFixed(1)} km de{' '}
          <Link href={`/playas/${c.playa.slug}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
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
              background: 'color-mix(in srgb, var(--excelente) 8%, transparent)', color: 'var(--ink)',
            }}>{s}</span>
          ))}
          {c.bungalows && <span style={{ fontSize: '.7rem', padding: '.15rem .55rem', borderRadius: 99, background: 'color-mix(in srgb, var(--aceptable) 10%, transparent)' }}>Bungalows</span>}
          {c.perros === true && <span style={{ fontSize: '.7rem', padding: '.15rem .55rem', borderRadius: 99, background: 'color-mix(in srgb, var(--noapto) 8%, transparent)' }}>Perros 🐕</span>}
        </div>
      )}

      {(c.website || c.telefono) && (
        <div style={{ marginTop: '.35rem', display: 'flex', gap: '.85rem', flexWrap: 'wrap', fontSize: '.78rem' }}>
          {c.website && (
            <a href={c.website} target="_blank" rel="noopener noreferrer nofollow"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
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
