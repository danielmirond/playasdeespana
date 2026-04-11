'use client'
// src/components/ui/Nav.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

function getLangUrl(pathname: string, targetLocale: 'es' | 'en'): string {
  const isEn = pathname.startsWith('/en')

  if (targetLocale === 'en') {
    if (isEn) return pathname
    // ES → EN
    if (pathname.startsWith('/playas/'))      return pathname.replace('/playas/', '/en/beaches/')
    if (pathname.startsWith('/comunidad/'))   return pathname.replace('/comunidad/', '/en/communities/')
    if (pathname.startsWith('/provincia/'))   return pathname.replace('/provincia/', '/en/provinces/')
    return '/en'
  } else {
    if (!isEn) return pathname
    // EN → ES
    if (pathname.startsWith('/en/beaches/'))     return pathname.replace('/en/beaches/', '/playas/')
    if (pathname.startsWith('/en/communities/')) return pathname.replace('/en/communities/', '/comunidad/')
    if (pathname.startsWith('/en/provinces/'))   return pathname.replace('/en/provinces/', '/provincia/')
    return '/'
  }
}

export default function Nav() {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en')
  const esUrl = getLangUrl(pathname, 'es')
  const enUrl = getLangUrl(pathname, 'en')

  return (
    <>
      <header className={styles.nav} id="main-nav">
        {/* Skip link: primer elemento focusable. Solo visible con foco. */}
        <a href="#main-content" className={styles.skipLink}>
          {isEn ? 'Skip to main content' : 'Saltar al contenido principal'}
        </a>
        <nav className={styles.links} aria-label={isEn ? 'Main navigation' : 'Navegación principal'}>
          <Link href={isEn ? '/en' : '/'} className={styles.link}>{isEn ? 'Home' : 'Inicio'}</Link>
          <Link href={isEn ? '/en/communities' : '/comunidades'} className={styles.link}>{isEn ? 'Communities' : 'Comunidades'}</Link>
          <Link href={isEn ? '/en/blue-flag' : '/banderas-azules'} className={styles.link}>{isEn ? 'Blue Flag' : 'Banderas Azules'}</Link>
          <Link href="/mapa" className={styles.link}>{isEn ? 'Map' : 'Mapa'}</Link>
        </nav>
        <Link href={isEn ? '/en' : '/'} className={styles.logo} aria-label={isEn ? 'Playas de España — Home' : 'Playas de España — Inicio'}>
          <img src="/logo.svg" alt="Playas de España" width={28} height={28} style={{ display:'block' }} />
        </Link>
        <div className={styles.right}>
          <Link href="/buscar" className={styles.iconBtn} aria-label={isEn ? 'Search' : 'Buscar'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
          <div className={styles.langSwitch} role="group" aria-label={isEn ? 'Language selector' : 'Selector de idioma'}>
            <Link href={esUrl} className={`${styles.langBtn} ${!isEn ? styles.langActive : ''}`} aria-current={!isEn ? 'page' : undefined} lang="es" hrefLang="es">ES</Link>
            <Link href={enUrl} className={`${styles.langBtn} ${isEn ? styles.langActive : ''}`} aria-current={isEn ? 'page' : undefined} lang="en" hrefLang="en">EN</Link>
          </div>
        </div>
      </header>
      {/* Skip link target. Focused on click via href="#main-content".
          tabIndex=-1 makes it programmatically focusable, the element is
          invisible but occupies 0 px so the next Tab lands on the first
          interactive element of the page content. */}
      <div id="main-content" tabIndex={-1} style={{ outline: 'none' }} />
    </>
  )
}
