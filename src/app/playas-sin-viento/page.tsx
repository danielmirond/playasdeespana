// src/app/playas-sin-viento/page.tsx
// KW estacional: "playas sin viento hoy". landing dinámica que muestra
// las playas con menos viento ahora mismo. Se revalida cada hora.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import type { Playa } from '@/types'

export const revalidate = 3600

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Playas sin viento hoy en España | Las más resguardadas',
  description: 'Playas con menos viento ahora mismo en España. Datos en tiempo real de Open-Meteo. Ideales para familias, paddle surf y snorkel.',
  alternates: { canonical: '/playas-sin-viento' },
  openGraph: {
    title: 'Playas sin viento hoy',
    description: 'Las playas más resguardadas de España ahora mismo.',
    url: `${BASE}/playas-sin-viento`,
  },
}

async function fetchViento(coords: { lat: number; lng: number }[]): Promise<number[]> {
  if (coords.length === 0) return []
  const h = new Date().getHours()
  const lats = coords.map(c => c.lat.toFixed(4)).join(',')
  const lngs = coords.map(c => c.lng.toFixed(4)).join(',')
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=wind_speed_10m&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`,
      { next: { revalidate: 3600 }, signal: controller.signal }
    )
    clearTimeout(timer)
    if (!r.ok) return coords.map(() => 15)
    const data = await r.json()
    return coords.map((_, i) => {
      const hourly = coords.length === 1 ? data?.hourly : data?.[i]?.hourly
      return Math.round(hourly?.wind_speed_10m?.[h] ?? 15)
    })
  } catch {
    return coords.map(() => 15)
  }
}

export default async function PlayasSinVientoPage() {
  const playas = await getPlayas()
  const sample = playas
    .filter(p => p.lat && p.lng)
    .sort(() => 0.5 - Math.random())
    .slice(0, 60)

  const vientos = await fetchViento(sample.map(p => ({ lat: p.lat, lng: p.lng })))

  const conViento = sample.map((p, i) => ({ ...p, viento: vientos[i] }))
    .sort((a, b) => a.viento - b.viento)

  const sinViento = conViento.filter(p => p.viento <= 12).slice(0, 20)
  const conBreve = conViento.filter(p => p.viento > 12 && p.viento <= 20).slice(0, 10)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Playas sin viento</span>
        </nav>

        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: '.72rem', fontWeight: 500,
          letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          Actualizado cada hora · {new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}h
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          Playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>sin viento</em> hoy
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 640, marginBottom: '2rem', lineHeight: 1.6 }}>
          Las playas más resguardadas de España ahora mismo. Ideales para
          familias con niños, paddle surf, snorkel y días de toalla tranquila.
        </p>

        {sinViento.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.85rem',
            }}>
              Calma total <em style={{ fontWeight: 500, color: 'var(--accent)' }}>({'<'}12 km/h)</em>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {sinViento.map(p => (
                <Link key={p.slug} href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.75rem 1rem', borderRadius: 6,
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    fontSize: '.85rem', fontWeight: 500, color: '#3d6b1f',
                    width: 55, textAlign: 'right', flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {p.viento} km/h
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {conBreve.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.85rem',
            }}>
              Brisa suave <em style={{ fontWeight: 500, color: 'var(--accent)' }}>(12-20 km/h)</em>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {conBreve.map(p => (
                <Link key={p.slug} href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.65rem 1rem', borderRadius: 6,
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    fontSize: '.82rem', fontWeight: 500, color: '#c48a1e',
                    width: 55, textAlign: 'right', flexShrink: 0,
                  }}>
                    {p.viento} km/h
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href="/buscar?filtro=sinviento" style={{
            fontSize: '.88rem', fontWeight: 500, color: 'var(--accent)',
            borderBottom: '1px solid var(--accent)', paddingBottom: 1,
            textDecoration: 'none',
          }}>
            Buscar más playas sin viento →
          </Link>
        </div>
      </main>
    </>
  )
}
