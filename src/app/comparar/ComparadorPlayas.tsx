'use client'
// src/app/comparar/ComparadorPlayas.tsx
// Side-by-side comparison of 2-3 beaches with live scoring.
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Playa } from '@/types'
import { calcularPlayaScore, type PlayaScore, type MeteoInput } from '@/lib/scoring'

interface BeachData {
  playa: Playa
  meteo: MeteoInput | null
  ps: PlayaScore | null
  loading: boolean
}

async function fetchMeteo(lat: number, lng: number): Promise<MeteoInput> {
  try {
    const h = new Date().getHours()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { signal: controller.signal }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { signal: controller.signal }),
    ])
    clearTimeout(timer)
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    return {
      olas: parseFloat((marine?.hourly?.wave_height?.[h] ?? 0.4).toFixed(1)),
      agua: Math.round(marine?.hourly?.sea_surface_temperature?.[h] ?? 18),
      viento: Math.round(meteo?.hourly?.wind_speed_10m?.[h] ?? 10),
      uv: Math.round(meteo?.hourly?.uv_index?.[h] ?? 3),
    }
  } catch { return { agua: 18, olas: 0.4, viento: 10, uv: 3 } }
}

export default function ComparadorPlayas() {
  const [playas, setPlayas] = useState<Playa[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [slots, setSlots] = useState<BeachData[]>([])
  const [showSearch, setShowSearch] = useState<number | null>(null)

  useEffect(() => {
    fetch('/data/playas.json').then(r => r.json()).then((d: Playa[]) => { setPlayas(d); setLoading(false) })
  }, [])

  const suggestions = query.length >= 2
    ? playas.filter(p => {
        const h = [p.nombre, p.municipio, p.provincia].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return h.includes(query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
      }).slice(0, 8)
    : []

  const addBeach = useCallback(async (playa: Playa, slotIdx: number) => {
    setShowSearch(null)
    setQuery('')
    const newSlots = [...slots]
    newSlots[slotIdx] = { playa, meteo: null, ps: null, loading: true }
    setSlots(newSlots)

    const meteo = await fetchMeteo(playa.lat, playa.lng)
    const ps = calcularPlayaScore(playa, meteo)
    setSlots(prev => {
      const updated = [...prev]
      if (updated[slotIdx]?.playa.slug === playa.slug) {
        updated[slotIdx] = { playa, meteo, ps, loading: false }
      }
      return updated
    })
  }, [slots])

  const removeSlot = (idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx))
  }

  const canAdd = slots.length < 3

  return (
    <div>
      {/* Slots */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(slots.length, 1)}, 1fr)${canAdd ? ' auto' : ''}`,
        gap: '.75rem', marginBottom: '1.5rem',
      }}>
        {slots.map((s, i) => (
          <div key={s.playa.slug} style={{
            background: 'var(--card-bg)', border: '1px solid var(--line)',
            borderRadius: 6, padding: '1.1rem', position: 'relative',
            display: 'flex', flexDirection: 'column', gap: '.5rem',
          }}>
            <button onClick={() => removeSlot(i)} style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--metric-bg)', border: '1px solid var(--line)',
              cursor: 'pointer', fontSize: '.75rem', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} aria-label="Quitar">✕</button>

            {/* Score */}
            {s.ps && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                <span style={{
                  background: s.ps.color, color: '#fff',
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '1.5rem', padding: '.4rem .6rem', borderRadius: 4,
                }}>
                  {s.ps.score}
                </span>
                <span style={{ fontWeight: 800, color: s.ps.color, fontSize: '.92rem' }}>{s.ps.label}</span>
              </div>
            )}
            {s.loading && <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Cargando score…</div>}

            <Link href={`/playas/${s.playa.slug}`} style={{
              fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)',
              fontFamily: 'var(--font-serif)', textDecoration: 'none',
            }}>{s.playa.nombre}</Link>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{s.playa.municipio} · {s.playa.provincia}</div>

            {/* Factors */}
            {s.ps?.factors && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
                {s.ps.factors.map(f => (
                  <span key={f.icon} style={{
                    fontSize: '.68rem', fontWeight: 700, color: f.color,
                    background: `${f.color}12`, border: `1px solid ${f.color}30`,
                    padding: '.15rem .4rem', borderRadius: 6,
                  }}>{f.label}</span>
                ))}
              </div>
            )}

            {/* Meteo */}
            {s.meteo && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.35rem', fontSize: '.78rem' }}>
                <div><strong style={{ color: 'var(--ink)' }}>{s.meteo.agua}°C</strong> <span style={{ color: 'var(--muted)' }}>agua</span></div>
                <div><strong style={{ color: 'var(--ink)' }}>{s.meteo.olas}m</strong> <span style={{ color: 'var(--muted)' }}>olas</span></div>
                <div><strong style={{ color: 'var(--ink)' }}>{s.meteo.viento}km/h</strong> <span style={{ color: 'var(--muted)' }}>viento</span></div>
                <div><strong style={{ color: 'var(--ink)' }}>UV {s.meteo.uv}</strong></div>
              </div>
            )}

            {/* Services */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.2rem', marginTop: 'auto' }}>
              {s.playa.bandera && <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.1rem .3rem', borderRadius: 4 }}>B. Azul</span>}
              {s.playa.socorrismo && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Socorr.</span>}
              {s.playa.parking && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Parking</span>}
              {s.playa.duchas && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Duchas</span>}
              {s.playa.accesible && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>PMR</span>}
            </div>
          </div>
        ))}

        {/* Add slot */}
        {canAdd && (
          <button
            onClick={() => setShowSearch(slots.length)}
            style={{
              background: 'var(--card-bg)', border: '2px dashed var(--line)',
              borderRadius: 6, padding: '2rem 1rem',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '.35rem',
              minHeight: 200, minWidth: 180,
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>+</span>
            <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)' }}>
              Añadir playa
            </span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              {slots.length === 0 ? 'Elige la primera' : `${3 - slots.length} más`}
            </span>
          </button>
        )}
      </div>

      {/* Search overlay */}
      {showSearch !== null && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1rem', marginBottom: '1rem',
        }}>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar playa por nombre…"
            autoFocus
            style={{
              width: '100%', border: '1px solid var(--line)',
              borderRadius: 4, padding: '.65rem .85rem',
              fontSize: '.92rem', fontFamily: 'inherit', color: 'var(--ink)',
              background: 'var(--metric-bg)', minHeight: 44,
            }}
          />
          {suggestions.length > 0 && (
            <div style={{ marginTop: '.5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              {suggestions.map(p => (
                <button key={p.slug} onClick={() => addBeach(p, showSearch)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '.55rem .75rem', borderRadius: 4,
                  border: '1px solid var(--line)', background: 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>+</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => { setShowSearch(null); setQuery('') }} style={{
            marginTop: '.5rem', fontSize: '.78rem', color: 'var(--muted)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>Cancelar</button>
        </div>
      )}

      {/* Winner callout */}
      {slots.length >= 2 && slots.every(s => s.ps) && (
        <div style={{
          background: 'color-mix(in srgb, var(--accent) 6%, var(--card-bg))',
          border: '1px solid var(--line)',
          borderRadius: 6, padding: '1rem 1.25rem',
          textAlign: 'center',
        }}>
          {(() => {
            const sorted = [...slots].filter(s => s.ps).sort((a, b) => (b.ps?.score ?? 0) - (a.ps?.score ?? 0))
            const winner = sorted[0]
            return (
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', fontFamily: 'var(--font-serif)' }}>
                  🏆 Hoy gana: {winner.playa.nombre}
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: '.25rem' }}>
                  Con {winner.ps?.score}/100 — {winner.ps?.reasons.join(', ')}
                </div>
                <Link href={`/playas/${winner.playa.slug}`} style={{
                  display: 'inline-block', marginTop: '.65rem',
                  background: 'var(--accent)', color: '#fff',
                  padding: '.55rem 1rem', borderRadius: 4,
                  fontSize: '.85rem', fontWeight: 800, textDecoration: 'none',
                }}>
                  Ver ficha completa →
                </Link>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
