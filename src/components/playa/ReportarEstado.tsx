'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Fish, Flag, Car, CheckCircle, Warning, Waves, Wind, Star, Users, Sparkle,
} from '@phosphor-icons/react'
import type { TipoBinario, TipoRating, ReportesPlaya } from '@/lib/reportes'

interface Props {
  slug: string
  locale?: 'es' | 'en'
}

// ── Catálogo de binarios ─────────────────────────────────────────────
type IconComp = typeof Fish

interface BinarioDef {
  tipo: TipoBinario
  icon: IconComp
  es: string
  en: string
  color: string
}

const BINARIOS: BinarioDef[] = [
  { tipo: 'medusas',          icon: Fish,    es: 'He visto medusas',      en: 'Jellyfish spotted',  color: '#e879a0' },
  { tipo: 'bandera_verde',    icon: Flag,    es: 'Bandera verde',         en: 'Green flag',         color: '#3d6b1f' },
  { tipo: 'bandera_amarilla', icon: Flag,    es: 'Bandera amarilla',      en: 'Yellow flag',        color: '#c48a1e' },
  { tipo: 'bandera_roja',     icon: Flag,    es: 'Bandera roja',          en: 'Red flag',           color: '#7a2818' },
  { tipo: 'parking_dificil',  icon: Car,     es: 'Difícil aparcar',       en: 'Hard to park',       color: '#a04818' },
  { tipo: 'acceso_roto',      icon: Warning, es: 'Acceso roto',           en: 'Broken access',      color: '#dc2626' },
  { tipo: 'mucho_oleaje',     icon: Waves,   es: 'Mucho oleaje',          en: 'Heavy swell',        color: '#4a7a90' },
  { tipo: 'mucho_viento',     icon: Wind,    es: 'Mucho viento',          en: 'Windy',              color: '#c48a1e' },
]

// ── Catálogo de ratings ──────────────────────────────────────────────
interface RatingDef {
  tipo: TipoRating
  icon: IconComp
  es: string
  en: string
  esLow: string   // label para estrella 1
  esHigh: string  // label para estrella 5
  enLow: string
  enHigh: string
  color: string
}

const RATINGS: RatingDef[] = [
  {
    tipo: 'limpieza', icon: Sparkle,
    es: 'Limpieza', en: 'Cleanliness',
    esLow: 'Sucia', esHigh: 'Muy limpia',
    enLow: 'Dirty', enHigh: 'Very clean',
    color: '#4a7a90',
  },
  {
    tipo: 'afluencia', icon: Users,
    es: 'Afluencia', en: 'Crowding',
    esLow: 'Vacía', esHigh: 'Masificada',
    enLow: 'Empty', enHigh: 'Packed',
    color: '#a855f7',
  },
]

function lsKey(slug: string, tipo: string) {
  return `rep:${slug}:${tipo}`
}

// Ventana rodante de 24 h: el usuario no puede re-votar el mismo tipo
// hasta que pasen 24 h reales desde el voto anterior, no hasta medianoche.
const CLIENT_WINDOW_MS = 24 * 60 * 60 * 1000

function leerVotoPrevio(slug: string, tipo: string): { value: number | null; fresh: boolean } {
  if (typeof window === 'undefined') return { value: null, fresh: false }
  const raw = localStorage.getItem(lsKey(slug, tipo))
  if (!raw) return { value: null, fresh: false }
  const parts = raw.split(':')
  const ts = parseInt(parts[0] ?? '0', 10)
  const value = parseInt(parts[1] ?? '0', 10) || null
  if (!ts) {
    // Formato antiguo (pre-rolling window). Lo descartamos al leer.
    localStorage.removeItem(lsKey(slug, tipo))
    return { value: null, fresh: false }
  }
  const fresh = Date.now() - ts < CLIENT_WINDOW_MS
  if (!fresh) {
    localStorage.removeItem(lsKey(slug, tipo))
    return { value: null, fresh: false }
  }
  return { value, fresh: true }
}

function escribirVoto(slug: string, tipo: string, value?: number) {
  if (typeof window === 'undefined') return
  const payload = `${Date.now()}:${value ?? ''}`
  localStorage.setItem(lsKey(slug, tipo), payload)
}

export default function ReportarEstado({ slug, locale = 'es' }: Props) {
  const [reportes, setReportes] = useState<ReportesPlaya | null>(null)
  const [enviados, setEnviados] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState<string | null>(null)

  // Cargar reportes de las últimas 24 h y estado local.
  useEffect(() => {
    const ya = new Set<string>()
    for (const b of BINARIOS) if (leerVotoPrevio(slug, b.tipo).fresh) ya.add(b.tipo)
    for (const r of RATINGS) if (leerVotoPrevio(slug, r.tipo).fresh) ya.add(r.tipo)
    setEnviados(ya)

    fetch(`/api/reportes?slug=${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setReportes(d) })
      .catch(() => {})
  }, [slug])

  const enviarBinario = useCallback(async (tipo: TipoBinario) => {
    if (enviados.has(tipo) || sending) return
    setSending(tipo)

    // Optimistic UI
    escribirVoto(slug, tipo)
    setEnviados(prev => new Set(prev).add(tipo))
    setReportes(prev => (prev ? { ...prev, [tipo]: (prev[tipo] as number) + 1, total: prev.total + 1 } : prev))

    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, tipo }),
      })
      if (res.ok) {
        const data = await res.json()
        setReportes(data)
      }
    } catch { /* silencioso */ }
    setSending(null)
  }, [slug, enviados, sending])

  const enviarRating = useCallback(async (tipo: TipoRating, value: number) => {
    if (enviados.has(tipo) || sending) return
    if (value < 1 || value > 5) return
    setSending(tipo)

    escribirVoto(slug, tipo, value)
    setEnviados(prev => new Set(prev).add(tipo))
    setReportes(prev => {
      if (!prev) return prev
      const next = { ...prev }
      if (tipo === 'limpieza') {
        next.limpieza_sum += value
        next.limpieza_count += 1
      } else {
        next.afluencia_sum += value
        next.afluencia_count += 1
      }
      next.total += 1
      return next
    })

    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, tipo, value }),
      })
      if (res.ok) {
        const data = await res.json()
        setReportes(data)
      }
    } catch { /* silencioso */ }
    setSending(null)
  }, [slug, enviados, sending])

  const es = locale === 'es'
  const promedioLimpieza = reportes && reportes.limpieza_count > 0
    ? reportes.limpieza_sum / reportes.limpieza_count
    : null
  const promedioAfluencia = reportes && reportes.afluencia_count > 0
    ? reportes.afluencia_sum / reportes.afluencia_count
    : null

  return (
    <div style={{
      background: 'var(--card-bg, #faf6ef)',
      border: '1px solid var(--line, #e8dcc8)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '.55rem .9rem',
        borderBottom: '1px solid var(--line, #e8dcc8)',
        fontFamily: 'var(--font-sans)',
        fontSize: '.7rem',
        fontWeight: 500,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: 'var(--muted, #5a3d12)',
      }}>
        {es ? '¿Qué ves en la playa?' : 'What do you see?'}
      </div>

      {/* Binarios */}
      <div role="group" aria-label={es ? 'Reportes rápidos' : 'Quick reports'} style={{ padding: '.6rem .7rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {BINARIOS.map(o => {
          const done = enviados.has(o.tipo)
          const count = (reportes?.[o.tipo] as number) ?? 0
          const Icon = o.icon
          const label = es ? o.es : o.en
          return (
            <button
              key={o.tipo}
              type="button"
              onClick={() => enviarBinario(o.tipo)}
              disabled={done || sending === o.tipo}
              aria-pressed={done ? 'true' : 'false'}
              aria-label={done
                ? (es ? `${label} (ya reportado)` : `${label} (already reported)`)
                : label}
              style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                width: '100%', padding: '.55rem .8rem',
                borderRadius: 4,
                border: done ? `1px solid ${o.color}66` : '1px solid var(--line, #e8dcc8)',
                background: done ? `${o.color}14` : 'transparent',
                cursor: done ? 'default' : 'pointer',
                fontSize: '.82rem', fontWeight: 500,
                fontFamily: 'var(--font-sans, system-ui)',
                color: done ? o.color : 'var(--ink, #2a1a08)',
                transition: 'border-color .15s, background .15s',
                opacity: sending === o.tipo ? 0.6 : 1,
                minHeight: 44,
              }}
            >
              {done
                ? <CheckCircle size={18} weight="fill" color={o.color} aria-hidden="true" />
                : <Icon size={18} weight="bold" color={o.color} aria-hidden="true" />}
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {count > 0 && (
                <span style={{
                  fontSize: '.74rem', fontWeight: 700, color: o.color,
                  background: `${o.color}18`, padding: '.15rem .5rem',
                  borderRadius: 99, minWidth: '1.6rem', textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: 'var(--line, #e8dcc8)' }} aria-hidden="true" />

      {/* Ratings 1-5 */}
      <div role="group" aria-label={es ? 'Valoración del estado' : 'Rate the state'} style={{ padding: '.6rem .7rem', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
        {RATINGS.map(r => {
          const done = enviados.has(r.tipo)
          const Icon = r.icon
          const label = es ? r.es : r.en
          const low = es ? r.esLow : r.enLow
          const high = es ? r.esHigh : r.enHigh
          const sum = r.tipo === 'limpieza' ? reportes?.limpieza_sum ?? 0 : reportes?.afluencia_sum ?? 0
          const count = r.tipo === 'limpieza' ? reportes?.limpieza_count ?? 0 : reportes?.afluencia_count ?? 0
          const avg = count > 0 ? sum / count : null
          const voted = leerVotoPrevio(slug, r.tipo).value ?? 0

          return (
            <fieldset key={r.tipo} style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{
                display: 'flex', alignItems: 'center', gap: '.45rem',
                fontSize: '.82rem', fontWeight: 700, color: 'var(--ink, #2a1a08)',
                marginBottom: '.35rem',
              }}>
                <Icon size={15} weight="bold" color={r.color} aria-hidden="true" />
                {label}
                {avg !== null && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '.78rem', fontWeight: 700, color: r.color,
                    background: `${r.color}14`, padding: '.15rem .5rem',
                    borderRadius: 99,
                  }}>
                    {avg.toFixed(1)} <span style={{ opacity: .6 }}>/ 5</span>
                  </span>
                )}
              </legend>

              {/* Stars */}
              <div role="radiogroup" aria-label={es ? `Valorar ${label.toLowerCase()} de 1 a 5 estrellas` : `Rate ${label.toLowerCase()} 1 to 5 stars`} style={{
                display: 'flex', gap: '.3rem', alignItems: 'center',
              }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const active = voted >= n
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={voted === n ? 'true' : 'false'}
                      onClick={() => enviarRating(r.tipo, n)}
                      disabled={done || sending === r.tipo}
                      aria-label={`${label}: ${n} ${es ? (n === 1 ? 'estrella' : 'estrellas') : (n === 1 ? 'star' : 'stars')}`}
                      style={{
                        width: 36, height: 36, borderRadius: 4,
                        border: '1px solid var(--line, #e8dcc8)',
                        background: active ? `${r.color}14` : 'transparent',
                        cursor: done ? 'default' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                        opacity: sending === r.tipo ? 0.6 : 1,
                      }}
                    >
                      <Star
                        size={18}
                        weight={active ? 'fill' : 'bold'}
                        color={active ? r.color : 'var(--muted, #5a3d12)'}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
                {count > 0 && (
                  <span style={{
                    fontSize: '.72rem', color: 'var(--muted, #5a3d12)',
                    marginLeft: '.3rem',
                  }}>
                    {count} {es ? (count === 1 ? 'voto' : 'votos') : (count === 1 ? 'vote' : 'votes')}
                  </span>
                )}
              </div>

              {/* Low/high labels */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '.68rem', color: 'var(--muted, #5a3d12)',
                marginTop: '.25rem',
                maxWidth: 210,
              }}>
                <span>{low}</span>
                <span>{high}</span>
              </div>
            </fieldset>
          )
        })}
      </div>

      {/* Footer */}
      {reportes && reportes.total > 0 && (
        <div style={{
          padding: '.4rem .9rem .55rem',
          fontSize: '.72rem',
          color: 'var(--muted, #5a3d12)',
          textAlign: 'center',
          borderTop: '1px solid var(--line, #e8dcc8)',
        }}>
          {es
            ? `${reportes.total} ${reportes.total === 1 ? 'reporte' : 'reportes'} en las últimas 24 h`
            : `${reportes.total} ${reportes.total === 1 ? 'report' : 'reports'} in the last 24 h`}
        </div>
      )}
    </div>
  )
}
