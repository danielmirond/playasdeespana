'use client'
import { useEffect, useRef } from 'react'

// Configurar en .env: NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX
import { ADSENSE_ID, type FormatoAd } from '@/lib/adsense'

/**
 * Altura RESERVADA por formato, para que el anuncio no empuje el contenido
 * al llegar.
 *
 * Antes era `minHeight: 90` para todo. En un robapáginas eso son 160 px de
 * salto: el bloque nace de 90, AdSense mete un 300×250 y todo lo de abajo
 * baja de golpe. El CLS de esta página es un activo —está en cero— y se
 * pierde con un solo hueco mal reservado.
 *
 * Los valores son los tamaños reales que sirve AdSense en cada formato, no
 * números redondos: 250 el rectángulo (300×250), 90 el horizontal (728×90 y
 * el 320×100 de móvil), 600 el vertical (300×600).
 */
const ALTURA: Record<string, number> = {
  rectangle: 250,
  horizontal: 90,
  vertical: 600,
  auto: 250,
  autorelaxed: 420,   // el Multiplex es una rejilla y ocupa bastante más
}

interface Props {
  slot: string        // ID NUMÉRICO del bloque en AdSense
  format?: FormatoAd
  responsive?: boolean
  style?: React.CSSProperties
  /** Texto de la etiqueta. Por defecto «Publicidad». */
  etiqueta?: string
  /** Altura reservada. Si no se pasa, se deduce del formato. */
  alto?: number
}

export default function AdSlot({ slot, format = 'auto', responsive = true, style, etiqueta = 'Publicidad', alto }: Props) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  // El Multiplex (`autorelaxed`) NO lleva `full-width-responsive`: es una
  // rejilla que se dimensiona sola y el atributo sobra.
  const anchoCompleto = format === 'autorelaxed'
    ? {}
    : { 'data-full-width-responsive': responsive }

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current) return
    try {
      ;((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({})
      pushed.current = true
    } catch { /* el script no ha cargado o el consentimiento lo bloquea */ }
  }, [])

  // Sin ID no se pinta NADA: ni caja, ni hueco reservado, ni la palabra
  // «Publicidad». Un espacio vacío rotulado como publicidad es la peor
  // versión de las dos cosas — ocupa como un anuncio y no es ninguno. Es la
  // misma lección del bloque de GetYourGuide que se quedó siendo un titular
  // y un aviso de comisión sobre nada.
  if (!ADSENSE_ID) return null

  return (
    <aside
      aria-label={etiqueta}
      style={{ textAlign: 'center', minHeight: alto ?? ALTURA[format] ?? 250, ...style }}
    >
      {/* La etiqueta va SIEMPRE y va arriba. No es una formalidad legal: es
          la misma regla que el resto del sitio —cada dato dice de dónde
          sale— aplicada a lo que no es un dato. Un anuncio que no se
          identifica se apoya en la credibilidad de las mediciones que tiene
          al lado, y esa credibilidad no está en venta. */}
      <span style={{
        display: 'block', fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase',
        color: 'var(--ink-mute, #8a8378)', marginBottom: '.35rem',
      }}>{etiqueta}</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        {...anchoCompleto}
      />
    </aside>
  )
}
