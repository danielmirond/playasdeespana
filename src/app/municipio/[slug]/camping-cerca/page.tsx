// /municipio/[slug]/camping-cerca — los campings cerca de las playas del municipio.
//
// POR QUÉ. «camping tarragona», «camping cerca de la playa X», «camping en
// primera línea»: 18.765 impresiones en dos meses de GSC en consultas de
// camping y caravana, y en /campings/tarragona 1.405 impresiones con cero
// clics. Estábamos en la SERP con una página que no daba nada que las de
// reservas no tuvieran. Esta da lo único que ellas no tienen: a qué playa
// le queda más cerca cada camping, a cuántos metros, y cómo está esa playa
// hoy (bandera, socorrismo, perros).
//
// LO QUE NO SE HACE. Ni precios ni fotos ni reseñas: OpenStreetMap no los
// tiene. Buscatucamping tiene 35 servicios y 5 fotos por camping; nosotros
// tenemos la playa. Cada camping enlaza a su web cuando la tiene y, cuando
// exista el ID de Pitchup, a la reserva.
//
// COBERTURA. 461 municipios con dos campings o más (media 4,4). Sin datos,
// notFound(): la lista la decide lib/enlaces-municipio, la misma que pinta
// el enlace, así que no hay enlace a un 404.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getMunicipios, getPlayasByMunicipio } from '@/lib/playas'
import { campingsDelMunicipio, metros, MINIMO_CAMPINGS } from '@/lib/campings-municipio'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { comunidadDe } from '@/lib/comunidad'
import { getFotos } from '@/lib/fotos'
import HeroMunicipio from '@/components/municipio/HeroMunicipio'
import NavMunicipio from '@/components/municipio/NavMunicipio'
import DelMunicipio from '@/components/ui/DelMunicipio'
import Pictograma from '@/components/municipio/Pictograma'
import mun from '@/components/municipio/Municipio.module.css'

export const revalidate = 604800     // los campings cambian poco
export const maxDuration = 30
export const dynamicParams = true
export function generateStaticParams() { return [] }

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = (await getMunicipios(1)).find(x => x.slug === slug)
  if (!m) return {}
  return {
    title: `Campings cerca de ${m.nombre}: cuál queda más cerca de la playa`,
    description: `Los campings a menos de 10 km de las playas de ${m.nombre}, ordenados por distancia a la arena, con la playa que le queda más cerca a cada uno y cómo está hoy.`,
    alternates: { canonical: `/municipio/${slug}/camping-cerca` },
  }
}

export default async function CampingCercaPage({ params }: Props) {
  const { slug } = await params
  const municipios = await getMunicipios(1)
  const municipio = municipios.find(m => m.slug === slug)
  if (!municipio) notFound()
  const playas = await getPlayasByMunicipio(slug)
  const campings = await campingsDelMunicipio(playas)
  if (campings.length < MINIMO_CAMPINGS) notFound()

  const tienePaginaMuni = municipio.count >= 4
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)

  // Foto de cabecera: la de la playa más cercana al camping más cercano.
  const playaHero = playas.find(p => p.slug === campings[0].playa.slug) ?? playas[0]
  const fotoHero = playaHero
    ? (await getFotos(playaHero.nombre, playaHero.municipio, playaHero.lat, playaHero.lng, playaHero.provincia, playaHero.slug)).find(f => f.fuente !== 'generica')
    : null

  const masCerca = campings[0]
  const conPerros = campings.filter(c => c.playa.perros)
  const enPrimeraLinea = campings.filter(c => c.playa.metros <= 500)

  const faq = [
    {
      q: `¿Cuál es el camping más cerca de la playa en ${municipio.nombre}?`,
      a: `${masCerca.nombre}, a ${metros(masCerca.playa.metros)} de ${masCerca.playa.nombre}${masCerca.playa.bandera ? ', que tiene Bandera Azul' : ''}.${enPrimeraLinea.length > 1 ? ` Hay ${enPrimeraLinea.length} campings a menos de 500 metros de una playa.` : ''}`,
    },
    {
      q: `¿Hay camping cerca de una playa para perros en ${municipio.nombre}?`,
      a: conPerros.length
        ? `Sí: ${conPerros.slice(0, 3).map(c => `${c.nombre} (a ${metros(c.playa.metros)} de ${c.playa.nombre})`).join(', ')}. La playa admite perros según el inventario oficial; conviene comprobar la temporada.`
        : `Ninguna de las playas más cercanas a estos campings admite perros según el inventario oficial de ${municipio.nombre}.`,
    },
    {
      q: `¿Cuántos campings hay cerca de las playas de ${municipio.nombre}?`,
      a: `${campings.length}, todos a menos de 10 km de alguna de sus ${playas.length} ${playas.length === 1 ? 'playa' : 'playas'}. Los datos son de OpenStreetMap: nombre, contacto y ubicación. Precios y disponibilidad, en la web de cada camping.`,
    },
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
        foto={fotoHero ? { url: fotoHero.url, autor: fotoHero.autor, alt: `${playaHero!.nombre}, ${municipio.nombre}` } : null}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
          <Link href={`/provincia/${municipio.provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link> : <span>{municipio.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Campings</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio.provincia} · {campings.length} campings · {playas.length} {playas.length === 1 ? 'playa' : 'playas'}
        </div>
        <h1 className={mun.heroTitulo}>Campings cerca de {municipio.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>
          El que más cerca queda de la arena es <b>{masCerca.nombre}</b>, a {metros(masCerca.playa.metros)} de {masCerca.playa.nombre}.
          {enPrimeraLinea.length > 1 ? ` ${enPrimeraLinea.length} campings están a menos de 500 metros de una playa.` : ''}
        </p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="campings" />

      <main className={mun.cuerpo}>
        <section id="campings">
          <div className={mun.seccionCab}>
            <h2 className={mun.h2}>De la arena hacia <em>dentro</em></h2>
            <span className={mun.meta}>ordenados por distancia a la playa</span>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.75rem' }}>
            {campings.map((c, i) => (
              <li key={c.id} className={mun.sitio} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                <div style={{ width: 92, flexShrink: 0, background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.3rem', color: '#faf4e6' }}>
                  <Pictograma tipo="camping" size={34} />
                  <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.62rem' }}>{i + 1}</span>
                </div>
                <div className={mun.sitioCuerpo} style={{ flex: 1, minWidth: 0 }}>
                  <div className={mun.sitioNombre}>
                    {c.website ? <a href={c.website} target="_blank" rel="noopener nofollow" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted var(--muted)' }}>{c.nombre}</a> : c.nombre}
                    {c.estrellas > 0 && <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '.5rem' }}>{'★'.repeat(Math.min(c.estrellas, 5))}</span>}
                  </div>
                  <p className={mun.sitioResumen} style={{ margin: 0 }}>
                    A <b style={{ color: 'var(--ink)' }}>{metros(c.playa.metros)}</b> de{' '}
                    <Link href={`/playas/${c.playa.slug}`} style={{ color: 'var(--ink)', fontWeight: 600 }}>{c.playa.nombre}</Link>
                    {c.playa.bandera && ' · Bandera Azul'}{c.playa.socorrismo && ' · socorrismo'}{c.playa.perros && ' · admite perros'}
                  </p>
                  <div className={mun.sitioAcciones}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`} target="_blank" rel="noopener">Cómo llegar →</a>
                    {c.telefono && <a href={`tel:${c.telefono.replace(/\s+/g, '')}`}>{c.telefono}</a>}
                    {c.website && <a href={c.website} target="_blank" rel="noopener nofollow">Web</a>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p style={{ margin: '.75rem 0 0', fontSize: '.78rem', lineHeight: 1.5, color: 'var(--muted)' }}>
            La distancia es en línea recta hasta la playa más cercana del municipio; andando será algo más. Los campings y sus datos
            salen de OpenStreetMap, que escribe gente voluntaria: puede faltar alguno o haber cerrado. Precios y disponibilidad, en cada web.
          </p>
        </section>

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

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

        <Hueco zona="cierre" bloque={SLOTS.cierre} />
        <DelMunicipio nombre={municipio.nombre} enlaces={enlaces} actual="campings" />
      </main>
    </>
  )
}
