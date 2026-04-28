'use client'
// src/components/playa/ReportarDrawer.tsx
// Drawer wrapper para ReportarEstado. Se abre escuchando el custom event
// `open-reportar-drawer` (lo dispara el "+ avisar" del hero u otros triggers).

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Drawer from '@/components/ui/Drawer'

const ReportarEstado = dynamic(() => import('./ReportarEstado'), {
  ssr: false,
  loading: () => <div style={{ padding: '1rem 0', fontFamily: 'var(--font-mono, monospace)', fontSize: '.78rem', color: 'var(--muted, #5a3d12)' }}>Cargando…</div>,
})

interface Props {
  slug:    string
  locale?: 'es' | 'en'
}

export const REPORTAR_DRAWER_EVENT = 'open-reportar-drawer'

export default function ReportarDrawer({ slug, locale = 'es' }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(REPORTAR_DRAWER_EVENT, handler)
    return () => window.removeEventListener(REPORTAR_DRAWER_EVENT, handler)
  }, [])

  // Permite también abrir vía hash #reportar (link compartible)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#reportar') setOpen(true)
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const handleClose = () => {
    setOpen(false)
    if (window.location.hash === '#reportar') {
      // Limpia el hash sin volver a disparar listener
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={locale === 'en' ? 'Report state' : '¿Cómo está hoy?'}
      width={440}
    >
      <p style={{
        margin: '0 0 1rem',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.78rem',
        color: 'var(--muted, #5a3d12)',
        lineHeight: 1.5,
      }}>
        {locale === 'en'
          ? 'Reports stay live for 24 h and help everyone who comes after. No login needed.'
          : 'Los avisos viven 24 h y ayudan a quien venga después. No requiere registro.'}
      </p>
      {open && <ReportarEstado slug={slug} locale={locale} />}
    </Drawer>
  )
}
