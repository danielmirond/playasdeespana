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
  ok:     'var(--excelente)',
  warn:   'var(--aceptable)',
  danger: 'var(--noapto)',
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
        // El degradado se declara una vez y da dos resultados: en Arena los
        // dos tonos de tarjeta son arena cálida y se nota; en Litoral son
        // papel sobre papel y la caja queda plana, que es lo que pide.
        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--card-bg2) 100%)',
        border: '1px solid var(--line)',
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
          color: 'var(--muted)',
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
            color: 'var(--ink)',
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
              // flex-start: con el texto en varias líneas, centrar dejaba el
              // punto y el sello «Sistema» flotando a media altura.
              alignItems: 'flex-start',
              gap: '.5rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--line)',
              // 6 y no 100. Era una píldora, y una píldora solo funciona en
              // UNA línea: con `flexWrap` puesto, en cuanto el texto salta a
              // tres el radio de 100px convierte la caja en un pegote con
              // los lados redondos. Además el sistema no usa esas formas —
              // su radio de tarjeta es pequeño y su lenguaje es el grabado.
              borderRadius: 6,
              padding: '.5rem .8rem',
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
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              {reporte.titulo}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: '.76rem' }}>
              · {reporte.detalle}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '.68rem',
                color: 'var(--muted)',
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
        // Sólido, no discontinuo: en este sistema el trazo discontinuo
        // significa «dato estimado». Un separador decorativo con ese trazo
        // dice algo que no quiere decir.
        borderTop: '1px solid var(--line)',
      }}>
        <div style={{
          fontSize: '.72rem',
          color: 'var(--muted)',
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
