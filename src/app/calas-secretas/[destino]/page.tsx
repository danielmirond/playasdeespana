// src/app/calas-secretas/[destino]/page.tsx
// Sub-landing por destino: 8 calas secretas seleccionadas con
// heurística sobre el dataset real. Cross-link a la ficha de cada
// playa + CTA barco (cuando aplica). Schema TouristAttraction
// + ItemList + FAQPage.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { DESTINOS_CALAS, getDestinoCalasBySlug, getCalasSecretasByDestino } from '@/lib/calasSecretas'
import { urlSamboatPremium, getDestinoBySlug as getDestinoEmbarcacion } from '@/lib/embarcaciones'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const SAMBOAT_AFF = process.env.NEXT_PUBLIC_SAMBOAT_AFF ?? ''

export const maxDuration = 30
export const revalidate = 86400

export function generateStaticParams() {
  return DESTINOS_CALAS.map(d => ({ destino: d.slug }))
}

interface Props { params: Promise<{ destino: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destino: slug } = await params
  const d = getDestinoCalasBySlug(slug)
  if (!d) return {}
  const title = `Calas secretas de ${d.nombre}: las 8 menos conocidas | Playas de España`
  const description = `Las 8 calas escondidas de ${d.nombre} que ningún blog menciona. Cómo llegar, qué llevar y si solo se accede por mar. Datos oficiales MITECO.`
  return {
    title, description,
    alternates: { canonical: `/calas-secretas/${slug}` },
    openGraph: { title, description, url: `${BASE}/calas-secretas/${slug}`, type: 'article' },
  }
}

export default async function CalasSecretasPage({ params }: Props) {
  const { destino: slug } = await params
  const d = getDestinoCalasBySlug(slug)
  if (!d) notFound()

  const calas = await getCalasSecretasByDestino(slug, 8)
  if (calas.length === 0) notFound()

  // ¿Hay destino premium asociado para CTA barco?
  // mapping: calas-secretas slug → embarcaciones slug
  const calasToBoat: Record<string, string> = {
    'mallorca':      'mallorca',
    'ibiza':         'ibiza',
    'menorca':       'menorca',
    'costa-brava':   'costa-brava',
    'costa-blanca':  'mallorca',     // sin destino directo, mejor cala
    'cabo-de-gata':  '',
    'asturias':      '',
    'galicia':       '',
  }
  const destBoatSlug = calasToBoat[slug]
  const destBoat = destBoatSlug ? getDestinoEmbarcacion(destBoatSlug) : null
  const ctaBoatUrl = destBoat && SAMBOAT_AFF
    ? urlSamboatPremium(destBoat, SAMBOAT_AFF, `pde-calas-${slug}`)
    : null

  // FAQs comunes
  const faqs = [
    {
      q: `¿Qué hace que una cala sea "secreta"?`,
      a: `En este sitio aplicamos un criterio objetivo: cala de menos de 200 m de longitud, sin socorrismo, sin parking habilitado, sin duchas, sin bandera azul, y con un nombre evocativo (cala, caleta, ensenada). Esto filtra automáticamente las playas turísticas masificadas y deja las pequeñas y poco urbanizadas.`,
    },
    {
      q: `¿Estas calas tienen acceso a pie?`,
      a: `Varían. Algunas requieren caminata 15-30 min, otras solo se llegan por mar. La ficha de cada playa indica la accesibilidad oficial MITECO + Google Maps integrado.`,
    },
    {
      q: `¿Puedo alquilar barco para visitarlas?`,
      a: destBoat
        ? `Sí, en ${d.nombre} hay marinas con catamaranes y barcos sin licencia que te llevan a estas calas. El barco multiplica las opciones (varias calas en un día) y te permite anclar en aguas vírgenes.`
        : `En esta zona depende del puerto más cercano. Consulta la sección de marinas en la ficha de cada playa.`,
    },
    {
      q: `¿Por qué confiar en esta selección?`,
      a: `Las 8 calas se filtran automáticamente desde el dataset oficial MITECO (Ministerio para la Transición Ecológica), no son selección editorial subjetiva. Los criterios son verificables: longitud, servicios, bandera azul, composición.`,
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type':         'Question',
      name:            f.q,
      acceptedAnswer:  { '@type': 'Answer', text: f.a },
    })),
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:       `Calas secretas de ${d.nombre}`,
    numberOfItems: calas.length,
    itemListElement: calas.map((c, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      url:        `${BASE}/playas/${c.slug}`,
      item: {
        '@type':  'TouristAttraction',
        name:     c.nombre,
        url:      `${BASE}/playas/${c.slug}`,
        geo: {
          '@type':    'GeoCoordinates',
          latitude:   c.lat,
          longitude:  c.lng,
        },
      },
    })),
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <Link href="/calas-secretas">Calas secretas</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">{d.nombre}</span>
        </nav>

        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.72rem', fontWeight: 600,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Selección de datos oficiales · {calas.length} calas
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
            letterSpacing: '-.02em', marginBottom: '.75rem',
          }}>
            Calas secretas de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{d.nombre}</em>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink)', maxWidth: 740, marginBottom: '0', lineHeight: 1.6 }}>
            {d.hero}
          </p>
        </header>

        {/* CRITERIO TRANSPARENTE */}
        <section style={{
          margin: '0 0 2.5rem',
          padding: '1rem 1.25rem',
          background: 'var(--card-bg, #faf6ef)',
          borderLeft: '3px solid var(--accent)',
          borderRadius: 4,
          fontSize: '.88rem',
          lineHeight: 1.55,
          color: 'var(--ink)',
        }}>
          <strong>Cómo las elegimos: </strong>
          longitud ≤ 200 m, sin socorrismo, sin parking, sin duchas, sin bandera azul. Filtrado automático sobre el dataset oficial MITECO + OSM. {d.filterDescr}
        </section>

        {/* LISTADO */}
        <section style={{ marginBottom: '3rem' }}>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {calas.map((c, i) => (
              <li key={c.slug} style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '1rem 1.15rem',
                display: 'flex',
                gap: '.9rem',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  flexShrink: 0,
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '.85rem', fontWeight: 700,
                }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '.2rem' }}>
                    <Link href={`/playas/${c.slug}`} style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.15rem', fontWeight: 700,
                      color: 'var(--ink)', textDecoration: 'none',
                    }}>
                      {c.nombre} →
                    </Link>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.4rem' }}>
                    {c.municipio}
                    {c.longitud && ` · ${c.longitud} m`}
                    {c.composicion && ` · ${c.composicion}`}
                  </div>
                  <p style={{ fontSize: '.85rem', color: 'var(--ink)', margin: 0, lineHeight: 1.55 }}>
                    {c.razon}
                  </p>
                  <div style={{ marginTop: '.45rem', display: 'flex', gap: '.6rem', flexWrap: 'wrap', fontSize: '.78rem' }}>
                    <Link href={`/playas/${c.slug}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                      Ver ficha completa →
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--muted)', textDecoration: 'none' }}
                    >
                      Cómo llegar ↗
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA BARCO (si aplica) */}
        {ctaBoatUrl && destBoat && (
          <section style={{
            background: 'linear-gradient(135deg, #a04818 0%, #7a2818 100%)',
            color: '#fff',
            padding: '1.8rem 1.5rem',
            borderRadius: 10,
            marginBottom: '2.5rem',
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 .5rem' }}>
              Llega a varias en un día con barco
            </h2>
            <p style={{ fontSize: '.95rem', opacity: .9, margin: '0 0 1rem', maxWidth: 600 }}>
              Algunas calas de {d.nombre} solo se alcanzan por mar. Un catamarán o barco sin licencia para el día te permite hacer 3-4 paradas en jornada.
            </p>
            <a
              href={ctaBoatUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '.75rem 1.4rem',
                background: '#fff', color: '#7a2818',
                textDecoration: 'none', borderRadius: 6,
                fontWeight: 700, fontSize: '.92rem',
              }}
            >
              Ver barcos en {destBoat.nombre} →
            </a>
            {' '}
            <Link
              href={`/alquiler-catamaran/${destBoat.slug}`}
              style={{
                display: 'inline-block',
                padding: '.75rem 1.4rem',
                background: 'rgba(255,255,255,.15)',
                color: '#fff',
                textDecoration: 'none', borderRadius: 6,
                fontWeight: 600, fontSize: '.92rem',
                border: '1px solid rgba(255,255,255,.3)',
                marginLeft: '.5rem',
              }}
            >
              Catamarán {destBoat.nombre}
            </Link>
          </section>
        )}

        {/* FAQS */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {faqs.map((f, i) => (
              <details key={i} style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 6,
                padding: '.7rem 1rem',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--ink)', fontSize: '.92rem' }}>
                  {f.q}
                </summary>
                <p style={{ marginTop: '.55rem', fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </main>
    </>
  )
}
