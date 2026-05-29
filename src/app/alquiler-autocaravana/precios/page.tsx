// src/app/alquiler-autocaravana/precios/page.tsx
// Guía de precios — la intención que más volumen tiene (~11.650/mes).
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getCamperCities } from '@/lib/autocaravana-localities'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CTA = '#0b7285'
const CTA2 = '#0c4a6e'

export const metadata: Metadata = {
  title: 'Precio de alquiler de autocaravana en España 2026 | Por temporada y ciudad',
  description: '¿Cuánto cuesta alquilar una autocaravana o camper en España? Precios por temporada (80-200 €/día), por ciudad, fianza, seguro y trucos para ahorrar.',
  alternates: { canonical: '/alquiler-autocaravana/precios' },
  openGraph: { title: 'Precio de alquiler de autocaravana en España', url: `${BASE}/alquiler-autocaravana/precios`, type: 'article' },
}

const faqLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto cuesta alquilar una autocaravana en España?', acceptedAnswer: { '@type': 'Answer', text: 'Entre 80-120 €/día en temporada baja y 130-200 €/día en verano (más en vehículos de lujo). La media anual ronda los 140 €/día en temporada alta.' } },
    { '@type': 'Question', name: '¿Cuánto es la fianza?', acceptedAnswer: { '@type': 'Answer', text: 'Habitualmente entre 500 y 1.000 €, con tarjeta de crédito. Algunas empresas la reducen contratando un seguro adicional de 15-25 €/día.' } },
    { '@type': 'Question', name: '¿Cómo alquilar más barato?', acceptedAnswer: { '@type': 'Answer', text: 'Reserva con 2-3 meses de antelación, viaja en primavera/otoño o entre semana, y aprovecha el descuento por 7+ noches (kilometraje ilimitado y tarifa/día más baja).' } },
  ],
}

export default function PreciosPage() {
  const cities = getCamperCities()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/alquiler-autocaravana" style={{ color: 'inherit' }}>Alquiler autocaravanas</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span><span>Precios</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 .9rem' }}>
            ¿Cuánto cuesta alquilar una autocaravana en España?
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 620, margin: 0, color: 'rgba(255,255,255,.92)' }}>
            Precios reales por temporada y ciudad, qué incluye (fianza, seguro, kilometraje) y cómo pagar menos. Datos 2026.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>
        {/* Por temporada */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Precio por temporada (€/día)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '.65rem', marginBottom: '.75rem' }}>
          {[['Baja (nov-feb)', '80-120 €'], ['Media (mar-jun, sep-oct)', '105-150 €'], ['Alta (jul-ago, festivos)', '130-200 €'], ['Lujo / integral', '200-300 €']].map(([t, p]) => (
            <div key={t} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginBottom: '.3rem' }}>{t}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, color: CTA, fontSize: '1.1rem' }}>{p}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '2.25rem' }}>Fines de semana sueltos: desde ~300 € (mínimo 3 noches habitual). Fianza: 500-1.000 €.</p>

        {/* Por ciudad */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Precio por ciudad</h2>
        <div style={{ overflowX: 'auto', marginBottom: '2.25rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--line)' }}>
                <th style={{ padding: '.5rem .4rem' }}>Ciudad</th><th style={{ padding: '.5rem .4rem' }}>Baja</th><th style={{ padding: '.5rem .4rem' }}>Alta</th><th></th>
              </tr>
            </thead>
            <tbody>
              {cities.map(c => (
                <tr key={c.slug} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '.55rem .4rem', fontWeight: 600 }}>{c.ciudad}</td>
                  <td style={{ padding: '.55rem .4rem', color: 'var(--muted)' }}>{c.precios.baja}</td>
                  <td style={{ padding: '.55rem .4rem', color: 'var(--muted)' }}>{c.precios.alta}</td>
                  <td style={{ padding: '.55rem .4rem' }}><Link href={`/alquiler-autocaravana/${c.slug}`} style={{ color: CTA, fontWeight: 600, textDecoration: 'none' }}>Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trucos */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Cómo pagar menos</h2>
        <ul style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '.92rem', paddingLeft: '1.1rem', marginBottom: '2.25rem' }}>
          <li>Reserva con <strong>2-3 meses</strong> de antelación (Semana Santa y verano vuelan).</li>
          <li>Viaja en <strong>primavera u otoño</strong>: ahorras 20-30% y hay menos gente.</li>
          <li><strong>Entre semana</strong> y <strong>7+ noches</strong>: tarifa/día más baja y kilometraje ilimitado.</li>
          <li>Compara varias empresas a la vez en un comparador en lugar de ir web por web.</li>
        </ul>

        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compara precios para tus fechas</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.2rem' }}>Mete tus fechas y mira el precio real de varias empresas.</p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_precios')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Comparar en Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
