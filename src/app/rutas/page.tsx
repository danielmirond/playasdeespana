// src/app/rutas/page.tsx — Rutas de playas por las costas de España
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import { getRutas, COSTAS, type Ruta } from '@/lib/rutas'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Rutas de playas por las costas de España — Itinerarios',
  description: 'Recorre las mejores playas de cada costa de España: Costa del Sol, Costa Brava, Costa de la Luz, Rías Baixas, Islas Canarias y más. Itinerarios con mapa y Google Maps.',
  alternates: { canonical: '/rutas' },
}

const FAQ = [
  { q: '¿Cuánto dura una ruta de playas en España?', a: 'Depende de la costa que elijas. Las rutas más cortas, como la de la Costa Tropical (Granada), se pueden recorrer en medio día. Las más largas, como la ruta por las Rías Baixas o toda la Costa Brava, pueden ocupar entre 3 y 5 días si quieres disfrutar de cada parada con calma.' },
  { q: '¿Se puede hacer una ruta de playas en un día?', a: 'Sí, muchas de nuestras rutas están diseñadas con 5 paradas conectadas por carretera para completar en una jornada. Lo ideal es salir temprano, dedicar entre 1 y 2 horas a cada playa y usar el enlace de Google Maps que incluimos para optimizar el recorrido.' },
  { q: '¿Qué necesito para una ruta costera en coche?', a: 'Además del vehículo, conviene llevar toallas, protector solar, agua abundante y calzado cómodo para caminar por senderos si la ruta incluye calas. Descarga los mapas offline por si pierdes cobertura en zonas rurales. En verano, madruga para evitar los parkings llenos en playas populares.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const ZONAS = [
  { key: 'cantabrica', label: 'Zona Cantábrica', desc: 'Acantilados verdes, rías y oleaje atlántico. Asturias, Cantabria y País Vasco.' },
  { key: 'atlantica',  label: 'Zona Atlántica',  desc: 'Rías gallegas, costa da morte y las playas infinitas de Huelva y Cádiz.' },
  { key: 'mediterranea', label: 'Zona Mediterránea', desc: 'De la Costa Brava a la Costa del Sol. Calas, sol y chiringuitos.' },
  { key: 'insular',    label: 'Islas',            desc: 'Baleares y Canarias. Aguas turquesa, volcanes y posidonia.' },
]

export default async function RutasPage() {
  const playas = await getPlayas()
  const rutas = await getRutas(playas)

  const rutasByZona = new Map<string, Ruta[]>()
  for (const r of rutas) {
    const list = rutasByZona.get(r.costa.zona) ?? []
    list.push(r)
    rutasByZona.set(r.costa.zona, list)
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Rutas por la costa</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)',
          lineHeight: 1.02, marginBottom: '.5rem',
        }}>
          Rutas de playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>por las costas</em> de España
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 600, lineHeight: 1.6 }}>
          {rutas.length} itinerarios por las costas más emblemáticas de España.
          Cada ruta conecta las 5 mejores playas de la zona, ordenadas para recorrer en coche
          con enlace directo a Google Maps.
        </p>

        <Link
          href="/rutas/configurar"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: 'var(--accent)', color: '#fff',
            padding: '.75rem 1.25rem', borderRadius: 6,
            fontSize: '.92rem', fontWeight: 800, textDecoration: 'none',
            minHeight: 44, marginBottom: '2.5rem',
            boxShadow: '0 4px 14px rgba(107,64,10,.2)',
          }}
        >
          🛣️ Configura tu propia ruta
        </Link>

        {ZONAS.map(zona => {
          const zonalRutas = rutasByZona.get(zona.key) ?? []
          if (zonalRutas.length === 0) return null
          return (
            <section key={zona.key} style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700,
                color: 'var(--ink)', margin: '0 0 .35rem', letterSpacing: '-.015em',
              }}>
                {zona.label}
              </h2>
              <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: '0 0 1.25rem', maxWidth: 500 }}>
                {zona.desc}
              </p>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '.75rem',
              }}>
                {zonalRutas.map(r => (
                  <Link
                    key={r.slug}
                    href={`/rutas/${r.slug}`}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      background: 'var(--card-bg)', border: '1px solid var(--line)',
                      borderRadius: 6, padding: '1.2rem 1.3rem',
                      textDecoration: 'none', transition: 'all .15s',
                      borderLeft: `4px solid ${r.costa.color}`,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '.2rem', fontFamily: 'var(--font-serif)' }}>
                      {r.nombre}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.55rem', lineHeight: 1.5 }}>
                      {r.costa.descripcion}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.65rem' }}>
                      {r.paradas.length} paradas · {r.totalKm} km
                    </div>
                    <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                      {r.paradas.map((p, i) => (
                        <span key={p.playa.slug} style={{
                          fontSize: '.72rem', fontWeight: 600,
                          color: r.costa.color === '#f8fafc' ? 'var(--accent)' : r.costa.color,
                          background: `${r.costa.color === '#f8fafc' ? 'var(--accent)' : r.costa.color}12`,
                          padding: '.15rem .4rem', borderRadius: 4,
                        }}>
                          {i + 1}. {p.playa.nombre}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </>
  )
}
