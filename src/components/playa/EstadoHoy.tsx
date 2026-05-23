// src/components/playa/EstadoHoy.tsx
//
// Fusión visual de:
//   - Reporte sistema (server-side, auto-generado de meteo)
//   - QuickChips (client-side, 1 tap = aporta reporte humano)
//
// Antes vivían como 2 cards distintas con dos paletas y dos headers
// repetidos ("¿Cómo está hoy?"). Ahora UNA sola card con header
// compartido + sistema-row + chips. Reduce cognitive load ~50%
// según el critique de diseño (PR #84).

import { Cpu } from '@phosphor-icons/react/dist/ssr'
import type { ReporteSistema } from '@/lib/reporteSistema'
import { tiempoRelativo } from '@/lib/reporteSistema'
import QuickChips from './QuickChips'

interface Props {
  slug:    string
  nombre:  string
  reporte: ReporteSistema | null
  locale?: 'es' | 'en'
}

const COLOR_SEV: Record<ReporteSistema['severidad'], string> = {
  ok:     '#3d6b1f',
  warn:   '#c48a1e',
  danger: '#7a2818',
}

export default function EstadoHoy({ slug, nombre, reporte, locale = 'es' }: Props) {
  const es = locale === 'es'
  // Si no hay reporte sistema NI sentido de mostrar chips, no renderiza.
  // Con chips siempre hay valor, así que sigue mostrándose.

  return (
    <section
      aria-labelledby="estado-hoy-titulo"
      style={{
        margin: '0 0 1.5rem',
        background: 'linear-gradient(135deg, #faf6ef 0%, #f0e6d0 100%)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Top: header + sistema-row */}
      <div style={{ padding: '1rem 1.1rem .85rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '.7rem',
          fontWeight: 600,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--muted, #5a3d12)',
          marginBottom: '.25rem',
        }}>
          {es ? 'Estado actual' : 'Current state'}
        </div>
        <h2
          id="estado-hoy-titulo"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--ink, #2a1a08)',
            margin: '0 0 .65rem',
            lineHeight: 1.25,
          }}
        >
          {es
            ? <>¿Cómo está <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em> hoy?</>
            : <>How is <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em> today?</>}
        </h2>

        {/* Sistema-row: si hay reporte, va en pill compacta */}
        {reporte && (
          <div
            role="status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.5rem',
              background: '#fff',
              border: '1px solid var(--line, #e8dcc8)',
              borderRadius: 100,
              padding: '.4rem .8rem',
              fontSize: '.82rem',
              maxWidth: '100%',
              flexWrap: 'wrap',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: COLOR_SEV[reporte.severidad],
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 600, color: 'var(--ink, #2a1a08)' }}>
              {reporte.titulo}
            </span>
            <span style={{ color: 'var(--muted, #5a3d12)', fontSize: '.76rem' }}>
              · {reporte.detalle}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '.68rem',
                color: 'var(--muted, #5a3d12)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.25rem',
              }}
            >
              <Cpu size={11} weight="regular" aria-hidden="true" />
              {es ? 'Sistema' : 'System'} · {tiempoRelativo(reporte.ts)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: chips separados por línea fina */}
      <div style={{
        padding: '.75rem 1.1rem 1.1rem',
        borderTop: '1px dashed var(--line, #e8dcc8)',
      }}>
        <div style={{
          fontSize: '.72rem',
          color: 'var(--muted, #5a3d12)',
          marginBottom: '.55rem',
          lineHeight: 1.4,
        }}>
          {es
            ? '¿Estás allí ahora mismo? Cuéntalo en un toque'
            : 'You there right now? Share it in one tap'}
        </div>
        <QuickChips slug={slug} locale={locale} inlineMode />
      </div>
    </section>
  )
}
