// src/app/alquiler-autocaravana/tipos/page.tsx
// Cluster TIPOS — Camperdays valida volumen real: 4x4 720, lujo, integral, pick-up.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CTA = '#0b7285'; const CTA2 = '#0c4a6e'

export const metadata: Metadata = {
  title: 'Tipos de autocaravana y camper para alquilar | Capuchina, perfilada, integral, 4x4',
  description: 'Guía de tipos de autocaravana y camper para alquilar: capuchina, perfilada, integral, camper, 4x4, pick-up y lujo. Cuál elegir según viaje, plazas y presupuesto.',
  alternates: { canonical: '/alquiler-autocaravana/tipos' },
  openGraph: { title: 'Tipos de autocaravana y camper', url: `${BASE}/alquiler-autocaravana/tipos`, type: 'article' },
}

const TIPOS = [
  { n: 'Camper / furgoneta', p: '70-130 €/día', d: 'Furgoneta camperizada, ágil y económica. Cabe en casi cualquier sitio (ciudad, calas con límite de altura). Ideal parejas y escapadas cortas.' },
  { n: 'Capuchina', p: '90-160 €/día', d: 'La más demandada en familia: cama sobre la cabina, muchas plazas y espacio. Confortable para varios días.' },
  { n: 'Perfilada', p: '95-170 €/día', d: 'Equilibrio entre tamaño, consumo y comodidad. La opción "todoterreno" para la mayoría de rutas.' },
  { n: 'Integral', p: '150-300 €/día', d: 'La más amplia y premium: salón espacioso, gama alta / lujo. Para quien busca máximo confort.' },
  { n: '4x4 / todoterreno', p: 'desde 150 €/día', d: 'Tracción total para pistas y destinos remotos. Muy buscada para aventura y montaña.' },
  { n: 'Pick-up camper', p: 'según modelo', d: 'Célula sobre un pick-up: robusta y capaz fuera del asfalto, formato compacto.' },
]

export default function TiposPage() {
  return (
    <>
      <Nav />
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/alquiler-autocaravana" style={{ color: 'inherit' }}>Alquiler autocaravanas</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span><span>Tipos</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 .9rem' }}>
            Tipos de autocaravana y camper para alquilar
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 620, margin: 0, color: 'rgba(255,255,255,.92)' }}>
            Cuál elegir según tu viaje, plazas y presupuesto — de la camper ágil a la integral de lujo.
          </p>
        </div>
      </section>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '.75rem', marginBottom: '2.5rem' }}>
          {TIPOS.map(t => (
            <div key={t.n} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1.1rem 1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.5rem' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>{t.n}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: CTA, whiteSpace: 'nowrap' }}>{t.p}</div>
              </div>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55, margin: '.4rem 0 0' }}>{t.d}</p>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '.92rem', lineHeight: 1.65, marginBottom: '2rem' }}>
          ¿Dudas entre <Link href="/alquiler-autocaravana/caravana-vs-autocaravana-vs-camper" style={{ color: CTA, fontWeight: 600 }}>caravana, autocaravana o camper</Link>? Y mira la <Link href="/alquiler-autocaravana/precios" style={{ color: CTA, fontWeight: 600 }}>guía de precios</Link>.
        </p>
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compara modelos disponibles</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.2rem' }}>Filtra por tipo, plazas y fechas en el comparador.</p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_tipos')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver modelos en Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
