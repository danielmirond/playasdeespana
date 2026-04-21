'use client'
// src/app/rutas/configurar/ConfiguradorRuta.tsx
// Builder interactivo de rutas: el usuario elige costa, nº de paradas,
// filtros → ve el resultado en tiempo real con mapa y link a Google Maps.
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Playa } from '@/types'
import { COSTAS, type CostaDef } from '@/lib/rutas'
import { MapPin } from '@phosphor-icons/react'

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function staticScore(p: Playa): number {
  let s = 40
  if (p.bandera) s += 15
  if (p.socorrismo) s += 12
  if (p.duchas) s += 8
  if (p.parking) s += 8
  if (p.accesible) s += 5
  if (p.aseos) s += 3
  const g = (p.grado_ocupacion ?? '').toLowerCase()
  if (g.includes('bajo')) s += 8
  else if (g.includes('alto')) s -= 3
  return Math.min(100, s)
}

function orderGeographically(beaches: Playa[]): Playa[] {
  if (beaches.length <= 1) return beaches
  const remaining = [...beaches]
  remaining.sort((a, b) => b.lat - a.lat || a.lng - b.lng)
  const ordered: Playa[] = [remaining.shift()!]
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1]
    let bestIdx = 0, bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(last.lat, last.lng, remaining[i].lat, remaining[i].lng)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0])
  }
  return ordered
}

function buildGoogleMapsUrl(stops: Playa[]): string {
  if (stops.length === 0) return ''
  const origin = `${stops[0].lat},${stops[0].lng}`
  const dest = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`
  const wp = stops.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${wp ? `&waypoints=${wp}` : ''}&travelmode=driving`
}

interface Parada {
  playa: Playa
  distFromPrev: number
  score: number
}

const FILTROS = [
  { key: 'bandera', label: 'Bandera Azul' },
  { key: 'socorrismo', label: 'Socorrismo' },
  { key: 'parking', label: 'Parking' },
  { key: 'accesible', label: 'Accesible' },
  { key: 'duchas', label: 'Duchas' },
  { key: 'perros', label: 'Perros' },
  { key: 'nudista', label: 'Nudista' },
]

export default function ConfiguradorRuta() {
  const [playas, setPlayas] = useState<Playa[]>([])
  const [loading, setLoading] = useState(true)
  const [costaSlug, setCostaSlug] = useState('')
  const [numParadas, setNumParadas] = useState(5)
  const [filtros, setFiltros] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/data/playas.json')
      .then(r => r.json())
      .then((d: Playa[]) => { setPlayas(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const costaSeleccionada = COSTAS.find(c => c.slug === costaSlug) ?? null

  const resultado = useMemo((): { paradas: Parada[]; totalKm: number; mapsUrl: string } | null => {
    if (playas.length === 0) return null

    // Filter by costa
    let pool = playas.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
    if (costaSeleccionada) {
      pool = pool.filter(p => costaSeleccionada.provincias.includes(p.provincia))
    }

    // Apply service filters
    for (const [k, v] of Object.entries(filtros)) {
      if (v) pool = pool.filter(p => (p as any)[k])
    }

    if (pool.length < numParadas) return null

    // Pick top N by score
    const top = pool
      .map(p => ({ p, score: staticScore(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, numParadas)

    const ordered = orderGeographically(top.map(x => x.p))

    const paradas: Parada[] = ordered.map((p, i) => ({
      playa: p,
      distFromPrev: i === 0 ? 0 : haversine(ordered[i - 1].lat, ordered[i - 1].lng, p.lat, p.lng),
      score: top.find(x => x.p.slug === p.slug)!.score,
    }))

    return {
      paradas,
      totalKm: Math.round(paradas.reduce((s, p) => s + p.distFromPrev, 0) * 10) / 10,
      mapsUrl: buildGoogleMapsUrl(ordered),
    }
  }, [playas, costaSeleccionada, numParadas, filtros])

  const toggleFiltro = (key: string) => {
    setFiltros(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      return next
    })
  }

  return (
    <div>
      {/* Controles */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--line)',
        borderRadius: 6, padding: '1.25rem', marginBottom: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        {/* Costa selector */}
        <div>
          <label htmlFor="costa-select" style={{
            display: 'block', fontSize: '.75rem', fontWeight: 700,
            color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '.06em', marginBottom: '.4rem',
          }}>
            Costa
          </label>
          <select
            id="costa-select"
            value={costaSlug}
            onChange={e => setCostaSlug(e.target.value)}
            style={{
              width: '100%', padding: '.65rem .85rem',
              border: '1px solid var(--line)', borderRadius: 4,
              background: 'var(--metric-bg)', color: 'var(--ink)',
              fontSize: '.88rem', fontFamily: 'inherit',
              minHeight: 44, cursor: 'pointer',
            }}
          >
            <option value="">Toda España</option>
            {['cantabrica', 'atlantica', 'mediterranea', 'insular'].map(zona => (
              <optgroup key={zona} label={zona === 'cantabrica' ? 'Cantábrica' : zona === 'atlantica' ? 'Atlántica' : zona === 'mediterranea' ? 'Mediterránea' : 'Islas'}>
                {COSTAS.filter(c => c.zona === zona).map(c => (
                  <option key={c.slug} value={c.slug}>{c.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Nº de paradas */}
        <div>
          <label htmlFor="paradas-range" style={{
            display: 'block', fontSize: '.75rem', fontWeight: 700,
            color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '.06em', marginBottom: '.4rem',
          }}>
            Paradas: <strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>{numParadas}</strong>
          </label>
          <input
            id="paradas-range"
            type="range"
            min={3} max={10}
            value={numParadas}
            onChange={e => setNumParadas(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--muted)' }}>
            <span>3</span><span>10</span>
          </div>
        </div>

        {/* Filtros */}
        <div>
          <span style={{
            display: 'block', fontSize: '.75rem', fontWeight: 700,
            color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '.06em', marginBottom: '.4rem',
          }}>
            Solo playas con:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
            {FILTROS.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleFiltro(f.key)}
                aria-pressed={!!filtros[f.key]}
                style={{
                  padding: '.45rem .85rem', borderRadius: 100,
                  border: '1px solid',
                  borderColor: filtros[f.key] ? 'var(--accent)' : 'var(--line)',
                  background: filtros[f.key] ? 'var(--accent)' : 'transparent',
                  color: filtros[f.key] ? '#fff' : 'var(--muted)',
                  fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
                  minHeight: 40, transition: 'all .15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      {loading && (
        <div role="status" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          Cargando playas…
        </div>
      )}

      {!loading && !resultado && (
        <div style={{
          textAlign: 'center', padding: '2rem',
          background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)',
          borderRadius: 6, color: '#b91c1c', fontSize: '.88rem',
        }}>
          No hay suficientes playas con esos criterios.
          {costaSeleccionada ? ` Prueba otra costa o reduce las paradas.` : ' Reduce los filtros.'}
        </div>
      )}

      {resultado && (
        <>
          {/* Stats */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            marginBottom: '1rem',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink)' }}>
              {costaSeleccionada ? `Ruta por la ${costaSeleccionada.nombre}` : `Ruta de ${numParadas} playas por España`}
            </div>
            <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
              {resultado.paradas.length} paradas · {resultado.totalKm} km
            </span>
          </div>

          {/* CTA Google Maps */}
          <a
            href={resultado.mapsUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'var(--accent)', color: '#fff',
              padding: '.75rem 1.25rem', borderRadius: 6,
              fontSize: '.92rem', fontWeight: 800, textDecoration: 'none',
              minHeight: 44, marginBottom: '1.5rem',
              boxShadow: '0 4px 14px rgba(107,64,10,.2)',
            }}
          >
            🗺️ Abrir en Google Maps
          </a>

          {/* Itinerario */}
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
            {resultado.paradas.map((p, i) => {
              const sc = p.score >= 75 ? '#22c55e' : p.score >= 55 ? '#eab308' : p.score >= 35 ? '#f97316' : '#ef4444'
              return (
                <li key={p.playa.slug} style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 32 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: costaSeleccionada?.color && costaSeleccionada.color !== '#f8fafc' ? costaSeleccionada.color : 'var(--accent)',
                      color: '#fff', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.88rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i + 1}
                    </div>
                    {i < resultado.paradas.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 16, background: 'var(--line)', margin: '.25rem 0' }} />
                    )}
                  </div>
                  <Link href={`/playas/${p.playa.slug}`} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '.75rem',
                    background: 'var(--card-bg)', border: '1px solid var(--line)',
                    borderRadius: 6, padding: '.85rem 1rem',
                    textDecoration: 'none', transition: 'all .15s',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{p.playa.nombre}</div>
                      <div style={{ fontSize: '.74rem', color: 'var(--muted)' }}>
                        {p.playa.municipio} · {p.playa.provincia}
                        {p.distFromPrev > 0 && <span style={{ fontWeight: 700, color: 'var(--accent)', marginLeft: '.3rem' }}>· {p.distFromPrev.toFixed(1)} km</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '.2rem', flexWrap: 'wrap', marginTop: '.25rem' }}>
                        {p.playa.bandera && <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.1rem .3rem', borderRadius: 4 }}>B. Azul</span>}
                        {p.playa.socorrismo && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Socorr.</span>}
                        {p.playa.parking && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>P</span>}
                      </div>
                    </div>
                    <span style={{ background: sc, color: '#fff', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.82rem', padding: '.25rem .45rem', borderRadius: 6, flexShrink: 0 }}>
                      {p.score}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
