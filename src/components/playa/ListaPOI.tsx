// src/components/playa/ListaPOI.tsx
// Sistema de tarjetas de listado — entregable §5.3 de la propuesta 2026.
//
// Restaurantes, chiringuitos, hoteles, campings y centros de buceo
// comparten estructura (nombre, distancia, nota, metadatos) pero se
// pintaban de cinco maneras distintas. Una sola rejilla de tres columnas
// con ranuras opcionales resuelve los cinco casos:
//
//   [ medio opcional ] [ nombre + metadatos ] [ nota / distancia ]
//
//   photo   → lo que se elige por apetencia (restaurantes, hoteles)
//   rating  → la nota es el criterio y la foto no aporta (chiringuitos)
//   icon    → lo funcional (campings, servicios)
//   plain   → solo nombre y distancia (buceo)
//
// Reglas del sistema que respeta:
//  · La ranura de medio es OPCIONAL y EXCLUSIVA: foto o icono, nunca las
//    dos. Sin medio, la fila colapsa a dos columnas.
//  · La nota hereda la gramática de certeza: punteado, porque es dato
//    reportado por terceros (Google), no medido por nosotros.
//  · En datos estructurales, si falta una ranura SE OMITE — no se pinta
//    "—". El guion es solo para mediciones.
//  · Objetivo táctil mínimo de 44px en cada fila.
import type { ReactNode } from 'react'
import styles from './ListaPOI.module.css'

export type VariantePOI = 'photo' | 'rating' | 'icon' | 'plain'

export interface ItemPOI {
  id: string
  nombre: string
  /** Una línea, con elipsis: tipo, precio, servicios… */
  meta?: string
  /** Ya formateada: "180 m", "9,2 km" */
  distancia: string
  /** Nota de Google. Se omite si no hay */
  rating?: number | null
  reseñas?: number | null
  /** URL de foto para la variante photo */
  foto?: string | null
  /** Icono ya renderizado para la variante icon */
  icono?: ReactNode
  href: string
  /** true → abre fuera (Google Maps, web del local) */
  externo?: boolean
}

function Nota({ v, reseñas, locale }: { v?: number | null; reseñas?: number | null; locale: 'es' | 'en' }) {
  if (v === null || v === undefined || v === 0) return null
  return (
    <span className={styles.nota}>
      <span className={styles.notaCifra}>
        {locale === 'es' ? String(v).replace('.', ',') : String(v)}
      </span>
      {reseñas ? (
        <span className={styles.notaResenas}>({reseñas.toLocaleString(locale === 'en' ? 'en' : 'es')})</span>
      ) : null}
    </span>
  )
}

interface Props {
  items: ItemPOI[]
  variante: VariantePOI
  locale?: 'es' | 'en'
  /** Con variante photo: qué pintar cuando un item NO tiene foto. Un
   *  recuadro vacío es peor que ninguno, así que la ranura cae al icono. */
  iconoFallback?: ReactNode
}

export default function ListaPOI({ items, variante, locale = 'es', iconoFallback }: Props) {
  if (!items.length) return null
  const conMedio = variante === 'photo' || variante === 'icon'
  const conNota = variante === 'photo' || variante === 'rating'

  return (
    <div className={styles.lista}>
      {items.map(item => (
        <a
          key={item.id}
          href={item.href}
          className={styles.fila}
          data-medio={conMedio ? 'si' : 'no'}
          {...(item.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {variante === 'photo' && (
            item.foto ? (
              <span
                className={styles.foto}
                style={{ backgroundImage: `url(${item.foto})` }}
                aria-hidden="true"
              />
            ) : (
              <span className={styles.icono} aria-hidden="true">{iconoFallback ?? item.icono}</span>
            )
          )}
          {variante === 'icon' && (
            <span className={styles.icono} aria-hidden="true">{item.icono}</span>
          )}

          <span className={styles.info}>
            <span className={styles.nombre}>{item.nombre}</span>
            {item.meta && <span className={styles.meta}>{item.meta}</span>}
          </span>

          <span className={styles.derecha}>
            {conNota && <Nota v={item.rating} reseñas={item.reseñas} locale={locale} />}
            <span className={styles.distancia}>{item.distancia}</span>
          </span>
        </a>
      ))}
    </div>
  )
}
