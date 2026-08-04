// src/components/ui/Logo.tsx — el lockup, dibujado en vez de servido.
//
// Antes era <img src="/logo.svg">, y un <img> es una caja opaca: no hereda
// tipografía ni color, así que el logo se quedaba en Playfair y terracota
// aunque el resto del sitio cambiara de sistema. Era el único elemento de
// la cabecera al que los tokens no llegaban.
//
// C9 del handoff pide exactamente lo contrario: «el lockup toma la letra de
// --font-serif; el trazo de ola va en tinta». Eso solo se puede cumplir con
// el SVG en línea.
//
// Ventaja adicional: desaparece una petición de red del camino crítico, que
// además llevaba preload con prioridad alta.
//
// Componente de servidor: no hay estado ni interacción.

interface Props {
  /** Alto en px. El ancho sale de la proporción del viewBox. */
  size?: number
  /** Texto accesible. Se omite cuando el enlace que lo envuelve ya lo dice. */
  titulo?: string | null
}

export default function Logo({ size = 36, titulo = 'Playas de España' }: Props) {
  return (
    <svg
      viewBox="0 0 280 72"
      height={size}
      width={size * (280 / 72)}
      role={titulo ? 'img' : 'presentation'}
      aria-label={titulo ?? undefined}
      aria-hidden={titulo ? undefined : true}
      style={{ display: 'block', height: size, width: 'auto' }}
    >
      {titulo && <title>{titulo}</title>}

      {/* La ondita. En Arena es terracota; en Litoral el acento ES la tinta,
          así que el mismo token da los dos resultados sin condicional. */}
      <path d="M6 32 Q14 26 22 32 T38 32" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 38 Q14 32 22 38 T38 38" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>

      {/* La palabra toma --font-serif: Playfair bajo Arena, Literata bajo
          Litoral. El peso 700 es el de énfasis del sistema (--w-strong);
          se deja literal porque SVG no resuelve var() en font-weight. */}
      <text
        x="50" y="44"
        fontFamily="var(--font-serif)"
        fontSize="32" fontWeight="700" fontStyle="italic"
        fill="var(--ink)" letterSpacing="-0.5"
      >playas</text>

      <path d="M55 50 Q95 52 155 50" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>

      <text
        x="50" y="63"
        fontFamily="var(--font-sans)"
        fontSize="9" fontWeight="500" letterSpacing="3"
        fill="var(--ink-mute)"
      >DE ESPAÑA</text>
    </svg>
  )
}
