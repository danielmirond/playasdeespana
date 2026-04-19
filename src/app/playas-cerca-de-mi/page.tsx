// src/app/playas-cerca-de-mi/page.tsx
// Landing KW "playas cerca de mí" — intención navegacional + informacional.
// Server-render con fallback por comunidad (sin geolocation) + CTA cliente
// que activa GPS y redirige a /buscar?lat=X&lng=Y&orden=cercanas.
//
// SEO: FAQPage schema + BreadcrumbList + TouristInformationCenter. H1
// editorial con italic em. Contenido original explicando el método (EEAT).
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getComunidades } from '@/lib/playas'
import GeolocateCTA from './GeolocateCTA'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Playas cerca de mí — Encuentra la más cercana con estado del mar hoy',
  description: 'Activa tu ubicación y descubre las playas más cercanas en tiempo real: distancia exacta, temperatura del agua, oleaje, viento y score 0-100. Sin registro, gratis.',
  alternates: { canonical: '/playas-cerca-de-mi' },
  openGraph: {
    title: 'Playas cerca de mí — Playas de España',
    description: 'Las playas más cercanas con estado del mar actualizado cada hora.',
    url: `${BASE}/playas-cerca-de-mi`,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const COSTERAS = [
  'Galicia', 'Asturias', 'Cantabria', 'País Vasco',
  'Cataluña', 'Comunitat Valenciana', 'Murcia', 'Andalucía',
  'Islas Baleares', 'Canarias', 'Ceuta', 'Melilla',
]

const FAQ = [
  {
    q: '¿Cómo encuentro la playa más cercana?',
    a: 'Pulsa el botón "Activar ubicación". Tu navegador te pedirá permiso para compartir tu posición una sola vez. Calculamos la distancia en línea recta a las 5.000+ playas del catálogo y te mostramos las más próximas ordenadas por cercanía y score. No guardamos tu ubicación en ningún servidor.',
  },
  {
    q: '¿Qué precisión tiene la búsqueda por GPS?',
    a: 'En móvil con GPS activo, la precisión es de 5-20 metros. En escritorio o sin GPS (solo IP/Wi-Fi), puede ser de 100 metros a varios kilómetros. Para ordenar playas cercanas es suficiente en ambos casos — el error es muy inferior a la distancia entre playas.',
  },
  {
    q: '¿Funciona si no doy permiso de ubicación?',
    a: 'Sí. Justo debajo del botón tienes un listado por comunidad autónoma y un mapa interactivo con todas las playas de España. También puedes introducir manualmente una localidad en el buscador.',
  },
  {
    q: '¿Por qué algunas playas cercanas no aparecen?',
    a: 'Mostramos únicamente playas del inventario oficial MITECO (Ministerio para la Transición Ecológica). Zonas de baño no oficiales, charcas o rías no catalogadas no aparecen. Si echas en falta una, escríbenos a hola@playas-espana.com.',
  },
  {
    q: '¿Qué significa el score 0-100 de cada playa?',
    a: 'Es una puntuación que combina 7 factores: oleaje, viento, temperatura del agua, UV, calidad del agua (EEA), servicios (socorrismo, parking, duchas) y distintivos como Bandera Azul. 85-100 = excelente; 70-84 = muy bueno; 50-69 = aceptable; <50 = limitado o no apto.',
  },
  {
    q: '¿Se actualiza en tiempo real?',
    a: 'Los datos meteorológicos (oleaje, viento, temperatura) se actualizan cada hora desde Open-Meteo. La calidad del agua se actualiza por temporada según los análisis oficiales EEA. Los distintivos Bandera Azul, una vez al año.',
  },
]

interface DestinoComunidad {
  nombre: string
  slug: string
  count: number
  sample: { slug: string; nombre: string; municipio: string }[]
}

export default async function PlayasCercaDeMiPage() {
  const [playas, comunidades] = await Promise.all([getPlayas(), getComunidades()])

  // Muestreo determinista de 3 playas por comunidad costera (prioriza Bandera
  // Azul + socorrismo como representativas).
  const destinos: DestinoComunidad[] = COSTERAS.map(nombre => {
    const com = comunidades.find(c => c.nombre === nombre)
    const lista = playas
      .filter(p => p.comunidad === nombre)
      .sort((a, b) => {
        const sa = (a.bandera ? 4 : 0) + (a.socorrismo ? 2 : 0) + (a.accesible ? 1 : 0)
        const sb = (b.bandera ? 4 : 0) + (b.socorrismo ? 2 : 0) + (b.accesible ? 1 : 0)
        return sb - sa
      })
      .slice(0, 3)
      .map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio }))
    return {
      nombre,
      slug: com?.slug ?? nombre.toLowerCase().replace(/\s+/g, '-'),
      count: com?.count ?? 0,
      sample: lista,
    }
  }).filter(d => d.count > 0)

  const totalPlayas = playas.length

  // ── JSON-LD ────────────────────────────────────────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Playas cerca de mí', item: `${BASE}/playas-cerca-de-mi` },
    ],
  }
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Playas cerca de mí',
    description: 'Encuentra las playas más cercanas a tu ubicación con estado del mar y score en tiempo real.',
    url: `${BASE}/playas-cerca-de-mi`,
    primaryImageOfPage: { '@type': 'ImageObject', url: `${BASE}/api/og?playa=Playas+cerca+de+mí` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE}/buscar?lat={lat}&lng={lng}&orden=cercanas`,
      'query-input': 'required name=lat,required name=lng',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem',
        }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Playas cerca de mí</span>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.72rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.75rem',
          }}>
            Motor de decisión · {totalPlayas.toLocaleString('es')} playas
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 6vw, 3.4rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.02,
            letterSpacing: '-.02em', marginBottom: '.75rem',
          }}>
            Playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>cerca de mí</em>
          </h1>
          <p style={{
            fontSize: '1.05rem', color: 'var(--muted)',
            lineHeight: 1.6, maxWidth: 620, margin: '0 auto 1.75rem',
          }}>
            Activa tu ubicación y te mostramos las playas más cercanas con
            <strong style={{ color: 'var(--ink)' }}> distancia exacta</strong>,
            <strong style={{ color: 'var(--ink)' }}> temperatura del agua</strong>,
            <strong style={{ color: 'var(--ink)' }}> oleaje</strong> y
            <strong style={{ color: 'var(--ink)' }}> score 0-100</strong>. Gratis, sin registro.
          </p>
        </div>

        {/* CTA cliente */}
        <GeolocateCTA />

        {/* Explainer · cómo funciona · privacidad · precisión */}
        <section aria-labelledby="h2-como" style={{ marginBottom: '3rem' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.4rem', textAlign: 'center',
          }}>
            Cómo lo hacemos
          </div>
          <h2 id="h2-como" style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', textAlign: 'center', marginBottom: '1.5rem',
          }}>
            Tu móvil pregunta, <em style={{ fontWeight: 500, color: 'var(--accent)' }}>nosotros respondemos</em>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '.75rem',
          }}>
            {[
              {
                n: '01',
                titulo: 'Geolocalización del navegador',
                texto: 'El navegador usa GPS, Wi-Fi e IP para obtener tu latitud y longitud actuales. Todo el cálculo ocurre en tu dispositivo — nosotros solo recibimos dos números.',
              },
              {
                n: '02',
                titulo: 'Cálculo de distancia',
                texto: 'Con la fórmula haversine calculamos la distancia esfera-tierra a las 5.054 playas del inventario MITECO. El ordenamiento por cercanía es instantáneo.',
              },
              {
                n: '03',
                titulo: 'Estado real del mar',
                texto: 'Para las 20 playas más cercanas cargamos en paralelo oleaje, viento, temperatura y UV desde Open-Meteo. El score 0-100 se calcula en tiempo real.',
              },
            ].map(paso => (
              <div key={paso.n} style={{
                padding: '1.1rem 1.25rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '.72rem', color: 'var(--accent)',
                  fontWeight: 500, letterSpacing: '.12em',
                  marginBottom: '.5rem',
                }}>
                  {paso.n}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '1.02rem', color: 'var(--ink)',
                  marginBottom: '.4rem', lineHeight: 1.25,
                }}>
                  {paso.titulo}
                </div>
                <p style={{
                  fontSize: '.85rem', color: 'var(--muted)',
                  lineHeight: 1.55, margin: 0,
                }}>
                  {paso.texto}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacidad */}
        <section aria-labelledby="h2-privacidad" style={{
          marginBottom: '3rem',
          padding: '1.5rem 1.75rem',
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6,
        }}>
          <h2 id="h2-privacidad" style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.5rem',
          }}>
            Tu ubicación <em style={{ fontWeight: 500, color: 'var(--accent)' }}>no se guarda</em>
          </h2>
          <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
            Las coordenadas se usan una única vez para ordenar las playas por cercanía y luego se
            descartan. No las enviamos a ningún servidor propio, no creamos perfil y no las compartimos
            con terceros. Si aceptas el permiso de geolocalización, siempre puedes revocarlo desde la
            configuración del navegador. Más detalles en nuestra{' '}
            <Link href="/privacidad" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              política de privacidad
            </Link>.
          </p>
        </section>

        {/* Fallback sin ubicación · Por comunidad */}
        <section aria-labelledby="h2-comunidades" id="comunidades" style={{ marginBottom: '3rem' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.4rem',
          }}>
            Sin activar ubicación
          </div>
          <h2 id="h2-comunidades" style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '.65rem',
          }}>
            Explora <em style={{ fontWeight: 500, color: 'var(--accent)' }}>por comunidad costera</em>
          </h2>
          <p style={{
            fontSize: '.95rem', color: 'var(--muted)',
            lineHeight: 1.55, marginBottom: '1.25rem', maxWidth: 640,
          }}>
            Si prefieres no compartir tu posición, busca por comunidad. Cada entrada te lleva al
            listado completo con mapa y filtros por servicios.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '.6rem',
          }}>
            {destinos.map(d => (
              <div key={d.slug} style={{
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 6, overflow: 'hidden',
              }}>
                <Link
                  href={`/comunidad/${d.slug}`}
                  style={{
                    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                    padding: '.85rem 1.1rem .55rem',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontWeight: 700,
                    fontSize: '1rem', color: 'var(--ink)', letterSpacing: '-.01em',
                  }}>
                    {d.nombre}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    fontSize: '.7rem', color: 'var(--accent)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {d.count.toLocaleString('es')}
                  </span>
                </Link>
                {d.sample.length > 0 && (
                  <ul style={{
                    listStyle: 'none', padding: '0 1.1rem .85rem', margin: 0,
                    display: 'flex', flexDirection: 'column', gap: '.2rem',
                  }}>
                    {d.sample.map(p => (
                      <li key={p.slug}>
                        <Link
                          href={`/playas/${p.slug}`}
                          style={{
                            fontSize: '.8rem', color: 'var(--muted)',
                            textDecoration: 'none',
                          }}
                        >
                          → {p.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link href="/mapa" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '.85rem', fontWeight: 500,
              color: 'var(--accent)',
              borderBottom: '1px solid var(--accent)', paddingBottom: 1,
              textDecoration: 'none',
            }}>
              Ver mapa interactivo de todas las playas →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="h2-faq">
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.4rem',
          }}>
            Preguntas frecuentes
          </div>
          <h2 id="h2-faq" style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '1.25rem',
          }}>
            Dudas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>sobre la geolocalización</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {FAQ.map(item => (
              <details key={item.q} style={{
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 6, padding: '.85rem 1.1rem',
              }}>
                <summary style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '.95rem', color: 'var(--ink)', cursor: 'pointer',
                  listStyle: 'none', letterSpacing: '-.005em',
                }}>
                  {item.q}
                </summary>
                <p style={{
                  fontSize: '.88rem', color: 'var(--muted)',
                  lineHeight: 1.65, margin: '.75rem 0 .15rem',
                }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
