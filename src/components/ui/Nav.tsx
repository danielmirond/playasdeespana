// src/components/ui/Nav.tsx
import Link from 'next/link'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <header className={styles.nav} id="main-nav">
      <nav className={styles.links}>
        <Link href="/" className={styles.link}>Inicio</Link>
        <Link href="/comunidades" className={styles.link}>Comunidades</Link>
        <Link href="/mapa" className={styles.link}>Mapa</Link>
      </nav>
      <div className={styles.logo}>Playas de España</div>
      <div className={styles.right}>
        <Link href="/buscar" className={styles.iconBtn} aria-label="Buscar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </Link>
      </div>
    </header>
  )
}
