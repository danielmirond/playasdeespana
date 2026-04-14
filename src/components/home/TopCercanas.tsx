'use client'
// src/components/home/TopCercanas.tsx
// "Mejores playas cerca de ti" — versión robusta.
//
// NO hace auto-request de geolocalización al cargar (era flaky).
// Muestra un botón "Ver playas cerca de mí" que el usuario clica
// explícitamente. Si el browser ya tiene permiso de una sesión anterior
// lo detecta vía Permissions API y carga silenciosamente sin botón.
//
// Pipeline: geoloc (6s max) → playas.json → 6 nearest → meteo (8s max) → score → render
// Si cualquier paso falla → hide silencioso. Cero spinners eternos.

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Playa } from '@/types'
import { calcularPlayaScore, type PlayaScore, type MeteoInput } from '@/lib/scoring'
import { MapPin } from '@phosphor-icons/react'

interface ScoredNearby {
  playa: Playa
  distKm: number
  meteo: MeteoInput
  ps: PlayaScore
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function fetchMeteoWithTimeout(lat: number, lng: number, timeoutMs = 5000): Promise<MeteoInput> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const h = new Date().getHours()
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { signal: controller.signal }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { signal: controller.signal }),
    ])
    clearTimeout(timer)
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    return {
      olas:   parseFloat((marine?.hourly?.wave_height?.[h] ?? 0.4).toFixed(1)),
      agua:   Math.round(marine?.hourly?.sea_surface_temperature?.[h] ?? 18),
      viento: Math.round(meteo?.hourly?.wind_speed_10m?.[h] ?? 10),
      uv:     Math.round(meteo?.hourly?.uv_index?.[h] ?? 3),
    }
  } catch {
    clearTimeout(timer)
    return { agua: 18, olas: 0.4, viento: 10, uv: 3 }
  }
}

function getPosition(timeoutMs = 6000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs)
    navigator.geolocation.getCurrentPosition(
      (pos) => { clearTimeout(timer); resolve(pos) },
      (err) => { clearTimeout(timer); reject(err) },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 600000 },
    )
  })
}

type Estado = 'button' | 'loading' | 'ready' | 'hidden'

export default function TopCercanas() {
  const [estado, setEstado] = useState<Estado>('hidden')
  const [results, setResults] = useState<ScoredNearby[]>([])
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Check if geolocation was previously granted — if so, load silently
  useEffect(() => {
    if (!navigator.geolocation) return
    if (!navigator.permissions) { setEstado('button'); return }

    navigator.permissions.query({ name: 'geolocation' }).then(r => {
      if (r.state === 'granted') {
        // Already granted from a previous session — auto-load
        doLoad()
      } else if (r.state === 'prompt') {
        // Not yet decided — show the button
        setEstado('button')
      }
      // 'denied' → stay hidden
    }).catch(() => {
      setEstado('button')
    })
  }, [])

  const doLoad = useCallback(async () => {
    setEstado('loading')
    try {
      const pos = await getPosition(6000)
      const { latitude: lat, longitude: lng } = pos.coords
      setUserCoords({ lat, lng })

      const resp = await fetch('/data/playas.json')
      if (!resp.ok) throw new Error('fetch failed')
      const playas: Playa[] = await resp.json()

      // Find 6 closest coastal beaches
      const nearby = playas
        .filter(p => p.lat && p.lng)
        .map(p => ({ p, dist: haversine(lat, lng, p.lat, p.lng) }))
        .filter(x => x.dist < 80)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 6)

      if (nearby.length === 0) { setEstado('hidden'); return }

      // Fetch meteo for all 6 in parallel with 8s total timeout
      const meteoPromise = Promise.all(nearby.map(x => fetchMeteoWithTimeout(x.p.lat, x.p.lng, 5000)))
      const meteoTimer = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000))
      const meteos = await Promise.race([meteoPromise, meteoTimer])

      if (!meteos) { setEstado('hidden'); return }

      const scored: ScoredNearby[] = nearby.map((x, i) => ({
        playa: x.p,
        distKm: x.dist,
        meteo: (meteos as MeteoInput[])[i],
        ps: calcularPlayaScore(x.p, (meteos as MeteoInput[])[i]),
      })).sort((a, b) => b.ps.score - a.ps.score)

      setResults(scored)
      setEstado('ready')
    } catch {
      setEstado('hidden')
    }
  }, [])

  if (estado === 'hidden') return null

  // Button state — prominent CTA to activate location
  if (estado === 'button') {
    return (
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <button
          type="button"
          onClick={doLoad}
          style={{
            display: 'flex', alignItems: 'center', gap: '.65rem',
            width: '100%', padding: '1rem 1.25rem',
            background: 'color-mix(in srgb, var(--accent) 8%, var(--card-bg))',
            border: '1.5px solid var(--line)', borderRadius: 14,
            cursor: 'pointer', transition: 'all .15s',
            minHeight: 56,
          }}
          aria-label="Activar ubicación para ver playas cercanas"
        >
          <MapPin size={22} weight="bold" color="var(--accent)" aria-hidden="true" />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>
              Ver playas cerca de mí
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.1rem' }}>
              Con puntuación en tiempo real según viento, oleaje y servicios
            </div>
          </div>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)' }}>Activar →</span>
        </button>
      </section>
    )
  }

  // Loading state — compact, disappears fast
  if (estado === 'loading') {
    return (
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.65rem',
          padding: '1rem 1.25rem',
          background: 'color-mix(in srgb, var(--accent) 6%, var(--card-bg))',
          border: '1.5px solid var(--line)', borderRadius: 14,
        }} role="status" aria-live="polite">
          <MapPin size={20} weight="bold" color="var(--accent)" aria-hidden="true" />
          <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--ink)', flex: 1 }}>
            Analizando playas cercanas…
          </span>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2.5px solid var(--accent)', borderTopColor: 'transparent',
            animation: 'spin .6s linear infinite',
          }} />
        </div>
      </section>
    )
  }

  // Ready — scored cards
  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: '.85rem', flexWrap: 'wrap', gap: '.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 900,
          color: 'var(--ink)', margin: 0, letterSpacing: '-.015em',
          display: 'flex', alignItems: 'center', gap: '.45rem',
        }}>
          <MapPin size={18} weight="bold" color="var(--accent)" aria-hidden="true" />
          Mejores playas cerca de ti
        </h2>
        {userCoords && (
          <Link
            href={`/buscar?lat=${userCoords.lat.toFixed(4)}&lng=${userCoords.lng.toFixed(4)}&orden=cercanas`}
            style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
          >
            Ver todas →
          </Link>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '.65rem',
      }}>
        {results.map((r, i) => (
          <Link
            key={r.playa.slug}
            href={`/playas/${r.playa.slug}`}
            style={{
              display: 'flex', flexDirection: 'column',
              background: 'var(--card-bg)', border: '1.5px solid var(--line)',
              borderRadius: 14, padding: '1rem 1.1rem',
              textDecoration: 'none', transition: 'all .15s',
            }}
          >
            {/* Score + rank + distance */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: '1rem', color: 'var(--accent)' }}>
                  #{i + 1}
                </span>
                <span style={{
                  background: r.ps.color, color: '#fff',
                  fontFamily: 'var(--font-serif)', fontWeight: 900,
                  fontSize: '.88rem', padding: '.3rem .5rem', borderRadius: 8,
                  display: 'inline-flex', alignItems: 'center', gap: '.2rem',
                }}>
                  {r.ps.score}<span style={{ fontSize: '.55rem', opacity: .8 }}>/100</span>
                </span>
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: r.ps.color }}>{r.ps.label}</span>
              </div>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.15rem .5rem', borderRadius: 100 }}>
                {r.distKm < 1 ? `${Math.round(r.distKm * 1000)}m` : `${r.distKm.toFixed(1)}km`}
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.2, marginBottom: '.15rem' }}>{r.playa.nombre}</div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginBottom: '.4rem' }}>{r.playa.municipio} · {r.playa.provincia}</div>

            {/* Factor pills */}
            {r.ps.factors.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginBottom: '.4rem' }}>
                {r.ps.factors.map(f => (
                  <span key={f.icon} style={{
                    fontSize: '.68rem', fontWeight: 700, color: f.color,
                    background: `${f.color}12`, border: `1px solid ${f.color}30`,
                    padding: '.15rem .4rem', borderRadius: 6, whiteSpace: 'nowrap',
                  }}>{f.label}</span>
                ))}
              </div>
            )}

            {/* Meteo */}
            <div style={{ display: 'flex', gap: '.6rem', fontSize: '.74rem', color: 'var(--muted)', marginTop: 'auto' }}>
              <span><strong style={{ color: 'var(--ink)' }}>{r.meteo.agua}°C</strong> agua</span>
              <span><strong style={{ color: 'var(--ink)' }}>{r.meteo.olas}m</strong> olas</span>
              <span><strong style={{ color: 'var(--ink)' }}>{r.meteo.viento}</strong> km/h</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
