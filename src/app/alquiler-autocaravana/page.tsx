// src/app/alquiler-autocaravana/page.tsx — Hub alquiler de autocaravanas y campers.
// Patrón seguro del sitio: design system (estilos en línea + Nav), sin fetches
// pesados en build. Estático + ISR.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getCamperCities, TIPOS_VEHICULO } from '@/lib/autocaravana-localities'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Alquiler de autocaravanas y campers en España | Compara precios',
  description: 'Compara el alquiler de autocaravanas y campers en España por ciudad: Madrid, Barcelona, Valencia, Sevilla, Málaga. Precios por temporada, áreas de pernocta y playas aptas.',
  alternates: { canonical: '/alquiler-autocaravana', languages: { es: '/alquiler-autocaravana', en: '/en/campervan-rental' } },
  openGraph: { title: 'Alquiler de autocaravanas y campers en España', url: `${BASE}/alquiler-autocaravana`, type: 'website' },
}

const CTA = '#0b7285' // teal autocaravana
const CTA2 = '#0c4a6e'

export default function AutocaravanaHubPage() {
  const cities = getCamperCities()

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3.1rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 1rem' }}>
            Alquiler de autocaravanas y campers en España
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 1.75rem', color: 'rgba(255,255,255,.9)' }}>
            Compara precios de las principales empresas en un solo sitio y elige por ciudad de recogida. Con áreas de pernocta y <strong>playas aptas</strong> cerca de cada destino.
          </p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_hub')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.6rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1rem' }}>
            Comparar autocaravanas →
          </a>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginTop: '1rem' }}>
            Comparador con Camperdays · sin coste adicional para ti
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* CIUDADES */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .35rem' }}>
          Elige tu ciudad de recogida
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem', margin: '0 0 1.5rem' }}>
          Recoge donde te venga mejor y sal directo hacia la costa.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.75rem', marginBottom: '3rem' }}>
          {cities.map(c => (
            <Link key={c.slug} href={`/alquiler-autocaravana/${c.slug}`} prefetch={false} style={{ display: 'block', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem 1.1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>{c.ciudad}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.2rem' }}>{c.zona}</div>
              <div style={{ fontSize: '.85rem', color: CTA, fontWeight: 600, marginTop: '.5rem' }}>Desde {c.precios.baja.split('-')[0]}/día →</div>
            </Link>
          ))}
        </div>

        {/* TIPOS */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>
          ¿Autocaravana o camper?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.65rem', marginBottom: '1.25rem' }}>
          {TIPOS_VEHICULO.map(t => (
            <div key={t.nombre} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.9rem 1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>{t.nombre}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <Link href="/alquiler-autocaravana/precios" style={{ color: CTA, fontWeight: 600, fontSize: '.92rem', textDecoration: 'none' }}>
          Ver precios por temporada y ciudad →
        </Link>

        {/* CTA final */}
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2.25rem 1.5rem', textAlign: 'center', marginTop: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compara y reserva tu autocaravana</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.25rem' }}>Cientos de vehículos de varias empresas, un solo comparador.</p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_hub_bottom')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Comparar precios en Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
