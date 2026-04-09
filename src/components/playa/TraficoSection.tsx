'use client'
import { Car, Bus, Bicycle, Person, Users, Park, Star } from '@/components/ui/Icons'
import MapaLeaflet from '@/components/ui/MapaLeafletWrapper'
// src/components/playa/TraficoSection.tsx
import { useEffect, useState } from 'react'
import type { Playa } from '@/types'

interface Props { playa: Playa }

interface TraficoData {
  fluidez:     number
  velocidad:   number
  velocidadRef: number
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

// ─── Afluencia realista ───────────────────────────────────────────────────────

const FESTIVOS = new Set([
  '01-01','01-06','04-18','04-19','05-01','08-15',
  '10-12','11-01','12-06','12-08','12-25',
  '04-03','04-04',
])

const ZONA: Record<string, 'med' | 'atl' | 'can' | 'int'> = {
  'Andalucía':'med','Murcia':'med','C. Valenciana':'med','Cataluña':'med','Baleares':'med',
  'País Vasco':'atl','Cantabria':'atl','Asturias':'atl','Galicia':'atl','Navarra':'atl',
  'Canarias':'can',
  'Madrid':'int','Castilla y León':'int','Castilla-La Mancha':'int','Aragón':'int',
  'La Rioja':'int','Extremadura':'int','Ceuta':'med','Melilla':'med',
}

const TEMP_MULT: Record<string, number[]> = {
  med: [0.20,0.22,0.30,0.45,0.65,0.85,1.00,1.00,0.70,0.40,0.22,0.18],
  atl: [0.18,0.20,0.28,0.40,0.60,0.78,0.95,0.98,0.65,0.35,0.20,0.16],
  can: [0.75,0.78,0.80,0.72,0.65,0.80,0.95,0.98,0.82,0.70,0.72,0.75],
  int: [0.05,0.05,0.08,0.15,0.30,0.55,0.90,1.00,0.45,0.15,0.06,0.05],
}

const CURVA_ALTA: Record<number,number> = {
   0:6, 1:4, 2:3, 3:2, 4:3, 5:6,
   6:12,7:22,8:38,9:56,10:70,11:82,
  12:88,13:80,14:92,15:98,16:95,17:88,
  18:75,19:55,20:38,21:24,22:15,23:9,
}
const CURVA_MEDIA: Record<number,number> = {
   0:4, 1:3, 2:2, 3:2, 4:3, 5:5,
   6:9, 7:16,8:28,9:44,10:58,11:72,
  12:78,13:70,14:82,15:88,16:84,17:76,
  18:62,19:44,20:28,21:16,22:9, 23:5,
}
const CURVA_BAJA: Record<number,number> = {
   0:3, 1:2, 2:2, 3:2, 4:3, 5:4,
   6:7, 7:12,8:20,9:32,10:44,11:56,
  12:62,13:55,14:65,15:70,16:66,17:58,
  18:45,19:30,20:18,21:10,22:6, 23:4,
}

function esFestivo(date: Date): boolean {
  const mm = String(date.getMonth() + 1).padStart(2,'0')
  const dd = String(date.getDate()).padStart(2,'0')
  return FESTIVOS.has(`${mm}-${dd}`)
}

function esPuente(diaSemana: number, date: Date): boolean {
  if (diaSemana === 5) {
    const lunes = new Date(date); lunes.setDate(date.getDate() + 3)
    return esFestivo(lunes)
  }
  if (diaSemana === 1) {
    const viernes = new Date(date); viernes.setDate(date.getDate() - 3)
    return esFestivo(viernes)
  }
  return false
}

function calcAfluencia(
  hora: number,
  diaSemana: number,
  mes: number,
  comunidad?: string,
  esUrbana?: boolean,
): number {
  const zona     = ZONA[comunidad ?? ''] ?? 'med'
  const tempMult = TEMP_MULT[zona][mes - 1] ?? 0.5
  const curva    = tempMult >= 0.7 ? CURVA_ALTA : tempMult >= 0.4 ? CURVA_MEDIA : CURVA_BAJA
  let base       = (curva[hora] ?? 50) * tempMult

  const esFinDeSemana = diaSemana === 0 || diaSemana === 6
  if (esFinDeSemana) base *= 1.30

  const hoy = new Date()
  if (esFestivo(hoy))              base *= 1.25
  if (esPuente(diaSemana, hoy))    base *= 1.15
  if (esUrbana) base *= esFinDeSemana ? 1.10 : 1.20

  const ruido = Math.sin(hora * 7 + 3) * 4
  return Math.min(100, Math.max(0, Math.round(base + ruido)))
}

function nivelAfluencia(pct: number): { label: string; color: string; bg: string } {
  if (pct >= 85) return { label: 'Llena',          color: '#ef4444', bg: '#fef2f2' }
  if (pct >= 65) return { label: 'Muy concurrida', color: '#f59e0b', bg: '#fffbeb' }
  if (pct >= 40) return { label: 'Concurrida',     color: '#3b82f6', bg: '#eff6ff' }
  if (pct >= 15) return { label: 'Tranquila',      color: '#22c55e', bg: '#f0fdf4' }
  return               { label: 'Vacía',           color: '#9ca3af', bg: '#f9fafb' }
}

function etiquetaTemporada(mes: number, zona: string): string {
  const mult = TEMP_MULT[zona]?.[mes - 1] ?? 0.5
  if (mult >= 0.7) return 'Temporada alta'
  if (mult >= 0.4) return 'Temporada media'
  return 'Temporada baja'
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchTrafico(lat: number, lng: number): Promise<TraficoData | null> {
  const key = process.env.NEXT_PUBLIC_TOMTOM_KEY
  if (!key) return null
  try {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&key=${key}&unit=KMPH`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    const seg = data.flowSegmentData
    if (!seg) return null
    const fluidez = Math.round((seg.currentSpeed / seg.freeFlowSpeed) * 100)
    const nivel: TraficoData['nivel'] =
      fluidez >= 80 ? 'Libre' : fluidez >= 55 ? 'Fluido' : fluidez >= 30 ? 'Denso' : 'Colapso'
    const color =
      nivel === 'Libre' ? '#22c55e' : nivel === 'Fluido' ? '#3b82f6' :
      nivel === 'Denso' ? '#f59e0b' : '#ef4444'
    return { fluidez, velocidad: seg.currentSpeed, velocidadRef: seg.freeFlowSpeed, nivel, color }
  } catch { return null }
}

async function fetchParkings(lat: number, lng: number): Promise<Parking[]> {
  try {
    const res = await fetch(`/api/parkings?lat=${lat}&lng=${lng}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TraficoSection({ playa }: Props) {
  const now        = new Date()
  const horaActual = now.getHours()
  const dia        = now.getDay()
  const mes        = now.getMonth() + 1

  const zona = ZONA[playa.comunidad ?? ''] ?? 'med'

  const CIUDADES_URBANAS = ['madrid','barcelona','valencia','sevilla','málaga','malaga',
    'cádiz','cadiz','alicante','palma','bilbao','san sebastián','gijón','santander','tarragona']
  const esUrbana = !!(playa.municipio &&
    CIUDADES_URBANAS.some(c => playa.municipio?.toLowerCase().includes(c)))

  const horas = Array.from({ length: 24 }, (_, h) => ({
    h,
    label: h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
    pct: calcAfluencia(h, dia, mes, playa.comunidad, esUrbana),
    esAhora: h === horaActual,
  }))

  const ahoraData  = horas[horaActual]
  const nivelAhora = nivelAfluencia(ahoraData.pct)

  const mejorHora = horas
    .filter(h => h.h >= 7 && h.h <= 20)
    .reduce((min, h) => h.pct < min.pct ? h : min, horas[7])

  const [trafico, setTrafico]     = useState<TraficoData | null>(null)
  const [parkings, setParkings]   = useState<Parking[]>([])
  const [loadingP, setLoadingP]   = useState(true)
  const [loadingT, setLoadingT]   = useState(true)
  const [tabActivo, setTabActivo] = useState<'afluencia' | 'trafico' | 'parking'>('afluencia')

  useEffect(() => {
    fetchTrafico(playa.lat, playa.lng).then(d => { setTrafico(d); setLoadingT(false) })
    fetchParkings(playa.lat, playa.lng).then(data => { setParkings(data); setLoadingP(false) })
  }, [playa.lat, playa.lng])

  const mapsUrl   = `https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}`
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
          <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink,#2a1a08)' }}><Car size={16} weight="bold" color="var(--accent,#b06820)" style={{verticalAlign:'middle',marginRight:6}}/> Tráfico, afluencia y donde aparcar, parking cerca</span>
          <span style={{ fontSize: '.7rem', color: 'var(--muted,#8a7560)' }}>Tiempo real</span>
        </div>
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
              {tab === 'afluencia' ? <><Users size={14}/>&nbsp;Afluencia</> : tab === 'trafico' ? <><Car size={14}/>&nbsp;Tráfico</> : <><Park size={14}/>&nbsp;Aparcamiento</>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>

        {/* TAB AFLUENCIA */}
        {tabActivo === 'afluencia' && (
          <div>
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
              {etiquetaTemporada(mes, zona)} · {dia === 0 || dia === 6 ? 'Fin de semana' : 'Día laborable'}
              {esUrbana ? ' · Playa urbana' : ''}
              {esFestivo(now) ? ' · Festivo' : ''}
            </div>
          </div>
        )}

        {/* TAB TRÁFICO */}
        {tabActivo === 'trafico' && (
          <div>
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
                <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#22c55e', marginRight:6, verticalAlign:'middle' }}/> Sin datos de tráfico disponibles
              </div>
            )}

            <div style={{ fontWeight: 600, fontSize: '.75rem', color: 'var(--ink,#2a1a08)', marginBottom: '.6rem' }}>Tráfico, afluencia y donde aparcar, parking cerca</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle('#b06820', '#fff')}>
                <Car size={16} weight='bold'/> En coche — abrir en Google Maps
              </a>
              <a href={gmTransit} target="_blank" rel="noopener noreferrer" style={btnStyle('rgba(176,104,32,.1)', '#b06820', true)}>
                <Bus size={16} weight='bold'/> En transporte público
              </a>
              <a href={gmBike} target="_blank" rel="noopener noreferrer" style={btnStyle('rgba(176,104,32,.1)', '#b06820', true)}>
                <Bicycle size={16} weight='bold'/> En bicicleta
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=walking`}
                 target="_blank" rel="noopener noreferrer" style={btnStyle('rgba(176,104,32,.1)', '#b06820', true)}>
                <Person size={16} weight='bold'/> A pie
              </a>
            </div>

            <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line,#e8dcc8)' }}>
              <iframe
                src={``}
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
                    <Park size={22} weight='bold' color='var(--accent,#b06820)'/>
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
                        {p.rating && <span> · <Star size={12} weight='fill' color='#f5a623'/>{p.rating}</span>}
                      </div>
                      {p.direccion && <div style={{ fontSize: '.6rem', color: 'var(--muted,#8a7560)', marginTop: '.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccion}</div>}
                    </div>
                    <span style={{ fontSize: '.7rem', color: 'var(--accent,#b06820)', fontWeight: 600, flexShrink: 0 }}>Ver →</span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', fontSize: '.8rem', color: 'var(--muted,#8a7560)' }}>
                No se encontraron aparcamientos cercanos
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