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
import { guiaUnDia, guiaTresDias, type Guia, type Parada } from '@/lib/guia-municipio'
import { osmRestaurantes } from '@/lib/osm-pois'
import { tieneMareas, ubicacionMareas } from '@/lib/mareas-portus'
import { tieneBarcos } from '@/lib/barcos-municipio'
import { comunidadDe } from '@/lib/comunidad'
import GygActivities from '@/components/GygActivities'
// Leaflet vive en el cliente, pero eso ya lo resuelve el propio componente:
// lleva 'use client' y no toca `document` hasta dentro de un efecto, igual
// que MapaPlayas, que se importa así desde la página del municipio.
//
// NO volver a `dynamic(..., { ssr: false })`: en un componente de servidor
// no está permitido, y tumbó el build de producción entero durante un día
// —«ssr: false is not allowed with next/dynamic in Server Components»—, con
// lo que ni esta página ni /el-tiempo llegaron a desplegarse.
import MapaQueHacer from '@/components/ui/MapaQueHacer'

export const maxDuration = 60
export const revalidate = 3600
// `dynamicParams: true` explícito. Con generateStaticParams devolviendo
// [], TODA la ruta es ISR bajo demanda: Next.js renderiza en el primer
// hit y cachea 1 h. Antes se pre-renderizaba la lista del sidecar en
// build time, y si Vercel construía justo entre dos commits (uno con
// el JSON vacío y otro con el JSON poblado) las páginas quedaban
// permanentemente 404 hasta el siguiente deploy. Ahora depende solo
// del contenido del JSON EN RUNTIME.
export const dynamicParams = true

interface Props { params: Promise<{ slug: string }> }

// Vacío a propósito: no pre-generamos nada en build. El ISR se encarga
// de servir cada slug la primera vez que se pide. Si el sidecar no tiene
// ese slug, notFound() abajo devolverá 404 legítimo.
export function generateStaticParams() { return [] }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pois = await getMunicipioPois(slug)
  if (!pois) return {}
  return {
    title: `Qué hacer, ver y visitar hoy en ${pois.nombre}`,
    description: `Qué ver y qué hacer en ${pois.nombre}: sus museos, monumentos, miradores y parques, las playas mejor equipadas y dos planes cerrados, de un día y de tres.`,
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
  if (trozos.length === 0) return `En ${pois.nombre} hay cosas que hacer además de bañarse. Estas son las principales.`
  return `En ${pois.nombre} y sus alrededores tienes ${trozos.slice(0, -1).join(', ')}${trozos.length > 1 ? ' y ' : ''}${trozos[trozos.length - 1]}. Abajo están en el mapa, y con ellos dos planes ya montados: uno de un día y otro de tres.`
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
          Y otros {items.length - mostrar} más por la zona.
        </div>
      )}
    </section>
  )
}

// Un renderer único para las paradas de guía. Mantiene el timeline visual y
// la accesibilidad (ol/li). Solo pinta lo que la parada trae — sin
// adjetivos, sin prosa vacía.
function ParadaLi({ p, esUltima }: { p: Parada; esUltima: boolean }) {
  const href = p.playa && p.slug ? `/playas/${p.slug}` : p.href
  const titulo = href
    ? <a href={href} target={p.playa ? undefined : '_blank'} rel={p.playa ? undefined : 'noopener nofollow'} style={{
        fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem',
        color: 'var(--ink)', borderBottom: '1px dotted var(--muted)',
      }}>{p.nombre}</a>
    : <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem' }}>{p.nombre}</span>
  return (
    <li style={{
      display: 'grid', gridTemplateColumns: '3.6rem 1fr', gap: '.65rem',
      padding: '.65rem 0',
      borderTop: '1px dashed var(--line)',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: '.78rem', fontWeight: 500, color: 'var(--accent)',
        paddingTop: '.1rem', letterSpacing: '.02em',
      }}>{p.hora}</span>
      <div style={{ minWidth: 0 }}>
        {titulo}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.2rem', fontSize: '.74rem', color: 'var(--muted)' }}>
          <span style={{
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            fontSize: '.6rem', padding: '.1rem .45rem', border: '1px solid var(--line)',
            borderRadius: 100, letterSpacing: '.06em', textTransform: 'uppercase',
          }}>{p.tipo}</span>
          <span>~{formatearDuracion(p.duracionMin)}</span>
          {p.wikipedia && <span>Wikipedia</span>}
          {p.pmr && <span>Accesible</span>}
          {p.banderaAzul && <span>Bandera Azul</span>}
          {p.socorrismo && <span>Socorrismo</span>}
        </div>
        {!esUltima && p.trasladoDescripcion && (
          <div style={{
            fontSize: '.7rem', color: 'var(--muted)', fontStyle: 'italic',
            marginTop: '.3rem', paddingLeft: '.8rem', borderLeft: '1px solid var(--line)',
          }}>
            Al siguiente: {p.trasladoDescripcion}
          </div>
        )}
      </div>
    </li>
  )
}

function formatearDuracion(min: number): string {
  if (min < 60) return `${min} min`
  const h = min / 60
  return h === Math.round(h) ? `${h} h` : `${h.toFixed(1).replace('.', ',')} h`
}

// Renderiza un bloque «Guía» con sus paradas. Si no hay paradas suficientes
// (menos de 3) no se pinta: peor una guía que empiece y acabe en dos sitios.
function BloqueGuia({ guia, subtitulo }: { guia: Guia; subtitulo?: string }) {
  if (guia.paradas.length < 3) return null
  return (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
      {(guia.subtitulo ?? subtitulo) && (
        <div style={{
          padding: '.75rem 1rem 0',
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontWeight: 500, fontSize: '.95rem', color: 'var(--muted)',
        }}>{guia.subtitulo ?? subtitulo}</div>
      )}
      <ol style={{ listStyle: 'none', padding: '0 1rem 1rem', margin: 0 }}>
        {guia.paradas.map((p, i) => (
          <ParadaLi key={`${p.hora}-${p.nombre}`} p={p} esUltima={i === guia.paradas.length - 1} />
        ))}
      </ol>
    </div>
  )
}

// Degradados editoriales para el carrusel superior: mismos que Destacadas usa
// en la home, para mantener el registro visual del sistema.
const GRADIENTES_CARR = [
  'linear-gradient(180deg, #c7d8dc 0%, #a3b9c0 35%, #e8d9b8 55%, #d9c7a0 100%)',
  'linear-gradient(180deg, #a3b6b8 0%, #6b8890 40%, #d4c090 60%, #b8a06a 100%)',
  'linear-gradient(180deg, #d8ccae 0%, #b5a582 45%, #9d8a62 70%, #6b5840 100%)',
  'linear-gradient(180deg, #b8c8c8 0%, #8aa4a8 35%, #c9b890 55%, #a8956c 100%)',
  'linear-gradient(180deg, #d0bba0 0%, #ac9670 40%, #826444 70%, #4e3a22 100%)',
]

interface SlideCarrusel { eyebrow: string; titulo: string; grad: string }

/** Compone el carrusel intercalando playas top con POIs top: mejor playa,
 *  monumento icónico, museo top, segunda playa, faro/mirador. Máximo 5
 *  tiles. Los slots vacíos se saltan. */
function componerCarrusel(
  topPlayas: readonly { nombre: string; bandera?: boolean }[],
  pois: NonNullable<Awaited<ReturnType<typeof getMunicipioPois>>>,
): SlideCarrusel[] {
  const s: SlideCarrusel[] = []
  if (topPlayas[0]) s.push({
    eyebrow: topPlayas[0].bandera ? 'Playa · Bandera Azul' : 'Playa',
    titulo: topPlayas[0].nombre,
    grad: GRADIENTES_CARR[0],
  })
  if (pois.monumentos[0]) s.push({
    eyebrow: pois.monumentos[0].tipo,
    titulo: pois.monumentos[0].nombre,
    grad: GRADIENTES_CARR[1],
  })
  if (pois.museos[0]) s.push({
    eyebrow: pois.museos[0].tipo,
    titulo: pois.museos[0].nombre,
    grad: GRADIENTES_CARR[2],
  })
  if (topPlayas[1]) s.push({
    eyebrow: 'Playa',
    titulo: topPlayas[1].nombre,
    grad: GRADIENTES_CARR[3],
  })
  if (pois.miradores[0]) s.push({
    eyebrow: pois.miradores[0].tipo === 'Faro' ? 'Faro · atardecer' : 'Mirador',
    titulo: pois.miradores[0].nombre,
    grad: GRADIENTES_CARR[4],
  })
  return s.slice(0, 5)
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

  // Itinerarios deterministas (ver src/lib/guia-municipio.ts). Se calculan
  // aquí y se pintan tal cual — el módulo no genera prosa, solo elige y
  // ordena; toda la copy visible se ha escrito en este archivo.
  const gUnDia = guiaUnDia(pois, topPlayas[0] ?? null)
  const gTresDias = guiaTresDias(pois, playas)
  const slidesCarrusel = componerCarrusel(topPlayas, pois)

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
                {/* La comunidad se salta cuando no aporta: en el dataset,
                    Asturias, Murcia, Cantabria y otras cinco repiten nombre
                    con su provincia («Asturias › Asturias»), y las cuatro
                    provincias valencianas y Ourense lo traen como «España»,
                    que no es ninguna comunidad. */}
                {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (
                  <>
                    <Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link>
                    <span aria-hidden="true">›</span>
                  </>
                ) })()}
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

          {/* Carrusel visual: primer vistazo al municipio. Degradados
              editoriales por ahora; cuando el POI tenga tag OSM
              `wikipedia=*`, en un segundo paso se sustituyen por la foto
              principal del artículo de Commons. */}
          {slidesCarrusel.length > 0 && (
            <div style={{
              display: 'flex', gap: '.5rem', overflowX: 'auto',
              scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
              margin: '1.5rem -1.5rem 0', padding: '0 1.5rem .5rem',
              scrollbarWidth: 'none',
            }} aria-label={`Vistazo visual de ${pois.nombre}`} role="region">
              {slidesCarrusel.map((s, i) => (
                <div key={i} style={{
                  flex: '0 0 78%', maxWidth: 320, scrollSnapAlign: 'start',
                  borderRadius: 8, overflow: 'hidden', position: 'relative',
                  aspectRatio: '3 / 2', border: '1px solid var(--line)',
                  background: s.grad,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,.55) 100%)',
                    zIndex: 2,
                  }} aria-hidden="true"/>
                  <div style={{
                    position: 'absolute', bottom: '.65rem', left: '.8rem', right: '.8rem',
                    zIndex: 3, color: '#f5ecd5',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                      fontSize: '.55rem', textTransform: 'uppercase',
                      letterSpacing: '.14em', opacity: .85, marginBottom: '.1rem',
                    }}>{s.eyebrow}</div>
                    <div style={{
                      fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem',
                      letterSpacing: '-.01em', lineHeight: 1.1,
                      textShadow: '0 1px 6px rgba(0,0,0,.35)',
                    }}>{s.titulo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '2.5rem 1.5rem 3rem' }}>

        {/* Mapa de qué hacer: todos los puntos del plan sobre OSM. Ancla
            visual antes de las guías; el usuario ve el contexto y luego
            baja al itinerario. */}
        <section id="mapa" style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
          }}>Sobre el terreno</div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
          }}>
            Todo lo del plan, en el <em style={{ fontWeight: 500, color: 'var(--accent)' }}>mapa</em>
          </h2>
          <MapaQueHacer
            centro={{ lat: pois.lat, lng: pois.lng }}
            playas={topPlayas.map(p => ({ slug: p.slug, nombre: p.nombre, lat: p.lat, lng: p.lng, bandera: p.bandera }))}
            museos={pois.museos}
            monumentos={pois.monumentos}
            miradores={pois.miradores}
            cultura={pois.cultura}
            parques={pois.parques}
          />
        </section>

        {/* Guía de 1 día — solo si el generador consiguió al menos 3 paradas. */}
        {gUnDia.paradas.length >= 3 && (
          <section id="guia-1-dia" style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
            }}>Un plan cerrado</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
            }}>
              Guía de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>1 día</em>
            </h2>
            <BloqueGuia guia={gUnDia} />
            <p style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.5, marginTop: '.75rem' }}>
              El plan lo ordena el mapa: se empieza por lo que está más cerca y se deja la playa
              para el mediodía. Los tiempos de cada parada son aproximados. Mira los horarios antes
              de ir, sobre todo fuera de verano: muchos museos cierran los lunes.
            </p>
          </section>
        )}

        {/* Guía de 3 días — la componen tres guías, una por día. Cada día
            se pinta seguido (mejor SEO que tabs) con su tipología como
            subtítulo en el bloque. */}
        {gTresDias.some(g => g.paradas.length >= 3) && (
          <section id="guia-3-dias" style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
            }}>Fin de semana largo</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
            }}>
              Guía de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>3 días</em>
            </h2>
            {gTresDias.map((g, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--ink)', marginBottom: '.4rem',
                }}>
                  {g.titulo}
                  {g.subtitulo && (
                    <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'var(--muted)', fontSize: '.95rem' }}>
                      {' · ' + g.subtitulo}
                    </span>
                  )}
                </h3>
                <BloqueGuia guia={g} />
              </div>
            ))}
            <p style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.5, marginTop: '.5rem' }}>
              Cada día va de una cosa distinta, para no encadenar tres museos seguidos. Las distancias
              entre paradas son en línea recta, así que andando siempre será algo más.
            </p>
          </section>
        )}

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

        <BloquePois id="museos" eyebrow="Para ver" titulo="Museos, galerías y sitios de visita" items={pois.museos} />
        <BloquePois id="monumentos" eyebrow="Patrimonio" titulo="Monumentos y estatuas" items={pois.monumentos} mostrar={10} />
        <BloquePois id="miradores" eyebrow="Panorámicas" titulo="Miradores y faros" items={pois.miradores} />
        <BloquePois id="cultura" eyebrow="Para una tarde" titulo="Teatros, cines y bibliotecas" items={pois.cultura} />
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
          Los sitios de esta página salen de OpenStreetMap, que escribe gente voluntaria (licencia ODbL),
          y están a menos de 3&nbsp;km del centro del pueblo. Puede que falte alguno o que alguno haya
          cerrado. Si conoces la zona, se corrige en osm.org y aquí aparece en la siguiente
          actualización. Lista revisada el {pois.generado}.
        </p>
      </main>
    </>
  )
}
