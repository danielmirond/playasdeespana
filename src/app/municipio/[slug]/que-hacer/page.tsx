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
import { getMunicipioPois, type Poi } from '@/lib/municipio-pois'
import { guiaUnDia, guiaTresDias, type Guia, type Parada } from '@/lib/guia-municipio'
import { osmRestaurantes } from '@/lib/osm-pois'
import { comunidadDe } from '@/lib/comunidad'
import GygActivities from '@/components/GygActivities'
import DelMunicipio from '@/components/ui/DelMunicipio'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getFotos } from '@/lib/fotos'
import { getVideoYouTube } from '@/lib/videos'
import BeachVideoToggle from '@/components/playa/BeachVideoToggle'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
// Leaflet vive en el cliente, pero eso ya lo resuelve el propio componente:
// lleva 'use client' y no toca `document` hasta dentro de un efecto, igual
// que MapaPlayas, que se importa así desde la página del municipio.
//
// NO volver a `dynamic(..., { ssr: false })`: en un componente de servidor
// no está permitido, y tumbó el build de producción entero durante un día
// —«ssr: false is not allowed with next/dynamic in Server Components»—, con
// lo que ni esta página ni /el-tiempo llegaron a desplegarse.
import MapaQueHacer from '@/components/ui/MapaQueHacer'
import HeroMunicipio from '@/components/municipio/HeroMunicipio'
import NavMunicipio from '@/components/municipio/NavMunicipio'
import TarjetaSitio, { TarjetaPlaya } from '@/components/municipio/TarjetaSitio'
import Pictograma from '@/components/municipio/Pictograma'
import mun from '@/components/municipio/Municipio.module.css'

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

// Una parada del plan como tarjeta: foto (de la playa o del sitio) con la
// hora encima, o el pictograma del tipo sobre tinta cuando no hay foto.
function ParadaTarjeta({ p, foto }: { p: Parada; foto: { url: string } | null }) {
  const href = p.playa && p.slug ? `/playas/${p.slug}` : p.href
  const cuerpo = (
    <>
      <div className={mun.paradaFoto} style={foto ? undefined : { background: p.playa ? 'var(--mar, #2d5266)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {foto
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={foto.url} alt="" loading="lazy" decoding="async" />
          : <Pictograma tipo={p.playa ? 'playa' : p.hueco ? 'comida' : p.tipo} size={40} />}
        <span className={mun.paradaHora}>{p.hora}</span>
      </div>
      <div className={mun.paradaNombre}>{p.nombre}</div>
      <div className={mun.paradaMeta}>
        {p.hueco ? 'cerca de la última parada' : p.tipo} · {formatearDuracion(p.duracionMin)}{p.pmr ? ' · accesible' : ''}{p.banderaAzul ? ' · Bandera Azul' : ''}
        {p.trasladoDescripcion && <><br />{p.trasladoDescripcion}</>}
      </div>
    </>
  )
  return (
    <li className={mun.parada}>
      {href
        ? <a href={href} target={p.playa ? undefined : '_blank'} rel={p.playa ? undefined : 'noopener nofollow'} style={{ display: 'contents', color: 'inherit' }}>{cuerpo}</a>
        : cuerpo}
    </li>
  )
}

// Una categoría de sitios en rejilla de tarjetas. Sin datos, sin sección.
function SeccionSitios({ id, titulo, items, mostrar = 6 }: { id: string; titulo: string; items: Poi[]; mostrar?: number }) {
  if (!items.length) return null
  return (
    <section id={id}>
      <div className={mun.seccionCab}>
        <h2 className={mun.h2}>{titulo}</h2>
        {items.length > mostrar && <span className={mun.meta}>{mostrar} de {items.length}</span>}
      </div>
      <div className={mun.sitios}>
        {items.slice(0, mostrar).map(p => <TarjetaSitio key={`${p.nombre}-${p.lat}`} p={p} />)}
      </div>
      {items.length > mostrar && <div style={{ marginTop: '.6rem', fontSize: '.8rem', color: 'var(--muted)' }}>Y otros {items.length - mostrar} más por la zona.</div>}
    </section>
  )
}

function formatearDuracion(min: number): string {
  if (min < 60) return `${min} min`
  const h = min / 60
  return h === Math.round(h) ? `${h} h` : `${h.toFixed(1).replace('.', ',')} h`
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
  const enlaces = await enlacesMunicipio(slug, pois.nombre)
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
  const gUnDia = guiaUnDia(pois, topPlayas[0] ?? null, playas)
  const gTresDias = guiaTresDias(pois, playas)
  // La foto de cada playa del carrusel: la real del sidecar, con autor. Si
  // la playa no tiene entrada, getFotos podría ir a la red; para la portada
  // de un municipio se acepta, la Data Cache lo amortigua.
  const topConFoto = await Promise.all(topPlayas.slice(0, 3).map(async p => {
    const fotos = await getFotos(p.nombre, p.municipio, p.lat, p.lng, p.provincia, p.slug)
    const real = fotos.find(f => f.fuente !== 'generica')
    return { ...p, foto: real ? { url: real.thumb, autor: real.autor } : null }
  }))
  const heroFoto = topConFoto.find(p => p.foto)?.foto
    ? { url: topConFoto.find(p => p.foto)!.foto!.url, autor: topConFoto.find(p => p.foto)!.foto!.autor, alt: `${topConFoto.find(p => p.foto)!.nombre}, ${pois.nombre}` }
    : null
  // La foto de cada parada del plan: la de la playa si es playa, la del sitio
  // (Wikipedia) si la tiene. Sin foto, la tarjeta lleva el pictograma.
  const todosPois = [...pois.museos, ...pois.monumentos, ...pois.miradores, ...pois.cultura, ...pois.parques]
  const fotoDeParada = (p: Parada): { url: string } | null => {
    if (p.playa && p.slug) return topConFoto.find(x => x.slug === p.slug)?.foto ?? null
    // La guía limpia el nombre («A;B», «A / B» → «A»), así que se casa por prefijo.
    const poi = todosPois.find(x => x.nombre === p.nombre || x.nombre.startsWith(p.nombre))
    return poi?.foto ? { url: poi.foto.url } : null
  }
  // Un vídeo del municipio, con la misma búsqueda y los mismos filtros que
  // usa la ficha de playa (dron, corto, en español, canal no vetado). Cache
  // de 30 días en KV: la cuota de YouTube son 100 búsquedas al día y se
  // reparte con las fichas. Si no hay clave o no hay vídeo, no hay bloque.
  const video = await getVideoYouTube(pois.nombre, '', `municipio-${slug}`).catch(() => null)

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

      <HeroMunicipio
        foto={heroFoto}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {municipio && provinciaSlug && (<>
            {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
            <Link href={`/provincia/${provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          </>)}
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{pois.nombre}</Link> : <span>{pois.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Qué hacer</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio?.provincia}{playas.length ? ` · ${playas.length} ${playas.length === 1 ? 'playa' : 'playas'}` : ''} · {pois.total} sitios
        </div>
        <h1 className={mun.heroTitulo}>Qué hacer en {pois.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>{respuesta}</p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="queHacer" />

      {/* Chips: saltan a cada sección; el recuento es lo que hay en la página. */}
      <div className={mun.chips}>
        {playas.length > 0 && <a href="#playas" className={mun.chip}><span className={mun.chipPunto} style={{ background: 'var(--mar, #2d5266)' }} />Playas {playas.length}</a>}
        {pois.alrededores.length > 0 && <a href="#alrededores" className={mun.chip}>Alrededores</a>}
        {pois.museos.length > 0 && <a href="#museos" className={mun.chip}><span className={mun.chipPunto} style={{ background: 'var(--accent)' }} />Museos {pois.museos.length}</a>}
        {pois.monumentos.length > 0 && <a href="#monumentos" className={mun.chip}><span className={mun.chipPunto} style={{ background: 'var(--aceptable, #c48a1e)' }} />Monumentos {pois.monumentos.length}</a>}
        {pois.miradores.length > 0 && <a href="#miradores" className={mun.chip}>Miradores {pois.miradores.length}</a>}
        {pois.parques.length > 0 && <a href="#parques" className={mun.chip}><span className={mun.chipPunto} style={{ background: 'var(--excelente, #3d6b1f)' }} />Parques {pois.parques.length}</a>}
        {pois.cultura.length > 0 && <a href="#cultura" className={mun.chip}>Teatros y cines {pois.cultura.length}</a>}
        {restaurantes.length > 0 && <a href="#comer" className={mun.chip}>Comer</a>}
      </div>

      <main className={mun.cuerpo}>

        {/* El plan: la herramienta de la página, en tarjetas con foto. */}
        {gUnDia.paradas.length >= 3 && (
          <section id="guia-1-dia">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Un día en {pois.nombre}</h2>
              <span className={mun.meta}>{gUnDia.paradas.length} paradas · {formatearDuracion(gUnDia.paradas.reduce((a, x) => a + x.duracionMin, 0))}</span>
            </div>
            <ol className={mun.plan} style={{ listStyle: 'none', margin: 0 }}>
              {gUnDia.paradas.map(p => <ParadaTarjeta key={`${p.hora}-${p.nombre}`} p={p} foto={fotoDeParada(p)} />)}
            </ol>
            <p style={{ margin: '.75rem 0 0', fontSize: '.78rem', lineHeight: 1.5, color: 'var(--muted)' }}>
              El plan lo ordena el mapa: la mañana se hace andando alrededor del sitio principal y la tarde se pasa en la playa
              que queda más cerca. Las horas suman lo que se tarda en llegar, pero son aproximadas. Mira los horarios antes de ir,
              sobre todo fuera de verano: muchos museos cierran los lunes.
            </p>
          </section>
        )}

        {gTresDias.every(g => g.paradas.length >= 3) && (
          <section id="guia-3-dias">
            <div className={mun.seccionCab}><h2 className={mun.h2}>Tres días en {pois.nombre}</h2><span className={mun.meta}>fin de semana largo</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {gTresDias.map((g, i) => (
                <div key={i}>
                  <h3 style={{ margin: '0 0 .5rem', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700 }}>
                    {g.titulo}{g.subtitulo && <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'var(--muted)' }}> · {g.subtitulo}</span>}
                  </h3>
                  <ol className={mun.plan} style={{ listStyle: 'none', margin: 0 }}>
                    {g.paradas.map(p => <ParadaTarjeta key={`${p.hora}-${p.nombre}`} p={p} foto={fotoDeParada(p)} />)}
                  </ol>
                </div>
              ))}
            </div>
            <p style={{ margin: '.75rem 0 0', fontSize: '.78rem', lineHeight: 1.5, color: 'var(--muted)' }}>
              Cada día es una zona: el casco, la mejor playa y lo que queda lejos del centro. Así no se cruza el municipio
              tres veces. Las distancias son en línea recta, así que andando siempre será algo más.
            </p>
          </section>
        )}
        {gUnDia.paradas.length < 3 && (
          <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--muted)' }}>Con {pois.total} sitios no hay plan que montar, y no se inventa: {pois.nombre} es un pueblo de playas.</p>
        )}

        <section id="mapa">
          <div className={mun.seccionCab}><h2 className={mun.h2}>Todo, en el <em>mapa</em></h2></div>
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

        {topConFoto.length > 0 && (
          <section id="playas">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Sus <em>playas</em></h2>
              {tienePaginaMuni && <Link href={`/municipio/${slug}`} style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Las {playas.length} →</Link>}
            </div>
            <div className={mun.playas}>
              {topConFoto.map(p => <TarjetaPlaya key={p.slug} slug={p.slug} nombre={p.nombre} foto={p.foto} bandera={p.bandera} socorrismo={p.socorrismo} accesible={p.accesible} parking={p.parking} />)}
            </div>
          </section>
        )}

        {video && (
          <section id="video">
            <div className={mun.seccionCab}><h2 className={mun.h2}>{pois.nombre} desde el <em>aire</em></h2></div>
            <BeachVideoToggle video={video} nombre={pois.nombre} />
          </section>
        )}

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

        <SeccionSitios id="museos" titulo="Museos, galerías y sitios de visita" items={pois.museos} />
        <SeccionSitios id="monumentos" titulo="Monumentos y estatuas" items={pois.monumentos} />
        <SeccionSitios id="miradores" titulo="Miradores y faros" items={pois.miradores} />
        <SeccionSitios id="parques" titulo="Parques y jardines" items={pois.parques} />
        <SeccionSitios id="cultura" titulo="Teatros, cines y bibliotecas" items={pois.cultura} />

        {/* Alrededores: lo que cualquier guía cuenta y el radio de 3 km
            dejaba fuera. Solo sitios con artículo en Wikipedia, con la
            distancia al centro del pueblo en el chip. */}
        {pois.alrededores.length > 0 && (
          <section id="alrededores">
            <div className={mun.seccionCab}><h2 className={mun.h2}>A menos de <em>25 km</em></h2><span className={mun.meta}>para un día fuera</span></div>
            <div className={mun.sitios}>
              {pois.alrededores.slice(0, 6).map(p => <TarjetaSitio key={`${p.nombre}-${p.lat}`} p={{ ...p, tipo: `${p.tipo} · ${p.km.toFixed(0)} km` }} />)}
            </div>
          </section>
        )}

        {restaurantes.length > 0 && (
          <section id="comer">
            <div className={mun.seccionCab}><h2 className={mun.h2}>Restaurantes junto a la <em>playa</em></h2><span className={mun.meta}>cerca de {topPlayas[0]?.nombre}</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
              {restaurantes.map(r => (
                <li key={r.id} style={{ borderRadius: 12, padding: '.7rem .9rem', background: 'var(--card-bg, var(--surface))', display: 'flex', alignItems: 'baseline', gap: '.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>{r.tipo}</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', flex: 1, minWidth: 0 }}>
                    {r.website ? <a href={r.website} target="_blank" rel="noopener nofollow" style={{ color: 'var(--ink)' }}>{r.nombre}</a> : r.nombre}
                  </span>
                  {r.distancia_m > 0 && <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{r.distancia_m < 1000 ? `${r.distancia_m} m` : `${(r.distancia_m / 1000).toFixed(1)} km`}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="tours">
          <div className={mun.seccionCab}><h2 className={mun.h2}>Excursiones y <em>tours</em></h2></div>
          <GygActivities query={`${pois.nombre}, Spain`} cmp="que-hacer" items={4} />
        </section>

        <Hueco zona="cierre" bloque={SLOTS.cierre} />

        <DelMunicipio nombre={pois.nombre} enlaces={enlaces} actual="queHacer" />

        <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          Los sitios de esta página salen de OpenStreetMap, que escribe gente voluntaria (licencia ODbL),
          y están a menos de 3&nbsp;km del centro del pueblo. Puede que falte alguno o que alguno haya
          cerrado. Si conoces la zona, se corrige en osm.org y aquí aparece en la siguiente
          actualización. Lista revisada el {pois.generado}.
          {(pois.museos.concat(pois.monumentos, pois.cultura, pois.miradores, pois.parques)).some(p => p.resumen) && (
            <> Los resúmenes de los sitios están escritos a partir de sus artículos en Wikipedia.</>
          )}
        </p>
      </main>
    </>
  )
}
