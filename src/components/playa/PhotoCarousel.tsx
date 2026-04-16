'use client'
// src/components/playa/PhotoCarousel.tsx
// Client-side photo carousel that handles broken image sources gracefully.
// A slide whose <img> errors out (404, blocked, wrong content-type, etc.)
// is removed from the rendered list instead of showing the browser's
// broken-image icon. If every slide fails, the component returns the
// empty-state fallback so the page looks clean.

import { useState } from 'react'
import { Camera } from '@phosphor-icons/react/dist/ssr'
import type { FotoPlaya } from '@/lib/fotos'
import styles from './FichaBody.module.css'

type Props = {
  fotos: FotoPlaya[]
  nombreAlt: string        // Alt text prefix, e.g. the beach name
  locale?: 'es' | 'en'
}

function fuenteLabel(f: FotoPlaya['fuente']): string {
  if (f === 'wikimedia') return 'Wikimedia Commons'
  if (f === 'flickr') return 'Flickr'
  return 'Unsplash'
}

export default function PhotoCarousel({ fotos, nombreAlt, locale = 'es' }: Props) {
  // Track which photos have errored. Rendering filters them out.
  const [broken, setBroken] = useState<Set<number>>(new Set())

  const visibles = fotos
    .map((f, i) => ({ f, i }))
    .filter(({ i }) => !broken.has(i))

  if (visibles.length === 0) {
    return (
      <div className={styles.carousel}>
        <div
          className={styles.carouselSlide}
          style={{ background: 'linear-gradient(160deg,#1a6b8a,#2a9a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)', padding: '2rem' }}>
            <Camera size={32} weight="light" style={{ marginBottom: '.5rem', opacity: .6 }} />
            <div style={{ fontSize: '.8rem' }}>
              {locale === 'en' ? 'No photos available yet' : 'Sin fotos disponibles'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.carousel}>
      {visibles.map(({ f, i }, posicion) => (
        <div key={i} className={styles.carouselSlide}>
          <img
            src={posicion === 0 ? f.url : f.thumb}
            alt={`${nombreAlt} - foto ${posicion + 1}`}
            loading={posicion === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setBroken(prev => {
              const next = new Set(prev)
              next.add(i)
              return next
            })}
            {...(posicion === 0 ? { fetchPriority: 'high' as const } : {})}
          />
          {posicion === 0 && (
            <div className={styles.gFuente}>
              <Camera size={12} /> {fuenteLabel(f.fuente)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
