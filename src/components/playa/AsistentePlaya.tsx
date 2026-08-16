// src/components/playa/AsistentePlaya.tsx
//
// Componente server-side que renderiza el asistente "qué necesitas
// hoy para esta playa". Recibe las necesidades ya generadas por
// `getNecesidades()` (en page.tsx) para no hacer await aquí.
//
// Diseño:
//   - Lista limpia, 5 cards apiladas mobile, 2 columnas desktop.
//   - Cada card: icono + título + porQue + botón "Buscar".
//   - Botón link a amazon.es/dp/{ASIN} si tenemos ASIN, sino a
//     amazon.es/s?k={amazonQuery} (search).
//   - rel="sponsored noopener" en TODOS los enlaces (compliance Google
//     directrices afiliación 2019+).
//
// Cuando Amazon Creators API esté activa (PR #82), enriqueceremos
// con imagen + precio actual + rating. Mientras tanto, links limpios.

import type { Necesidad } from '@/lib/asistentePlaya'

interface Props {
  necesidades: Necesidad[]
  nombre:      string
  locale?:     'es' | 'en'
  /**
   * `condiciones` (por defecto) es el bloque de arriba: solo lo que
   * dispara un dato de hoy —SPF50 con UV 8, vinagre con riesgo de
   * medusas—. Se gana el sitio porque responde a algo medido.
   *
   * `generico` es el de abajo: toalla, botella, palas. Útil, pero no
   * depende de las condiciones, y mezclado con lo anterior contagiaba
   * al conjunto un aire de escaparate. Una auditoría externa lo señaló
   * y tenía razón: los tres primeros productos salían al 26% de la
   * ficha y solo uno estaba justificado por un dato.
   */
  variante?:   'condiciones' | 'generico'
}

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? 'nuus-21'

function urlAmazon(n: Necesidad): string {
  if (n.asin) {
    return `https://www.amazon.es/dp/${n.asin}?tag=${AMAZON_TAG}`
  }
  return `https://www.amazon.es/s?k=${encodeURIComponent(n.amazonQuery)}&tag=${AMAZON_TAG}`
}

// Color sobrio para el numerito de prioridad. Antes había además un
// borderLeft de 3px que se confundía con "warning" — eliminado, no
// es un aviso. Ahora la prioridad se comunica solo con el color del
// numerito que precede al título.
const COLOR_PRIORIDAD: Record<Necesidad['prioridad'], string> = {
  critica: 'var(--noapto)',
  alta:    'var(--aceptable)',
  media:   'var(--mar-500)',
  baja:    'var(--muybueno)',
}

export default function AsistentePlaya({ necesidades, nombre, locale = 'es', variante = 'condiciones' }: Props) {
  if (necesidades.length === 0) return null
  const es = locale === 'es'
  const generico = variante === 'generico'
  // Ids distintos por variante: las dos instancias conviven en la misma
  // página y repetir el id sería HTML inválido.
  const idTitulo = generico ? 'asistente-generico-titulo' : 'asistente-titulo'

  return (
    <section
      aria-labelledby={idTitulo}
      style={{
        margin: '0 0 1.5rem',
        padding: '1.1rem 1.1rem 1.25rem',
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 10,
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.7rem',
        fontWeight: 600,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        marginBottom: '.3rem',
      }}>
        {generico
          ? (es ? 'Para el día' : 'For the day')
          : (es ? 'Asistente · hoy' : 'Assistant · today')}
      </div>

      <h2
        id={idTitulo}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 .9rem',
          lineHeight: 1.25,
        }}
      >
        {generico
          ? (es
              ? <>Lo de siempre para un día de playa</>
              : <>The usual for a day at the beach</>)
          : (es
              ? <>Esto necesitas para <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em> con estas condiciones</>
              : <>This is what you need for <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em> in these conditions</>)
        }
      </h2>

      <ol style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '.6rem',
      }}>
        {necesidades.map((n, idx) => (
          <li key={n.id} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '.7rem .85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '.4rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '.45rem' }}>
              {/* Numerito de prioridad: color subtle, sin borde "warning" */}
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: COLOR_PRIORIDAD[n.prioridad],
                  color: '#fff',
                  fontSize: '.62rem',
                  fontWeight: 700,
                }}
              >
                {idx + 1}
              </span>
              {n.icono && <span style={{ fontSize: '1.05rem' }} aria-hidden="true">{n.icono}</span>}
              <span style={{ fontWeight: 700, fontSize: '.93rem', color: 'var(--ink)' }}>
                {n.titulo}
              </span>
            </div>

            <p style={{
              margin: 0,
              fontSize: '.8rem',
              color: 'var(--muted)',
              lineHeight: 1.5,
            }}>
              {n.porQue}
            </p>

            <a
              href={urlAmazon(n)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              data-asistente-id={n.id}
              data-asistente-pos={idx + 1}
              style={{
                marginTop: '.1rem',
                fontSize: '.78rem',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
                alignSelf: 'flex-start',
              }}
            >
              {es ? 'Ver opciones en Amazon' : 'See options on Amazon'}
            </a>
          </li>
        ))}
      </ol>

      <p style={{
        margin: '1rem 0 0',
        fontSize: '.7rem',
        color: 'var(--muted)',
        fontStyle: 'italic',
        lineHeight: 1.4,
      }}>
        {es
          ? 'Generado con datos reales de hoy. Si compras por estos enlaces nos llevamos una pequeña comisión — a ti no te cuesta nada.'
          : 'Generated from today\'s real data. If you buy through these links we get a small commission — at no extra cost to you.'}
      </p>
    </section>
  )
}
