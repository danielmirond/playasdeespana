'use client'
import { useState, useEffect, useCallback } from 'react'
import { Fish, Flag, Car, CheckCircle } from '@phosphor-icons/react'
import type { TipoReporte, ReportesPlaya } from '@/lib/reportes'

interface Props {
  slug: string
  locale?: 'es' | 'en'
}

const OPCIONES: {
  tipo: TipoReporte
  icon: typeof Fish
  es: string
  en: string
  color: string
}[] = [
  { tipo: 'medusas',          icon: Fish,  es: 'He visto medusas',    en: 'Jellyfish spotted',  color: '#e879a0' },
  { tipo: 'bandera_verde',    icon: Flag,  es: 'Bandera verde',       en: 'Green flag',         color: '#22c55e' },
  { tipo: 'bandera_amarilla', icon: Flag,  es: 'Bandera amarilla',    en: 'Yellow flag',        color: '#eab308' },
  { tipo: 'bandera_roja',     icon: Flag,  es: 'Bandera roja',        en: 'Red flag',           color: '#ef4444' },
  { tipo: 'parking_dificil',  icon: Car,   es: 'Difícil aparcar',     en: 'Hard to park',       color: '#f97316' },
]

function lsKey(slug: string, tipo: TipoReporte) {
  const d = new Date().toISOString().slice(0, 10)
  return `rep:${slug}:${d}:${tipo}`
}

export default function ReportarEstado({ slug, locale = 'es' }: Props) {
  const [reportes, setReportes] = useState<ReportesPlaya | null>(null)
  const [enviados, setEnviados] = useState<Set<TipoReporte>>(new Set())
  const [sending, setSending]   = useState<TipoReporte | null>(null)

  // Cargar reportes del día y estado local
  useEffect(() => {
    // Lo que ya reportó este usuario hoy
    const ya = new Set<TipoReporte>()
    for (const o of OPCIONES) {
      if (localStorage.getItem(lsKey(slug, o.tipo))) ya.add(o.tipo)
    }
    setEnviados(ya)

    // Cargar conteos del servidor
    fetch(`/api/reportes?slug=${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setReportes(d) })
      .catch(() => {})
  }, [slug])

  const enviar = useCallback(async (tipo: TipoReporte) => {
    if (enviados.has(tipo) || sending) return
    setSending(tipo)

    // Optimistic UI
    localStorage.setItem(lsKey(slug, tipo), '1')
    setEnviados(prev => new Set(prev).add(tipo))
    setReportes(prev => prev ? { ...prev, [tipo]: prev[tipo] + 1, total: prev.total + 1 } : prev)

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
    } catch {
      // El reporte ya se marcó localmente, no revertimos
    }
    setSending(null)
  }, [slug, enviados, sending])

  const es = locale === 'es'

  return (
    <div style={{
      background: 'var(--card-bg, #faf6ef)',
      border: '1.5px solid var(--line, #e8dcc8)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '.55rem .9rem',
        borderBottom: '1px solid var(--line, #e8dcc8)',
        fontSize: '.6rem',
        fontWeight: 600,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--muted, #8a7560)',
      }}>
        {es ? '¿Qué ves en la playa?' : 'What do you see?'}
      </div>

      {/* Botones */}
      <div style={{ padding: '.6rem .7rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {OPCIONES.map(o => {
          const done = enviados.has(o.tipo)
          const count = reportes?.[o.tipo] ?? 0
          const Icon = o.icon
          return (
            <button
              key={o.tipo}
              onClick={() => enviar(o.tipo)}
              disabled={done || sending === o.tipo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                width: '100%',
                padding: '.5rem .7rem',
                borderRadius: 10,
                border: done
                  ? `1.5px solid ${o.color}44`
                  : '1.5px solid var(--line, #e8dcc8)',
                background: done ? `${o.color}0d` : 'transparent',
                cursor: done ? 'default' : 'pointer',
                fontSize: '.78rem',
                fontWeight: 500,
                fontFamily: 'var(--font-sans, system-ui)',
                color: done ? o.color : 'var(--ink, #2a1a08)',
                transition: 'all .2s',
                opacity: sending === o.tipo ? 0.6 : 1,
              }}
            >
              {done
                ? <CheckCircle size={16} weight="fill" color={o.color} />
                : <Icon size={16} weight="bold" color={o.color} />
              }
              <span style={{ flex: 1, textAlign: 'left' }}>
                {es ? o.es : o.en}
              </span>
              {count > 0 && (
                <span style={{
                  fontSize: '.62rem',
                  fontWeight: 700,
                  color: o.color,
                  background: `${o.color}18`,
                  padding: '.1rem .4rem',
                  borderRadius: 99,
                  minWidth: '1.4rem',
                  textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      {reportes && reportes.total > 0 && (
        <div style={{
          padding: '.35rem .9rem .5rem',
          fontSize: '.58rem',
          color: 'var(--muted, #8a7560)',
          textAlign: 'center',
          borderTop: '1px solid var(--line, #e8dcc8)',
        }}>
          {es
            ? `${reportes.total} reporte${reportes.total === 1 ? '' : 's'} hoy`
            : `${reportes.total} report${reportes.total === 1 ? '' : 's'} today`
          }
        </div>
      )}
    </div>
  )
}
