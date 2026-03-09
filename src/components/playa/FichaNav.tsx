'use client'
import { useEffect, useRef } from 'react'
import styles from './FichaNav.module.css'

const SECCIONES = {
  es: [
    { id: 's-fotos',       label: 'Fotos' },
    { id: 's-meteo',       label: 'Meteorología' },
    { id: 's-calidad',     label: 'Calidad agua' },
    { id: 's-actividades', label: 'Actividades' },
    { id: 's-trafico',     label: 'Cómo llegar' },
    { id: 's-comer',       label: 'Comer' },
    { id: 's-dormir',      label: 'Dormir' },
    { id: 's-servicios',   label: 'Servicios' },
    { id: 's-info',        label: 'Info' },
  ],
  en: [
    { id: 's-fotos',       label: 'Photos' },
    { id: 's-meteo',       label: 'Weather' },
    { id: 's-calidad',     label: 'Water quality' },
    { id: 's-actividades', label: 'Activities' },
    { id: 's-trafico',     label: 'How to get there' },
    { id: 's-comer',       label: 'Eat' },
    { id: 's-dormir',      label: 'Sleep' },
    { id: 's-servicios',   label: 'Facilities' },
    { id: 's-info',        label: 'Info' },
  ],
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const mainNav  = document.querySelector('#main-nav')  as HTMLElement | null
  const fichaNav = document.querySelector('#ficha-nav') as HTMLElement | null
  const navH     = mainNav?.offsetHeight  ?? 52
  const fichaNavH = fichaNav?.offsetHeight ?? 44
  const offset   = navH + fichaNavH + 8
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function FichaNav({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const navRef = useRef<HTMLElement>(null)
  const secciones = SECCIONES[locale]

  useEffect(() => {
    const btns = navRef.current?.querySelectorAll('button')
    if (!btns) return

    const obs = new IntersectionObserver(entries => {
      let best: { idx: number; ratio: number } = { idx: -1, ratio: 0 }
      entries.forEach(e => {
        const i = secciones.findIndex(s => s.id === e.target.id)
        if (i >= 0 && e.intersectionRatio > best.ratio) {
          best = { idx: i, ratio: e.intersectionRatio }
        }
      })
      if (best.idx >= 0) {
        btns.forEach(b => b.classList.remove(styles.active))
        btns[best.idx]?.classList.add(styles.active)
        btns[best.idx]?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
      }
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: [0, 0.1, 0.5, 1],
    })

    secciones.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [secciones])

  return (
    <nav className={styles.nav} ref={navRef} id="ficha-nav">
      {secciones.map((s, i) => (
        <button
          key={s.id}
          className={`${styles.item} ${i === 0 ? styles.active : ''}`}
          onClick={() => scrollToSection(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  )
}