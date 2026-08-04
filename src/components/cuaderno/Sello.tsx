// src/components/cuaderno/Sello.tsx
// Sello del cuaderno — entregable §5.5 de la propuesta de diseño 2026.
//
// "Sello de pasaporte, no logro de videojuego": grabado en línea fina,
// tinta impresa ligeramente fuera de registro y fecha en monoespaciada.
// Nada de emojis ni de brillos — un cuaderno se colecciona porque se
// parece a algo que se guarda.
//
// Es SVG puro renderizado en servidor: nítido a cualquier escala, sin
// canvas, sin imágenes y sin una línea de JavaScript de cliente.

interface Props {
  /** Nombre de la playa */
  nombre: string
  /** Provincia (va en versalitas) */
  provincia?: string
  /** Fecha del sello, ya formateada: "12·07·26" */
  fecha: string
  size?: number
  /** Segunda tinta del cuaderno; se alterna para que la hoja no sea plana */
  tono?: 'ink' | 'accent'
  /** Ángulo del estampado. Un sello nunca cae recto */
  rot?: number
}

// Seis marcas simples para el centro del sello. Se elige por el nombre,
// así que una playa siempre sella con el mismo glifo.
const GLIFOS: Record<string, string> = {
  ola:      'M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7.5 0',
  sol:      'M12 5v-3M12 22v-3M5 12H2M22 12h-3M7 7 5 5M19 19l-2-2M17 7l2-2M5 19l2-2',
  brujula:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M15.5 8.5l-2 5-5 2 2-5z',
  ancla:    'M12 7v14M12 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M4 14a8 8 0 0 0 16 0M6 11h12',
  faro:     'M9 21h6M10 21l1-11h2l1 11M9 10h6M12 3v3M8.5 5 7 4M15.5 5 17 4',
  concha:   'M12 21C7 21 3 17 3 12a9 9 0 0 1 18 0c0 5-4 9-9 9M12 21V4M8 20 6.5 6M16 20l1.5-14',
}
const ORDEN = ['ola', 'sol', 'brujula', 'ancla', 'faro', 'concha']

function glifoDe(nombre: string): string {
  let h = 0
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0
  return GLIFOS[ORDEN[h % ORDEN.length]]
}

export default function Sello({ nombre, provincia = '', fecha, size = 108, tono = 'ink', rot = -4 }: Props) {
  const r = size / 2
  const col = tono === 'accent' ? 'var(--sello-accent)' : 'var(--sello-ink)'
  // El arco necesita un id único por sello dentro de la página
  const uid = `sl-${nombre.replace(/\W/g, '')}-${fecha.replace(/\W/g, '')}-${size}`
  const glifo = glifoDe(nombre)
  // El nombre largo baja de cuerpo para no salirse del troquel
  const fsNombre = size * (nombre.length > 16 ? 0.088 : nombre.length > 12 ? 0.105 : 0.125)

  // Una pasada del grabado. Se pinta dos veces: la de acento va desplazada
  // 1,5px, que es lo que da el fuera de registro de la tinta real.
  const Pasada = ({ dx = 0, dy = 0, op = 1, c }: { dx?: number; dy?: number; op?: number; c: string }) => (
    <g transform={`translate(${dx},${dy})`} opacity={op}>
      <circle cx={r} cy={r} r={r - 3} fill="none" stroke={c} strokeWidth="var(--sello-stroke, 1.25px)" />
      <circle cx={r} cy={r} r={r - 8} fill="none" stroke={c} strokeWidth="0.5" opacity="0.55" />
      {/* dientes del troquel */}
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2
        return (
          <line
            key={i}
            x1={r + (r - 8) * Math.sin(a)} y1={r - (r - 8) * Math.cos(a)}
            x2={r + (r - 5.5) * Math.sin(a)} y2={r - (r - 5.5) * Math.cos(a)}
            stroke={c} strokeWidth="0.5" opacity="0.4"
          />
        )
      })}
      {/* Arco superior: la marca del cuaderno, fija en todos los sellos */}
      <path id={`${uid}-arc`} d={`M ${r - (r - 14)} ${r} A ${r - 14} ${r - 14} 0 0 1 ${r + (r - 14)} ${r}`} fill="none" />
      <text fontSize={size * 0.072} fill={c} fontFamily="var(--font-mono)" letterSpacing={size * 0.021}>
        <textPath href={`#${uid}-arc`} startOffset="50%" textAnchor="middle">PLAYAS DE ESPAÑA</textPath>
      </text>
      {/* Glifo del carácter de la playa */}
      <g transform={`translate(${r - size * 0.085}, ${r - size * 0.205}) scale(${size * 0.0071})`} opacity="0.75">
        <path d={glifo} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={r} y={r + size * 0.075} textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="700" fontSize={fsNombre} fill={c}>
        {nombre}
      </text>
      {provincia && (
        <text x={r} y={r + size * 0.175} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size * 0.062} fill={c} opacity="0.75">
          {provincia.toUpperCase()}
        </text>
      )}
      <line x1={r - size * 0.16} y1={r + size * 0.215} x2={r + size * 0.16} y2={r + size * 0.215} stroke={c} strokeWidth="0.5" opacity="0.5" />
      {/* La fecha es lo que convierte el dibujo en un REGISTRO */}
      <text x={r} y={r + size * 0.3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size * 0.07} fill={c}>
        {fecha}
      </text>
    </g>
  )

  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Sello de ${nombre}${provincia ? `, ${provincia}` : ''}, ${fecha}`}
      style={{ opacity: 0.88, mixBlendMode: 'multiply', transform: `rotate(${rot}deg)` }}
    >
      <Pasada dx={1.5} dy={1.5} op={0.35} c="var(--sello-accent)" />
      <Pasada c={col} />
    </svg>
  )
}

interface InsigniaProps {
  /** Numeral romano — da aire de sello oficial y escala sin dibujar iconos */
  numeral: string
  titulo: string
  detalle: string
  conseguida: boolean
  ancho?: number
}

/**
 * Insignia grabada, tipo certificado. Las conseguidas van con filete y
 * fondo de papel; las pendientes al 50% y sin fondo — visibles como
 * meta, nunca como carencia.
 */
export function Insignia({ numeral, titulo, detalle, conseguida, ancho = 132 }: InsigniaProps) {
  return (
    <div style={{
      width: ancho, padding: '12px 10px 11px', textAlign: 'center',
      border: `1px solid ${conseguida ? 'var(--line-strong)' : 'var(--line)'}`,
      borderRadius: 'var(--r-sello, 3px)',
      background: conseguida ? 'var(--surface-2)' : 'transparent',
      opacity: conseguida ? 1 : 0.5,
      position: 'relative',
    }}>
      {/* filete doble grabado */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: 3, border: '0.5px solid var(--line)', borderRadius: 2, pointerEvents: 'none' }} />
      <div style={{
        fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 22, lineHeight: 1,
        color: conseguida ? 'var(--sello-accent)' : 'var(--muted)',
      }}>{numeral}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12.5, fontWeight: 700, marginTop: 6, color: 'var(--ink)' }}>{titulo}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', marginTop: 4, lineHeight: 1.35 }}>{detalle}</div>
    </div>
  )
}
