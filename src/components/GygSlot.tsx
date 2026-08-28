'use client'
// src/components/GygSlot.tsx — Decide qué ocupa el hueco de «Cosas que hacer
// cerca»: el widget de GetYourGuide, o una promoción nuestra.
//
// POR QUÉ EXISTE. El widget de GetYourGuide va detrás del consentimiento de
// marketing. Quien lo rechaza —o quien ignora el banner— no veía el widget,
// pero SÍ seguía viendo el titular y la advertencia de comisión: una sección
// vacía cuyo único texto decía que cobramos comisión. Descubierto al intentar
// hacer una captura del bloque y encontrarlo de 53 px de alto.
//
// El mismo hueco aparece cuando SÍ hay consentimiento pero el widget no
// encuentra oferta para esa zona, que en calas pequeñas es lo normal.
//
// A QUIÉN LE HABLA LA PROMOCIÓN. No es relleno, y por eso hay TRES y se
// elige por contexto, no al azar:
//
//   · actividades — si la playa es de surf, buceo o navegable. Es la que más
//     se parece a lo que el widget iba a ofrecer, así que sustituye bien.
//   · piel — si el índice UV del día es alto. Con UV 9 sobre la cabeza, el
//     protector solar es más pertinente que cualquier excursión.
//   · cuaderno — el resto. Y no es la opción de descarte: quien acaba de
//     rechazar el seguimiento publicitario es exactamente el público de «Mi
//     cuaderno», cuya promesa literal es «vive en tu dispositivo: sin
//     registro, sin cuentas y sin darnos tu correo».
//
// La variante la decide el SERVIDOR y llega como prop. Elegirla en cliente
// —por azar o por hora— haría que el primer render difiera del servidor.
//
// HIDRATACIÓN. El primer render de cliente devuelve EXACTAMENTE lo mismo que
// el servidor —el widget— y solo cambia después, en un efecto. Renderizar
// cosas distintas en servidor y cliente es lo que provocó los #418 que
// costaron una tarde en esta ficha; aquí no se repite.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function hayConsentimientoMarketing(): boolean {
  try {
    const raw = localStorage.getItem('cookie_consent_v2')
    if (!raw) return false                       // sin respuesta = sin permiso
    return JSON.parse(raw)?.marketing === true
  } catch { return false }
}

export type VariantePromo = 'cuaderno' | 'piel' | 'actividades'

export default function GygSlot({
  children, locale = 'es', municipioSlug, variante = 'cuaderno', cmp = 'site',
}: {
  children: React.ReactNode
  locale?: 'es' | 'en'
  municipioSlug?: string | null
  variante?: VariantePromo
  /** Misma etiqueta de superficie que se manda a GetYourGuide */
  cmp?: string
}) {
  const [promo, setPromo] = useState(false)
  // Referencia al contenedor PROPIO. Antes se buscaba con
  // `document.querySelector('[data-gyg-widget]')`, que devuelve el PRIMERO
  // del documento: en cualquier página con dos bloques, cada uno miraba el
  // contenedor del otro.
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let vivo = true
    const revisar = () => {
      if (!vivo) return
      if (!hayConsentimientoMarketing()) { setPromo(true); return }
      setPromo(false)
      // Con permiso, se le da margen a que pinte. Si a los 3 s el contenedor
      // sigue vacío, es que no hay oferta para esta zona y el hueco se
      // rellena igual.
      // SE MIDE LA ALTURA, no el número de hijos.
      //
      // Contar hijos no detecta el caso real. Medido en producción en Nova
      // Icària y en La Victoria: GetYourGuide SÍ inyecta su iframe —el
      // contenedor tiene un hijo, así que la comprobación antigua lo daba
      // por bueno— y ese iframe se queda en 0 px de alto. El resultado es
      // que la página publica el titular «Cosas que hacer cerca» y el aviso
      // «podemos recibir una comisión» encima de nada. Declarar una
      // relación comercial sobre un hueco es peor que no enseñar el bloque.
      //
      // 6 s y no 3: el script se carga con `lazyOnload` y el iframe tardó
      // 271 ms en cargar DESPUÉS de eso. A los 3 s se estaba juzgando a un
      // widget que aún venía de camino.
      window.setTimeout(() => {
        if (!vivo) return
        // Búsqueda ACOTADA a este slot. El contenedor lo pinta
        // `GygActivities`, que es hijo; buscarlo en todo el documento
        // hacía que dos bloques de la misma página se miraran el uno al
        // otro.
        const cont = caja.current?.querySelector('[data-gyg-widget]')
        if (!cont) return
        if (cont.getBoundingClientRect().height < 80) setPromo(true)
      }, 6000)
    }
    revisar()
    window.addEventListener('cookie-consent-change', revisar)
    return () => { vivo = false; window.removeEventListener('cookie-consent-change', revisar) }
  }, [])

  // Envoltorio con referencia: es la única forma de acotar la búsqueda del
  // contenedor a ESTE slot sin que GygSlot tenga que conocer el marcado de
  // su hijo. `display: contents` para no meter una caja en el layout.
  if (!promo) return <div ref={caja} style={{ display: 'contents' }}>{children}</div>

  // Copy alineado con el brief de campaña de julio 2026 (proyecto «Playas»,
  // camp26/data.jsx). No es decoración: el brief define `sellar_playa` como
  // CONVERSIÓN PRINCIPAL, con tope de 1,50 € por sello, y el motivo escrito
  // —«es la que predice retorno: quien sella vuelve solo el resto del
  // verano»—. Así que el cuaderno no es el relleno de descarte: es el mismo
  // destino al que apunta el dinero pagado, ocupando un hueco que es gratis.
  //
  // La voz sale del brief: frase corta, el dato delante, sin exclamaciones.
  // Las claims son literalmente las de sus conceptos:
  //   · cuaderno    → C3 «El cuaderno»  ("Las playas que pisas, selladas",
  //                    "Sin registro. Sin app.")
  //   · actividades → A4 «Surf y deportes» ("Datos de boya, no de modelo")
  //   · piel        → sin concepto en el brief. Escrito en la misma voz.
  const PROMOS = {
    cuaderno: {
      es: { h: 'Las playas que pisas, selladas',
            p: 'Un sello por playa al marcar «estuve aquí». Sin registro, sin app y sin darnos tu correo.',
            cta: 'Abrir mi cuaderno', href: '/mi-cuaderno' },
      en: { h: 'The beaches you walk, stamped',
            p: 'One stamp per beach when you mark «I was here». No sign-up, no app, and without giving us your email.',
            cta: 'Open my logbook', href: '/en/my-logbook' },
    },
    piel: {
      es: { h: 'El sol de hoy, en números',
            p: 'Qué protector elegir según tu piel y cuánto dura de verdad cada aplicación, sin la letra pequeña del envase.',
            cta: 'Guía de protección solar', href: '/protectores-solares' },
      en: { h: 'Today’s sun, in numbers',
            p: 'Which sunscreen suits your skin and how long each application really lasts, without the small print.',
            cta: 'Sun protection guide', href: '/protectores-solares' },
    },
    actividades: {
      es: { h: 'Datos de boya, no de modelo',
            p: 'Oleaje por horas, periodo y viento medidos. Y quién alquila barco sin titulación, escuelas de surf, centros de buceo y áreas de autocaravana.',
            cta: 'Ver qué hacer en esta costa', href: '/alquiler-barco' },
      en: { h: 'Buoy data, not model data',
            p: 'Hourly waves, period and wind, measured. Plus boat rental without a licence, surf schools, dive centres and campervan areas.',
            cta: 'See what to do on this coast', href: '/alquiler-barco' },
    },
  } as const

  const t = PROMOS[variante][locale === 'en' ? 'en' : 'es']
  const otra = locale === 'en' ? 'Beaches nearby' : 'Playas cercanas'

  // Se etiqueta con la MISMA nomenclatura de superficie que ya se manda a
  // GetYourGuide (ficha_playa, municipio, provincia, magazine…), para poder
  // comparar el hueco vendido con el hueco propio. Los canonical de destino
  // son rutas limpias sin query, así que el parámetro no crea duplicados.
  //
  // LÍMITE HONESTO DE LA MEDICIÓN: este banner se le enseña a quien rechazó
  // el marketing, y quien rechaza TODO tampoco manda eventos a Analytics.
  // Solo será medible la franja que acepta analítica y rechaza publicidad
  // —que existe y no es pequeña—, nunca el total de quien lo ve.
  const marca = (h: string) => `${h}?cmp=promo_${variante}.${cmp}`

  return (
    <div style={{
      border: '1px solid var(--rule, rgba(0,0,0,.12))', borderRadius: 4,
      padding: '1.1rem 1.25rem', display: 'flex', flexWrap: 'wrap',
      gap: '.9rem 1.5rem', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ flex: '1 1 20rem' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 .3rem', color: 'var(--ink)' }}>
          {t.h}
        </p>
        <p style={{ fontSize: '.86rem', color: 'var(--muted)', margin: 0, maxWidth: '38em' }}>{t.p}</p>
      </div>
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <Link href={marca(t.href)}
          style={{ fontSize: '.85rem', fontWeight: 600, padding: '.5rem .9rem', borderRadius: 3,
            border: '1px solid var(--ink)', color: 'var(--ink)', textDecoration: 'none' }}>
          {t.cta}
        </Link>
        {municipioSlug && (
          <Link href={marca(locale === 'en' ? `/en/towns/${municipioSlug}` : `/municipio/${municipioSlug}`)}
            style={{ fontSize: '.85rem', padding: '.5rem .9rem', borderRadius: 3,
              border: '1px solid var(--rule, rgba(0,0,0,.15))', color: 'var(--muted)', textDecoration: 'none' }}>
            {otra}
          </Link>
        )}
      </div>
    </div>
  )
}
