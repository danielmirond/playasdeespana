// src/components/municipio/NavMunicipio.tsx — las páginas del municipio, a
// mano: píldoras bajo la cabecera en escritorio y barra fija abajo en móvil.
//
// Sustituye al bloque «Más de X» del final en estas páginas: el enlace que
// mantiene al lector dentro del municipio tiene que estar donde está el
// pulgar, no al final del todo. La lista la sigue decidiendo
// lib/enlaces-municipio, así que aquí no hay forma de enlazar a un 404.
import Link from 'next/link'
import { ETIQUETA_MUNICIPIO as CORTO, type ClaveMunicipio, type EnlaceMunicipio } from '@/lib/enlaces-municipio'
import styles from './Municipio.module.css'

const ICONO: Record<ClaveMunicipio, string> = {
  playas:   'M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 12h18',
  queHacer: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  elTiempo: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  mareas:   'M3 14c3-6 6-6 9 0s6 6 9 0M3 20h18',
  campings: 'M3 20L12 4l9 16H3zM12 4v16M8 20l4-7 4 7',
  barcos:   'M3 17h18l-2 4H5zM12 3v10M12 3l6 8H6z',
  aparcar:  'M7 20V4h5a4 4 0 0 1 0 8H7M17 14v6',
  dormir:   'M3 18v-6h18v6M3 18v2M21 18v2M3 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M13 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4',
  chiringuitos: 'M12 3v18M4 11h16L12 3 4 11M7 21h10',
  autocaravana: 'M3 16V7a1 1 0 0 1 1-1h10l5 5v5M3 16h2m14 0h2M3 16h18M8 11h4V8H8zM7 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
}

export default function NavMunicipio({ enlaces, actual }: { enlaces: EnlaceMunicipio[]; actual: ClaveMunicipio }) {
  if (enlaces.length < 2) return null
  return (
    <>
      <nav aria-label="Páginas del municipio" className={styles.navPildoras}>
        {enlaces.map(e => (
          <Link key={e.clave} href={e.href} aria-current={e.clave === actual ? 'page' : undefined}
            className={`${styles.pildora} ${e.clave === actual ? styles.pildoraActiva : ''}`}>
            {CORTO[e.clave]}
          </Link>
        ))}
      </nav>
      <nav aria-label="Páginas del municipio" className={styles.navBarra}>
        {enlaces.slice(0, 5).map(e => (
          <Link key={e.clave} href={e.href} aria-current={e.clave === actual ? 'page' : undefined}
            className={`${styles.navItem} ${e.clave === actual ? styles.navItemActivo : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={e.clave === actual ? 2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONO[e.clave]} /></svg>
            {CORTO[e.clave]}
          </Link>
        ))}
      </nav>
      <div className={styles.navHueco} aria-hidden="true" />
    </>
  )
}
