// /municipio/[slug]/snorkel-buceo — qué vida marina se ha registrado en
// el litoral del municipio, con nombre y número de registros.
//
// POR QUÉ POR MUNICIPIO Y NO EN LA FICHA. Se midió antes de escribirla:
// filtrando a la profundidad que un bañista alcanza, 10 de cada 25 playas
// no tenían NINGUNA especie y la mediana era 1. Por municipio la mediana
// sube a 8 y los buenos pasan de 100. OBIS agrega campañas científicas y
// avistamientos en puntos concretos; su resolución es la de un tramo de
// costa, no la de una playa. Poner esto en la ficha habría sido atribuirle
// a una playa lo que se vio a cuatro kilómetros.
//
// POR QUÉ SOLO EN 118 MUNICIPIOS. De los 584 con dos playas o más, 231 no
// tienen ni una especie registrada y otros 235 se quedan por debajo de 15.
// Publicar los 584 serían 466 páginas vacías o flojas arrastrando a las
// 118 que sí dicen algo.
//
// LO QUE NO SE DICE. Que vayas a verlas. Un registro es que alguien
// documentó la especie ahí, no una promesa: eso se escribe en la página,
// no se deja a la interpretación del lector.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getMunicipios, getPlayasByMunicipio, MIN_PLAYAS_MUNICIPIO } from '@/lib/playas'
import { getVidaMarina, porGrupo, GRUPOS } from '@/lib/vida-marina'
import { getBuceo } from '@/lib/buceo-osm'
import { getCentrosBuceo } from '@/lib/buceo-places'
import { ortofoto } from '@/lib/ortofoto'
import Image from 'next/image'
import GygActivities from '@/components/GygActivities'
import NOMBRES from '@/data/nombres-especies.json'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { comunidadDe } from '@/lib/comunidad'
import { migaMunicipio } from '@/lib/miga-municipio'
import { getFotos } from '@/lib/fotos'
import HeroMunicipio from '@/components/municipio/HeroMunicipio'
import NavMunicipio from '@/components/municipio/NavMunicipio'
import mun from '@/components/municipio/Municipio.module.css'

export const revalidate = 604800     // OBIS se cosecha, no cambia a diario
export const maxDuration = 30
export const dynamicParams = true
export function generateStaticParams() { return [] }

const comun = (sp: string): string | null => (NOMBRES as Record<string, string | null>)[sp] ?? null

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const v = await getVidaMarina(slug)
  if (!v) return {}
  return {
    title: `Snorkel y buceo en ${v.nombre}: especies y vida marina`,
    description: `Las ${v.total} especies registradas en el litoral de ${v.nombre}: peces, pulpos, estrellas y corales, con cuántas veces se ha documentado cada una. Datos de OBIS.`,
    alternates: { canonical: `/municipio/${slug}/snorkel-buceo` },
  }
}

export default async function SnorkelBuceoPage({ params }: Props) {
  const { slug } = await params
  const vida = await getVidaMarina(slug)
  if (!vida) notFound()

  const municipios = await getMunicipios(1)
  const municipio = municipios.find(m => m.slug === slug)
  if (!municipio) notFound()

  const playas = await getPlayasByMunicipio(slug)
  const tienePaginaMuni = municipio.count >= MIN_PLAYAS_MUNICIPIO
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)
  const grupos = porGrupo(vida.especies)
  const buceo = await getBuceo(slug)
  const centros = await getCentrosBuceo(slug)

  const peces = vida.especies.filter(e => e.clase === 'Teleostei')

  const playaHero = playas[0]
  const fotoHero = playaHero
    ? (await getFotos(playaHero.nombre, playaHero.municipio, playaHero.lat, playaHero.lng, playaHero.provincia, playaHero.slug)).find(f => f.fuente !== 'generica')
    : null

  // Ortofoto centrada en la PLAYA, no en el punto de inmersión. Probado:
  // el PNOA se acaba mar adentro y un encuadre sobre las Illes Medes sale
  // con un cuarto de la imagen en blanco. Sobre la costa siempre hay
  // cobertura, y el color del agua en los bajos se ve igual.
  const orto = playaHero ? ortofoto(playaHero.lat, playaHero.lng, 2.4, 900) : null

  const nombrar = (n: string) => comun(n) ?? null

  const faq = [
    {
      q: `¿Qué peces se ven haciendo snorkel en ${municipio.nombre}?`,
      a: `En su litoral se han registrado ${peces.length} especies de peces. Las más documentadas son ${peces.slice(0, 4).map(e => nombrar(e.n) ?? e.n).join(', ')}. Son registros de presencia recogidos en OBIS: dicen que la especie se ha documentado ahí, no que vaya a aparecer el día que te metas.`,
    },
    {
      q: `¿Cuántas especies marinas hay registradas en ${municipio.nombre}?`,
      a: `${vida.total} en total. Se cuentan solo las que alguien reconoce bajo el agua: peces, tiburones y rayas, pulpos y sepias, estrellas y erizos, corales y anémonas. El plancton y las algas quedan fuera.`,
    },
    {
      q: `¿De dónde salen estos datos?`,
      a: `De OBIS (Ocean Biodiversity Information System), que agrega campañas científicas y avistamientos verificados de todo el mundo. Se consulta una caja que cubre el litoral del municipio y tres kilómetros mar adentro. Cada especie lleva cuántos registros tiene en esa zona.`,
    },
  ]
  const miga = migaMunicipio({
    slug, nombre: municipio.nombre, provincia: municipio.provincia,
    provinciaSlug: municipio.provinciaSlug, comunidad: municipio.comunidad,
    seccion: 'Snorkel y buceo', seccionHref: `/municipio/${slug}/snorkel-buceo`, conRaiz: tienePaginaMuni,
  })
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(miga) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroMunicipio
        foto={fotoHero ? { url: fotoHero.url, autor: fotoHero.autor, alt: `${playaHero!.nombre}, ${municipio.nombre}` } : null}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
          <Link href={`/provincia/${municipio.provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link> : <span>{municipio.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Snorkel y buceo</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio.provincia} · {vida.total} especies · litoral
        </div>
        <h1 className={mun.heroTitulo}>Snorkel y buceo en {municipio.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>
          En su litoral se han registrado <b>{vida.total} especies</b>,
          {peces.length > 0 && <> {peces.length} de ellas peces</>}. Son registros documentados, no una lista
          de lo que verás: dicen dónde se ha visto cada especie y cuántas veces.
        </p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="snorkel" />

      <main className={mun.cuerpo}>
        {orto && (
          <section id="aerea" style={{ marginBottom: '2rem' }}>
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>El litoral desde <em>arriba</em></h2>
              <span className={mun.meta}>ortofoto del PNOA · IGN</span>
            </div>
            <Image
              src={orto.url} alt={`Vista aérea del litoral de ${municipio.nombre}`}
              width={orto.lado} height={orto.lado} unoptimized={false}
              style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid var(--line)' }}
            />
            <p style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.5rem', lineHeight: 1.55 }}>
              Unos 2,4 km de costa alrededor de {playaHero?.nombre}. El color del agua delata el fondo:
              turquesa donde hay arena o roca somera, azul oscuro donde cae. Ortofoto del Plan Nacional
              de Ortofotografía Aérea, <a href="https://www.ign.es" target="_blank" rel="noopener">IGN</a>.
            </p>
          </section>
        )}

        {/* CENTROS. De Google Places, no de OSM: OpenStreetMap tiene 87
            escuelas en toda España y Google 802 en 316 municipios, con
            nota y reseñas. Para una sección que se usa para decidir dónde
            reservar, esa diferencia es la sección entera. Los puntos de
            inmersión siguen viniendo de OSM, que es quien los tiene. */}
        {centros.length ? (
          <section id="centros" style={{ marginBottom: '2rem' }}>
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Centros de <em>buceo</em></h2>
              <span className={mun.meta}>{centros.length} · Google</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.55rem' }}>
              {centros.map(c => (
                <li key={c.id} style={{ borderBottom: '1px solid var(--line)', padding: '.6rem 0', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {c.web
                        ? <a href={c.web} target="_blank" rel="noopener nofollow" style={{ color: 'inherit' }}>{c.n}</a>
                        : c.n}
                    </span>
                    {/* La certificación solo se marca cuando el propio
                        centro la pone en su nombre. Google no publica un
                        campo de titulación y deducirla sería ponerle un
                        sello a quien no lo ha dicho. */}
                    {c.padi && <span style={{ marginLeft: '.4rem', fontSize: '.64rem', letterSpacing: '.1em', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 4, padding: '.1rem .3rem' }}>PADI</span>}
                    <span style={{ display: 'block', fontSize: '.8rem', color: 'var(--muted)', marginTop: '.15rem' }}>
                      {c.playa && c.m != null && <>a {c.m < 1000 ? `${c.m} m` : `${(c.m / 1000).toFixed(1)} km`} de {c.playa}</>}
                      {c.tel && <> · <a href={`tel:${c.tel.replace(/\s+/g, '')}`} style={{ color: 'var(--accent)' }}>{c.tel}</a></>}
                    </span>
                  </span>
                  {c.nota != null && (
                    <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.78rem', color: 'var(--muted)', flexShrink: 0, textAlign: 'right' }}>
                      {String(c.nota).replace('.', ',')}
                      <span style={{ display: 'block', fontSize: '.66rem' }}>({c.resenas.toLocaleString('es-ES')})</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.6rem', lineHeight: 1.55 }}>
              Nombre, nota y contacto según Google. La nota es de terceros, no una medición nuestra.
              La titulación (PADI, SSI u otra) solo se indica cuando el propio centro la declara en su
              nombre: no hay un campo público que la certifique.
            </p>
          </section>
        ) : null}

        {/* PUNTOS DE INMERSIÓN. Esto no lo tiene nadie ordenado por
            municipio y con la playa de al lado: es lo más diferencial de
            la página. */}
        {buceo?.sitios.length ? (
          <section id="inmersiones" style={{ marginBottom: '2rem' }}>
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Dónde se <em>bucea</em></h2>
              <span className={mun.meta}>{buceo.sitios.length} {buceo.sitios.length === 1 ? 'punto' : 'puntos'} · playa más cercana</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
              {buceo.sitios.map(p => (
                <li key={p.n} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--line)', padding: '.55rem 0' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.n}</span>
                  <span style={{ fontSize: '.8rem', color: 'var(--muted)', flexShrink: 0, textAlign: 'right' }}>
                    {p.m < 1000 ? `${p.m} m` : `${(p.m / 1000).toFixed(1)} km`} de {p.playa}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Salidas y cursos. Va con la consulta de buceo, no con la
            genérica de la ciudad: si el bloque dice «salidas de buceo»,
            lo que ofrezca tiene que ser buceo. */}
        <GygActivities
          query={`Buceo ${municipio.nombre}, Spain`}
          title={`Salidas y cursos de buceo en ${municipio.nombre}`}
          cmp="snorkel-buceo"
          items={3}
          municipioSlug={slug}
          variante="actividades"
          id="salidas"
        />

        {grupos.map(([clase, lista]) => (
          <section key={clase} id={`g-${clase.toLowerCase()}`} style={{ marginBottom: '2rem' }}>
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>{GRUPOS[clase] ?? clase}</h2>
              <span className={mun.meta}>{lista.length} {lista.length === 1 ? 'especie' : 'especies'} · registros en OBIS</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.4rem' }}>
              {lista.map(e => {
                const n = nombrar(e.n)
                return (
                  <li key={e.n} style={{
                    display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline',
                    borderBottom: '1px solid var(--line)', padding: '.5rem 0',
                  }}>
                    <span style={{ minWidth: 0 }}>
                      {/* Con nombre común, el científico va detrás y en
                          cursiva. Sin él, el científico ES el nombre: no se
                          inventa una traducción para rellenar el hueco. */}
                      {n
                        ? <><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{n}</b>{' '}<i style={{ color: 'var(--muted)', fontSize: '.86rem' }}>{e.n}</i></>
                        : <i style={{ color: 'var(--ink)' }}>{e.n}</i>}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.74rem', color: 'var(--muted)', flexShrink: 0 }}>
                      {e.registros.toLocaleString('es-ES')}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <section style={{ marginBottom: '2rem' }}>
          <div className={mun.seccionCab}><h2 className={mun.h2}>Preguntas</h2></div>
          {faq.map(f => (
            <details key={f.q} style={{ borderBottom: '1px solid var(--line)', padding: '.7rem 0' }}>
              <summary style={{ fontWeight: 700, cursor: 'pointer', listStyle: 'none' }}>{f.q}</summary>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginTop: '.4rem' }}>{f.a}</p>
            </details>
          ))}
        </section>

        <p style={{ fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Datos de <a href="https://obis.org" target="_blank" rel="noopener">OBIS</a> (Ocean Biodiversity
          Information System), consultados en una caja que cubre el litoral de {municipio.nombre} y tres
          kilómetros mar adentro. No se filtra por profundidad: OBIS descarta en ese filtro los registros
          que no la traen anotada, y eso dejaba a Galicia entera sin especies. Los nombres comunes vienen
          de <a href="https://www.marinespecies.org" target="_blank" rel="noopener">WoRMS</a>; donde no
          publican uno en español, la especie aparece solo con su nombre científico.
          {vida.total > vida.especies.length && <> Se listan las {vida.especies.length} con más registros de las {vida.total} encontradas.</>}
        </p>
      </main>
    </>
  )
}
