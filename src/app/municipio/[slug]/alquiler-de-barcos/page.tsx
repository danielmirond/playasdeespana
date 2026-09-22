// /municipio/[slug]/alquiler-de-barcos — salir al mar desde este municipio.
//
// POR QUÉ EXISTE, Y POR QUÉ COLGANDO DEL MUNICIPIO. La búsqueda es «alquiler
// barco [localidad]» y va por localidad, no por costa ni por provincia:
// medido en Sistrix sobre Click&Boat, Torrevieja 200/mes, Cadaqués 200, La
// Manga 200, Santander 200, Empuriabrava 150, Benalmádena 100, Sanxenxo 100…
// y así 297 combinaciones solo con «alquile». Las 21 landings que ya
// teníamos en /alquiler-barco cubren 21 localidades; esto cubre 87, que es
// donde SamBoat tiene inventario de verdad.
//
// QUÉ APORTA QUE NO TENGAN ELLOS. Sus landings rellenan con la autopista de
// acceso y la temperatura media anual. Nosotros tenemos, playa a playa y de
// MITECO, el puerto más cercano con su distancia, el fondeo balizado, el
// espacio protegido y el acceso «solo por mar»; y el viento con nombre de la
// zona. Ellos tienen los barcos, nosotros la costa: la página dice a dónde
// ir y qué mirar antes, y el barco se alquila en su casa.
//
// LO QUE NO SE HACE. No se inventa un párrafo cuando falta el dato: un
// municipio sin fondeo balizado no tiene ese bloque, y por eso hay páginas
// cortas. No se publica la nota de SamBoat (4,88 sobre 215.278 reseñas): es
// de toda la plataforma, la misma en Torrevieja que en Sanxenxo, y ponerla
// bajo el nombre de un municipio la haría pasar por local.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getPlayasByMunicipio } from '@/lib/playas'
import { tieneMareas, ubicacionMareas } from '@/lib/mareas-portus'
import { samboatAwinUrl } from '@/lib/boat-rental-helpers'
import {
  datosSamboat, costaEnBarco, clickref, distancia, ACTUALIZADO_SAMBOAT, MUNICIPIOS_CON_BARCOS,
} from '@/lib/barcos-municipio'
import type { PlayaBarco } from '@/lib/barcos-municipio'
import DelMunicipio from '@/components/ui/DelMunicipio'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import styles from '../MunicipioPage.module.css'

export const revalidate = 86400
export const maxDuration = 30

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return MUNICIPIOS_CON_BARCOS.map(m => ({ slug: m.municipio }))
}

const fecha = (iso: string) => new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
  .format(new Date(iso + 'T12:00:00Z'))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const sb = datosSamboat(slug)
  if (!sb) return {}
  return {
    // El título no lleva la cifra de barcos ni el precio: son lo que se va a
    // comprobar dentro, y cambian cada vez que se refresca el JSON.
    title: `Alquiler de barcos en ${sb.nombre}: dónde amarrar y a qué calas ir`,
    description: `Puertos y clubes náuticos de ${sb.nombre}, calas con fondeo, playas a las que solo se llega por mar y el viento que hay que mirar antes de salir.`,
    alternates: { canonical: `https://playas-espana.com/municipio/${slug}/alquiler-de-barcos` },
  }
}

function ListaPlayas({ items, max = 8 }: { items: PlayaBarco[]; max?: number }) {
  const vis = items.slice(0, max)
  // La «y» solo delante del último cuando de verdad es el último. Con la
  // lista recortada quedaba «Nanín y Os Barcos y 8 más», que es una «y» de
  // más y se lee como si fueran dos cosas distintas.
  const completa = items.length <= max
  return (
    <>
      {vis.map((p, i) => (
        <span key={p.slug}>
          {i > 0 && (completa && i === vis.length - 1 ? ' y ' : ', ')}
          <Link href={`/playas/${p.slug}`} style={{ color: 'var(--ink)' }}>{p.nombre}</Link>
          {p.nota && <span style={{ color: 'var(--muted)' }}> ({p.nota})</span>}
        </span>
      ))}
      {items.length > max && <span style={{ color: 'var(--muted)' }}> y {items.length - max} más</span>}
    </>
  )
}

const H2 = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <h2 id={id} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: '2.25rem 0 .6rem' }}>{children}</h2>
)

export default async function AlquilerBarcosMunicipio({ params }: Props) {
  const { slug } = await params
  const sb = datosSamboat(slug)
  if (!sb) notFound()

  const playas = await getPlayasByMunicipio(slug)
  const costa = costaEnBarco(playas)
  const afiliado = process.env.NEXT_PUBLIC_SAMBOAT_AFF || process.env.NEXT_PUBLIC_AWIN_AFFID || 'playasdeespana'
  const enlace = samboatAwinUrl(afiliado, `/alquiler-barco/${sb.samboat}`, clickref(slug))
  const mareas = tieneMareas(slug) && ubicacionMareas(slug)?.zona !== 'mediterraneo'

  const puerto = costa.puertos[0]
  // Cadaqués tiene como puerto de referencia el de Roses, a 17 km: decir
  // «se sale sobre todo de Roses» sería mentir sobre un pueblo con su propia
  // bahía. A partir de 12 km se dice lo que de verdad pasa —que no hay puerto
  // deportivo en el municipio— en vez de convertir el más cercano en el suyo.
  const puertoLejos = puerto?.km != null && puerto.km > 12
  const sinLicencia = sb.licencia === 'opcional'

  // Las preguntas se redactan una sola vez y de ahí salen tanto el bloque
  // visible como el FAQPage. La regla de la casa: el schema no puede decir
  // nada que no esté en la página.
  const faq: Array<{ q: string; a: string }> = [
    {
      q: `¿Hace falta licencia para alquilar un barco en ${sb.nombre}?`,
      a: sinLicencia
        ? `No siempre. En ${sb.nombre} hay barcos que se alquilan sin titulación: la ley permite llevar embarcaciones de hasta 5 metros y 15 CV, de día y a menos de 2 millas de un puerto de abrigo. Para todo lo demás hace falta licencia de navegación o PER, o alquilar con patrón.`
        : `Sí. Toda la oferta que hay ahora mismo en ${sb.nombre} pide titulación. Si no la tienes, la alternativa es alquilar con patrón: ${sb.conPatron} de los barcos de la zona lo incluyen.`,
    },
    {
      q: `¿Se puede fondear delante de las playas de ${sb.nombre}?`,
      a: costa.fondeo.length
        ? `${costa.fondeo.length === 1 ? 'Hay una playa con zona de fondeo balizada' : `Hay ${costa.fondeo.length} playas con zona de fondeo balizada`}: ${costa.fondeo.slice(0, 6).map(p => p.nombre).join(', ')}${costa.fondeo.length > 6 ? ` y ${costa.fondeo.length - 6} más` : ''}. Fuera de las zonas balizadas hay que fondear sobre arena, nunca sobre ${costa.pradera}, y lejos de la zona de baño.`
        : `En los datos oficiales de las playas de ${sb.nombre} no consta ninguna zona de fondeo balizada. Se puede fondear fuera de la zona de baño, sobre arena y nunca sobre ${costa.pradera}.`,
    },
    {
      q: `¿Desde qué puerto se sale en ${sb.nombre}?`,
      a: puerto
        ? puertoLejos
          ? `En ${sb.nombre} las fichas oficiales no asignan ningún puerto deportivo dentro del municipio: el de referencia es ${puerto.nombre}, a ${distancia(puerto.km!)}. Conviene confirmar el punto de amarre con el propietario del barco antes de reservar.`
          : `El más usado por las playas del municipio es ${puerto.nombre}${puerto.km != null ? `, a ${distancia(puerto.km!)} de la playa más cercana` : ''}.${costa.puertos.length > 1 ? ` También hay salida desde ${costa.puertos.slice(1).map(p => p.nombre).join(' y ')}.` : ''}`
        : `Las fichas oficiales de las playas de ${sb.nombre} no asignan puerto deportivo. Conviene confirmar el punto de salida con el propietario del barco antes de reservar.`,
    },
  ]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.wrap} style={{ paddingTop: '1.5rem' }}>
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación" style={{ marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/municipio/${slug}`}>{sb.nombre}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Alquiler de barcos</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', lineHeight: 1.2, margin: '0 0 .75rem' }}>
          Alquiler de barcos en {sb.nombre}
        </h1>

        <p data-speakable style={{ fontSize: '1rem', lineHeight: 1.7, maxWidth: 660, color: 'var(--ink)' }}>
          {!puerto
            ? <>En {sb.nombre} las fichas oficiales de las playas no asignan puerto deportivo, así que conviene confirmar dónde amarra el barco antes de reservar.{' '}</>
            : puertoLejos
              ? <>{sb.nombre} no tiene puerto deportivo propio en las fichas oficiales: el de referencia es <b>{puerto.nombre}</b>, a {distancia(puerto.km!)}, así que casi todo se hace fondeado.{' '}</>
              : <>Desde {sb.nombre} se sale sobre todo de <b>{puerto.nombre}</b>{puerto.km != null && <>, a {distancia(puerto.km)} de la playa más cercana</>}.{' '}</>}
          {sinLicencia
            ? <>Hay barcos con y sin titulación</>
            : <>Toda la oferta de la zona pide titulación</>}
          {sb.conPatron > 0 && <>, y {sb.conPatron === 1 ? 'uno se alquila' : `${sb.conPatron} se alquilan`} con patrón</>}.
        </p>

        {costa.puertos.length > 1 && (
          <>
            <H2 id="puertos">De dónde se sale</H2>
            <ul style={{ margin: '0 0 .5rem 1.1rem', lineHeight: 1.8, fontSize: '.95rem' }}>
              {costa.puertos.map(p => (
                <li key={p.nombre}>
                  {p.nombre}
                  {p.km != null && <span style={{ color: 'var(--muted)' }}> · a {distancia(p.km)} de la playa más cercana</span>}
                  <span style={{ color: 'var(--muted)' }}> · es el puerto de referencia de {p.playas} {p.playas === 1 ? 'playa' : 'playas'}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {(costa.soloPorMar.length > 0 || costa.fondeo.length > 0) && (
          <>
            <H2 id="donde-ir">A dónde ir</H2>
            {costa.soloPorMar.length > 0 && (
              <p style={{ lineHeight: 1.75, maxWidth: 660 }}>
                Lo que justifica el barco: <ListaPlayas items={costa.soloPorMar} />. Son las playas del municipio
                a las que se llega por mar o con una caminata seria, según la ficha oficial de cada una.
              </p>
            )}
            {costa.fondeo.length > 0 && (
              <p style={{ lineHeight: 1.75, maxWidth: 660 }}>
                Con <b>zona de fondeo balizada</b>: <ListaPlayas items={costa.fondeo} />. Fuera de ellas se fondea
                sobre arena y lejos de los bañistas, nunca sobre {costa.pradera}.
              </p>
            )}
            {costa.protegidas.length > 0 && (
              <p style={{ lineHeight: 1.75, maxWidth: 660 }}>
                Dentro de <b>espacio protegido</b>: <ListaPlayas items={costa.protegidas} />. Ahí las reglas de
                fondeo y navegación las pone el espacio, no el municipio: conviene comprobarlas antes de salir.
              </p>
            )}
          </>
        )}

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

        {costa.vientos.length > 0 && (
          <>
            <H2 id="viento">El viento que decide el día</H2>
            <ul style={{ margin: '0 0 .5rem 1.1rem', lineHeight: 1.8, fontSize: '.95rem', maxWidth: 660 }}>
              {costa.vientos.map(v => (
                <li key={v.nombre}>
                  <b>{v.nombre}</b> <span style={{ color: 'var(--muted)' }}>— {v.efecto}. Se nota a partir de {v.umbral} km/h.</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', maxWidth: 660 }}>
              El viento y el estado del mar de hoy, con su nombre, están en la ficha de cada playa.{' '}
              {mareas && <><Link href={`/municipio/${slug}/tabla-de-mareas`} style={{ color: 'var(--ink)' }}>La tabla de mareas de {sb.nombre}</Link> manda tanto como el viento para entrar y salir del puerto.</>}
            </p>
          </>
        )}

        {costa.expuestas.length > 0 && (
          <p style={{ lineHeight: 1.75, maxWidth: 660, fontSize: '.95rem' }}>
            Con el mar levantado, las que primero se ponen incómodas son <ListaPlayas items={costa.expuestas} max={5} />.
          </p>
        )}

        <H2 id="que-barco">Qué barco puedes llevar</H2>
        <p style={{ lineHeight: 1.75, maxWidth: 660 }}>
          {sinLicencia ? (
            <>
              <b>Sin titulación</b> puedes llevar embarcaciones de hasta 5 metros y 15 CV, de día y a menos de
              2 millas de un puerto de abrigo. Da para las calas de aquí al lado, no para cruzar.{' '}
            </>
          ) : (
            <>
              <b>Aquí hace falta titulación.</b> Toda la oferta que hay ahora mismo en {sb.nombre} la pide, así que
              sin licencia de navegación o PER la vía es alquilar con patrón.{' '}
            </>
          )}
          {sb.conPatron > 0 && (
            <><b>Con patrón</b> {sb.conPatron === 1 ? 'hay un barco' : `hay ${sb.conPatron} barcos`}: no tienes que saber
            fondear ni conocer la costa, y suele salir a cuenta si vais varios.{' '}</>
          )}
          {sb.tipos.length > 0 && <>En la zona se alquilan {sb.tipos.map(t => t.toLowerCase()).join(', ')}.</>}
        </p>

        <section style={{ marginTop: '1.5rem', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
          <p style={{ margin: '0 0 .5rem', lineHeight: 1.7 }}>
            En SamBoat hay <b>{sb.barcos.toLocaleString('es-ES')} barcos</b> en la zona de {sb.nombre}
            {sb.precioMin != null && <> desde <b>{sb.precioMin} € al día</b></>}.{' '}
            <span style={{ color: 'var(--muted)' }}>Consultado en {fecha(ACTUALIZADO_SAMBOAT)}; el precio y la disponibilidad cambian con la temporada.</span>
          </p>
          <a href={enlace} target="_blank" rel="sponsored nofollow noopener" style={{ color: 'var(--ink)', fontWeight: 600 }}>
            Ver los barcos de {sb.nombre} en SamBoat →
          </a>
          <p style={{ margin: '.5rem 0 0', fontSize: '.85rem', color: 'var(--muted)' }}>
            Es un enlace de afiliado: si reservas, nos llevamos una comisión y a ti no te cuesta más.
          </p>
        </section>

        <H2 id="faq">Preguntas frecuentes</H2>
        <dl style={{ maxWidth: 660 }}>
          {faq.map(f => (
            <div key={f.q} style={{ marginBottom: '1rem' }}>
              <dt style={{ fontWeight: 600, marginBottom: '.2rem' }}>{f.q}</dt>
              <dd style={{ margin: 0, lineHeight: 1.7, color: 'var(--muted)' }}>{f.a}</dd>
            </div>
          ))}
        </dl>

        <div style={{ marginBottom: '3rem' }}>
          <DelMunicipio nombre={sb.nombre} enlaces={await enlacesMunicipio(slug, sb.nombre)} actual="barcos" />
        </div>
      </div>
    </>
  )
}
