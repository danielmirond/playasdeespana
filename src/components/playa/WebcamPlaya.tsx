'use client'
// src/components/playa/WebcamPlaya.tsx
//
// Webcam en directo cercana a la playa (Windy). Click-to-load: muestra la
// imagen actual con un botón de play; el iframe del player solo se monta al
// pulsar (perf: sin coste de iframe hasta la interacción, como BeachVideo).
// Atribución "vía Windy.com" obligatoria por términos de la API.

import { useState } from 'react'
import { VideoCamera, Play } from '@phosphor-icons/react'
import type { Webcam } from '@/lib/webcams'

interface Props {
  webcams: Webcam[]
  nombre:  string
  locale?: 'es' | 'en'
}

function dist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`
}

export default function WebcamPlaya({ webcams, nombre, locale = 'es' }: Props) {
  const [idx, setIdx] = useState(0)
  const [open, setOpen] = useState(false)
  if (!webcams || webcams.length === 0) return null

  const es = locale === 'es'
  const cam = webcams[idx] ?? webcams[0]

  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--line)',
      borderRadius: 6, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '.85rem 1rem .6rem',
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          <VideoCamera size={16} weight="bold" style={{ marginRight: '.35rem', verticalAlign: 'middle', color: 'var(--accent)' }} />
          {es ? <>Webcam <em>en directo</em></> : <>Live <em>webcam</em></>}
        </h2>
        <span style={{ fontSize: '.68rem', color: 'var(--muted)' }}>{es ? 'vía Windy.com' : 'via Windy.com'}</span>
      </div>

      <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0b1620' }}>
        {open && cam.embedUrl ? (
          <iframe
            src={cam.embedUrl}
            title={`${es ? 'Webcam' : 'Webcam'} · ${cam.title}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={es ? `Ver webcam en directo cerca de ${nombre}` : `Watch live webcam near ${nombre}`}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              border: 'none', cursor: 'pointer', padding: 0,
              backgroundImage: cam.thumb ? `url(${cam.thumb})` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span aria-hidden="true" style={{
              width: 58, height: 58, borderRadius: '50%',
              background: 'rgba(0,0,0,.55)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(2px)',
            }}>
              <Play size={26} weight="fill" />
            </span>
          </button>
        )}
      </div>

      <div style={{ padding: '.6rem 1rem .85rem', fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{cam.title}</strong>
        <span> · {es ? 'a' : ''} {dist(cam.distancia_m)}</span>
        {webcams.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.6rem' }}>
            {webcams.slice(0, 4).map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => { setIdx(i); setOpen(false) }}
                aria-pressed={i === idx}
                style={{
                  fontSize: '.7rem', padding: '.25rem .6rem', borderRadius: 999,
                  cursor: 'pointer',
                  border: `1px solid ${i === idx ? 'var(--accent)' : 'var(--line)'}`,
                  background: i === idx ? 'var(--accent)' : 'transparent',
                  color: i === idx ? '#fff' : 'var(--muted)',
                }}
              >
                {dist(w.distancia_m)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
