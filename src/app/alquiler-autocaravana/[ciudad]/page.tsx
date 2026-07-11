// src/app/alquiler-autocaravana/[ciudad]/page.tsx
// Página transaccional por ciudad (BOFU). Design system + ISR. Solo 5 ciudades
// en build (F1) -> generateStaticParams acotado, sin riesgo de timeout.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getCamperCities, getCamperCity, CITY_COORDS, TIPOS_VEHICULO } from '@/lib/autocaravana-localities'
import { getPlayasCercaDe } from '@/lib/playas'
import { camperdaysAwinUrl } from '@/lib/camperdaysAwinUrl'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CTA = '#0b7285'
const CTA2 = '#0c4a6e'

interface Props { params: Promise<{ ciudad: string }> }

export async function generateStaticParams() {
  return getCamperCities().map(c => ({ ciudad: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad } = await params
  const c = getCamperCity(ciudad)
  if (!c) return {}
  return {
    title: `Alquiler de autocaravanas y campers en ${c.ciudad} | Compara precios`,
    description: `Alquila autocaravana o camper en ${c.ciudad} (${c.zona}). Compara precios por temporada, recogida en ${c.aeropuerto}, áreas de pernocta y playas aptas cerca.`,
    alternates: {
      canonical: `/alquiler-autocaravana/${c.slug}`,
      languages: c.en ? { es: `/alquiler-autocaravana/${c.slug}`, en: `/en/campervan-rental/${c.slug}` } : undefined,
    },
    openGraph: { title: `Alquiler de autocaravanas y campers en ${c.ciudad}`, url: `${BASE}/alquiler-autocaravana/${c.slug}`, type: 'article' },
  }
}

function ued(path: string | null): string {
  return path ? `https://www.camperdays.es/${path}` : 'https://www.camperdays.es/campervans-spain.html'
}

export default async function CamperCityPage({ params }: Props) {
  const { ciudad } = await params
  const c = getCamperCity(ciudad)
  if (!c) notFound()

  const cta1 = camperdaysAwinUrl(`playasdeespana_camper_${c.slug}`, ued(c.camperdaysPath))
  const cta2 = camperdaysAwinUrl(`playasdeespana_camper_${c.slug}_bottom`, ued(c.camperdaysPath))

  // Foso: playas REALES con parking más cercanas a la ciudad de recogida.
  const coords = CITY_COORDS[c.slug]
  const playasCerca = coords ? await getPlayasCercaDe(coords.lat, coords.lng, 8) : []

  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: c.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${CTA2} 0%, ${CTA} 100%)`, color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <nav style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>
            <Link href="/" style={{ color: 'inherit' }}>Inicio</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span>
            <Link href="/alquiler-autocaravana" style={{ color: 'inherit' }}>Alquiler autocaravanas</Link>
            <span style={{ margin: '0 .35rem', opacity: .6 }}>›</span>
            <span aria-current="page">{c.ciudad}</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.7rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 .9rem' }}>
            Alquiler de autocaravanas y campers en {c.ciudad}
          </h1>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 640, margin: '0 0 1.6rem', color: 'rgba(255,255,255,.92)' }}>{c.intro}</p>
          <a href={cta1} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.6rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Comparar precios en {c.ciudad} →
          </a>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2.25rem 1.5rem 4rem' }}>
        {/* PRECIOS */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Precios orientativos en {c.ciudad}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.65rem' }}>
            {[['Temporada baja', c.precios.baja], ['Temporada media', c.precios.media], ['Temporada alta', c.precios.alta]].map(([t, p]) => (
              <div key={t} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.3rem' }}>{t}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, color: CTA, fontSize: '1.15rem' }}>{p}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.6rem' }}>
            Autocaravana capuchina estándar. Reservando con antelación y entre semana ahorras un 20-30%. <Link href="/alquiler-autocaravana/precios" style={{ color: CTA, fontWeight: 600 }}>Ver guía de precios →</Link>
          </p>
        </section>

        {/* RECOGIDA + ZBE */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .75rem' }}>Recogida en {c.ciudad}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.recogida}</p>
          {c.zbe && (
            <div style={{ marginTop: '.9rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '.8rem 1rem', fontSize: '.85rem', color: '#7c2d12' }}>
              ⚠️ <strong>{c.ciudad} tiene Zona de Bajas Emisiones (ZBE).</strong> Las autocaravanas de alquiler suelen tener etiqueta C/ECO y pueden circular; confirma la etiqueta al reservar.
            </div>
          )}
        </section>

        {/* RUTAS */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Rutas desde {c.ciudad}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.65rem' }}>
            {c.rutas.map(r => (
              <div key={r.nombre} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.9rem 1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>{r.nombre}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOSO: PLAYAS REALES CERCANAS (con parking) + ÁREAS */}
        <section style={{ marginBottom: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '1.25rem 1.4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .6rem' }}>Playas con parking más cercanas a {c.ciudad}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 .5rem' }}>{c.playasNota}</p>
          {playasCerca.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.4rem' }}>
              {playasCerca.map(p => (
                <li key={p.slug}>
                  <Link href={`/playas/${p.slug}`} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.5rem', background: 'var(--bg, #fff)', border: '1px solid var(--line)', borderRadius: 6, padding: '.5rem .7rem', textDecoration: 'none' }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '.88rem' }}>
                        {p.bandera && <span title="Bandera azul" aria-label="Bandera azul" style={{ marginRight: '.3rem' }}>🔵</span>}
                        {p.nombre}
                      </span>
                      <span style={{ display: 'block', fontSize: '.74rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.74rem', color: CTA, whiteSpace: 'nowrap' }}>{Math.round(p.km)} km</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 .75rem', fontSize: '.9rem' }}>{c.areasNota}</p>
          <Link href="/playas-autocaravana" style={{ color: CTA, fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}>Ver todas las playas aptas para autocaravana →</Link>
        </section>

        {/* TIPOS */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>¿Qué vehículo elegir?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.6rem' }}>
            {TIPOS_VEHICULO.map(t => (
              <div key={t.nombre} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem', fontSize: '.92rem' }}>{t.nombre}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {c.faqs.map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', fontSize: '.92rem' }}>{f.q}</summary>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginTop: '.55rem', fontSize: '.88rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: `linear-gradient(135deg, ${CTA} 0%, ${CTA2} 100%)`, color: '#fff', borderRadius: 10, padding: '2.25rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 .6rem' }}>Compara tu autocaravana en {c.ciudad}</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', margin: '0 0 1.25rem' }}>Varias empresas, un comparador. Sin coste adicional para ti.</p>
          <a href={cta2} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.85rem 1.7rem', background: '#fff', color: CTA2, borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver precios en Camperdays →
          </a>
        </section>
      </main>
    </>
  )
}
