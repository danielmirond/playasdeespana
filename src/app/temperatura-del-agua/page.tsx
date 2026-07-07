// src/app/temperatura-del-agua/page.tsx — Temperatura del agua del mar HOY por
// provincia. Captura "temperatura agua + playa/provincia", de las búsquedas de
// verano con más volumen. Usamos la temperatura superficial del mar en tiempo
// real de Open-Meteo Marine para las playas principales de cada provincia
// costera. ISR 1h.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import AuthorByline from '@/components/seo/AuthorByline'
import { getPlayas } from '@/lib/playas'
import { fetchWithTimeout } from '@/lib/fetch-timeout'
import type { Playa } from '@/types'

export const revalidate = 3600

const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Temperatura del agua del mar hoy en España | Por provincias',
  description: 'Temperatura del agua del mar hoy en las playas de España, provincia a provincia: dónde está más cálida para bañarse, con datos en tiempo real actualizados cada hora.',
  alternates: { canonical: '/temperatura-del-agua' },
  openGraph: {
    type: 'website', url: `${BASE}/temperatura-del-agua`,
    images: [{ url: '/api/og?playa=Temperatura%20del%20agua%20del%20mar%20hoy', width: 1200, height: 630 }],
  },
}

const COSTERAS: Array<{ comunidad: string; provincias: string[] }> = [
  { comunidad: 'Galicia',              provincias: ['A Coruña', 'Lugo', 'Pontevedra'] },
  { comunidad: 'Asturias',             provincias: ['Asturias'] },
  { comunidad: 'Cantabria',            provincias: ['Cantabria'] },
  { comunidad: 'País Vasco',           provincias: ['Bizkaia', 'Gipuzkoa'] },
  { comunidad: 'Cataluña',             provincias: ['Girona', 'Barcelona', 'Tarragona'] },
  { comunidad: 'Comunitat Valenciana', provincias: ['Castellón', 'Valencia', 'Alicante'] },
  { comunidad: 'Murcia',               provincias: ['Murcia'] },
  { comunidad: 'Andalucía',            provincias: ['Huelva', 'Cádiz', 'Málaga', 'Granada', 'Almería'] },
  { comunidad: 'Islas Baleares',       provincias: ['Baleares'] },
  { comunidad: 'Canarias',             provincias: ['Las Palmas', 'Santa Cruz de Tenerife'] },
  { comunidad: 'Ceuta y Melilla',      provincias: ['Ceuta', 'Melilla'] },
]

const POR_PROVINCIA = 6

async function tempBatch(coords: { lat: number; lng: number }[]): Promise<(number | null)[]> {
  if (!coords.length) return []
  const hora = parseInt(new Intl.DateTimeFormat('es-ES', { hour: 'numeric', hour12: false, timeZone: 'Europe/Madrid' }).format(new Date()), 10) || 12
  const CHUNK = 50
  const chunks: { lat: number; lng: number }[][] = []
  for (let i = 0; i < coords.length; i += CHUNK) chunks.push(coords.slice(i, i + CHUNK))

  const out = await Promise.all(chunks.map(async chunk => {
    const lats = chunk.map(c => c.lat.toFixed(4)).join(',')
    const lngs = chunk.map(c => c.lng.toFixed(4)).join(',')
    try {
      const r = await fetchWithTimeout(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&hourly=sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }, 8000)
      const d = r.ok ? await r.json() : null
      return chunk.map((_, i) => {
        const arr = chunk.length === 1 ? d?.hourly : d?.[i]?.hourly
        const t = arr?.sea_surface_temperature?.[hora]
        return typeof t === 'number' ? Math.round(t * 10) / 10 : null
      })
    } catch {
      return chunk.map(() => null)
    }
  }))
  return out.flat()
}

function topDeProvincia(playas: Playa[], provincia: string): Playa[] {
  const nombres = provincia === 'Baleares' ? ['Baleares', 'Islas Baleares'] : [provincia]
  return playas
    .filter(p => nombres.includes(p.provincia) && p.lat && p.lng)
    .map(p => ({ p, pts: (p.bandera ? 3 : 0) + (p.socorrismo ? 2 : 0) + (p.duchas ? 1 : 0) + (p.parking ? 1 : 0) }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, POR_PROVINCIA)
    .map(x => x.p)
}

// Color por temperatura del agua (frío → cálido).
function tempColor(t: number): string {
  if (t >= 24) return '#a8301a' // muy cálida
  if (t >= 21) return '#c47a1e' // cálida, apetece
  if (t >= 18) return '#7a8a30' // templada
  if (t >= 15) return '#2d6b8a' // fresca
  return '#2d5266'              // fría
}
function tempLabel(t: number): string {
  if (t >= 24) return 'muy cálida'
  if (t >= 21) return 'cálida'
  if (t >= 18) return 'templada'
  if (t >= 15) return 'fresca'
  return 'fría'
}

const FAQ = [
  { q: '¿Cuál es la temperatura ideal del agua para bañarse?', a: 'A partir de unos 21-22 °C el baño resulta agradable para la mayoría; por encima de 24 °C el agua está claramente cálida. Entre 18 y 21 °C es templada (se disfruta con el sol), y por debajo de 18 °C se nota fresca: típica del Cantábrico y el Atlántico norte incluso en verano.' },
  { q: '¿Dónde está el agua más caliente de España en verano?', a: 'En pleno verano, el Mediterráneo (Baleares, Comunidad Valenciana, Murcia, Cataluña sur) y el sur peninsular suelen tener el agua más cálida, a menudo por encima de 24-26 °C. Canarias se mantiene templada-cálida casi todo el año. El Cantábrico y el Atlántico gallego son las más frescas.' },
  { q: '¿Cómo se mide esta temperatura?', a: 'Mostramos la temperatura superficial del mar en tiempo real de modelos oceanográficos (Open-Meteo Marine) para las playas principales de cada provincia, actualizada cada hora. Es una estimación orientativa del agua a esa hora; la sensación real depende también del viento y de las corrientes locales.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

export default async function TemperaturaAguaPage() {
  const playas = await getPlayas()

  const porProvincia: Array<{ comunidad: string; provincia: string; playas: Playa[] }> = []
  for (const c of COSTERAS) for (const prov of c.provincias) {
    porProvincia.push({ comunidad: c.comunidad, provincia: prov, playas: topDeProvincia(playas, prov) })
  }
  const flat = porProvincia.flatMap(g => g.playas)
  const temps = await tempBatch(flat.map(p => ({ lat: p.lat, lng: p.lng })))

  let idx = 0
  const grupos = porProvincia.map(g => {
    const items = g.playas.map(p => ({ p, t: temps[idx++] })).filter(x => x.t != null) as { p: Playa; t: number }[]
    const avg = items.length ? Math.round((items.reduce((s, x) => s + x.t, 0) / items.length) * 10) / 10 : null
    return { ...g, items, avg }
  }).filter(g => g.avg != null)

  // Ranking de provincias por temperatura del agua (más cálida primero).
  const ranking = [...grupos].sort((a, b) => (b.avg! - a.avg!))

  const actualizado = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date())

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Temperatura del agua</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Temperatura del agua del mar <em style={{ fontWeight: 500, color: 'var(--accent)' }}>hoy</em> <span aria-hidden="true">🌡️</span>
        </h1>
        <AuthorByline
          headline="Temperatura del agua del mar hoy en España, por provincias"
          url={`${BASE}/temperatura-del-agua`}
          dateModified={new Date().toISOString()}
          description="Temperatura del agua del mar hoy en las playas de España por provincia, en tiempo real."
          articleSection="Estado del mar"
        />
        <p data-speakable style={{ fontSize: '.92rem', color: 'var(--muted)', margin: '0 0 1.5rem', maxWidth: 620, lineHeight: 1.6 }}>
          Temperatura superficial del mar ahora mismo en las playas principales de cada provincia costera.
          Actualizado a las {actualizado} (hora peninsular), se recalcula cada hora. Ordenado de más cálida a más fresca.
        </p>

        {/* Ranking provincias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem', marginBottom: '2.5rem' }}>
          {ranking.map((g, i) => {
            const t = g.avg!
            const c = tempColor(t)
            const pct = Math.max(6, Math.min(100, ((t - 12) / (27 - 12)) * 100))
            return (
              <div key={g.provincia} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.6rem .85rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--muted)', width: 20, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: '.86rem', fontWeight: 600, color: 'var(--ink)' }}>{g.provincia} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.72rem' }}>· {g.comunidad}</span></span>
                <div style={{ width: 90, height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden', flexShrink: 0 }} aria-hidden="true">
                  <div style={{ width: `${pct}%`, height: '100%', background: c }} />
                </div>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: '.95rem', color: c, width: 52, textAlign: 'right', flexShrink: 0 }}>{t}°C</span>
              </div>
            )
          })}
        </div>

        {/* Detalle por comunidad → provincia → playas */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>
          El detalle, <em style={{ fontWeight: 500, color: 'var(--accent)' }}>playa a playa</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.9rem', marginBottom: '2.5rem' }}>
          {COSTERAS.map(c => {
            const provs = grupos.filter(g => g.comunidad === c.comunidad)
            if (!provs.length) return null
            return (
              <section key={c.comunidad} aria-label={`Temperatura del agua en ${c.comunidad}`}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .6rem' }}>{c.comunidad}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {provs.map(g => (
                    <details key={g.provincia} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6 }}>
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.8rem 1rem', cursor: 'pointer', listStyle: 'none' }}>
                        <span style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)', flex: 1 }}>{g.provincia}</span>
                        <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{tempLabel(g.avg!)}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: '.9rem', color: tempColor(g.avg!) }}>{g.avg}°C</span>
                        <span aria-hidden="true" style={{ fontSize: '.72rem', color: 'var(--muted)' }}>▾</span>
                      </summary>
                      <div style={{ borderTop: '1px solid var(--line)', padding: '.5rem 1rem .75rem' }}>
                        {g.items.map(it => (
                          <div key={it.p.slug} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.45rem 0', borderBottom: '1px dashed var(--line)' }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: tempColor(it.t), flexShrink: 0 }} aria-hidden="true" />
                            <Link href={`/playas/${it.p.slug}`} style={{ flex: 1, fontSize: '.84rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {it.p.nombre} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.74rem' }}>· {it.p.municipio}</span>
                            </Link>
                            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '.84rem', color: tempColor(it.t), flexShrink: 0 }}>{it.t}°C</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* FAQ */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2.5rem' }}>
          {FAQ.map(f => (
            <details key={f.q} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.8rem 1rem' }}>
              <summary style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.6, margin: '.6rem 0 0' }}>{f.a}</p>
            </details>
          ))}
        </div>

        {/* Cross-links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.6rem' }}>
          <Link href="/banderas-hoy" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas en las playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Semáforo de oleaje y viento por provincias.</span>
          </Link>
          <Link href="/medusas" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Riesgo de medusas <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>El agua caliente también las trae: mira la temporada.</span>
          </Link>
          <Link href="/buscar?orden=score" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Las mejores playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Score 0-100 en tiempo real con datos oficiales.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
