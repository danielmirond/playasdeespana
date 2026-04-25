'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './FichaNav.module.css'

const SECCIONES = {
  es: [
    { id: 's-fotos',       label: 'Fotos' },
    { id: 's-meteo',       label: 'Mar y meteo' },
    { id: 's-seguridad',   label: 'Seguridad' },
    { id: 's-calidad',     label: 'Calidad agua' },
    { id: 's-comoLlegar',  label: 'Cómo llegar' },
    { id: 's-trafico',     label: 'Parking' },
    { id: 's-comer',       label: 'Comer' },
    { id: 's-dormir',      label: 'Dormir' },
    { id: 's-campings',    label: 'Campings' },
    { id: 's-buceo',       label: 'Buceo' },
    { id: 's-servicios',   label: 'Servicios' },
    { id: 's-info',        label: 'Datos' },
    { id: 's-cercanas',    label: 'Cercanas' },
  ],
  en: [
    { id: 's-fotos',       label: 'Photos' },
    { id: 's-meteo',       label: 'Sea & weather' },
    { id: 's-seguridad',   label: 'Safety' },
    { id: 's-calidad',     label: 'Water quality' },
    { id: 's-comoLlegar',  label: 'Directions' },
    { id: 's-trafico',     label: 'Parking' },
    { id: 's-comer',       label: 'Eat' },
    { id: 's-dormir',      label: 'Sleep' },
    { id: 's-campings',    label: 'Campings' },
    { id: 's-buceo',       label: 'Diving' },
    { id: 's-servicios',   label: 'Facilities' },
    { id: 's-info',        label: 'Info' },
    { id: 's-cercanas',    label: 'Nearby' },
  ],
}

let cachedOffset = 0
function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (!cachedOffset) {
    const navH = document.querySelector('#main-nav')?.getBoundingClientRect().height ?? 52
    const fichaNavH = document.querySelector('#ficha-nav')?.getBoundingClientRect().height ?? 44
    cachedOffset = navH + fichaNavH + 8
  }
  const top = el.getBoundingClientRect().top + window.scrollY - cachedOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function FichaNav({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const navRef = useRef<HTMLElement>(null)
  const allSecciones = SECCIONES[locale]
  const [visibles, setVisibles] = useState<typeof allSecciones>([])

  useEffect(() => {
    const present = allSecciones.filter(s => document.getElementById(s.id))
    setVisibles(present)
  }, [allSecciones])

  useEffect(() => {
    if (visibles.length === 0) return
    const btns = navRef.current?.querySelectorAll('button')
    if (!btns) return

    const obs = new IntersectionObserver(entries => {
      let best: { idx: number; ratio: number } = { idx: -1, ratio: 0 }
      entries.forEach(e => {
        const i = visibles.findIndex(s => s.id === e.target.id)
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

    visibles.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [visibles])

  if (visibles.length === 0) return null

  return (
    <nav className={styles.nav} ref={navRef} id="ficha-nav">
      {visibles.map((s, i) => (
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