// src/app/webcams/page.tsx — Hub de webcams de playa de España. Captura
// "webcam playa" y "playa X webcam" (intención muy alta en verano). Lee el
// sidecar src/data/webcams-espana.json (generado offline por
// scripts/build-webcams.mjs desde Windy, solo categoría beach/coast), sin
// llamar a Windy por request. Cada cámara enlaza a la ficha de su playa.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import AuthorByline from '@/components/seo/AuthorByline'
import { getFileLastModified } from '@/lib/dateModified'
import WebcamsHub, { type HubGroup, type HubWebcam } from '@/components/webcams/WebcamsHub'
import webcamsData from '@/data/webcams-espana.json'

export const revalidate = 86400

const MODIFIED = getFileLastModified('src/data/webcams-espana.json')
const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Webcams de playas de España en directo | Por comunidad',
  description: 'Webcams de playa en directo de toda España, por comunidad autónoma: mira el estado del mar en tiempo real playa a playa antes de ir. Solo cámaras de playa y costa.',
  alternates: { canonical: '/webcams' },
  openGraph: {
    type: 'website', url: `${BASE}/webcams`,
    images: [{ url: '/api/og?playa=Webcams%20de%20playas%20en%20directo', width: 1200, height: 630 }],
  },
}

interface RawCam {
  id: string; title: string; thumb: string | null; embedUrl: string | null
  provincia: string; comunidad: string; municipio: string | null
  playaSlug: string | null; playaNombre: string | null
}

const FAQ = [
  { q: '¿Para qué sirve ver la webcam de una playa antes de ir?', a: 'Una webcam en directo te dice de un vistazo lo que ningún parte resume igual de bien: si hay mucha gente, cómo está el mar, si hay niebla o viento, si hay sitio en la arena. Es la forma más rápida de decidir a qué playa ir hoy, o de evitar el chasco de llegar y encontrarla llena o revuelta.' },
  { q: '¿Estas webcams son de playa de verdad?', a: 'Sí. Solo incluimos cámaras clasificadas como de playa o costa (categorías "beach" o "coast" de Windy). Descartamos las de ciudad, tráfico, puertos e interior, para que todo lo que veas mire de verdad al mar.' },
  { q: '¿Cada cuánto se actualizan?', a: 'La imagen es en directo: al pulsar una cámara se abre su reproductor en tiempo real. El listado de cámaras disponibles se revisa periódicamente. Las imágenes proceden de Windy.com, que agrega webcams públicas de toda la costa.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

export default function WebcamsPage() {
  const cams = webcamsData as RawCam[]

  // Agrupar por comunidad, ordenadas por nº de cámaras (más ricas primero);
  // "España" (sin comunidad clara) al final.
  const map = new Map<string, HubWebcam[]>()
  for (const c of cams) {
    const key = c.comunidad || 'España'
    const list = map.get(key) ?? []
    list.push({
      id: c.id, title: c.title, thumb: c.thumb, embedUrl: c.embedUrl,
      provincia: c.provincia, municipio: c.municipio,
      playaSlug: c.playaSlug, playaNombre: c.playaNombre,
    })
    map.set(key, list)
  }
  const groups: HubGroup[] = [...map.entries()]
    .map(([comunidad, cams]) => ({ comunidad, cams }))
    .sort((a, b) => {
      if (a.comunidad === 'España') return 1
      if (b.comunidad === 'España') return -1
      return b.cams.length - a.cams.length
    })

  const total = cams.length

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Webcams</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Webcams de playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>en directo</em> <span aria-hidden="true">📹</span>
        </h1>
        <AuthorByline
          headline="Webcams de playas de España en directo, por comunidad"
          url={`${BASE}/webcams`}
          dateModified={MODIFIED}
          description="Webcams de playa en directo de toda España por comunidad autónoma, para ver el estado del mar antes de ir."
          articleSection="Estado del mar"
        />
        <p data-speakable style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 .5rem', maxWidth: 640 }}>
          {total} webcams de playa y costa de toda España, agrupadas por comunidad. Pulsa cualquiera para verla
          <strong> en directo</strong> y comprobar el estado del mar, la gente y el tiempo antes de coger el coche.
          Cada cámara enlaza a la ficha de su playa con el pronóstico y los datos oficiales.
        </p>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', margin: '0 0 2rem' }}>
          Imágenes <a href="https://www.windy.com/webcams" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>vía Windy.com</a> · solo cámaras de playa/costa.
        </p>

        <WebcamsHub groups={groups} />

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
          <Link href="/banderas-hoy" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas en las playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Semáforo de oleaje y viento por provincias.</span>
          </Link>
          <Link href="/temperatura-del-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Temperatura del agua hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>¿Dónde está el mar más cálido?</span>
          </Link>
          <Link href="/buscar?orden=score" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Las mejores playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Score 0-100 en tiempo real.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
