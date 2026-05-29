// src/app/alquiler-autocaravana/caravana-vs-autocaravana-vs-camper/page.tsx
// Captura el universo "caravana" (~17k/mes, Google lo mezcla) y aclara dudas → CTA.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CTA = '#0b7285'; const CTA2 = '#0c4a6e'

export const metadata: Metadata = {
  title: 'Caravana vs autocaravana vs camper: diferencias y cuál alquilar',
  description: 'Diferencias entre caravana, autocaravana y furgoneta camper: qué son, ventajas, precio y cuál te conviene alquilar según tu viaje. Guía clara 2026.',
  alternates: { canonical: '/alquiler-autocaravana/caravana-vs-autocaravana-vs-camper' },
  openGraph: { title: 'Caravana vs autocaravana vs camper', url: `${BASE}/alquiler-autocaravana/caravana-vs-autocaravana-vs-camper`, type: 'article' },
}

const faqLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué diferencia hay entre caravana, autocaravana y camper?', acceptedAnswer: { '@type': 'Answer', text: 'La caravana se remolca (no tiene motor); la autocaravana es un vehículo-vivienda con motor propio; la camper es una furgoneta adaptada para dormir, más compacta y ágil.' } },
    { '@type': 'Question', name: '¿Qué es mejor alquilar?', acceptedAnswer: { '@type': 'Answer', text: 'Para moverte cada día sin enganchar/desenganchar, autocaravana o camper. La camper es más barata y ágil (parejas, ciudad, calas); la autocaravana ofrece más espacio y baño completo (familias, rutas largas).' } },
  ],
}

const ROWS = [
  ['', 'Caravana', 'Autocaravana', 'Camper'],
  ['Motor', 'No (se remolca)', 'Sí', 'Sí'],
  ['Tamaño/espacio', 'Amplia (estática)', 'Amplia + baño completo', 'Compacta'],
  ['Conducción', 'Necesitas coche + maniobra', 'Como vehículo grande', 'Casi como un coche'],
  ['Aparcar', 'Difícil', 'Media', 'Fácil'],
  ['Precio alquiler', 'Bajo', 'Medio-alto', 'Bajo-medio'],
  ['Ideal para', 'Estancia fija en camping', 'Familias, rutas largas', 'Parejas, escapadas, costa'],
]

export default function CaravanaVsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/alquiler-autocaravana" style={{ color: 'inherit' }}>Alquiler autocaravanas</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span><span>Caravana vs autocaravana vs camper</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem,5vw,2.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 .9rem' }}>
            Caravana vs autocaravana vs camper: ¿cuál alquilar?
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 620, margin: 0, color: 'rgba(255,255,255,.92)' }}>
            Se confunden mucho pero son cosas distintas. Te lo aclaramos en 1 minuto y te decimos cuál te conviene.
          </p>
        </div>
      </section>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.86rem' }}>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--line)', background: ri === 0 ? 'var(--card-bg)' : 'transparent' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '.55rem .5rem', fontWeight: ri === 0 || ci === 0 ? 700 : 400, color: ri === 0 ? 'var(--ink)' : ci === 0 ? 'var(--ink)' : 'var(--muted)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '.92rem', lineHeight: 1.65, marginBottom: '.5rem' }}>
          <strong>En resumen:</strong> si buscas libertad de movimiento día a día, alquila <strong>autocaravana</strong> (familias, baño completo) o <strong>camper</strong> (parejas, ágil y barata). La caravana compensa solo si vas a estar fijo en un camping.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '.92rem', marginBottom: '2rem' }}>
          Mira los <Link href="/alquiler-autocaravana/tipos" style={{ color: CTA, fontWeight: 600 }}>tipos de autocaravana</Link> y la <Link href="/alquiler-autocaravana/precios" style={{ color: CTA, fontWeight: 600 }}>guía de precios</Link>.
        </p>
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compara autocaravanas y campers</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.2rem' }}>Elige el vehículo perfecto para tu viaje y mira precios reales.</p>
          <a href={camperdaysAwinUrl('playasdeespana_camper_caravana_vs')} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Comparar en Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
