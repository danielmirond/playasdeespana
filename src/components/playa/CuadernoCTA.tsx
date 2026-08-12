'use client'
// src/components/playa/CuadernoCTA.tsx
// Puerta de entrada al cuaderno, al final de la ficha.
//
// La propuesta 2026 (§5.2) plegó "Estuve aquí" en el menú "···" del hero
// para dejar una sola acción primaria — pero decía que la acción debía
// REAPARECER en su sitio natural, tras las opiniones. Sin esa segunda
// mitad, el cuaderno se quedaba sin puerta visible: nadie descubre un
// producto que vive detrás de tres puntos.
//
// Esta tarjeta hace las dos cosas a la vez: es el punto de entrada y es
// el onboarding, porque explica qué es el cuaderno justo cuando el
// usuario ya ha leído la ficha entera y la acción tiene sentido.
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin } from '@phosphor-icons/react'
import { estuveEn, marcarVisita, leerCuaderno } from '@/lib/cuaderno'
import Sello from '@/components/cuaderno/Sello'

interface Props {
  slug: string
  nombre: string
  municipio?: string
  provincia?: string
  comunidad?: string
  locale?: 'es' | 'en'
}

export default function CuadernoCTA({ slug, nombre, municipio = '', provincia = '', comunidad = '', locale = 'es' }: Props) {
  const es = locale === 'es'
  const [estuve, setEstuve] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setEstuve(estuveEn(slug))
    setTotal(Object.keys(leerCuaderno()).length)
  }, [slug])

  function marcar() {
    marcarVisita(slug, { n: nombre, m: municipio, p: provincia, c: comunidad })
    setEstuve(true)
    setTotal(t => t + 1)
    fetch('/api/estuve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
  }

  // NO se oculta esperando a hidratar. En este proyecto la hidratación
  // de cliente es frágil, y esconder la tarjeta hasta que ocurra dejaría
  // otra vez el cuaderno sin puerta — el fallo que esto viene a arreglar.
  // Se pinta el estado "sin sellar" desde el servidor y el cliente solo
  // lo MEJORA cuando descubre que la playa ya está en el cuaderno.

  /**
   * La fecha del sello, después de montar.
   *
   * Se calculaba en el render con toLocaleDateString y sin `timeZone`:
   * el servidor la formateaba en UTC y el navegador en la hora del
   * visitante, así que de madrugada salían días distintos y la
   * hidratación de la ficha se rompía. Era una de las dos causas del
   * React #418 que dejaba la píldora contextual congelada.
   *
   * Es decoración —la fecha del sello del cuaderno—, no tiene valor SEO
   * y no merece pasarla como prop desde el servidor. Basta con no
   * pintarla hasta que haya un reloj de verdad. El hueco se reserva en
   * el marcado para que aparecer no mueva nada.
   */
  const [fechaHoy, setFechaHoy] = useState('')
  useEffect(() => {
    setFechaHoy(new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    }).replace(/\//g, '·'))
  }, [])

  return (
    <section
      id="s-cuaderno"
      aria-labelledby="h2-cuaderno"
      style={{
        display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap',
        padding: '1.15rem 1.25rem',
        background: 'var(--surface-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-sm, 4px)',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in srgb, var(--ink) 5%, transparent) 27px 28px)',
      }}
    >
      {/* El sello de ESTA playa: enseña el premio en vez de describirlo */}
      <div style={{ flexShrink: 0, opacity: estuve ? 1 : 0.4 }}>
        <Sello nombre={nombre} provincia={provincia} fecha={fechaHoy} size={92} rot={-5} />
      </div>

      <div style={{ flex: 1, minWidth: 220 }}>
        <h2 id="h2-cuaderno" style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700,
          color: 'var(--ink)', margin: 0, lineHeight: 1.15,
        }}>
          {estuve
            ? (es ? <>{nombre} ya está en tu cuaderno</> : <>{nombre} is in your notebook</>)
            : (es ? <>¿Has estado en {nombre}?</> : <>Have you been to {nombre}?</>)}
        </h2>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55, margin: '.4rem 0 0' }}>
          {estuve
            ? (es
              ? total > 1
                ? `Llevas ${total} playas selladas. Cada hito suma una insignia.`
                : 'Es tu primer sello. Cada playa que pises suma una insignia.'
              : total > 1
                ? `You have ${total} stamped beaches. Each milestone earns a badge.`
                : 'Your first stamp. Every beach you visit earns a badge.')
            : (es
              ? 'Séllala en tu cuaderno de playas y colecciona insignias por provincias, mares e islas. Vive en tu dispositivo: sin registro y sin darnos tu correo.'
              : 'Stamp it in your beach notebook and collect badges across provinces, seas and islands. It lives on your device: no sign-up, no email.')}
        </p>

        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.85rem', flexWrap: 'wrap' }}>
          {!estuve && (
            <button
              type="button"
              onClick={marcar}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                minHeight: 44, padding: '.6rem 1.15rem',
                background: 'var(--ink)', color: 'var(--surface)',
                border: 'none', borderRadius: 'var(--r-pill, 999px)',
                fontFamily: 'var(--font-sans)', fontSize: '.88rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <MapPin size={16} weight="fill" /> {es ? 'Estuve aquí' : 'I was here'}
            </button>
          )}
          <Link
            href="/mi-cuaderno"
            style={{
              display: 'inline-flex', alignItems: 'center',
              minHeight: 44, padding: '.6rem 1.15rem',
              border: '1px solid var(--line-strong)', borderRadius: 'var(--r-pill, 999px)',
              color: 'var(--ink)', textDecoration: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '.88rem', fontWeight: 600,
            }}
          >
            {estuve
              ? (es ? 'Ver mi cuaderno →' : 'Open my notebook →')
              : (es ? 'Qué es el cuaderno' : 'What is the notebook')}
          </Link>
        </div>
      </div>
    </section>
  )
}
