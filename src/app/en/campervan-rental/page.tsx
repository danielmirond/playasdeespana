// src/app/en/campervan-rental/page.tsx — EN hub for campervan/motorhome rental.
// Mirrors /alquiler-autocaravana. Same data (city/zone/prices are toponyms or
// numbers), translated inline copy. Design system + ISR.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getCamperCities, TIPOS_VEHICULO } from '@/lib/autocaravana-localities'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// Tipos de vehículo: nombre/desc están en ES en el dataset. Traducción de
// presentación para EN (los 4 tipos son estables).
const TIPO_EN: Record<string, { name: string; desc: string }> = {
  'Autocaravana capuchina': { name: 'Coachbuilt (overcab)', desc: 'The classic family motorhome: bed over the cab, sleeps up to 6. Roomy but tall and wide to drive.' },
  'Autocaravana perfilada': { name: 'Low-profile motorhome', desc: 'Sleeker and more aerodynamic than the overcab, sleeps 2-4. Easier to drive and park.' },
  'Autocaravana integral': { name: 'A-class motorhome', desc: 'The premium option: full-width cab, most space and comfort. Larger and pricier.' },
  'Camper van': { name: 'Camper van', desc: 'A converted van: compact, easy to drive and park, ideal for couples. Less space inside.' },
  'Camper 4x4': { name: '4x4 camper', desc: 'Off-road capable for tracks and remote beaches. Higher daily rate, max freedom.' },
  'Pick-up camper': { name: 'Pick-up camper', desc: 'A camper cell on a pick-up truck: rugged and versatile for adventurous routes.' },
}
const tipoEn = (nombre: string, desc: string) => TIPO_EN[nombre] ?? { name: nombre, desc }

const CTA = '#0b7285'
const CTA2 = '#0c4a6e'

export const metadata: Metadata = {
  title: 'Campervan & motorhome rental in Spain | Compare prices',
  description: 'Compare campervan and motorhome rental in Spain by pickup city: Madrid, Barcelona, Valencia, Seville, Málaga. Prices by season, overnight areas and beaches you can park at.',
  alternates: { canonical: '/en/campervan-rental', languages: { es: '/alquiler-autocaravana', en: '/en/campervan-rental' } },
  openGraph: { title: 'Campervan & motorhome rental in Spain', url: `${BASE}/en/campervan-rental`, type: 'website' },
}

export default function CampervanHubPageEn() {
  const cities = getCamperCities()

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3.1rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 1rem' }}>
            Campervan &amp; motorhome rental in Spain
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 1.75rem', color: 'rgba(255,255,255,.9)' }}>
            Compare prices from the main rental companies in one place and choose your pickup city. With overnight areas and <strong>beaches you can park at</strong> near every destination.
          </p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_en_hub')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.6rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1rem' }}>
            Compare campervans →
          </a>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginTop: '1rem' }}>
            Price comparison with Camperdays · at no extra cost to you
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* CITIES */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .35rem' }}>
          Choose your pickup city
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem', margin: '0 0 1.5rem' }}>
          Pick up wherever suits you best and head straight for the coast.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.75rem', marginBottom: '3rem' }}>
          {cities.map(c => (
            <Link key={c.slug} href={c.en ? `/en/campervan-rental/${c.slug}` : `/alquiler-autocaravana/${c.slug}`} prefetch={false} style={{ display: 'block', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem 1.1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>{c.ciudad}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.2rem' }}>{c.zona}</div>
              <div style={{ fontSize: '.85rem', color: CTA, fontWeight: 600, marginTop: '.5rem' }}>From {c.precios.baja.split('-')[0]}/day →</div>
            </Link>
          ))}
        </div>

        {/* TYPES */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>
          Motorhome or camper van?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.65rem', marginBottom: '1.25rem' }}>
          {TIPOS_VEHICULO.map(t => {
            const e = tipoEn(t.nombre, t.desc)
            return (
              <div key={t.nombre} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.9rem 1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>{e.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{e.desc}</div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2.25rem 1.5rem', textAlign: 'center', marginTop: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compare and book your campervan</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.25rem' }}>Hundreds of vehicles from several companies, one comparison tool.</p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_en_hub_bottom')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Compare prices on Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
