'use client'
// src/components/playa/AfiliacionDrawer.tsx
// Drawer "¿Qué llevar?" — escucha custom event 'open-afiliacion-drawer'.
// Lista contextual de productos Amazon con razón por playa.

import { useEffect, useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import { AMAZON_TAG } from '@/lib/amazon-productos'
import type { ProductoAmazon } from '@/lib/amazon-productos'
import { AFILIACION_DRAWER_EVENT } from './AsideAfiliacionCTA'

interface Props {
  nombre:    string
  productos: ProductoAmazon[]
  slug:      string
  locale?:   'es' | 'en'
}

export default function AfiliacionDrawer({ nombre, productos, slug, locale = 'es' }: Props) {
  const [open, setOpen] = useState(false)
  const es = locale === 'es'

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(AFILIACION_DRAWER_EVENT, handler)
    return () => window.removeEventListener(AFILIACION_DRAWER_EVENT, handler)
  }, [])

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title={es ? `Qué llevar a ${nombre}` : `What to bring to ${nombre}`}
      width={460}
    >
      <p style={{
        margin: '0 0 1.25rem',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.78rem',
        color: 'var(--muted, #5a3d12)',
        lineHeight: 1.55,
      }}>
        {es
          ? 'Selección contextual según composición, estado del mar y servicios disponibles en esta playa.'
          : 'Contextual selection based on beach composition, sea state and available services.'}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {productos.map((p, i) => (
          <li
            key={p.asin}
            style={{
              padding: '.85rem 0',
              borderTop: i === 0 ? '0' : '1px solid var(--line, #e8dcc8)',
            }}
          >
            <a
              href={`https://www.amazon.es/dp/${p.asin}/?tag=${AMAZON_TAG}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '.85rem',
                color: 'inherit', textDecoration: 'none',
              }}
            >
              <span style={{
                width: 56, height: 56, borderRadius: 6,
                background: 'var(--metric-bg, #f0e6d0)',
                color: 'var(--accent, #6b400a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: '1.05rem', fontWeight: 700,
                flexShrink: 0,
              }} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontWeight: 700,
                  fontSize: '.95rem',
                  color: 'var(--ink, #2a1a08)',
                  lineHeight: 1.3,
                }}>
                  {p.nombre}
                </span>
                <span style={{
                  display: 'block',
                  marginTop: '.2rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '.7rem',
                  color: 'var(--muted, #5a3d12)',
                  letterSpacing: '.04em',
                }}>
                  {p.precio} € · {p.categoria}
                </span>
              </span>
              <span aria-hidden="true" style={{ color: 'var(--accent, #6b400a)', fontWeight: 700 }}>→</span>
            </a>
          </li>
        ))}
      </ul>

      <a
        href={`/playas/${slug}/que-llevar`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '1.25rem', padding: '.85rem 1rem',
          border: '1px solid var(--accent, #6b400a)',
          borderRadius: 6,
          background: 'rgba(196, 138, 30, .08)',
          color: 'var(--accent, #6b400a)',
          textDecoration: 'none',
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontStyle: 'italic', fontSize: '.95rem',
        }}
      >
        <span>{es ? `Guía completa: qué llevar a ${nombre}` : `Full guide: what to bring to ${nombre}`}</span>
        <span aria-hidden="true">→</span>
      </a>

      <p style={{
        margin: '1rem 0 0',
        paddingTop: '1rem',
        borderTop: '1px solid var(--line, #e8dcc8)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.62rem',
        color: 'var(--muted, #5a3d12)',
        opacity: .7,
        lineHeight: 1.5,
      }}>
        {es
          ? `Amazon.es · enlaces de afiliado (tag ${AMAZON_TAG}). Ganamos una comisión sin coste adicional para ti si compras a través de estos enlaces.`
          : `Amazon.es · affiliate links (tag ${AMAZON_TAG}). We earn a commission at no extra cost if you buy through these links.`}
      </p>
    </Drawer>
  )
}
