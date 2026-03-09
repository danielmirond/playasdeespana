'use client'
import { useState } from 'react'
import type { FotoPlaya as PlayaFoto } from '@/lib/fotos'

export default function FotoGallery({ fotos, nombre }: { fotos: PlayaFoto[]; nombre: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (!fotos.length) return null

  const foto = fotos[active]

  return (
    <>
      <div className="foto-gallery">
        {/* Foto principal */}
        <div
          className="fg-main"
          style={{ background: (foto as any).color }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={foto.url_small}
            alt={foto.alt}
            className="fg-img"
            loading="lazy"
          />
          <div className="fg-overlay">
            <span className="fg-expand">⤢</span>
          </div>
          <div className="fg-credit">
            Foto:{' '}
            <a
              href={foto.autor_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              {foto.autor}
            </a>
            {foto.source === 'unsplash' || foto.source === 'curada'
              ? <> en <a href="https://unsplash.com?utm_source=playasdeespana&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></>
              : <> · Wikimedia Commons</>
            }
          </div>
        </div>

        {/* Miniaturas */}
        {fotos.length > 1 && (
          <div className="fg-thumbs">
            {fotos.map((f, i) => (
              <button
                key={i}
                className={`fg-thumb ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                style={{ background: f.color }}
                aria-label={`Foto ${i + 1} de ${nombre}`}
              >
                <img src={f.url_thumb} alt="" loading="lazy"/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lb-close" onClick={() => setLightbox(false)}>✕</button>
          <div className="lb-inner" onClick={e => e.stopPropagation()}>
            <img src={foto.url} alt={foto.alt} className="lb-img"/>
            {fotos.length > 1 && (
              <>
                <button
                  className="lb-prev"
                  onClick={() => setActive(a => (a - 1 + fotos.length) % fotos.length)}
                >‹</button>
                <button
                  className="lb-next"
                  onClick={() => setActive(a => (a + 1) % fotos.length)}
                >›</button>
              </>
            )}
            <div className="lb-credit">
              <a href={foto.autor_url} target="_blank" rel="noopener noreferrer">{foto.autor}</a>
              {(foto.source === 'unsplash' || foto.source === 'curada') &&
                <> · <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a></>
              }
            </div>
          </div>
        </div>
      )}
    </>
  )
}
