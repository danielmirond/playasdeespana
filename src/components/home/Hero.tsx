// src/components/home/Hero.tsx — Design system v1 §08: HomeDesktop hero
// Left-aligned, editorial serif XL, integrated search, quick-explore chips
import Link from 'next/link'
import styles from './Hero.module.css'

const CHIPS = [
  { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
  { href: '/playas-perros', label: 'Playas con perros' },
  { href: '/surf', label: 'Surf' },
  { href: '/playas-nudistas', label: 'Nudismo' },
  { href: '/playas-autocaravana', label: 'Autocaravana' },
  { href: '/buceo', label: 'Buceo' },
]

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.kicker}>
          <span className={styles.kickerDot}/>
          Datos en tiempo real · actualizado cada hora
        </p>

        <h1 className={styles.title}>
          Hoy el mar está{' '}
          <em>para bañarse</em>
        </h1>
        <p className={styles.sub}>
          Cinco mil playas del litoral español, con una puntuación de 0 a 100
          recalculada cada hora a partir de datos oficiales de MITECO, EEA y AEMET.
        </p>

        {/* Search bar — design system pattern */}
        <form action="/buscar" method="get" className={styles.searchBar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            name="q"
            type="search"
            placeholder="Busca una playa, municipio, provincia…"
            className={styles.searchInput}
            aria-label="Buscar playa"
          />
          <button type="submit" className={styles.searchBtn}>Buscar</button>
        </form>

        {/* Quick explore chips */}
        <div className={styles.chips}>
          <span className={styles.chipsLabel}>o explora:</span>
          {CHIPS.map(c => (
            <Link key={c.href} href={c.href} className={styles.chip}>{c.label}</Link>
          ))}
        </div>
      </div>
    </section>
  )
}
