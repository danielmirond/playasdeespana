'use client'
// FAB flotante de alquiler de barcos. Tarjeta fija abajo-derecha que aparece
// en las páginas /alquiler-barco con el enlace de afiliado Awin/SamBoat.
//
// El sitio NO usa Tailwind: estilos inline + un <style> con tokens del design
// system (paleta marina --mar-*, --font-sans) siguiendo el patrón de
// src/components/playa/CercaDeMiFab.tsx. Se eleva sobre el safe-area inferior.
// No coincide con el FAB "Playas cerca de mí": ese solo se monta en las fichas
// (/playas/[slug]) y este solo en /alquiler-barco.
//
// La visibilidad se deriva del pathname en el render (no en un useEffect):
// así pinta correcto desde el primer paint, sin parpadeo y consistente con SSR.
import { useState } from 'react'
import { X, Anchor } from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'

const STYLE = `
.boatCta{position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:85;
 width:min(320px,calc(100vw - 32px));
 background:var(--mar-700,#2d5266);color:#fff;font-family:var(--font-sans);
 border-radius:var(--r-lg,10px);box-shadow:0 8px 28px rgba(0,0,0,.32);
 padding:14px 16px;-webkit-tap-highlight-color:transparent;opacity:1}
.boatCta__row{display:flex;align-items:flex-start;gap:10px}
.boatCta__icon{flex-shrink:0;margin-top:2px}
.boatCta__body{flex:1;min-width:0}
.boatCta__title{font-weight:700;font-size:.9rem;line-height:1.25;margin:0 0 2px}
.boatCta__sub{font-size:.72rem;line-height:1.3;color:var(--mar-300,#8aa8b8);margin:0 0 10px}
.boatCta__btn{display:inline-block;background:#fff;color:var(--mar-700,#2d5266);
 font-size:.78rem;font-weight:700;text-decoration:none;
 padding:8px 16px;border-radius:var(--r-sm,4px);transition:filter .15s ease}
.boatCta__btn:hover{filter:brightness(.94)}
.boatCta__btn:active{transform:scale(.98)}
.boatCta__close{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;
 width:24px;height:24px;padding:0;border:none;border-radius:999px;cursor:pointer;
 background:rgba(255,255,255,.12);color:var(--mar-300,#8aa8b8);transition:color .15s ease,background .15s ease}
.boatCta__close:hover{color:#fff;background:rgba(255,255,255,.22)}
@media (max-width:520px){.boatCta{right:12px;left:12px;width:auto}}
`

export default function FloatingBoatCTA() {
  const [closed, setClosed] = useState(false)
  const pathname = usePathname() ?? ''

  // En la ficha de localidad NO se monta: ya tiene dos CTAs propios (hero y
  // cierre) con clickref de la localidad; un tercer botón flotante era ruido.
  const esFichaLocalidad = /\/alquiler-barco\/costas\/[^/]+\/provincias\/[^/]+\/[^/]+/.test(pathname)

  // Determinar costa a partir de la URL: /alquiler-barco/costas/[coast]/...
  const coastMatch = pathname.match(/\/alquiler-barco\/costas\/([^/]+)/)
  let coast: string | null = null
  if (coastMatch && coastMatch[1]) {
    const decoded = decodeURIComponent(coastMatch[1]).replace(/-/g, ' ')
    const minus = new Set(['de', 'del', 'la', 'las', 'los', 'y'])
    coast = decoded
      .split(' ')
      .map((w, i) => (i > 0 && minus.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ')
  } else if (pathname === '/alquiler-barco') {
    coast = 'España'
  }

  if (closed || !coast || esFichaLocalidad) {
    return null
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="boatCta" role="complementary" aria-label="Alquiler de barcos">
        <div className="boatCta__row">
          <Anchor size={20} weight="fill" className="boatCta__icon" aria-hidden="true" />
          <div className="boatCta__body">
            <p className="boatCta__title">Alquila barco en {coast}</p>
            <p className="boatCta__sub">desde 100&nbsp;€/día · Reserva segura con SamBoat</p>
            <a
              className="boatCta__btn"
              href="https://www.awin1.com/cread.php?awinmid=32683&awinaffid=playasdeespana&clickref=playasdeespana_floating&ued=https://www.samboat.es"
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              Ver Ofertas
            </a>
          </div>
          <button
            type="button"
            className="boatCta__close"
            onClick={() => setClosed(true)}
            aria-label="Cerrar"
          >
            <X size={14} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}
