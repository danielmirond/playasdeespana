'use client'
// src/components/playa/FichaAsideActions.tsx
import { CheckCircle, MapPin } from '@phosphor-icons/react'
import { useState } from 'react'

interface Props {
  lat:    number
  lng:    number
  nombre: string
  slug:   string
}

export default function FichaAsideActions({ lat, lng, nombre, slug }: Props) {
  const [copied, setCopied] = useState(false)

  function verEnMapa() {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(nombre)}`, '_blank')
  }

  function compartir() {
    const url = `${window.location.origin}/playas/${slug}`
    if (navigator.share) {
      navigator.share({ title: nombre, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
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
    padding:       '9px 12px',
    borderRadius:  '10px',
    fontSize:      '.8rem',
    fontWeight:    500,
    cursor:        'pointer',
    border:        '1.5px solid rgba(138,117,96,.25)',
    background:    'rgba(138,117,96,.06)',
    color:         'var(--brown, #6b4c2a)',
    transition:    'all .2s',
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
