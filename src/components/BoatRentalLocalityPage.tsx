'use client'

import Nav from '@/components/ui/Nav'
import Link from 'next/link'
import { useState } from 'react'

interface Beach {
  name: string
  distance: string
  type?: string
  description: string
}

interface Mooring {
  name: string
  depth: number
  protection: 'high' | 'medium' | 'low'
  description: string
}

interface Pricing {
  small: { min: number; max: number }
  medium: { min: number; max: number }
  captain: { min: number; max: number }
}

interface LocalityPageProps {
  coast: string
  province: string
  locality: string
  slug: string
  description: string
  beaches: Beach[]
  moorings: Mooring[]
  pricing: Pricing
  regulations: string[]
  bestSeason: string
  insiderTip: string
  faq: Array<{ question: string; answer: string }>
  googleTrendsVolume: number
  samboatAwinUrl: string
  samboatDeeplink: string
  images: { hero: { unsplashUrl: string; alt: string } }
  /** Hero real pre-resuelto (Wikimedia/Openverse) con crédito. Si null → degradado. */
  heroImage?: { url: string; credit: string } | null
  /** nombreCala → slug de nuestra ficha de playa (matching server-side). */
  beachLinks?: Record<string, string>
}

const PROTECTION_LABEL: Record<Mooring['protection'], { txt: string; color: string }> = {
  high: { txt: 'Protección alta', color: '#15803d' },
  medium: { txt: 'Protección media', color: '#b45309' },
  low: { txt: 'Protección baja', color: '#b91c1c' },
}

const slugify = (x: string) =>
  x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')

// La mayoría de localidades repiten el mismo lugar en `beaches` y `moorings`
// (p.ej. Cala Mayor como playa Y como fondeo, con descripciones casi iguales).
// Se fusionan en UNA tarjeta por lugar: datos de playa + datos de fondeo.
const normName = (x: string) =>
  x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

interface Lugar extends Beach { mooring?: Mooring }

function fusionarLugares(beaches: Beach[], moorings: Mooring[]): Lugar[] {
  const byName = new Map(moorings.map(m => [normName(m.name), m]))
  const usados = new Set<string>()
  const lugares: Lugar[] = beaches.map(b => {
    const key = normName(b.name)
    const m = byName.get(key)
    if (m) usados.add(key)
    return { ...b, mooring: m }
  })
  // Fondeos sin playa equivalente (p.ej. Es Pontás) → tarjeta propia.
  for (const m of moorings) {
    if (usados.has(normName(m.name))) continue
    lugares.push({ name: m.name, distance: '', description: m.description, mooring: m })
  }
  return lugares
}

export default function BoatRentalLocalityPage(props: LocalityPageProps) {
  const {
    coast, province, locality, description, beaches, moorings, pricing,
    regulations, bestSeason, insiderTip, faq, samboatAwinUrl, heroImage,
    beachLinks = {},
  } = props

  const lugares = fusionarLugares(beaches, moorings)
  // La nota bajo los precios ya avisa del +40% en julio-agosto: fuera el
  // duplicado de la lista de normativa.
  const normativa = regulations.filter(r => !/temporada alta/i.test(r))

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const coastSlug = slugify(coast)
  const provinceSlug = slugify(province)

  // JSON-LD: FAQ rich snippet
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const ctaBtn: React.CSSProperties = {
    display: 'inline-block', padding: '.95rem 2rem', background: '#fff', color: '#0369a1',
    borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1.02rem',
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* HERO — foto real (Wikimedia/Openverse) con degradado para legibilidad;
          si no hay foto, degradado marino autónomo. */}
      <section style={{
        position: 'relative',
        background: heroImage
          ? `linear-gradient(135deg, rgba(12,74,110,.82), rgba(8,145,178,.62)), url('${heroImage.url}') center/cover`
          : 'radial-gradient(130% 130% at 12% 8%, rgba(8,145,178,.98), rgba(12,74,110,1) 55%, rgba(7,45,68,1))',
        color: '#fff', padding: '4rem 1.5rem',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', marginBottom: '1rem' }}>
            <Link href="/alquiler-barco" style={{ color: 'rgba(255,255,255,.85)' }}>Alquiler de barcos</Link>
            {' › '}
            <Link href={`/alquiler-barco/costas/${coastSlug}`} style={{ color: 'rgba(255,255,255,.85)' }}>{coast}</Link>
            {' › '}{locality}
          </nav>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 800,
            lineHeight: 1.1, margin: '0 0 1rem',
          }}>
            Alquiler de barcos en {locality}
          </h1>
          <p style={{ fontSize: '1.05rem', maxWidth: 620, lineHeight: 1.6, color: 'rgba(255,255,255,.92)', margin: '0 0 1.5rem' }}>
            {description}
          </p>
          <a href={samboatAwinUrl} target="_blank" rel="noopener noreferrer sponsored" style={ctaBtn}>
            Ver barcos disponibles en {locality} →
          </a>
        </div>
        {heroImage?.credit && (
          <span style={{ position: 'absolute', right: 8, bottom: 6, fontSize: '.62rem', color: 'rgba(255,255,255,.7)', textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>
            Foto: {heroImage.credit} · Wikimedia
          </span>
        )}
      </section>

      {/* CONTENIDO */}
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* PRECIOS */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
            Precios de alquiler en {locality}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
            {[
              { t: 'Barco pequeño', s: 'Hasta 5,5 m · sin licencia', p: pricing.small },
              { t: 'Barco mediano', s: '5,5 – 8 m · con licencia', p: pricing.medium },
              { t: 'Con patrón', s: 'Sin experiencia necesaria', p: pricing.captain },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.15rem' }}>{c.t}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.6rem' }}>{c.s}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                  €{c.p.min}<span style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--muted)' }}> – €{c.p.max}/día</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.75rem' }}>
            Precios orientativos. La temporada alta (julio-agosto) puede incrementarlos hasta un 40%. Combustible y fianza no incluidos.
          </p>
        </section>

        {/* PLAYAS + FONDEOS (fusionados: una tarjeta por lugar) */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
            Playas, calas y fondeos en barco
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
            {lugares.map((l, i) => {
              const pr = l.mooring ? PROTECTION_LABEL[l.mooring.protection] : null
              return (
                <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '.2rem', color: 'var(--ink)' }}>
                    {beachLinks[l.name]
                      ? <Link href={`/playas/${beachLinks[l.name]}`} style={{ color: 'var(--ink)', textDecorationColor: 'var(--accent)' }}>{l.name}</Link>
                      : l.name}
                  </div>
                  {l.distance && <div style={{ fontSize: '.78rem', color: 'var(--accent)', marginBottom: '.4rem' }}>{l.distance}</div>}
                  <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>{l.description}</div>
                  {l.mooring && pr && (
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'baseline', marginTop: '.55rem', paddingTop: '.55rem', borderTop: '1px dashed var(--line)', fontSize: '.76rem' }}>
                      <span aria-hidden="true">⚓</span>
                      <span style={{ color: 'var(--muted)' }}>Fondeo ~{l.mooring.depth} m</span>
                      <span style={{ fontWeight: 700, color: pr.color }}>{pr.txt}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* TEMPORADA + TIP */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>🗓️ Mejor temporada</div>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{bestSeason}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#ecfeff,#f0f9ff)', border: '1px solid #bae6fd', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '.4rem' }}>💡 Consejo de navegante</div>
            <p style={{ color: '#155e75', lineHeight: 1.6, margin: 0 }}>{insiderTip}</p>
          </div>
        </section>

        {/* NORMATIVA */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
            Normativa y a tener en cuenta
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.6rem' }}>
            {normativa.map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>›</span>{r}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        {faq.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              Preguntas frecuentes
            </h2>
            <div style={{ display: 'grid', gap: '.6rem' }}>
              {faq.map((f, i) => (
                <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', background: 'var(--card-bg)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '1rem 1.1rem', background: 'none', border: 'none',
                      cursor: 'pointer', fontWeight: 700, color: 'var(--ink)', fontSize: '.95rem',
                      display: 'flex', justifyContent: 'space-between', gap: '1rem',
                    }}
                    aria-expanded={openFaq === i}
                  >
                    {f.question}
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 1.1rem 1.1rem', color: 'var(--muted)', lineHeight: 1.6, fontSize: '.9rem' }}>
                      {f.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{
          background: 'linear-gradient(135deg,#0369a1 0%,#0891b2 100%)', color: '#fff',
          borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 .6rem' }}>
            ¿Listo para navegar en {locality}?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.9)', lineHeight: 1.6, margin: '0 0 1.5rem', maxWidth: 520, marginInline: 'auto' }}>
            Compara barcos verificados con o sin patrón y reserva al mejor precio en SamBoat.
          </p>
          <a href={samboatAwinUrl} target="_blank" rel="noopener noreferrer sponsored" style={ctaBtn}>
            Ver ofertas en SamBoat →
          </a>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.78rem', marginTop: '1.1rem' }}>
            Afiliado con SamBoat · Sin coste adicional para ti
          </p>
        </section>

        {/* BACK */}
        <div style={{ marginTop: '2rem' }}>
          <Link href={`/alquiler-barco/costas/${coastSlug}/provincias/${provinceSlug}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            ← Más localidades en {province}
          </Link>
        </div>
      </main>
    </>
  )
}
