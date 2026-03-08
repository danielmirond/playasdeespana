'use client'
import { useEffect, useRef } from 'react'
import styles from './FichaNav.module.css'

const SECCIONES = [
  { id: 's-fotos',       label: 'Fotos' },
  { id: 's-meteo',       label: 'Meteorología' },
  { id: 's-calidad',     label: 'Calidad agua' },
  { id: 's-actividades', label: 'Actividades' },
  { id: 's-trafico',     label: 'Cómo llegar' },
  { id: 's-comer',       label: 'Comer' },
  { id: 's-dormir',      label: 'Dormir' },
  { id: 's-servicios',   label: 'Servicios' },
  { id: 's-info',        label: 'Info' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  // Calcular offset acumulado de sticky headers
  const mainNav   = document.querySelector('#main-nav')   as HTMLElement | null
  const fichaNav  = document.querySelector('#ficha-nav')  as HTMLElement | null
  const navH      = mainNav?.offsetHeight  ?? 52
  const fichaNavH = fichaNav?.offsetHeight ?? 44
  const offset    = navH + fichaNavH + 8  // 8px de margen extra

  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function FichaNav() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const btns = navRef.current?.querySelectorAll('button')
    if (!btns) return

    const obs = new IntersectionObserver(entries => {
      // Encontrar la sección más visible
      let best: { idx: number; ratio: number } = { idx: -1, ratio: 0 }
      entries.forEach(e => {
        const i = SECCIONES.findIndex(s => s.id === e.target.id)
        if (i >= 0 && e.intersectionRatio > best.ratio) {
          best = { idx: i, ratio: e.intersectionRatio }
        }
      })
      if (best.idx >= 0) {
        btns.forEach(b => b.classList.remove(styles.active))
        btns[best.idx]?.classList.add(styles.active)
        // Auto-scroll del nav para mostrar el botón activo
        btns[best.idx]?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
      }
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: [0, 0.1, 0.5, 1],
    })

    SECCIONES.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [])

  return (
    <nav className={styles.nav} ref={navRef} id="ficha-nav">
      {SECCIONES.map((s, i) => (
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
