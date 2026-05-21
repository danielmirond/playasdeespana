// src/components/playa/ReporteSistemaCard.tsx
//
// Card visible que muestra el reporte sistema (auto-generado server-side
// desde los datos meteo). Visualmente similar a un reporte humano, con
// badge "Sistema" para no confundir al usuario.
//
// Server component: nada de estado/cliente. El reporte se calcula en
// render con los datos frescos del meteo.

import { Cpu } from '@phosphor-icons/react/dist/ssr'
import type { ReporteSistema } from '@/lib/reporteSistema'
import { tiempoRelativo } from '@/lib/reporteSistema'

interface Props {
  reporte: ReporteSistema
  locale?: 'es' | 'en'
}

const COLORES_SEV = {
  ok:     { dot: '#3d6b1f', bg: '#f5fbed' },
  warn:   { dot: '#c48a1e', bg: '#fcf6e6' },
  danger: { dot: '#7a2818', bg: '#fbeee8' },
}

export default function ReporteSistemaCard({ reporte, locale = 'es' }: Props) {
  const es = locale === 'es'
  const col = COLORES_SEV[reporte.severidad]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '.7rem',
        padding: '.7rem .9rem',
        background: col.bg,
        border: '1px solid var(--line, #e8dcc8)',
        borderLeft: `3px solid ${col.dot}`,
        borderRadius: 6,
        marginBottom: '.6rem',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28, height: 28,
          borderRadius: '50%',
          background: '#fff',
          border: `1px solid ${col.dot}55`,
        }}
      >
        <Cpu size={16} color={col.dot} weight="bold" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.5rem', marginBottom: '.2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
            <span style={{
              fontSize: '.65rem', fontWeight: 700,
              padding: '.12rem .45rem',
              background: '#fff', border: `1px solid ${col.dot}55`,
              borderRadius: 100, color: col.dot,
              letterSpacing: '.04em', textTransform: 'uppercase',
            }}>
              {es ? 'Sistema' : 'System'}
            </span>
            <span style={{ fontSize: '.7rem', color: 'var(--muted, #5a3d12)' }}>
              {tiempoRelativo(reporte.ts)}
            </span>
          </div>
        </div>
        <div style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--ink, #2a1a08)', lineHeight: 1.3 }}>
          {reporte.titulo}
        </div>
        <div style={{ fontSize: '.82rem', color: 'var(--muted, #5a3d12)', marginTop: '.2rem' }}>
          {reporte.detalle}
        </div>
      </div>
    </div>
  )
}
