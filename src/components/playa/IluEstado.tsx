// src/components/playa/IluEstado.tsx
// Brand book v1: 6 estados del mar unificados — 48×48, trazo 1.5px,
// horizonte en y=30, color por estado semántico.
// Iconografía lineal consistente: cada icono significa una recomendación
// (báñate, ten cuidado, no vayas) — nunca decorativa.

interface Props { estado: string; size?: 'sm' | 'lg' }

const COLORS: Record<string, string> = {
  CALMA:   '#3d6b1f',  // excelente
  BUENA:   '#7a8a30',  // muy bueno
  AVISO:   '#c48a1e',  // aceptable
  SURF:    '#4a7a90',  // mar (apoyo)
  VIENTO:  '#c48a1e',  // aceptable (viento)
  PELIGRO: '#7a2818',  // no apto
}

// Cada icono se pinta con currentColor; el wrapper aplica el color del estado.
// Todos sobre lienzo 48×48 con trazo 1.5 y horizonte unificado en y=30.
function IconSVG({ estado }: { estado: string }) {
  // CALMA — sol sobre horizonte plano
  if (estado === 'CALMA') return (
    <>
      <circle cx="24" cy="24" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 30 Q12 28 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q12 34 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
  // BUENA — sol más marcado con rayos sobre oleaje
  if (estado === 'BUENA') return (
    <>
      <circle cx="24" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="24" y1="10" x2="24" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="14" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="14" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 30 Q12 27 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q12 33 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
  // AVISO — triángulo con signo exclamación sobre horizonte
  if (estado === 'AVISO') return (
    <>
      <path d="M24 8 L34 24 L14 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="24" y1="14" x2="24" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="24" cy="22" r="0.8" fill="currentColor"/>
      <path d="M4 30 Q12 27 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q12 33 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
  // SURF — surfista sobre ola alta
  if (estado === 'SURF') return (
    <>
      {/* Ola alta principal */}
      <path d="M4 30 Q12 18 20 26 Q28 14 36 22 Q40 18 44 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Surfista simplificado */}
      <circle cx="26" cy="16" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="26" y1="18" x2="26" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="26" y1="20" x2="30" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="26" y1="20" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Tabla */}
      <line x1="20" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Horizonte bajo */}
      <path d="M4 38 Q16 36 24 38 T44 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </>
  )
  // VIENTO — líneas de viento paralelas sobre horizonte
  if (estado === 'VIENTO') return (
    <>
      <path d="M8 14 Q20 14 28 14 T38 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 20 Q22 20 32 20 T42 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 26 Q22 26 30 26 T40 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <path d="M4 32 Q12 29 18 32 T32 32 T44 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 38 Q12 35 18 38 T32 38 T44 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </>
  )
  // PELIGRO — bandera ondulante sobre ola agitada
  if (estado === 'PELIGRO') return (
    <>
      {/* Mástil bandera */}
      <line x1="30" y1="8" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Bandera triangular */}
      <path d="M30 10 L40 13 L30 17 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Olas agitadas */}
      <path d="M4 30 Q10 25 16 30 Q22 35 28 30 Q34 25 40 30 T48 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q10 32 16 36 Q22 40 28 36 Q34 32 40 36 T48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
  return null
}

export default function IluEstado({ estado, size = 'lg' }: Props) {
  const side = size === 'lg' ? 140 : 56
  const color = COLORS[estado] ?? COLORS.CALMA
  return (
    <svg
      viewBox="0 0 48 48"
      width={side}
      height={side}
      role="img"
      aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}
      style={{ color }}
    >
      <IconSVG estado={estado} />
    </svg>
  )
}
