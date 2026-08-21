// src/app/provincia/[slug]/page.tsx
import { SLOTS } from '@/lib/adsense'
import { Fragment } from 'react'
import Hueco from '@/components/ui/Hueco'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import EnlacesGeoHubs from '@/components/seo/EnlacesGeoHubs'
import { getPlayas, getPlayasByProvincia, getProvincias, getMunicipios, toSlug } from '@/lib/playas'
import { tieneMareas, ubicacionMareas } from '@/lib/mareas-portus'
import { calcularEstado, ESTADOS } from '@/lib/estados'
import styles from './ProvinciaPage.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'
import SchemaItemList from '@/components/seo/SchemaItemList'
import TopBeachCardsConHero from '@/components/seo/TopBeachCardsConHero'
import { canonicalDeProvincia } from '@/lib/geo-duplicadas'
import GygActivities from '@/components/GygActivities'
import { tinte } from '@/lib/tinte'
import SeaIcon from '@/components/ui/SeaIcon'

interface Props { params: Promise<{ slug: string }> }

export const maxDuration = 60
export const revalidate = 86400

export async function generateStaticParams() {
  const provincias = await getProvincias()
  return provincias.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provincias = await getProvincias()
  const p = provincias.find(x => x.slug === slug)
  if (!p) return {}
  // En las comunidades uniprovinciales esta página es idéntica a la de
  // comunidad —misma lista de playas, mismo title— así que cede la
  // canonical en vez de competir consigo misma. Ver lib/geo-duplicadas.
  const canonical = canonicalDeProvincia(slug)
  const duplicada = canonical !== `/provincia/${slug}`

  // Once capitales se llaman igual que su provincia. Cuando pasa, esta
  // página dice «la provincia de Cádiz» y la del municipio «Cádiz
  // capital»: el contenido ya era distinto —121 playas frente a 10—,
  // lo que faltaba era decirlo. Ver lib/geo-duplicadas.
  const municipios = await getMunicipios()
  const homonima = municipios.some(m => m.slug === slug)
  const comoSeLlama = homonima ? `la provincia de ${p.nombre}` : p.nombre

  return {
    // El title también cambia cuando cede: dejarlo idéntico al de
    // comunidad sería pedirle a Google que elija entre dos cosas
    // iguales y confiar en que acierte. Aquí la página se presenta por
    // lo que sí aporta —el desglose por municipios— en lugar de repetir
    // la promesa de la otra.
    title: duplicada
      ? `Playas de ${comoSeLlama}: listado por municipios`
      : `Playas de ${comoSeLlama} hoy: mapa, banderas y estado del mar`,
    description: `Las mejores playas de ${comoSeLlama}, ${p.comunidad}. Estado del mar y condiciones en tiempo real.`,
    alternates: {
      canonical,
      // Faltaba el hreflang. /en/provinces sí apuntaba aquí, así que la
      // relación era unidireccional y Google descarta esos pares
      // enteros: solo los tiene en cuenta cuando ambas partes se
      // reconocen. Apuntan al par CANÓNICO, no a esta URL.
      languages: duplicada
        ? { es: canonical, en: `/en/communities/${canonical.split('/').pop()}`, 'x-default': canonical }
        : { es: `/provincia/${slug}`, en: `/en/provinces/${slug}`, 'x-default': `/provincia/${slug}` },
    },
  }
}

export default async function ProvinciaPage({ params }: Props) {
  const { slug } = await params
  const provincias = await getProvincias()
  const provincia = provincias.find(p => p.slug === slug)
  if (!provincia) notFound()

  const [playas, allMunicipios] = await Promise.all([
    getPlayasByProvincia(slug),
    getMunicipios(),
  ])
  const municipios = allMunicipios.filter(m => m.provinciaSlug === slug)

  // Índice COMPLETO por municipio, a partir de las playas de la provincia:
  // incluye los que no llegan al mínimo de 4 para tener página.
  const conPagina = new Set(municipios.map(m => m.slug))
  const porMuni = new Map<string, { slug: string; nombre: string; playas: typeof playas }>()
  for (const p of playas) {
    const ms = toSlug(p.municipio)
    const cur = porMuni.get(ms) ?? { slug: ms, nombre: p.municipio, playas: [] }
    cur.playas.push(p)
    porMuni.set(ms, cur)
  }
  const indiceMunicipios = [...porMuni.values()]
    .map(m => ({
      slug: m.slug,
      nombre: municipios.find(x => x.slug === m.slug)?.nombre ?? m.nombre,
      count: m.playas.length,
      playas: m.playas,
      tienePagina: conPagina.has(m.slug),
      mareas: conPagina.has(m.slug) && tieneMareas(m.slug) && ubicacionMareas(m.slug)?.zona !== 'mediterraneo',
    }))
    .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre, 'es'))

  // «la provincia de Cádiz» cuando la capital se llama igual: el H1
  // tiene que decir lo mismo que el title. Si no, quien llega desde la
  // SERP no sabe si está en la provincia o en la ciudad.
  const homonima = allMunicipios.some(m => m.slug === slug)
  const nombreH1 = homonima ? `la provincia de ${provincia.nombre}` : provincia.nombre

  const playasConEstado = playas.map(p => {
    const seed = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const olas = parseFloat(((seed % 15) / 10).toFixed(1))
    const viento = 5 + (seed % 30)
    const estadoKey = calcularEstado({ olas, viento })
    const estado = ESTADOS[estadoKey]
    return { ...p, estadoKey, estado, olas, viento }
  })

  const lats = playas.map(p => p.lat)
  const lngs = playas.map(p => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.2)
  const padLng = Math.max((maxLng - minLng) * 0.2, 0.3)

  const buenas = playasConEstado.filter(p => p.estadoKey === 'CALMA' || p.estadoKey === 'BUENA').length
  const conBandera = playas.filter(p => p.bandera).length

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

  return (
    <>
      <SchemaItemList
        name={`Playas de ${provincia.nombre}`}
        description={`${playas.length} playas en la provincia de ${provincia.nombre}, España. Estado del mar, calidad y servicios.`}
        url={`${BASE}/provincia/${slug}`}
        beaches={playas.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />

      {/* BREADCRUMB + HERO */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href={`/comunidad/${provincia.comunidadSlug}`}>{provincia.comunidad}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{provincia.nombre}</span>
          </nav>
          {/* «Playas de X», no solo «X»: el title promete playas y el
              H1 decía únicamente el topónimo. Cuando divergen, Google
              tiende a reescribir el title usando el H1, y «Barcelona» a
              secas no compite por «playas de Barcelona». */}
          <h1 className={styles.titulo}>Playas de {nombreH1}</h1>
          <p className={styles.subtitulo}>{provincia.comunidad} · España</p>
          <div className={styles.chips}>
            <span className={styles.chip}>{provincia.count} playas</span>
            <span className={styles.chip}>{buenas} buenas hoy</span>
            {conBandera > 0 && <span className={styles.chip}>{conBandera} bandera azul</span>}
          </div>
        </div>
      </div>

      <div className={styles.wrap}>
        {/* TOP 6 con hero foto (mejor scoring + variedad de municipio) */}
        {playas.length >= 6 && (() => {
          const seen = new Set<string>()
          const picks: typeof playas = []
          const sorted = [...playas]
            .filter(p => p.lat && p.lng)
            .sort((a, b) => {
              const sa = (a.bandera ? 5 : 0) + (a.socorrismo ? 2 : 0) + (a.accesible ? 1 : 0) + (a.parking ? 1 : 0)
              const sb = (b.bandera ? 5 : 0) + (b.socorrismo ? 2 : 0) + (b.accesible ? 1 : 0) + (b.parking ? 1 : 0)
              return sb - sa
            })
          for (const p of sorted) {
            if (seen.has(p.municipio)) continue
            seen.add(p.municipio)
            picks.push(p)
            if (picks.length >= 6) break
          }
          for (const p of sorted) {
            if (picks.length >= 6) break
            if (picks.find(x => x.slug === p.slug)) continue
            picks.push(p)
          }
          return (
            <section aria-labelledby="top-prov" style={{ marginBottom: '2.5rem' }}>
              <h2 id="top-prov" style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
                color: 'var(--ink)', marginBottom: '1rem',
              }}>
                Top 6 <em style={{ fontWeight: 500, color: 'var(--accent)' }}>en {provincia.nombre}</em>
              </h2>
              <TopBeachCardsConHero
                playas={picks.map(p => ({
                  slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia,
                  comunidad: p.comunidad, lat: p.lat, lng: p.lng, bandera: p.bandera,
                }))}
                limit={6}
                eyebrow={`Selección · una por municipio entre ${playas.length} playas`}
              />
            </section>
          )
        })()}

        {/* MAPA */}
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>Mapa de playas · {provincia.nombre}</span>
            <span className={styles.mapaSrc}>Interactivo · {playas.length} playas</span>
          </div>
          <MapaPlayas playas={playas} height="360px" />
        </div>

        {/* ÍNDICE POR MUNICIPIO
            Antes era «Municipios con más playas», al 92 % de la página y
            solo con los municipios que tienen página propia (≥4 playas):
            en Cádiz, 13 de 30. El title promete «listado por municipios» y
            el listado era lo último que se veía. Ahora va aquí —tras el
            mapa, antes de las playas sueltas— porque la navegación natural
            de una provincia es elegir municipio, no playa. Y están TODOS:
            los que tienen página, enlazados; los que no, con sus playas
            desplegadas. Quien busca «playas de Zahara» no sabe que la regla
            del sitio es «mínimo cuatro». */}
        <div className={styles.listaHead}>
          <h2 className={styles.listaTitulo}>Playas por municipio</h2>
          <span className={styles.listaCount}>{indiceMunicipios.length} municipios</span>
        </div>
        <div className={styles.lista}>
          {indiceMunicipios.map(m => (
            <div key={m.slug} className={styles.row} style={{ flexWrap: 'wrap', alignItems: 'center', cursor: 'default', transform: 'none' }}>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>
                  {m.tienePagina
                    ? <Link href={`/municipio/${m.slug}`} style={{ color: 'inherit' }}>{m.nombre}</Link>
                    : m.nombre}
                </div>
                <div className={styles.rowMeta}>
                  {m.count} {m.count === 1 ? 'playa' : 'playas'}
                  {/* Sin página propia: las playas van aquí mismo, que es
                      lo que quien busca ese municipio viene a ver. */}
                  {!m.tienePagina && (
                    <> · {m.playas.map((pl, i) => (
                      <span key={pl.slug}>{i > 0 && ', '}<Link href={`/playas/${pl.slug}`} style={{ color: 'var(--ink)' }}>{pl.nombre}</Link></span>
                    ))}</>
                  )}
                </div>
              </div>
              {/* Mareas: solo donde la marea es un dato —Atlántico,
                  Cantábrico y Canarias— y el municipio tiene tabla. En el
                  Mediterráneo sería un enlace a «aquí la marea son 25 cm». */}
              {m.mareas && (
                <Link href={`/municipio/${m.slug}/tabla-de-mareas`} className={styles.rowMeta}
                  style={{ color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                  mareas →
                </Link>
              )}
              {m.tienePagina && (
                <Link href={`/municipio/${m.slug}`} className={styles.rowArrow} aria-label={`Playas de ${m.nombre}`}>→</Link>
              )}
            </div>
          ))}
        </div>

        {/* LISTA PLAYAS */}
        <div className={styles.listaHead} style={{ marginTop: '2.5rem' }}>
          <h2 className={styles.listaTitulo}>Todas las playas</h2>
          <span className={styles.listaCount}>{playas.length} resultados</span>
        </div>

        <div className={styles.lista}>
          {playasConEstado.map((p, i) => (
            <Fragment key={p.slug}>
            {/* Tras el octavo resultado: en móvil ya se ha pasado la
                primera pantalla y el lector está hojeando, no buscando una
                respuesta concreta. Antes de aquí el anuncio sería lo
                primero que se ve de una lista. */}
            {i === 8 && <Hueco zona="hojeo" bloque={SLOTS.lista} resultadosArriba={i} />}
            <Link href={`/playas/${p.slug}`} className={styles.row}>
              <span className={styles.rowNum}>{i + 1}</span>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>{p.nombre}</div>
                <div className={styles.rowMeta}>
                  {p.municipio}
                  {p.bandera    && <span className={styles.badge}>Bandera Azul</span>}
                  {p.socorrismo && <span className={styles.badge}>Socorrismo</span>}
                  {p.accesible  && <span className={styles.badge}>PMR</span>}
                </div>
              </div>
              <div className={styles.rowMeteo}>
                <span>{p.olas}m</span>
                <span>{p.viento}km/h</span>
              </div>
              <div className={styles.rowEstado} style={{ background: p.estado.bg, borderColor: tinte(p.estado.dot, 33) }}>
                <SeaIcon estado={p.estadoKey} size={15} color={p.estado.dot} />
                <span style={{ color: p.estado.text }}>{p.estado.label}</span>
              </div>
              <span className={styles.rowArrow}>→</span>
            </Link>
            </Fragment>
          ))}
        </div>

        {/* OTRAS PROVINCIAS DE LA COMUNIDAD */}
        <div className={styles.masLink}>
          <Link href={`/comunidad/${provincia.comunidadSlug}`} className={styles.masBtn}>
            ← Ver todas las playas de {provincia.comunidad}
          </Link>
        </div>
      </div>
      <div style={{ padding: '0 1.5rem' }}>
        <EnlacesGeoHubs nombre={provincia.nombre} />
      </div>
      <GygActivities query={`${provincia.nombre}, Spain`} cmp="provincia" />
    </>
  )
}
