// src/components/playa/PildoraContextual.tsx
// Arquitectura C de la propuesta de diseño 2026 (§5.1).
//
// Un solo elemento fijo sustituye, en móvil, a la barra de secciones
// sticky y a la barra de acciones inferior: el cromado pasa de 316px
// (39% del viewport de 812px) a 64px (8%), sin perder ninguna de las dos
// funciones críticas — el índice de las secciones vive detrás de un
// toque a la izquierda y la acción principal está siempre a la derecha,
// ya contextualizada.
//
// COSTE DE CLIENTE (restricción §6 del brief: la hidratación es frágil):
//   · El panel de secciones es <details> + <summary>: cero JavaScript,
//     navegable por teclado de serie.
//   · Cuándo aparece la píldora, qué sección muestra y cuál de las dos
//     acciones se ve lo decide un script vanilla (public/pildora.js) que
//     solo escribe atributos data- en el <body>. El CSS hace el resto.
// Es un server component: no lleva 'use client'.
import { MapPin, Waves } from '@phosphor-icons/react/dist/ssr'
import styles from './PildoraContextual.module.css'

interface Seccion { id: string; t: string }

const SECCIONES: Record<'es' | 'en', Seccion[]> = {
  es: [
    { id: 's-webcam',       t: 'Webcam' },
    { id: 's-seguridad',    t: 'Bandera y medusas' },
    { id: 's-calidad',      t: 'Calidad del agua' },
    { id: 's-comoLlegar',   t: 'Cómo llegar' },
    { id: 's-trafico',      t: 'Parking' },
    { id: 's-mejor-hora',   t: 'Mejor hora' },
    { id: 's-comer',        t: 'Restaurantes' },
    { id: 's-chiringuitos', t: 'Chiringuitos' },
    { id: 's-dormir',       t: 'Hoteles' },
    { id: 's-campings',     t: 'Campings' },
    { id: 's-actividades',  t: 'Previsión y surf' },
    { id: 's-buceo',        t: 'Buceo' },
    { id: 's-meteo',        t: 'Oleaje por horas' },
    { id: 's-datos',        t: 'Datos de la playa' },
    { id: 's-fotos',        t: 'Fotos' },
    { id: 's-opiniones',    t: 'Opiniones' },
    { id: 's-cercanas',     t: 'Playas cercanas' },
    { id: 's-faqs',         t: 'Preguntas frecuentes' },
  ],
  en: [
    { id: 's-webcam',       t: 'Webcam' },
    { id: 's-seguridad',    t: 'Flag & jellyfish' },
    { id: 's-calidad',      t: 'Water quality' },
    { id: 's-comoLlegar',   t: 'Directions' },
    { id: 's-trafico',      t: 'Parking' },
    { id: 's-mejor-hora',   t: 'Best time' },
    { id: 's-comer',        t: 'Restaurants' },
    { id: 's-chiringuitos', t: 'Beach bars' },
    { id: 's-dormir',       t: 'Hotels' },
    { id: 's-campings',     t: 'Campings' },
    { id: 's-actividades',  t: 'Forecast & surf' },
    { id: 's-buceo',        t: 'Diving' },
    { id: 's-meteo',        t: 'Waves by hour' },
    { id: 's-datos',        t: 'Beach info' },
    { id: 's-fotos',        t: 'Photos' },
    { id: 's-opiniones',    t: 'Reviews' },
    { id: 's-cercanas',     t: 'Nearby beaches' },
    { id: 's-faqs',         t: 'FAQ' },
  ],
}

interface Props {
  lat: number
  lng: number
  locale?: 'es' | 'en'
}

export default function PildoraContextual({ lat, lng, locale = 'es' }: Props) {
  const es = locale === 'es'
  const secciones = SECCIONES[locale]
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div className={styles.wrap} id="pildora">
      <details className={styles.panel} id="pildora-panel">
        <summary className={styles.pillLeft} aria-label={es ? 'Índice de secciones' : 'Section index'}>
          <span className={styles.glifo} aria-hidden="true">☰</span>
          <span className={styles.indiceTxt}>
            <span className={styles.contador} data-pildora-contador>
              01 / {secciones.length}
            </span>
            <span className={styles.seccion} data-pildora-seccion>
              {secciones[0].t}
            </span>
          </span>
        </summary>

        {/* Tocar fuera cierra: el velo es un <label> del propio details
            no es posible sin JS, así que lo cierra el script mínimo. */}
        <div className={styles.velo} data-pildora-velo aria-hidden="true" />
        <nav className={styles.hoja} aria-label={es ? 'Secciones de la ficha' : 'Page sections'}>
          <div className={styles.hojaHead}>
            <span className={styles.hojaTitulo}>{es ? 'Secciones de la ficha' : 'Page sections'}</span>
          </div>
          {secciones.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={styles.item} data-pildora-item={s.id}>
              <span className={styles.itemNum}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1 }}>{s.t}</span>
            </a>
          ))}
        </nav>
      </details>

      {/* Acción contextual: las dos conviven en el DOM y conmutan por CSS
          según el atributo data-ctx del body. Sin re-render. */}
      <button
        type="button"
        className={`${styles.accion} ${styles.accionEstado}`}
        data-pildora-estado
        aria-haspopup="dialog"
      >
        <Waves size={15} weight="bold" aria-hidden="true" />
        {es ? 'Cómo está hoy' : 'State today'}
      </button>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.accion} ${styles.accionLlegar}`}
      >
        <MapPin size={15} weight="fill" aria-hidden="true" />
        {es ? 'Cómo llegar' : 'Directions'}
      </a>
    </div>
  )
}
