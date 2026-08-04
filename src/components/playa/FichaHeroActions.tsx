'use client'
import { CheckCircle, Heart, MapPin } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { estuveEn, marcarVisita, borrarVisita } from '@/lib/cuaderno'
import styles from './FichaHeroActions.module.css'

interface Props {
  slug:       string
  nombre:     string
  municipio?: string
  provincia?: string
  comunidad?: string
  meteo?:     { agua: number; olas: number; viento: number }
  scoreLabel?: string
  /** 'light' = texto/borde blanco (sobre foto). 'dark' = texto/borde
   *  oscuro tradicional. Por defecto 'dark'. */
  theme?:     'light' | 'dark'
}

const KEY = 'playas_favoritas'

export default function FichaHeroActions({ slug, nombre, municipio = '', provincia = '', comunidad = '', meteo, scoreLabel, theme = 'dark' }: Props) {
  const [fav, setFav] = useState(false)
  const [copied, setCopied] = useState(false)
  const [estuve, setEstuve] = useState(false)
  const [recienMarcada, setRecienMarcada] = useState(false)
  // Overflow de acciones secundarias (propuesta 2026 §5.2): en móvil solo
  // se ve la primaria; "Estuve aquí" y "Compartir" viven tras el "···".
  const [overflow, setOverflow] = useState(false)
  // Onboarding mínimo: la PRIMERA vez el overflow va etiquetado ("Más"),
  // porque tres puntos a secas no dicen que ahí viven "Estuve aquí" y
  // "Compartir". Al usarlo una vez, pasa a ser el "···" discreto.
  const [primeraVez, setPrimeraVez] = useState(false)
  const isLight = theme === 'light'

  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      setFav(favs.includes(slug))
    } catch {}
    setEstuve(estuveEn(slug))
    try { setPrimeraVez(!localStorage.getItem('overflow_visto')) } catch {}
  }, [slug])

  function toggleEstuve() {
    if (estuve) {
      borrarVisita(slug)
      setEstuve(false)
      setRecienMarcada(false)
      return
    }
    marcarVisita(slug, { n: nombre, m: municipio, p: provincia, c: comunidad })
    setEstuve(true)
    setRecienMarcada(true)  // enseña el enlace al cuaderno justo tras marcar
    // Contador social anónimo — el localStorage evita dobles votos.
    fetch('/api/estuve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
  }

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
    // Píldoras siempre a una línea: con 3 botones en 375px, "Estuve
    // aquí" partía en dos líneas y desigualaba las alturas. El wrap lo
    // hace el contenedor (flexWrap), no el texto.
    whiteSpace:    'nowrap',
  }

  // Colores adaptativos por tema. light = texto blanco sobre foto;
  // dark = texto oscuro sobre fondo crema.
  const muted    = isLight ? 'rgba(255,255,255,.95)' : 'var(--muted)'
  const mutedBd  = isLight ? 'rgba(255,255,255,.55)' : 'rgba(138,117,96,.4)'
  const hoverBg  = isLight ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.04)'
  const favColor = isLight ? '#ffb6a8'               : 'var(--noapto)'
  const favBg    = isLight ? 'rgba(255,182,168,.18)' : 'color-mix(in srgb, var(--noapto) 8%, transparent)'
  const favBd    = isLight ? 'rgba(255,182,168,.55)' : 'color-mix(in srgb, var(--noapto) 30%, transparent)'

  return (
    <div className={styles.fila} data-overflow={String(overflow)}>
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
        onClick={() => {
          setOverflow(o => !o)
          if (primeraVez) {
            setPrimeraVez(false)
            try { localStorage.setItem('overflow_visto', '1') } catch {}
          }
        }}
        className={styles.overflowBtn}
        aria-expanded={overflow}
        aria-label={overflow ? 'Menos acciones' : 'Más acciones'}
        style={{ ...base, color: muted, borderColor: mutedBd, padding: '8px 14px', minWidth: 44 }}
      >
        <span style={{ fontSize: '1.05rem', lineHeight: .6 }} aria-hidden="true">···</span>
        {primeraVez && !overflow && <span style={{ marginLeft: 4 }}>Más</span>}
      </button>
      <button
        onClick={toggleEstuve}
        className={styles.secundaria}
        title={estuve ? 'Quitar de mi cuaderno de playas' : 'Marcar en mi cuaderno de playas'}
        style={{
          ...base,
          color:       estuve ? favColor : muted,
          background:  estuve ? favBg    : 'transparent',
          borderColor: estuve ? favBd    : mutedBd,
        }}
        onMouseEnter={e => { if (!estuve) e.currentTarget.style.background = hoverBg }}
        onMouseLeave={e => { if (!estuve) e.currentTarget.style.background = 'transparent' }}
      >
        <MapPin size={15} weight={estuve ? 'fill' : 'regular'} color="currentColor"/> {estuve ? 'Estuviste aquí' : 'Estuve aquí'}
      </button>
      <button
        onClick={compartir}
        className={styles.secundaria}
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
      {recienMarcada && (
        <Link href="/mi-cuaderno" style={{
          ...base,
          color: isLight ? '#fff' : 'var(--accent)',
          borderColor: isLight ? 'rgba(255,255,255,.55)' : 'var(--accent)',
          textDecoration: 'none',
        }}>
          Ver mi cuaderno →
        </Link>
      )}
    </div>
  )
}
