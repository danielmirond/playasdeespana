'use client'
import { CheckCircle, MapPin } from '@phosphor-icons/react'
import { useState } from 'react'

interface Props {
  lat:        number
  lng:        number
  nombre:     string
  slug:       string
  meteo?:     { agua: number; olas: number; viento: number }
  scoreLabel?: string
}

export default function FichaAsideActions({ lat, lng, nombre, slug, meteo, scoreLabel }: Props) {
  const [copied, setCopied] = useState(false)

  function verEnMapa() {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(nombre)}`, '_blank')
  }

  function compartir() {
    const url = `${window.location.origin}/playas/${slug}`
    const text = meteo
      ? `${nombre} · ${meteo.agua}°C · Olas ${meteo.olas}m · Viento ${meteo.viento}km/h${scoreLabel ? `. ${scoreLabel}` : ''}`
      : nombre
    if (navigator.share) {
      navigator.share({ title: nombre, text, url })
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const btn: React.CSSProperties = {
    display:       'flex',
    alignItems:    'center',
    justifyContent:'center',
    gap:           '6px',
    width:         '100%',
    padding:       '10px 12px',
    borderRadius:  '4px',
    fontFamily:    'var(--font-sans)',
    fontSize:      '.82rem',
    fontWeight:    500,
    cursor:        'pointer',
    border:        '1px solid var(--line, #e8dcc8)',
    background:    'var(--card-bg, #faf6ef)',
    color:         'var(--accent, #6b400a)',
    transition:    'border-color .15s, background .15s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
      <button onClick={verEnMapa} style={btn}>
        <MapPin size={14} weight="bold" color="currentColor"/> Ver en Google Maps
      </button>
      <button onClick={compartir} style={btn}>
        {copied ? <><CheckCircle size={14} weight="bold" color="currentColor"/> Enlace copiado</> : '↗ Compartir playa'}
      </button>
    </div>
  )
}
