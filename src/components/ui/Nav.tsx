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
    if (pathname.startsWith('/magazine/categoria/')) return pathname.replace('/magazine/categoria/', '/en/magazine/category/')
    if (pathname.startsWith('/magazine'))     return pathname.replace('/magazine', '/en/magazine')
    return '/en'
  } else {
    if (!isEn) return pathname
    // EN → ES
    if (pathname.startsWith('/en/beaches/'))     return pathname.replace('/en/beaches/', '/playas/')
    if (pathname.startsWith('/en/communities/')) return pathname.replace('/en/communities/', '/comunidad/')
    if (pathname.startsWith('/en/provinces/'))   return pathname.replace('/en/provinces/', '/provincia/')
    if (pathname.startsWith('/en/magazine/category/')) return pathname.replace('/en/magazine/category/', '/magazine/categoria/')
    if (pathname.startsWith('/en/magazine'))     return pathname.replace('/en/magazine', '/magazine')
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
        {/* 9 ítems de etiqueta corta (auditoría jul-2026): "Alquiler de
            Barcos" partía en 3 líneas en desktop, y el clúster vivo
            (banderas-hoy) no tenía hueco pese a ser el diferencial. Banderas
            Azules, Nudistas y Rutas siguen enlazados desde footer y hubs. */}
        <nav className={styles.links} aria-label={isEn ? 'Main navigation' : 'Navegación principal'}>
          <Link href={isEn ? '/en' : '/'} className={styles.link}>{isEn ? 'Home' : 'Inicio'}</Link>
          <Link href={isEn ? '/en/communities' : '/comunidades'} className={styles.link}>{isEn ? 'Communities' : 'Comunidades'}</Link>
          {!isEn && <Link href="/banderas-hoy" className={styles.link}>Banderas hoy</Link>}
          {isEn && <Link href="/en/blue-flag" className={styles.link}>Blue Flag</Link>}
          <Link href={isEn ? '/en/boat-rental' : '/alquiler-barco'} className={styles.link}>{isEn ? 'Boats' : 'Barcos'}</Link>
          <Link href={isEn ? '/en/campervan-rental' : '/alquiler-autocaravana'} className={styles.link}>{isEn ? 'Campervans' : 'Autocaravanas'}</Link>
          {!isEn && <Link href="/playas-perros" className={styles.link}>Perros</Link>}
          {!isEn && <Link href="/surf" className={styles.link}>Surf</Link>}
          <Link href={isEn ? '/en/magazine' : '/magazine'} className={styles.link}>Magazine</Link>
          <Link href="/mapa" className={styles.link}>{isEn ? 'Map' : 'Mapa'}</Link>
        </nav>
        <Link href={isEn ? '/en' : '/'} className={styles.logo} aria-label={isEn ? 'Playas de España. Home' : 'Playas de España. Inicio'}>
          <img src="/logo.svg" alt="Playas de España" width={140} height={36} fetchPriority="high" decoding="async" style={{ display:'block', height: 36, width: 'auto' }} />
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
