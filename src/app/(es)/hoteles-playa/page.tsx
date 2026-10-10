// src/app/hoteles-playa/page.tsx
// Hub general de hoteles en la playa. Lista provincias costeras como
// punto de entrada a /hoteles-playa/[provincia]. Resuelve el 404 que
// teníamos al enlazar /hoteles-playa desde footer y enlazado interno.

import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getProvinciasCosteras } from '@/lib/provinciaTopicHelpers'
import EnlacesRelacionados from '@/components/seo/EnlacesRelacionados'
import AuthorByline from '@/components/seo/AuthorByline'
import { getFileLastModified } from '@/lib/dateModified'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const MODIFIED = getFileLastModified('src/app/hoteles-playa/page.tsx')

export const metadata: Metadata = {
  title: 'Hoteles en la playa en España | Reserva por provincia',
  description:
    'Hoteles en primera línea de playa en España. Selección por provincia costera con reservas Booking, cancelación gratuita y filtros por servicios.',
  alternates: { canonical: '/hoteles-playa' },
  openGraph: {
    title: 'Hoteles en la playa en España',
    description: 'Comparador de hoteles en primera línea de playa por provincia costera.',
    url: `${BASE}/hoteles-playa`,
    type: 'website',
    images: [{ url: '/api/og?playa=Hoteles%20en%20la%20playa%20en%20Espa%C3%B1a', width: 1200, height: 630 }],
  },
}

const FAQ = [
  {
    q: '¿Qué buscar en un hotel en primera línea de playa?',
    a: 'Lo más importante: vista al mar real (no "vista lateral"), distancia exacta a la arena, ruido del paseo marítimo, accesibilidad, y servicios incluidos (toallas de playa, hamacas, desayuno). Las playas con bandera azul suelen tener hoteles mejor regulados.',
  },
  {
    q: '¿Cuándo reservar para conseguir mejor precio?',
    a: 'Para temporada alta (julio-agosto), reserva antes del 15 de mayo: los precios suben un 30-40% en junio. Las cancelaciones tardías de los hoteles aparecen en abril-mayo y son la mejor oportunidad. Compara siempre el precio directo del hotel con Booking.',
  },
  {
    q: '¿Cuáles son las mejores provincias para hotel de playa en España?',
    a: 'Para playas largas y todo incluido: Málaga, Alicante y Las Palmas. Para calas y pequeño hotel boutique: Girona, Mallorca y Menorca. Para surf y costa salvaje: Cádiz, Cantabria y Asturias. Para escapadas en familia con bandera azul: Castellón, Tarragona y Almería.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type':           'Question',
    name:              f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default async function Page() {
  const provincias = await getProvinciasCosteras()

  return (
    <>
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem',
        }}>
          Hoteles en la playa en España
        </h1>
        <AuthorByline
          headline="Hoteles en la playa en España: guía por provincia costera"
          url={`${BASE}/hoteles-playa`}
          dateModified={MODIFIED}
          description="Hoteles en primera línea de playa en España, organizados por provincia costera con reservas Booking."
          articleSection="Alojamiento en la playa"
        />

        <p data-speakable style={{ fontSize: '.92rem', color: 'var(--muted)', maxWidth: 560, marginBottom: '2rem' }}>
          Hoteles en primera línea de playa en España, organizados por las {provincias.length} provincias
          costeras. Desde resorts de todo incluido hasta hoteles boutique de cala y casas rurales con
          acceso al mar. Filtra por playa con Bandera Azul y reserva con cancelación gratuita.
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)' }}>
          Por provincia costera
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '.65rem', marginBottom: '3rem',
        }}>
          {provincias.map(p => (
            <Link
              key={p.slug}
              href={`/hoteles-playa/${p.slug}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.15rem', background: 'var(--card-bg)',
                border: '1px solid var(--line)', borderRadius: 6, textDecoration: 'none',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)' }}>
                Hoteles en {p.nombre}
              </div>
              <span style={{
                fontSize: '.82rem', fontWeight: 700, color: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))',
                padding: '.2rem .55rem', borderRadius: 100,
              }}>
                {p.count}
              </span>
            </Link>
          ))}
        </div>

        <section aria-labelledby="faq-title" style={{ marginBottom: '2.5rem' }}>
          <h2 id="faq-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)' }}>
            Preguntas frecuentes
          </h2>
          {FAQ.map(item => (
            <details key={item.q} style={{
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '.85rem 1rem', marginBottom: '.5rem',
            }}>
              <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>
                {item.q}
              </summary>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>
                {item.a}
              </p>
            </details>
          ))}
        </section>

        <EnlacesRelacionados topic="hoteles-playa" />
      </main>
    </>
  )
}
