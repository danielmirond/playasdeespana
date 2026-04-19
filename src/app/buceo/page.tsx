// src/app/buceo/page.tsx
// Hub SEO: "Buceo en España — Mejores playas y centros de inmersión"
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? ''
const CIVITATIS_AFF = process.env.NEXT_PUBLIC_CIVITATIS_AFF ?? ''

export const metadata: Metadata = {
  title: 'Buceo en España — Mejores playas, centros y reservas marinas',
  description: 'Guía completa de buceo en España: mejores spots por comunidad, reservas marinas, centros PADI/SSI, bautismos, equipo y certificaciones. De Cabo de Palos a Canarias.',
  alternates: { canonical: '/buceo' },
  openGraph: {
    title: 'Buceo en España',
    description: 'Mejores spots, centros PADI/SSI, reservas marinas y equipo.',
    url: `${BASE}/buceo`,
    type: 'article',
  },
}

interface Spot {
  nombre:    string
  zona:      string
  comSlug:   string
  profMax:   string
  destaca:   string
  reserva?:  boolean
}

const TOP_SPOTS: Spot[] = [
  { nombre: 'Islas Medas',          zona: 'Costa Brava',           comSlug: 'cataluna',              profMax: '25m',  destaca: 'Meros gigantes, posidonia',                 reserva: true },
  { nombre: 'Cabo de Palos',        zona: 'Murcia',                comSlug: 'murcia',                profMax: '50m',  destaca: 'Reserva marina, barracudas',                reserva: true },
  { nombre: 'Isla de El Hierro',    zona: 'Canarias',              comSlug: 'canarias',              profMax: '40m',  destaca: 'Mar de las Calmas, rayas, mantas',          reserva: true },
  { nombre: 'Columbretes',          zona: 'Castellón',             comSlug: 'comunitat-valenciana',  profMax: '40m',  destaca: 'Archipiélago volcánico, langostas',          reserva: true },
  { nombre: 'Cabo de Gata',         zona: 'Almería',               comSlug: 'andalucia',             profMax: '30m',  destaca: 'Parque natural, paredes volcánicas' },
  { nombre: 'Islas Cíes',           zona: 'Galicia',               comSlug: 'galicia',               profMax: '25m',  destaca: 'Parque Nacional, bosques de kelp',           reserva: true },
  { nombre: 'Menorca Norte',        zona: 'Menorca',               comSlug: 'islas-baleares',        profMax: '35m',  destaca: 'Cuevas submarinas, estrellas de mar' },
  { nombre: 'La Restinga',          zona: 'El Hierro',             comSlug: 'canarias',              profMax: '40m',  destaca: 'Aguas vulcanismo, peces tropicales' },
  { nombre: 'Illes Medes-Tossa',    zona: 'Costa Brava',           comSlug: 'cataluna',              profMax: '20m',  destaca: 'Coral rojo, nudibranquios' },
  { nombre: 'Dragonera',            zona: 'Mallorca',              comSlug: 'islas-baleares',        profMax: '35m',  destaca: 'Reserva, pecios, morenas' },
]

export default async function BuceoPage() {
  const playas = await getPlayas()
  const conBuceo = playas.filter(p => p.actividades?.buceo || p.actividades?.snorkel)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Buceo</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-.02em',
          marginBottom: '.75rem',
        }}>
          Dónde <em style={{ fontWeight: 500, color: 'var(--accent)' }}>bucear</em> en España
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.65 }}>
          España tiene 10 reservas marinas, aguas entre 14°C y 24°C y visibilidad de 5 a 30 metros.
          Desde bautismos en calas de Baleares hasta inmersiones profundas en Cabo de Palos o El Hierro.
          En cada ficha de playa mostramos los centros de buceo más cercanos con contacto directo.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.5rem', marginBottom: '2rem' }}>
          {[
            { val: conBuceo.length.toLocaleString('es'), label: 'Playas con buceo/snorkel' },
            { val: '10', label: 'Reservas marinas' },
            { val: '14-24°C', label: 'Temperatura agua' },
            { val: '5-30m', label: 'Visibilidad media' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--card-bg)', border: '1.5px solid var(--line)',
              borderRadius: 12, padding: '.75rem', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent,#6b400a)' }}>{s.val}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '.15rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top spots */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Los 10 mejores spots de buceo
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2.5rem' }}>
          {TOP_SPOTS.map((s, i) => (
            <Link
              key={s.nombre}
              href={`/comunidad/${s.comSlug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '.85rem',
                padding: '.85rem 1.1rem', borderRadius: 14,
                background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                textDecoration: 'none', color: 'inherit',
              }}
            >
              <span style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                background: i < 3 ? 'linear-gradient(135deg, #0891b2, #06b6d4)' : 'rgba(8,145,178,.12)',
                color: i < 3 ? '#fff' : '#0e7490',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.78rem', fontWeight: 800,
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)' }}>{s.nombre}</span>
                  {s.reserva && <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '.1rem .4rem', borderRadius: 100, background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>Reserva Marina</span>}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.1rem' }}>
                  {s.zona} · Prof. máx {s.profMax} · {s.destaca}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Certificaciones */}
        <section aria-labelledby="h2-cert" style={{
          background: 'var(--card-bg)', border: '1.5px solid var(--line)',
          borderRadius: 16, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-cert" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Certificaciones: ¿cuál elegir?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.5rem' }}>
            {[
              { sigla: 'PADI',  nombre: 'Professional Association of Diving Instructors',  desc: 'La más extendida (80% de centros en España). Open Water desde 350€.' },
              { sigla: 'SSI',   nombre: 'Scuba Schools International',                     desc: 'Muy popular, material digital gratuito. Open Water desde 300€.' },
              { sigla: 'CMAS',  nombre: 'Confédération Mondiale des Activités Subaquatiques', desc: 'Federativa, más habitual en clubes vs centros comerciales.' },
              { sigla: 'FEDAS', nombre: 'Federación Española de Actividades Subacuáticas', desc: 'Título oficial español equivalente. Válido en toda España.' },
            ].map(c => (
              <div key={c.sigla} style={{
                border: '1.5px solid var(--line)', borderRadius: 10,
                padding: '.75rem', background: 'rgba(255,255,255,.4)',
              }}>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0891b2' }}>{c.sigla}</div>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '.25rem' }}>{c.nombre}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Equipo + afiliación */}
        <section aria-labelledby="h2-equipo" style={{
          background: 'var(--card-bg)', border: '1.5px solid var(--line)',
          borderRadius: 16, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-equipo" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Equipo básico de buceo
          </h2>
          <ul style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.75, paddingLeft: '1.2rem' }}>
            <li><strong>Máscara</strong> — silicona transparente, cristal templado. Probar en cara sin apretar correa (debe hacer vacío).</li>
            <li><strong>Neopreno</strong> — 3mm en Mediterráneo verano, 5mm en Atlántico o invierno, 7mm en inmersiones profundas.</li>
            <li><strong>Aletas</strong> — de talón abierto con escarpines para roca; cerradas para snorkel.</li>
            <li><strong>Regulador + BCD + botella</strong> — mejor alquilar hasta que bucees regularmente.</li>
            <li><strong>Linterna submarina</strong> — imprescindible en cuevas y nocturnas.</li>
            <li><strong>Ordenador de buceo</strong> — desde 150€, vale la pena si vas a bucear más de 10 veces.</li>
          </ul>
          {AMAZON_TAG && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.75rem' }}>
              {[
                { q: 'mascara+buceo+cressi',     label: 'Máscaras de buceo' },
                { q: 'neopreno+buceo+5mm',       label: 'Neoprenos 5mm' },
                { q: 'aletas+buceo+mares',       label: 'Aletas de buceo' },
                { q: 'linterna+submarina+buceo',  label: 'Linternas submarinas' },
                { q: 'ordenador+buceo',           label: 'Ordenadores de buceo' },
              ].map(p => (
                <a
                  key={p.q}
                  href={`https://www.amazon.es/s?k=${p.q}&tag=${AMAZON_TAG}`}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    display: 'inline-flex', padding: '.35rem .7rem',
                    background: '#ff9900', color: '#111', borderRadius: 100,
                    fontSize: '.72rem', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  {p.label} →
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Civitatis CTA */}
        {CIVITATIS_AFF && (
          <div style={{
            background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            borderRadius: 16, padding: '1.1rem 1.25rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200, color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '.95rem', marginBottom: '.2rem' }}>
                Bautismos y excursiones de snorkel
              </div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.85)' }}>
                Primera inmersión desde 40€. Cancelación gratis hasta 24h antes.
              </div>
            </div>
            <a
              href={`https://www.civitatis.com/es/?q=buceo&aid=${CIVITATIS_AFF}`}
              target="_blank" rel="noopener noreferrer sponsored"
              style={{
                padding: '.55rem 1.1rem', background: '#fff', color: '#0891b2',
                borderRadius: 10, fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
              }}
            >
              Reservar bautismo →
            </a>
          </div>
        )}

        {/* Cross-links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2rem' }}>
          {[
            { href: '/surf',                     label: 'Surf en España' },
            { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
            { href: '/protectores-solares',       label: 'Protección solar' },
            { href: '/seguros-viaje',             label: 'Seguros de viaje' },
            { href: '/alquiler-barco-playa',      label: 'Alquiler de barco' },
            { href: '/islas',                     label: 'Playas en islas' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'inline-flex', padding: '.45rem .85rem',
              background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100,
              fontSize: '.78rem', fontWeight: 600, textDecoration: 'none',
              border: '1px solid rgba(107,64,10,.3)',
            }}>{l.label} →</Link>
          ))}
        </div>

        {/* FAQ */}
        <section aria-labelledby="h2-faq">
          <h2 id="h2-faq" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {[
              {
                q: '¿Cuánto cuesta un bautismo de buceo en España?',
                a: 'Entre 40€ y 80€ por persona, dependiendo de la zona y el centro. Incluye equipo, briefing, inmersión guiada (30-45 min) y seguro. En reservas marinas puede costar 10-20€ más.',
              },
              {
                q: '¿Cuál es la mejor época para bucear en España?',
                a: 'Junio a octubre para el Mediterráneo (agua 20-26°C, visibilidad 15-25m). Canarias todo el año (18-24°C). El Atlántico Norte (Galicia, Cantábrico) es mejor en julio-septiembre. Evitar días de temporal.',
              },
              {
                q: '¿Necesito certificación para hacer bautismo?',
                a: 'No. El bautismo (Discover Scuba Diving en PADI, Try Scuba en SSI) es para personas sin experiencia. Un instructor te acompaña a 6-12m de profundidad. Para bucear solo necesitas Open Water Diver (2-4 días, 300-450€).',
              },
              {
                q: '¿Qué reservas marinas permiten buceo en España?',
                a: 'Las 10 reservas marinas españolas permiten buceo con permiso previo. Las más populares: Islas Medas (Cataluña), Cabo de Palos-Islas Hormigas (Murcia), Isla de El Hierro (Canarias), Columbretes (Castellón) e Islas Cíes (Galicia).',
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
            { '@type': 'Question', name: '¿Cuánto cuesta un bautismo de buceo en España?', acceptedAnswer: { '@type': 'Answer', text: 'Entre 40€ y 80€ por persona. Incluye equipo, briefing, inmersión guiada (30-45 min) y seguro.' } },
            { '@type': 'Question', name: '¿Cuál es la mejor época para bucear en España?', acceptedAnswer: { '@type': 'Answer', text: 'Junio a octubre para Mediterráneo (20-26°C). Canarias todo el año (18-24°C). Atlántico Norte en julio-septiembre.' } },
            { '@type': 'Question', name: '¿Necesito certificación para hacer bautismo?', acceptedAnswer: { '@type': 'Answer', text: 'No. El bautismo es para personas sin experiencia. Para bucear solo necesitas Open Water Diver (2-4 días, 300-450€).' } },
            { '@type': 'Question', name: '¿Qué reservas marinas permiten buceo en España?', acceptedAnswer: { '@type': 'Answer', text: 'Las 10 reservas españolas permiten buceo con permiso. Las más populares: Medas, Cabo de Palos, El Hierro, Columbretes, Cíes.' } },
          ],
        })}}
      />
    </>
  )
}
