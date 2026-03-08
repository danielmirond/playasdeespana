'use client'
// src/components/playa/TraficoSection.tsx
import { useEffect, useState } from 'react'
import type { Playa } from '@/types'

interface Props { playa: Playa }

interface TraficoData {
  fluidez:     number   // 0-100 (100 = libre)
  velocidad:   number   // km/h actual
  velocidadRef: number  // km/h sin tráfico
  nivel:       'Libre' | 'Fluido' | 'Denso' | 'Colapso'
  color:       string
}

interface Parking {
  nombre:    string
  direccion: string
  distancia: number
  plazas:    number | null
  precio:    string | null
  abierto:   boolean | null
  rating:    number | null
  googleId:  string | null
  lat:       number
  lng:       number
}

// Afluencia sintética inteligente por hora, día y mes
function calcAfluencia(hora: number, diaSemana: number, mes: number): number {
  const esTemporadaAlta   = mes >= 6 && mes <= 8
  const esTemporadaMedia  = mes === 5 || mes === 9
  const esFinDeSemana     = diaSemana === 0 || diaSemana === 6

  // Curva base por hora
  const curva: Record<number, number> = {
    0:5, 1:3, 2:2, 3:2, 4:3, 5:5, 6:10, 7:18, 8:30, 9:45,
    10:62, 11:78, 12:88, 13:82, 14:90, 15:95, 16:92, 17:85,
    18:70, 19:50, 20:35, 21:22, 22:14, 23:8,
  }
  let base = curva[hora] ?? 50

  // Multiplicadores
  if (esTemporadaAlta)  base = Math.min(100, base * 1.4)
  if (esTemporadaMedia) base = Math.min(100, base * 1.15)
  if (esFinDeSemana)    base = Math.min(100, base * 1.25)

  // Añadir algo de ruido realista
  const ruido = (Math.sin(hora * 7 + 3) * 5)
  return Math.min(100, Math.max(0, Math.round(base + ruido)))
}

function nivelAfluencia(pct: number): { label: string; color: string; bg: string } {
  if (pct >= 85) return { label: 'Llena',      color: '#ef4444', bg: '#fef2f2' }
  if (pct >= 65) return { label: 'Muy concurrida', color: '#f59e0b', bg: '#fffbeb' }
  if (pct >= 40) return { label: 'Concurrida', color: '#3b82f6', bg: '#eff6ff' }
  if (pct >= 15) return { label: 'Tranquila',  color: '#22c55e', bg: '#f0fdf4' }
  return              { label: 'Vacía',        color: '#9ca3af', bg: '#f9fafb' }
}

async function fetchTrafico(lat: number, lng: number): Promise<TraficoData | null> {
  const key = process.env.NEXT_PUBLIC_TOMTOM_KEY
  if (!key) return null
  try {
    // TomTom Flow Segment Data — punto más cercano a la playa
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&key=${key}&unit=KMPH`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    const seg = data.flowSegmentData
    if (!seg) return null
    const fluidez = Math.round((seg.currentSpeed / seg.freeFlowSpeed) * 100)
    const nivel: TraficoData['nivel'] =
      fluidez >= 80 ? 'Libre' :
      fluidez >= 55 ? 'Fluido' :
      fluidez >= 30 ? 'Denso' : 'Colapso'
    const color =
      nivel === 'Libre'    ? '#22c55e' :
      nivel === 'Fluido'   ? '#3b82f6' :
      nivel === 'Denso'    ? '#f59e0b' : '#ef4444'
    return { fluidez, velocidad: seg.currentSpeed, velocidadRef: seg.freeFlowSpeed, nivel, color }
  } catch { return null }
}

async function fetchParkings(lat: number, lng: number): Promise<Parking[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? process.env.GOOGLE_PLACES_KEY
  if (!key) return []
  try {
    const url = `/api/parkings?lat=${lat}&lng=${lng}`
    const res = await fetch(url)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default function TraficoSection({ playa }: Props) {
  const now        = new Date()
  const horaActual = now.getHours()
  const dia        = now.getDay()
  const mes        = now.getMonth() + 1

  // Afluencia por horas (todo el día)
  const horas = Array.from({ length: 24 }, (_, h) => ({
    h,
    label: h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
    pct: calcAfluencia(h, dia, mes),
    esAhora: h === horaActual,
  }))

  const ahoraData  = horas[horaActual]
  const nivelAhora = nivelAfluencia(ahoraData.pct)

  // Mejor hora para ir (mínimo entre 8h y 20h)
  const mejorHora = horas
    .filter(h => h.h >= 7 && h.h <= 20)
    .reduce((min, h) => h.pct < min.pct ? h : min, horas[7])

  const [trafico, setTrafico]   = useState<TraficoData | null>(null)
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loadingP, setLoadingP] = useState(true)
  const [loadingT, setLoadingT] = useState(true)
  const [tabActivo, setTabActivo] = useState<'afluencia' | 'trafico' | 'parking'>('afluencia')

  useEffect(() => {
    fetchTrafico(playa.lat, playa.lng).then(d => { setTrafico(d); setLoadingT(false) })
    fetchParkings(playa.lat, playa.lng).then(data => {
      setParkings(data)
      setLoadingP(false)
    })
  }, [playa.lat, playa.lng])

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}`
  const gmTransit = `https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=transit`
  const gmBike    = `https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=bicycling`

  return (
    <div style={{
      background: 'var(--card-bg,#faf6ef)', border: '1.5px solid var(--line,#e8dcc8)',
      borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem',
    }} id="s-trafico">

      {/* CABECERA */}
      <div style={{ padding: '1rem 1.25rem .75rem', borderBottom: '1px solid var(--line,#e8dcc8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink,#2a1a08)' }}>🚗 Cómo llegar</span>
          <span style={{ fontSize: '.7rem', color: 'var(--muted,#8a7560)' }}>Tiempo real</span>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '.35rem', marginTop: '.65rem' }}>
          {(['afluencia', 'trafico', 'parking'] as const).map(tab => (
            <button key={tab} onClick={() => setTabActivo(tab)} style={{
              fontSize: '.65rem', fontWeight: 700, padding: '.22rem .65rem',
              borderRadius: '100px', border: '1.5px solid',
              borderColor: tabActivo === tab ? 'var(--accent,#b06820)' : 'var(--line,#e8dcc8)',
              background: tabActivo === tab ? 'rgba(176,104,32,.1)' : 'transparent',
              color: tabActivo === tab ? 'var(--accent,#b06820)' : 'var(--muted,#8a7560)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {tab === 'afluencia' ? '👥 Afluencia' : tab === 'trafico' ? '🚗 Tráfico' : '🅿️ Aparcamiento'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>

        {/* TAB AFLUENCIA */}
        {tabActivo === 'afluencia' && (
          <div>
            {/* Estado ahora */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '.75rem 1rem', borderRadius: '12px',
              background: nivelAhora.bg, marginBottom: '1rem',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: nivelAhora.color, lineHeight: 1 }}>{ahoraData.pct}%</div>
                <div style={{ fontSize: '.6rem', color: 'var(--muted,#8a7560)', marginTop: '.1rem' }}>ocupación</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.85rem', color: nivelAhora.color }}>{nivelAhora.label}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted,#8a7560)', marginTop: '.15rem' }}>
                  Mejor hora hoy: <strong style={{ color: 'var(--accent,#b06820)' }}>{mejorHora.label}</strong> ({mejorHora.pct}% ocupación)
                </div>
              </div>
            </div>

            {/* Gráfico horas */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '60px', marginBottom: '.5rem' }}>
              {horas.map(h => {
                const n = nivelAfluencia(h.pct)
                return (
                  <div key={h.h} title={`${h.label}: ${h.pct}%`} style={{
                    flex: 1, height: `${Math.max(6, h.pct * 0.58)}px`,
                    background: h.esAhora ? 'var(--accent,#b06820)' : n.color,
                    borderRadius: '3px 3px 0 0', opacity: h.esAhora ? 1 : 0.55,
                    cursor: 'default', transition: 'height .2s',
                  }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.55rem', color: 'var(--muted,#8a7560)' }}>
              <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
            </div>

            <div style={{ fontSize: '.65rem', color: 'var(--muted,#8a7560)', marginTop: '.5rem', fontStyle: 'italic' }}>
              Estimación basada en patrones de temporada · {mes >= 6 && mes <= 8 ? 'Temporada alta' : mes === 5 || mes === 9 ? 'Temporada media' : 'Temporada baja'} · {dia === 0 || dia === 6 ? 'Fin de semana' : 'Día laborable'}
            </div>
          </div>
        )}

        {/* TAB TRÁFICO */}
        {tabActivo === 'trafico' && (
          <div>
            {/* Estado tráfico TomTom */}
            {loadingT ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted,#8a7560)', fontSize: '.8rem' }}>Consultando tráfico…</div>
            ) : trafico ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '.75rem 1rem', borderRadius: '12px',
                background: trafico.color + '12', marginBottom: '1rem',
              }}>
                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: trafico.color, lineHeight: 1 }}>{trafico.velocidad}</div>
                  <div style={{ fontSize: '.58rem', color: 'var(--muted,#8a7560)' }}>km/h actual</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.85rem', color: trafico.color }}>{trafico.nivel}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted,#8a7560)', marginTop: '.15rem' }}>
                    Velocidad libre: {trafico.velocidadRef} km/h · Fluidez: {trafico.fluidez}%
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '.6rem', color: 'var(--muted,#8a7560)' }}>TomTom</div>
              </div>
            ) : (
              <div style={{
                padding: '.75rem 1rem', borderRadius: '12px',
                background: '#22c55e12', marginBottom: '1rem', fontSize: '.8rem', color: '#166534',
              }}>
                🟢 Sin datos de tráfico — añade tu clave TomTom en <code>.env.local</code>
              </div>
            )}

            {/* Botones cómo llegar */}
            <div style={{ fontWeight: 600, fontSize: '.75rem', color: 'var(--ink,#2a1a08)', marginBottom: '.6rem' }}>Cómo llegar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle('#b06820', '#fff')}>
                🚗 En coche — abrir en Google Maps
              </a>
              <a href={gmTransit} target="_blank" rel="noopener noreferrer" style={btnStyle('rgba(176,104,32,.1)', '#b06820', true)}>
                🚌 En transporte público
              </a>
              <a href={gmBike} target="_blank" rel="noopener noreferrer" style={btnStyle('rgba(176,104,32,.1)', '#b06820', true)}>
                🚲 En bicicleta
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=walking`}
                 target="_blank" rel="noopener noreferrer" style={btnStyle('rgba(176,104,32,.1)', '#b06820', true)}>
                🚶 A pie
              </a>
            </div>

            {/* Embed mapa mini */}
            <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line,#e8dcc8)' }}>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCZIlwwJKY6q0mpXLE0UYZ0nSsByi7uWpk&q=${playa.lat},${playa.lng}&zoom=14`}
                width="100%" height="200" style={{ border: 'none', display: 'block' }}
                title={`Mapa ${playa.nombre}`} loading="lazy"
              />
            </div>
          </div>
        )}

        {/* TAB APARCAMIENTO */}
        {tabActivo === 'parking' && (
          <div>
            {loadingP ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted,#8a7560)', fontSize: '.8rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: 'var(--accent)', animation: 'spin .7s linear infinite', margin: '0 auto .5rem' }}/>
                Buscando aparcamientos cercanos…
              </div>
            ) : parkings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {parkings.map((p, i) => (
                  <a key={i}
                     href={p.googleId ? `https://www.google.com/maps/place/?q=place_id:${p.googleId}` : `https://www.google.com/maps/search/parking+near+${playa.lat},${playa.lng}`}
                     target="_blank" rel="noopener noreferrer"
                     style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.65rem .85rem', borderRadius: '10px', background: 'rgba(176,104,32,.05)', border: '1px solid var(--line,#e8dcc8)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '1.3rem' }}>🅿️</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--ink,#2a1a08)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                        {p.abierto !== null && (
                          <span style={{ fontSize: '.58rem', fontWeight: 700, flexShrink: 0,
                            color: p.abierto ? '#16a34a' : '#dc2626',
                            background: p.abierto ? '#f0fdf4' : '#fef2f2',
                            padding: '.08rem .35rem', borderRadius: '4px' }}>
                            {p.abierto ? 'Abierto' : 'Cerrado'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '.65rem', color: 'var(--muted,#8a7560)', marginTop: '.1rem' }}>
                        {p.distancia}m · {p.precio ?? 'Precio n/d'}
                        {p.rating && <span> · ⭐{p.rating}</span>}
                      </div>
                      {p.direccion && <div style={{ fontSize: '.6rem', color: 'var(--muted,#8a7560)', marginTop: '.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccion}</div>}
                    </div>
                    <span style={{ fontSize: '.7rem', color: 'var(--accent,#b06820)', fontWeight: 600, flexShrink: 0 }}>Ver →</span>
                  </a>
                ))}
              </div>
            ) : (
              // Fallback sintético — sin datos reales
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {[
                  { nombre: `Parking ${playa.nombre}`, dist: 150, plazas: 80, precio: '2€/h' },
                  { nombre: 'Zona azul centro', dist: 400, plazas: null, precio: '1.5€/h' },
                  { nombre: 'Aparcamiento gratuito', dist: 900, plazas: 200, precio: 'Gratis' },
                ].map((p, i) => (
                  <a key={i}
                     href={`https://www.google.com/maps/search/parking+near+${playa.lat},${playa.lng}`}
                     target="_blank" rel="noopener noreferrer"
                     style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.65rem .85rem', borderRadius: '10px', background: 'rgba(176,104,32,.05)', border: '1px solid var(--line,#e8dcc8)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '1.3rem' }}>🅿️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--ink,#2a1a08)' }}>{p.nombre}</div>
                      <div style={{ fontSize: '.68rem', color: 'var(--muted,#8a7560)', marginTop: '.1rem' }}>
                        ~{p.dist}m · {p.plazas ? `${p.plazas} plazas` : 'Plazas variables'} · {p.precio}
                      </div>
                    </div>
                    <span style={{ fontSize: '.7rem', color: 'var(--accent,#b06820)', fontWeight: 600 }}>Ver →</span>
                  </a>
                ))}
                <div style={{ fontSize: '.62rem', color: 'var(--muted,#8a7560)', fontStyle: 'italic', marginTop: '.25rem' }}>
                  Datos estimados · Configura Google Places para datos reales
                </div>
              </div>
            )}

            <a href={`https://www.google.com/maps/search/parking+near+${playa.lat},${playa.lng}`}
               target="_blank" rel="noopener noreferrer"
               style={{ ...btnStyle('rgba(176,104,32,.1)', '#b06820', true), display: 'block', textAlign: 'center', marginTop: '.75rem', textDecoration: 'none' }}>
              Ver todos los aparcamientos en Google Maps →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function btnStyle(bg: string, color: string, outline = false): React.CSSProperties {
  return {
    display: 'block', padding: '.55rem .85rem',
    borderRadius: '10px', border: outline ? `1.5px solid rgba(176,104,32,.25)` : 'none',
    background: bg, color, fontSize: '.75rem', fontWeight: 600,
    textDecoration: 'none', cursor: 'pointer', textAlign: 'left',
  }
}
