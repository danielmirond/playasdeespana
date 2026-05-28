// src/app/guides/alquiler-barcos-guia-completa/page.tsx
// Master Guide: "Cómo Alquilar un Barco en España 2026"
// ~3,500 palabras | High-intent informational | SEO Pillar page

import type { Metadata } from 'next'
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/boat-rental-schema'
import { MultiJsonLd } from '@/components/seo/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cómo Alquilar un Barco en España 2026 | Guía Completa paso a paso',
  description: 'Guía completa: qué documentos necesitas, licencias, seguros, precios por tipo de barco y consejos de expertos para alquilar barco sin patrón o con capitán en España.',
  keywords: [
    'cómo alquilar barco españa',
    'licencia para alquilar barco',
    'alquiler barco sin experiencia',
    'documentos necesarios alquiler barco',
    'precio medio alquiler barco'
  ],
  openGraph: {
    title: 'Guía Completa: Cómo Alquilar un Barco en España',
    description: 'Todo lo que necesitas saber para alquilar un barco en España: documentos, licencias, seguros y precios.',
    url: 'https://playas-espana.com/guides/alquiler-barcos-guia-completa',
    type: 'article',
    authors: ['Playas de España'],
  },
  alternates: {
    canonical: 'https://playas-espana.com/guides/alquiler-barcos-guia-completa'
  }
}

const faqItems = [
  {
    question: '¿Qué licencia necesito para alquilar un barco en España?',
    answer: 'Necesitas PER (Patrón de Embarcación de Recreo) para barcos <8m sin patrón. Para >8m o con patrón propio, requieres Capitán de Yate. La mayoría de plataformas aceptan PER o permiten alquilar con patrón profesional.'
  },
  {
    question: '¿Cuánto cuesta alquilar un barco en España?',
    answer: 'Precios oscilan entre €100-600/día según tamaño y temporada. Barcos pequeños (<5.5m): €100-250/día. Medianos (5.5-8m): €200-400/día. Con patrón profesional: €300-800/día. Temporada alta (junio-agosto) +30-50%.'
  },
  {
    question: '¿Puedo alquilar barco sin experiencia previa?',
    answer: 'Sí, pero necesitas patrón profesional. Alternativamente, algunas plataformas ofrecen cursos rápidos (8-16 horas) para obtener PER. Recomendamos alquilar con patrón en tu primer viaje.'
  },
  {
    question: '¿Qué incluye el seguro de alquiler?',
    answer: 'Seguro básico cubre daños al barco, responsabilidad civil y protección jurídica. Verifica cobertura de combustible, fondeo y actividades (windsurf, snorkel). Depósito caución: €1,000-5,000.'
  },
  {
    question: '¿Cuál es la mejor temporada para alquilar?',
    answer: 'Mayo-junio y septiembre-octubre: buen tiempo, menos aglomeración, precios moderados. Julio-agosto: perfecto pero caro y concurrido. Invierno (nov-marzo): precios bajos pero pocas opciones y oleaje.'
  }
]

const articleSchema = generateArticleSchema({
  headline: 'Cómo Alquilar un Barco en España 2026 | Guía Completa',
  description: 'Guía paso a paso: documentos, licencias, seguros y consejos para alquilar barco en España',
  datePublished: '2026-05-27',
  imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200'
})

const breadcrumb = [
  { name: 'Inicio', url: 'https://playas-espana.com' },
  { name: 'Guías', url: 'https://playas-espana.com/guides' },
  { name: 'Cómo Alquilar Barco', url: 'https://playas-espana.com/guides/alquiler-barcos-guia-completa' }
]

export default function BoatRentalGuide() {
  return (
    <>
      <MultiJsonLd schemas={[
        articleSchema,
        generateFAQSchema(faqItems),
        generateBreadcrumbSchema(breadcrumb)
      ]} />

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* HERO */}
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Guía Completa
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem', color: 'var(--ink)' }}>
            Cómo Alquilar un Barco en España 2026
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 700, marginBottom: '1rem' }}>
            Guía paso a paso: documentos, licencias, seguros, precios y consejos de expertos para alquilar barco sin patrón o con capitán profesional.
          </p>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>📅 Actualizado: 27 mayo 2026</span>
            <span>⏱️ Lectura: 8 minutos</span>
            <span>👥 Por: Playas de España</span>
          </div>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem', marginBottom: '3rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--ink)' }}>Índice de contenidos</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'tipos', label: 'Tipos de Barcos Disponibles' },
              { id: 'documentos', label: 'Documentos Necesarios' },
              { id: 'licencias', label: 'Licencias y Certificaciones' },
              { id: 'precios', label: 'Precios y Tarifas 2026' },
              { id: 'plataformas', label: 'Plataformas de Alquiler' },
              { id: 'seguros', label: 'Seguros y Cauciones' },
              { id: 'consejos', label: 'Consejos de Expertos' },
              { id: 'faq', label: 'Preguntas Frecuentes' }
            ].map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  → {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* SECTION 1 */}
        <section id="tipos" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            1. Tipos de Barcos Disponibles
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            En España puedes alquilar diferentes tipos de embarcaciones según tus necesidades y experiencia:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              {
                type: 'Barcos pequeños (<5.5m)',
                desc: 'Lanchas rápidas y pequeños veleros. Ideales principiantes. Requieren PER o patrón.',
                price: '€100-200/día'
              },
              {
                type: 'Barcos medianos (5.5-8m)',
                desc: 'Veleros y motores clásicos. Balance perfecto para navegantes. Requieren PER.',
                price: '€200-400/día'
              },
              {
                type: 'Catamaranes',
                desc: 'Estables, espaciosos, perfectos para grupos. Mayor consumo combustible.',
                price: '€300-600/día'
              },
              {
                type: 'Yates de lujo (>8m)',
                desc: 'Camarotes, cocina, salón. Requieren patrón profesional obligatorio.',
                price: '€500-2000+/día'
              }
            ].map(boat => (
              <div key={boat.type} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>{boat.type}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{boat.desc}</p>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>{boat.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 */}
        <section id="documentos" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            2. Documentos Necesarios
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Antes de alquilar, prepara estos documentos:
          </p>

          <ul style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li><strong>DNI/Pasaporte</strong> válido (aceptan extranjeros con NIE)</li>
            <li><strong>Licencia de conducir</strong> (algunos alquiladores la solicitan)</li>
            <li><strong>Número de tarjeta de crédito</strong> (para caución y aval)</li>
            <li><strong>PER (Patrón de Embarcación de Recreo)</strong> si navegas sin patrón (&lt;8m)</li>
            <li><strong>Seguro de responsabilidad civil</strong> (algunas plataformas lo exigen)</li>
            <li><strong>Historial de navegación</strong> (para barcos grandes, opcional)</li>
          </ul>
        </section>

        {/* SECTION 3 - LICENCIAS */}
        <section id="licencias" style={{ marginBottom: '3rem', background: '#f0f7ff', border: '1px solid #cce5ff', borderRadius: 6, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '1rem' }}>
            3. Licencias y Certificaciones
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>🎫 PER (Patrón de Embarcación de Recreo)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong>Obligatorio para:</strong> Pilotear barcos &lt;8m, veleros, catamaranes<br/>
              <strong>Cómo obtener:</strong> Curso 8-16 horas + examen (450-600€)<br/>
              <strong>Validez:</strong> 10 años<br/>
              <strong>Dónde:</strong> Escuelas náuticas certificadas, online + presencial
            </p>
          </div>

          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>⚓ Capitán de Yate</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong>Obligatorio para:</strong> Barcos &gt;8m, navegación costera avanzada<br/>
              <strong>Cómo obtener:</strong> Curso 200+ horas + examen (2000€+)<br/>
              <strong>Validez:</strong> 10 años<br/>
              <strong>Alternativa:</strong> Alquila con patrón profesional incluido
            </p>
          </div>
        </section>

        {/* SECTION 4 - PRECIOS */}
        <section id="precios" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            4. Precios y Tarifas 2026
          </h2>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--card-bg)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem' }}>Tipo de Barco</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem' }}>Temporada Baja</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem' }}>Temporada Alta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Barco <5.5m (sin patrón)', low: '€100-150', high: '€200-250' },
                { type: 'Barco 5.5-8m (sin patrón)', low: '€150-250', high: '€350-450' },
                { type: 'Catamaran 8-12m', low: '€250-350', high: '€450-650' },
                { type: 'Con patrón profesional', low: '€300-400', high: '€600-900' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < 3 ? '1px solid var(--line)' : 'none' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{row.type}</td>
                  <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>{row.low}/día</td>
                  <td style={{ padding: '1rem', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>{row.high}/día</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 6, padding: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            💡 <strong>Consejo:</strong> Temporada baja (Nov-Mar) y shoulder season (May, Sep) ofrecen mejores precios. Reserva con 4-6 semanas de anticipación para descuentos.
          </div>
        </section>

        {/* SECTION 5 - PLATAFORMAS */}
        <section id="plataformas" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            5. Plataformas de Alquiler Recomendadas
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                name: 'SamBoat',
                url: 'samboat.es',
                pros: ['1000+ barcos España', 'Opiniones verificadas', 'Soporte 24/7'],
                cons: ['Comisión plataforma']
              },
              {
                name: 'Nautal',
                url: 'nautal.com',
                pros: ['Precios competitivos', 'Garantía de reserva', 'Filtros avanzados'],
                cons: ['Interfaz compleja']
              },
              {
                name: 'ClickBoat',
                url: 'clickboat.com',
                pros: ['Barcos verificados', 'Pagos seguros', 'Flexibilidad'],
                cons: ['Menos opciones que SamBoat']
              }
            ].map(platform => (
              <div key={platform.name} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                padding: '1.5rem'
              }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.75rem' }}>
                  {platform.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  {platform.url}
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem' }}>✅ Ventajas:</p>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                    {platform.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                  </ul>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem' }}>⚠️ Desventajas:</p>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                    {platform.cons.map((con, i) => <li key={i}>{con}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 - FAQ */}
        <section id="faq" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem' }}>
            Preguntas Frecuentes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqItems.map((item, idx) => (
              <details key={idx} style={{
                border: '1px solid var(--line)',
                borderRadius: 6,
                overflow: 'hidden'
              }}>
                <summary style={{
                  padding: '1.25rem',
                  background: 'var(--card-bg)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  color: 'var(--ink)'
                }}>
                  {item.question}
                </summary>
                <div style={{
                  padding: '1.25rem',
                  borderTop: '1px solid var(--line)',
                  fontSize: '0.9rem',
                  color: 'var(--muted)',
                  lineHeight: 1.7,
                  background: '#fafafa'
                }}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.1) 0%, rgba(3, 105, 161, 0.05) 100%)',
          border: '1px solid rgba(3, 105, 161, 0.2)',
          borderRadius: 6,
          padding: '2.5rem',
          textAlign: 'center',
          marginTop: '3rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            Listo para tu primera aventura
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
            Explora cientos de barcos verificados en todas las costas españolas. Desde Baleares hasta Costa Vasca.
          </p>
          <Link href="/alquiler-barco" style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#0369a1',
            color: 'white',
            fontWeight: 700,
            borderRadius: 6,
            textDecoration: 'none',
            transition: 'all .2s'
          }}>
            Explorar Barcos Disponibles →
          </Link>
        </section>
      </article>
    </>
  )
}
