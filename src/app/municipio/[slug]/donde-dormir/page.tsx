// /municipio/[slug]/donde-dormir — a qué playa se duerme más cerca.
//
// POR QUÉ. Booking tiene el precio, las fotos y la reserva; competir con
// eso sería absurdo. Lo que no publica, y aquí sí tenemos, es a qué playa
// concreta le queda más cerca cada alojamiento, a cuántos metros, y cómo
// está esa playa: bandera, socorrismo, estado del mar. Quien busca «hotel
// en primera línea en Nerja» pregunta exactamente eso.
//
// DE DÓNDE SALE. OpenStreetMap pone el inventario (19.000 alojamientos ya
// indexados por playa en el sidecar) y Google Places, cosechado una vez y
// congelado en el repo, pone la valoración y el nivel de precio. Donde no
// hay datos de Google la página se sirve igual, sin estrellas.
//
// LO QUE NO SE PROMETE: ni disponibilidad, ni precio por noche, ni
// reservar aquí. Cada alojamiento enlaza a su web cuando la tiene.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getMunicipios, getPlayasByMunicipio, MIN_PLAYAS_MUNICIPIO } from '@/lib/playas'
import { alojamientosDelMunicipio, tieneAlojamientos, metros } from '@/lib/alojamiento-municipio'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { comunidadDe } from '@/lib/comunidad'
import { migaMunicipio } from '@/lib/miga-municipio'
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = (await getMunicipios(1)).find(x => x.slug === slug)
  if (!m) return {}
  return {
    title: `Dónde dormir en ${m.nombre}: a qué playa queda cada hotel`,
    description: `Los alojamientos de ${m.nombre} ordenados por distancia a la arena, con la playa que le queda más cerca a cada uno y cómo está esa playa.`,
    alternates: { canonical: `/municipio/${slug}/donde-dormir` },
  }
}

export default async function DondeDormirPage({ params }: Props) {
  const { slug } = await params
  const municipio = (await getMunicipios(1)).find(m => m.slug === slug)
  if (!municipio) notFound()
  const playas = await getPlayasByMunicipio(slug)
  if (!(await tieneAlojamientos(playas))) notFound()

  const todos = await alojamientosDelMunicipio(playas)
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)
  const tienePaginaMuni = municipio.count >= MIN_PLAYAS_MUNICIPIO

  const primeraLinea = todos.filter(a => a.playa.metros <= 300)
  const valorados = todos.filter(a => a.valoracion >= 4.3 && a.resenas >= 50)
    .sort((a, b) => b.valoracion - a.valoracion || b.resenas - a.resenas)
  const masCerca = todos[0]
  const conBandera = todos.filter(a => a.playa.bandera)

  const fotoHero = masCerca
    ? (await getFotos(masCerca.playa.nombre, municipio.nombre,
        playas.find(p => p.slug === masCerca.playa.slug)?.lat ?? 0,
        playas.find(p => p.slug === masCerca.playa.slug)?.lng ?? 0,
        municipio.provincia, masCerca.playa.slug)).find(f => f.fuente !== 'generica')
    : null

  const faq = [
    {
      q: `¿Qué hotel de ${municipio.nombre} está más cerca de la playa?`,
      a: `${masCerca.nombre}, a ${metros(masCerca.playa.metros)} de ${masCerca.playa.nombre}${masCerca.playa.bandera ? ', que tiene Bandera Azul' : ''}.${primeraLinea.length > 1 ? ` Hay ${primeraLinea.length} alojamientos a menos de 300 metros de alguna playa.` : ''}`,
    },
    {
      q: `¿Dónde dormir en ${municipio.nombre} con playa de Bandera Azul al lado?`,
      a: conBandera.length
        ? `${conBandera.length} de los ${todos.length} alojamientos tienen como playa más cercana una con Bandera Azul. El más próximo es ${conBandera[0].nombre}, a ${metros(conBandera[0].playa.metros)} de ${conBandera[0].playa.nombre}.`
        : `Ninguna de las playas más cercanas a estos alojamientos tiene Bandera Azul este año.`,
    },
    {
      q: `¿Cuántos alojamientos hay en ${municipio.nombre}?`,
      a: `${todos.length} a menos de 5 km de alguna de sus ${playas.length} ${playas.length === 1 ? 'playa' : 'playas'}, entre hoteles, hostales y casas de huéspedes. Los datos son de OpenStreetMap${valorados.length ? ' y las valoraciones de Google' : ''}. Precios y disponibilidad, en la web de cada uno.`,
    },
  ]
  const miga = migaMunicipio({
    slug, nombre: municipio.nombre, provincia: municipio.provincia,
    provinciaSlug: municipio.provinciaSlug, comunidad: municipio.comunidad,
    seccion: 'Dormir', seccionHref: `/municipio/${slug}/donde-dormir`, conRaiz: tienePaginaMuni,
  })
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  const Ficha = ({ a, i }: { a: typeof todos[number]; i: number }) => (
    <li className={mun.sitio} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
      <div style={{ width: 64, flexShrink: 0, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.15rem' }}>
        <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.62rem', color: 'var(--muted)' }}>{i + 1}</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)' }}>{metros(a.playa.metros)}</span>
      </div>
      <div className={mun.sitioCuerpo} style={{ flex: 1, minWidth: 0 }}>
        <div className={mun.sitioNombre}>
          {a.web
            ? <a href={a.web} target="_blank" rel="noopener nofollow" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted var(--muted)' }}>{a.nombre}</a>
            : a.nombre}
          {a.estrellas > 0 && <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '.45rem' }}>{'★'.repeat(Math.min(a.estrellas, 5))}</span>}
        </div>
        <p className={mun.sitioResumen} style={{ margin: 0 }}>
          {a.tipo} · a <b style={{ color: 'var(--ink)' }}>{metros(a.playa.metros)}</b> de{' '}
          <Link href={`/playas/${a.playa.slug}`} style={{ color: 'var(--ink)', fontWeight: 600 }}>{a.playa.nombre}</Link>
          {a.playa.bandera && ' · Bandera Azul'}{a.playa.socorrismo && ' · socorrismo'}
          {a.valoracion > 0 && <> · <b style={{ color: 'var(--ink)' }}>{a.valoracion.toFixed(1)}</b> en Google ({a.resenas.toLocaleString('es-ES')}){a.precio && ` · ${a.precio}`}</>}
        </p>
        <div className={mun.sitioAcciones}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`} target="_blank" rel="noopener">Cómo llegar →</a>
          {a.telefono && <a href={`tel:${a.telefono.replace(/\s+/g, '')}`}>{a.telefono}</a>}
          {a.web && <a href={a.web} target="_blank" rel="noopener nofollow">Web</a>}
        </div>
      </div>
    </li>
  )

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(miga) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroMunicipio
        foto={fotoHero ? { url: fotoHero.url, autor: fotoHero.autor, alt: `${masCerca.playa.nombre}, ${municipio.nombre}` } : null}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
          <Link href={`/provincia/${municipio.provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link> : <span>{municipio.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Dormir</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio.provincia} · {todos.length} alojamientos · {primeraLinea.length} a pie de playa
        </div>
        <h1 className={mun.heroTitulo}>Dónde dormir en {municipio.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>
          El que duerme más cerca de la arena es <b>{masCerca.nombre}</b>, a {metros(masCerca.playa.metros)} de {masCerca.playa.nombre}.
          {primeraLinea.length > 1 ? ` ${primeraLinea.length} están a menos de 300 metros de una playa.` : ''}
        </p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="dormir" />

      <main className={mun.cuerpo}>
        <section id="alojamientos">
          <div className={mun.seccionCab}>
            <h2 className={mun.h2}>De la arena hacia <em>dentro</em></h2>
            <span className={mun.meta}>ordenados por distancia a la playa</span>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.7rem' }}>
            {todos.slice(0, 24).map((a, i) => <Ficha key={a.id} a={a} i={i} />)}
          </ol>
          {todos.length > 24 && (
            <p style={{ margin: '.7rem 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>
              Y otros {todos.length - 24} alojamientos más por el municipio.
            </p>
          )}
        </section>

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

        {valorados.length >= 3 && (
          <section id="mejor-valorados">
            <div className={mun.seccionCab}>
              <h2 className={mun.h2}>Los mejor <em>valorados</em></h2>
              <span className={mun.meta}>4,3 o más en Google, con 50 reseñas mínimo</span>
            </div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.7rem' }}>
              {valorados.slice(0, 8).map((a, i) => <Ficha key={`v-${a.id}`} a={a} i={i} />)}
            </ol>
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
          La distancia es en línea recta hasta la playa más cercana del municipio; andando será algo más. Los
          alojamientos salen de OpenStreetMap, que escribe gente voluntaria, así que puede faltar alguno o haber
          cerrado. Las valoraciones son de Google y están congeladas en el momento de la consulta, no en vivo.
          Aquí no se reserva ni se ven precios por noche: eso, en la web de cada alojamiento.
        </p>

        <Hueco zona="cierre" bloque={SLOTS.cierre} />
        <DelMunicipio nombre={municipio.nombre} enlaces={enlaces} actual="dormir" />
      </main>
    </>
  )
}
