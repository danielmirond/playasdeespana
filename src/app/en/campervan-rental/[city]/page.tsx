// src/app/en/campervan-rental/[city]/page.tsx — EN city page (mirror of
// /alquiler-autocaravana/[ciudad]). Only cities with a translation (c.en) are
// published; the rest stay on the ES hub link.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getCamperCitiesEn, getCamperCity, TIPOS_VEHICULO } from '@/lib/autocaravana-localities'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CTA = '#0b7285'
const CTA2 = '#0c4a6e'

const TIPO_EN: Record<string, { name: string; desc: string }> = {
  'Camper / furgoneta': { name: 'Camper van', desc: 'Nimble and affordable, ideal for couples and short trips. Easy to park in town and on the coast.' },
  'Capuchina': { name: 'Coachbuilt (overcab)', desc: 'The family favourite: bed over the cab, lots of space and berths.' },
  'Perfilada': { name: 'Low-profile motorhome', desc: 'A balance of size and fuel use, comfortable for multi-day routes.' },
  'Integral': { name: 'A-class motorhome', desc: 'The roomiest, premium option with a spacious lounge. High-end / luxury.' },
}
const tipoEn = (n: string, d: string) => TIPO_EN[n] ?? { name: n, desc: d }

interface Props { params: Promise<{ city: string }> }

export async function generateStaticParams() {
  return getCamperCitiesEn().map(c => ({ city: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const c = getCamperCity(city)
  if (!c || !c.en) return {}
  return {
    title: `Campervan & motorhome rental in ${c.ciudad} | Compare prices`,
    description: `Rent a motorhome or campervan in ${c.ciudad} (${c.zona}). Compare prices by season, pickup at ${c.aeropuerto}, overnight areas and beaches you can park at nearby.`,
    alternates: { canonical: `/en/campervan-rental/${c.slug}`, languages: { es: `/alquiler-autocaravana/${c.slug}`, en: `/en/campervan-rental/${c.slug}` } },
    openGraph: { title: `Campervan & motorhome rental in ${c.ciudad}`, url: `${BASE}/en/campervan-rental/${c.slug}`, type: 'article' },
  }
}

function ued(path: string | null): string {
  return path ? `https://www.camperdays.es/${path}` : 'https://www.camperdays.es/campervans-spain.html'
}

export default async function CamperCityPageEn({ params }: Props) {
  const { city } = await params
  const c = getCamperCity(city)
  if (!c || !c.en) notFound()
  const en = c.en

  const cta1 = camperdaysAwinUrl(`playasdeespana_camper_en_${c.slug}`, ued(c.camperdaysPath))
  const cta2 = camperdaysAwinUrl(`playasdeespana_camper_en_${c.slug}_bottom`, ued(c.camperdaysPath))

  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'en',
    mainEntity: en.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />

      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/en" style={{ color: 'inherit' }}>Home</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span>
            <Link href="/en/campervan-rental" style={{ color: 'inherit' }}>Campervan rental</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span>
            <span aria-current="page">{c.ciudad}</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.7rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 .9rem' }}>
            Campervan &amp; motorhome rental in {c.ciudad}
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 640, margin: '0 0 1.6rem', color: 'rgba(255,255,255,.92)' }}>{en.intro}</p>
          <a href={cta1} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.6rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Compare prices in {c.ciudad} →
          </a>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>
        {/* PRICES */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Typical prices in {c.ciudad}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.65rem' }}>
            {[['Low season', c.precios.baja], ['Mid season', c.precios.media], ['High season', c.precios.alta]].map(([t, p]) => (
              <div key={t} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.3rem' }}>{t}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, color: CTA, fontSize: '1.15rem' }}>{p}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.6rem' }}>
            Standard overcab motorhome. Booking ahead and midweek saves 20-30%.
          </p>
        </section>

        {/* PICKUP + LEZ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .75rem' }}>Pickup in {c.ciudad}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{en.recogida}</p>
          {c.zbe && (
            <div style={{ marginTop: '.9rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '.8rem 1rem', fontSize: '.85rem', color: '#7c2d12' }}>
              ⚠️ <strong>{c.ciudad} has a Low Emission Zone (LEZ).</strong> Rental motorhomes usually carry a C/ECO sticker and can drive; confirm the sticker when booking.
            </div>
          )}
        </section>

        {/* ROUTES */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Routes from {c.ciudad}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.65rem' }}>
            {en.rutas.map(r => (
              <div key={r.nombre} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.9rem 1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>{r.nombre}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BEACHES + AREAS */}
        <section style={{ marginBottom: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '1.25rem 1.4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .6rem' }}>Beaches &amp; overnight areas nearby</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 .5rem' }}>{en.playasNota}</p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 .75rem' }}>{en.areasNota}</p>
        </section>

        {/* TYPES */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Which vehicle to choose?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.6rem' }}>
            {TIPOS_VEHICULO.map(t => {
              const e = tipoEn(t.nombre, t.desc)
              return (
                <div key={t.nombre} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem', fontSize: '.92rem' }}>{e.name}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>{e.desc}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {en.faqs.map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', fontSize: '.92rem' }}>{f.q}</summary>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginTop: '.55rem', fontSize: '.88rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2.25rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compare your campervan in {c.ciudad}</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.25rem' }}>Several companies, one comparison tool. At no extra cost to you.</p>
          <a href={cta2} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            See prices on Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
