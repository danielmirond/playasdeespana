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
import { tinte } from '@/lib/tinte'

interface Props {
  reporte: ReporteSistema
  locale?: 'es' | 'en'
}

const COLORES_SEV = {
  ok:     { dot: 'var(--excelente)', bg: 'color-mix(in srgb, var(--excelente) 7%, var(--bg))' },
  warn:   { dot: 'var(--aceptable)', bg: 'color-mix(in srgb, var(--aceptable) 8%, var(--bg))' },
  danger: { dot: 'var(--noapto)', bg: 'color-mix(in srgb, var(--noapto) 8%, var(--bg))' },
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
        border: '1px solid var(--line)',
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
          border: `1px solid ${tinte(col.dot, 33)}`,
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
              background: '#fff', border: `1px solid ${tinte(col.dot, 33)}`,
              borderRadius: 100, color: col.dot,
              letterSpacing: '.04em', textTransform: 'uppercase',
            }}>
              {es ? 'Sistema' : 'System'}
            </span>
            <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>
              {tiempoRelativo(reporte.ts)}
            </span>
          </div>
        </div>
        <div style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.3 }}>
          {reporte.titulo}
        </div>
        <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.2rem' }}>
          {reporte.detalle}
        </div>
      </div>
    </div>
  )
}
