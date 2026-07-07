// src/app/banderas-hoy/page.tsx — Semáforo de banderas EN VIVO por provincia.
// Captura la búsqueda "banderas playas hoy" (+80% en Trends) y variantes
// provinciales ("banderas playas bizkaia/cantabria…"). Calculamos la bandera
// estimada (verde/amarilla/roja) con oleaje + viento en tiempo real
// (calcularBandera, el mismo motor que usan las fichas) para las playas
// principales de cada provincia costera. ISR 30 min.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import AuthorByline from '@/components/seo/AuthorByline'
import { getPlayas } from '@/lib/playas'
import { calcularBandera } from '@/lib/seguridad'
import { fetchWithTimeout } from '@/lib/fetch-timeout'
import type { Playa } from '@/types'

export const revalidate = 1800

const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Banderas en las playas hoy | Semáforo por provincias',
  description: 'Semáforo de banderas en las playas de España hoy: estimación verde, amarilla o roja por oleaje y viento en tiempo real, provincia a provincia, actualizada cada 30 minutos.',
  alternates: { canonical: '/banderas-hoy' },
  openGraph: {
    type: 'website', url: `${BASE}/banderas-hoy`,
    images: [{ url: '/api/og?playa=Banderas%20en%20las%20playas%20hoy', width: 1200, height: 630 }],
  },
}

// Provincias costeras tal y como aparecen en el dataset. 'Islas Baleares' se
// normaliza a 'Baleares' (el dataset tiene ambas etiquetas).
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

interface MeteoBH { olas: number; viento: number; racha: number }

// Batch Open-Meteo en trozos de <=50 coordenadas (marine + forecast).
async function meteoBatch(coords: { lat: number; lng: number }[]): Promise<MeteoBH[]> {
  const fb: MeteoBH = { olas: 0.4, viento: 10, racha: 15 }
  if (!coords.length) return []
  const hora = parseInt(new Intl.DateTimeFormat('es-ES', { hour: 'numeric', hour12: false, timeZone: 'Europe/Madrid' }).format(new Date()), 10) || 12

  const CHUNK = 50
  const chunks: { lat: number; lng: number }[][] = []
  for (let i = 0; i < coords.length; i += CHUNK) chunks.push(coords.slice(i, i + CHUNK))

  const results = await Promise.all(chunks.map(async chunk => {
    const lats = chunk.map(c => c.lat.toFixed(4)).join(',')
    const lngs = chunk.map(c => c.lng.toFixed(4)).join(',')
    try {
      const [rM, rF] = await Promise.all([
        // 8s: la página es ISR — la regeneración corre en background, así que
        // un timeout generoso no penaliza TTFB y evita caer a fallback en frío.
        fetchWithTimeout(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&hourly=wave_height&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 1800 } }, 8000),
        fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=wind_speed_10m,wind_gusts_10m&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 1800 } }, 8000),
      ])
      const marine = rM.ok ? await rM.json() : null
      const meteo  = rF.ok ? await rF.json() : null
      return chunk.map((_, i) => {
        const mA = chunk.length === 1 ? marine?.hourly : marine?.[i]?.hourly
        const fA = chunk.length === 1 ? meteo?.hourly : meteo?.[i]?.hourly
        if (!mA && !fA) return fb
        return {
          olas:   parseFloat((mA?.wave_height?.[hora] ?? 0.4).toFixed(1)),
          viento: Math.round(fA?.wind_speed_10m?.[hora] ?? 10),
          racha:  Math.round(fA?.wind_gusts_10m?.[hora] ?? 15),
        }
      })
    } catch {
      return chunk.map(() => fb)
    }
  }))
  return results.flat()
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

const FAQ = [
  { q: '¿Qué significa cada bandera en la playa?', a: 'Verde: baño permitido, condiciones normales. Amarilla: precaución, baño con limitaciones por oleaje o viento moderados. Roja: baño prohibido por condiciones peligrosas. La bandera oficial la iza cada mañana el servicio de socorrismo de la playa.' },
  { q: '¿Cómo se calcula este semáforo?', a: 'Estimamos la bandera de cada playa con datos de oleaje y viento en tiempo real de modelos oficiales (Open-Meteo), aplicando umbrales de seguridad: roja con olas ≥1,5 m o viento muy fuerte; amarilla con oleaje o viento moderados; verde en calma. Se actualiza cada 30 minutos.' },
  { q: '¿Esta bandera es la oficial de la playa?', a: 'No. Es una estimación meteorológica orientativa. La bandera oficial y vinculante la decide el socorrista de cada playa según las condiciones locales del momento, y puede diferir de la estimación. Consulta siempre la bandera izada en el puesto de vigilancia.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

const HEX = { verde: '#3d6b1f', amarilla: '#c48a1e', roja: '#a8301a' } as const

export default async function BanderasHoyPage() {
  const playas = await getPlayas()

  // Selección top-6 por provincia y meteo en batch (una sola pasada).
  const porProvincia: Array<{ comunidad: string; provincia: string; playas: Playa[] }> = []
  for (const c of COSTERAS) for (const prov of c.provincias) {
    porProvincia.push({ comunidad: c.comunidad, provincia: prov, playas: topDeProvincia(playas, prov) })
  }
  const flat = porProvincia.flatMap(g => g.playas)
  const meteos = await meteoBatch(flat.map(p => ({ lat: p.lat, lng: p.lng })))

  let idx = 0
  const grupos = porProvincia.map(g => {
    const items = g.playas.map(p => {
      const m = meteos[idx++]
      const bandera = calcularBandera(m.olas, m.viento, m.racha)
      return { p, m, bandera }
    })
    const counts = { verde: 0, amarilla: 0, roja: 0 }
    for (const it of items) counts[it.bandera.color as keyof typeof counts]++
    return { ...g, items, counts }
  })

  const total = { verde: 0, amarilla: 0, roja: 0 }
  for (const g of grupos) { total.verde += g.counts.verde; total.amarilla += g.counts.amarilla; total.roja += g.counts.roja }
  const nMonitorizadas = total.verde + total.amarilla + total.roja

  const actualizado = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date())

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Banderas hoy</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Banderas en las playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>hoy</em> <span aria-hidden="true">🚩</span>
        </h1>
        <AuthorByline
          headline="Banderas en las playas hoy: semáforo por provincias"
          url={`${BASE}/banderas-hoy`}
          dateModified={new Date().toISOString()}
          description="Semáforo de banderas estimadas (verde, amarilla, roja) por oleaje y viento en tiempo real, provincia a provincia."
          articleSection="Estado del mar"
        />
        <p data-speakable style={{ fontSize: '.92rem', color: 'var(--muted)', margin: '0 0 1rem', maxWidth: 620, lineHeight: 1.6 }}>
          Estimación de bandera para {nMonitorizadas} playas principales del litoral, calculada con el oleaje y el viento
          de ahora mismo. Actualizado a las {actualizado} (hora peninsular), se recalcula cada 30 minutos.
        </p>

        {/* Resumen nacional */}
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(['verde', 'amarilla', 'roja'] as const).map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 999, padding: '.45rem .9rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: HEX[c], flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: '.82rem', color: 'var(--ink)' }}>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{total[c]}</strong> {c === 'verde' ? 'verdes' : c === 'amarilla' ? 'amarillas' : 'rojas'}
              </span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(196,138,30,.08)', border: '1px solid rgba(196,138,30,.3)', borderRadius: 6, padding: '.8rem 1rem', fontSize: '.8rem', color: 'var(--ink)', lineHeight: 1.55, marginBottom: '2.25rem', maxWidth: 640 }}>
          <strong>Importante:</strong> es una estimación meteorológica orientativa. La bandera oficial la iza el
          socorrista de cada playa y puede diferir. En cada ficha tienes el detalle de oleaje, viento y avisos.
        </div>

        {/* Semáforo por comunidad → provincia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.9rem' }}>
          {COSTERAS.map(c => {
            const provs = grupos.filter(g => g.comunidad === c.comunidad)
            if (!provs.length) return null
            return (
              <section key={c.comunidad} aria-label={`Banderas hoy en ${c.comunidad}`}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .65rem' }}>{c.comunidad}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {provs.map(g => (
                    <details key={g.provincia} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6 }}>
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.8rem 1rem', cursor: 'pointer', listStyle: 'none' }}>
                        <span style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--ink)', flex: 1 }}>{g.provincia}</span>
                        <span style={{ display: 'inline-flex', gap: '.35rem', alignItems: 'center' }} aria-label={`${g.counts.verde} verdes, ${g.counts.amarilla} amarillas, ${g.counts.roja} rojas`}>
                          {g.items.map((it, i) => (
                            <span key={i} title={`${it.p.nombre}: bandera ${it.bandera.color}`} style={{ width: 11, height: 11, borderRadius: '50%', background: it.bandera.hex, display: 'inline-block' }} />
                          ))}
                        </span>
                        <span aria-hidden="true" style={{ fontSize: '.72rem', color: 'var(--muted)' }}>▾</span>
                      </summary>
                      <div style={{ borderTop: '1px solid var(--line)', padding: '.5rem 1rem .75rem' }}>
                        {g.items.map(it => (
                          <div key={it.p.slug} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.45rem 0', borderBottom: '1px dashed var(--line)' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: it.bandera.hex, flexShrink: 0 }} aria-hidden="true" />
                            <Link href={`/playas/${it.p.slug}`} style={{ flex: 1, fontSize: '.84rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {it.p.nombre} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.74rem' }}>· {it.p.municipio}</span>
                            </Link>
                            <span style={{ fontSize: '.7rem', color: 'var(--muted)', flexShrink: 0 }}>{it.m.olas} m · {it.m.viento} km/h</span>
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
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '2.5rem 0 1rem' }}>Preguntas frecuentes</h2>
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
          <Link href="/banderas-negras" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas Negras 2026 <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Los puntos negros del litoral según Ecologistas en Acción.</span>
          </Link>
          <Link href="/calidad-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Calidad del agua <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Muestreos oficiales EEA playa a playa.</span>
          </Link>
          <Link href="/temperatura-del-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Temperatura del agua hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>¿Dónde está el mar más cálido para bañarse?</span>
          </Link>
          <Link href="/prediccion-fin-de-semana" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Predicción del finde <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>¿Qué costa tendrá mejores condiciones?</span>
          </Link>
        </div>
      </main>
    </>
  )
}
