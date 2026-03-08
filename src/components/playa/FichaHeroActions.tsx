'use client'
// src/components/playa/FichaHeroActions.tsx
import { useState, useEffect } from 'react'

interface Props {
  slug:   string
  nombre: string
}

const KEY = 'playas_favoritas'

export default function FichaHeroActions({ slug, nombre }: Props) {
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
    if (navigator.share) {
      navigator.share({ title: nombre, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
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
    fontSize:      '.8rem',
    fontWeight:    500,
    cursor:        'pointer',
    border:        '1.5px solid currentColor',
    background:    'transparent',
    transition:    'all .2s',
    letterSpacing: '.01em',
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '4px 0 0' }}>
      <button onClick={toggleFav} style={{
        ...base,
        color:       fav ? '#c0392b' : 'var(--muted, #8a7560)',
        background:  fav ? 'rgba(192,57,43,.08)' : 'transparent',
        borderColor: fav ? 'rgba(192,57,43,.3)' : 'rgba(138,117,96,.3)',
      }}>
        {fav ? '❤️' : '🤍'} {fav ? 'Guardada' : 'Guardar'}
      </button>
      <button onClick={compartir} style={{
        ...base,
        color:       'var(--muted, #8a7560)',
        borderColor: 'rgba(138,117,96,.3)',
      }}>
        {copied ? '✅ Copiado' : '↗ Compartir'}
      </button>
    </div>
  )
}
