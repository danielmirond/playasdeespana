'use client'
// src/components/playa/AsideAfiliacionCTA.tsx
// Mini-CTA que sustituye al bloque Amazon de 6 productos siempre visible
// en el aside. Una sola línea editorial que abre un drawer al pulsar.

import { ShoppingBag, ArrowRight } from '@phosphor-icons/react'

interface Props {
  nombre:    string
  count:     number
  locale?:   'es' | 'en'
}

export const AFILIACION_DRAWER_EVENT = 'open-afiliacion-drawer'

export default function AsideAfiliacionCTA({ nombre, count, locale = 'es' }: Props) {
  if (count === 0) return null
  const es = locale === 'es'
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(AFILIACION_DRAWER_EVENT))}
      style={{
        display: 'flex', alignItems: 'center', gap: '.7rem',
        width: '100%', padding: '.85rem 1rem',
        borderRadius: 6,
        border: '1px solid var(--line, #e8dcc8)',
        background: 'var(--card-bg, #faf6ef)',
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit', color: 'inherit',
        transition: 'border-color .15s, background .15s, transform .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent, #6b400a)'
        e.currentTarget.style.transform = 'translateX(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--line, #e8dcc8)'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
      aria-haspopup="dialog"
    >
      <span style={{
        width: 38, height: 38, borderRadius: 6,
        background: 'rgba(196, 138, 30, .12)',
        color: 'var(--accent, #6b400a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ShoppingBag size={18} weight="bold" aria-hidden="true" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontStyle: 'italic',
          fontSize: '1rem',
          fontWeight: 400,
          color: 'var(--ink, #2a1a08)',
          lineHeight: 1.2,
        }}>
          {es ? `¿Qué llevar a ${nombre}?` : `What to bring to ${nombre}?`}
        </span>
        <span style={{
          display: 'block',
          marginTop: '.15rem',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '.65rem',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: 'var(--muted, #5a3d12)',
        }}>
          {es
            ? `${count} ${count === 1 ? 'imprescindible' : 'imprescindibles'}`
            : `${count} ${count === 1 ? 'essential' : 'essentials'}`}
        </span>
      </span>
      <ArrowRight size={16} weight="bold" color="var(--muted, #5a3d12)" aria-hidden="true" />
    </button>
  )
}
