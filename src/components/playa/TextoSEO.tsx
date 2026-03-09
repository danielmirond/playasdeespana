// src/components/playa/TextoSEO.tsx
import type { Playa } from '@/types'
import { generarTextoPlaya } from '@/lib/textoPlaya'

interface Props { playa: Playa }

export default function TextoSEO({ playa }: Props) {
  const texto = generarTextoPlaya(playa)

  return (
    <details style={{
      background: 'var(--card-bg,#faf6ef)',
      border: '1.5px solid var(--line,#e8dcc8)',
      borderRadius: '20px',
      overflow: 'hidden',
      marginBottom: '1rem',
    }}>
      <summary style={{
        padding: '1rem 1.25rem',
        fontWeight: 700,
        fontSize: '.9rem',
        color: 'var(--ink,#2a1a08)',
        cursor: 'pointer',
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}>
        <span>📖 Sobre {playa.nombre}</span>
        <span style={{ fontSize: '.75rem', color: 'var(--muted,#8a7560)', fontWeight: 400 }}>
          Todo lo que necesitas saber ↓
        </span>
      </summary>

      <div style={{
        padding: '0 1.25rem 1.25rem',
        fontSize: '.85rem',
        lineHeight: '1.7',
        color: 'var(--ink,#2a1a08)',
        borderTop: '1px solid var(--line,#e8dcc8)',
        paddingTop: '1rem',
      }}>
        <p style={{ margin: 0 }}>{texto}</p>

        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--line,#e8dcc8)',
          fontSize: '.72rem',
          color: 'var(--muted,#8a7560)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '.35rem',
        }}>
          {[
            playa.nombre,
            `playa ${playa.municipio}`,
            `playas ${playa.provincia}`,
            playa.bandera ? 'bandera azul' : null,
            playa.actividades?.surf ? 'surf' : null,
            `temperatura agua ${playa.provincia}`,
            `estado mar ${playa.municipio} hoy`,
          ].filter(Boolean).map((tag, i) => (
            <span key={i} style={{
              background: 'rgba(176,104,32,.08)',
              border: '1px solid var(--line,#e8dcc8)',
              borderRadius: '100px',
              padding: '.15rem .5rem',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </details>
  )
}
