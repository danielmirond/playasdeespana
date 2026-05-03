// src/components/playa/AlquilerBarcoCTA.tsx
// CTA editorial reutilizable para llevar a /alquiler-barco-playa.
// Variantes:
//   - 'card'   → ficha de playa (bloque rectangular dentro del flujo)
//   - 'banner' → top de páginas temáticas (calas, paradisíacas, islas)
//   - 'inline' → línea de texto editorial al final de un párrafo
//
// La decisión de mostrarlo o no se hace en el componente padre con
// debeMostrarCTABarco(playa).

import Link from 'next/link'
import { Sailboat, ArrowRight } from '@phosphor-icons/react'

interface Props {
  variant?: 'card' | 'banner' | 'inline'
  /** Texto contextual opcional. Ej. "Cala Salada, Es Trenc, Es Caló…" */
  destacar?: string
  /** Región / comunidad para enlazar a la sección correspondiente */
  region?:  string
}

const REGION_HASH: Record<string, string> = {
  'Islas Baleares':       '#destinos',
  'Canarias':             '#destinos',
  'Cataluña':             '#destinos',
  'Andalucía':            '#destinos',
  'Murcia':               '#destinos',
  'Galicia':              '#destinos',
  'Comunidad Valenciana': '#destinos',
}

export default function AlquilerBarcoCTA({ variant = 'card', destacar, region }: Props) {
  const hash = region ? (REGION_HASH[region] ?? '') : ''
  const href = `/alquiler-barco-playa${hash}`

  if (variant === 'inline') {
    return (
      <Link href={href} style={{
        color: 'var(--accent, #6b400a)',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
      }}>
        alquilar un barco para esta zona
      </Link>
    )
  }

  if (variant === 'banner') {
    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(110deg, rgba(10,110,140,.08) 0%, rgba(196,138,30,.06) 100%)',
          border: '1px solid var(--line, #e8dcc8)',
          borderRadius: 8,
          textDecoration: 'none',
          color: 'var(--ink, #2a1a08)',
          margin: '1rem 0',
        }}
      >
        <Sailboat size={28} weight="regular" color="var(--accent, #6b400a)" aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
          }}>
            ¿Y si las ves desde el agua?
          </div>
          <div style={{
            marginTop: '.15rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.7rem',
            letterSpacing: '.04em',
            color: 'var(--muted, #5a3d12)',
          }}>
            Alquila un barco con o sin patrón · Click&Boat, Samboat, Nautal comparados
          </div>
        </div>
        <ArrowRight size={18} weight="bold" color="var(--accent, #6b400a)" aria-hidden="true" />
      </Link>
    )
  }

  // card (default)
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '1.15rem 1.25rem',
        background: 'var(--card-bg, #faf6ef)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'var(--ink, #2a1a08)',
        margin: '1.25rem 0',
        transition: 'border-color .15s, transform .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '.5rem' }}>
        <Sailboat size={22} weight="regular" color="var(--accent, #6b400a)" aria-hidden="true" />
        <h3 style={{
          margin: 0,
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '-.01em',
        }}>
          Llega en barco
        </h3>
      </div>
      <p style={{
        margin: '0 0 .65rem',
        fontSize: '.92rem',
        lineHeight: 1.55,
        color: 'var(--ink, #2a1a08)',
      }}>
        {destacar
          ? `Las calas más bonitas de la zona (${destacar}) son accesibles solo por mar. Alquilar un barco para el día abre rincones que desde tierra no ves.`
          : 'Las mejores calas de esta costa son accesibles solo por mar. Alquilar un barco para el día abre rincones que desde tierra no ves.'}
      </p>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.4rem',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.72rem',
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: 'var(--accent, #6b400a)',
        fontWeight: 600,
      }}>
        Comparar plataformas
        <ArrowRight size={14} weight="bold" aria-hidden="true" />
      </span>
    </Link>
  )
}

// ── Predicado para decidir si mostrar el CTA en una ficha ───────────
import type { Playa } from '@/types'

const COSTAS_CON_BARCO = new Set([
  'Islas Baleares',
  'Canarias',
  'Islas Canarias',
  'Cataluña',
  'Andalucía',          // costa del sol, costa de la luz, almería
  'Murcia',             // mar menor, calas
  'Galicia',            // rías baixas
  'Comunidad Valenciana', // costa azahar
  'Asturias',           // pero menos común
])

/**
 * Decide si una playa es buena candidata para el CTA de barcos.
 * Criterio: costas con tradición de alquiler de barcos + tipos de
 * playa donde "se ve más desde el mar" (calas, paradisíacas, urbanas
 * grandes con marinas).
 */
export function debeMostrarCTABarco(playa: Playa): boolean {
  if (!COSTAS_CON_BARCO.has(playa.comunidad)) return false
  // Calas: candidatas evidentes
  if (playa.tipo === 'cala') return true
  if (/cala|caleta|ensenada/i.test(playa.nombre)) return true
  // Playas con bandera azul o accesibles → suelen tener marina cerca
  if (playa.bandera) return true
  // Default: en costas con barco, sí (CTA es sutil)
  return true
}
