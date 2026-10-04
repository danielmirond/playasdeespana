// /municipio/[slug]/autocaravana — dormir y aparcar con el vehículo grande.
//
// POR QUÉ AQUÍ. La página de alquiler responde a «dónde cojo la
// autocaravana»; esta responde a «dónde la dejo». Son dos viajes
// distintos: uno se alquila en Madrid y el otro se duerme en Mojácar. Por
// eso esta no sustituye a aquella, la continúa, y las dos se enlazan.
//
// QUÉ SE PUBLICA. Las áreas de autocaravanas de OpenStreetMap con sus
// servicios y a cuántos kilómetros están del pueblo, y las playas del
// municipio cuyo aparcamiento, según el inventario oficial, es de los dos
// tramos grandes: con «menos de 50 plazas» un vehículo de siete metros no
// entra un domingo de agosto.
//
// LO QUE NO SE PROMETE. Que la pernocta esté permitida: eso lo decide cada
// ayuntamiento y cambia cada temporada. Y que el aparcamiento grande admita
// autocaravanas: muchos tienen barra de altura. Se dice, no se insinúa lo
// contrario.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getMunicipios, getPlayasByMunicipio, MIN_PLAYAS_MUNICIPIO } from '@/lib/playas'
import { autocaravanaDelMunicipio, tieneAutocaravana, servicios, type AreaAutocaravana } from '@/lib/autocaravana-municipio'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { comunidadDe } from '@/lib/comunidad'
import { migaMunicipio } from '@/lib/miga-municipio'
import { getCamperCity } from '@/lib/autocaravana-localities'
import { getFotos } from '@/lib/fotos'
import HeroMunicipio from '@/components/municipio/HeroMunicipio'
import NavMunicipio from '@/components/municipio/NavMunicipio'
import DelMunicipio from '@/components/ui/DelMunicipio'
import mun from '@/components/municipio/Municipio.module.css'

export const revalidate = 604800
export const maxDuration = 30
export const dynamicParams = true
export function generateStaticParams() { return [] }

interface Props { params: Promise<{ slug: string }> }

const km = (m: number): string => m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${m} m`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = (await getMunicipios(1)).find(x => x.slug === slug)
  if (!m) return {}
  return {
    title: `Autocaravana en ${m.nombre}: áreas de pernocta y playas con sitio`,
    description: `Áreas de autocaravanas cerca de ${m.nombre}, qué servicios tiene cada una y a qué playas del municipio se puede llegar con el vehículo grande.`,
    alternates: { canonical: `/municipio/${slug}/autocaravana` },
  }
}

function Area({ a }: { a: AreaAutocaravana }) {
  const s = servicios(a)
  const detalles = [
    a.pago === false ? 'gratuita' : a.pago === true ? (a.tarifa ?? 'de pago') : null,
    a.plazas ? `${a.plazas} plazas` : null,
    a.maxEstancia ? `máximo ${a.maxEstancia}` : null,
  ].filter(Boolean)
  return (
    <li className={mun.sitio} style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1rem 1.1rem' }}>
      <div style={{ display: 'flex', gap: '.7rem', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.72rem', color: 'var(--muted)', flexShrink: 0, minWidth: '3.8rem' }}>
          {km(a.metros)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`} target="_blank" rel="noopener"
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
            {a.nombre ?? (a.tipo === 'area' ? 'Área sin nombre' : 'Aparcamiento sin nombre')}
          </a>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.15rem' }}>
            {a.tipo === 'area' ? 'Área de autocaravanas' : 'Aparcamiento que admite autocaravanas'}
            {detalles.length > 0 && ` · ${detalles.join(' · ')}`}
          </div>
          {s.length > 0 && (
            <div style={{ fontSize: '.82rem', color: 'var(--ink)', marginTop: '.3rem' }}>
              Tiene {s.join(', ')}.
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default async function AutocaravanaMunicipioPage({ params }: Props) {
  const { slug } = await params
  const municipios = await getMunicipios(1)
  const municipio = municipios.find(m => m.slug === slug)
  if (!municipio) notFound()
  const playas = await getPlayasByMunicipio(slug)
  if (!(await tieneAutocaravana(playas, slug))) notFound()

  const { areas, playas: conSitio } = await autocaravanaDelMunicipio(playas, slug)
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)
  const tienePaginaMuni = municipio.count >= MIN_PLAYAS_MUNICIPIO
  const alquiler = getCamperCity(slug)

  const propias = areas.filter(a => a.tipo === 'area')
  const cerca = propias[0] ?? areas[0]
  const conVaciado = areas.filter(a => a.vaciado)
  const gratis = areas.filter(a => a.pago === false)
  const grandes = conSitio.filter(p => /m[áa]s de 100|150|200/i.test(p.tamano))

  const fotoHero = conSitio[0]
    ? (await getFotos(conSitio[0].nombre, municipio.nombre,
        playas.find(p => p.slug === conSitio[0].slug)?.lat ?? 0,
        playas.find(p => p.slug === conSitio[0].slug)?.lng ?? 0, municipio.provincia, conSitio[0].slug))
        .find(f => f.fuente !== 'generica')
    : null

  const faq = [
    {
      q: `¿Dónde se puede pernoctar en autocaravana en ${municipio.nombre}?`,
      a: cerca
        ? `El sitio más cercano es ${cerca.nombre ?? (cerca.tipo === 'area' ? 'un área sin nombre en OpenStreetMap' : 'un aparcamiento que admite autocaravanas')}, a ${km(cerca.metros)} del centro${cerca.pago === false ? ', gratuito' : cerca.pago === true ? ', de pago' : ''}. Pernoctar dentro del vehículo, con las ruedas en el suelo y sin desplegar nada, es otra cosa que acampar; lo que esté permitido en cada calle lo decide el ayuntamiento y conviene mirar la señal.`
        : `No consta ningún área de autocaravanas en OpenStreetMap a menos de 12 km.`,
    },
    {
      q: `¿Dónde vaciar aguas grises y el químico cerca de ${municipio.nombre}?`,
      a: conVaciado.length
        ? `${conVaciado.length === 1 ? 'Hay un sitio con vaciado anotado: ' : `Hay ${conVaciado.length} sitios con vaciado anotado, entre ellos `}${conVaciado.slice(0, 3).map(a => a.nombre ?? 'un área sin nombre').join(', ')}. Fuera de un punto habilitado está prohibido y la multa es alta.`
        : `Ninguna de las áreas cercanas tiene el vaciado anotado en OpenStreetMap, lo que no quiere decir que no lo tenga: es de los datos que peor se rellenan. Las gasolineras de carretera suelen tenerlo.`,
    },
    ...(conSitio.length ? [{
      q: `¿A qué playa de ${municipio.nombre} se puede ir en autocaravana?`,
      a: `${conSitio.length === 1 ? 'Solo una playa tiene' : `${conSitio.length} playas tienen`} aparcamiento de los tramos grandes del inventario oficial: ${conSitio.slice(0, 4).map(p => p.nombre).join(', ')}. El tamaño no garantiza la entrada: bastantes aparcamientos de playa tienen barra de altura, así que la última palabra la tiene el cartel.`,
    }] : []),
  ]

  const miga = migaMunicipio({
    slug, nombre: municipio.nombre, provincia: municipio.provincia,
    provinciaSlug: municipio.provinciaSlug, comunidad: municipio.comunidad,
    seccion: 'Autocaravana', seccionHref: `/municipio/${slug}/autocaravana`, conRaiz: tienePaginaMuni,
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
        foto={fotoHero ? { url: fotoHero.url, autor: fotoHero.autor, alt: `${conSitio[0].nombre}, ${municipio.nombre}` } : null}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
          <Link href={`/provincia/${municipio.provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link> : <span>{municipio.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Autocaravana</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio.provincia} · {propias.length} {propias.length === 1 ? 'área' : 'áreas'} · {conSitio.length} {conSitio.length === 1 ? 'playa con sitio' : 'playas con sitio'}
        </div>
        <h1 className={mun.heroTitulo}>Autocaravana en {municipio.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>
          {cerca
            ? <>Lo más cerca para pasar la noche es <b>{cerca.nombre ?? 'un área sin nombre en OpenStreetMap'}</b>, a {km(cerca.metros)}{gratis.length ? `, y ${gratis.length === 1 ? 'una de las áreas consta como gratuita' : `${gratis.length} de las áreas constan como gratuitas`}` : ''}.{conSitio.length ? ` Para el día, ${conSitio.length === 1 ? 'hay una playa con aparcamiento grande' : `hay ${conSitio.length} playas con aparcamiento grande`}.` : ''}</>
            : <>No hay áreas de autocaravanas anotadas cerca, pero {conSitio.length === 1 ? 'una playa tiene' : `${conSitio.length} playas tienen`} aparcamiento de los tramos grandes.</>}
        </p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="autocaravana" />

      <main className={mun.cuerpo}>
        {areas.length > 0 && (
          <section id="areas">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Dónde <em>pasar la noche</em></h2>
              <span className={mun.meta}>a menos de 12 km del pueblo</span>
            </div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.9rem' }}>
              {areas.map((a, i) => <Area key={`${a.lat}-${a.lng}-${i}`} a={a} />)}
            </ol>
          </section>
        )}

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

        {conSitio.length > 0 && (
          <section id="playas">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Playas donde <em>cabe el vehículo</em></h2>
              <span className={mun.meta}>tamaño según el inventario oficial</span>
            </div>
            <p style={{ margin: '0 0 .8rem', fontSize: '.88rem', lineHeight: 1.6, color: 'var(--muted)' }}>
              {grandes.length > 0
                ? `${grandes.length === 1 ? 'Una tiene' : `${grandes.length} tienen`} aparcamiento de más de 100 plazas, que es donde suele haber maniobra para un vehículo largo. `
                : ''}
              Antes de entrar conviene mirar el cartel: la barra de altura no está en ningún inventario y es lo que
              deja fuera a la mayoría de autocaravanas.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
              {conSitio.map(p => (
                <li key={p.slug} style={{ display: 'flex', gap: '.7rem', alignItems: 'baseline', padding: '.55rem 0', borderTop: '1px solid var(--line)' }}>
                  <Link href={`/playas/${p.slug}`} style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--ink)' }}>{p.nombre}</Link>
                  <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                    {p.tamano.toLowerCase()}{p.vigilado ? ', vigilado' : ''}{p.bandera ? ' · Bandera Azul' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {alquiler && (
          <section id="alquiler">
            <div className={mun.seccionCab}><h2 className={mun.h2}>Si todavía <em>no tienes vehículo</em></h2></div>
            <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.65 }}>
              Esta página cuenta dónde dejar la autocaravana en {municipio.nombre}. Dónde recogerla es otra cosa:{' '}
              <Link href={`/alquiler-autocaravana/${alquiler.slug}`} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                alquiler de autocaravanas en {alquiler.ciudad}
              </Link>, con precios por temporada y qué carnet hace falta.
            </p>
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
          Las áreas y sus servicios salen de OpenStreetMap, que escribe gente voluntaria: puede faltar alguna y los
          servicios se rellenan mal, así que la ausencia de vaciado no significa que no lo haya. El tamaño del
          aparcamiento de cada playa es del inventario oficial del Ministerio. Si la pernocta está permitida o no lo
          decide cada ayuntamiento, cambia cada temporada y no hay base de datos que lo recoja: la señal manda.{' '}
          <Link href="/playas-autocaravana" style={{ color: 'var(--accent)' }}>Las reglas generales, en la guía de playas para autocaravana</Link>.
        </p>

        <Hueco zona="cierre" bloque={SLOTS.cierre} />
        <DelMunicipio nombre={municipio.nombre} enlaces={enlaces} actual="autocaravana" />
      </main>
    </>
  )
}
