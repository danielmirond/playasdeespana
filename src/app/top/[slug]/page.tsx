// src/app/top/[slug]/page.tsx. Pillar page de costa.
// Top 10 playas + intro editorial + mejor época + tipos destacados +
// municipios + provincias + FAQ. Cross-links a landings temáticas
// (/playas-aguas-cristalinas, /buceo, /alquiler-barco-playa, etc.)
// y a /provincia/[slug] / /municipio/[slug].
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { getPlayas } from '@/lib/playas'
import { COSTAS } from '@/lib/rutas'
import { getPlayasDataModified } from '@/lib/dateModified'
import { getCostaEditorial } from '@/lib/costas-editorial'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const ORG_REF = { '@id': `${BASE}/#organization` }
const PLAYAS_MODIFIED = getPlayasDataModified()

export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return COSTAS.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const costa = COSTAS.find(c => c.slug === slug)
  if (!costa) return {}
  return {
    title: `Top 10 mejores playas de la ${costa.nombre} | Ranking`,
    description: `Las 10 mejores playas de la ${costa.nombre} (${costa.provincias.join(', ')}). Ranking por servicios, bandera azul, accesibilidad y ocupación.`,
    alternates: {
      canonical: `/top/${slug}`,
      languages: {
        'es':        `/top/${slug}`,
        'en':        `/en/top/${slug}`,
        'x-default': `/en/top/${slug}`,
      },
    },
    openGraph: {
      type:  'article',
      url:   `${BASE}/top/${slug}`,
      title: `Top 10 mejores playas de la ${costa.nombre}`,
      images: [{ url: `/api/og?playa=${encodeURIComponent('Top 10 ' + costa.nombre)}`, width: 1200, height: 630 }],
    },
  }
}

function staticScore(p: any): number {
  let s = 40
  if (p.bandera) s += 15; if (p.socorrismo) s += 12; if (p.duchas) s += 8
  if (p.parking) s += 8; if (p.accesible) s += 5; if (p.aseos) s += 3
  if (p.descripcion && !p.descripcion_generada) s += 5
  const g = (p.grado_ocupacion ?? '').toLowerCase()
  if (g.includes('bajo')) s += 8; else if (g.includes('alto')) s -= 3
  return Math.min(100, s)
}

export default async function TopCostaPage({ params }: Props) {
  const { slug } = await params
  const costa = COSTAS.find(c => c.slug === slug)
  if (!costa) notFound()

  const playas = await getPlayas()
  const costaPlayas = playas
    .filter(p => costa.provincias.includes(p.provincia) && p.lat && p.lng)
    .map(p => ({ p, score: staticScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  const top = costaPlayas.map(x => x.p)
  const editorial = getCostaEditorial(slug)
  const provinciaSlugs = costa.provincias.map(prov => ({
    nombre: prov,
    slug:   prov.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }))

  // CollectionPage + ItemList con Beach@id en cada item para que Google
  // enlace los items a las entidades Beach del KG. Evita duplicate content
  // y refuerza el grafo (cada Beach del top está referenciado).
  const collectionSchema = {
    '@context':   'https://schema.org',
    '@type':      'CollectionPage',
    '@id':        `${BASE}/top/${slug}#collection`,
    name:         `Top 10 mejores playas de la ${costa.nombre}`,
    headline:     `Top 10 mejores playas de la ${costa.nombre}`,
    description:  costa.descripcion ?? `Ranking de las 10 mejores playas de la ${costa.nombre}, ordenadas por servicios, bandera azul, accesibilidad y ocupación.`,
    url:          `${BASE}/top/${slug}`,
    inLanguage:   'es-ES',
    dateModified: PLAYAS_MODIFIED,
    publisher:    ORG_REF,
    author:       ORG_REF,
    isPartOf:     { '@id': `${BASE}/#website` },
    mainEntity: {
      '@type':         'ItemList',
      name:            `Top 10 mejores playas de la ${costa.nombre}`,
      numberOfItems:   top.length,
      itemListOrder:   'https://schema.org/ItemListOrderDescending',
      itemListElement: top.map((p, i) => ({
        '@type':   'ListItem',
        position:  i + 1,
        name:      p.nombre,
        url:       `${BASE}/playas/${p.slug}`,
        // @id apunta al Beach declarado en cada ficha → entity linking.
        item: {
          '@id':  `${BASE}/playas/${p.slug}#beach`,
          '@type': 'Beach',
          name:    p.nombre,
          url:     `${BASE}/playas/${p.slug}`,
          address: {
            '@type':         'PostalAddress',
            addressLocality: p.municipio,
            addressRegion:   p.provincia,
            addressCountry:  'ES',
          },
        },
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Top 10', item: `${BASE}/top` },
        { '@type': 'ListItem', position: 3, name: costa.nombre, item: `${BASE}/top/${slug}` },
      ],
    },
  }
  const listSchema = collectionSchema

  // TouristDestination — refuerza el reconocimiento de la costa como
  // destino turístico con identidad propia. Google KG entiende mejor
  // "Costa Brava" como entity destino cuando hay este schema.
  const touristSchema = {
    '@context':   'https://schema.org',
    '@type':      'TouristDestination',
    '@id':        `${BASE}/top/${slug}#destination`,
    name:         costa.nombre,
    description:  editorial.intro?.[0] ?? costa.descripcion ?? `${costa.nombre} en ${costa.provincias.join(', ')}.`,
    url:          `${BASE}/top/${slug}`,
    inLanguage:   'es-ES',
    publisher:    ORG_REF,
    image:        `${BASE}/api/og?playa=${encodeURIComponent('Top 10 ' + costa.nombre)}`,
    touristType: [
      'Turismo de sol y playa',
      'Familias',
      ...(editorial.tiposDestacados?.map(t => t.nombre) ?? []),
    ],
    // Provincias que la componen como `containedInPlace`.
    containedInPlace: costa.provincias.map(prov => ({
      '@type':   'AdministrativeArea',
      name:      prov,
      url:       `${BASE}/provincia/${prov.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      containedInPlace: { '@type': 'Country', name: 'España', identifier: 'ES' },
    })),
    // Las top playas como `includesAttraction`.
    includesAttraction: top.map(p => ({
      '@type':   'Beach',
      '@id':     `${BASE}/playas/${p.slug}#beach`,
      name:      p.nombre,
      url:       `${BASE}/playas/${p.slug}`,
    })),
    // Municipios destacados como `subPlace`.
    ...(editorial.municipios && editorial.municipios.length > 0 ? {
      subPlace: editorial.municipios.map(m => ({
        '@type': 'AdministrativeArea',
        name:    m.nombre,
        ...(m.slug ? { url: `${BASE}/municipio/${m.slug}` } : {}),
      })),
    } : {}),
  }

  // FAQPage schema cuando hay preguntas curadas para esta costa.
  const faqSchema = editorial.faq && editorial.faq.length > 0 ? {
    '@context':  'https://schema.org',
    '@type':     'FAQPage',
    '@id':       `${BASE}/top/${slug}#faq`,
    mainEntity: editorial.faq.map(f => ({
      '@type':         'Question',
      name:            f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/top" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Top 10</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{costa.nombre}</span>
        </nav>

        <div style={{ borderLeft: `4px solid ${costa.color === '#f8fafc' ? 'var(--accent)' : costa.color}`, paddingLeft: '1.25rem', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '.4rem',
          }}>
            Top 10 mejores playas de la {costa.nombre}
          </h1>
          <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.55, maxWidth: 560 }}>
            {costa.descripcion}
          </p>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.25rem' }}>
            {costa.zonaLabel} · {costa.provincias.join(', ')}
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, overflow: 'hidden', marginBottom: '2rem',
        }}>
          <MapaPlayas playas={top} height="400px" />
        </div>

        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {costaPlayas.map(({ p, score }, i) => {
            const sc = score >= 75 ? '#3d6b1f' : score >= 55 ? '#c48a1e' : score >= 35 ? '#a04818' : '#7a2818'
            return (
              <li key={p.slug}>
                <Link href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: 6, padding: '1rem 1.15rem',
                  textDecoration: 'none', transition: 'all .15s',
                }}>
                  <span style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: i < 3 ? 'var(--accent)' : 'var(--metric-bg)',
                    border: i < 3 ? 'none' : '1px solid var(--line)',
                    color: i < 3 ? '#fff' : 'var(--ink)',
                    fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                    {p.descripcion && !(p as any).descripcion_generada && (
                      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.2rem', lineHeight: 1.4 }}>
                        {(p.descripcion ?? '').slice(0, 100)}…
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '.2rem', flexWrap: 'wrap', marginTop: '.3rem' }}>
                      {p.bandera && <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.1rem .3rem', borderRadius: 4 }}>Bandera Azul</span>}
                      {p.socorrismo && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Socorrismo</span>}
                      {p.parking && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Parking</span>}
                      {p.accesible && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>PMR</span>}
                    </div>
                  </div>
                  <span style={{
                    background: sc, color: '#fff',
                    fontFamily: 'var(--font-serif)', fontWeight: 700,
                    fontSize: '1rem', padding: '.35rem .55rem', borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    {score}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href={`/rutas/ruta-${costa.slug}`} style={{
            fontSize: '.92rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none',
          }}>
            🛣️ Ver la ruta por la {costa.nombre} →
          </Link>
        </div>

        {/* Intro editorial (solo costas con copy curado en costas-editorial.ts) */}
        {editorial.intro && editorial.intro.length > 0 && (
          <section aria-labelledby="intro-title" style={{ marginTop: '3rem' }}>
            <h2 id="intro-title" style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.45rem',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem',
            }}>
              Sobre la <em>{costa.nombre}</em>
            </h2>
            {editorial.intro.map((p, i) => (
              <p key={i} style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'var(--ink)', marginBottom: '.85rem' }}>
                {p}
              </p>
            ))}
          </section>
        )}

        {/* Mejor época */}
        {editorial.mejorEpoca && editorial.mejorEpoca.length > 0 && (
          <section aria-labelledby="epoca-title" style={{ marginTop: '2.5rem' }}>
            <h2 id="epoca-title" style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.3rem',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '.85rem',
            }}>
              Cuándo ir a la {costa.nombre}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.75rem' }}>
              {editorial.mejorEpoca.map((e, i) => (
                <div key={i} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderLeft: `4px solid ${costa.color}`, borderRadius: 4,
                  padding: '.85rem 1rem',
                }}>
                  <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--ink)', marginBottom: '.2rem' }}>{e.ventana}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{e.razon}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tipos destacados (cross-links a landings temáticas) */}
        {editorial.tiposDestacados && editorial.tiposDestacados.length > 0 && (
          <section aria-labelledby="tipos-title" style={{ marginTop: '2.5rem' }}>
            <h2 id="tipos-title" style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.3rem',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '.85rem',
            }}>
              Tipos de playa que destacan en la {costa.nombre}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
              {editorial.tiposDestacados.map(t => (
                <Link key={t.slug} href={t.slug} style={{
                  display: 'block', padding: '.85rem 1rem',
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: 6, textDecoration: 'none', color: 'var(--ink)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.2rem' }}>{t.nombre} →</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{t.razon}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Municipios destacados */}
        {editorial.municipios && editorial.municipios.length > 0 && (
          <section aria-labelledby="muni-title" style={{ marginTop: '2.5rem' }}>
            <h2 id="muni-title" style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.3rem',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '.85rem',
            }}>
              Municipios costeros de referencia
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '.65rem' }}>
              {editorial.municipios.map(m => {
                const inner = (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', marginBottom: '.2rem' }}>
                      {m.nombre}{m.slug ? ' →' : ''}
                    </div>
                    <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{m.resumen}</div>
                  </>
                )
                return m.slug ? (
                  <Link key={m.nombre} href={`/municipio/${m.slug}`} style={{
                    display: 'block', padding: '.85rem 1rem',
                    background: 'var(--card-bg)', border: '1px solid var(--line)',
                    borderRadius: 6, textDecoration: 'none', color: 'var(--ink)',
                  }}>
                    {inner}
                  </Link>
                ) : (
                  <div key={m.nombre} style={{
                    padding: '.85rem 1rem', background: 'var(--card-bg)',
                    border: '1px solid var(--line)', borderRadius: 6,
                  }}>
                    {inner}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Provincias de la costa */}
        <section aria-labelledby="prov-title" style={{ marginTop: '2.5rem' }}>
          <h2 id="prov-title" style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.3rem',
            fontWeight: 700, color: 'var(--ink)', marginBottom: '.85rem',
          }}>
            Por provincia
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {provinciaSlugs.map(p => (
              <Link key={p.slug} href={`/provincia/${p.slug}`} style={{
                padding: '.45rem 1rem', borderRadius: 99,
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                color: 'var(--ink)', fontSize: '.85rem', fontWeight: 600,
                textDecoration: 'none',
              }}>
                Playas de {p.nombre} →
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        {editorial.faq && editorial.faq.length > 0 && (
          <section aria-labelledby="faq-title" style={{ marginTop: '2.5rem' }}>
            <h2 id="faq-title" style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.3rem',
              fontWeight: 700, color: 'var(--ink)', marginBottom: '.85rem',
            }}>
              Preguntas frecuentes
            </h2>
            {editorial.faq.map(item => (
              <details key={item.q} style={{
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 6, padding: '.85rem 1rem', marginBottom: '.5rem',
              }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  {item.q}
                </summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>
                  {item.a}
                </p>
              </details>
            ))}
          </section>
        )}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </>
  )
}
