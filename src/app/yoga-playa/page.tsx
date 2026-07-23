// src/app/yoga-playa/page.tsx — Hub "Yoga y pilates cerca de la playa".
// Vertical REVIVIDA: la versión antigua era plantilla sin datos y la
// auditoría la retiró con 410. Esta se construye sobre establecimientos
// REALES de Google Places (sidecar src/data/yoga-estudios.json, generado
// por scripts/build-yoga-estudios.mjs con gate de calidad: solo provincias
// con ≥3 estudios con reseñas).
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import estudiosData from '@/data/yoga-estudios.json'

export const revalidate = 86400

const BASE = 'https://playas-espana.com'

interface Estudio {
  googleId: string; nombre: string; rating: number; reseñas: number
  tipo: string; lat: number; lng: number
  playaCercana: { slug: string; nombre: string; distM: number } | null
}
interface ProvEntry { provincia: string; comunidad: string; estudios: Estudio[] }
const DATA = estudiosData as Record<string, ProvEntry>

export const metadata: Metadata = {
  title: 'Yoga y pilates cerca de la playa | Estudios reales por provincia',
  description: 'Estudios de yoga y pilates cerca de las playas de España, por provincia costera: valoraciones reales, reseñas y a qué playa te pilla cada uno. Del saludo al sol al baño en el mar.',
  alternates: { canonical: '/yoga-playa' },
  openGraph: {
    type: 'website', url: `${BASE}/yoga-playa`,
    images: [{ url: '/api/og?playa=Yoga%20y%20pilates%20en%20la%20playa', width: 1200, height: 630 }],
  },
}

const FAQ = [
  { q: '¿Qué tiene de especial practicar yoga cerca del mar?', a: 'El entorno hace la mitad del trabajo: el sonido del mar regula la respiración de forma natural, la arena obliga a trabajar el equilibrio con más músculos estabilizadores, y la sesión al amanecer o al atardecer añade la luz y la temperatura perfectas. Muchos de los estudios de esta guía ofrecen sesiones en la propia playa en verano.' },
  { q: '¿Cómo elegimos los estudios que aparecen aquí?', a: 'Solo listamos establecimientos reales verificados en Google, con valoraciones y reseñas públicas, y solo publicamos provincias donde hay una oferta mínima real. Mostramos su puntuación, número de reseñas y a qué playa de nuestra guía queda más cerca cada estudio.' },
  { q: '¿Yoga o pilates para empezar?', a: 'Si buscas movilidad, respiración y relajación, empieza por yoga (hatha o vinyasa suave). Si tu objetivo es fuerza de core, postura y control, pilates. Muchos estudios de la lista ofrecen ambos y clase de prueba: mira sus reseñas y llama antes de ir en temporada alta.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

export default function YogaPlayaPage() {
  const provincias = Object.entries(DATA)
    .map(([slug, v]) => ({ slug, ...v, count: v.estudios.length }))
    .sort((a, b) => b.count - a.count)
  const total = provincias.reduce((s, p) => s + p.count, 0)

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Yoga y pilates</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Yoga y pilates <em style={{ fontWeight: 500, color: 'var(--accent)' }}>cerca de la playa</em>
        </h1>
        <p data-speakable style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 .5rem', maxWidth: 640 }}>
          {total} estudios reales de yoga y pilates a menos de 15 km de la costa, en {provincias.length} provincias.
          Cada uno con su valoración de Google, sus reseñas y la playa de nuestra guía que le queda al lado —
          para encadenar esterilla y baño sin coger el coche.
        </p>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', margin: '0 0 2rem' }}>
          Establecimientos verificados vía Google · solo provincias con oferta real.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '.65rem' }}>
          {provincias.map(p => (
            <Link key={p.slug} href={`/yoga-playa/${p.slug}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.85rem 1rem', textDecoration: 'none' }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)' }}>{p.provincia}</span>
                <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.comunidad}</span>
              </span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.78rem', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.count}</span>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '2.5rem 0 1rem' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2.5rem', maxWidth: 800 }}>
          {FAQ.map(f => (
            <details key={f.q} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.8rem 1rem' }}>
              <summary style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.6, margin: '.6rem 0 0' }}>{f.a}</p>
            </details>
          ))}
        </div>

        {/* Cross-links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.6rem', maxWidth: 800 }}>
          <Link href="/temperatura-del-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Temperatura del agua hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Para el baño después de la esterilla.</span>
          </Link>
          <Link href="/prediccion-fin-de-semana" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Predicción del finde <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Planifica la sesión al aire libre.</span>
          </Link>
          <Link href="/playas-paradisiacas" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Playas paradisíacas <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>El escenario para el saludo al sol.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
