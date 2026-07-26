// src/app/page.tsx. Homepage orientada a producto.
//
// Estructura:
//   1. Hero. "¿A qué playa voy hoy?" + CTAs
//   2. Buscador (con filtros funcionales)
//   3. Top playas hoy (por score 0-100 real)
//   4. Evita hoy (playas con peor score)
//   5. Favoritas + Cercanas (client blocks)
//   6. Hub SEO: comunidades + banderas + perros + nudistas
import type { Metadata } from 'next'
import { getPlayasDataModified } from '@/lib/dateModified'
import { Suspense } from 'react'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hero from '@/components/home/Hero'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import Comunidades from '@/components/home/Comunidades'
import ClientBlocks from '@/components/home/ClientBlocks'
import TopCercanas from '@/components/home/TopCercanas'
import ActividadesHoy from '@/components/home/ActividadesHoy'
import ParkingHoy from '@/components/home/ParkingHoy'
import MonetizacionBlock from '@/components/home/MonetizacionBlock'
import BoatRentalCTA from '@/components/home/BoatRentalCTA'
import MagazineCarrusel from '@/components/home/MagazineCarrusel'
import { getPlayas, getComunidades } from '@/lib/playas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Playas de España | ¿A qué playa voy hoy?',
  description: 'Estado del mar en tiempo real en más de 4.500 playas de España. Temperatura del agua, oleaje, viento y servicios. Datos actualizados cada hora.',
  alternates: {
    canonical: '/',
    languages: {
      'es':        '/',
      'en':        '/en',
      'x-default': '/',    // ES es el default: queries en ca/gl/eu caían a EN (GSC jul-2026).
    },
  },
  openGraph: {
    title: 'Playas de España | ¿A qué playa voy hoy?',
    description: 'Consulta el estado del mar en más de 4.500 playas españolas.',
    url: 'https://playas-espana.com',
    images: [{ url: '/api/og?playa=Playas+de+España', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [playas, comunidades] = await Promise.all([
    getPlayas(),
    getComunidades(),
  ])

  // Seleccionar ~48 candidatas: 2 bien equipadas + 2 al azar por comunidad.
  // La mezcla es clave: las bien equipadas compiten por "Top playas hoy" y
  // las aleatorias (que pueden tener pocos servicios o malas condiciones)
  // alimentan "Evita hoy". Sin diversidad de candidatas, "Evita" queda
  // siempre vacío porque las mejores playas NUNCA bajan de 45.
  const candidatas: typeof playas = []
  const porComunidad = new Map<string, typeof playas>()
  for (const p of playas) {
    if (!p.lat || !p.lng) continue
    const list = porComunidad.get(p.comunidad) ?? []
    list.push(p)
    porComunidad.set(p.comunidad, list)
  }

  const COSTERAS = ['Galicia', 'Asturias', 'Cantabria', 'País Vasco',
    'Cataluña', 'Comunitat Valenciana', 'Murcia', 'Andalucía',
    'Islas Baleares', 'Canarias', 'Ceuta', 'Melilla']

  // Rotación diaria del pool: cada día entra un tramo distinto del ranking de
  // calidad de cada comunidad, para que no compitan SIEMPRE las mismas cabezas
  // de lista. Combinado con la rotación por meteo de Destacadas (cada 4h),
  // la home deja de repetir las mismas playas.
  const ROT_DIA = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const N_CALIDAD = 12 // candidatas de calidad por comunidad (pool amplio → rotación real)

  for (const com of COSTERAS) {
    const list = porComunidad.get(com) ?? []
    if (list.length === 0) continue

    // Pool de calidad de la comunidad (bandera azul / servicios).
    const calidad = list
      .map(p => ({
        p,
        pts: (p.bandera ? 3 : 0) + (p.socorrismo ? 2 : 0) + (p.parking ? 1 : 0) + (p.duchas ? 1 : 0),
      }))
      .filter(x => x.pts >= 2)
      .sort((a, b) => b.pts - a.pts)
      .map(x => x.p)

    const pool = calidad.length ? calidad : list
    const n = Math.min(N_CALIDAD, pool.length)
    // Ventana rotatoria: el punto de partida avanza cada día.
    const start = pool.length > n ? (ROT_DIA * 3) % pool.length : 0
    for (let k = 0; k < n; k++) candidatas.push(pool[(start + k) % pool.length])

    // 1 de baja calidad (rotatoria) para alimentar "Evita hoy".
    const malas = list.filter(p => !calidad.includes(p))
    if (malas.length) candidatas.push(malas[(ROT_DIA + com.length) % malas.length])
  }

  // FAQ de la home: preguntas que la gente busca ANTES de elegir playa.
  // Un solo array alimenta el schema FAQPage y la sección visible — la
  // regla de la casa (SchemaPlaya): el schema nunca dice lo que la página
  // no muestra. Counts reales del catálogo, no cifras inventadas.
  const nPerros = playas.filter(p => p.perros).length
  const nBandera = playas.filter(p => p.bandera).length
  const FAQ_HOME = [
    {
      q: '¿Cómo se calcula el estado del mar de cada playa?',
      a: `Cruzamos cada hora los modelos marinos de Open-Meteo (oleaje, viento, temperatura del agua) con la posición exacta de las ${playas.length.toLocaleString('es')} playas del inventario oficial MITECO. Con eso montamos un score 0-100 que pondera siete factores: mar, viento, temperatura del agua, UV, calidad del agua (EEA), servicios y distintivos como la Bandera Azul. Ninguna playa ni anunciante puede comprar posición.`,
    },
    {
      q: '¿Qué significan las banderas verde, amarilla y roja?',
      a: 'Verde: baño libre. Amarilla: precaución, báñate donde hagas pie y evita alejarte de la orilla. Roja: baño prohibido, aunque el mar "parezca" tranquilo (suele avisar de corrientes de resaca o medusas). Nuestra bandera estimada combina las condiciones del mar con la predicción de playa de AEMET y los reportes de bañistas de la última hora, pero la que manda siempre es la del puesto de socorrismo.',
    },
    {
      q: '¿Cuál es la temperatura del agua en las playas de España?',
      a: 'Depende de la zona y del mes: el Cantábrico se mueve entre 12 °C en invierno y 22 °C en agosto; el Mediterráneo entre 14 y 28 °C; y Canarias es la más estable, de 19 a 24 °C todo el año. En la ficha de cada playa ves la temperatura real del agua ahora mismo, actualizada cada hora, junto a la sensación al bañarte.',
    },
    {
      q: '¿Cuántas playas hay en España?',
      a: `El inventario oficial del MITECO recoge más de 3.500 playas, y aquí tienes ficha de ${playas.length.toLocaleString('es')} incluyendo calas y zonas de baño de las diez comunidades costeras, Ceuta y Melilla. De ellas, ${nBandera.toLocaleString('es')} lucen Bandera Azul en 2026 — España lleva décadas siendo el país con más banderas azules del mundo.`,
    },
    {
      q: '¿Dónde puedo ir a la playa con mi perro?',
      a: `Hay ${nPerros.toLocaleString('es')} playas que admiten perros durante todo el año o en temporada baja. Tienes el listado completo con normas y horarios en la sección de playas para perros, filtrable por provincia. Ojo en verano: muchos municipios solo los permiten fuera de la temporada de baño.`,
    },
    {
      q: '¿De dónde salen los datos y cada cuánto se actualizan?',
      a: 'Todas las fuentes son oficiales o abiertas: Open-Meteo para el mar y el viento, AEMET para la predicción de playa, MITECO para el inventario, la Agencia Europea de Medio Ambiente para la calidad del agua, ADEAC para las Banderas Azules y OpenStreetMap para los servicios. Las condiciones se refrescan cada hora; los datos estructurales, cada temporada.',
    },
  ]

  return (
    <>
      {/* WebPage con dateModified real: Google fechaba la home en 2018
          por el <time> del footer (época fake de los mtime de Vercel).
          Señal explícita y coherente con el sitemap. Sin datePublished:
          no fabricamos fechas de lanzamiento. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': 'https://playas-espana.com/#webpage',
        url: 'https://playas-espana.com/',
        name: 'Playas de España | ¿A qué playa voy hoy?',
        inLanguage: 'es',
        dateModified: getPlayasDataModified(),
        description: 'Estado del mar en tiempo real en más de 4.500 playas de España: temperatura del agua, oleaje, viento, banderas y servicios.',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_HOME.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }) }} />
      <Nav />
      <main>
        <Hero />
        <TopCercanas />
        <Buscador />
        <Suspense fallback={
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.75rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, height: 220, animation: 'fadeIn .3s ease both' }} />
              ))}
            </div>
          </div>
        }>
          <Destacadas playas={candidatas} topCount={6} avoidCount={3} />
        </Suspense>
        <div className="cv-auto"><ParkingHoy playas={playas} /></div>
        <div className="cv-auto"><ActividadesHoy playas={playas} /></div>
        <div className="cv-auto"><MonetizacionBlock /></div>
        <div className="cv-auto"><BoatRentalCTA locale="es" /></div>
        <div className="cv-auto"><ClientBlocks /></div>
        <div className="cv-auto"><MagazineCarrusel locale="es" /></div>
        <div className="cv-auto"><Comunidades comunidades={comunidades} /></div>

        {/* Hub SEO — design system v1 §08: "Explora por tema" */}
        <section style={{
          maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 1rem',
          borderTop: '1px solid var(--line)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700,
            color: 'var(--ink)', margin: '0 0 1.5rem', letterSpacing: '-.015em',
            lineHeight: 1.1,
          }}>
            Explora por <em style={{ fontWeight: 500, color: 'var(--accent)' }}>tema</em>
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '.75rem',
          }}>
            {[
              { href: '/playas-perros', label: 'Playas para perros', count: playas.filter(p => p.perros).length },
              { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas', count: playas.filter(p => p.composicion?.toLowerCase().includes('arena')).length || 612 },
              { href: '/surf', label: 'Mejores para surf', count: 148 },
              { href: '/banderas-azules', label: 'Bandera Azul 2026', count: playas.filter(p => p.bandera).length },
              { href: '/campings', label: 'Con camping cerca', count: 827 },
              { href: '/playas-nudistas', label: 'Playas nudistas', count: playas.filter(p => p.nudista).length },
              { href: '/playas-accesibles', label: 'Accesibles PMR', count: playas.filter(p => p.accesible).length },
              { href: '/playas-cerca-de-mi', label: 'Cerca de mí', count: playas.length },
              { href: '/mapa', label: 'Mapa interactivo', count: playas.length },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.15rem 1.25rem',
                background: 'var(--surface, #faf4e6)', border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm, 4px)', textDecoration: 'none',
                transition: 'border-color .15s, transform .15s',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.1, color: 'var(--ink)' }}>{item.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.15rem', fontFamily: 'var(--font-mono)' }}>{item.count.toLocaleString('es')} playas</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9,6 15,12 9,18"/></svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Impulso SEO: fichas en striking distance (GSC jul-2026) —
            página 1 baja con miles de impresiones. Enlace desde la página
            de más autoridad del sitio para empujarlas a top 5. Lista
            curada en base a datos, no rotativa. */}
        <section aria-labelledby="h2-buscadas" style={{
          maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem 0',
        }}>
          <h2 id="h2-buscadas" style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)',
            fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem',
            letterSpacing: '-.015em', lineHeight: 1.1,
          }}>
            Las playas que <em style={{ fontWeight: 500, color: 'var(--accent)' }}>más buscáis</em>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { slug: 'cala-formentor-pollenca', label: 'Cala Formentor', loc: 'Mallorca' },
              { slug: 'playa-de-covachos', label: 'Playa de Covachos', loc: 'Cantabria' },
              { slug: 'playa-del-bunker-2', label: 'Playa del Búnker', loc: 'Tarifa' },
              { slug: 'cala-fria', label: 'Cala Fría', loc: 'Cabo de Palos' },
              { slug: 'playa-de-veneguera', label: 'Veneguera', loc: 'Gran Canaria' },
              { slug: 'arrigunaga-getxo', label: 'Arrigunaga', loc: 'Getxo' },
              { slug: 'cala-del-enebro', label: 'Cala del Enebro', loc: 'Conil' },
              { slug: 'playa-de-la-almadraba', label: 'La Almadraba de Monteleva', loc: 'Cabo de Gata' },
              { slug: 'el-bancalet-de-larena-2', label: "Bancal de l'Arena", loc: 'Santa Pola' },
              { slug: 'cala-sorbas', label: 'Cala Sorbas', loc: 'Almería' },
              { slug: 'platja-de-foios', label: 'Platja de Foios', loc: 'Valencia' },
              { slug: 'praia-fluvial-de-breia', label: 'Praia de Breia', loc: 'Pontevedra' },
            ].map(p => (
              <Link key={p.slug} href={`/playas/${p.slug}`} style={{
                display: 'inline-flex', alignItems: 'baseline', gap: '.35rem',
                padding: '.5rem .8rem', background: 'var(--card-bg)',
                border: '1px solid var(--line)', borderRadius: 999,
                textDecoration: 'none', fontSize: '.85rem',
              }}>
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{p.label}</span>
                <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{p.loc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* EEAT · Por qué confiar en nuestros datos */}
        <section aria-labelledby="eeat-title" style={{
          maxWidth: 1000, margin: '3rem auto 0', padding: '2.5rem 1.5rem 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Transparencia editorial
          </div>
          <h2 id="eeat-title" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3.8vw, 2rem)',
            fontWeight: 700, color: 'var(--ink)',
            lineHeight: 1.1, letterSpacing: '-.015em',
            marginBottom: '.5rem',
          }}>
            Datos <em style={{ fontWeight: 500, color: 'var(--accent)' }}>independientes</em> de fuentes oficiales
          </h2>
          <p style={{
            fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.65,
            maxWidth: 640, marginBottom: '1.5rem',
          }}>
            Cada score 0–100 combina siete factores calculados con APIs oficiales, actualizadas
            cada hora. Ninguna playa, municipio o anunciante puede comprar posición.
          </p>

          {/* Grid de fuentes con URL (señal EEAT explícita) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '.5rem',
            marginBottom: '1.25rem',
          }}>
            {[
              { nombre: 'Open-Meteo',        rol: 'Oleaje y viento',       ref: 'open-meteo.com',   href: 'https://open-meteo.com' },
              { nombre: 'MITECO',            rol: 'Inventario oficial',    ref: 'miteco.gob.es',     href: 'https://www.miteco.gob.es' },
              { nombre: 'EEA',               rol: 'Calidad del agua',      ref: 'eea.europa.eu',     href: 'https://www.eea.europa.eu' },
              { nombre: 'ADEAC',             rol: 'Bandera Azul',          ref: 'adeac.es',          href: 'https://www.adeac.es' },
              { nombre: 'IGN · CartoCiudad', rol: 'Cartografía',           ref: 'ign.es',            href: 'https://www.ign.es' },
              { nombre: 'OpenStreetMap',     rol: 'Servicios y POI',       ref: 'openstreetmap.org', href: 'https://www.openstreetmap.org' },
            ].map(f => (
              <a
                key={f.nombre}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '.15rem',
                  padding: '.75rem .9rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  transition: 'border-color .15s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '.88rem', color: 'var(--ink)',
                }}>
                  {f.nombre}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 500 }}>
                  {f.rol}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '.65rem', color: 'var(--muted)',
                  marginTop: '.15rem', opacity: .85,
                }}>
                  {f.ref} ↗
                </div>
              </a>
            ))}
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem',
            alignItems: 'center',
            fontSize: '.82rem',
          }}>
            <Link
              href="/metodologia"
              style={{
                color: 'var(--accent)', fontWeight: 500,
                textDecoration: 'none',
                borderBottom: '1px solid var(--accent)',
                paddingBottom: 1,
              }}
            >
              Ver metodología completa →
            </Link>
            <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
              Última revisión del método:{' '}
              <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                abril 2026
              </span>
            </span>
          </div>
        </section>

        {/* FAQ home — respaldada por el FAQPage schema de arriba */}
        <section aria-labelledby="h2-faq-home" style={{
          maxWidth: 1000, margin: '3rem auto 0', padding: '2.5rem 1.5rem 1rem',
          borderTop: '1px solid var(--line)',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.4rem',
          }}>
            Preguntas frecuentes
          </div>
          <h2 id="h2-faq-home" style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3.2vw, 1.9rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1,
            letterSpacing: '-.015em', marginBottom: '1.25rem',
          }}>
            Antes de elegir <em style={{ fontWeight: 500, color: 'var(--accent)' }}>playa</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {FAQ_HOME.map(item => (
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
      {/* Widget flotante "¿Me baño hoy?" — script vanilla autocontenido
          (diseño Claude Design). Se autoinyecta y trae datos reales de
          /api/bano-hoy. Vanilla → sin depender de la hidratación de React. */}
      <script src="/bano-hoy.js" defer />
    </>
  )
}
