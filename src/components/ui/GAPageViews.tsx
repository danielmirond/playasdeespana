'use client'
// GAPageViews — la vista de página que faltaba en cada navegación.
//
// El App Router navega sin recargar: al pinchar una ficha desde otra,
// cambia la URL y el contenido pero el documento es el mismo. Y
// `gtag('config')` solo dispara UNA vista, la de la carga inicial.
//
// Medido en producción antes de esto: yendo de
// /playas/platja-de-la-barceloneta a /playas/platja-de-la-mar-bella con
// un clic real, la ruta cambiaba y GA no enviaba nada. Cero peticiones
// nuevas a /g/collect. Un usuario que ve cinco playas contaba como una.
//
// Eso hundía a la vez las páginas vistas, las páginas por sesión, la
// duración y —lo más caro— las fichas a las que se llega navegando en
// vez de desde Google, que son justo las que no aparecían en los datos.
//
// OJO al desplegar: las páginas vistas van a SUBIR de golpe. No es
// tráfico nuevo, es el que ya había y no se contaba. Conviene anotar la
// fecha para no leer el escalón como crecimiento.

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function GAPageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // La primera vista ya la manda gtag('config') al cargar. Si la
  // enviáramos también aquí, cada entrada al sitio contaría doble.
  const primera = useRef(true)

  useEffect(() => {
    if (primera.current) { primera.current = false; return }

    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
    if (typeof gtag !== 'function') return   // sin consentimiento no hay gtag

    const qs = searchParams?.toString()
    gtag('event', 'page_view', {
      page_path: pathname + (qs ? `?${qs}` : ''),
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}
