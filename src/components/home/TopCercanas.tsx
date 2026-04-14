'use client'
// src/components/home/TopCercanas.tsx
// "Mejores playas cerca de ti" — geolocalización automática + meteo
// en vivo + score real 0-100 + razones ("Agua cálida", "Sin viento").
//
// Flujo:
//   1. Monta → pide geolocalización (auto si ya granted, popup si prompt)
//   2. Carga playas.json → encuentra las 12 más cercanas (<100km)
//   3. Fetcha meteo real de Open-Meteo para cada una (en paralelo)
//   4. Calcula score con calcularPlayaScore (misma función que el server)
//   5. Ordena por score desc → muestra top 8 con badge + reasons
import { useEffect, useState } from 'react'
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
  try {
    const h = new Date().getHours()
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`),
    ])
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    return {
      olas:   parseFloat((marine?.hourly?.wave_height?.[h] ?? 0.4).toFixed(1)),
      agua:   Math.round(marine?.hourly?.sea_surface_temperature?.[h] ?? 18),
      viento: Math.round(meteo?.hourly?.wind_speed_10m?.[h] ?? 10),
      uv:     Math.round(meteo?.hourly?.uv_index?.[h] ?? 3),
    }
  } catch {
    return { agua: 18, olas: 0.4, viento: 10, uv: 3 }
  }
}

const GEO_OPTS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 600000,
}

type Estado = 'idle' | 'asking' | 'loading_meteo' | 'ready' | 'denied'

export default function TopCercanas() {
  const [estado, setEstado] = useState<Estado>('idle')
  const [results, setResults] = useState<ScoredNearby[]>([])
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) { setEstado('denied'); return }

    const tryGeo = () => {
      setEstado('asking')
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude)
          setUserLng(pos.coords.longitude)
          loadAndScore(pos.coords.latitude, pos.coords.longitude)
        },
        () => setEstado('denied'),
        GEO_OPTS,
      )
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(r => {
        if (r.state === 'denied') setEstado('denied')
        else tryGeo()
      }).catch(tryGeo)
    } else {
      tryGeo()
    }
  }, [])

  async function loadAndScore(lat: number, lng: number) {
    setEstado('loading_meteo')
    try {
      const resp = await fetch('/data/playas.json')
      const playas: Playa[] = await resp.json()

      // Find 12 closest coastal beaches
      const nearby = playas
        .filter(p => p.lat && p.lng)
        .map(p => ({ p, dist: haversine(lat, lng, p.lat, p.lng) }))
        .filter(x => x.dist < 100)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 12)

      if (nearby.length === 0) { setEstado('denied'); return }

      // Fetch meteo for all 12 in parallel
      const meteos = await Promise.all(
        nearby.map(x => fetchMeteo(x.p.lat, x.p.lng))
      )

      // Score each
      const scored: ScoredNearby[] = nearby.map((x, i) => ({
        playa: x.p,
        distKm: x.dist,
        meteo: meteos[i],
        ps: calcularPlayaScore(x.p, meteos[i]),
      }))

      // Sort by score desc (best first)
      scored.sort((a, b) => b.ps.score - a.ps.score)

      setResults(scored.slice(0, 8))
      setEstado('ready')
    } catch {
      setEstado('denied')
    }
  }

  if (estado === 'denied' || estado === 'idle') return null

  if (estado === 'asking' || estado === 'loading_meteo') {
    return (
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          background: 'color-mix(in srgb, var(--accent) 6%, var(--card-bg))',
          border: '1.5px solid var(--line)', borderRadius: 14,
          padding: '1rem 1.25rem',
        }}>
          <MapPin size={20} weight="bold" color="var(--accent)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: '.88rem', color: 'var(--ink)', fontWeight: 600, flex: 1 }}>
            {estado === 'asking'
              ? 'Activa tu ubicación para ver las mejores playas cerca de ti'
              : 'Analizando condiciones del mar en playas cercanas…'}
          </p>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2.5px solid var(--accent)', borderTopColor: 'transparent',
            animation: 'spin .6s linear infinite', flexShrink: 0,
          }} role="status" aria-label="Cargando" />
        </div>
      </section>
    )
  }

  if (results.length === 0) return null

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
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
        {userLat && userLng && (
          <Link
            href={`/buscar?lat=${userLat.toFixed(4)}&lng=${userLng.toFixed(4)}&orden=cercanas`}
            style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
          >
            Ver todas →
          </Link>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
              position: 'relative',
            }}
          >
            {/* Score badge + rank */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: '1rem',
                  color: 'var(--accent)', lineHeight: 1,
                }}>
                  #{i + 1}
                </span>
                <span style={{
                  background: r.ps.color, color: '#fff',
                  fontFamily: 'var(--font-serif)', fontWeight: 900,
                  fontSize: '.88rem', lineHeight: 1,
                  padding: '.3rem .5rem', borderRadius: 8,
                  display: 'inline-flex', alignItems: 'center', gap: '.25rem',
                }}>
                  {r.ps.score}
                  <span style={{ fontSize: '.58rem', fontWeight: 600, opacity: .8 }}>/100</span>
                </span>
                <span style={{
                  fontSize: '.75rem', fontWeight: 700, color: r.ps.color,
                }}>
                  {r.ps.label}
                </span>
              </div>
              <span style={{
                fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)',
                background: 'var(--metric-bg)', border: '1px solid var(--line)',
                padding: '.15rem .5rem', borderRadius: 100,
              }}>
                {r.distKm < 1 ? `${Math.round(r.distKm * 1000)}m` : `${r.distKm.toFixed(1)}km`}
              </span>
            </div>

            {/* Name + location */}
            <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.2, marginBottom: '.15rem' }}>
              {r.playa.nombre}
            </div>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginBottom: '.4rem' }}>
              {r.playa.municipio} · {r.playa.provincia}
            </div>

            {/* WHY it's good today — the key differentiator */}
            {r.ps.reasons.length > 0 && (
              <div style={{
                fontSize: '.78rem', color: r.ps.color, fontWeight: 600,
                lineHeight: 1.45, marginBottom: '.5rem',
                padding: '.4rem .6rem',
                background: `${r.ps.color}0d`,
                borderRadius: 8,
                borderLeft: `3px solid ${r.ps.color}`,
              }}>
                {r.ps.reasons.join(' · ')}
              </div>
            )}

            {/* Meteo data */}
            <div style={{
              display: 'flex', gap: '.65rem', fontSize: '.74rem', color: 'var(--muted)',
              marginBottom: '.45rem',
            }}>
              <span><strong style={{ color: 'var(--ink)' }}>{r.meteo.agua}°C</strong> agua</span>
              <span><strong style={{ color: 'var(--ink)' }}>{r.meteo.olas}m</strong> olas</span>
              <span><strong style={{ color: 'var(--ink)' }}>{r.meteo.viento}</strong> km/h</span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginTop: 'auto' }}>
              {r.playa.bandera && (
                <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.15rem .4rem', borderRadius: 4 }}>
                  Bandera Azul
                </span>
              )}
              {r.playa.socorrismo && (
                <span style={{ fontSize: '.68rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.12rem .35rem', borderRadius: 4 }}>
                  Socorrismo
                </span>
              )}
              {r.playa.parking && (
                <span style={{ fontSize: '.68rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.12rem .35rem', borderRadius: 4 }}>
                  Parking
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
