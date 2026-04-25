// src/components/seo/TopicProvinciaPage.tsx
// Componente SSR reutilizable para landings del tipo
// /{topic}/{provincia}. genera la estructura común (hero, lista de
// playas destacadas de esa provincia, FAQ, cross-links, schema) y
// deja que cada route pase su contenido específico vía props.
//
// Cada ruta que use este componente se reduce a ~60 líneas: generate-
// StaticParams, generateMetadata y un <TopicProvinciaPage config={...} />.

import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import SchemaItemList from '@/components/seo/SchemaItemList'
import type { Playa } from '@/types'

export interface TopicConfig {
  /** Slug base del topic (campings, buceo, kitesurf, etc.) */
  slug:      string
  /** Emoji principal del topic */
  emoji:     string
  /** Color principal (hex) */
  color:     string
  /** "Campings", "Centros de buceo", etc. */
  tituloTopic: string
  /** Texto introductorio (acepta HTML simple) */
  intro:     string
  /** Predicado de scoring para priorizar playas relevantes.
   *  Retorna un número: mayor = más relevante para este topic. */
  score?:    (p: Playa) => number
  /** Opciones/beneficios clave del topic */
  highlights: Array<{ icon: string; label: string; desc: string }>
  /** Preguntas frecuentes (3-5). Debe tener aGeneric o aProvincia. */
  faqs:      Array<{ q: string; aGeneric?: string; aProvincia?: (prov: string) => string }>
  /** Cross-links relacionados */
  relacionados?: Array<{ href: string; label: string }>
  /** Render extra antes del FAQ (CTAs afiliados, etc.) */
  extraSections?: () => React.ReactNode
}

interface Props {
  config:   TopicConfig
  provincia:  { nombre: string; slug: string; comunidad?: string }
  playas:   Playa[]
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export default function TopicProvinciaPage({ config, provincia, playas }: Props) {
  const url = `${BASE}/${config.slug}/${provincia.slug}`

  // Aplicar scoring si existe, priorizar bandera+parking+accesible
  const scored = playas.map(p => ({
    p,
    s: (config.score?.(p) ?? 0) + (p.bandera ? 2 : 0) + (p.parking ? 1 : 0) + (p.accesible ? 1 : 0),
  }))
  scored.sort((a, b) => b.s - a.s)
  const destacadas = scored.slice(0, 20).map(x => x.p)

  return (
    <>
      <SchemaItemList
        name={`${config.tituloTopic} cerca de playas en ${provincia.nombre}`}
        description={`Playas con ${config.tituloTopic.toLowerCase()} cercanos en ${provincia.nombre}.`}
        url={url}
        beaches={destacadas.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <Link href={`/${config.slug}`}>{config.tituloTopic}</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">{provincia.nombre}</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          <span aria-hidden="true" style={{ marginRight: '.35rem' }}>{config.emoji}</span>
          {config.tituloTopic} cerca de la playa en {provincia.nombre}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.65 }}>
          {config.intro.replace(/{provincia}/g, provincia.nombre)}
        </p>

        {/* Highlights */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '.65rem', marginBottom: '2.5rem',
        }}>
          {config.highlights.map(h => (
            <div key={h.label} style={{
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '1rem',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.3rem' }} aria-hidden="true">{h.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>{h.label}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.2rem', lineHeight: 1.5 }}>{h.desc}</div>
            </div>
          ))}
        </div>

        {/* Playas recomendadas */}
        {destacadas.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
              Playas recomendadas en {provincia.nombre}
            </h2>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '.6rem', marginBottom: '2.5rem',
            }}>
              {destacadas.map(p => (
                <Link
                  key={p.slug}
                  href={`/playas/${p.slug}`}
                  prefetch={false}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '.15rem',
                    padding: '.85rem 1rem', borderRadius: 6,
                    background: 'var(--card-bg)', border: '1px solid var(--line)',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
                    {p.municipio}
                    {p.bandera && <span style={{ color: '#2563eb', marginLeft: '.3rem' }}>★</span>}
                    {p.parking && <span style={{ color: config.color, marginLeft: '.3rem' }}>🅿️</span>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Extra sections (CTAs afiliados, etc.) */}
        {config.extraSections && config.extraSections()}

        {/* Cross-links */}
        {config.relacionados && config.relacionados.length > 0 && (
          <section aria-labelledby={`h2-rel-${config.slug}`} style={{ marginBottom: '2rem' }}>
            <h2 id={`h2-rel-${config.slug}`} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
              También te puede interesar
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {config.relacionados.map(l => (
                <Link key={l.href} href={l.href} style={{
                  display: 'inline-flex', padding: '.45rem .85rem',
                  background: 'rgba(107,64,10,.14)', color: '#4a2c05',
                  borderRadius: 100, fontSize: '.78rem', fontWeight: 600,
                  textDecoration: 'none', border: '1px solid rgba(107,64,10,.3)',
                }}>{l.label} →</Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section aria-labelledby={`h2-faq-${config.slug}`}>
          <h2 id={`h2-faq-${config.slug}`} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {config.faqs.map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  {f.q.replace(/{provincia}/g, provincia.nombre)}
                </summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>
                  {(f.aProvincia?.(provincia.nombre) ?? f.aGeneric ?? '')}
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
          '@type': 'FAQPage',
          mainEntity: config.faqs.map(f => ({
            '@type': 'Question',
            name: f.q.replace(/{provincia}/g, provincia.nombre),
            acceptedAnswer: { '@type': 'Answer', text: (f.aProvincia?.(provincia.nombre) ?? f.aGeneric ?? '') },
          })),
        })}}
      />
    </>
  )
}
