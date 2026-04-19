// src/app/playas-autocaravana/page.tsx
// Pillar SEO: "Playas para autocaravana en España" — hub específico para
// viajeros en autocaravana que buscan áreas cerca del mar (diferente de
// /campings, que es general).

import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getComunidades } from '@/lib/playas'
import SchemaItemList from '@/components/seo/SchemaItemList'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Playas para autocaravana en España — Áreas, pernocta y rutas costeras',
  description: 'Guía completa de playas aptas para autocaravana en España. Áreas de autocaravanas cercanas, zonas de pernocta legal, servicios de vaciado y enganche eléctrico por comunidad.',
  alternates: { canonical: '/playas-autocaravana' },
  openGraph: {
    title: 'Playas para autocaravana en España',
    description: 'Áreas de autocaravanas cerca del mar, rutas costeras y consejos prácticos.',
    url: `${BASE}/playas-autocaravana`,
    type: 'article',
  },
}

// Comunidades costeras ordenadas por popularidad entre autocaravanistas
const COMUNIDADES_AUTOCARAVANA = [
  { nombre: 'Cataluña',             desc: 'Costa Brava y Costa Daurada: red consolidada de áreas con servicios.' },
  { nombre: 'Comunitat Valenciana', desc: 'Alicante y Castellón: clima templado todo el año, muchas áreas gratuitas.' },
  { nombre: 'Andalucía',            desc: 'Costa del Sol, Cabo de Gata, Huelva: destino número 1 en invierno.' },
  { nombre: 'Murcia',               desc: 'Mar Menor y La Manga: áreas grandes junto a playa.' },
  { nombre: 'Galicia',              desc: 'Rías Baixas y Costa da Morte: áreas gratuitas en puertos.' },
  { nombre: 'Asturias',             desc: 'Costa Verde: áreas en cabos y miradores del Cantábrico.' },
  { nombre: 'Cantabria',            desc: 'Playas abiertas y San Vicente: pocas áreas pero muy bien situadas.' },
  { nombre: 'País Vasco',           desc: 'Costa vasca: regulación estricta, usar solo áreas oficiales.' },
  { nombre: 'Islas Baleares',       desc: 'Mallorca: acampada muy restringida, recomendable reserva previa.' },
  { nombre: 'Canarias',             desc: 'Tenerife, Fuerteventura: clima de playa todo el año, pocas áreas reguladas.' },
]

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function PlayasAutocaravanaPage() {
  const [playas, comunidades] = await Promise.all([getPlayas(), getComunidades()])

  // Selección: playas con parking (mejor acceso para autocaravana) y bandera azul,
  // limitado a 3 por comunidad para variedad geográfica.
  const destacadasPorComunidad = new Map<string, typeof playas>()
  for (const p of playas) {
    if (!COMUNIDADES_AUTOCARAVANA.some(c => c.nombre === p.comunidad)) continue
    const list = destacadasPorComunidad.get(p.comunidad) ?? []
    // Priorizar playas con parking
    const puntuacion = (p.parking ? 2 : 0) + (p.bandera ? 1 : 0) + (p.accesible ? 1 : 0)
    if (puntuacion >= 2 && list.length < 3) {
      list.push(p)
      destacadasPorComunidad.set(p.comunidad, list)
    }
  }
  const destacadas = Array.from(destacadasPorComunidad.values()).flat()

  return (
    <>
      <SchemaItemList
        name="Playas para autocaravana en España"
        description="Selección de playas con buen acceso para autocaravanas, áreas cercanas y servicios."
        url={`${BASE}/playas-autocaravana`}
        beaches={destacadas.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Playas para autocaravana</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          Playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>para autocaravana</em>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.6 }}>
          Guía completa para viajar en autocaravana por la costa española: áreas de servicio cerca del mar,
          zonas de pernocta legal, vaciados, enganche eléctrico y las comunidades más amigables con
          caravanistas. En cada ficha de playa mostramos el parking y las áreas más cercanas.
        </p>

        {/* Clave: pernocta vs acampada */}
        <aside
          aria-label="Aviso legal"
          style={{
            background: 'rgba(234,179,8,.1)',
            border: '1.5px solid rgba(234,179,8,.4)',
            borderRadius: 14, padding: '1rem 1.15rem',
            marginBottom: '2rem',
          }}
        >
          <strong style={{ color: '#854d0e', fontSize: '.9rem' }}>Pernoctar ≠ acampar.</strong>
          <span style={{ color: 'var(--muted)', fontSize: '.88rem', marginLeft: '.25rem' }}>
            Dormir dentro del vehículo sin sacar toldos, sillas ni patas es <strong>legal</strong> en la mayoría de parkings públicos.
            Desplegar mobiliario de camping es <strong>acampada libre</strong> y está prohibido en toda la costa española.
          </span>
        </aside>

        {/* Ventajas y requisitos */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '.65rem', marginBottom: '2.5rem',
        }}>
          {[
            { icon: '💧', label: 'Vaciado (sanitary dump)',  desc: 'Puntos para aguas grises y químico' },
            { icon: '🔌', label: 'Enganche eléctrico',        desc: '220V en áreas grandes, 16A estándar' },
            { icon: '🚿', label: 'Agua potable',              desc: 'Llenado gratuito en muchas áreas' },
            { icon: '🌙', label: 'Pernocta libre',            desc: 'En vehículo, sin desplegar nada' },
          ].map(h => (
            <div key={h.label} style={{
              background: 'var(--card-bg)', border: '1.5px solid var(--line)',
              borderRadius: 14, padding: '1rem',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '.3rem' }} aria-hidden="true">{h.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>{h.label}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.2rem', lineHeight: 1.5 }}>{h.desc}</div>
            </div>
          ))}
        </div>

        {/* Comunidades */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Mejores comunidades para ruta en autocaravana
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2.5rem' }}>
          {COMUNIDADES_AUTOCARAVANA.map((c, i) => {
            const slug = slugify(c.nombre)
            const count = comunidades.find(x => x.nombre === c.nombre)?.count ?? 0
            return (
              <Link
                key={c.nombre}
                href={`/comunidad/${slug}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '.9rem 1.1rem', borderRadius: 14,
                  background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <span style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                  background: i < 3 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(249,115,22,.15)',
                  color: i < 3 ? '#fff' : '#9a3412',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.8rem', fontWeight: 800,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)' }}>{c.nombre}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.1rem', lineHeight: 1.45 }}>{c.desc}</div>
                </div>
                <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>
                  {count} playas →
                </span>
              </Link>
            )
          })}
        </div>

        {/* Playas destacadas */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Playas destacadas con buen acceso en autocaravana
        </h2>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Selección de playas con parking grande y Bandera Azul —las más fáciles para acceder con caravana
          y con áreas de servicio habitualmente cerca.
        </p>
        <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.5rem', marginBottom: '2.5rem' }}>
          {destacadas.map(p => (
            <li key={p.slug}>
              <Link
                href={`/playas/${p.slug}`}
                prefetch={false}
                style={{
                  display: 'block', padding: '.7rem .9rem', borderRadius: 12,
                  background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.nombre}
                </div>
                <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.15rem' }}>
                  {p.municipio}
                  {p.parking && <span> · 🅿️</span>}
                  {p.bandera && <span style={{ color: '#2563eb' }}> · ★</span>}
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* Apps y recursos */}
        <section aria-labelledby="h2-apps" style={{
          background: 'var(--card-bg)', border: '1.5px solid var(--line)',
          borderRadius: 16, padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <h2 id="h2-apps" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Apps imprescindibles para autocaravanistas
          </h2>
          <ul style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
            <li><strong>Park4Night</strong> — mapa colaborativo con áreas, parkings y pernoctas (reviews de usuarios).</li>
            <li><strong>Caramaps</strong> — guía francesa con buena cobertura de España; áreas y servicios.</li>
            <li><strong>Campercontact</strong> — enfocado en áreas europeas, datos de servicios y precios.</li>
            <li><strong>ACSI CampingCard</strong> — descuentos en 3.000+ campings europeos fuera de temporada.</li>
            <li><strong>iOverlander</strong> — alternativa gratuita, enfocada en viajeros de larga duración.</li>
          </ul>
        </section>

        {/* Cross-links */}
        <section aria-labelledby="h2-rel" style={{ marginBottom: '2rem' }}>
          <h2 id="h2-rel" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            También te puede interesar
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { href: '/campings',                 label: 'Campings cerca de playa' },
              { href: '/rutas',                    label: 'Rutas costeras por España' },
              { href: '/rutas/configurar',         label: 'Configurar mi ruta' },
              { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
              { href: '/playas-secretas',          label: 'Playas secretas' },
              { href: '/mapa',                     label: 'Mapa interactivo' },
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
                q: '¿Se puede dormir en una autocaravana junto a la playa en España?',
                a: 'Sí, siempre que pernoctes dentro del vehículo sin desplegar toldos, patas, sillas ni mesa — eso sería acampada libre y está prohibido en toda la costa. La pernocta con ruedas en el suelo y el vehículo matriculado es legal en parkings públicos no señalizados como prohibidos. Algunos municipios costeros limitan la pernocta a 24-48h.',
              },
              {
                q: '¿Qué multa te ponen por acampar ilegalmente con una autocaravana?',
                a: 'Las multas por acampada libre varían según la comunidad: 100€ en Comunitat Valenciana, 300-3.000€ en Cataluña, 60-150€ en Andalucía. En espacios naturales protegidos pueden ascender hasta 6.000€. Los ayuntamientos son los que sancionan en primera instancia.',
              },
              {
                q: '¿Dónde puedo vaciar aguas grises y químico cerca de la playa?',
                a: 'En áreas de autocaravanas públicas (gratuitas o 1-5€) o en gasolineras con servicio de "sanitary dump" (unas 3€). La red pública en España tiene más de 400 puntos cerca de la costa. Está prohibido vaciar fuera de estos puntos y conlleva multa elevada.',
              },
              {
                q: '¿Cuáles son las mejores rutas en autocaravana por la costa española?',
                a: 'Ruta clásica en invierno: Costa Blanca + Costa Cálida (Alicante-Murcia). En primavera: Costa da Morte y Rías Baixas (Galicia). En verano: Costa Brava o Cabo de Gata. Las Rías y Asturias tienen muchas áreas gratuitas junto al mar.',
              },
              {
                q: '¿Puedo conducir la autocaravana hasta la misma playa?',
                a: 'En la mayoría de playas hay parkings habilitados a 100-500m de la arena. No se permite el acceso a la arena o a caminos no asfaltados. En cada ficha de playa indicamos el parking más cercano y su distancia real.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--line)', borderRadius: 12, padding: '.85rem 1rem' }}>
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
            { '@type': 'Question', name: '¿Se puede dormir en una autocaravana junto a la playa en España?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, siempre que pernoctes dentro del vehículo sin desplegar toldos, patas, sillas ni mesa. La pernocta con ruedas en el suelo es legal en parkings públicos no señalizados como prohibidos.' } },
            { '@type': 'Question', name: '¿Qué multa te ponen por acampar ilegalmente con una autocaravana?', acceptedAnswer: { '@type': 'Answer', text: 'Las multas por acampada libre varían según la comunidad: 100€ en Comunitat Valenciana, 300-3.000€ en Cataluña, 60-150€ en Andalucía. En espacios protegidos pueden llegar a 6.000€.' } },
            { '@type': 'Question', name: '¿Dónde puedo vaciar aguas grises y químico cerca de la playa?', acceptedAnswer: { '@type': 'Answer', text: 'En áreas de autocaravanas públicas (gratuitas o 1-5€) o gasolineras con servicio de sanitary dump. La red pública española tiene más de 400 puntos cerca de la costa.' } },
            { '@type': 'Question', name: '¿Cuáles son las mejores rutas en autocaravana por la costa española?', acceptedAnswer: { '@type': 'Answer', text: 'En invierno: Costa Blanca y Costa Cálida. En primavera: Galicia (Rías Baixas y Costa da Morte). En verano: Costa Brava o Cabo de Gata.' } },
            { '@type': 'Question', name: '¿Puedo conducir la autocaravana hasta la misma playa?', acceptedAnswer: { '@type': 'Answer', text: 'En la mayoría de playas hay parkings habilitados a 100-500m. No se permite acceso a la arena o caminos no asfaltados.' } },
          ],
        })}}
      />
    </>
  )
}
