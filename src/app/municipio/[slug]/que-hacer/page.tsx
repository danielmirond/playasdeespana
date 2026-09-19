// /municipio/[slug]/que-hacer — Qué hacer en el municipio: playas, museos, monumentos,
// miradores, cultura, parques, comer y actividades.
//
// POR QUÉ EXISTE, Y POR QUÉ COLGANDO DEL MUNICIPIO. «Qué hacer en X» y «qué
// ver en X» son la consulta más volumétrica del turismo doméstico según GSC:
// Málaga, Cádiz, Sitges, Cadaqués, San Sebastián… todos con miles de
// impresiones sin clic desde nuestras páginas de municipio, que las
// resuelven mal —solo hablan de playas—. Esta subpágina lo asume: es la
// pregunta y esta es la respuesta.
//
// QUÉ APORTA. Tres capas de datos que la mayoría de guías no combinan:
//   1. Nuestra ficha de playas (las que ya tenemos, mejor equipadas primero).
//   2. POIs de OpenStreetMap dentro de 3 km del centroide del municipio:
//      museos, monumentos, miradores/faros, teatros/cines, parques. Precomputados
//      offline por scripts/build-municipio-pois.mjs, cero llamadas a Overpass en
//      runtime.
//   3. Restaurantes cerca del mar (osmRestaurantes) y actividades de
//      GetYourGuide (widget existente).
//
// COBERTURA DEL PROTOTIPO. Solo 25 municipios turísticos consolidados. Si el
// slug no está, notFound(). Ampliar es solo añadir slugs a MUNICIPIOS del
// script y re-correrlo. El sidecar es lineal (~2 KB por municipio).
//
// LO QUE NO SE HACE. No se genera contenido con IA. Un municipio sin museos
// no tiene ese bloque; no lo relleno con «disfruta de la rica gastronomía
// local». Cada línea sale de un dato real de OSM o del inventario MITECO.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getMunicipios, getPlayasByMunicipio } from '@/lib/playas'
import { getMunicipioPois, getMunicipiosConPois, type Poi } from '@/lib/municipio-pois'
import { osmRestaurantes } from '@/lib/osm-pois'
import { tieneMareas, ubicacionMareas } from '@/lib/mareas-portus'
import { tieneBarcos } from '@/lib/barcos-municipio'
import GygActivities from '@/components/GygActivities'

export const maxDuration = 60
export const revalidate = 3600

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getMunicipiosConPois()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pois = await getMunicipioPois(slug)
  if (!pois) return {}
  return {
    title: `Qué hacer en ${pois.nombre}: playas, museos, monumentos y rutas`,
    description: `Guía práctica de qué ver y qué hacer en ${pois.nombre}: sus mejores playas, museos, monumentos, miradores, teatros y sitios donde comer con vistas. Datos oficiales, actualizados.`,
    alternates: { canonical: `/municipio/${slug}/que-hacer` },
  }
}

// Contamos las categorías con contenido para redactar la respuesta directa
// sin listar bloques vacíos. La copy se adapta al municipio.
function frase(pois: NonNullable<Awaited<ReturnType<typeof getMunicipioPois>>>, playas: number) {
  const trozos: string[] = []
  if (playas > 0) trozos.push(`${playas} ${playas === 1 ? 'playa' : 'playas'}`)
  if (pois.museos.length) trozos.push(`${pois.museos.length} ${pois.museos.length === 1 ? 'museo' : 'museos'}`)
  if (pois.monumentos.length) trozos.push(`${pois.monumentos.length} monumentos`)
  if (pois.miradores.length) trozos.push(`${pois.miradores.length} ${pois.miradores.length === 1 ? 'mirador' : 'miradores'}`)
  if (pois.cultura.length) trozos.push(`${pois.cultura.length} espacios culturales`)
  if (pois.parques.length) trozos.push(`${pois.parques.length} parques`)
  if (trozos.length === 0) return `En ${pois.nombre} hay cosas que hacer más allá del baño; a continuación las principales.`
  return `${pois.nombre} concentra ${trozos.slice(0, -1).join(', ')}${trozos.length > 1 ? ' y ' : ''}${trozos[trozos.length - 1]} en un radio de 3 km. Selección real desde OpenStreetMap.`
}

// Componente de bloque: un h2 con eyebrow y una lista de POIs. Solo se
// renderiza si hay datos.
function BloquePois({ id, eyebrow, titulo, items, mostrar = 8 }: {
  id: string; eyebrow: string; titulo: string; items: Poi[]; mostrar?: number
}) {
  if (!items.length) return null
  const visibles = items.slice(0, mostrar)
  return (
    <section id={id} style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
      }}>{eyebrow}</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
        color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
      }}>{titulo}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
        {visibles.map(p => (
          <li key={`${p.nombre}-${p.lat}`} style={{
            border: '1px solid var(--line)', borderRadius: 6, padding: '.7rem .85rem',
            display: 'flex', alignItems: 'baseline', gap: '.75rem', flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '.6rem', fontWeight: 600, letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'var(--muted)',
              padding: '.15rem .45rem', border: '1px solid var(--line)',
              borderRadius: 100, flexShrink: 0,
            }}>{p.tipo}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', flex: 1, minWidth: 0 }}>
              {p.website ? (
                <a href={p.website} target="_blank" rel="noopener nofollow" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--muted)' }}>
                  {p.nombre}
                </a>
              ) : p.nombre}
            </span>
            {p.pmr && <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Accesible</span>}
            <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
              target="_blank" rel="noopener"
              style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              Cómo llegar →
            </a>
          </li>
        ))}
      </ul>
      {items.length > mostrar && (
        <div style={{ marginTop: '.55rem', fontSize: '.78rem', color: 'var(--muted)' }}>
          Otros {items.length - mostrar} sitios de esta categoría dentro del radio.
        </div>
      )}
    </section>
  )
}

export default async function QueHacerPage({ params }: Props) {
  const { slug } = await params
  const pois = await getMunicipioPois(slug)
  if (!pois) notFound()

  const [playas, municipios] = await Promise.all([
    getPlayasByMunicipio(slug),
    getMunicipios(),
  ])
  const tienePaginaMuni = municipios.some(m => m.slug === slug)
  const municipio = municipios.find(m => m.slug === slug)
  const provinciaSlug = municipio?.provinciaSlug

  // Top 3 playas mejor equipadas, mismo criterio que la página raíz del muni:
  // bandera azul y socorrismo pesan más porque son lo que la gente pregunta.
  const topPlayas = [...playas]
    .sort((a, b) =>
      ((b.bandera ? 5 : 0) + (b.socorrismo ? 2 : 0) + (b.accesible ? 1 : 0) + (b.parking ? 1 : 0)) -
      ((a.bandera ? 5 : 0) + (a.socorrismo ? 2 : 0) + (a.accesible ? 1 : 0) + (a.parking ? 1 : 0)))
    .slice(0, 3)

  // Restaurantes cerca del mar: cogemos los del sidecar OSM anclados a la
  // playa más equipada del municipio. Solo si tenemos al menos una playa con
  // coords (no siempre — algunos municipios interiores en el prototipo, no).
  const restaurantes = topPlayas[0]
    ? (await osmRestaurantes(topPlayas[0].lat, topPlayas[0].lng))?.slice(0, 6) ?? []
    : []

  const respuesta = frase(pois, playas.length)
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `¿Qué hacer en ${pois.nombre}?`,
      acceptedAnswer: { '@type': 'Answer', text: respuesta },
    }],
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <div style={{
        borderBottom: '1px solid var(--line)', padding: '2rem 1.5rem 2.25rem',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <nav aria-label="Ruta de navegación" style={{
            fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.85rem',
            display: 'flex', flexWrap: 'wrap', gap: '.35rem',
          }}>
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            {municipio && provinciaSlug && (
              <>
                <Link href={`/comunidad/${municipio.comunidadSlug}`}>{municipio.comunidad}</Link>
                <span aria-hidden="true">›</span>
                <Link href={`/provincia/${provinciaSlug}`}>{municipio.provincia}</Link>
                <span aria-hidden="true">›</span>
              </>
            )}
            {tienePaginaMuni ? (
              <Link href={`/municipio/${slug}`}>{pois.nombre}</Link>
            ) : <span>{pois.nombre}</span>}
            <span aria-hidden="true">›</span>
            <span aria-current="page">Qué hacer</span>
          </nav>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.85rem, 4vw, 2.4rem)',
            fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1, color: 'var(--ink)',
            marginBottom: '.6rem',
          }}>
            Qué hacer en <em style={{ fontWeight: 500, color: 'var(--accent)', fontStyle: 'italic' }}>{pois.nombre}</em>
          </h1>
          <p data-speakable style={{
            fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0,
          }}>{respuesta}</p>
        </div>
      </div>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '2.5rem 1.5rem 3rem' }}>

        {topPlayas.length > 0 && (
          <section id="banarse" style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
            }}>Bañarse</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
            }}>
              Las playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>mejor equipadas</em>
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
              {topPlayas.map((p, i) => (
                <li key={p.slug} style={{
                  border: '1px solid var(--line)', borderRadius: 6, padding: '.7rem .85rem',
                  display: 'flex', alignItems: 'baseline', gap: '.75rem',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontSize: '1rem', color: 'var(--muted)', flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/playas/${p.slug}`} style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
                      {p.nombre}
                    </Link>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.15rem', display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                      {p.bandera && <span>Bandera Azul</span>}
                      {p.socorrismo && <span>· Socorrismo</span>}
                      {p.accesible && <span>· PMR</span>}
                      {p.parking && <span>· Parking</span>}
                    </div>
                  </div>
                  <Link href={`/playas/${p.slug}`} style={{ fontSize: '.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                    Ver ficha →
                  </Link>
                </li>
              ))}
            </ul>
            {tienePaginaMuni && playas.length > 3 && (
              <div style={{ marginTop: '.6rem', fontSize: '.82rem' }}>
                <Link href={`/municipio/${slug}`} style={{ color: 'var(--accent)' }}>
                  Todas las {playas.length} playas de {pois.nombre} →
                </Link>
              </div>
            )}
          </section>
        )}

        <BloquePois id="museos" eyebrow="Ver arte y cultura" titulo="Museos y galerías" items={pois.museos} />
        <BloquePois id="monumentos" eyebrow="Patrimonio" titulo="Monumentos y sitios históricos" items={pois.monumentos} mostrar={10} />
        <BloquePois id="miradores" eyebrow="Panorámicas" titulo="Miradores y faros" items={pois.miradores} />
        <BloquePois id="cultura" eyebrow="Cine, teatro, ocio" titulo="Cultura y espectáculos" items={pois.cultura} />
        <BloquePois id="parques" eyebrow="Aire libre" titulo="Parques y jardines" items={pois.parques} />

        {restaurantes.length > 0 && (
          <section id="comer" style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
            }}>Comer cerca del mar</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
            }}>
              Restaurantes junto a la <em style={{ fontWeight: 500, color: 'var(--accent)' }}>playa</em>
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
              {restaurantes.map(r => (
                <li key={r.id} style={{
                  border: '1px solid var(--line)', borderRadius: 6, padding: '.7rem .85rem',
                  display: 'flex', alignItems: 'baseline', gap: '.75rem',
                }}>
                  <span style={{
                    fontSize: '.6rem', fontWeight: 600, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: 'var(--muted)',
                    padding: '.15rem .45rem', border: '1px solid var(--line)',
                    borderRadius: 100, flexShrink: 0,
                  }}>{r.tipo}</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', flex: 1, minWidth: 0 }}>
                    {r.website ? (
                      <a href={r.website} target="_blank" rel="noopener nofollow" style={{ color: 'var(--ink)' }}>{r.nombre}</a>
                    ) : r.nombre}
                  </span>
                  {r.distancia_m > 0 && (
                    <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
                      {r.distancia_m < 1000 ? `${r.distancia_m} m` : `${(r.distancia_m / 1000).toFixed(1)} km`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Actividades organizadas: widget de GetYourGuide con el nombre del muni. */}
        <section id="actividades" style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
          }}>Actividades organizadas</div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
          }}>
            Excursiones y <em style={{ fontWeight: 500, color: 'var(--accent)' }}>tours</em>
          </h2>
          <GygActivities query={`${pois.nombre}, Spain`} cmp="que-hacer" items={4} />
        </section>

        {/* Enlaces cruzados a otras subpáginas del municipio. */}
        {(tieneBarcos(slug) || tieneMareas(slug) || tienePaginaMuni) && (
          <section style={{
            marginTop: '2rem', padding: '1.15rem 1.25rem',
            border: '1px solid var(--line)', borderRadius: 6,
            background: 'var(--card-bg)',
          }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem',
            }}>Y también</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              {tieneBarcos(slug) && (
                <li>
                  <Link href={`/municipio/${slug}/alquiler-de-barcos`} style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    Alquiler de barcos en {pois.nombre} →
                  </Link>{' '}
                  <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}>salir al mar sin licencia y con licencia.</span>
                </li>
              )}
              {tieneMareas(slug) && ubicacionMareas(slug)?.zona !== 'mediterraneo' && (
                <li>
                  <Link href={`/municipio/${slug}/tabla-de-mareas`} style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    Tabla de mareas de {pois.nombre} →
                  </Link>{' '}
                  <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}>pleamar y bajamar según Puertos del Estado.</span>
                </li>
              )}
              {tienePaginaMuni && (
                <li>
                  <Link href={`/municipio/${slug}`} style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    Todas las playas de {pois.nombre} →
                  </Link>{' '}
                  <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}>bandera, oleaje y servicios de las {playas.length} playas.</span>
                </li>
              )}
            </ul>
          </section>
        )}

        <p style={{ marginTop: '2.5rem', fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          Los puntos de interés proceden de OpenStreetMap (contribuidores voluntarios, licencia ODbL) y están
          dentro de un radio de 3&nbsp;km del centro del municipio. Si echas en falta algo, edítalo en
          osm.org y aparecerá en la próxima actualización de los datos.
          Sidecar generado el {pois.generado}.
        </p>
      </main>
    </>
  )
}
