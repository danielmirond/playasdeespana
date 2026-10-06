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
import { MapPin, Waves, Megaphone } from '@phosphor-icons/react/dist/ssr'
import styles from './PildoraContextual.module.css'

// LA MITAD IZQUIERDA ENSEÑA A DÓNDE VAS, NO SOLO DÓNDE ESTÁS (oct-2026).
// Antes decía «07 / 18 · Restaurantes» y el índice estaba detrás de un
// toque. La alternativa evidente —una tira horizontal con todas las
// secciones, como la barra de municipio— no sale: las 18 etiquetas de la
// ficha suman 2.078 px y en un móvil de 375 px, quitando la acción de la
// derecha, caben dos. O sea que la tira cuesta scroll horizontal, pelea
// con el gesto de «atrás» del borde izquierdo y el autocentrado del chip
// activo se pisa con el dedo del usuario, todo para enseñar lo mismo que
// cabe sin scroll. Así que el ancho se gasta en la sección SIGUIENTE, que
// es el enlace que de verdad falta: el «sigue leyendo» de la ficha.
//
// El glifo abre el índice completo; el resto de la izquierda es un enlace
// de verdad a la siguiente sección. Tienen que ser dos elementos: un <a>
// dentro de un <summary> no se puede pulsar, lo intercepta el summary.
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
  /** Para el aviso "Estás en X": sin nombre no se anuncia nada */
  nombre?: string
  locale?: 'es' | 'en'
}

export default function PildoraContextual({ lat, lng, nombre = '', locale = 'es' }: Props) {
  const es = locale === 'es'
  const secciones = SECCIONES[locale]
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div className={styles.wrap} id="pildora" data-lat={lat} data-lng={lng}>
      {/* Cuánto llevas de ficha. Dos píxeles en el borde de arriba: la
          sensación de avance sin gastar ancho. */}
      <span className={styles.progreso} data-pildora-progreso aria-hidden="true" />

      <details className={styles.panel} id="pildora-panel">
        <summary className={styles.pillLeft} aria-label={es ? 'Índice de secciones' : 'Section index'}>
          <span className={styles.glifo} aria-hidden="true">☰</span>
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

      {/* Dónde estás y, debajo, a dónde lleva el dedo. El script reescribe
          las dos etiquetas y el destino en cada frame de scroll. */}
      <a className={styles.avance} href={`#${secciones[1]?.id ?? secciones[0].id}`} data-pildora-siguiente-href>
        <span className={styles.contador}>
          <span data-pildora-contador>01 / {secciones.length}</span>
          {' · '}
          <span data-pildora-seccion>{secciones[0].t}</span>
        </span>
        <span className={styles.siguiente}>
          <span className={styles.flecha} aria-hidden="true">↓</span>
          <span className={styles.siguienteTxt} data-pildora-siguiente>{secciones[1]?.t ?? ''}</span>
        </span>
      </a>

      {/* Aviso de presencia. Se pinta siempre y el CSS lo muestra solo
          cuando body[data-enplaya='si']. Quien está en la arena es el
          reportero ideal: es donde nace el dato de bandera y medusas. */}
      {nombre && (
        <div className={styles.aviso} data-pildora-aviso role="status">
          <span className={styles.avisoTxt}>
            {es ? <>Estás en <strong>{nombre}</strong></> : <>You are at <strong>{nombre}</strong></>}
          </span>
          <button type="button" className={styles.avisoCta} data-pildora-estado>
            {es ? '¿Cómo está hoy?' : 'How is it today?'}
          </button>
        </div>
      )}

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
      {/* Estando en la arena, "cómo llegar" sobra: lo útil es contar cómo
          está. Esta acción sustituye a las otras dos cuando el propio
          dispositivo detecta que la playa está a menos de 300 m. */}
      <button
        type="button"
        className={`${styles.accion} ${styles.accionReportar}`}
        data-pildora-estado
        aria-haspopup="dialog"
      >
        <Megaphone size={15} weight="bold" aria-hidden="true" />
        {es ? 'Reportar cómo está' : 'Report conditions'}
      </button>
    </div>
  )
}
