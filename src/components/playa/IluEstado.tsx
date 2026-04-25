// src/components/playa/IluEstado.tsx
// Brand book v1: 6 estados del mar. 48×48, trazo 1.5px, horizonte y=30.
// Prop `animated` añade CSS keyframes (olas se mueven, sol respira,
// bandera ondea). Respeta prefers-reduced-motion vía media query.

interface Props {
  estado: string
  size?: 'sm' | 'lg'
  animated?: boolean
}

const COLORS: Record<string, string> = {
  CALMA:   '#3d6b1f',
  BUENA:   '#7a8a30',
  AVISO:   '#c48a1e',
  SURF:    '#4a7a90',
  VIENTO:  '#c48a1e',
  PELIGRO: '#7a2818',
}

const ANIM_CSS = `
.ilu-wave1{animation:iluWave 3s ease-in-out infinite}
.ilu-wave2{animation:iluWave 3s ease-in-out .4s infinite}
.ilu-sun{animation:iluPulse 4s ease-in-out infinite}
.ilu-rays{animation:iluRays 4s ease-in-out infinite}
.ilu-warn{animation:iluWarn 1.8s ease-in-out infinite}
.ilu-surfer{animation:iluBob 2.5s ease-in-out infinite}
.ilu-wind1{animation:iluSweep 2s linear infinite}
.ilu-wind2{animation:iluSweep 2s linear .3s infinite}
.ilu-wind3{animation:iluSweep 2s linear .6s infinite}
.ilu-flag{animation:iluFlutter 1s ease-in-out infinite}
.ilu-chop1{animation:iluChop 1.4s ease-in-out infinite}
.ilu-chop2{animation:iluChop 1.4s ease-in-out .2s infinite}

@keyframes iluWave{
  0%,100%{transform:translateX(0)}
  50%{transform:translateX(2px)}
}
@keyframes iluPulse{
  0%,100%{transform:scale(1);opacity:1}
  50%{transform:scale(1.08);opacity:.9}
}
@keyframes iluRays{
  0%,100%{opacity:1}
  50%{opacity:.5}
}
@keyframes iluWarn{
  0%,100%{opacity:1}
  50%{opacity:.55}
}
@keyframes iluBob{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-2px)}
}
@keyframes iluSweep{
  0%{transform:translateX(-4px);opacity:0}
  20%{opacity:1}
  80%{opacity:1}
  100%{transform:translateX(4px);opacity:0}
}
@keyframes iluFlutter{
  0%,100%{transform:scaleX(1)}
  50%{transform:scaleX(.85)}
}
@keyframes iluChop{
  0%,100%{transform:translateY(0)}
  25%{transform:translateY(-1.5px)}
  75%{transform:translateY(1.5px)}
}

@media(prefers-reduced-motion:reduce){
  .ilu-wave1,.ilu-wave2,.ilu-sun,.ilu-rays,.ilu-warn,
  .ilu-surfer,.ilu-wind1,.ilu-wind2,.ilu-wind3,
  .ilu-flag,.ilu-chop1,.ilu-chop2{animation:none!important}
}
`

function AnimIconSVG({ estado }: { estado: string }) {
  if (estado === 'CALMA') return (
    <>
      <circle cx="24" cy="24" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="ilu-sun"/>
      <path d="M4 30 Q12 28 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wave1"/>
      <path d="M4 36 Q12 34 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" className="ilu-wave2"/>
    </>
  )
  if (estado === 'BUENA') return (
    <>
      <circle cx="24" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="ilu-sun"/>
      <g className="ilu-rays">
        <line x1="24" y1="10" x2="24" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="14" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32" y1="14" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      <path d="M4 30 Q12 27 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wave1"/>
      <path d="M4 36 Q12 33 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" className="ilu-wave2"/>
    </>
  )
  if (estado === 'AVISO') return (
    <>
      <g className="ilu-warn">
        <path d="M24 8 L34 24 L14 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="24" y1="14" x2="24" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="22" r="0.8" fill="currentColor"/>
      </g>
      <path d="M4 30 Q12 27 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wave1"/>
      <path d="M4 36 Q12 33 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" className="ilu-wave2"/>
    </>
  )
  if (estado === 'SURF') return (
    <>
      <path d="M4 30 Q12 18 20 26 Q28 14 36 22 Q40 18 44 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wave1"/>
      <g className="ilu-surfer">
        <circle cx="26" cy="16" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="26" y1="18" x2="26" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="26" y1="20" x2="30" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="26" y1="20" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="20" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      <path d="M4 38 Q16 36 24 38 T44 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" className="ilu-wave2"/>
    </>
  )
  if (estado === 'VIENTO') return (
    <>
      <path d="M8 14 Q20 14 28 14 T38 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wind1"/>
      <path d="M6 20 Q22 20 32 20 T42 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wind2"/>
      <path d="M10 26 Q22 26 30 26 T40 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7" className="ilu-wind3"/>
      <path d="M4 32 Q12 29 18 32 T32 32 T44 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-wave1"/>
      <path d="M4 38 Q12 35 18 38 T32 38 T44 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" className="ilu-wave2"/>
    </>
  )
  if (estado === 'PELIGRO') return (
    <>
      <line x1="30" y1="8" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 10 L40 13 L30 17 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="ilu-flag" style={{ transformOrigin: '30px 13px' }}/>
      <path d="M4 30 Q10 25 16 30 Q22 35 28 30 Q34 25 40 30 T48 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ilu-chop1"/>
      <path d="M4 36 Q10 32 16 36 Q22 40 28 36 Q34 32 40 36 T48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" className="ilu-chop2"/>
    </>
  )
  return null
}

function StaticIconSVG({ estado }: { estado: string }) {
  if (estado === 'CALMA') return (
    <>
      <circle cx="24" cy="24" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 30 Q12 28 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q12 34 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
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
  if (estado === 'AVISO') return (
    <>
      <path d="M24 8 L34 24 L14 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="24" y1="14" x2="24" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="24" cy="22" r="0.8" fill="currentColor"/>
      <path d="M4 30 Q12 27 18 30 T32 30 T44 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q12 33 18 36 T32 36 T44 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
  if (estado === 'SURF') return (
    <>
      <path d="M4 30 Q12 18 20 26 Q28 14 36 22 Q40 18 44 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="26" cy="16" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="26" y1="18" x2="26" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="26" y1="20" x2="30" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="26" y1="20" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 38 Q16 36 24 38 T44 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </>
  )
  if (estado === 'VIENTO') return (
    <>
      <path d="M8 14 Q20 14 28 14 T38 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 20 Q22 20 32 20 T42 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 26 Q22 26 30 26 T40 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <path d="M4 32 Q12 29 18 32 T32 32 T44 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 38 Q12 35 18 38 T32 38 T44 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </>
  )
  if (estado === 'PELIGRO') return (
    <>
      <line x1="30" y1="8" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 10 L40 13 L30 17 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 30 Q10 25 16 30 Q22 35 28 30 Q34 25 40 30 T48 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 36 Q10 32 16 36 Q22 40 28 36 Q34 32 40 36 T48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
    </>
  )
  return null
}

export default function IluEstado({ estado, size = 'lg', animated = false }: Props) {
  const side = size === 'lg' ? 140 : 56
  const color = COLORS[estado] ?? COLORS.CALMA
  return (
    <>
      {animated && <style>{ANIM_CSS}</style>}
      <svg
        viewBox="0 0 48 48"
        width={side}
        height={side}
        role="img"
        aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}
        style={{ color }}
      >
        {animated ? <AnimIconSVG estado={estado} /> : <StaticIconSVG estado={estado} />}
      </svg>
    </>
  )
}
