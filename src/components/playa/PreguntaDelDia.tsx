'use client'
// src/components/playa/PreguntaDelDia.tsx — La tira de avisos, pero pidiendo
// lo que falta en vez de decir «sin avisos».
//
// EL PROBLEMA. La tira decía lo mismo en las 4.400 fichas: «Cómo está hoy:
// sin avisos» y un botón «Avisar». Dos cosas mal. «Sin avisos» informa de
// que no hay nada y no invita a nada — es un callejón sin salida escrito
// donde debería haber una pregunta. Y «Avisar» abre un cajón con ocho
// opciones: tres pasos para contestar algo que se sabe de un vistazo.
//
// EL VALOR DE UN REPORTE NO ES IGUAL EN TODAS LAS FICHAS, y de ahí sale
// todo lo demás. En La Misericordia tenemos a la Junta. En Berria no hay
// fuente oficial, no la ha habido nunca y —verificado fuente por fuente—
// no la va a haber: ahí el reporte de un bañista es el ÚNICO dato que esa
// playa va a tener. Pedir lo mismo en los dos sitios desperdicia el sitio
// donde más falta hace.
//
// Así que la pregunta cambia con el contexto:
//   · sin fuente oficial   → «Nadie ha dicho cómo está X hoy»  + izar bandera
//   · con fuente, sin parte→ «El socorrismo aún no ha izado»   + izar bandera
//   · con parte publicado  → el parte, y se pregunta lo que el parte NO
//                            trae: medusas.
//
// UNA PULSACIÓN, NO TRES. Los botones envían directamente; el cajón de las
// ocho opciones sigue ahí para quien quiera contar más.
//
// El deduplicado es el MISMO de ReportarEstado (clave `rep:{slug}:{tipo}`,
// ventana rodante de 24 h) para que las dos superficies no se contradigan:
// contestar aquí debe dejar el cajón marcado y al revés.
import { useState, useEffect, useCallback } from 'react'
import { Flag, Megaphone } from '@phosphor-icons/react'
import Medusa from '@/components/ui/Medusa'
import styles from './FichaHero.module.css'

type Tipo = 'bandera_verde' | 'bandera_amarilla' | 'bandera_roja' | 'medusas'

const VENTANA_MS = 24 * 60 * 60 * 1000
const lsKey = (slug: string, tipo: string) => `rep:${slug}:${tipo}`

function yaContestado(slug: string, tipos: Tipo[]): boolean {
  if (typeof window === 'undefined') return false
  return tipos.some(t => {
    const raw = localStorage.getItem(lsKey(slug, t))
    if (!raw) return false
    const ts = parseInt(raw.split(':')[0] ?? '0', 10)
    if (!ts || Date.now() - ts >= VENTANA_MS) { localStorage.removeItem(lsKey(slug, t)); return false }
    return true
  })
}

export default function PreguntaDelDia({
  slug, nombre, locale = 'es', avisos, hayFuenteOficial, hayParteHoy, banderaTxt,
}: {
  slug: string
  nombre: string
  locale?: 'es' | 'en'
  /** Avisos ya reportados por otros en 24 h; si hay, mandan ellos */
  avisos: string[]
  /** ¿Esta playa está mapeada a alguna fuente oficial? */
  hayFuenteOficial: boolean
  /** ¿Esa fuente ha publicado parte hoy? */
  hayParteHoy: boolean
  /** «Bandera verde», para poder citarlo al preguntar */
  banderaTxt?: string | null
}) {
  const [hecho, setHecho] = useState(false)
  const [enviando, setEnviando] = useState<Tipo | null>(null)

  // Tras montar: si ya contestó en las últimas 24 h, no se le vuelve a
  // preguntar. Se lee aquí porque localStorage no existe en servidor.
  useEffect(() => {
    setHecho(yaContestado(slug, ['bandera_verde', 'bandera_amarilla', 'bandera_roja', 'medusas']))
  }, [slug])

  const enviar = useCallback(async (tipo: Tipo) => {
    if (enviando || hecho) return
    setEnviando(tipo)
    try { localStorage.setItem(lsKey(slug, tipo), `${Date.now()}:`) } catch {}
    try {
      await fetch('/api/reportes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, tipo }),
      })
    } catch { /* silencioso: el voto ya está guardado en el dispositivo */ }
    setHecho(true); setEnviando(null)
  }, [slug, enviando, hecho])

  // Si otros ya han avisado, eso manda: la tira informa en vez de pedir.
  if (avisos.length > 0) {
    return (
      <span className={styles.statusTxt}>
        <strong>{locale === 'en' ? 'Reported today' : 'Avisos de hoy'}:</strong> {avisos.join(' · ')}
      </span>
    )
  }

  if (hecho) {
    return (
      <span className={styles.statusTxt}>
        {locale === 'en'
          ? 'Thanks — whoever looks up this beach next will see it.'
          : 'Gracias. Lo verá quien busque esta playa después de ti.'}
      </span>
    )
  }

  // Con parte oficial, la bandera ya se sabe: se pregunta lo que el parte
  // no suele traer. Sin parte, lo que falta es la bandera misma.
  const preguntarMedusas = hayFuenteOficial && hayParteHoy

  const texto = preguntarMedusas
    ? (locale === 'en'
        ? <>{banderaTxt ? <><strong>{banderaTxt}</strong> today. </> : null}Seen any jellyfish?</>
        : <>{banderaTxt ? <><strong>{banderaTxt}</strong> hoy. </> : null}¿Has visto medusas?</>)
    : hayFuenteOficial
      ? (locale === 'en'
          ? <>No flag reported yet today. <strong>What can you see?</strong></>
          : <>Hoy aún no han izado bandera. <strong>¿Qué ves?</strong></>)
      // El caso fuerte: aquí no hay ni habrá fuente oficial.
      : (locale === 'en'
          ? <>Nobody has said how <strong>{nombre}</strong> is today.</>
          : <>Nadie ha dicho cómo está <strong>{nombre}</strong> hoy.</>)

  const btn = (tipo: Tipo, etiqueta: string, color: string, icono: React.ReactNode) => (
    <button key={tipo} type="button" onClick={() => enviar(tipo)} disabled={!!enviando}
      className={styles.respuestaBtn} style={{ color }} aria-label={etiqueta}>
      {icono}<span>{etiqueta}</span>
    </button>
  )

  return (
    <>
      <span className={styles.statusTxt}>{texto}</span>
      <span className={styles.respuestas}>
        {preguntarMedusas
          ? btn('medusas', locale === 'en' ? 'Yes, jellyfish' : 'Sí, medusas', '#e879a0',
              <Medusa size={15} weight="fill" aria-hidden="true" />)
          : (['bandera_verde', 'bandera_amarilla', 'bandera_roja'] as const).map(t =>
              btn(t,
                t === 'bandera_verde' ? (locale === 'en' ? 'Green' : 'Verde')
                  : t === 'bandera_amarilla' ? (locale === 'en' ? 'Yellow' : 'Amarilla')
                  : (locale === 'en' ? 'Red' : 'Roja'),
                t === 'bandera_verde' ? 'var(--excelente)'
                  : t === 'bandera_amarilla' ? 'var(--aceptable)' : 'var(--noapto)',
                <Flag size={15} weight="fill" aria-hidden="true" />))}
        {/* El cajón completo sigue disponible para quien quiera contar más */}
        <button type="button" className={styles.masAvisos}
          onClick={() => window.dispatchEvent(new CustomEvent('open-reportar-drawer'))}
          aria-label={locale === 'en' ? 'Report something else' : 'Avisar de otra cosa'}>
          <Megaphone size={15} weight="bold" aria-hidden="true" />
        </button>
      </span>
    </>
  )
}
