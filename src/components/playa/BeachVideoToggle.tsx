'use client'
// src/components/playa/BeachVideoToggle.tsx
//
// Wrapper click-to-load para BeachVideo. Antes el iframe YouTube
// se cargaba SIEMPRE aunque el user no quisiera verlo (~85 kB JS +
// red-tape de YouTube). Penalty LCP/INP en mobile.
//
// Ahora: renderizamos un botón estático con el título. Al click,
// se monta el iframe (lazy import del componente). Cero coste hasta
// la interacción.

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Play } from '@phosphor-icons/react'
import type { VideoPlaya } from '@/lib/videos'

const BeachVideo = dynamic(() => import('./BeachVideo'), { ssr: false })

interface Props {
  video:  VideoPlaya
  nombre: string
  locale?: 'es' | 'en'
}

export default function BeachVideoToggle({ video, nombre, locale = 'es' }: Props) {
  const [open, setOpen] = useState(false)
  const es = locale === 'es'

  if (open) {
    return <BeachVideo video={video} nombre={nombre} />
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={es ? `Ver vídeo aéreo de ${nombre}` : `Watch aerial video of ${nombre}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '.65rem',
        width: '100%',
        margin: '0 0 1.5rem',
        padding: '.85rem 1rem',
        background: 'var(--card-bg, #faf6ef)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 8,
        fontSize: '.92rem',
        color: 'var(--ink, #2a1a08)',
        cursor: 'pointer',
        textAlign: 'left',
        minHeight: 44,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Play size={14} weight="fill" />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontWeight: 600, lineHeight: 1.2 }}>
          {es ? `Vídeo aéreo de ${nombre}` : `Aerial video of ${nombre}`}
        </span>
        <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted, #5a3d12)', marginTop: 2 }}>
          {video.channelTitle ? (es ? `${video.channelTitle} · vía YouTube` : `${video.channelTitle} · via YouTube`) : 'YouTube'}
        </span>
      </span>
      <span aria-hidden="true" style={{ color: 'var(--muted, #5a3d12)', fontSize: '.78rem' }}>
        {es ? 'Cargar ▾' : 'Load ▾'}
      </span>
    </button>
  )
}
