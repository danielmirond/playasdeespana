// src/app/buceo/page.tsx
// Hub SEO: "Buceo en España". Centros y puntos por municipio, y las reservas marinas del Estado
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getMunicipiosBuceo, MAX_CENTROS_POR_MUNICIPIO, RESERVAS_MARINAS_ESTADO, RESERVAS_MARINAS_MAPA_URL } from '@/lib/buceo-resumen'
import EnlacesRelacionados from '@/components/seo/EnlacesRelacionados'
import UpdatedBadge from '@/components/seo/UpdatedBadge'
import GygActivities from '@/components/GygActivities'
import { getEditorialModified } from '@/lib/dateModified'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
// Desde la fuente única. Antes era `?? ''`, que con la variable sin
// definir dejaba `tag=` en los enlaces: sin error y sin comisión.
import { AMAZON_TAG } from '@/lib/amazon-productos'
const CIVITATIS_AFF = process.env.NEXT_PUBLIC_CIVITATIS_AFF ?? ''

const MODIFIED = getEditorialModified('src/app/buceo/page.tsx', ['public/data/buceo-places.json', 'public/data/buceo-osm.json'])
export const metadata: Metadata = {
  title: 'Buceo en España | Centros, puntos de inmersión y reservas marinas',
  description: 'Dónde bucear en España: centros de buceo por municipio, puntos de inmersión y las reservas marinas del Estado, de Cabo de Palos a La Restinga.',
  alternates: { canonical: '/buceo' },
  openGraph: {
    title: 'Buceo en España',
    description: 'Centros de buceo por municipio, puntos de inmersión y reservas marinas.',
    url: `${BASE}/buceo`,
    type: 'article',
    images: [{ url: '/api/og?playa=Buceo%20en%20Espa%C3%B1a', width: 1200, height: 630 }],
  },
}

export default async function BuceoPage() {
  const municipios = await getMunicipiosBuceo()
  const totalCentros = municipios.reduce((n, m) => n + m.centros, 0)
  const totalPuntos = municipios.reduce((n, m) => n + m.puntos, 0)
  const conPagina = municipios.filter(m => m.conPagina)
  const top = [...conPagina].sort((a, b) => b.puntos - a.puntos || b.centros - a.centros).slice(0, 12)

  // Las respuestas salen de nuestros datos o de la lista del Ministerio. Antes
  // daban precios, temperaturas y porcentajes sin fuente; el JSON-LD repetía
  // el texto a mano y ahora se genera de aquí.
  const faq = [
    {
      q: '¿Dónde encuentro centros de buceo en España?',
      a: `Tenemos localizados ${totalCentros.toLocaleString('es')} centros de buceo en ${municipios.length} municipios costeros, con datos de Google Maps y un máximo de ${MAX_CENTROS_POR_MUNICIPIO} por municipio. En la página de snorkel y buceo de cada municipio están sus centros, con la playa que les queda más cerca.`,
    },
    {
      q: '¿Cuántas reservas marinas hay en España?',
      a: `El Ministerio de Agricultura, Pesca y Alimentación gestiona ${RESERVAS_MARINAS_ESTADO.length}: ${RESERVAS_MARINAS_ESTADO.map(r => r.nombre).join(', ')}. Las comunidades autónomas tienen además las suyas. El buceo dentro de cada reserva está regulado: la normativa está en la ficha de cada una en la web del Ministerio.`,
    },
    {
      q: '¿Dónde se puede bucear desde la playa?',
      a: `Hay ${totalPuntos} puntos de inmersión señalados en OpenStreetMap junto a la costa. En la página de cada municipio aparecen con la distancia a la playa más cercana.`,
    },
  ]

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
          Tenemos localizados {totalCentros.toLocaleString('es')} centros de buceo en {municipios.length} municipios
          costeros (hasta {MAX_CENTROS_POR_MUNICIPIO} por municipio) y {totalPuntos} puntos de inmersión señalados en OpenStreetMap. Los municipios con página de
          snorkel y buceo tienen los centros, los puntos y la vida marina registrada en su litoral.
        </p>

        {/* Municipios con más centros: antes era un «Top 6» de playas filtrado
            por un campo que el dataset no trae, y no salía nunca. */}
        {top.length > 0 && (
          <section aria-labelledby="top-buceo" style={{ marginBottom: '2.5rem' }}>
            <h2 id="top-buceo" style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '1rem',
            }}>
              Municipios con <em style={{ fontWeight: 500, color: 'var(--accent)' }}>buceo</em>
            </h2>
            <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6, margin: '-.5rem 0 1rem' }}>
              Primero los que tienen puntos de inmersión señalados. De cada municipio contamos hasta{' '}
              {MAX_CENTROS_POR_MUNICIPIO} centros, así que la cifra no sirve para comparar los más grandes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.5rem' }}>
              {top.map(m => (
                <Link key={m.slug} href={`/municipio/${m.slug}/snorkel-buceo`} prefetch={false} style={{
                  display: 'flex', flexDirection: 'column', gap: '.15rem', padding: '.8rem 1rem', borderRadius: 6,
                  background: 'var(--card-bg)', border: '1px solid var(--line)', textDecoration: 'none', color: 'inherit',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)' }}>{m.nombre}</span>
                  <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>
                    {m.provincia} · {m.centros} {m.centros === 1 ? 'centro' : 'centros'}
                    {m.puntos > 0 && <> · {m.puntos} {m.puntos === 1 ? 'punto' : 'puntos'} de inmersión</>}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.5rem', marginBottom: '2rem' }}>
          {[
            { val: totalCentros.toLocaleString('es'), label: 'Centros de buceo' },
            { val: municipios.length.toLocaleString('es'), label: 'Municipios con centros' },
            { val: totalPuntos.toLocaleString('es'), label: 'Puntos de inmersión' },
            { val: String(RESERVAS_MARINAS_ESTADO.length), label: 'Reservas marinas del Estado' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '.75rem', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--accent)' }}>{s.val}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '.15rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reservas marinas del Estado, con la lista del Ministerio. Sustituye a
            un «top 10» sin fuente que repetía sitios (El Hierro y La Restinga;
            Medas y Medes-Tossa) y marcaba como reserva las Cíes. */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.4rem' }}>
          Reservas marinas del Estado
        </h2>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Las {RESERVAS_MARINAS_ESTADO.length} que gestiona el{' '}
          <a href={RESERVAS_MARINAS_MAPA_URL} target="_blank" rel="noopener">Ministerio de Agricultura, Pesca y Alimentación</a>.
          Cada una tiene su normativa de buceo: consúltala en su ficha del Ministerio antes de ir.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.5rem', marginBottom: '2.5rem' }}>
          {RESERVAS_MARINAS_ESTADO.map(r => (
            <Link key={r.nombre} href={`/comunidad/${r.comSlug}`} prefetch={false} style={{
              display: 'flex', flexDirection: 'column', gap: '.1rem', padding: '.75rem 1rem', borderRadius: 6,
              background: 'var(--card-bg)', border: '1px solid var(--line)', textDecoration: 'none', color: 'inherit',
            }}>
              <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)' }}>{r.nombre}</span>
              <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{r.zona}</span>
            </Link>
          ))}
        </div>

        {/* Certificaciones */}
        <section aria-labelledby="h2-cert" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-cert" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Certificaciones: ¿cuál elegir?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.5rem' }}>
            {[
              { sigla: 'PADI',  nombre: 'Professional Association of Diving Instructors',  desc: 'Agencia de formación con su propia escala de títulos, de Open Water en adelante.' },
              { sigla: 'SSI',   nombre: 'Scuba Schools International',                     desc: 'Agencia de formación con títulos propios; muchos centros trabajan con ella o con PADI.' },
              { sigla: 'CMAS',  nombre: 'Confédération Mondiale des Activités Subaquatiques', desc: 'Confederación internacional de federaciones; sus títulos se imparten a través de clubes federados.' },
              { sigla: 'FEDAS', nombre: 'Federación Española de Actividades Subacuáticas', desc: 'La federación española, miembro de CMAS.' },
            ].map(c => (
              <div key={c.sigla} style={{
                border: '1px solid var(--line)', borderRadius: 4,
                padding: '.75rem', background: 'rgba(255,255,255,.4)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#3d93b0' }}>{c.sigla}</div>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '.25rem' }}>{c.nombre}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Equipo + afiliación */}
        <section aria-labelledby="h2-equipo" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-equipo" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Equipo básico de buceo
          </h2>
          <ul style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.75, paddingLeft: '1.2rem' }}>
            <li><strong>Máscara.</strong> silicona transparente, cristal templado. Probar en cara sin apretar correa (debe hacer vacío).</li>
            <li><strong>Neopreno.</strong> el grosor depende de la temperatura del agua: pregunta al centro qué usan en esa época.</li>
            <li><strong>Aletas.</strong> de talón abierto con escarpines para roca; cerradas para snorkel.</li>
            <li><strong>Regulador + BCD + botella.</strong> mejor alquilar hasta que bucees regularmente.</li>
            <li><strong>Linterna submarina.</strong> imprescindible en cuevas y nocturnas.</li>
            <li><strong>Ordenador de buceo.</strong> los centros suelen alquilarlo; comprarlo tiene sentido si buceas con frecuencia.</li>
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
            background: 'linear-gradient(135deg, #3d93b0, var(--mar-500))',
            borderRadius: 6, padding: '1.1rem 1.25rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200, color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '.95rem', marginBottom: '.2rem' }}>
                Bautismos y excursiones de snorkel
              </div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.85)' }}>
                Bautismos y salidas con centros de la zona.
              </div>
            </div>
            <a
              href={`https://www.civitatis.com/es/?q=buceo&aid=${CIVITATIS_AFF}`}
              target="_blank" rel="noopener noreferrer sponsored"
              style={{
                padding: '.55rem 1.1rem', background: '#fff', color: '#3d93b0',
                borderRadius: 4, fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
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
            { href: '/alquiler-barco',            label: 'Alquiler de barco' },
            { href: '/islas',                     label: 'Playas en islas' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'inline-flex', padding: '.45rem .85rem',
              background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent-2)', borderRadius: 100,
              fontSize: '.78rem', fontWeight: 600, textDecoration: 'none',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            }}>{l.label} →</Link>
          ))}
        </div>

        {/* FAQ */}
        <section aria-labelledby="h2-faq">
          <h2 id="h2-faq" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {faq.map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      
        <UpdatedBadge iso={MODIFIED} url="https://playas-espana.com/buceo" name="Buceo en España" visible={false} />
        <EnlacesRelacionados topic="buceo" />
      </main>
      <GygActivities query="submarinismo España" cmp="buceo_hub" title="Bautismos y salidas de buceo" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        })}}
      />
    </>
  )
}
