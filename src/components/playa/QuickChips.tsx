'use client'
// src/components/playa/QuickChips.tsx
//
// Quick reportes inline (1 tap = aporta). Resuelve el cold-start de
// reportes: antes existía ReportarEstado pero vivía oculto en un
// Drawer que solo abría tras un click; ningún usuario lo descubría
// → tasa de reporte <1%.
//
// Aquí los 6 chips más útiles aparecen SIEMPRE visibles bajo el hero
// (no en drawer, no bajo click). Cada uno hace POST a /api/reportes
// idéntico al de ReportarEstado. Mismo localStorage anti-doble-voto.

import { useState, useEffect, useCallback } from 'react'
import { Fish, Waves, Car, CheckCircle, Person, Dog } from '@phosphor-icons/react'
import type { TipoBinario } from '@/lib/reportes'

interface ChipDef {
  tipo:  TipoBinario | 'agua_cristalina' | 'apto_ninos' | 'perros_ok'
  icon:  typeof Fish
  label: string
  color: string
}

// 6 chips elegidos por frecuencia + impacto (los que más gente reportará).
// Los 4 banderas + ratings (limpieza, afluencia) quedan en el drawer
// completo accesible vía "+ avisar".
//
// NOTA: 'agua_cristalina', 'apto_ninos', 'perros_ok' no están aún en
// el tipo TipoBinario del backend. Mientras llega esa migración, los
// mapeamos a tipos existentes con misma semántica visual:
//   agua_cristalina → bandera_verde   (señal positiva)
//   apto_ninos      → bandera_verde   (señal positiva)
//   perros_ok       → bandera_verde   (señal positiva)
// Cuando el backend acepte los tipos nuevos, esta tabla se actualiza.
const CHIPS: Array<{
  display: ChipDef['tipo']
  backendTipo: TipoBinario
  icon: ChipDef['icon']
  label: string
  color: string
}> = [
  { display: 'medusas',          backendTipo: 'medusas',          icon: Fish,          label: 'Hay medusas',      color: '#e879a0' },
  { display: 'mucho_oleaje',     backendTipo: 'mucho_oleaje',     icon: Waves,         label: 'Oleaje fuerte',    color: '#4a7a90' },
  { display: 'parking_dificil',  backendTipo: 'parking_dificil',  icon: Car,           label: 'Parking difícil',  color: '#a04818' },
  { display: 'agua_cristalina',  backendTipo: 'bandera_verde',    icon: CheckCircle,   label: 'Agua cristalina',  color: '#3d6b1f' },
  { display: 'apto_ninos',       backendTipo: 'bandera_verde',    icon: Person,        label: 'Apta para niños',  color: '#7a8a30' },
  { display: 'perros_ok',        backendTipo: 'bandera_verde',    icon: Dog,           label: 'Perros bienvenidos', color: '#c48a1e' },
]

function lsKey(slug: string, tipo: string) {
  return `qchip:${slug}:${tipo}`
}

const WINDOW_MS = 24 * 60 * 60 * 1000

interface Props {
  slug:   string
  locale?: 'es' | 'en'
}

export default function QuickChips({ slug, locale = 'es' }: Props) {
  const es = locale === 'es'
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState<string | null>(null)

  // Hidratar el set de votados desde localStorage (lazy en cliente).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const out = new Set<string>()
    for (const c of CHIPS) {
      const raw = localStorage.getItem(lsKey(slug, c.display))
      if (!raw) continue
      const ts = parseInt(raw, 10)
      if (Date.now() - ts < WINDOW_MS) out.add(c.display)
      else localStorage.removeItem(lsKey(slug, c.display))
    }
    setVoted(out)
  }, [slug])

  const onChipClick = useCallback(async (chip: typeof CHIPS[number]) => {
    if (voted.has(chip.display)) return
    if (sending) return
    setSending(chip.display)
    try {
      const res = await fetch('/api/reportes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug, tipo: chip.backendTipo }),
      })
      if (res.ok) {
        localStorage.setItem(lsKey(slug, chip.display), String(Date.now()))
        setVoted(prev => new Set([...prev, chip.display]))
      }
    } catch { /* silencioso */ }
    setSending(null)
  }, [slug, voted, sending])

  return (
    <section
      aria-label={es ? '¿Cómo está hoy? Aporta en 1 tap' : 'How is the beach today? 1 tap'}
      style={{
        margin: '0 0 1.5rem',
        padding: '1rem 1.1rem',
        background: 'linear-gradient(135deg, #faf6ef 0%, #f5ecd8 100%)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 8,
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.7rem',
        fontWeight: 600,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: 'var(--muted, #5a3d12)',
        marginBottom: '.55rem',
      }}>
        {es ? '¿Cómo está hoy? · 1 tap' : 'How is it today? · 1 tap'}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '.45rem',
      }}>
        {CHIPS.map(c => {
          const Icon = c.icon
          const isVoted = voted.has(c.display)
          const isSending = sending === c.display
          return (
            <button
              key={c.display}
              type="button"
              onClick={() => onChipClick(c)}
              disabled={isVoted || !!sending}
              aria-pressed={isVoted}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.5rem .85rem',
                background: isVoted ? `${c.color}22` : '#fff',
                border: `1px solid ${isVoted ? c.color : 'var(--line, #e8dcc8)'}`,
                borderRadius: 100,
                fontSize: '.82rem',
                fontWeight: 500,
                color: isVoted ? c.color : 'var(--ink, #2a1a08)',
                cursor: isVoted ? 'default' : 'pointer',
                opacity: isSending ? 0.6 : 1,
                transition: 'all .15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} weight={isVoted ? 'fill' : 'regular'} color={c.color} />
              <span>{c.label}</span>
              {isVoted && <span style={{ fontSize: '.72rem', opacity: .8 }}>✓</span>}
            </button>
          )
        })}
      </div>
      <div style={{
        marginTop: '.6rem',
        fontSize: '.7rem',
        color: 'var(--muted, #5a3d12)',
        fontStyle: 'italic',
      }}>
        {es
          ? 'Sin registro · ayuda a quien venga después · activo 24 h'
          : 'No login · helps next visitors · live for 24 h'}
      </div>
    </section>
  )
}
