// src/components/playa/FerriesCTA.tsx
// CTA de ferry — solo se muestra en playas de Baleares y Canarias, donde
// la mayoría de turistas llega en ferry (Barcelona/Valencia/Denia → Baleares,
// Huelva/Cádiz → Canarias). AOV alto (100-400€ por billete ida+vuelta).

import type { Playa } from '@/types'

interface Props {
  playa:   Playa
  locale?: 'es' | 'en'
}

const DIRECT_FERRIES_AFF = process.env.NEXT_PUBLIC_DIRECTFERRIES_AFF ?? ''
const BALEARIA_AFF       = process.env.NEXT_PUBLIC_BALEARIA_AFF ?? ''

// Mapeo playa → destino ferry canónico
function destinoFerry(playa: Playa): string | null {
  const c = playa.comunidad
  if (c === 'Islas Baleares') {
    const p = playa.provincia.toLowerCase()
    if (p.includes('mallorca')) return 'Palma de Mallorca'
    if (p.includes('menorca'))  return 'Menorca'
    if (p.includes('ibiza') || p.includes('eivissa')) return 'Ibiza'
    if (p.includes('formentera')) return 'Formentera'
    return 'Baleares'
  }
  if (c === 'Canarias') {
    const p = playa.provincia.toLowerCase()
    if (p.includes('palmas') || p.includes('gran canaria')) return 'Gran Canaria'
    if (p.includes('tenerife')) return 'Tenerife'
    if (p.includes('lanzarote')) return 'Lanzarote'
    if (p.includes('fuerteventura')) return 'Fuerteventura'
    if (p.includes('palma')) return 'La Palma'
    return 'Canarias'
  }
  return null
}

export default function FerriesCTA({ playa, locale = 'es' }: Props) {
  const destino = destinoFerry(playa)
  if (!destino) return null
  // Si no hay ningún afiliado configurado, no mostrar
  if (!DIRECT_FERRIES_AFF && !BALEARIA_AFF) return null

  const es = locale === 'es'
  const esBaleares = playa.comunidad === 'Islas Baleares'
  const destQuery = encodeURIComponent(destino)

  return (
    <aside
      aria-label={es ? 'Ferries a esta isla' : 'Ferries to this island'}
      style={{
        background: 'linear-gradient(135deg, #003580 0%, #0071c2 100%)',
        borderRadius: 6,
        padding: '1.1rem 1.25rem',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '2rem' }} aria-hidden="true">⛴️</div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '.95rem', marginBottom: '.15rem' }}>
            {es ? `Ferry a ${destino}` : `Ferry to ${destino}`}
          </div>
          <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.85)', lineHeight: 1.5 }}>
            {esBaleares
              ? (es
                  ? 'Desde Barcelona, Valencia, Denia o Alcudia. Coches, pasajeros y mascotas.'
                  : 'From Barcelona, Valencia, Denia or Alcudia. Cars, passengers and pets.')
              : (es
                  ? 'Desde Huelva o Cádiz. Vehículos, camarotes y butacas.'
                  : 'From Huelva or Cádiz. Vehicles, cabins and seats.')
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {DIRECT_FERRIES_AFF && (
            <a
              href={`https://www.directferries.es/ferry-${destQuery}.htm?aff=${DIRECT_FERRIES_AFF}`}
              target="_blank" rel="noopener noreferrer sponsored"
              style={{
                padding: '.55rem 1rem', background: '#fff', color: '#003580',
                borderRadius: 4, fontSize: '.78rem', fontWeight: 500,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              {es ? 'Comparar ferries' : 'Compare ferries'} →
            </a>
          )}
          {BALEARIA_AFF && esBaleares && (
            <a
              href={`https://www.balearia.com/?aff=${BALEARIA_AFF}&to=${destQuery}`}
              target="_blank" rel="noopener noreferrer sponsored"
              style={{
                padding: '.55rem 1rem', background: 'rgba(255,255,255,.2)', color: '#fff',
                borderRadius: 4, fontSize: '.78rem', fontWeight: 500,
                textDecoration: 'none', whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,.4)',
              }}
            >
              Baleària →
            </a>
          )}
        </div>
      </div>
    </aside>
  )
}
