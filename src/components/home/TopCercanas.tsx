'use client'
// src/components/home/TopCercanas.tsx
// Sección "Mejores playas cerca de ti" que se activa automáticamente al
// cargar la home. Pide geolocalización en cuanto monta (el browser muestra
// su diálogo nativo). Si el usuario acepta, muestra las 8 playas más
// cercanas ordenadas por un score estático (servicios + atributos). Si
// deniega o no hay soporte, no renderiza nada (el fallback server-side
// "Top playas hoy" queda visible debajo).
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Playa } from '@/types'
import { MapPin } from '@phosphor-icons/react'

interface PlayaConDist extends Playa {
  distKm: number
  staticScore: number
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function staticScore(p: Playa): number {
  let s = 50
  if (p.bandera) s += 15
  if (p.socorrismo) s += 12
  if (p.duchas) s += 8
  if (p.parking) s += 8
  if (p.accesible) s += 5
  if (p.aseos) s += 3
  const g = (p.grado_ocupacion ?? '').toLowerCase()
  if (g.includes('bajo')) s += 10
  else if (g.includes('alto')) s -= 5
  if (p.descripcion && !p.descripcion_generada) s += 5
  return Math.min(100, s)
}

type Estado = 'idle' | 'asking' | 'granted' | 'denied'

export default function TopCercanas() {
  const [estado, setEstado] = useState<Estado>('idle')
  const [cercanas, setCercanas] = useState<PlayaConDist[]>([])
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) { setEstado('denied'); return }

    // Check if we already have permission (cached from a previous session)
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          // Already granted — get position silently
          setEstado('asking')
          navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTS)
        } else if (result.state === 'prompt') {
          // Show our prompt, then request
          setEstado('asking')
          navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTS)
        } else {
          setEstado('denied')
        }
      }).catch(() => {
        // Permissions API not supported — just try
        setEstado('asking')
        navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTS)
      })
    } else {
      setEstado('asking')
      navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTS)
    }
  }, [])

  const GEO_OPTS: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 600000, // 10 min cache
  }

  function onSuccess(pos: GeolocationPosition) {
    const { latitude, longitude } = pos.coords
    setUserLat(latitude)
    setUserLng(longitude)
    setEstado('granted')

    // Fetch playas.json and find nearest
    fetch('/data/playas.json')
      .then(r => r.json())
      .then((playas: Playa[]) => {
        const conDist: PlayaConDist[] = playas
          .filter(p => p.lat && p.lng)
          .map(p => ({
            ...p,
            distKm: haversine(latitude, longitude, p.lat, p.lng),
            staticScore: staticScore(p),
          }))
          .filter(p => p.distKm < 100) // max 100km
          .sort((a, b) => {
            // Sort by combined: distance weight + score weight
            // Closer + higher score = better
            const distA = Math.max(0, 1 - a.distKm / 100) * 50
            const distB = Math.max(0, 1 - b.distKm / 100) * 50
            return (distB + b.staticScore * 0.5) - (distA + a.staticScore * 0.5)
          })
          .slice(0, 8)

        setCercanas(conDist)
      })
      .catch(() => { /* silencioso */ })
  }

  function onError() {
    setEstado('denied')
  }

  // Don't render anything if denied or no results
  if (estado === 'denied') return null
  if (estado === 'idle') return null

  if (estado === 'asking') {
    return (
      <section style={{
        maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.5rem 0',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          background: 'color-mix(in srgb, var(--accent) 6%, var(--card-bg))',
          border: '1.5px solid var(--line)',
          borderRadius: 14, padding: '1rem 1.25rem',
        }}>
          <MapPin size={20} weight="bold" color="var(--accent)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: '.88rem', color: 'var(--ink)', fontWeight: 600 }}>
            Activa tu ubicación para ver las mejores playas cerca de ti
          </p>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '2px solid var(--accent)', borderTopColor: 'transparent',
            animation: 'spin .6s linear infinite', flexShrink: 0,
          }} aria-label="Esperando ubicación" />
        </div>
      </section>
    )
  }

  if (cercanas.length === 0) return null

  return (
    <section style={{
      maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.5rem 0',
    }}>
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '.6rem',
      }}>
        {cercanas.map((p, i) => (
          <Link
            key={p.slug}
            href={`/playas/${p.slug}`}
            style={{
              display: 'flex', flexDirection: 'column',
              background: 'var(--card-bg)', border: '1.5px solid var(--line)',
              borderRadius: 14, padding: '.85rem 1rem',
              textDecoration: 'none', transition: 'all .15s',
              position: 'relative',
            }}
          >
            {/* Rank + distance */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '.35rem',
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: '1.1rem',
                color: 'var(--accent)', lineHeight: 1,
              }}>
                #{i + 1}
              </span>
              <span style={{
                fontSize: '.72rem', fontWeight: 700,
                color: 'var(--muted)',
                background: 'var(--metric-bg)',
                border: '1px solid var(--line)',
                padding: '.15rem .5rem', borderRadius: 100,
              }}>
                {p.distKm < 1 ? `${Math.round(p.distKm * 1000)}m` : `${p.distKm.toFixed(1)}km`}
              </span>
            </div>

            {/* Name + location */}
            <div style={{
              fontWeight: 800, fontSize: '.92rem', color: 'var(--ink)',
              lineHeight: 1.2, marginBottom: '.2rem',
            }}>
              {p.nombre}
            </div>
            <div style={{
              fontSize: '.74rem', color: 'var(--muted)', marginBottom: '.5rem',
            }}>
              {p.municipio} · {p.provincia}
            </div>

            {/* Badges */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginTop: 'auto',
            }}>
              {p.bandera && (
                <span style={{
                  fontSize: '.68rem', fontWeight: 700, color: 'var(--accent)',
                  background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))',
                  padding: '.15rem .4rem', borderRadius: 4,
                }}>
                  Bandera Azul
                </span>
              )}
              {p.socorrismo && (
                <span style={{
                  fontSize: '.68rem', background: 'var(--metric-bg)',
                  border: '1px solid var(--line)',
                  padding: '.12rem .35rem', borderRadius: 4,
                }}>
                  Socorrismo
                </span>
              )}
              {p.parking && (
                <span style={{
                  fontSize: '.68rem', background: 'var(--metric-bg)',
                  border: '1px solid var(--line)',
                  padding: '.12rem .35rem', borderRadius: 4,
                }}>
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
