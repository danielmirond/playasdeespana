// src/app/campings/page.tsx
// Hub SEO: "Campings cerca de la playa en España"
// Agrupa playas que tienen campings cerca (detectados via OSM) por
// comunidad. Actúa como pillar page para el topic cluster camping+playa.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getComunidades } from '@/lib/playas'
import SchemaItemList from '@/components/seo/SchemaItemList'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Campings cerca de la playa en España — Guía completa',
  description: 'Encuentra campings, glamping y áreas de autocaravanas junto a las mejores playas de España. Listado por comunidad autónoma con servicios, distancia y precios orientativos.',
  alternates: { canonical: '/campings' },
  openGraph: {
    title: 'Campings cerca de la playa en España',
    description: 'Guía completa de campings junto a playas españolas, por comunidad y provincia.',
    url: `${BASE}/campings`,
    type: 'article',
  },
}

// Comunidades costeras (las que tienen playas)
const COMUNIDADES_COSTERAS = [
  'Andalucía', 'Cataluña', 'Comunitat Valenciana', 'Galicia',
  'Canarias', 'Islas Baleares', 'Murcia', 'Asturias',
  'Cantabria', 'País Vasco', 'Ceuta', 'Melilla',
]

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function CampingsPage() {
  const [playas, comunidades] = await Promise.all([getPlayas(), getComunidades()])

  // Playas con parking (proxy de acceso por carretera / camping cercano)
  // Agrupamos por comunidad costera
  const costeras = comunidades.filter(c => COMUNIDADES_COSTERAS.includes(c.nombre))

  // Una selección de playas representativas por comunidad (las que tienen parking,
  // bandera azul o camping tag). Limitamos a 5 por comunidad para no saturar.
  const playasPorComunidad = new Map<string, typeof playas>()
  for (const p of playas) {
    if (!COMUNIDADES_COSTERAS.includes(p.comunidad)) continue
    const list = playasPorComunidad.get(p.comunidad) ?? []
    // Priorizamos playas con parking (más probable que tengan camping cerca)
    if (list.length < 5 || p.parking || p.bandera) {
      if (list.length >= 8) continue
      list.push(p)
      playasPorComunidad.set(p.comunidad, list)
    }
  }

  const allBeaches = Array.from(playasPorComunidad.values()).flat()

  return (
    <>
      <SchemaItemList
        name="Campings cerca de la playa en España"
        description="Guía de campings junto a playas españolas por comunidad autónoma."
        url={`${BASE}/campings`}
        beaches={allBeaches.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Campings</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          Campings <em style={{ fontWeight: 500, color: 'var(--accent)' }}>cerca de la playa</em>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.6 }}>
          España tiene cientos de campings junto a la costa, desde glamping de lujo en Baleares hasta
          áreas de autocaravanas frente al mar en Galicia. En cada ficha de playa mostramos los campings
          más cercanos con servicios, distancia y datos de contacto.
        </p>

        {/* Highlights */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '.65rem', marginBottom: '2.5rem',
        }}>
          {[
            { icon: '⛺', label: 'Camping tradicional', desc: 'Parcelas para tienda y caravana' },
            { icon: '🏕️', label: 'Glamping', desc: 'Cabañas, yurtas y tiendas de lujo' },
            { icon: '🚐', label: 'Autocaravanas', desc: 'Áreas de servicio y pernocta' },
            { icon: '🐕', label: 'Pet-friendly', desc: 'Campings que admiten mascotas' },
          ].map(h => (
            <div key={h.label} style={{
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '.35rem' }} aria-hidden="true">{h.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{h.label}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.2rem' }}>{h.desc}</div>
            </div>
          ))}
        </div>

        {/* Listado por comunidad */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1.25rem' }}>
          Explora por comunidad autónoma
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '.75rem', marginBottom: '2.5rem',
        }}>
          {costeras.map(c => {
            const playasC = playasPorComunidad.get(c.nombre) ?? []
            return (
              <div key={c.slug} style={{
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 6, overflow: 'hidden',
              }}>
                <Link
                  href={`/comunidad/${c.slug}`}
                  style={{
                    display: 'block', padding: '1rem 1.15rem .65rem',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '.15rem' }}>
                    {c.nombre}
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                    {c.count} playas
                  </div>
                </Link>
                {playasC.length > 0 && (
                  <div style={{ padding: '0 1.15rem .85rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                    {playasC.slice(0, 4).map(p => (
                      <Link
                        key={p.slug}
                        href={`/playas/${p.slug}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '.45rem',
                          fontSize: '.78rem', color: 'var(--accent, #6b400a)',
                          textDecoration: 'none', fontWeight: 500,
                        }}
                      >
                        <span style={{ fontSize: '.7rem', opacity: .6 }} aria-hidden="true">⛺</span>
                        {p.nombre}
                        {p.bandera && <span style={{ fontSize: '.6rem', color: '#2563eb' }}>★</span>}
                      </Link>
                    ))}
                    <Link
                      href={`/comunidad/${c.slug}`}
                      style={{ fontSize: '.72rem', color: 'var(--muted)', textDecoration: 'none', fontWeight: 600, marginTop: '.15rem' }}
                    >
                      Ver todas →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Guía práctica */}
        <section aria-labelledby="h2-guia" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <h2 id="h2-guia" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Consejos para acampar cerca de la playa
          </h2>
          <ul style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Reserva con antelación</strong> — en julio y agosto los campings costeros se llenan semanas antes.</li>
            <li><strong>Comprueba la distancia real</strong> — en cada ficha de playa mostramos la distancia exacta al camping más cercano.</li>
            <li><strong>Valora los servicios</strong> — piscina, restaurante y supermercado marcan la diferencia con niños.</li>
            <li><strong>Acampada libre</strong> — está prohibida en la mayoría de playas españolas. Usa siempre campings regulados.</li>
            <li><strong>Autocaravanas</strong> — busca áreas con servicio de vaciado y enganche eléctrico; muchas playas tienen prohibido pernoctar en parking.</li>
          </ul>
        </section>

        {/* Cross-links */}
        <section aria-labelledby="h2-rel" style={{ marginBottom: '2rem' }}>
          <h2 id="h2-rel" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            También te puede interesar
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { href: '/playas-perros',           label: 'Playas para perros' },
              { href: '/familias',                label: 'Playas para familias' },
              { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
              { href: '/playas-secretas',          label: 'Playas secretas' },
              { href: '/rutas',                    label: 'Rutas por la costa' },
              { href: '/surf',                     label: 'Surf en España' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'inline-flex', padding: '.45rem .85rem',
                  background: 'rgba(107,64,10,.14)', color: '#4a2c05',
                  borderRadius: 100, fontSize: '.78rem', fontWeight: 600,
                  textDecoration: 'none', border: '1px solid rgba(107,64,10,.3)',
                }}
              >
                {l.label} →
              </Link>
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
                q: '¿Cuántos campings hay cerca de playas en España?',
                a: 'España cuenta con más de 1.200 campings, de los cuales aproximadamente 600 están a menos de 10 km de una playa. Las comunidades con mayor densidad son Cataluña, Comunitat Valenciana, Andalucía y Galicia.',
              },
              {
                q: '¿Se puede acampar libremente en la playa en España?',
                a: 'No. La acampada libre está prohibida en todas las costas españolas y en la mayoría de espacios naturales protegidos. Las multas van desde 60€ hasta 3.000€ según la comunidad autónoma. Es obligatorio usar campings regulados.',
              },
              {
                q: '¿Cuánto cuesta un camping de playa en España?',
                a: 'El precio medio por parcela en temporada alta es de 25-45€/noche (2 adultos + tienda o caravana). Los glamping y bungalows cuestan 60-150€/noche. En temporada baja los precios bajan un 30-50%.',
              },
              {
                q: '¿Dónde puedo aparcar una autocaravana junto a la playa?',
                a: 'Busca áreas de autocaravanas reguladas con servicio de vaciado y enganche eléctrico. En cada ficha de playa indicamos los parkings y áreas cercanas. Pernoctar en parking público está prohibido en muchos municipios costeros.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  {f.q}
                </summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: '¿Cuántos campings hay cerca de playas en España?', acceptedAnswer: { '@type': 'Answer', text: 'España cuenta con más de 1.200 campings, de los cuales aproximadamente 600 están a menos de 10 km de una playa.' } },
            { '@type': 'Question', name: '¿Se puede acampar libremente en la playa en España?', acceptedAnswer: { '@type': 'Answer', text: 'No. La acampada libre está prohibida en todas las costas españolas. Las multas van desde 60€ hasta 3.000€.' } },
            { '@type': 'Question', name: '¿Cuánto cuesta un camping de playa en España?', acceptedAnswer: { '@type': 'Answer', text: 'El precio medio por parcela en temporada alta es de 25-45€/noche. Glamping y bungalows cuestan 60-150€/noche.' } },
            { '@type': 'Question', name: '¿Dónde puedo aparcar una autocaravana junto a la playa?', acceptedAnswer: { '@type': 'Answer', text: 'Busca áreas de autocaravanas reguladas con servicio de vaciado y enganche eléctrico. Pernoctar en parking público está prohibido en muchos municipios costeros.' } },
          ],
        })}}
      />
    </>
  )
}
