// src/components/playa/AnimatedSea.tsx
// Design system v1 §04: atmospheric SVG vignettes per sea state.
// 320×200 viewBox. Continuous CSS keyframe loops.
// Respects prefers-reduced-motion via global CSS.

import styles from './AnimatedSea.module.css'

interface Props {
  estado: string
  color?: string
  tint?: string
  className?: string
}

const W = 320
const H = 200
const HORIZON = 110

function Bg({ color, tint }: { color: string; tint: string }) {
  return (
    <>
      <rect width={W} height={H} fill={tint} />
      <line x1="20" y1={HORIZON} x2={W - 20} y2={HORIZON} stroke={color} strokeWidth="0.75" opacity="0.25" />
    </>
  )
}

function Calma({ color, tint }: { color: string; tint: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      <Bg color={color} tint={tint} />
      <g className={styles.rise}>
        <circle cx="240" cy="60" r="16" opacity="0.55" />
        <circle cx="240" cy="60" r="22" opacity="0.18" />
      </g>
      <g className={styles.driftSlow}>
        <path d="M -20 130 Q 0 127 20 130 T 60 130 T 100 130 T 140 130 T 180 130 T 220 130 T 260 130 T 300 130 T 340 130" opacity="0.7" />
      </g>
      <g className={styles.driftSlowR}>
        <path d="M -20 145 Q 0 143 20 145 T 60 145 T 100 145 T 140 145 T 180 145 T 220 145 T 260 145 T 300 145 T 340 145" opacity="0.5" />
      </g>
      <g className={styles.driftSlow}>
        <path d="M -20 165 Q 0 163 20 165 T 60 165 T 100 165 T 140 165 T 180 165 T 220 165 T 260 165 T 300 165 T 340 165" opacity="0.3" />
      </g>
      <g className={styles.boat}>
        <path d="M 70 108 L 90 108 L 86 112 L 74 112 Z" fill={color} stroke="none" opacity="0.5" />
        <line x1="80" y1="108" x2="80" y2="100" opacity="0.5" />
      </g>
    </svg>
  )
}

function Buena({ color, tint }: { color: string; tint: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      <Bg color={color} tint={tint} />
      <g transform="translate(240,55)">
        <g className={styles.spinSlow} style={{ transformOrigin: '0 0' }}>
          {[0, 45, 90, 135].map(a => (
            <line key={a} x1="0" y1="-22" x2="0" y2="-28" transform={`rotate(${a})`} opacity="0.6" />
          ))}
          {[22.5, 67.5, 112.5, 157.5].map(a => (
            <line key={a} x1="0" y1="-22" x2="0" y2="-26" transform={`rotate(${a})`} opacity="0.35" />
          ))}
        </g>
        <circle r="14" />
      </g>
      <g className={styles.drift}>
        <path d="M -40 130 Q -20 124 0 130 T 40 130 T 80 130 T 120 130 T 160 130 T 200 130 T 240 130 T 280 130 T 320 130 T 360 130" />
      </g>
      <g className={styles.driftR}>
        <path d="M -40 148 Q -20 143 0 148 T 40 148 T 80 148 T 120 148 T 160 148 T 200 148 T 240 148 T 280 148 T 320 148 T 360 148" opacity="0.7" />
      </g>
      <g className={styles.drift}>
        <path d="M -40 168 Q -20 164 0 168 T 40 168 T 80 168 T 120 168 T 160 168 T 200 168 T 240 168 T 280 168 T 320 168 T 360 168" opacity="0.45" />
      </g>
    </svg>
  )
}

function Aviso({ color, tint }: { color: string; tint: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <Bg color={color} tint={tint} />
      <g className={styles.driftSlow} opacity="0.55">
        <path d="M 40 50 Q 50 38 65 42 Q 75 32 90 42 Q 105 38 110 50 Z" />
        <path d="M 180 60 Q 192 48 208 52 Q 220 42 232 54 Q 244 50 248 62 Z" />
      </g>
      <g className={styles.drift}>
        <path d="M -30 130 Q -10 118 10 130 T 50 130 T 90 130 T 130 130 T 170 130 T 210 130 T 250 130 T 290 130 T 330 130" />
      </g>
      <g className={styles.driftR}>
        <path d="M -30 152 Q -10 142 10 152 T 50 152 T 90 152 T 130 152 T 170 152 T 210 152 T 250 152 T 290 152 T 330 152" opacity="0.7" />
      </g>
      <g className={styles.pulse} transform="translate(255,72)">
        <path d="M 0 -16 L 14 8 L -14 8 Z" strokeWidth="1.5" />
        <line x1="0" y1="-7" x2="0" y2="0" strokeWidth="1.5" />
        <circle cx="0" cy="4" r="0.9" fill={color} stroke="none" />
      </g>
    </svg>
  )
}

function Surf({ color, tint }: { color: string; tint: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <Bg color={color} tint={tint} />
      <g className={styles.driftFast}>
        <path d="M -60 145 Q -30 90 30 110 Q 80 130 130 90 Q 170 70 200 90 Q 230 110 280 90 Q 320 80 360 95" />
        <path d="M 30 110 Q 50 130 80 130" opacity="0.6" />
        <path d="M 130 90 L 122 70 M 138 90 L 144 70 M 150 92 L 156 74" opacity="0.7" />
      </g>
      <g className={styles.driftR}>
        <path d="M -40 168 Q -20 164 0 168 T 40 168 T 80 168 T 120 168 T 160 168 T 200 168 T 240 168 T 280 168 T 320 168 T 360 168" opacity="0.5" />
      </g>
      <g transform="translate(220,108)" className={styles.bob}>
        <line x1="-2" y1="-10" x2="2" y2="-2" strokeWidth="1.6" />
        <circle cx="-2" cy="-12" r="1.6" fill={color} stroke="none" />
        <line x1="-8" y1="2" x2="10" y2="2" strokeWidth="1.4" opacity="0.7" />
      </g>
    </svg>
  )
}

function Viento({ color, tint }: { color: string; tint: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <Bg color={color} tint={tint} />
      <g>
        <path className={styles.gust1} d="M 20 50 L 130 50 Q 150 50 150 60 Q 150 70 130 70 L 60 70" opacity="0.85" />
        <path className={styles.gust2} d="M 20 80 L 200 80 Q 220 80 220 90 Q 220 100 200 100 L 100 100" opacity="0.7" />
        <path className={styles.gust3} d="M 20 28 L 90 28 Q 105 28 105 36 Q 105 44 90 44 L 50 44" opacity="0.55" />
      </g>
      <g className={styles.shake}>
        <path d="M -20 140 Q 0 135 20 140 T 60 140 T 100 140 T 140 140 T 180 140 T 220 140 T 260 140 T 300 140 T 340 140" />
        <path d="M -20 158 Q 0 154 20 158 T 60 158 T 100 158 T 140 158 T 180 158 T 220 158 T 260 158 T 300 158 T 340 158" opacity="0.7" />
        <path d="M -20 174 Q 0 170 20 174 T 60 174 T 100 174 T 140 174 T 180 174 T 220 174 T 260 174 T 300 174 T 340 174" opacity="0.5" />
      </g>
    </svg>
  )
}

function Peligro({ color, tint }: { color: string; tint: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <Bg color={color} tint={tint} />
      <g className={styles.driftFast}>
        <path d="M -40 120 Q -20 95 0 110 Q 20 125 40 105 Q 60 90 80 110 Q 100 130 120 105 Q 140 88 160 108 Q 180 130 200 105 Q 220 90 240 110 Q 260 130 280 105 Q 300 90 320 110 Q 340 130 360 110" />
      </g>
      <g className={styles.driftR}>
        <path d="M -40 148 Q -20 130 0 145 Q 20 158 40 138 Q 60 125 80 142 Q 100 160 120 140 Q 140 125 160 145 Q 180 162 200 140 Q 220 125 240 145 Q 260 160 280 140 Q 300 125 320 142 Q 340 158 360 142" opacity="0.7" />
      </g>
      <g className={styles.drift}>
        <path d="M -40 172 Q -20 162 0 172 T 40 172 T 80 172 T 120 172 T 160 172 T 200 172 T 240 172 T 280 172 T 320 172 T 360 172" opacity="0.5" />
      </g>
      <g transform="translate(255,72)">
        <line x1="0" y1="-26" x2="0" y2="22" strokeWidth="1.6" />
        <g className={styles.flag}>
          <path d="M 0 -26 L 26 -22 L 18 -16 L 26 -8 L 0 -10 Z" fill={color} stroke={color} />
        </g>
      </g>
    </svg>
  )
}

const SCENES: Record<string, (p: { color: string; tint: string }) => React.JSX.Element> = {
  CALMA: Calma, calma: Calma,
  BUENA: Buena, buena: Buena,
  AVISO: Aviso, aviso: Aviso,
  SURF: Surf, surf: Surf,
  VIENTO: Viento, viento: Viento,
  PELIGRO: Peligro, peligro: Peligro,
}

const COLORS: Record<string, string> = {
  CALMA: '#5a8a7a', BUENA: '#3d6b1f', AVISO: '#c48a1e',
  SURF: '#2d5266', VIENTO: '#7a7a7a', PELIGRO: '#7a2818',
  calma: '#5a8a7a', buena: '#3d6b1f', aviso: '#c48a1e',
  surf: '#2d5266', viento: '#7a7a7a', peligro: '#7a2818',
}

export default function AnimatedSea({ estado, color, tint = 'transparent', className }: Props) {
  const Scene = SCENES[estado] ?? Calma
  const c = color ?? COLORS[estado] ?? '#5a8a7a'
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Scene color={c} tint={tint} />
    </div>
  )
}
