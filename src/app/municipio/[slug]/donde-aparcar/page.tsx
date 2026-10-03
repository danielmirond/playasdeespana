// /municipio/[slug]/donde-aparcar — a qué playa se llega en coche.
//
// POR QUÉ. Es la consulta más desesperada del verano y la peor resuelta:
// quien la escribe ya está en el coche. Los mapas enseñan puntos; los
// listados de playas no dicen dónde se deja el vehículo. Lo que falta es
// la comparación, y es justo lo que tenemos: el inventario oficial dice
// qué playas del municipio tienen aparcamiento, si está vigilado y de qué
// tamaño, y OpenStreetMap pone encima los aparcamientos concretos con su
// distancia a la arena y si son de pago.
//
// LA ALTERNATIVA CUENTA IGUAL. Una playa sin aparcamiento pero con línea
// de autobús no se esconde: se publica abajo con su aviso. Esa es la
// respuesta útil para la playa buena a la que no se puede ir en coche.
//
// Y EL PUEBLO, NO SOLO LA ARENA. Buena parte de esta búsqueda no va a la
// playa: va al casco, y los días de temporal. Por eso el sidecar guarda
// también los aparcamientos del centro y aquí salen en su propio bloque.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getMunicipios, getPlayasByMunicipio, MIN_PLAYAS_MUNICIPIO } from '@/lib/playas'
import { aparcamientosDelMunicipio, tieneAparcamiento, reparte, metros, type Aparcamiento } from '@/lib/aparcamiento-municipio'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { comunidadDe } from '@/lib/comunidad'
import { getFotos } from '@/lib/fotos'
import HeroMunicipio from '@/components/municipio/HeroMunicipio'
import NavMunicipio from '@/components/municipio/NavMunicipio'
import DelMunicipio from '@/components/ui/DelMunicipio'
import mun from '@/components/municipio/Municipio.module.css'

export const revalidate = 604800     // los aparcamientos cambian poco
export const maxDuration = 30
export const dynamicParams = true
export function generateStaticParams() { return [] }

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = (await getMunicipios(1)).find(x => x.slug === slug)
  if (!m) return {}
  return {
    title: `Dónde aparcar en ${m.nombre}: a qué playa se llega en coche`,
    description: `Qué playas de ${m.nombre} tienen aparcamiento y de qué tamaño, los aparcamientos que hay junto a cada una y a cuáles conviene ir en autobús.`,
    alternates: { canonical: `/municipio/${slug}/donde-aparcar` },
  }
}

/** Una línea por aparcamiento: lo que hace falta para decidir. */
function Ficha({ a }: { a: Aparcamiento }) {
  const detalles = [
    a.pago === false ? 'gratuito' : a.pago === true ? (a.tarifa ?? 'de pago') : null,
    a.plazas ? `${a.plazas} plazas` : null,
    a.tipo === 'altura' ? 'en altura' : a.tipo === 'subterraneo' ? 'subterráneo' : null,
    a.pmr ? 'con plazas PMR' : null,
    a.maxEstancia ? `máximo ${a.maxEstancia}` : null,
  ].filter(Boolean)
  return (
    <li style={{ display: 'flex', gap: '.7rem', alignItems: 'baseline', padding: '.45rem 0', borderTop: '1px solid var(--line)' }}>
      <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.72rem', color: 'var(--muted)', flexShrink: 0, minWidth: '3.6rem' }}>
        {metros(a.metros)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <a href={`https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`} target="_blank" rel="noopener"
          style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)' }}>
          {a.nombre ?? 'Aparcamiento sin nombre'}
        </a>
        {detalles.length > 0 && <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}> · {detalles.join(' · ')}</span>}
      </span>
    </li>
  )
}

export default async function DondeAparcarPage({ params }: Props) {
  const { slug } = await params
  const municipios = await getMunicipios(1)
  const municipio = municipios.find(m => m.slug === slug)
  if (!municipio) notFound()
  const playas = await getPlayasByMunicipio(slug)
  if (!(await tieneAparcamiento(playas, slug))) notFound()

  const { playas: lista, enElPueblo } = await aparcamientosDelMunicipio(playas, slug)
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)
  const tienePaginaMuni = municipio.count >= MIN_PLAYAS_MUNICIPIO

  const facil = lista.filter(p => p.tieneAparcamiento || p.cerca.length >= 2)
  const sinSitio = lista.filter(p => !p.tieneAparcamiento && p.cerca.length < 2)
  const enBus = sinSitio.filter(p => p.autobus)
  const mejor = facil[0]
  const gratuitos = lista.flatMap(p => p.cerca).filter(a => a.pago === false).length
  const dePago = lista.flatMap(p => p.cerca).filter(a => a.pago === true).length

  const fotoHero = mejor
    ? (await getFotos(mejor.nombre, municipio.nombre, playas.find(p => p.slug === mejor.slug)?.lat ?? 0,
        playas.find(p => p.slug === mejor.slug)?.lng ?? 0, municipio.provincia, mejor.slug))
        .find(f => f.fuente !== 'generica')
    : null

  const faq = [
    {
      q: `¿En qué playa de ${municipio.nombre} es más fácil aparcar?`,
      a: mejor
        ? `En ${mejor.nombre}${mejor.tamano ? `, que tiene aparcamiento de ${mejor.tamano.toLowerCase()}` : ', que tiene aparcamiento'}${mejor.vigilado ? ' y vigilado' : ''}${mejor.cerca.length ? `, con ${mejor.cerca.length} ${mejor.cerca.length === 1 ? 'aparcamiento' : 'aparcamientos'} más a menos de 1,2 km` : ''}.`
        : `Ninguna de las playas tiene aparcamiento propio según el inventario oficial.`,
    },
    {
      q: `¿Hay aparcamiento gratis en las playas de ${municipio.nombre}?`,
      a: gratuitos > 0
        ? `Sí: ${gratuitos} de los aparcamientos cercanos a las playas constan como gratuitos en OpenStreetMap${dePago ? ` y ${dePago} como de pago` : ''}. El resto no dice la tarifa, así que conviene mirar la señal al llegar.`
        : `Ninguno de los aparcamientos cercanos consta como gratuito en OpenStreetMap, lo que no significa que todos cobren: la mayoría no tiene la tarifa anotada.`,
    },
    ...(enBus.length ? [{
      q: `¿A qué playas de ${municipio.nombre} hay que ir en autobús?`,
      a: `A ${enBus.slice(0, 3).map(p => p.nombre).join(', ')}: no tienen aparcamiento en el inventario oficial ni aparcamientos cerca, pero sí línea de autobús.`,
    }] : []),
  ]
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroMunicipio
        foto={fotoHero ? { url: fotoHero.url, autor: fotoHero.autor, alt: `${mejor!.nombre}, ${municipio.nombre}` } : null}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
          <Link href={`/provincia/${municipio.provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link> : <span>{municipio.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Aparcar</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio.provincia} · {facil.length} {facil.length === 1 ? 'playa con sitio' : 'playas con sitio'} · {playas.length} en total
        </div>
        <h1 className={mun.heroTitulo}>Dónde aparcar en {municipio.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>
          {mejor
            ? <>Donde menos cuesta dejar el coche es en <b>{mejor.nombre}</b>{mejor.tamano ? `, con aparcamiento de ${mejor.tamano.toLowerCase()}` : ''}{mejor.vigilado ? ' y vigilado' : ''}.{sinSitio.length ? ` A ${sinSitio.length} de las ${playas.length} playas es mejor no ir en coche.` : ''}</>
            : <>Ninguna playa tiene aparcamiento propio, pero hay {enElPueblo.length} aparcamientos en el pueblo.</>}
        </p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="aparcar" />

      <main className={mun.cuerpo}>
        {facil.length > 0 && (
          <section id="playas">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Playa por playa, de <em>menos a más</em> complicado</h2>
              <span className={mun.meta}>tamaño según el inventario oficial</span>
            </div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.9rem' }}>
              {facil.map((p, i) => (
                <li key={p.slug} className={mun.sitio} style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', gap: '.7rem', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.78rem', color: 'var(--muted)' }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/playas/${p.slug}`} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.12rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {p.nombre}
                      </Link>
                      <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.1rem' }}>
                        {p.tieneAparcamiento
                          ? <>Aparcamiento{p.tamano ? ` de ${p.tamano.toLowerCase()}` : ''}{p.vigilado ? ', vigilado' : ', sin vigilancia'}</>
                          : <>Sin aparcamiento en el inventario oficial</>}
                        {p.autobus && ' · llega el autobús'}
                        {p.bandera && ' · Bandera Azul'}
                      </div>
                    </div>
                  </div>
                  {p.cerca.length > 0 && (() => {
                    const { listar, resto, restoGratis } = reparte(p.cerca)
                    return (
                      <>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '.6rem 0 0' }}>
                          {listar.map((a, j) => <Ficha key={`${a.lat}-${a.lng}-${j}`} a={a} />)}
                        </ul>
                        {resto > 0 && (
                          <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.4rem' }}>
                            Y {resto} {resto === 1 ? 'aparcamiento más' : 'aparcamientos más'} a menos de 1,2 km
                            {restoGratis > 0 && `, ${restoGratis} de ellos gratuitos`}.
                          </div>
                        )}
                      </>
                    )
                  })()}
                </li>
              ))}
            </ol>
          </section>
        )}

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

        {sinSitio.length > 0 && (
          <section id="sin-coche">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>A estas, mejor <em>sin coche</em></h2>
              <span className={mun.meta}>{sinSitio.length} de {playas.length}</span>
            </div>
            <p style={{ margin: '0 0 .7rem', fontSize: '.88rem', lineHeight: 1.6, color: 'var(--muted)' }}>
              No tienen aparcamiento en el inventario oficial ni aparcamientos anotados a menos de 1,2 km.
              {enBus.length > 0 && ' Las marcadas con autobús sí tienen parada, que suele ser la forma sensata de llegar en agosto.'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
              {sinSitio.map(p => (
                <li key={p.slug}>
                  <Link href={`/playas/${p.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .8rem', borderRadius: 100, border: '1px solid var(--line)', fontSize: '.84rem', color: 'var(--ink)' }}>
                    {p.nombre}
                    {p.autobus && <span style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 600 }}>bus</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {enElPueblo.length > 0 && (
          <section id="pueblo">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Y en el <em>pueblo</em></h2>
              <span className={mun.meta}>a menos de 1,5 km del centro</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {enElPueblo.map((a, i) => <Ficha key={`${a.lat}-${a.lng}-${i}`} a={a} />)}
            </ul>
          </section>
        )}

        <section id="faq">
          <div className={mun.seccionCab}><h2 className={mun.h2}>Preguntas <em>frecuentes</em></h2></div>
          <dl style={{ margin: 0 }}>
            {faq.map(f => (
              <div key={f.q} style={{ marginBottom: '1rem' }}>
                <dt style={{ fontWeight: 600, marginBottom: '.2rem' }}>{f.q}</dt>
                <dd style={{ margin: 0, lineHeight: 1.65, color: 'var(--muted)' }}>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          Que una playa tenga aparcamiento, de qué tamaño y si está vigilado sale del inventario oficial de playas del
          Ministerio. Los aparcamientos concretos, de OpenStreetMap, que escribe gente voluntaria: puede faltar alguno y
          solo uno de cada cuatro anota la tarifa, así que lo de pago o gratis hay que confirmarlo en la señal. Nadie
          aquí sabe si está lleno: en agosto, cuanto más temprano, mejor.
        </p>

        <Hueco zona="cierre" bloque={SLOTS.cierre} />
        <DelMunicipio nombre={municipio.nombre} enlaces={enlaces} actual="aparcar" />
      </main>
    </>
  )
}
