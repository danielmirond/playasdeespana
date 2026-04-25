'use client'
import { CheckCircle, Heart } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

interface Props {
  slug:       string
  nombre:     string
  meteo?:     { agua: number; olas: number; viento: number }
  scoreLabel?: string
}

const KEY = 'playas_favoritas'

export default function FichaHeroActions({ slug, nombre, meteo, scoreLabel }: Props) {
  const [fav, setFav] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      setFav(favs.includes(slug))
    } catch {}
  }, [slug])

  function toggleFav() {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      const next = fav ? favs.filter(s => s !== slug) : [...favs, slug]
      localStorage.setItem(KEY, JSON.stringify(next))
      setFav(!fav)
    } catch {}
  }

  function compartir() {
    const url = window.location.href
    const text = meteo
      ? `${nombre} · ${meteo.agua}°C · Olas ${meteo.olas}m · Viento ${meteo.viento}km/h${scoreLabel ? ` — ${scoreLabel}` : ''}`
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

  const base: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '6px',
    padding:       '7px 16px',
    borderRadius:  '99px',
    fontFamily:    'var(--font-sans)',
    fontSize:      '.8rem',
    fontWeight:    500,
    cursor:        'pointer',
    border:        '1px solid currentColor',
    background:    'transparent',
    transition:    'border-color .15s, background .15s',
    letterSpacing: '.01em',
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '4px 0 0' }}>
      <button onClick={toggleFav} style={{
        ...base,
        color:       fav ? '#7a2818' : 'var(--muted, #5a3d12)',
        background:  fav ? 'rgba(122,40,24,.08)' : 'transparent',
        borderColor: fav ? 'rgba(122,40,24,.3)' : 'rgba(138,117,96,.3)',
      }}>
        <Heart size={14} weight={fav ? 'fill' : 'regular'} color="currentColor"/> {fav ? 'Guardada' : 'Guardar'}
      </button>
      <button onClick={compartir} style={{
        ...base,
        color:       'var(--muted, #5a3d12)',
        borderColor: 'rgba(138,117,96,.3)',
      }}>
        {copied ? <><CheckCircle size={14} weight="bold" color="currentColor"/> Copiado</> : '↗ Compartir'}
      </button>
    </div>
  )
}
