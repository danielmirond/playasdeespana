'use client'
// FAB flotante "Playas cerca de mí". Invita a la acción en las fichas:
// al pulsar pide geolocalización y redirige a /buscar ordenado por cercanía
// (mismo destino que la página /playas-cerca-de-mi). Si el GPS falla o se
// deniega, cae a la página con fallback por comunidad.
//
// Estilos inline + un <style> con media query/animación para no depender del
// CSS module. Se eleva sobre la barra inferior móvil (≤520px) para no taparla.
import { useState } from 'react'
import { NavigationArrow } from '@phosphor-icons/react'

interface Props {
  locale?: 'es' | 'en'
}

const STYLE = `
.cdmFab{position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:85;
 display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.1rem;border:none;border-radius:999px;cursor:pointer;
 background:var(--mar-700,#2d5266);color:#fff;font-family:var(--font-sans);font-size:.85rem;font-weight:700;letter-spacing:.01em;
 box-shadow:0 6px 22px rgba(0,0,0,.30);-webkit-tap-highlight-color:transparent;
 animation:cdmPulse 2.8s ease-in-out infinite;}
.cdmFab:hover{filter:brightness(1.08)}
.cdmFab:active{transform:scale(.97)}
.cdmFab svg{flex-shrink:0}
@keyframes cdmPulse{0%,100%{box-shadow:0 6px 22px rgba(0,0,0,.30)}50%{box-shadow:0 6px 22px rgba(0,0,0,.30),0 0 0 9px rgba(45,82,102,.16)}}
@media (max-width:520px){.cdmFab{bottom:calc(68px + env(safe-area-inset-bottom,0px));font-size:.8rem;padding:.6rem .95rem}}
@media (prefers-reduced-motion:reduce){.cdmFab{animation:none}}
`

export default function CercaDeMiFab({ locale = 'es' }: Props) {
  const [loading, setLoading] = useState(false)

  const label    = locale === 'en' ? 'Beaches near me' : 'Playas cerca de mí'
  const locating = locale === 'en' ? 'Locating…'        : 'Localizando…'
  const fallback = locale === 'en' ? '/en/beaches-near-me' : '/playas-cerca-de-mi'

  function locate() {
    if (loading) return
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      window.location.href = fallback
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        window.location.href = `/buscar?lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}&orden=cercanas`
      },
      () => {
        // Denegado / error / timeout → página con fallback por comunidad
        setLoading(false)
        window.location.href = fallback
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <button
        type="button"
        className="cdmFab"
        onClick={locate}
        aria-label={label}
        aria-busy={loading}
      >
        <NavigationArrow size={18} weight="fill" aria-hidden="true" />
        {loading ? locating : label}
      </button>
    </>
  )
}
