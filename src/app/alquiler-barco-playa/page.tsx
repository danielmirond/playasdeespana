// src/app/alquiler-barco-playa/page.tsx
// Landing comercial: alquiler de barcos. AOV muy alto (200-2000€/día),
// comisión 10-15%. Ideal para Baleares, Costa Brava, Cabo de Gata,
// Canarias, Costa del Sol.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const revalidate = 604800

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

const CLICKBOAT_AFF = process.env.NEXT_PUBLIC_CLICKBOAT_AFF ?? ''
const SAMBOAT_AFF   = process.env.NEXT_PUBLIC_SAMBOAT_AFF ?? ''
const NAUTAL_AFF    = process.env.NEXT_PUBLIC_NAUTAL_AFF ?? ''

export const metadata: Metadata = {
  title: 'Alquiler de barco para ir de playas en España — Sin licencia y con patrón',
  description: 'Compara plataformas de alquiler de barcos: Click&Boat, Samboat y Nautal. Barcos con y sin licencia en Baleares, Costa Brava, Canarias y Costa del Sol.',
  alternates: { canonical: '/alquiler-barco-playa' },
  openGraph: {
    title: 'Alquiler de barco en España',
    description: 'Descubre calas vírgenes en barco. Plataformas comparadas para Baleares, Canarias y toda la costa.',
    url: `${BASE}/alquiler-barco-playa`,
    type: 'article',
  },
}

interface Destino {
  nombre:     string
  comunidad:  string
  slug:       string
  emoji:      string
  desc:       string
}

const DESTINOS: Destino[] = [
  { nombre: 'Mallorca',     comunidad: 'Islas Baleares', slug: 'islas-baleares', emoji: '🏖️', desc: 'Cala Salada, Es Trenc, Es Caló des Moro — solo accesibles en barco.' },
  { nombre: 'Ibiza',        comunidad: 'Islas Baleares', slug: 'islas-baleares', emoji: '🌊', desc: 'Formentera en ferry privado, Cala Comte y Es Vedrà al atardecer.' },
  { nombre: 'Menorca',      comunidad: 'Islas Baleares', slug: 'islas-baleares', emoji: '🐚', desc: 'Cala Macarella, Mitjana y Turqueta desde el mar.' },
  { nombre: 'Costa Brava',  comunidad: 'Cataluña',       slug: 'cataluna',       emoji: '⛵', desc: 'Cala Montgó, Illes Medes, Cap de Creus — snorkel protegido.' },
  { nombre: 'Cabo de Gata', comunidad: 'Andalucía',      slug: 'andalucia',      emoji: '🏜️', desc: 'Playa de los Muertos, Cala de San Pedro, Playazo de Rodalquilar.' },
  { nombre: 'Canarias',     comunidad: 'Canarias',       slug: 'canarias',       emoji: '🌋', desc: 'La Graciosa, acantilados de Los Gigantes, Lobos en Fuerteventura.' },
  { nombre: 'Costa del Sol', comunidad: 'Andalucía',     slug: 'andalucia',      emoji: '☀️', desc: 'Acantilados de Maro-Cerro Gordo, cuevas del Higuerón.' },
  { nombre: 'Murcia',       comunidad: 'Murcia',         slug: 'murcia',         emoji: '🐠', desc: 'Cabo de Palos, Islas Hormigas — reserva marina mejor vista desde barco.' },
]

interface Plataforma {
  marca:     string
  color:     string
  aff:       string
  url:       (aff: string, lugar?: string) => string
  destacado: string
  puntos:    string[]
}

const PLATAFORMAS: Plataforma[] = [
  {
    marca: 'Click&Boat',
    color: '#003d82',
    aff: CLICKBOAT_AFF,
    url: (aff, lugar) => `https://www.clickandboat.com/es/alquiler-barco${lugar ? `/${lugar}` : ''}?aff=${aff}`,
    destacado: 'Más barcos en España',
    puntos: [
      '40.000+ barcos en el Mediterráneo',
      'Con o sin patrón (skipper opcional)',
      'Protección "Best Price" — precio mínimo garantizado',
      'Cancelación gratuita hasta 60 días antes',
    ],
  },
  {
    marca: 'Samboat',
    color: '#f97316',
    aff: SAMBOAT_AFF,
    url: (aff, lugar) => `https://www.samboat.es/alquiler-barco${lugar ? `/${lugar}` : ''}?referrer=${aff}`,
    destacado: 'Mejor para principiantes',
    puntos: [
      'Filtro "sin licencia" muy fácil',
      'Seguro incluido en todas las reservas',
      'Chat directo con el propietario',
      'Catálogo grande en Baleares',
    ],
  },
  {
    marca: 'Nautal',
    color: '#0891b2',
    aff: NAUTAL_AFF,
    url: (aff) => `https://www.nautal.es/?partner=${aff}`,
    destacado: 'Especialistas en Baleares',
    puntos: [
      'Plataforma española (servicio en español)',
      'Flota de catamaranes y veleros premium',
      'Rutas con capitán profesional',
      'Eventos privados y despedidas',
    ],
  },
]

export default function AlquilerBarcoPage() {
  const plataformasActivas = PLATAFORMAS.filter(p => p.aff)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Alquiler de barco</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-.02em',
          marginBottom: '.75rem',
        }}>
          Alquiler de barco <em style={{ fontWeight: 500, color: 'var(--accent)' }}>para ir de playas</em>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.65 }}>
          Las mejores calas de España solo se ven desde el mar. Compara las tres plataformas líderes
          de alquiler de barcos con y sin licencia: catamaranes, veleros, lanchas y yates en Baleares,
          Costa Brava, Cabo de Gata, Canarias y Costa del Sol.
        </p>

        {/* Plataformas */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Las 3 plataformas líderes comparadas
        </h2>
        {plataformasActivas.length === 0 ? (
          <div style={{
            background: 'rgba(234,179,8,.1)', border: '1px solid rgba(234,179,8,.4)',
            borderRadius: 6, padding: '1rem', fontSize: '.88rem', color: 'var(--muted)',
            marginBottom: '2rem',
          }}>
            Comparativa próximamente disponible.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2.5rem' }}>
            {plataformasActivas.map(p => (
              <div key={p.marca} style={{
                background: 'var(--card-bg)', border: `2px solid ${p.color}22`,
                borderRadius: 6, padding: '1.25rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: p.color }}>{p.marca}</span>
                    <span style={{
                      fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem',
                      background: `${p.color}14`, color: p.color, borderRadius: 100,
                      border: `1px solid ${p.color}44`,
                    }}>{p.destacado}</span>
                  </div>
                  <ul style={{ fontSize: '.82rem', color: 'var(--muted)', paddingLeft: '1rem', lineHeight: 1.65, margin: '.35rem 0 0' }}>
                    {p.puntos.map(pt => <li key={pt}>{pt}</li>)}
                  </ul>
                </div>
                <a
                  href={p.url(p.aff)}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    alignSelf: 'center', padding: '.75rem 1.5rem',
                    background: p.color, color: '#fff', borderRadius: 4,
                    fontSize: '.88rem', fontWeight: 800, textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Buscar barco →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Destinos */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Destinos favoritos en barco
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '.65rem', marginBottom: '2.5rem',
        }}>
          {DESTINOS.map(d => (
            <Link
              key={d.nombre}
              href={`/comunidad/${d.slug}`}
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 6, padding: '1rem 1.15rem',
                textDecoration: 'none', color: 'inherit',
                display: 'flex', flexDirection: 'column', gap: '.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ fontSize: '1.3rem' }} aria-hidden="true">{d.emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{d.nombre}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.1rem' }}>{d.comunidad}</div>
                </div>
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.55 }}>{d.desc}</div>
            </Link>
          ))}
        </div>

        {/* Sin licencia */}
        <section aria-labelledby="h2-sin" style={{
          background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.3)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <h2 id="h2-sin" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0369a1', marginBottom: '.65rem' }}>
            Barcos sin licencia: ¿qué puedo alquilar?
          </h2>
          <ul style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Motor hasta 15 CV</strong>: libre, sin titulación, edad mínima 16 años.</li>
            <li><strong>Eslora hasta 5 metros</strong>: dentro de las 2 millas de costa.</li>
            <li><strong>Precio orientativo</strong>: 80-150€/día en lancha hinchable o semirrígida pequeña.</li>
            <li><strong>Requisitos</strong>: DNI/pasaporte, fianza (300-500€), explicación de seguridad.</li>
          </ul>
        </section>

        {/* Consejos */}
        <section aria-labelledby="h2-tips" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <h2 id="h2-tips" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Consejos antes de reservar
          </h2>
          <ol style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Reserva 1-2 meses antes</strong> en julio-agosto en Baleares, los buenos barcos vuelan.</li>
            <li><strong>Patrón profesional</strong>: si no tienes licencia ni experiencia, +150-250€/día pero tranquilidad total.</li>
            <li><strong>Check-in combustible</strong>: fotografía el nivel al salir y al volver, evita cargos sorpresa.</li>
            <li><strong>Itinerario</strong>: planea calas alternativas por si hay viento del norte/este (cambia condiciones).</li>
            <li><strong>Seguro</strong>: revisa la franquicia en daños (suele ser 500-2.000€), compensable con fianza.</li>
          </ol>
        </section>

        {/* Cross-links */}
        <section aria-labelledby="h2-rel" style={{ marginBottom: '2rem' }}>
          <h2 id="h2-rel" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Relacionado
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { href: '/islas',                    label: 'Playas en islas' },
              { href: '/playas-secretas',          label: 'Calas y playas secretas' },
              { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
              { href: '/seguros-viaje',            label: 'Seguros de viaje' },
              { href: '/comunidad/islas-baleares', label: 'Baleares' },
              { href: '/comunidad/canarias',       label: 'Canarias' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'inline-flex', padding: '.45rem .85rem',
                background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100,
                fontSize: '.78rem', fontWeight: 600, textDecoration: 'none',
                border: '1px solid rgba(107,64,10,.3)',
              }}>{l.label} →</Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="h2-faq">
          <h2 id="h2-faq" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {[
              {
                q: '¿Cuánto cuesta alquilar un barco en España?',
                a: 'Desde 80€/día una lancha pequeña sin licencia. Una semirrígida de 6m ronda 200-350€/día. Un velero de 10m con patrón sale por 400-800€/día. Yates de lujo desde 1.500€/día. Los precios suben un 30-50% en julio-agosto.',
              },
              {
                q: '¿Necesito licencia para alquilar un barco?',
                a: 'No si es motor de hasta 15CV y eslora hasta 5m (lancha pequeña). Para veleros o motores mayores, necesitas PER (Patrón de Embarcaciones de Recreo) o contratar skipper. Las plataformas filtran barcos sin licencia.',
              },
              {
                q: '¿Se puede dormir en el barco alquilado?',
                a: 'Sí, en veleros y catamaranes grandes con camarotes. Algunos alquileres de semana incluyen fondeos en calas. Requiere planificación de puerto, agua y combustible. Nautal y Click&Boat tienen filtros para "charter con noches".',
              },
              {
                q: '¿Qué incluye el precio de alquiler?',
                a: 'Normalmente: barco, seguro básico, equipo de seguridad. NO incluye: combustible (150-400€/día según barco), limpieza final (50-150€), skipper si no tienes licencia (+150-300€/día), comida y bebida.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
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
            { '@type': 'Question', name: '¿Cuánto cuesta alquilar un barco en España?', acceptedAnswer: { '@type': 'Answer', text: 'Desde 80€/día una lancha sin licencia. Semirrígida de 6m ronda 200-350€/día. Velero de 10m con patrón sale por 400-800€/día. Yates desde 1.500€.' } },
            { '@type': 'Question', name: '¿Necesito licencia para alquilar un barco?', acceptedAnswer: { '@type': 'Answer', text: 'No si es motor hasta 15CV y eslora hasta 5m. Para barcos mayores necesitas PER o contratar skipper.' } },
            { '@type': 'Question', name: '¿Se puede dormir en el barco alquilado?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, en veleros y catamaranes grandes con camarotes. Requiere planificación de puerto, agua y combustible.' } },
            { '@type': 'Question', name: '¿Qué incluye el precio de alquiler?', acceptedAnswer: { '@type': 'Answer', text: 'Incluye barco, seguro básico, equipo de seguridad. NO: combustible (150-400€/día), limpieza final (50-150€), skipper (+150-300€/día), comida.' } },
          ],
        })}}
      />
    </>
  )
}
