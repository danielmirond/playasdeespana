'use client'
// src/components/ui/Collapsible.tsx
// Sección comprimible con gradiente difuminado + "Ver más / Ver menos".
// maxHeight controla la altura colapsada. Si el contenido es más corto
// que maxHeight, no muestra botón ni gradiente.
import { useState, useRef, useEffect, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  maxHeight?: number
  labelMore?: string
  labelLess?: string
}

export default function Collapsible({
  children,
  maxHeight = 220,
  labelMore = 'Ver más',
  labelLess = 'Ver menos',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [needsCollapse, setNeedsCollapse] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    setNeedsCollapse(ref.current.scrollHeight > maxHeight + 40)
  }, [maxHeight])

  if (!needsCollapse) {
    return <div ref={ref}>{children}</div>
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={ref}
        style={{
          maxHeight: open ? 'none' : maxHeight,
          overflow: 'hidden',
          transition: 'max-height .3s ease',
        }}
      >
        {children}
      </div>

      {/* Gradient fade overlay. only when collapsed */}
      {!open && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 80,
            background: 'linear-gradient(to bottom, transparent, var(--card-bg, #faf6ef) 90%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '.35rem',
          width: '100%',
          padding: '.65rem 1rem',
          marginTop: open ? '.25rem' : '-1rem',
          position: 'relative',
          zIndex: 2,
          background: 'none',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: '.78rem',
          fontWeight: 500,
          color: 'var(--accent)',
          cursor: 'pointer',
          letterSpacing: '.02em',
        }}
      >
        {open ? labelLess : labelMore}
        <svg
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  )
}
