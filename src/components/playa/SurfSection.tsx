import { Drop, Waves, Sun, PersonSimpleSwim } from '@phosphor-icons/react'
'use client'
// src/components/playa/SurfSection.tsx
// Sección completa de surf, buceo y actividades acuáticas

import type { Playa } from '@/types'
import type { ForecastDay, TurbidezData } from '@/lib/marine'

interface MeteoDay {
  temp_max: number; temp_min: number
  lluvia_mm: number; prob_lluvia: number
  nubosidad: number; icono: string
}

interface Props {
  playa:      Playa
  olas:       number
  viento:     number
  vientoDir:  string
  agua:       number
  periodo?:   number
  forecast?:  ForecastDay[]
  turbidez?:  TurbidezData | null
  meteo?:     MeteoDay[]
}

const ESTADO_SURF: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  CALMA:   { label: 'Plana',    color: '#9ca3af', bg: '#f9fafb', desc: 'Mar en calma — no apto surf' },
  BUENA:   { label: 'Suave',    color: '#3b82f6', bg: '#eff6ff', desc: 'Olas pequeñas — ideal principiantes' },
  AVISO:   { label: 'Mediana',  color: '#f59e0b', bg: '#fffbeb', desc: 'Buenas condiciones — nivel medio' },
  SURF:    { label: 'Potente',  color: '#0ea5e9', bg: '#f0f9ff', desc: 'Excelente para surf — nivel avanzado' },
  VIENTO:  { label: 'Ventosa',  color: '#eab308', bg: '#fefce8', desc: 'Viento fuerte — ideal kitesurf/windsurf' },
  PELIGRO: { label: 'Peligrosa',color: '#ef4444', bg: '#fef2f2', desc: 'Mar peligroso — no recomendado' },
}

function calcEstado(olas: number, viento: number): string {
  if (olas >= 2.5 || viento >= 50) return 'PELIGRO'
  if (olas >= 1.5 && viento >= 35) return 'PELIGRO'
  if (olas >= 1.5) return 'SURF'
  if (viento >= 35) return 'VIENTO'
  if (olas >= 0.8 || viento >= 25) return 'AVISO'
  if (olas >= 0.4 || viento >= 15) return 'BUENA'
  return 'CALMA'
}

function ScoreBar({ val, max = 5, color }: { val: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{
          width: 14, height: 6, borderRadius: 3,
          background: i < val ? color : 'var(--line,#e8dcc8)',
        }} />
      ))}
    </div>
  )
}

function scoreSurf(olas: number, viento: number): number {
  if (olas >= 2.0 && viento < 25) return 5
  if (olas >= 1.5 && viento < 30) return 4
  if (olas >= 0.8 && viento < 35) return 3
  if (olas >= 0.4) return 2
  return 1
}

function scoreKite(viento: number): number {
  if (viento >= 30 && viento < 50) return 5
  if (viento >= 22) return 4
  if (viento >= 15) return 3
  if (viento >= 10) return 2
  return 1
}

function scoreSnorkel(olas: number, turbidez?: TurbidezData | null): number {
  const visBase = turbidez?.visibilidad_m ?? 10
  const score = Math.round(visBase / 6)
  if (olas > 1.0) return Math.max(1, score - 2)
  if (olas > 0.5) return Math.max(1, score - 1)
  return Math.min(5, score)
}

export default function SurfSection({ playa, olas, viento, vientoDir, agua, periodo = 8, forecast, turbidez, meteo }: Props) {
  const estado     = calcEstado(olas, viento)
  const estadoInfo = ESTADO_SURF[estado] ?? ESTADO_SURF.CALMA
  const tieneSpot  = playa.actividades?.surf ?? false

  const DIAS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  return (
    <div style={{
      background: 'var(--card-bg,#faf6ef)', border: '1.5px solid var(--line,#e8dcc8)',
      borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem',
    }} id="s-actividades">

      {/* CABECERA */}
      <div style={{ padding: '1rem 1.25rem .75rem', borderBottom: '1px solid var(--line,#e8dcc8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink,#2a1a08)' }}>🏄 Actividades acuáticas</span>
          {tieneSpot && (
            <span style={{ fontSize: '.62rem', fontWeight: 700, padding: '.15rem .55rem', borderRadius: '100px', background: '#0ea5e922', color: '#0ea5e9', border: '1px solid #0ea5e944' }}>
              ✓ Spot verificado OSM
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>

        {/* ESTADO SURF AHORA */}
        <div style={{
          display: 'flex', gap: '1rem', alignItems: 'center',
          padding: '.75rem 1rem', borderRadius: '14px',
          background: estadoInfo.bg, marginBottom: '1.25rem',
          border: `1px solid ${estadoInfo.color}22`,
        }}>
          <div style={{ fontSize: '2rem' }}>🌊</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginBottom: '.15rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: estadoInfo.color, lineHeight: 1 }}>{olas}m</span>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: estadoInfo.color }}>{estadoInfo.label}</span>
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted,#8a7560)' }}>{estadoInfo.desc}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '.7rem', color: 'var(--muted,#8a7560)' }}>
            <div>Periodo: <strong>{periodo}s</strong></div>
            <div>💨 {viento}km/h {vientoDir}</div>
            <div><Drop size={12} weight='fill'/> {agua}°C</div>
          </div>
        </div>

        {/* GRID ACTIVIDADES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.6rem', marginBottom: '1.25rem' }}>
          {[
            {
              icon: <PersonSimpleSwim size={18}/>, label: 'Surf',
              score: scoreSurf(olas, viento),
              color: '#0ea5e9',
              datos: `${olas}m · ${periodo}s · ${viento}km/h`,
              disponible: playa.actividades?.surf,
            },
            {
              icon: '🪁', label: 'Windsurf',
              score: scoreKite(viento),
              color: '#8b5cf6',
              datos: `${viento}km/h ${vientoDir}`,
              disponible: playa.actividades?.windsurf,
            },
            {
              icon: '🪂', label: 'Kitesurf',
              score: viento >= 15 ? scoreKite(viento) : 1,
              color: '#ec4899',
              datos: viento >= 15 ? `${viento}km/h · Ideal` : 'Poco viento',
              disponible: playa.actividades?.kite,
            },
            {
              icon: '🤿', label: 'Snorkel',
              score: scoreSnorkel(olas, turbidez),
              color: '#22c55e',
              datos: turbidez ? `${turbidez.visibilidad_m}m visibilidad` : olas < 0.5 ? 'Agua tranquila' : 'Algo de oleaje',
              disponible: playa.actividades?.snorkel,
            },
            {
              icon: '🧜', label: 'Buceo',
              score: scoreSnorkel(olas, turbidez),
              color: '#0891b2',
              datos: `Agua ${agua}°C · Traje ${agua < 18 ? '5mm' : agua < 22 ? '3mm' : 'corto'}`,
              disponible: playa.actividades?.buceo,
            },
            {
              icon: '🛶', label: 'Kayak',
              score: olas < 0.5 && viento < 20 ? 5 : olas < 1 && viento < 30 ? 3 : 1,
              color: '#f59e0b',
              datos: olas < 0.5 && viento < 20 ? 'Condiciones ideales' : olas < 1 ? 'Aceptable' : 'Mar movido',
              disponible: playa.actividades?.kayak,
            },
          ].map(act => (
            <div key={act.label} style={{
              padding: '.7rem .85rem', borderRadius: '12px',
              background: act.score >= 3 ? `${act.color}10` : 'rgba(0,0,0,.02)',
              border: `1.5px solid ${act.score >= 3 ? act.color + '30' : 'var(--line,#e8dcc8)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{act.icon}</span>
                {act.disponible && (
                  <span style={{ fontSize: '.55rem', fontWeight: 700, color: act.color, background: act.color + '18', padding: '1px 5px', borderRadius: '100px' }}>✓ OSM</span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--ink,#2a1a08)', marginBottom: '.2rem' }}>{act.label}</div>
              <ScoreBar val={act.score} color={act.color} />
              <div style={{ fontSize: '.62rem', color: 'var(--muted,#8a7560)', marginTop: '.3rem', lineHeight: 1.3 }}>{act.datos}</div>
            </div>
          ))}
        </div>

        {/* VISIBILIDAD BUCEO */}
        {turbidez && (
          <div style={{
            padding: '.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
            background: turbidez.color + '10', border: `1px solid ${turbidez.color}30`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🤿</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.8rem', color: turbidez.color, marginBottom: '.15rem' }}>
                  Visibilidad subacuática: {turbidez.nivel}
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '.7rem', color: 'var(--muted,#8a7560)' }}>
                  <span>👁 {turbidez.visibilidad_m}m de visibilidad</span>
                  <span>🌿 Clorofila: {turbidez.clorofila.toFixed(2)} mg/m³</span>
                </div>
              </div>
              <div style={{ fontSize: '.6rem', color: 'var(--muted,#8a7560)', fontStyle: 'italic' }}>Est.</div>
            </div>
          </div>
        )}

        {/* FORECAST 5 DÍAS — olas + lluvia combinados */}
        {(forecast?.length || meteo?.length) && (
          <div>
            <div style={{ fontWeight: 600, fontSize: '.75rem', color: 'var(--ink,#2a1a08)', marginBottom: '.6rem' }}>
              📅 Previsión 5 días
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.4rem' }}>
              {Array.from({ length: 5 }, (_, i) => {
                const d   = forecast?.[i]
                const m   = meteo?.[i]
                const est = d ? (ESTADO_SURF[d.estado] ?? ESTADO_SURF.CALMA) : ESTADO_SURF.CALMA
                const probLluvia = m?.prob_lluvia ?? 0
                const llueve = probLluvia >= 40
                return (
                  <div key={i} style={{
                    padding: '.6rem .4rem', borderRadius: '10px', textAlign: 'center',
                    background: i === 0 ? est.bg : 'rgba(0,0,0,.02)',
                    border: `1.5px solid ${i === 0 ? est.color + '40' : 'var(--line,#e8dcc8)'}`,
                  }}>
                    <div style={{ fontSize: '.58rem', color: 'var(--muted,#8a7560)', fontWeight: 600, marginBottom: '.2rem' }}>
                      {i === 0 ? 'Hoy' : d?.fecha ?? (() => {
                        const dd = new Date(); dd.setDate(dd.getDate() + i)
                        return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dd.getDay()] + ' ' + dd.getDate()
                      })()}
                    </div>
                    {/* Icono meteo si hay lluvia, sino icono surf */}
                    <div style={{ fontSize: '1.1rem', marginBottom: '.1rem' }}>
                      {m?.icono ?? (d?.estado === 'SURF' ? '🏄' : d?.estado === 'PELIGRO' ? '⛔' : '😎')}
                    </div>
                    {/* Temperaturas */}
                    {m && (
                      <div style={{ fontSize: '.58rem', color: 'var(--ink,#2a1a08)', fontWeight: 600, marginBottom: '.1rem' }}>
                        {m.temp_max}° <span style={{ color:'var(--muted,#8a7560)', fontWeight:400 }}>{m.temp_min}°</span>
                      </div>
                    )}
                    {/* Olas */}
                    {d && <div style={{ fontWeight: 800, fontSize: '.75rem', color: est.color, lineHeight: 1 }}>🌊{d.olas_max}m</div>}
                    {/* Lluvia */}
                    {m && (
                      <div style={{
                        fontSize: '.58rem', marginTop: '.2rem', fontWeight: 600,
                        color: llueve ? '#3b82f6' : 'var(--muted,#8a7560)',
                      }}>
                        {llueve ? `🌧 ${probLluvia}%` : m.lluvia_mm > 0 ? `💧${m.lluvia_mm}mm` : '☀️ Seco'}
                      </div>
                    )}
                    {d && <div style={{ fontSize: '.52rem', color: est.color, fontWeight: 600, marginTop: '.15rem' }}>{est.label}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
