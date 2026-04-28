'use client'
// src/components/ui/Drawer.tsx
// Reusable right-side drawer. ESC to close, click overlay, body scroll lock,
// focus trap básico. Animaciones respetan prefers-reduced-motion.

import { useEffect, useRef, useCallback } from 'react'
import { X } from '@phosphor-icons/react'
import styles from './Drawer.module.css'

interface Props {
  open:        boolean
  onClose:     () => void
  title:       string
  children:    React.ReactNode
  width?:      number     // px, default 420
  ariaLabelledBy?: string
}

export default function Drawer({ open, onClose, title, children, width = 420, ariaLabelledBy }: Props) {
  const panelRef    = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  // Body scroll lock + restore previous focus on close
  useEffect(() => {
    if (!open) return
    previousFocus.current = (document.activeElement as HTMLElement) ?? null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus first focusable element in panel
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusables?.[0]?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      previousFocus.current?.focus?.()
    }
  }, [open])

  // ESC to close + simple focus trap (Tab cycles inside)
  const onKey = useCallback((e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (e.key !== 'Tab') return
    const list = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!list || list.length === 0) return
    const first = list[0]
    const last  = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault() }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
  }, [open, onClose])

  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onKey])

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.open : ''}`}
        style={{ width: `min(${width}px, 100%)` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy ?? 'drawer-title'}
        aria-hidden={!open}
      >
        <header className={styles.header}>
          <h2 id={ariaLabelledBy ?? 'drawer-title'} className={styles.title}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.close}
            aria-label="Cerrar"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </aside>
    </>
  )
}
