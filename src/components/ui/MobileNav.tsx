'use client'
// src/components/ui/MobileNav.tsx
// Menú hamburguesa para mobile (< 768px)
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './MobileNav.module.css'

function getLangUrl(pathname: string, targetLocale: 'es' | 'en'): string {
  const isEn = pathname.startsWith('/en')

  if (targetLocale === 'en') {
    if (isEn) return pathname
    if (pathname.startsWith('/playas/'))      return pathname.replace('/playas/', '/en/beaches/')
    if (pathname.startsWith('/comunidad/'))   return pathname.replace('/comunidad/', '/en/communities/')
    if (pathname.startsWith('/provincia/'))   return pathname.replace('/provincia/', '/en/provinces/')
    return '/en'
  } else {
    if (!isEn) return pathname
    if (pathname.startsWith('/en/beaches/'))     return pathname.replace('/en/beaches/', '/playas/')
    if (pathname.startsWith('/en/communities/')) return pathname.replace('/en/communities/', '/comunidad/')
    if (pathname.startsWith('/en/provinces/'))   return pathname.replace('/en/provinces/', '/provincia/')
    return '/'
  }
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en')
  const esUrl = getLangUrl(pathname, 'es')
  const enUrl = getLangUrl(pathname, 'en')

  const closeMenu = () => setIsOpen(false)

  const menuItems = [
    { href: isEn ? '/en' : '/', label: isEn ? 'Home' : 'Inicio' },
    { href: isEn ? '/en/communities' : '/comunidades', label: isEn ? 'Communities' : 'Comunidades' },
    { href: isEn ? '/en/blue-flag' : '/banderas-azules', label: isEn ? 'Blue Flag' : 'Banderas Azules' },
    ...(isEn ? [] : [
      { href: '/alquiler-barco', label: 'Alquiler de Barcos' },
      { href: '/playas-perros', label: 'Perros' },
      { href: '/playas-nudistas', label: 'Nudistas' },
      { href: '/surf', label: 'Surf' },
      { href: '/rutas', label: 'Rutas' },
    ]),
    { href: '/mapa', label: isEn ? 'Map' : 'Mapa' },
  ]

  return (
    <div className={styles.mobileNav}>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isEn ? 'Menu' : 'Menú'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {isOpen && (
        <div className={styles.backdrop} onClick={closeMenu} aria-hidden="true" />
      )}

      <nav
        id="mobile-menu"
        className={`${styles.menu} ${isOpen ? styles.open : ''}`}
        aria-label={isEn ? 'Mobile navigation' : 'Navegación móvil'}
      >
        <div className={styles.menuHeader}>
          <h2 className={styles.menuTitle}>{isEn ? 'Menu' : 'Menú'}</h2>
          <button
            className={styles.closeBtn}
            onClick={closeMenu}
            aria-label={isEn ? 'Close menu' : 'Cerrar menú'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.menuItems}>
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.menuItem}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.menuFooter}>
          <div className={styles.langSwitch} role="group" aria-label={isEn ? 'Language selector' : 'Selector de idioma'}>
            <Link href={esUrl} className={`${styles.langBtn} ${!isEn ? styles.langActive : ''}`} onClick={closeMenu} lang="es" hrefLang="es">Español</Link>
            <Link href={enUrl} className={`${styles.langBtn} ${isEn ? styles.langActive : ''}`} onClick={closeMenu} lang="en" hrefLang="en">English</Link>
          </div>
          <Link href="/buscar" className={styles.searchLink} onClick={closeMenu} aria-label={isEn ? 'Search' : 'Buscar'}>
            {isEn ? 'Search' : 'Buscar'}
          </Link>
        </div>
      </nav>
    </div>
  )
}
