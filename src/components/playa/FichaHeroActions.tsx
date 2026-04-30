'use client'
import { CheckCircle, Heart } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

interface Props {
  slug:       string
  nombre:     string
  meteo?:     { agua: number; olas: number; viento: number }
  scoreLabel?: string
  /** 'light' = texto/borde blanco (sobre foto). 'dark' = texto/borde
   *  oscuro tradicional. Por defecto 'dark'. */
  theme?:     'light' | 'dark'
}

const KEY = 'playas_favoritas'

export default function FichaHeroActions({ slug, nombre, meteo, scoreLabel, theme = 'dark' }: Props) {
  const [fav, setFav] = useState(false)
  const [copied, setCopied] = useState(false)
  const isLight = theme === 'light'

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

  const base: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '6px',
    padding:       '8px 18px',
    borderRadius:  '99px',
    fontFamily:    'var(--font-sans)',
    fontSize:      '.85rem',
    fontWeight:    600,
    cursor:        'pointer',
    border:        '1px solid currentColor',
    background:    'transparent',
    transition:    'border-color .15s, background .15s, color .15s',
    letterSpacing: '.01em',
  }

  // Colores adaptativos por tema. light = texto blanco sobre foto;
  // dark = texto oscuro sobre fondo crema.
  const muted    = isLight ? 'rgba(255,255,255,.95)' : 'var(--muted, #5a3d12)'
  const mutedBd  = isLight ? 'rgba(255,255,255,.55)' : 'rgba(138,117,96,.4)'
  const hoverBg  = isLight ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.04)'
  const favColor = isLight ? '#ffb6a8'               : '#7a2818'
  const favBg    = isLight ? 'rgba(255,182,168,.18)' : 'rgba(122,40,24,.08)'
  const favBd    = isLight ? 'rgba(255,182,168,.55)' : 'rgba(122,40,24,.3)'

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', margin: '4px 0 0' }}>
      <button
        onClick={toggleFav}
        style={{
          ...base,
          color:       fav ? favColor : muted,
          background:  fav ? favBg    : 'transparent',
          borderColor: fav ? favBd    : mutedBd,
        }}
        onMouseEnter={e => { if (!fav) e.currentTarget.style.background = hoverBg }}
        onMouseLeave={e => { if (!fav) e.currentTarget.style.background = 'transparent' }}
      >
        <Heart size={15} weight={fav ? 'fill' : 'regular'} color="currentColor"/> {fav ? 'Guardada' : 'Guardar'}
      </button>
      <button
        onClick={compartir}
        style={{
          ...base,
          color:       muted,
          borderColor: mutedBd,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = hoverBg }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        {copied ? <><CheckCircle size={15} weight="bold" color="currentColor"/> Copiado</> : '↗ Compartir'}
      </button>
    </div>
  )
}
