// src/app/alquiler-barco/sin-licencia/page.tsx — Pilar transaccional
// "alquiler barco sin licencia". Intención enorme y validada (Reddit,
// Nautal tiene página dedicada); hasta ahora vivía enterrada dentro de
// las fichas de localidad. Normativa REAL (RD 875/2014): sin titulación,
// motor ≤15 CV y eslora ≤5 m (6 m a vela), navegación diurna, máx. 2
// millas de un puerto o refugio. Precios desde el dataset (nada inventado).
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getAllLocalities } from '@/lib/boat-rental-localities'
import { samboatAwinUrl, boatRentalSlug } from '@/lib/boat-rental-helpers'

export const revalidate = 86400

const BASE = 'https://playas-espana.com'
const CTA = '#0b7285'
const CTA2 = '#0c4a6e'

export const metadata: Metadata = {
  title: 'Alquiler de barcos sin licencia en España: dónde y qué puedes llevar',
  description: 'Alquila un barco sin titulación en España: qué embarcaciones puedes llevar según la normativa, cuánto cuesta por zonas, 21 destinos donde reservar y consejos para tu primera vez al timón.',
  alternates: { canonical: '/alquiler-barco/sin-licencia' },
  openGraph: {
    title: 'Alquiler de barcos sin licencia en España',
    url: `${BASE}/alquiler-barco/sin-licencia`,
    type: 'article',
    images: [{ url: '/api/og?playa=Barcos%20sin%20licencia', width: 1200, height: 630 }],
  },
}

const FAQ = [
  { q: '¿Qué barco puedo llevar sin licencia en España?', a: 'La normativa (Real Decreto 875/2014) permite manejar sin ninguna titulación embarcaciones de motor de hasta 15 CV (11,26 kW) y 5 metros de eslora, o veleros de hasta 6 metros. Solo de día y sin alejarse más de 2 millas náuticas de un puerto, marina o refugio. En la práctica: los barcos "sin licencia" de las empresas de alquiler ya cumplen estos límites, no tienes que calcular nada.' },
  { q: '¿Qué edad mínima piden?', a: 'La normativa exige ser mayor de edad: 18 años. Algunas empresas de alquiler suben su propio mínimo a 21 o piden que el titular de la reserva sea también quien pilote. Compruébalo en las condiciones de la oferta antes de reservar.' },
  { q: '¿Cuánto cuesta alquilar un barco sin licencia?', a: 'Entre 95 y 180 € al día según la zona y la temporada (los barcos sin licencia son la categoría más barata del alquiler náutico). A eso súmale el combustible que consumas y una fianza que se bloquea y se devuelve al entregar el barco sin daños, normalmente de 300 a 600 €.' },
  { q: '¿Es difícil manejar un barco sin experiencia?', a: 'No: son barcos pequeños, estables y con poca potencia, pensados exactamente para eso. Antes de salir, la empresa te da un briefing de 15-30 minutos con el manejo, la zona permitida y las normas básicas. La regla de oro del primer día: sal con mar en calma, no te alejes de la costa y vuelve con margen de sobra de combustible y de luz.' },
  { q: '¿Puedo llevar una moto de agua sin título?', a: 'No. Las motos náuticas siempre exigen titulación (o hacerlo dentro de un circuito vigilado de una empresa con monitor). El "sin licencia" solo aplica a embarcaciones de recreo dentro de los límites de motor y eslora de la normativa.' },
  { q: '¿Y si quiero un barco más grande?', a: 'Tienes dos caminos: sacarte una titulación náutica (la Licencia de Navegación o "titulín" se obtiene en un día e ya te permite 6 metros y navegar a 2 millas; el PNB y el PER amplían eslora y distancia), o alquilar con patrón: llevas la ruta que quieras y pilota un profesional. Todas nuestras fichas de destino incluyen la opción con patrón.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE },
    { '@type': 'ListItem', position: 2, name: 'Alquiler de barcos', item: `${BASE}/alquiler-barco` },
    { '@type': 'ListItem', position: 3, name: 'Sin licencia', item: `${BASE}/alquiler-barco/sin-licencia` },
  ],
}

export default function SinLicenciaPage() {
  const locs = getAllLocalities()
  const affId = process.env.NEXT_PUBLIC_AWIN_AFFID || 'playasdeespana'
  // Destino final verificado (los paths "sin licencia" de SamBoat hacen 301
  // aquí; ir directo evita el salto y protege el tracking de afiliado).
  const cta = samboatAwinUrl(affId, '/alquiler-barco/espana', 'playasdeespana_sinlicencia')

  // Rango real de precios del dataset (categoría small = sin licencia)
  const mins = locs.map(l => l.pricing.small.min)
  const desde = Math.min(...mins)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Nav />

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/" style={{ color: 'inherit' }}>Inicio</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span>
            <Link href="/alquiler-barco" style={{ color: 'inherit' }}>Alquiler de barcos</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span>
            <span aria-current="page">Sin licencia</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.7rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 .9rem' }}>
            Alquiler de barcos sin licencia
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 640, margin: '0 0 1.6rem', color: 'rgba(255,255,255,.92)' }}>
            Sí: puedes alquilar un barco en España sin ninguna titulación y patronearlo tú.
            Aquí tienes lo que dice la normativa, lo que cuesta de verdad y los {locs.length} destinos
            donde reservarlo, desde {desde} €/día.
          </p>
          <a href={cta} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.6rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver barcos sin licencia →
          </a>
        </div>
      </section>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>

        {/* NORMATIVA */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .9rem' }}>
            Qué puedes llevar sin titulación (y qué no)
          </h2>
          <div style={{ maxWidth: 700, color: 'var(--ink)', lineHeight: 1.7, fontSize: '.95rem' }}>
            <p style={{ margin: '0 0 1rem' }}>
              La regla la fija el Real Decreto 875/2014: sin ningún título puedes manejar
              <strong> embarcaciones de motor de hasta 15 CV y 5 metros de eslora</strong> (hasta 6 metros
              si es a vela), siempre <strong>de día</strong> y sin alejarte más de <strong>2 millas náuticas</strong> de
              un puerto o refugio. Es exactamente el barco de "un día de calas": espacio para 4-6 personas,
              toldo, escalera de baño y una zona de navegación que cubre toda la costa cercana.
            </p>
            <p style={{ margin: 0 }}>
              Fuera de ese marco necesitas titulación (o patrón): motos de agua siempre, barcos más grandes,
              navegación nocturna o alejarte más. Si se te queda corto, la Licencia de Navegación
              — el "titulín" — se saca en un día sin examen, y la opción <em>con patrón</em> te
              permite cualquier barco desde el primer día.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.65rem', marginTop: '1.25rem' }}>
            {[
              ['✅ Sin título', 'Motor ≤15 CV y ≤5 m · vela ≤6 m · de día · a 2 millas de refugio'],
              ['🪪 Edad', '18 años (algunas empresas piden 21)'],
              ['⛽ Extras', 'Combustible aparte · fianza 300-600 € que se devuelve'],
              ['🚫 Nunca sin título', 'Motos de agua, noche, más eslora o distancia'],
            ].map(([t, d]) => (
              <div key={t} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.9rem 1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem', fontSize: '.9rem' }}>{t}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DÓNDE */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .9rem' }}>
            Dónde alquilar barco sin licencia
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, maxWidth: 700, margin: '0 0 1.1rem', fontSize: '.92rem' }}>
            Cada destino tiene su ficha con precios por temporada, calas accesibles solo por mar y fondeos
            recomendados. El precio es el de la categoría sin licencia.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.6rem' }}>
            {locs.map(l => (
              <Link
                key={l.slug}
                href={`/alquiler-barco/costas/${boatRentalSlug(l.coast)}/provincias/${boatRentalSlug(l.province)}/${l.slug}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.75rem .9rem', textDecoration: 'none' }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{l.locality}</span>
                  <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{l.coast}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.78rem', color: CTA, fontWeight: 700, whiteSpace: 'nowrap' }}>{l.pricing.small.min} €/día</span>
              </Link>
            ))}
          </div>
        </section>

        {/* PRIMERA VEZ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .9rem' }}>
            Tu primera vez al timón: lo que nadie te cuenta
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.55rem', maxWidth: 700 }}>
            {[
              'El briefing de salida (15-30 min) es la clave del día: pregunta ahí todo lo que te dé vergüenza preguntar en el mar.',
              'El viento casi siempre sube por la tarde. Haz la milla "difícil" por la mañana y vuelve empujado, no remontando.',
              'Las distancias en el mar engañan: esa cala "que se ve ahí" puede estar a 40 minutos. Planea la mitad de lo que crees que te da tiempo.',
              'Fondea siempre sobre arena (se ve clara desde arriba) — sobre roca se engancha y sobre posidonia está prohibido y multado.',
              'Combustible: el depósito se paga aparte al volver. Un día normal de calas son 20-40 € — acelerar a fondo lo duplica.',
              'Vuelve con una hora de margen sobre la hora de entrega. La fianza se devuelve entera si el barco llega como salió.',
            ].map(c => (
              <li key={c.slice(0, 20)} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                <span style={{ color: CTA, fontWeight: 800 }}>›</span>{c}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {FAQ.map(f => (
              <details key={f.q} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', fontSize: '.92rem' }}>{f.q}</summary>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginTop: '.55rem', fontSize: '.88rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2.25rem 1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 .6rem' }}>Tu día de calas, sin título y sin líos</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.25rem' }}>Compara los barcos sin licencia disponibles en tu zona y reserva online.</p>
          <a href={cta} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver barcos sin licencia →
          </a>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.78rem', marginTop: '1.1rem' }}>Afiliado con SamBoat · Sin coste adicional para ti</p>
        </section>

        {/* CROSS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.6rem' }}>
          <Link href="/alquiler-barco" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Todas las costas <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>El hub completo de alquiler de barcos.</span>
          </Link>
          <Link href="/alquiler-catamaran" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Alquiler de catamarán <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Para grupos: estabilidad y espacio.</span>
          </Link>
          <Link href="/alquiler-yate" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Alquiler de yate <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Con patrón y a otro nivel.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
