// src/components/ui/SeaIcon.tsx — el estado del mar, dibujado.
//
// Portado de components/icons.jsx del handoff. Se trae este y no el set
// entero por una razón: es el único icono del paquete que SIGNIFICA algo
// dentro del sistema. Los otros 24 son vocabulario general —una cama, un
// tenedor— y ahí Phosphor ya cumple; este codifica los seis estados que
// gobiernan la ficha, y mapea uno a uno con ESTADOS de lib/estados.
//
// Y arregla algo de paso. Hasta ahora el estado se pintaba como un punto
// de color: verde, ámbar, rojo. Un punto sin color no dice nada, así que
// para quien no distingue esos tonos —o en monocromo, o con el contraste
// alto del sistema operativo— la información simplemente no llegaba. Es
// la misma lógica que el handoff aplica a la certeza cuando la codifica
// en el trazo y no en el tono: la forma tiene que bastar.
//
// Va en `currentColor`, así que hereda el color del estado sin recibir
// ningún token por props.
//
// Componente de servidor: no hay estado ni interacción.

import type { EstadoBano } from '@/types'

interface Props {
  estado: EstadoBano
  /** Lado en px. El viewBox es cuadrado. */
  size?: number
  /**
   * Color del trazo. Por defecto hereda (`currentColor`), que es lo que
   * quieres cuando el icono va dentro de algo ya teñido. Las filas de
   * estado pintan la etiqueta en un tono y la señal en otro, y ahí hay
   * que pasarlo.
   */
  color?: string
  /**
   * Texto accesible. Se omite cuando el estado ya se nombra al lado —que
   * es lo normal—, para no repetirlo al lector de pantalla.
   */
  titulo?: string | null
}

// Trazo 1.5 y remates redondos: el filete del sistema. No se sube a 2px
// —ahí empieza «medido» en la gramática de certeza— ni se rellena.
const comun = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const TRAZOS: Record<EstadoBano, React.ReactNode> = {
  CALMA: (
    <>
      <line x1="6" y1="30" x2="42" y2="30" opacity="0.3" />
      <path d="M 8 34 Q 12 32.5 16 34 T 24 34 T 32 34 T 40 34" />
      <path d="M 10 38 Q 14 37 18 38 T 26 38 T 34 38" opacity="0.5" />
      <circle cx="34" cy="18" r="4" opacity="0.5" />
    </>
  ),
  BUENA: (
    <>
      <line x1="6" y1="30" x2="42" y2="30" opacity="0.3" />
      <path d="M 8 34 Q 13 30.5 18 34 T 28 34 T 38 34" />
      <path d="M 8 40 Q 13 37 18 40 T 28 40 T 38 40" opacity="0.6" />
      <circle cx="34" cy="16" r="5" />
      <line x1="34" y1="7" x2="34" y2="9" />
      <line x1="41" y1="16" x2="43" y2="16" />
      <line x1="40" y1="10" x2="41.5" y2="8.5" />
    </>
  ),
  AVISO: (
    <>
      <line x1="6" y1="28" x2="42" y2="28" opacity="0.3" />
      <path d="M 6 34 Q 12 28 18 34 T 30 34 T 42 34" />
      <path d="M 6 40 Q 12 35 18 40 T 30 40 T 42 40" opacity="0.7" />
      <path d="M 30 8 L 38 20 L 22 20 Z" />
      <line x1="30" y1="12" x2="30" y2="16" />
      <circle cx="30" cy="18" r="0.5" fill="currentColor" stroke="none" />
    </>
  ),
  SURF: (
    <>
      <line x1="6" y1="26" x2="42" y2="26" opacity="0.3" />
      <path d="M 6 36 Q 10 22 20 26 Q 28 30 36 20 Q 40 18 42 20" />
      <path d="M 20 26 Q 22 32 28 32" opacity="0.5" />
      <path d="M 36 20 L 34 14 M 38 20 L 39 14 M 40 20 L 42 16" opacity="0.6" />
      <path d="M 8 40 Q 14 38 20 40 T 32 40 T 42 40" opacity="0.4" />
    </>
  ),
  VIENTO: (
    <>
      <line x1="6" y1="32" x2="42" y2="32" opacity="0.3" />
      <path d="M 6 14 L 30 14 Q 34 14 34 18 Q 34 22 30 22 L 6 22" opacity="0.8" />
      <path d="M 10 22 L 36 22 Q 40 22 40 26 Q 40 30 36 30 L 10 30" />
      <path d="M 6 38 L 22 38 Q 26 38 26 40" opacity="0.6" />
      <path d="M 8 42 Q 12 40.5 16 42 T 24 42 T 32 42 T 40 42" opacity="0.5" />
    </>
  ),
  PELIGRO: (
    <>
      <line x1="6" y1="26" x2="42" y2="26" opacity="0.3" />
      <path d="M 6 36 Q 10 20 16 32 Q 20 38 24 28 Q 28 18 34 30 Q 38 38 42 30" />
      <path d="M 6 42 Q 12 38 18 42 T 30 42 T 42 42" opacity="0.6" />
      <line x1="36" y1="8" x2="36" y2="20" strokeWidth="2" />
      <path d="M 36 8 L 44 10 L 36 14 Z" fill="currentColor" stroke="currentColor" />
    </>
  ),
}

export default function SeaIcon({ estado, size = 20, color, titulo = null }: Props) {
  return (
    <svg
      {...comun}
      width={size}
      height={size}
      role={titulo ? 'img' : 'presentation'}
      aria-label={titulo ?? undefined}
      aria-hidden={titulo ? undefined : true}
      style={{ display: 'block', flexShrink: 0, ...(color ? { color } : null) }}
    >
      {titulo && <title>{titulo}</title>}
      {TRAZOS[estado] ?? TRAZOS.CALMA}
    </svg>
  )
}
