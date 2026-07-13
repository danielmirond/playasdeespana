// src/components/playa/AlquilerBarcoCTA.tsx
// CTA editorial reutilizable para llevar al hub /alquiler-barco.
// Variantes:
//   - 'card'   → ficha de playa (bloque rectangular dentro del flujo)
//   - 'banner' → top de páginas temáticas (calas, paradisíacas, islas)
//   - 'inline' → línea de texto editorial al final de un párrafo
//
// Server component puro — usa SVG inline en vez de @phosphor-icons/react
// porque al ser server-rendered con Turbopack y optimizePackageImports,
// el tree-shaking de Phosphor causaba 'createContext is not a function'.

import Link from 'next/link'

const Sailboat = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M232.45,154.61a8,8,0,0,0-7-2.61H192V104a16,16,0,0,0-16-16H136V40a8,8,0,0,0-12.94-6.27L74.22,72A8,8,0,0,0,72,77.76V152H56a8,8,0,0,0-7.45,2A8,8,0,0,0,46.43,160a96.07,96.07,0,0,0,180.16,0,8,8,0,0,0,5.86-5.39ZM176,104v48H88V81.66l32-25V96a8,8,0,0,0,8,8Zm-12.41,93A79.93,79.93,0,0,1,71.6,168H213.32A79.92,79.92,0,0,1,163.59,197Z"/>
  </svg>
)
const ArrowRight = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
  </svg>
)

interface Props {
  variant?: 'card' | 'banner' | 'inline'
  /** Texto contextual opcional. Ej. "Cala Salada, Es Trenc, Es Caló…" */
  destacar?: string
  /** Región / comunidad para enlazar a la sección correspondiente */
  region?:  string
}

// Enlazado interno: cada comunidad → su página de COSTA canónica
// (/alquiler-barco/costas/{slug}), que es la rica (SSG, fondeos, precios,
// FAQ), en vez de mandar todo al hub plano /alquiler-barco.
// Así las ~2.500 fichas de playa reparten autoridad a las páginas
// comerciales correctas. Comunidades con una sola costa en el dataset
// apuntan a ella; el resto (varias costas) cae al hub.
const REGION_COSTA: Record<string, string> = {
  'Islas Baleares':       '/alquiler-barco/costas/islas-baleares',
  'Canarias':             '/alquiler-barco/costas/islas-canarias',
  'Islas Canarias':       '/alquiler-barco/costas/islas-canarias',
  'Comunidad Valenciana': '/alquiler-barco/costas/costa-blanca',
  // Andalucía y Cataluña tienen 2 costas en el dataset → mejor el hub
  // para no forzar una elección arbitraria.
  'Cataluña':             '/alquiler-barco',
  'Andalucía':            '/alquiler-barco',
  'Murcia':               '/alquiler-barco',
  'Galicia':              '/alquiler-barco',
  'Asturias':             '/alquiler-barco',
}

export default function AlquilerBarcoCTA({ variant = 'card', destacar, region }: Props) {
  const href = (region && REGION_COSTA[region]) || '/alquiler-barco'

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
        <Sailboat size={28} color="var(--accent, #6b400a)" />
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
        <ArrowRight size={18} color="var(--accent, #6b400a)" />
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
        <Sailboat size={22} color="var(--accent, #6b400a)" />
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
        <ArrowRight size={14} />
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
