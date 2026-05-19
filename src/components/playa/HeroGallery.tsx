// src/components/playa/HeroGallery.tsx
//
// Thumbnail strip + lightbox bajo el hero. Patrón estándar de turismo
// (Airbnb, Booking) en lugar de carrusel hero auto-rotativo:
//
//   - LCP intacto: la primera foto sigue siendo la del FichaHero con
//     fetchpriority=high. Esta gallery viene DESPUÉS y todos los
//     thumbs llevan loading="lazy".
//   - Engagement: el lightbox abre con click → user-driven, no
//     auto-rotación distrayente que penaliza HCU.
//   - SEO: cada foto está en el HTML como <img> con alt único →
//     6 imágenes indexables por ficha (vs 1 con hero solo).
//   - Schema: ImageGallery + ImageObject por foto (en SchemaPlaya).
//
// Necesita 'use client' porque maneja estado de apertura del lightbox
// y keyboard navigation. El thumbnail strip en sí podría ser server,
// pero al unificarlo todo en un componente client el código es más
// simple y el JS payload es minúsculo (~3kb gzipped).

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FotoPlaya } from '@/lib/fotos'

interface Props {
  fotos:    FotoPlaya[]
  nombre:   string                // Para alt + descripción
  municipio: string
  provincia: string
  /** Index de la foto que ya se está usando en FichaHero. Se omite
   *  del strip para no duplicar. Default 0 (primera). */
  heroIndex?: number
}

/**
 * Alt generado dinámicamente por foto. No tenemos descripción real,
 * pero variamos el texto para evitar 6 alts idénticos (señal SEO mala).
 */
function altPara(nombre: string, municipio: string, provincia: string, idx: number, total: number): string {
  if (total <= 1) return `${nombre} en ${municipio} (${provincia})`
  const sufijos = [
    'vista principal',
    'vista panorámica',
    'detalle de la costa',
    'panorámica del litoral',
    'vista desde la orilla',
    'imagen aérea',
    'detalle de la arena',
    'vista al atardecer',
  ]
  const sufijo = sufijos[idx % sufijos.length]
  return `${nombre} en ${municipio} (${provincia}) — ${sufijo}`
}

export default function HeroGallery({
  fotos,
  nombre,
  municipio,
  provincia,
  heroIndex = 0,
}: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  // Filtramos la foto que ya está en el hero para no duplicar y
  // mantenemos el orden original. Los thumbs van 0...N-1 sobre el
  // array filtrado, pero al abrir lightbox queremos navegar TODAS
  // las fotos (incluyendo la del hero), así que mantenemos dos
  // arrays: `strip` (para la cinta) y `fotos` (para el lightbox).
  const strip = fotos.filter((_, i) => i !== heroIndex)
  if (strip.length === 0) return null

  const total = fotos.length

  // Click en thumb → abre lightbox en la posición real (índice original).
  const abrir = useCallback((stripIdx: number) => {
    // Re-mapear stripIdx (sobre array filtrado) al índice original.
    let count = 0
    for (let i = 0; i < fotos.length; i++) {
      if (i === heroIndex) continue
      if (count === stripIdx) {
        setOpenIdx(i)
        return
      }
      count++
    }
  }, [fotos.length, heroIndex])

  const cerrar = useCallback(() => setOpenIdx(null), [])
  const anterior = useCallback(() => {
    setOpenIdx(idx => idx === null ? null : (idx - 1 + total) % total)
  }, [total])
  const siguiente = useCallback(() => {
    setOpenIdx(idx => idx === null ? null : (idx + 1) % total)
  }, [total])

  // Keyboard navigation cuando el lightbox está abierto.
  useEffect(() => {
    if (openIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      else if (e.key === 'ArrowLeft') anterior()
      else if (e.key === 'ArrowRight') siguiente()
    }
    window.addEventListener('keydown', onKey)
    // Bloquear scroll del body mientras el lightbox está abierto.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [openIdx, cerrar, anterior, siguiente])

  return (
    <>
      <section
        aria-label={`Galería de fotos de ${nombre}`}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '.85rem 1rem 0',
        }}
      >
        <div
          role="list"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(strip.length, 6)}, 1fr)`,
            gap: '.4rem',
          }}
        >
          {strip.slice(0, 6).map((foto, i) => {
            const altText = altPara(nombre, municipio, provincia, i + 1, total)
            return (
              <button
                key={`${foto.url}-${i}`}
                type="button"
                onClick={() => abrir(i)}
                aria-label={`Abrir foto ${i + 2} de ${total}: ${altText}`}
                role="listitem"
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  overflow: 'hidden',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  padding: 0,
                  background: 'var(--card-bg)',
                  cursor: 'pointer',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.thumb || foto.url}
                  alt={altText}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </button>
            )
          })}
        </div>
      </section>

      {openIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${openIdx + 1} de ${total}: ${altPara(nombre, municipio, provincia, openIdx, total)}`}
          onClick={cerrar}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
          }}
        >
          {/* Wrapper que no se cierra al click sobre la imagen */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '92vw', maxHeight: '88vh' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotos[openIdx].url}
              alt={altPara(nombre, municipio, provincia, openIdx, total)}
              style={{
                maxWidth: '92vw',
                maxHeight: '88vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            {fotos[openIdx].autor && (
              <div style={{
                position: 'absolute', bottom: -32, left: 0, right: 0,
                fontSize: '.75rem', color: '#bbb', textAlign: 'center',
              }}>
                Foto: {fotos[openIdx].autor} · {fotos[openIdx].fuente}
              </div>
            )}
          </div>

          {/* Navegación */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); anterior() }}
                aria-label="Foto anterior"
                style={btnNav('left')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); siguiente() }}
                aria-label="Foto siguiente"
                style={btnNav('right')}
              >
                ›
              </button>
            </>
          )}

          {/* Cerrar */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); cerrar() }}
            aria-label="Cerrar galería"
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,.1)', color: '#fff',
              border: 'none', borderRadius: '50%',
              width: 40, height: 40,
              fontSize: '1.5rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>

          {/* Contador */}
          <div style={{
            position: 'absolute', top: '1rem', left: '1rem',
            background: 'rgba(0,0,0,.6)', color: '#fff',
            padding: '.4rem .75rem', borderRadius: 20,
            fontSize: '.85rem', fontFamily: 'var(--font-mono, monospace)',
          }}>
            {openIdx + 1} / {total}
          </div>
        </div>
      )}
    </>
  )
}

function btnNav(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,.1)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 48,
    height: 48,
    fontSize: '2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  } as React.CSSProperties
}
