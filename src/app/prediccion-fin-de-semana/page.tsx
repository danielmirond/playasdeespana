// src/app/prediccion-fin-de-semana/page.tsx
// "¿Dónde ir este sábado?". forecast a 3 días para las mejores playas.
// Contenido fresco que cambia cada día → Google reindexe frecuentemente.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'

export const revalidate = 3600

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const metadata: Metadata = {
  title: 'Predicción de playas para el fin de semana | ¿Dónde ir este sábado?',
  description: 'Previsión a 3 días de las mejores playas de España: oleaje, viento y temperatura. Encuentra la playa perfecta para este fin de semana.',
  alternates: { canonical: '/prediccion-fin-de-semana' },
  openGraph: {
    title: '¿Dónde ir a la playa este fin de semana?',
    description: 'Previsión a 3 días: oleaje, viento y temperatura en las mejores playas.',
    url: `${BASE}/prediccion-fin-de-semana`,
  },
}

interface ForecastDay { dia: string; fecha: string; viento: number; olas: number; temp: number }

async function fetchForecast3d(lat: number, lng: number): Promise<ForecastDay[]> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&daily=wave_height_max&forecast_days=3&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 }, signal: controller.signal }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=wind_speed_10m_max,temperature_2m_max&wind_speed_unit=kmh&forecast_days=3&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 }, signal: controller.signal }),
    ])
    clearTimeout(timer)
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    const dates = meteo?.daily?.time ?? marine?.daily?.time ?? []
    return dates.map((d: string, i: number) => {
      const date = new Date(d)
      return {
        dia: DIAS_ES[date.getDay()],
        fecha: date.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        viento: Math.round(meteo?.daily?.wind_speed_10m_max?.[i] ?? 15),
        olas: parseFloat((marine?.daily?.wave_height_max?.[i] ?? 0.5).toFixed(1)),
        temp: Math.round(meteo?.daily?.temperature_2m_max?.[i] ?? 22),
      }
    })
  } catch {
    return []
  }
}

function scoreDia(d: ForecastDay): number {
  let s = 50
  if (d.viento <= 10) s += 25; else if (d.viento <= 20) s += 15; else s -= 10
  if (d.olas <= 0.5) s += 15; else if (d.olas <= 1.0) s += 5; else s -= 10
  if (d.temp >= 25) s += 10; else if (d.temp >= 20) s += 5
  return Math.max(0, Math.min(100, s))
}

export default async function PrediccionFinDeSemanaPage() {
  const playas = await getPlayas()
  const sample = playas
    .filter(p => p.lat && p.lng && p.bandera)
    .sort(() => 0.5 - Math.random())
    .slice(0, 15)

  const forecasts = await Promise.all(
    sample.map(async p => ({
      playa: p,
      dias: await fetchForecast3d(p.lat, p.lng),
    }))
  )

  const conScore = forecasts
    .filter(f => f.dias.length >= 3)
    .map(f => {
      const scores = f.dias.map(scoreDia)
      const best = Math.max(...scores)
      const bestIdx = scores.indexOf(best)
      return { ...f, bestScore: best, bestDay: f.dias[bestIdx] }
    })
    .sort((a, b) => b.bestScore - a.bestScore)

  const today = new Date()
  const dayNames = [0, 1, 2].map(offset => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    return { dia: DIAS_ES[d.getDay()], fecha: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }) }
  })

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Predicción fin de semana</span>
        </nav>

        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: '.72rem', fontWeight: 500,
          letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          Previsión a 3 días · {dayNames.map(d => d.dia).join(' · ')}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          ¿Dónde ir <em style={{ fontWeight: 500, color: 'var(--accent)' }}>este fin de semana</em>?
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 640, marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Previsión de viento, oleaje y temperatura a 3 días en playas
          con Bandera Azul. Te decimos cuál es el mejor día para ir a cada una.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          {conScore.slice(0, 12).map(({ playa: p, dias, bestDay, bestScore }) => (
            <Link key={p.slug} href={`/playas/${p.slug}`} style={{
              display: 'flex', alignItems: 'stretch', gap: 0,
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, overflow: 'hidden',
              textDecoration: 'none', color: 'inherit',
              transition: 'border-color .15s',
            }}>
              <div style={{
                width: 4, flexShrink: 0,
                background: bestScore >= 80 ? '#3d6b1f' : bestScore >= 60 ? '#7a8a30' : '#c48a1e',
              }} />
              <div style={{ flex: 1, padding: '.85rem 1rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.2 }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                  </div>
                  {bestDay && (
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '.5rem' }}>
                      <div style={{
                        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                        fontWeight: 400, fontSize: '.85rem',
                        color: bestScore >= 80 ? '#3d6b1f' : bestScore >= 60 ? '#7a8a30' : '#c48a1e',
                      }}>
                        Mejor: {bestDay.dia}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {dias.map((d, i) => (
                    <div key={i} style={{
                      flex: '1 1 90px',
                      padding: '.45rem .5rem',
                      background: 'var(--metric-bg)', borderRadius: 4,
                      textAlign: 'center',
                      border: d === bestDay ? '1px solid var(--accent)' : '1px solid transparent',
                    }}>
                      <div style={{ fontSize: '.68rem', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{d.dia.slice(0, 3)}</div>
                      <div style={{
                        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                        fontSize: '.72rem', color: 'var(--ink)', marginTop: '.15rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {d.temp}° · {d.olas}m · {d.viento}km/h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/playas-sin-viento" style={{
            fontSize: '.88rem', fontWeight: 500, color: 'var(--accent)',
            borderBottom: '1px solid var(--accent)', paddingBottom: 1,
            textDecoration: 'none', marginRight: '1.5rem',
          }}>
            Playas sin viento hoy →
          </Link>
          <Link href="/buscar?orden=score" style={{
            fontSize: '.88rem', fontWeight: 500, color: 'var(--accent)',
            borderBottom: '1px solid var(--accent)', paddingBottom: 1,
            textDecoration: 'none',
          }}>
            Mejores playas ahora →
          </Link>
        </div>
      </main>
    </>
  )
}
