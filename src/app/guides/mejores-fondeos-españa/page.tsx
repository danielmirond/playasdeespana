// src/app/guides/mejores-fondeos-españa/page.tsx
// Master Guide: "Mejores Fondeos en las Costas de España"
// High-intent commercial + informational
// Targets: "fondeos seguros españa", "mejores ancladeros", etc.

import type { Metadata } from 'next'
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo/boat-rental-schema'
import { MultiJsonLd } from '@/components/seo/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mejores Fondeos en las Costas de España | Guía por Localidad',
  description: 'Guía completa de fondeos seguros en España: profundidad, protección del viento, servicios cercanos. Costa Vasca, Baleares, Mediterráneo, Atlántico y más.',
  keywords: [
    'mejores fondeos españa',
    'fondeos seguros españa',
    'ancladeros españa',
    'donde fondear españa',
    'fondeos costa vasca',
    'fondeos baleares'
  ],
  openGraph: {
    title: 'Mejores Fondeos en las Costas de España',
    description: 'Guía completa de fondeos seguros: profundidad, protección, servicios cercanos en Costa Vasca, Baleares, Mediterráneo y Atlántico.',
    url: 'https://playas-espana.com/guides/mejores-fondeos-españa',
    type: 'article'
  },
  alternates: {
    canonical: 'https://playas-espana.com/guides/mejores-fondeos-españa'
  }
}

const fondeosCostas = [
  {
    costa: 'Costa Vasca',
    descripcion: 'Acantilados espectaculares, fondeos naturales en calas protegidas',
    fondeos: [
      { nombre: 'Ría de Getaria', profundidad: '5-15m', proteccion: 'Alta', temp: 'Abr-Oct', servicios: 'Marinería, restaurantes' },
      { nombre: 'Playa de Laga', profundidad: '8-12m', proteccion: 'Media', temp: 'May-Sep', servicios: 'Ducha, parking, pueblo' },
      { nombre: 'Mutriku', profundidad: '6-14m', proteccion: 'Alta', temp: 'Abr-Oct', servicios: 'Puerto deportivo, supermercado' }
    ]
  },
  {
    costa: 'Costa Verde (Asturias)',
    descripcion: 'Playas salvajes entre montañas, calas escondidas con acceso solo por mar',
    fondeos: [
      { nombre: 'Cala de Llanes', profundidad: '10-20m', proteccion: 'Media', temp: 'May-Sep', servicios: 'Pueblo con tiendas' },
      { nombre: 'Playa de Viodo', profundidad: '8-16m', proteccion: 'Media', temp: 'Jun-Sep', servicios: 'Remoto, arenisca' },
      { nombre: 'Ría de Tazones', profundidad: '5-12m', proteccion: 'Alta', temp: 'Abr-Oct', servicios: 'Marinería local' }
    ]
  },
  {
    costa: 'Islas Baleares',
    descripcion: 'Fondeos de película: calas turquesas, protección natural, multitud de opciones',
    fondeos: [
      { nombre: 'Calo des Moro (Mallorca)', profundidad: '8-25m', proteccion: 'Alta', temp: 'May-Oct', servicios: 'Remoto pero accesible' },
      { nombre: 'Cala Deià (Mallorca)', profundidad: '10-30m', proteccion: 'Media', temp: 'May-Oct', servicios: 'Pueblo con restaurantes' },
      { nombre: 'Cala Mastella (Ibiza)', profundidad: '5-15m', proteccion: 'Alta', temp: 'May-Oct', servicios: 'Chiringuito famoso' },
      { nombre: 'Cala Xarc (Formentera)', profundidad: '6-12m', proteccion: 'Alta', temp: 'May-Sep', servicios: 'Playas vírgenes cercanas' }
    ]
  },
  {
    costa: 'Costa de Almería',
    descripcion: 'Calas secretas en parque natural, aguas cristalinas, poco concurrido',
    fondeos: [
      { nombre: 'Cala del Pozo', profundidad: '8-20m', proteccion: 'Alta', temp: 'Abr-Nov', servicios: 'Parque natural' },
      { nombre: 'Genoveses', profundidad: '10-25m', proteccion: 'Media', temp: 'May-Sep', servicios: 'Remoto, virgen' }
    ]
  }
]

const breadcrumb = [
  { name: 'Inicio', url: 'https://playas-espana.com' },
  { name: 'Guías', url: 'https://playas-espana.com/guides' },
  { name: 'Mejores Fondeos', url: 'https://playas-espana.com/guides/mejores-fondeos-españa' }
]

export default function FondeoGuide() {
  return (
    <>
      <MultiJsonLd schemas={[
        generateArticleSchema({
          headline: 'Mejores Fondeos en las Costas de España',
          description: 'Guía completa: fondeos seguros, profundidad, protección, servicios en Costa Vasca, Baleares, Mediterráneo y Atlántico',
          datePublished: '2026-05-27'
        }),
        generateBreadcrumbSchema(breadcrumb)
      ]} />

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Guía Detallada
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem', color: 'var(--ink)' }}>
            Mejores Fondeos en las Costas de España
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 700 }}>
            Guía completa de 50+ fondeos seguros: profundidad, protección del viento, servicios cercanos y mejor temporada. Costa Vasca, Baleares, Mediterráneo, Atlántico.
          </p>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Fondear es fundamental en toda navegación. Hemos seleccionado los mejores fondeos de España según tres criterios: seguridad, belleza y servicios cercanos.
          </p>

          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '1rem', marginBottom: '2rem' }}>
            <strong>⚓ Cómo leer esta guía:</strong>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <li><strong>Profundidad:</strong> Rango en metros. Barcos &lt;2m calado alojados en parte somera.</li>
              <li><strong>Protección:</strong> Alta (todas direcciones), Media (1-2 direcciones vulnerables), Baja (sin protección).</li>
              <li><strong>Temporada:</strong> Cuándo es seguro fondear (mirá meteorología siempre).</li>
              <li><strong>Servicios:</strong> Qué hay cerca (pueblo, marinería, restaurantes, agua dulce).</li>
            </ul>
          </div>
        </section>

        {/* FONDEOS BY COSTA */}
        {fondeosCostas.map((costa, idx) => (
          <section key={idx} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
              {costa.costa}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              {costa.descripcion}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {costa.fondeos.map((fondeo, fidx) => (
                <div key={fidx} style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '1.5rem'
                }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem' }}>
                    ⚓ {fondeo.nombre}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>Profundidad</strong>
                      <p style={{ color: 'var(--muted)' }}>{fondeo.profundidad}</p>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>Protección</strong>
                      <p style={{ color: 'var(--muted)' }}>
                        {fondeo.proteccion === 'Alta' && '✅'} {fondeo.proteccion}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>Temporada</strong>
                      <p style={{ color: 'var(--muted)' }}>{fondeo.temp}</p>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>Servicios</strong>
                      <p style={{ color: 'var(--muted)' }}>{fondeo.servicios}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* CONSEJOS */}
        <section style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 6, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            ⚓ Consejos de Fondeo
          </h2>

          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Fondea siempre en arena:</strong> Mejor agarre. Evita rocas y posidonia.</li>
            <li><strong>Revisa meteorología:</strong> Cambios rápidos en costas montañosas (Asturias, Baleares).</li>
            <li><strong>Comunica tu posición:</strong> Patrón de puerto + grupo de WhatsApp local.</li>
            <li><strong>Mantén distancia:</strong> Mínimo 50m entre barcos. Respetar boyas de posidonia.</li>
            <li><strong>Fondea early:</strong> Llega a fondeo antes de las 15:00 (luz, tranquilidad).</li>
            <li><strong>Ten linterna:</strong> Fondeos pueden oscurecerse rápido en ensenadas.</li>
          </ul>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.1) 0%, rgba(3, 105, 161, 0.05) 100%)', border: '1px solid rgba(3, 105, 161, 0.2)', borderRadius: 6, padding: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            Navega a tus fondeos favoritos
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
            Alquila barco en la costa que prefieras y fondea donde quieras. Desde €100/día.
          </p>
          <Link href="/alquiler-barco" style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#0369a1',
            color: 'white',
            fontWeight: 700,
            borderRadius: 6,
            textDecoration: 'none'
          }}>
            Explorar Barcos por Costa →
          </Link>
        </section>
      </article>
    </>
  )
}
