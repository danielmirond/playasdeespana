// src/app/mejores-playas/page.tsx — PILAR: "Las 100 mejores playas de
// España 2026". La página-premio anual (jugada digital-PR estilo Golden
// Beach Award de BeachAtlas, pero defendible: metodología pública sobre
// datos objetivos, cero votos de influencers).
//
// El ranking se computa OFFLINE una vez al año (scripts/build-ranking-2026.mjs
// → src/data/ranking-2026.json): un premio que baila cada hora no es citable
// por la prensa. Las páginas por provincia (/mejores-playas/[provincia])
// siguen siendo dinámicas y conviven con esta.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import ranking from '@/data/ranking-2026.json'
import { PLAYAS_APROX } from '@/lib/playas'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

interface Entrada {
  slug: string; nombre: string; municipio: string; provincia: string
  comunidad: string; score: number; pos: number
  ejes: { entorno: number; servicios: number; distintivos: number; experiencia: number }
  razones: string[]
}
const TOP100 = ranking.top100 as Entrada[]
const PROVINCIAS = ranking.provincias as Record<string, Array<{ slug: string; nombre: string; municipio: string; score: number }>>

export const metadata: Metadata = {
  title: 'Las 100 mejores playas de España 2026 | Ranking por datos',
  description: 'El ranking 2026 de las mejores playas de España, puntuadas 0-100 con datos objetivos: entorno natural, seguridad y servicios, Bandera Azul, calidad del agua y oferta a pie de playa. Con el top de cada provincia.',
  alternates: { canonical: '/mejores-playas' },
  openGraph: {
    title: 'Las 100 mejores playas de España 2026 | Ranking por datos',
    description: 'Metodología pública y datos objetivos: entorno, servicios, distintivos y experiencia. Sin votos, sin patrocinios.',
    url: `${BASE}/mejores-playas`,
    images: [{ url: '/api/og?playa=Las+100+mejores+playas+2026', width: 1200, height: 630 }],
  },
}

const FAQ = [
  {
    q: '¿Cómo se elige la mejor playa de España en este ranking?',
    a: `Cada una de las ${PLAYAS_APROX} playas del catálogo (MITECO, OpenStreetMap y CartoCiudad) recibe una puntuación 0-100 en cuatro ejes: entorno natural (30 puntos: espacio protegido, grado de urbanización, vegetación, ocupación), seguridad y servicios (35: socorrismo, accesibilidad, duchas, parking…), distintivos y calidad del agua (25: Bandera Azul 2026, calidad EEA; una Bandera Negra de Ecologistas en Acción resta 25) y experiencia (10: chiringuitos, webcam, spots de surf o buceo, alojamiento cercano). Sin jurado, sin votos y sin patrocinios: solo datos públicos.`,
  },
  {
    q: '¿Por qué no está mi playa favorita?',
    a: 'Dos motivos posibles. Primero, el ranking premia el equilibrio entre naturaleza y equipamiento: una playa urbana icónica puede quedarse fuera del top nacional y aun así liderar su provincia (abajo tienes el top 5 de las 49 provincias y ciudades costeras). Segundo, la puntuación sale del inventario oficial: si la ficha MITECO de una playa está incompleta, no puede sumar los puntos de los campos que faltan. Preferimos ese sesgo reconocido a inventarnos datos.',
  },
  {
    q: '¿Cada cuánto se actualiza el ranking?',
    a: 'Una vez al año, con las Banderas Azules de ADEAC, el informe de Banderas Negras de Ecologistas en Acción y la última temporada de calidad de aguas de la EEA. La edición 2026 se publicó en julio. El estado del mar de cada playa (bandera de hoy, temperatura del agua, oleaje) sí se actualiza cada hora en su ficha.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Las 100 mejores playas de España 2026',
  description: 'Ranking anual por datos objetivos: entorno, servicios, distintivos y experiencia.',
  url: `${BASE}/mejores-playas`,
  numberOfItems: TOP100.length,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  itemListElement: TOP100.map(p => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.nombre} (${p.municipio}, ${p.provincia})`,
    url: `${BASE}/playas/${p.slug}`,
  })),
}

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function MejoresPlayasPage() {
  const provinciasOrden = Object.keys(PROVINCIAS).sort((a, b) => a.localeCompare(b, 'es'))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Mejores playas 2026</span>
        </nav>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '.7rem', fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>
          Ranking anual · edición {ranking.temporada}
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, marginBottom: '.75rem', letterSpacing: '-.015em' }}>
          Las 100 mejores playas de España, <em style={{ fontWeight: 500, color: 'var(--accent)' }}>según los datos</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 680, marginBottom: '1.5rem' }}>
          Sin jurado, sin votos de influencers y sin patrocinios: {PLAYAS_APROX} playas del
          catálogo puntuadas 0-100 con datos públicos — entorno natural, seguridad y servicios,
          Bandera Azul y calidad del agua, y oferta a pie de arena. El mismo criterio para la cala gallega
          y para el arenal mediterráneo. Abajo, el top 5 de cada provincia.
        </p>

        {/* Metodología visible — la credibilidad ES el producto */}
        <section aria-labelledby="h2-metodo" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.25rem 1.4rem', marginBottom: '2.5rem' }}>
          <h2 id="h2-metodo" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Cómo puntuamos (0-100)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.75rem', fontSize: '.82rem', lineHeight: 1.55, color: 'var(--muted)' }}>
            <div><strong style={{ color: 'var(--ink)' }}>Entorno natural · 30 pts</strong><br />Espacio protegido, grado de urbanización, vegetación y nivel de ocupación (MITECO).</div>
            <div><strong style={{ color: 'var(--ink)' }}>Seguridad y servicios · 35 pts</strong><br />Socorrismo, accesibilidad PMR, duchas, aseos, parking, zona infantil, limpieza y autobús.</div>
            <div><strong style={{ color: 'var(--ink)' }}>Distintivos y agua · 25 pts</strong><br />Bandera Azul 2026 (ADEAC) y calidad del agua excelente (EEA). Una Bandera Negra resta 25.</div>
            <div><strong style={{ color: 'var(--ink)' }}>Experiencia · 10 pts</strong><br />Chiringuitos a pie de playa, webcam, spots de surf o buceo y alojamiento cercano.</div>
          </div>
          <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.85rem', lineHeight: 1.5 }}>
            Máximo 3 playas por municipio y 8 por provincia en el top nacional, para que el inventario más
            detallado de unas comunidades no eclipse al resto. Si la ficha oficial de una playa está incompleta,
            no puntúa en los campos que faltan: preferimos ese sesgo reconocido a rellenar datos a mano.
          </p>
        </section>

        {/* TOP 100 */}
        <section aria-labelledby="h2-top100" style={{ marginBottom: '3rem' }}>
          <h2 id="h2-top100" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            El top 100 de {ranking.temporada}
          </h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
            {TOP100.map(p => (
              <li key={p.slug}>
                <Link href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'baseline', gap: '.75rem',
                  padding: '.6rem .8rem', background: p.pos <= 10 ? 'var(--card-bg)' : 'transparent',
                  border: '1px solid', borderColor: p.pos <= 10 ? 'var(--line)' : 'transparent',
                  borderRadius: 6, textDecoration: 'none',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.8rem', fontWeight: 700, color: p.pos <= 10 ? 'var(--accent)' : 'var(--muted)', minWidth: '2.2rem', textAlign: 'right' }}>{p.pos}.</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.98rem', color: 'var(--ink)' }}>{p.nombre}</span>
                    <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}> · {p.municipio}, {p.provincia}</span>
                    {p.pos <= 25 && p.razones.length > 0 && (
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)', marginTop: '.1rem' }}>{p.razones.join(' · ')}</span>
                    )}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>{p.score}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Top por provincia — la mina de titulares locales */}
        <section aria-labelledby="h2-provincias" style={{ marginBottom: '3rem' }}>
          <h2 id="h2-provincias" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>
            La mejor playa de cada provincia
          </h2>
          <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '1.25rem', maxWidth: 640, lineHeight: 1.6 }}>
            El mismo baremo, provincia a provincia: aquí sí compiten solo entre vecinas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.75rem' }}>
            {provinciasOrden.map(prov => (
              <div key={prov} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.9rem 1.05rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '.98rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{prov}</h3>
                  <Link href={`/mejores-playas/${toSlug(prov)}`} style={{ fontSize: '.68rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Ver ranking →</Link>
                </div>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.8rem', lineHeight: 1.9 }}>
                  {PROVINCIAS[prov].map((p, i) => (
                    <li key={p.slug} style={{ display: 'flex', gap: '.45rem', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.68rem', color: 'var(--muted)' }}>{i + 1}.</span>
                      <Link href={`/playas/${p.slug}`} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: i === 0 ? 700 : 400, flex: 1 }}>{p.nombre}</Link>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.68rem', color: 'var(--muted)' }}>{p.score}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ — respaldada por el FAQPage schema de arriba */}
        <section aria-labelledby="h2-faq-ranking">
          <h2 id="h2-faq-ranking" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.25rem' }}>
            Preguntas sobre el <em style={{ fontWeight: 500, color: 'var(--accent)' }}>ranking</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {FAQ.map(item => (
              <details key={item.q} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1.1rem' }}>
                <summary style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none' }}>{item.q}</summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, margin: '.75rem 0 .15rem' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
