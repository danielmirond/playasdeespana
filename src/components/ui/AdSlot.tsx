'use client'
import { useEffect, useRef } from 'react'

// Configurar en .env: NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? ''

interface Props {
  slot: string        // ID del bloque de anuncio
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  responsive?: boolean
  style?: React.CSSProperties
}

export default function AdSlot({ slot, format = 'auto', responsive = true, style }: Props) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current) return
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      pushed.current = true
    } catch {}
  }, [])

  if (!ADSENSE_ID) return null

  return (
    <div style={{ textAlign: 'center', margin: '.85rem 0', minHeight: 90, ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  )
}
