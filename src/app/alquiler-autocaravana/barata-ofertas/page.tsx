// src/app/alquiler-autocaravana/barata-ofertas/page.tsx
// Intención "barata/ofertas" (~5.940/mes).
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CTA = '#0b7285'; const CTA2 = '#0c4a6e'

export const metadata: Metadata = {
  title: 'Alquiler de autocaravana barata en España | Ofertas y trucos 2026',
  description: 'Cómo alquilar una autocaravana o camper barata en España: cuándo reservar, temporadas, entre semana, 7+ noches y comparar varias empresas. Ofertas reales 2026.',
  alternates: { canonical: '/alquiler-autocaravana/barata-ofertas' },
  openGraph: { title: 'Alquiler de autocaravana barata en España', url: `${BASE}/alquiler-autocaravana/barata-ofertas`, type: 'article' },
}

const TRUCOS = [
  { t: 'Reserva con antelación', d: 'Con 2-3 meses ahorras 10-15% frente a última hora. Semana Santa y verano se agotan pronto.' },
  { t: 'Evita julio y agosto', d: 'Primavera y otoño cuestan un 20-30% menos y hay más disponibilidad y menos gente.' },
  { t: 'Viaja entre semana', d: 'De lunes a jueves la demanda baja y muchas empresas bajan la tarifa/día.' },
  { t: 'Alquila 7+ noches', d: 'A partir de una semana el kilometraje suele ser ilimitado y la tarifa/día cae un 5-15%.' },
  { t: 'Compara varias empresas', d: 'Los precios varían mucho entre empresas: un comparador te enseña todas a la vez.' },
  { t: 'Ojo a los extras', d: 'Fianza (500-1.000 €), seguro a todo riesgo, menaje, segundo conductor: súmalos al comparar.' },
]

export default function BarataPage() {
  return (
    <>
      <Nav />
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/alquiler-autocaravana" style={{ color: 'inherit' }}>Alquiler autocaravanas</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span><span>Barata / ofertas</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 .9rem' }}>
            Alquiler de autocaravana barata en España
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 620, margin: 0, color: 'rgba(255,255,255,.92)' }}>
            Trucos reales para pagar menos por tu autocaravana o camper, y dónde están las ofertas.
          </p>
        </div>
      </section>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '.75rem', marginBottom: '2.25rem' }}>
          {TRUCOS.map((x, i) => (
            <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem 1.1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.3rem' }}>{i + 1}. {x.t}</div>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{x.d}</p>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '.92rem', marginBottom: '2rem' }}>
          Mira también la <Link href="/alquiler-autocaravana/precios" style={{ color: CTA, fontWeight: 600 }}>guía de precios por temporada y ciudad</Link>.
        </p>
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 .6rem' }}>Busca las ofertas para tus fechas</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.2rem' }}>Compara el precio real de varias empresas en segundos.</p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_barata')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver ofertas en Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
