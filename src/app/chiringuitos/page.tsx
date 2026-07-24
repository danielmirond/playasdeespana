// src/app/chiringuitos/page.tsx — Hub "Chiringuitos de playa".
// Antes: plantilla por provincia sin un solo chiringuito real. Ahora:
// establecimientos REALES de Google Places (sidecar src/data/chiringuitos.json,
// scripts/build-chiringuitos.mjs, gate de ≥5 con reseñas por provincia).
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import chiringuitosData from '@/data/chiringuitos.json'

export const revalidate = 86400

const BASE = 'https://playas-espana.com'

interface Estudio {
  googleId: string; nombre: string; rating: number; reseñas: number
  tipo: string; lat: number; lng: number
  playaCercana: { slug: string; nombre: string; distM: number } | null
}
interface ProvEntry { provincia: string; comunidad: string; estudios: Estudio[] }
const DATA = chiringuitosData as Record<string, ProvEntry>

export const metadata: Metadata = {
  title: 'Chiringuitos de playa en España: los mejores por provincia',
  description: 'Los chiringuitos de las playas de España, por provincia: valoraciones y reseñas reales de Google y en qué playa está cada uno. Espetos, tinto de verano y los pies en la arena.',
  alternates: { canonical: '/chiringuitos' },
  openGraph: {
    type: 'website', url: `${BASE}/chiringuitos`,
    images: [{ url: '/api/og?playa=Chiringuitos%20de%20playa', width: 1200, height: 630 }],
  },
}

const FAQ = [
  { q: '¿Cómo elegimos los chiringuitos que aparecen aquí?', a: 'Solo listamos establecimientos reales verificados en Google, con valoraciones y reseñas públicas. Los ordenamos por número de reseñas (popularidad real, no publicidad) y mostramos en qué playa de nuestra guía está cada uno, para que puedas mirar el estado del mar antes de ir.' },
  { q: '¿Cuándo abren los chiringuitos?', a: 'La mayoría funciona de mayo-junio a septiembre-octubre, aunque en el sur y en Canarias muchos abren todo el año. En julio y agosto conviene reservar mesa para comer, sobre todo los fines de semana: los mejor valorados se llenan a diario.' },
  { q: '¿Qué se come en un chiringuito?', a: 'Depende de la costa: espetos de sardinas en Málaga, pescaíto frito en Cádiz, arroces en la Comunitat Valenciana, pulpo y marisco en Galicia, o pescado a la brasa en el Cantábrico. La regla de oro: pregunta el pescado del día y mira las reseñas recientes, que es lo que hacemos nosotros para ordenarlos.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

export default function ChiringuitosPage() {
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
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Chiringuitos</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Chiringuitos <em style={{ fontWeight: 500, color: 'var(--accent)' }}>de playa</em>
        </h1>
        <p data-speakable style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 .5rem', maxWidth: 640 }}>
          {total} chiringuitos reales en las playas de España, en {provincias.length} provincias. Cada uno con su
          valoración de Google, sus reseñas y la playa de nuestra guía en la que está — para elegir mesa
          mirando antes cómo está el mar.
        </p>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', margin: '0 0 2rem' }}>
          Establecimientos verificados vía Google · solo provincias con oferta real.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '.65rem' }}>
          {provincias.map(p => (
            <Link key={p.slug} href={`/chiringuitos/${p.slug}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.85rem 1rem', textDecoration: 'none' }}>
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
          <Link href="/banderas-hoy" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas en las playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Antes del chiringuito, mira el mar.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
