// src/app/playas-aguas-cristalinas/page.tsx
// Pillar SEO: "Playas con aguas cristalinas en España"
// Query de alta intención que combina calidad EEA + turbidez calculada
// + Bandera Azul. Página hub que lista las mejores playas por
// transparencia del agua, con enlaces a comunidades/provincias.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import { getTurbidez } from '@/lib/marine'
import type { Playa } from '@/types'
import SchemaItemList from '@/components/seo/SchemaItemList'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Playas con aguas cristalinas en España — Las más transparentes',
  description: 'Descubre las playas de España con aguas más cristalinas y transparentes: Canarias, Islas Baleares, costas de Almería y Menorca. Rankings por visibilidad, calidad EEA y Bandera Azul.',
  alternates: { canonical: '/playas-aguas-cristalinas' },
  openGraph: {
    title: 'Playas con aguas cristalinas en España',
    description: 'Las playas más transparentes de España: ranking por visibilidad del agua, calidad EEA y Bandera Azul.',
    url: `${BASE}/playas-aguas-cristalinas`,
    type: 'article',
  },
  robots: { index: true, follow: true },
}

// Clasifica una playa por su "puntuación de aguas cristalinas" combinando:
// - Zona geográfica (Canarias/Baleares tienen aguas más claras)
// - Turbidez estimada (visibilidad en metros)
// - Bandera Azul (calidad certificada)
// Devuelve score 0-100.
function scoreAguasCristalinas(
  p: Playa,
  turbidez: { visibilidad_m: number } | null,
): number {
  let score = 0

  // Base geográfica (peso 40)
  const esCanarias = p.lat < 30
  const esBaleares = p.comunidad === 'Islas Baleares'
  const esAlmeria  = p.provincia === 'Almería'
  const esMurcia   = p.provincia === 'Murcia'
  const esCatOrMed = ['Cataluña', 'Comunitat Valenciana'].includes(p.comunidad)
  if (esCanarias)        score += 40
  else if (esBaleares)   score += 38
  else if (esAlmeria)    score += 32
  else if (esMurcia)     score += 28
  else if (esCatOrMed)   score += 22
  else                   score += 14  // Atlántico/Cantábrico — aguas más oscuras naturalmente

  // Visibilidad del agua (peso 40). 25m = máxima (Canarias verano)
  const vis = turbidez?.visibilidad_m ?? 10
  score += Math.min(40, Math.round((vis / 25) * 40))

  // Bandera Azul (peso 15)
  if (p.bandera)    score += 15

  // Tipo de playa (peso 5): rocas/arena blanca mejor transparencia
  if (p.composicion?.toLowerCase().includes('arena fina') ||
      p.composicion?.toLowerCase().includes('blanca')) score += 5

  return Math.min(100, score)
}

export default async function Page() {
  const playas = await getPlayas()

  // Calcular score para todas las playas (usa estimación de turbidez
  // server-side, ya cacheado por React.cache)
  const conScore = await Promise.all(
    playas.map(async p => {
      const turb = await getTurbidez(p.lat, p.lng)
      return { ...p, score: scoreAguasCristalinas(p, turb) }
    })
  )

  // Top 30 con score más alto (agrupadas por comunidad para variedad)
  const top30 = [...conScore]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  // Deduplicar por comunidad (máx 5 por comunidad para diversidad)
  const porComunidad = new Map<string, typeof top30>()
  for (const p of top30) {
    const lista = porComunidad.get(p.comunidad) ?? []
    if (lista.length < 5) {
      lista.push(p)
      porComunidad.set(p.comunidad, lista)
    }
  }
  const seleccion = Array.from(porComunidad.values()).flat().slice(0, 30)

  return (
    <>
      <SchemaItemList
        name="Playas con aguas cristalinas en España"
        description="Ranking de las playas españolas con aguas más cristalinas según visibilidad estimada, calidad EEA y Bandera Azul."
        url={`${BASE}/playas-aguas-cristalinas`}
        beaches={seleccion.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
        ordered
      />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Aguas cristalinas</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          Las playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>de aguas más cristalinas</em> de España
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.6 }}>
          Las aguas más transparentes de España están en Canarias, Baleares y zonas concretas
          de Almería y Murcia. Ranking basado en visibilidad estimada, calidad EEA del agua
          y Bandera Azul — los tres indicadores que mejor predicen la transparencia real.
        </p>

        {/* Intro educativa */}
        <section aria-labelledby="h2-que" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-que" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
            ¿Qué hace a una playa de aguas cristalinas?
          </h2>
          <ul style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Fondo de arena blanca o rocoso</strong> — refleja la luz, no levanta sedimento.</li>
            <li><strong>Ausencia de ríos cercanos</strong> — los aportes de agua dulce turbian el mar.</li>
            <li><strong>Poco oleaje habitual</strong> — las olas suspenden arena y restan visibilidad.</li>
            <li><strong>Clima cálido y estable</strong> — menos plancton (clorofila) en el agua.</li>
            <li><strong>Protección de contaminación</strong> — Bandera Azul y clasificación EEA Excelente.</li>
          </ul>
        </section>

        {/* Ranking por zonas */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Las 30 playas con aguas más transparentes
        </h2>
        <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.65rem' }}>
          {seleccion.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/playas/${p.slug}`}
                prefetch={false}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.65rem',
                  padding: '.75rem .9rem', borderRadius: 6,
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                  background: i < 3 ? 'linear-gradient(135deg, #4a7a90, #4a7a90)' : 'rgba(74,122,144,.15)',
                  color: i < 3 ? '#fff' : '#0369a1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.75rem', fontWeight: 800,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.15rem' }}>
                    {p.municipio} · {p.provincia}
                    {p.bandera && <span style={{ color: '#2563eb', marginLeft: '.35rem' }}>· Bandera Azul</span>}
                  </div>
                </div>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#0369a1', flexShrink: 0 }}>
                  {p.score}/100
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {/* Cross-links topic cluster */}
        <section aria-labelledby="h2-relacionadas" style={{ marginTop: '3rem' }}>
          <h2 id="h2-relacionadas" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
            Explora más
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { href: '/calidad-agua',          label: 'Calidad del agua (Directiva EEA)' },
              { href: '/banderas-azules',       label: 'Playas con Bandera Azul' },
              { href: '/comunidad/canarias',    label: 'Playas de Canarias' },
              { href: '/comunidad/islas-baleares', label: 'Playas de Baleares' },
              { href: '/provincia/almeria',     label: 'Playas de Almería' },
              { href: '/provincia/murcia',      label: 'Playas de Murcia' },
              { href: '/playas-secretas',       label: 'Playas secretas y poco masificadas' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'inline-flex',
                  padding: '.45rem .85rem',
                  background: 'rgba(107,64,10,.14)',
                  color: '#4a2c05',
                  borderRadius: 100,
                  fontSize: '.78rem', fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid rgba(107,64,10,.3)',
                }}
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="h2-faq" style={{ marginTop: '3rem' }}>
          <h2 id="h2-faq" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {[
              {
                q: '¿Dónde están las playas con aguas más cristalinas de España?',
                a: 'Principalmente en Canarias (La Graciosa, Fuerteventura, Lanzarote), Baleares (Menorca, Formentera, Ibiza), Cabo de Gata (Almería) y parte de la costa de Murcia. La combinación de fondo de arena blanca, clima cálido y ausencia de ríos da la máxima transparencia.',
              },
              {
                q: '¿Cómo se mide la transparencia del agua?',
                a: 'La visibilidad se estima en metros con técnicas de teledetección y modelos oceanográficos. 20-25 metros (Canarias en verano) es excepcional; 10-15 metros es muy bueno; 5-10 metros es el estándar atlántico; por debajo indica turbidez alta o agua con sedimentos.',
              },
              {
                q: '¿Es la misma cosa que la calidad del agua?',
                a: 'No. La calidad del agua (Directiva EEA 2006/7/CE) mide contaminación bacteriológica — es un indicador sanitario. La transparencia mide la claridad visual. Una playa puede tener calidad Excelente y aguas turbias (por ejemplo en desembocaduras de ríos).',
              },
              {
                q: '¿Cuándo hay más transparencia?',
                a: 'En verano tras días sin viento fuerte. El oleaje suspende arena y reduce la visibilidad. Las mejores semanas suelen ser a mediados de junio y septiembre (agua estable, poco plancton) en Mediterráneo; todo el año en Canarias.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  {f.q}
                </summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type':    'FAQPage',
          mainEntity: [
            {
              '@type': 'Question', name: '¿Dónde están las playas con aguas más cristalinas de España?',
              acceptedAnswer: { '@type': 'Answer', text: 'Principalmente en Canarias (La Graciosa, Fuerteventura, Lanzarote), Baleares (Menorca, Formentera, Ibiza), Cabo de Gata (Almería) y parte de la costa de Murcia. La combinación de fondo de arena blanca, clima cálido y ausencia de ríos da la máxima transparencia.' },
            },
            {
              '@type': 'Question', name: '¿Cómo se mide la transparencia del agua?',
              acceptedAnswer: { '@type': 'Answer', text: 'La visibilidad se estima en metros con técnicas de teledetección y modelos oceanográficos. 20-25 metros (Canarias en verano) es excepcional; 10-15 metros es muy bueno; 5-10 metros es el estándar atlántico; por debajo indica turbidez alta o agua con sedimentos.' },
            },
            {
              '@type': 'Question', name: '¿Es la misma cosa que la calidad del agua?',
              acceptedAnswer: { '@type': 'Answer', text: 'No. La calidad del agua (Directiva EEA 2006/7/CE) mide contaminación bacteriológica — es un indicador sanitario. La transparencia mide la claridad visual. Una playa puede tener calidad Excelente y aguas turbias (por ejemplo en desembocaduras de ríos).' },
            },
            {
              '@type': 'Question', name: '¿Cuándo hay más transparencia?',
              acceptedAnswer: { '@type': 'Answer', text: 'En verano tras días sin viento fuerte. El oleaje suspende arena y reduce la visibilidad. Las mejores semanas suelen ser a mediados de junio y septiembre (agua estable, poco plancton) en Mediterráneo; todo el año en Canarias.' },
            },
          ],
        })}}
      />
    </>
  )
}
