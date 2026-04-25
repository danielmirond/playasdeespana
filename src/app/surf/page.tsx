// src/app/surf/page.tsx — Surf forecast: playas con actividad surf
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Surf en España — Previsión de olas y viento en playas de surf',
  description: 'Previsión de surf en España: playas con olas, periodo, viento y condiciones para surfear hoy. Costa Vasca, Asturias, Galicia, Canarias, Cádiz y más.',
  alternates: { canonical: '/surf' },
}

const FAQ = [
  { q: '¿Cuáles son las mejores playas de surf en España?', a: 'La playa de Mundaka (País Vasco) tiene una de las mejores olas izquierdas del mundo. Otras playas destacadas son Rodiles (Asturias), Pantín (Galicia), El Palmar (Cádiz) y las playas del norte de Fuerteventura. Cada zona ofrece condiciones distintas según la época del año.' },
  { q: '¿Cuándo es la mejor época para surfear en España?', a: 'El otoño (septiembre-noviembre) es la mejor temporada en el Cantábrico y Galicia, con swells consistentes del Atlántico y agua todavía templada. En Canarias se puede surfear todo el año. En la costa sur (Cádiz, Málaga), el invierno trae las mejores olas gracias a las borrascas atlánticas.' },
  { q: '¿Se puede surfear en España sin experiencia?', a: 'Sí. Hay decenas de escuelas de surf en todas las costas, especialmente en Asturias, Cantabria, País Vasco y Cádiz. Las clases para principiantes suelen durar 2 horas e incluyen neopreno y tabla. Playas como Somo (Cantabria) o El Palmar (Cádiz) son ideales para aprender por su fondo de arena y olas suaves.' },
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

interface SurfMeteo {
  olas: number; periodo: number; viento: number; vientoDir: string; agua: number
}

async function fetchSurfMeteo(lat: number, lng: number): Promise<SurfMeteo> {
  try {
    const h = new Date().getHours()
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_period,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }),
    ])
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    const dirs = ['N','NE','E','SE','S','SO','O','NO']
    const wd = meteo?.hourly?.wind_direction_10m?.[h] ?? 0
    return {
      olas: parseFloat((marine?.hourly?.wave_height?.[h] ?? 0).toFixed(1)),
      periodo: Math.round(marine?.hourly?.wave_period?.[h] ?? 8),
      agua: Math.round(marine?.hourly?.sea_surface_temperature?.[h] ?? 16),
      viento: Math.round(meteo?.hourly?.wind_speed_10m?.[h] ?? 10),
      vientoDir: dirs[Math.round(wd / 45) % 8],
    }
  } catch {
    return { olas: 0.5, periodo: 8, viento: 10, vientoDir: 'N', agua: 16 }
  }
}

function surfQuality(m: SurfMeteo): { label: string; color: string; desc: string } {
  if (m.olas >= 1.0 && m.olas <= 2.5 && m.viento <= 20 && m.periodo >= 8)
    return { label: 'EPIC', color: '#22c55e', desc: 'Condiciones ideales para surfear' }
  if (m.olas >= 0.8 && m.olas <= 3.0 && m.viento <= 25)
    return { label: 'BUENO', color: '#3b82f6', desc: 'Buen día de surf' }
  if (m.olas >= 0.5 && m.viento <= 35)
    return { label: 'REGULAR', color: '#eab308', desc: 'Se puede surfear con condiciones' }
  if (m.olas < 0.5)
    return { label: 'FLAT', color: '#9ca3af', desc: 'Mar plano, sin olas' }
  return { label: 'HOLD', color: '#ef4444', desc: 'Demasiado fuerte o ventoso' }
}

export default async function SurfPage() {
  const playas = await getPlayas()
  const surfPlayas = playas.filter(p =>
    p.actividades?.surf && typeof p.lat === 'number' && typeof p.lng === 'number'
  )

  // Fetch meteo for up to 20 surf beaches
  const candidates = surfPlayas.slice(0, 20)
  const meteos = await Promise.all(candidates.map(p => fetchSurfMeteo(p.lat, p.lng)))

  const scored = candidates.map((p, i) => ({
    playa: p,
    meteo: meteos[i],
    quality: surfQuality(meteos[i]),
  })).sort((a, b) => {
    const order = { EPIC: 0, BUENO: 1, REGULAR: 2, FLAT: 3, HOLD: 4 }
    return (order[a.quality.label as keyof typeof order] ?? 5) - (order[b.quality.label as keyof typeof order] ?? 5) || b.meteo.olas - a.meteo.olas
  })

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Surf</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.02,
          letterSpacing: '-.02em', marginBottom: '.5rem',
        }}>
          Dónde <em style={{ fontWeight: 500, color: 'var(--accent)' }}>surfear hoy</em> en España
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2rem', maxWidth: 560 }}>
          Condiciones de surf actualizadas cada hora para {surfPlayas.length} playas.
          Olas, periodo, viento y temperatura del agua.
        </p>

        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, overflow: 'hidden', marginBottom: '2rem',
        }}>
          <MapaPlayas playas={surfPlayas} height="400px" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {scored.map(({ playa: p, meteo: m, quality: q }) => (
            <Link key={p.slug} href={`/playas/${p.slug}`} style={{
              display: 'flex', alignItems: 'center', gap: '.85rem',
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '1rem 1.15rem',
              textDecoration: 'none', transition: 'all .15s',
            }}>
              {/* Quality badge */}
              <div style={{
                width: 56, textAlign: 'center', flexShrink: 0,
              }}>
                <div style={{
                  background: q.color, color: '#fff',
                  fontWeight: 700, fontSize: '.72rem',
                  padding: '.3rem .5rem', borderRadius: 6,
                  letterSpacing: '.05em',
                }}>
                  {q.label}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{p.nombre}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                <div style={{ fontSize: '.72rem', color: q.color, fontWeight: 600, marginTop: '.15rem' }}>{q.desc}</div>
              </div>

              {/* Meteo data */}
              <div style={{ display: 'flex', gap: '.75rem', flexShrink: 0, fontSize: '.78rem', color: 'var(--muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{m.olas}m</div>
                  <div>Olas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{m.periodo}s</div>
                  <div>Periodo</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{m.viento}</div>
                  <div>{m.vientoDir}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{m.agua}°</div>
                  <div>Agua</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {surfPlayas.length > 20 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '.85rem' }}>
            Mostrando las 20 playas de surf más relevantes. <Link href="/buscar" style={{ color: 'var(--accent)', fontWeight: 700 }}>Buscar todas →</Link>
          </p>
        )}
      </main>
    </>
  )
}
