// src/components/playa/Certeza.tsx — Gramática de certeza del dato.
// Implementa el entregable §5.4 de la propuesta de diseño 2026.
//
// Regla del sistema: el color solo matiza; el peso lo lleva el TRAZO del
// subrayado (sólido → punteado → discontinuo → nada), para que el grado
// de confianza se lea en monocromo, sobre fotografía y a 375px.
//
// Son componentes de SERVIDOR: solo pintan `data-cert` y el CSS de
// globals.css hace el resto. Cero hidratación, cero JavaScript.

export type Certeza = 'medido' | 'oficial' | 'reportado' | 'estimado' | 'sindato'

/** Etiquetas de la insignia, por grado de confianza. */
const LABEL: Record<Certeza, { es: string; en: string }> = {
  medido:    { es: 'Medido',    en: 'Measured' },
  oficial:   { es: 'Oficial',   en: 'Official' },
  reportado: { es: 'Reportado', en: 'Reported' },
  estimado:  { es: 'Estimado',  en: 'Estimated' },
  sindato:   { es: 'Sin dato',  en: 'No data' },
}

interface DatoProps {
  /** Valor ya formateado. null o undefined ⇒ estado "sin dato" ("—") */
  v?: string | number | null
  /** Unidad (°C, m, km/h…). Se omite cuando no hay dato. */
  u?: string
  cert: Certeza
  /** px del número */
  size?: number
  /** Sobre foto: el trazo pasa a blanco (el color ya no distingue, el patrón sí) */
  onDark?: boolean
  title?: string
}

/**
 * Una cifra con su grado de confianza codificado en el subrayado.
 * Sin dato ⇒ "—" en peso normal y sin trazo; quien llame debe además
 * OMITIR la conclusión (etiqueta de veredicto, frase del día).
 */
export function Dato({ v, u, cert, size = 26, onDark, title }: DatoProps) {
  const vacio = v === null || v === undefined || v === ''
  const c: Certeza = vacio ? 'sindato' : cert
  return (
    <span
      className={`dato${onDark ? ' dato-ondark' : ''}`}
      data-cert={c}
      style={{ fontSize: size }}
      title={title}
    >
      {vacio ? (
        // «Sin dato» es un estado de primera clase, no un hueco (Litoral).
        // Con palabras y en contraste AA: un "—" obliga a interpretar, y
        // quien usa lector de pantalla no oye nada útil. El tamaño baja
        // porque son letras donde había una cifra.
        <span className="dato-vacio" style={{ fontSize: Math.round(size * 0.52) }}>sin dato</span>
      ) : (
        <>
          {/* .num/.num-live: Literata tabular en 700. Al ser tabulares nada
              baila cuando el valor se actualiza en vivo. Bajo Arena estas
              clases no existen y la cifra hereda, así que el mismo
              componente sirve a las dos hojas. */}
          <span className="num num-live">{v}</span>
          {u && <span className="dato-u num-unit">{u}</span>}
        </>
      )}
    </span>
  )
}

interface CertBadgeProps {
  cert: Certeza
  /** Texto libre de fuente ("BOYA A 5 KM", "SOCORRISMO 09:40"). */
  children?: React.ReactNode
  locale?: 'es' | 'en'
}

/**
 * Insignia de fuente para el hueco derecho del cardHead — el lugar donde
 * el sitio ya dice de dónde viene cada bloque. No se repite en cada cifra:
 * el subrayado ya lleva esa señal.
 */
export function CertBadge({ cert, children, locale = 'es' }: CertBadgeProps) {
  return (
    <span className="cert-badge" data-cert={cert}>
      <span className="cert-glyph" aria-hidden="true" />
      {children ?? LABEL[cert][locale]}
    </span>
  )
}
