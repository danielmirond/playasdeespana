// /municipio/[slug]/chiringuitos — a pie de qué playa está cada chiringuito.
//
// POR QUÉ. El hub por provincia mezcla toda la costa y no sirve a quien ya
// sabe a qué pueblo va. Aquí la pregunta es la de verdad: en qué playa del
// municipio se come al lado del agua, y cuál de los chiringuitos está mejor
// valorado. Eso lo sabemos: valoración y reseñas de Google, y la distancia
// a la arena calculada con nuestro dataset.
//
// LO QUE NO HAY: carta, precios ni horarios. Google no los da en el tramo
// que usamos y no se inventan.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { getMunicipios, getPlayasByMunicipio, MIN_PLAYAS_MUNICIPIO } from '@/lib/playas'
import { chiringuitosDelMunicipio, tieneChiringuitos, metros } from '@/lib/chiringuitos-municipio'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { comunidadDe } from '@/lib/comunidad'
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
    title: `Chiringuitos en ${m.nombre}: en qué playa está cada uno`,
    description: `Los chiringuitos de ${m.nombre} ordenados por distancia a la arena, con la playa en la que está cada uno y su valoración en Google.`,
    alternates: { canonical: `/municipio/${slug}/chiringuitos` },
  }
}

export default async function ChiringuitosMunicipioPage({ params }: Props) {
  const { slug } = await params
  const municipio = (await getMunicipios(1)).find(m => m.slug === slug)
  if (!municipio) notFound()
  const playas = await getPlayasByMunicipio(slug)
  if (!(await tieneChiringuitos(playas))) notFound()

  const todos = await chiringuitosDelMunicipio(playas)
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)
  const tienePaginaMuni = municipio.count >= MIN_PLAYAS_MUNICIPIO

  const enLaArena = todos.filter(c => c.playa.metros <= 150)
  const mejores = [...todos].filter(c => c.resenas >= 100)
    .sort((a, b) => b.valoracion - a.valoracion || b.resenas - a.resenas)
  const primero = todos[0]
  // Cuántos por playa: eso es lo que nadie publica.
  const porPlaya = new Map<string, { nombre: string; n: number }>()
  for (const c of todos) {
    const e = porPlaya.get(c.playa.slug) ?? { nombre: c.playa.nombre, n: 0 }
    e.n++; porPlaya.set(c.playa.slug, e)
  }
  const playasOrdenadas = [...porPlaya.entries()].sort((a, b) => b[1].n - a[1].n)

  const fotoHero = (await getFotos(primero.playa.nombre, municipio.nombre,
    playas.find(p => p.slug === primero.playa.slug)?.lat ?? 0,
    playas.find(p => p.slug === primero.playa.slug)?.lng ?? 0,
    municipio.provincia, primero.playa.slug)).find(f => f.fuente !== 'generica')

  const faq = [
    {
      q: `¿Qué playa de ${municipio.nombre} tiene más chiringuitos?`,
      a: playasOrdenadas.length
        ? `${playasOrdenadas[0][1].nombre}, con ${playasOrdenadas[0][1].n}. En total hay ${todos.length} repartidos por ${porPlaya.size} ${porPlaya.size === 1 ? 'playa' : 'playas'}.`
        : '',
    },
    {
      q: `¿Cuál es el chiringuito mejor valorado de ${municipio.nombre}?`,
      a: mejores.length
        ? `${mejores[0].nombre}, con ${mejores[0].valoracion.toFixed(1)} en Google sobre ${mejores[0].resenas.toLocaleString('es-ES')} reseñas. Está en ${mejores[0].playa.nombre}, a ${metros(mejores[0].playa.metros)} de la arena.`
        : `Ninguno tiene suficientes reseñas en Google para compararlos con criterio.`,
    },
    {
      q: `¿Hay chiringuitos a pie de playa en ${municipio.nombre}?`,
      a: enLaArena.length
        ? `${enLaArena.length} están a menos de 150 metros de la arena: ${enLaArena.slice(0, 3).map(c => `${c.nombre} (${c.playa.nombre})`).join(', ')}.`
        : `Los más cercanos quedan a más de 150 metros de la arena.`,
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
        foto={fotoHero ? { url: fotoHero.url, autor: fotoHero.autor, alt: `${primero.playa.nombre}, ${municipio.nombre}` } : null}
        miga={<>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (<><Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link><span aria-hidden="true">›</span></>) })()}
          <Link href={`/provincia/${municipio.provinciaSlug}`}>{municipio.provincia}</Link><span aria-hidden="true">›</span>
          {tienePaginaMuni ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link> : <span>{municipio.nombre}</span>}
          <span aria-hidden="true">›</span><span aria-current="page">Chiringuitos</span>
        </>}
      >
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .9 }}>
          {municipio.provincia} · {todos.length} chiringuitos · {porPlaya.size} {porPlaya.size === 1 ? 'playa' : 'playas'}
        </div>
        <h1 className={mun.heroTitulo}>Chiringuitos en {municipio.nombre}</h1>
        <p data-speakable className={mun.heroLede} style={{ margin: 0 }}>
          El más pegado a la arena es <b>{primero.nombre}</b>, a {metros(primero.playa.metros)} de {primero.playa.nombre}.
          {playasOrdenadas.length > 1 && ` Donde más hay es en ${playasOrdenadas[0][1].nombre}, ${playasOrdenadas[0][1].n}.`}
        </p>
      </HeroMunicipio>

      <NavMunicipio enlaces={enlaces} actual="chiringuitos" />

      <main className={mun.cuerpo}>
        <section id="chiringuitos">
          <div className={mun.seccionCab}>
            <h2 className={mun.h2}>Con los pies en la <em>arena</em></h2>
            <span className={mun.meta}>ordenados por distancia a la playa</span>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.7rem' }}>
            {todos.map((c, i) => (
              <li key={c.id} className={mun.sitio} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                <div style={{ width: 64, flexShrink: 0, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.15rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.62rem', color: 'var(--muted)' }}>{i + 1}</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)' }}>{metros(c.playa.metros)}</span>
                </div>
                <div className={mun.sitioCuerpo} style={{ flex: 1, minWidth: 0 }}>
                  <div className={mun.sitioNombre}>{c.nombre}</div>
                  <p className={mun.sitioResumen} style={{ margin: 0 }}>
                    En <Link href={`/playas/${c.playa.slug}`} style={{ color: 'var(--ink)', fontWeight: 600 }}>{c.playa.nombre}</Link>
                    {c.playa.bandera && ' · Bandera Azul'}{c.playa.socorrismo && ' · socorrismo'}
                    {c.valoracion > 0 && <> · <b style={{ color: 'var(--ink)' }}>{c.valoracion.toFixed(1)}</b> en Google ({c.resenas.toLocaleString('es-ES')})</>}
                  </p>
                  <div className={mun.sitioAcciones}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`} target="_blank" rel="noopener">Cómo llegar →</a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />

        {playasOrdenadas.length > 1 && (
          <section id="por-playa">
            <div className={mun.seccionCab}><h2 className={mun.h2}>Dónde se <em>concentran</em></h2></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
              {playasOrdenadas.map(([s, p]) => (
                <li key={s}>
                  <Link href={`/playas/${s}`} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '.4rem', padding: '.4rem .8rem', borderRadius: 100, border: '1px solid var(--line)', fontSize: '.84rem', color: 'var(--ink)' }}>
                    {p.nombre}
                    <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.72rem', color: 'var(--muted)' }}>{p.n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="faq">
          <div className={mun.seccionCab}><h2 className={mun.h2}>Preguntas <em>frecuentes</em></h2></div>
          <dl style={{ margin: 0 }}>
            {faq.filter(f => f.a).map(f => (
              <div key={f.q} style={{ marginBottom: '1rem' }}>
                <dt style={{ fontWeight: 600, marginBottom: '.2rem' }}>{f.q}</dt>
                <dd style={{ margin: 0, lineHeight: 1.65, color: 'var(--muted)' }}>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          Los chiringuitos y sus valoraciones son de Google, consultados una vez y guardados: no están en vivo, así que
          alguno puede haber cerrado o cambiado de nombre. La distancia a la arena la calculamos nosotros en línea recta.
          Ni cartas ni precios ni horarios: eso hay que mirarlo en cada sitio.
        </p>

        <Hueco zona="cierre" bloque={SLOTS.cierre} />
        <DelMunicipio nombre={municipio.nombre} enlaces={enlaces} actual="chiringuitos" />
      </main>
    </>
  )
}
