'use client'
// src/components/home/TopCercanas.tsx
// "Mejores playas cerca de ti" — versión ultra-robusta.
//
// SIEMPRE muestra el botón. Cero dependencia de Permissions API
// (Safari no lo soporta para geolocation y falla silenciosamente).
// Al clicar: pide ubicación → carga playas → meteo → score → render.
// Si falla → muestra error con retry. Nunca se queda en loading eterno.

import { useState, useCallback, useRef } from 'react'
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

async function fetchMeteo(lat: number, lng: number): Promise<MeteoInput> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
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

type Estado = 'button' | 'loading' | 'ready' | 'error'

export default function TopCercanas() {
  const [estado, setEstado] = useState<Estado>('button')
  const [results, setResults] = useState<ScoredNearby[]>([])
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const doLoad = useCallback(async () => {
    // Cancel any previous attempt
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setEstado('loading')
    setErrorMsg('')

    try {
      // Step 1: Geolocation — wrapped in Promise with hard timeout
      if (!navigator.geolocation) throw new Error('no-geo')

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('geo-timeout')), 6000)
        navigator.geolocation.getCurrentPosition(
          (p) => { clearTimeout(t); resolve(p) },
          (e) => { clearTimeout(t); reject(e) },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
        )
      })

      if (ac.signal.aborted) return
      const { latitude: lat, longitude: lng } = pos.coords
      setUserCoords({ lat, lng })

      // Step 2: Load playas.json
      const resp = await fetch('/data/playas.json', { signal: ac.signal })
      if (!resp.ok) throw new Error('fetch-fail')
      const playas: Playa[] = await resp.json()

      // Step 3: Find 6 nearest
      const nearby = playas
        .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
        .map(p => ({ p, dist: haversine(lat, lng, p.lat, p.lng) }))
        .filter(x => x.dist < 80)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 6)

      if (nearby.length === 0) throw new Error('no-nearby')
      if (ac.signal.aborted) return

      // Step 4: Fetch meteo — race with 7s total timeout
      const meteoRace = Promise.race([
        Promise.all(nearby.map(x => fetchMeteo(x.p.lat, x.p.lng))),
        new Promise<null>((r) => setTimeout(() => r(null), 7000)),
      ])
      const meteos = await meteoRace
      if (!meteos || ac.signal.aborted) throw new Error('meteo-timeout')

      // Step 5: Score and sort
      const scored: ScoredNearby[] = nearby.map((x, i) => ({
        playa: x.p,
        distKm: x.dist,
        meteo: (meteos as MeteoInput[])[i],
        ps: calcularPlayaScore(x.p, (meteos as MeteoInput[])[i]),
      })).sort((a, b) => b.ps.score - a.ps.score)

      setResults(scored)
      setEstado('ready')
    } catch (err) {
      if (ac.signal.aborted) return
      const msg = (err as Error)?.message ?? ''
      if (msg === 'no-geo') setErrorMsg('Tu navegador no soporta geolocalización')
      else if (msg === 'geo-timeout') setErrorMsg('No se pudo obtener tu ubicación. Inténtalo de nuevo.')
      else if (msg === 'no-nearby') setErrorMsg('No hay playas cerca de tu ubicación (<80km)')
      else if ((err as GeolocationPositionError)?.code === 1) setErrorMsg('Has denegado el acceso a la ubicación. Actívalo en los ajustes del navegador.')
      else setErrorMsg('Error al cargar. Inténtalo de nuevo.')
      setEstado('error')
    }
  }, [])

  // Button state — big, aggressive, unmissable on mobile
  if (estado === 'button') {
    return (
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem 1.5rem 0' }}>
        <button
          type="button"
          onClick={doLoad}
          style={{
            display: 'flex', alignItems: 'center', gap: '.85rem',
            width: '100%', padding: '1.15rem 1.35rem',
            background: 'var(--accent)',
            border: 'none', borderRadius: 16,
            cursor: 'pointer', transition: 'all .15s',
            minHeight: 64,
            boxShadow: '0 6px 20px rgba(107,64,10,.25)',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <MapPin size={24} weight="bold" color="#fff" aria-hidden="true" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
              ¿Qué playa me queda cerca?
            </div>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.75)', marginTop: '.15rem' }}>
              Activa tu ubicación · score en tiempo real
            </div>
          </div>
          <span style={{
            fontSize: '1.1rem', fontWeight: 900, color: '#fff',
            flexShrink: 0,
          }}>→</span>
        </button>
      </section>
    )
  }

  // Loading
  if (estado === 'loading') {
    return (
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.65rem',
          padding: '1rem 1.25rem',
          background: 'color-mix(in srgb, var(--accent) 6%, var(--card-bg))',
          border: '1.5px solid var(--line)', borderRadius: 14,
        }} role="status">
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

  // Error — with retry button
  if (estado === 'error') {
    return (
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.65rem',
          padding: '1rem 1.25rem',
          background: 'rgba(239,68,68,.06)',
          border: '1.5px solid rgba(239,68,68,.25)', borderRadius: 14,
        }}>
          <MapPin size={20} weight="bold" color="#ef4444" aria-hidden="true" />
          <span style={{ fontSize: '.85rem', color: '#b91c1c', flex: 1 }}>{errorMsg}</span>
          <button
            type="button"
            onClick={doLoad}
            style={{
              fontSize: '.82rem', fontWeight: 700, color: 'var(--accent)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline', flexShrink: 0,
            }}
          >
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  // Ready — results
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: '1rem', color: 'var(--accent)' }}>#{i + 1}</span>
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
