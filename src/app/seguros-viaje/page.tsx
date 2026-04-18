// src/app/seguros-viaje/page.tsx
// Landing comercial: seguros de viaje. AOV alto (25-80€ póliza),
// comisión 30-40%. Audiencia: turistas EN/ES viendo playas de España.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const revalidate = 604800

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// Affiliate URLs. Si no hay env var, se oculta el CTA del proveedor.
const HEYMONDO_AFF = process.env.NEXT_PUBLIC_HEYMONDO_AFF ?? ''
const IATI_AFF     = process.env.NEXT_PUBLIC_IATI_AFF ?? ''
const CHAPKA_AFF   = process.env.NEXT_PUBLIC_CHAPKA_AFF ?? ''

export const metadata: Metadata = {
  title: 'Seguro de viaje para España — Comparativa 2026',
  description: 'Compara los mejores seguros de viaje para visitar España: cobertura médica, cancelación y equipaje. Heymondo, IATI y Chapka con descuento exclusivo.',
  alternates: { canonical: '/seguros-viaje' },
  openGraph: {
    title: 'Seguro de viaje para España',
    description: 'Comparativa de seguros con cobertura médica, cancelación y equipaje.',
    url: `${BASE}/seguros-viaje`,
    type: 'article',
  },
}

interface Seguro {
  marca:       string
  color:       string
  aff:         string
  url:         (aff: string) => string
  descuento:   string
  puntos:      string[]
  mejorPara:   string
  desde:       string
}

const SEGUROS: Seguro[] = [
  {
    marca:    'Heymondo',
    color:    '#0ea5e9',
    aff:      HEYMONDO_AFF,
    url:      (aff) => `https://www.heymondo.es/?agencyid=${aff}`,
    descuento: '5% de descuento aplicado',
    puntos:   [
      'Chat 24/7 con médico por la app',
      'Cancelación gratis hasta el día antes',
      'Sin copagos ni franquicias',
      'Cobertura COVID incluida',
    ],
    mejorPara: 'Viajeros digitales',
    desde:    '1,80€/día',
  },
  {
    marca:    'IATI Seguros',
    color:    '#dc2626',
    aff:      IATI_AFF,
    url:      (aff) => `https://www.iatiseguros.com/?affiliate=${aff}`,
    descuento: '10% de descuento exclusivo',
    puntos:   [
      'Equipaje y deportes acuáticos',
      'Cobertura estancia completa',
      'Asistencia 24h en español',
      'Reembolso gastos médicos',
    ],
    mejorPara: 'Familias y grupos',
    desde:    '2,10€/día',
  },
  {
    marca:    'Chapka',
    color:    '#7c3aed',
    aff:      CHAPKA_AFF,
    url:      (aff) => `https://www.chapkadirect.es/?p=${aff}`,
    descuento: 'Sin recargos ocultos',
    puntos:   [
      'Cobertura hasta 300.000€',
      'Deportes acuáticos extremos',
      'Equipaje hasta 2.000€',
      'Retraso de vuelos',
    ],
    mejorPara: 'Deportes acuáticos',
    desde:    '2,30€/día',
  },
]

export default function SegurosViajePage() {
  const disponibles = SEGUROS.filter(s => s.aff)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Seguros de viaje</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
          fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-.02em',
          marginBottom: '.75rem',
        }}>
          Seguro de viaje para España
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.65 }}>
          Comparativa actualizada de los mejores seguros de viaje para tus vacaciones de playa
          en España. Aunque la sanidad pública es buena, un seguro te cubre cancelaciones, equipaje
          perdido, deportes acuáticos y gastos no reembolsables.
        </p>

        {/* Por qué */}
        <section aria-labelledby="h2-why" style={{
          background: 'var(--card-bg)', border: '1.5px solid var(--line)',
          borderRadius: 16, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-why" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            ¿Necesito seguro si viajo a España?
          </h2>
          <ul style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Turistas UE</strong>: la Tarjeta Sanitaria Europea (TSE) cubre urgencias públicas, pero no cancelación ni equipaje.</li>
            <li><strong>Turistas de fuera de la UE</strong>: cualquier urgencia privada cuesta 150-500€. Un seguro desde 1,80€/día evita facturas.</li>
            <li><strong>Deportes acuáticos</strong>: surf, buceo, kayak y paddle NO entran en la TSE. El seguro específico sí.</li>
            <li><strong>Cancelación de viaje</strong>: si enfermas antes de venir, recuperas el dinero de vuelos, hotel y reservas.</li>
            <li><strong>Equipaje</strong>: robos en playa son comunes en zonas turísticas — 500-2000€ de cobertura.</li>
          </ul>
        </section>

        {/* Comparativa */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Comparativa: los 3 seguros más recomendados
        </h2>
        {disponibles.length === 0 ? (
          <div style={{
            background: 'rgba(234,179,8,.1)', border: '1.5px solid rgba(234,179,8,.4)',
            borderRadius: 12, padding: '1rem', fontSize: '.88rem', color: 'var(--muted)',
            marginBottom: '2rem',
          }}>
            Comparativa próximamente disponible.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2.5rem' }}>
            {disponibles.map(s => (
              <div key={s.marca} style={{
                background: 'var(--card-bg)', border: `2px solid ${s.color}22`,
                borderRadius: 16, padding: '1.25rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.35rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: s.color }}>{s.marca}</span>
                    <span style={{
                      fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem',
                      background: `${s.color}14`, color: s.color, borderRadius: 100,
                      border: `1px solid ${s.color}44`,
                    }}>{s.descuento}</span>
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.35rem' }}>
                    Mejor para: <strong style={{ color: 'var(--ink)' }}>{s.mejorPara}</strong> · desde <strong style={{ color: s.color }}>{s.desde}</strong>
                  </div>
                  <ul style={{ fontSize: '.82rem', color: 'var(--muted)', paddingLeft: '1rem', lineHeight: 1.65, margin: 0 }}>
                    {s.puntos.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
                <a
                  href={s.url(s.aff)}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    alignSelf: 'center', padding: '.75rem 1.5rem',
                    background: s.color, color: '#fff', borderRadius: 10,
                    fontSize: '.88rem', fontWeight: 800, textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ver precio →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tabla comparativa */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
          ¿Qué cobertura necesito?
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2rem', border: '1.5px solid var(--line)', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(107,64,10,.08)' }}>
                <th style={{ padding: '.6rem .85rem', textAlign: 'left', fontWeight: 700, color: 'var(--ink)' }}>Cobertura</th>
                <th style={{ padding: '.6rem .85rem', textAlign: 'left', fontWeight: 700, color: 'var(--ink)' }}>Mínimo</th>
                <th style={{ padding: '.6rem .85rem', textAlign: 'left', fontWeight: 700, color: 'var(--ink)' }}>Recomendado</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Asistencia médica',    '30.000€',    '150.000€+'],
                ['Hospitalización',       'Incluido',   'Sin franquicia'],
                ['Cancelación',           '—',          '2.000-5.000€'],
                ['Equipaje',              '500€',       '2.000€'],
                ['Deportes acuáticos',    'Verificar',  'Incluido expresamente'],
                ['Retraso de vuelo',      '—',          '150€+'],
              ].map(row => (
                <tr key={row[0]} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '.6rem .85rem', color: 'var(--ink)' }}>{row[0]}</td>
                  <td style={{ padding: '.6rem .85rem', color: 'var(--muted)' }}>{row[1]}</td>
                  <td style={{ padding: '.6rem .85rem', color: 'var(--muted)', fontWeight: 600 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <section aria-labelledby="h2-faq">
          <h2 id="h2-faq" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {[
              {
                q: '¿Cuánto cuesta un seguro de viaje para 1 semana en España?',
                a: 'Entre 15€ y 40€ por persona para una semana, según coberturas. Los seguros básicos (30.000€ asistencia) salen por 1,80€/día. Los completos con deportes y cancelación rondan los 3-4€/día.',
              },
              {
                q: '¿Cubre el seguro los deportes acuáticos?',
                a: 'Depende. Surf, kayak y paddle suelen estar cubiertos en seguros estándar. Buceo a más de 10m, jet ski o kitesurf requieren un seguro "deportes acuáticos" o extensión específica (+1-2€/día).',
              },
              {
                q: '¿Puedo contratar el seguro una vez he llegado a España?',
                a: 'Sí, Heymondo y IATI permiten contratar con el viaje iniciado, pero la cobertura de cancelación ya no aplica. Mejor contratarlo al reservar el viaje.',
              },
              {
                q: '¿Qué pasa si tengo Tarjeta Sanitaria Europea?',
                a: 'La TSE cubre urgencias en sanidad pública. NO cubre: sanidad privada, transporte médico, cancelación, equipaje ni deportes. Un seguro complementa todo lo que la TSE no cubre.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--line)', borderRadius: 12, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: '¿Cuánto cuesta un seguro de viaje para 1 semana en España?', acceptedAnswer: { '@type': 'Answer', text: 'Entre 15€ y 40€ por persona para una semana. Los básicos salen por 1,80€/día; los completos con cancelación y deportes, 3-4€/día.' } },
            { '@type': 'Question', name: '¿Cubre el seguro los deportes acuáticos?', acceptedAnswer: { '@type': 'Answer', text: 'Surf, kayak y paddle suelen estar cubiertos. Buceo profundo, jet ski o kitesurf requieren extensión específica (+1-2€/día).' } },
            { '@type': 'Question', name: '¿Puedo contratar el seguro una vez he llegado a España?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, pero la cobertura de cancelación ya no aplica. Mejor contratarlo al reservar el viaje.' } },
            { '@type': 'Question', name: '¿Qué pasa si tengo Tarjeta Sanitaria Europea?', acceptedAnswer: { '@type': 'Answer', text: 'La TSE cubre urgencias en sanidad pública. No cubre privada, cancelación, equipaje ni deportes. Un seguro lo complementa.' } },
          ],
        })}}
      />
    </>
  )
}
