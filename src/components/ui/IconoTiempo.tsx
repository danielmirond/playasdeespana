// src/components/ui/IconoTiempo.tsx — Iconos meteo editoriales, server-render.
//
// Un solo tamaño escalable (viewBox 40×40), color desde CSS custom
// properties para que respondan al tema. Cero emoji, cero librería —
// mismo registro visual que los iconos SVG de estado del mar.

import type { TipoIcono } from '@/lib/tiempo-copy'

interface Props {
  tipo:  TipoIcono
  size?: number
  className?: string
}

// Colores. `currentColor` para el trazo cuando el tinte lo controle el
// contexto (v.g. dentro de una tarjeta gris); tintes explícitos para las
// piezas cromáticas del icono.
const SUN = 'var(--sun, #d48a1a)'
const CLOUD = 'var(--cloud, #8b8477)'
const RAIN = 'var(--rain, #4a7a90)'

function Sol({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="8" fill={SUN} />
      <g stroke={SUN} strokeWidth="2" strokeLinecap="round">
        <line x1="20" y1="4" x2="20" y2="8" />
        <line x1="20" y1="32" x2="20" y2="36" />
        <line x1="4" y1="20" x2="8" y2="20" />
        <line x1="32" y1="20" x2="36" y2="20" />
        <line x1="9" y1="9" x2="12" y2="12" />
        <line x1="28" y1="28" x2="31" y2="31" />
        <line x1="9" y1="31" x2="12" y2="28" />
        <line x1="28" y1="12" x2="31" y2="9" />
      </g>
    </svg>
  )
}

function SolNubes({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="14" cy="15" r="6" fill={SUN} opacity=".9" />
      <ellipse cx="24" cy="24" rx="12" ry="7" fill={CLOUD} />
    </svg>
  )
}

function Nublado({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="15" cy="18" rx="10" ry="6" fill={CLOUD} opacity=".55" />
      <ellipse cx="24" cy="24" rx="13" ry="7" fill={CLOUD} />
    </svg>
  )
}

function Niebla({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <g stroke={CLOUD} strokeWidth="2.4" strokeLinecap="round">
        <line x1="6" y1="14" x2="34" y2="14" />
        <line x1="4" y1="20" x2="36" y2="20" />
        <line x1="6" y1="26" x2="34" y2="26" opacity=".7" />
      </g>
    </svg>
  )
}

function Lluvia({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="16" rx="12" ry="7" fill={CLOUD} />
      <g stroke={RAIN} strokeWidth="2" strokeLinecap="round">
        <line x1="14" y1="27" x2="12" y2="34" />
        <line x1="20" y1="27" x2="18" y2="34" />
        <line x1="26" y1="27" x2="24" y2="34" />
      </g>
    </svg>
  )
}

function Chubasco({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="12" cy="13" r="5" fill={SUN} opacity=".9" />
      <ellipse cx="24" cy="19" rx="11" ry="6" fill={CLOUD} />
      <g stroke={RAIN} strokeWidth="2" strokeLinecap="round">
        <line x1="19" y1="28" x2="17" y2="34" />
        <line x1="25" y1="28" x2="23" y2="34" />
      </g>
    </svg>
  )
}

function Tormenta({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="15" rx="13" ry="7" fill={CLOUD} />
      <path d="M 20 22 L 15 30 L 20 30 L 17 36 L 25 27 L 21 27 L 24 22 Z"
            fill={SUN} stroke={SUN} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

function Nieve({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="16" rx="12" ry="7" fill={CLOUD} />
      <g stroke={CLOUD} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M 14 30 L 14 34 M 12 32 L 16 32" />
        <path d="M 20 28 L 20 34 M 17 31 L 23 31" />
        <path d="M 26 30 L 26 34 M 24 32 L 28 32" />
      </g>
    </svg>
  )
}

export default function IconoTiempo({ tipo, size = 40, className }: Props) {
  const s = size
  const wrap = (node: React.ReactNode) => (
    <span className={className} style={{ display: 'inline-block', lineHeight: 0 }}>{node}</span>
  )
  switch (tipo) {
    case 'sol':        return wrap(<Sol s={s} />)
    case 'sol-nubes':  return wrap(<SolNubes s={s} />)
    case 'nublado':    return wrap(<Nublado s={s} />)
    case 'niebla':     return wrap(<Niebla s={s} />)
    case 'lluvia':     return wrap(<Lluvia s={s} />)
    case 'chubasco':   return wrap(<Chubasco s={s} />)
    case 'tormenta':   return wrap(<Tormenta s={s} />)
    case 'nieve':      return wrap(<Nieve s={s} />)
  }
}
