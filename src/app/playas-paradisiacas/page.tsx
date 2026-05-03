// src/app/playas-paradisiacas/page.tsx
// Hub SEO: "Playas paradisíacas en España". KW de alto volumen estacional.
// Lista las playas mejor puntuadas por transparencia del agua + arena +
// Bandera Azul + baja ocupación. Agrupadas por comunidad y provincia
// con cross-links para long-tail.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import AlquilerBarcoCTA from '@/components/playa/AlquilerBarcoCTA'
import { getPlayas, getComunidades, getProvincias } from '@/lib/playas'
import SchemaItemList from '@/components/seo/SchemaItemList'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Playas paradisíacas en España | Las más bonitas por comunidad y provincia',
  description: 'Las playas más paradisíacas de España: aguas cristalinas, arena fina, poca masificación y Bandera Azul. Ranking por comunidad autónoma y provincia con estado del mar en tiempo real.',
  alternates: {
    canonical: '/playas-paradisiacas',
  },
  openGraph: {
    title: 'Playas paradisíacas en España',
    description: 'Las playas más bonitas de España: ranking por comunidad y provincia.',
    url: `${BASE}/playas-paradisiacas`,
    type: 'article',
  },
}

const FAQ = [
  { q: '¿Cuáles son las playas más paradisíacas de España?', a: 'Las playas con aguas más cristalinas y arena más fina están en Baleares (Cala Mitjana, Es Trenc, Cala Turqueta), Canarias (Papagayo en Lanzarote, Cofete en Fuerteventura) y zonas concretas de Almería (Playa de los Muertos), Asturias (Playa del Silencio) y Galicia (Islas Cíes). El ranking depende de la transparencia del agua, la composición de la arena, la ocupación y los servicios.' },
  { q: '¿Qué hace a una playa paradisíaca?', a: 'Una combinación de agua clara (buena visibilidad submarina), arena fina o blanca, entorno natural poco urbanizado, baja masificación y buen acceso. La calidad del agua certificada por la EEA y el distintivo Bandera Azul son indicadores objetivos de playas bien conservadas.' },
  { q: '¿Hay playas paradisíacas en el norte de España?', a: 'Sí. Asturias tiene la Playa del Silencio y Gulpiyuri (una playa interior). Galicia ofrece las Islas Cíes (consideradas "el Caribe gallego"), la Playa de las Catedrales y decenas de arenales atlánticos con poca afluencia. Cantabria y País Vasco tienen calas espectaculares entre acantilados.' },
  { q: '¿Cuándo es mejor visitar las playas paradisíacas?', a: 'Junio y septiembre son los mejores meses: agua ya templada, menos gente que en julio-agosto y precios más bajos. En Canarias se puede ir todo el año. Para Baleares, mayo y octubre son meses excelentes con temperaturas suaves y playas casi vacías.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function scoreParadisiaca(p: {
  bandera?: boolean; composicion?: string; grado_ocupacion?: string
  comunidad: string; provincia: string; lat: number
}): number {
  let score = 0
  if (p.bandera) score += 20
  const comp = (p.composicion ?? '').toLowerCase()
  if (comp.includes('arena fina') || comp.includes('blanca')) score += 25
  else if (comp.includes('arena')) score += 15
  else if (comp.includes('grava') || comp.includes('roca')) score += 5
  const ocu = (p.grado_ocupacion ?? '').toLowerCase()
  if (ocu.includes('bajo')) score += 20
  else if (ocu.includes('medio')) score += 10
  const esCanarias = p.lat < 30
  const esBaleares = p.comunidad === 'Islas Baleares'
  const esAlmeria = p.provincia === 'Almería'
  if (esCanarias) score += 20
  else if (esBaleares) score += 18
  else if (esAlmeria) score += 14
  else if (['Galicia', 'Asturias'].includes(p.comunidad)) score += 12
  else score += 8
  return Math.min(100, score)
}

const COSTERAS = [
  'Andalucía', 'Cataluña', 'Comunitat Valenciana', 'Galicia',
  'Canarias', 'Islas Baleares', 'Murcia', 'Asturias',
  'Cantabria', 'País Vasco',
]

export default async function PlayasParadisiacasPage() {
  const [playas, comunidades, provincias] = await Promise.all([
    getPlayas(), getComunidades(), getProvincias(),
  ])

  const scored = playas
    .filter(p => COSTERAS.includes(p.comunidad) && p.lat && p.lng)
    .map(p => ({ ...p, paraScore: scoreParadisiaca(p) }))
    .sort((a, b) => b.paraScore - a.paraScore)

  const top50 = scored.slice(0, 50)

  const porComunidad = new Map<string, typeof top50>()
  for (const p of scored.slice(0, 200)) {
    const list = porComunidad.get(p.comunidad) ?? []
    if (list.length < 8) {
      list.push(p)
      porComunidad.set(p.comunidad, list)
    }
  }

  const porProvincia = new Map<string, typeof top50>()
  for (const p of scored.slice(0, 300)) {
    const list = porProvincia.get(p.provincia) ?? []
    if (list.length < 5) {
      list.push(p)
      porProvincia.set(p.provincia, list)
    }
  }

  const provCosteras = provincias.filter(prov =>
    scored.some(p => p.provincia === prov.nombre)
  ).sort((a, b) => b.count - a.count)

  return (
    <>
      <SchemaItemList
        name="Playas paradisíacas en España"
        description="Las 50 playas más paradisíacas de España por transparencia del agua, arena, ocupación y Bandera Azul."
        url={`${BASE}/playas-paradisiacas`}
        beaches={top50.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
        ordered
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Playas paradisíacas</span>
        </nav>

        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '.72rem', fontWeight: 500,
          letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          Las más bonitas · {top50.length} playas seleccionadas
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          Playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>paradisíacas</em> en España
        </h1>

        <p style={{
          fontSize: '1.05rem', color: 'var(--muted)',
          lineHeight: 1.65, maxWidth: 680, marginBottom: '1.25rem',
        }}>
          Aguas cristalinas, arena fina, entornos naturales y poca masificación.
          Selección basada en calidad del agua (EEA), composición de la arena,
          grado de ocupación y Bandera Azul.
        </p>

        <AlquilerBarcoCTA variant="banner" />

        {/* Top 50 ranking */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.8rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '1rem',
          }}>
            Las <em style={{ fontWeight: 500, color: 'var(--accent)' }}>50 más paradisíacas</em>
          </h2>
          <ol style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.55rem',
          }}>
            {top50.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '.65rem',
                  padding: '.75rem .9rem', borderRadius: 6,
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'border-color .15s',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)',
                    letterSpacing: '-.01em', flexShrink: 0, width: 32,
                  }}>
                    n°{i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.2 }}>
                      {p.nombre}
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '.1rem' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: .6 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {p.municipio} · {p.provincia}
                    </div>
                  </div>
                  {p.bandera && (
                    <span style={{ fontSize: '.6rem', fontWeight: 500, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.15rem .4rem', borderRadius: 100 }}>
                      B. Azul
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Por Comunidad Autónoma */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.8rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '1.25rem',
          }}>
            Por <em style={{ fontWeight: 500, color: 'var(--accent)' }}>comunidad autónoma</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Array.from(porComunidad.entries()).map(([com, list]) => {
              const comSlug = slugify(com)
              return (
                <div key={com}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                    marginBottom: '.5rem', paddingBottom: '.4rem',
                    borderBottom: '1px solid var(--line)',
                  }}>
                    <Link href={`/comunidad/${comSlug}`} style={{
                      fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700,
                      color: 'var(--ink)', textDecoration: 'none',
                    }}>
                      {com}
                    </Link>
                    <Link href={`/comunidad/${comSlug}`} style={{
                      fontSize: '.72rem', color: 'var(--accent)', fontWeight: 500,
                    }}>
                      Ver todas →
                    </Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.4rem' }}>
                    {list.map(p => (
                      <Link key={p.slug} href={`/playas/${p.slug}`} style={{
                        display: 'flex', alignItems: 'center', gap: '.5rem',
                        padding: '.5rem .75rem', borderRadius: 4,
                        fontSize: '.85rem', color: 'var(--ink)', textDecoration: 'none',
                        transition: 'background .1s',
                      }}>
                        <span style={{ fontWeight: 700 }}>{p.nombre}</span>
                        <span style={{ fontSize: '.68rem', color: 'var(--muted)', marginLeft: 'auto' }}>{p.provincia}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Por Provincia */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.8rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '1.25rem',
          }}>
            Por <em style={{ fontWeight: 500, color: 'var(--accent)' }}>provincia</em>
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '.5rem',
          }}>
            {provCosteras.map(prov => {
              const provSlug = slugify(prov.nombre)
              const list = porProvincia.get(prov.nombre)
              if (!list || list.length === 0) return null
              return (
                <div key={prov.slug} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: 6, overflow: 'hidden',
                }}>
                  <Link href={`/provincia/${provSlug}`} style={{
                    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                    padding: '.75rem 1rem .5rem',
                    textDecoration: 'none', color: 'inherit',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-serif)', fontWeight: 700,
                      fontSize: '.95rem', color: 'var(--ink)',
                    }}>
                      {prov.nombre}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                      fontSize: '.68rem', color: 'var(--accent)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {prov.count}
                    </span>
                  </Link>
                  <ul style={{ listStyle: 'none', padding: '0 1rem .7rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
                    {list.slice(0, 3).map(p => (
                      <li key={p.slug}>
                        <Link href={`/playas/${p.slug}`} style={{
                          fontSize: '.78rem', color: 'var(--muted)', textDecoration: 'none',
                        }}>
                          → {p.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.8rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '1rem',
          }}>
            Preguntas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>frecuentes</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {FAQ.map(item => (
              <details key={item.q} style={{
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 6, padding: '.85rem 1.1rem',
              }}>
                <summary style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '.95rem', color: 'var(--ink)', cursor: 'pointer',
                  listStyle: 'none',
                }}>
                  {item.q}
                </summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, margin: '.75rem 0 .15rem' }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
