// src/components/playa/RejillaMediciones.tsx — las cuatro cifras del día.
//
// «El componente que más se repite», dice el handoff, y por eso vive en un
// sitio y no copiado por cada bloque. Cuatro celdas en 2×2 a 375px: agua,
// oleaje, viento y UV.
//
// La celda tiene cuatro partes y cada una responde a una pregunta:
//   etiqueta   qué se mide
//   cifra      cuánto
//   trazo      de qué me fío        ← lo lleva <Dato>, vía data-cert
//   antigüedad de cuándo es
//
// Las dos últimas son la razón de que esto sea un componente y no una
// tabla. Una cifra sin trazo y sin hora es una afirmación desnuda, y la
// promesa del sitio es exactamente la contraria.
//
// Componente de servidor: no hay estado ni interacción.

import { Dato, type Certeza } from './Certeza'
import styles from './RejillaMediciones.module.css'

export interface Medicion {
  /** Qué se mide. Va en versalitas, así que corto. */
  etiqueta: string
  /** Ya formateado. null o undefined ⇒ «sin dato», que es un estado, no un hueco. */
  valor?: string | number | null
  unidad?: string
  cert: Certeza
  /** «hace 12 min», «11:20». Se omite si no se sabe. */
  antiguedad?: string
  /**
   * Cualidad con nombre de lo que se mide: «levante», «tramontana». No es
   * metadato —va en serif y con la tinta, no en el gris de .antiguedad—
   * porque en muchas costas el nombre informa más que la cifra: 28 km/h no
   * dice nada y «levante 28» lo dice todo.
   */
  nota?: string
  /**
   * Rumbo en grados METEOROLÓGICOS (de dónde VIENE el viento, que es como
   * lo dan todos los modelos). La flecha se dibuja apuntando adonde VA,
   * o sea grados + 180, que es como se lee una veleta.
   */
  rumboDeg?: number
}

interface Props {
  mediciones: Medicion[]
  /** Sobre foto el trazo pasa a blanco: ahí el color no distingue, el patrón sí. */
  onDark?: boolean
}

export default function RejillaMediciones({ mediciones, onDark }: Props) {
  if (!mediciones.length) return null
  return (
    <div className={`${styles.rejilla}${onDark ? ' ' + styles.onDark : ''}`} role="list">
      {mediciones.map((m) => (
        <div key={m.etiqueta} className={styles.celda} role="listitem">
          <span className={styles.etiqueta}>
            {m.etiqueta}
            {m.rumboDeg != null && (
              <svg className={styles.flecha} width="9" height="9" viewBox="0 0 16 16" aria-hidden="true"
                style={{ transform: `rotate(${(m.rumboDeg + 180) % 360}deg)` }}>
                <path d="M8 1.5 L8 14.5 M8 1.5 L4.4 5.6 M8 1.5 L11.6 5.6"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )}
          </span>
          <Dato v={m.valor} u={m.unidad} cert={m.cert} size={23} onDark={onDark} />
          {m.nota && <span className={styles.nota}>{m.nota}</span>}
          {/* La antigüedad no se inventa: si no se sabe, no se escribe.
              Un «hace un momento» por defecto sería justo la clase de
              precisión falsa que este componente existe para evitar. */}
          {m.antiguedad && <span className={styles.antiguedad}>{m.antiguedad}</span>}
        </div>
      ))}
    </div>
  )
}
