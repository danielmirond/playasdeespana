// src/components/home/ParkingHoy.tsx
// "Parking hoy". playas con parking, agrupadas por nivel de ocupación.
// CTA monetizable a Parclick.
import Link from 'next/link'
import type { Playa } from '@/types'
import { Car } from '@phosphor-icons/react/dist/ssr'

interface Props {
  playas: Playa[]
  locale?: 'es' | 'en'
}

const PARCLICK_AFF = process.env.NEXT_PUBLIC_PARCLICK_AFF ?? ''

export default function ParkingHoy({ playas, locale = 'es' }: Props) {
  const es = locale === 'es'

  const conParking = playas.filter(p => p.parking)
  if (conParking.length === 0) return null

  // Group by occupancy
  const facil = conParking.filter(p => {
    const g = (p.grado_ocupacion ?? '').toLowerCase()
    return g.includes('bajo')
  }).slice(0, 4)

  const medio = conParking.filter(p => {
    const g = (p.grado_ocupacion ?? '').toLowerCase()
    return g.includes('medio')
  }).slice(0, 4)

  const dificil = conParking.filter(p => {
    const g = (p.grado_ocupacion ?? '').toLowerCase()
    return g.includes('alto')
  }).slice(0, 4)

  const groups = [
    { key: 'facil', label: es ? 'Fácil aparcar' : 'Easy parking', color: '#3d6b1f', playas: facil },
    { key: 'medio', label: es ? 'Parking disponible' : 'Parking available', color: '#c48a1e', playas: medio },
    { key: 'dificil', label: es ? 'Difícil aparcar' : 'Hard to park', color: '#7a2818', playas: dificil },
  ].filter(g => g.playas.length > 0)

  if (groups.length === 0) return null

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.75rem)', fontWeight: 700,
          color: 'var(--ink)', margin: 0, letterSpacing: '-.015em',
          lineHeight: 1.1,
          display: 'flex', alignItems: 'center', gap: '.45rem',
        }}>
          <Car size={20} weight="bold" color="var(--accent)" aria-hidden="true" />
          {es
            ? <>Parking <em style={{ fontWeight: 500, color: 'var(--accent)' }}>hoy</em></>
            : <>Parking <em style={{ fontWeight: 500, color: 'var(--accent)' }}>today</em></>}
        </h2>
        <Link
          href="/buscar?parking=1"
          style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
        >
          {es ? 'Todas con parking →' : 'All with parking →'}
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '.65rem',
      }}>
        {groups.map(g => (
          <div key={g.key} style={{
            background: 'var(--card-bg)', border: '1px solid var(--line)',
            borderRadius: 6, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              padding: '.75rem 1rem .55rem',
              borderBottom: '1px solid var(--line)',
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: g.color,
                flexShrink: 0,
              }} aria-hidden="true" />
              <span style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--ink)' }}>
                {g.label}
              </span>
              <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                {g.playas.length} playas
              </span>
            </div>
            <div style={{ padding: '.3rem 0' }}>
              {g.playas.map(p => (
                <Link
                  key={p.slug}
                  href={`/playas/${p.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '.45rem 1rem', fontSize: '.85rem',
                    color: 'var(--ink)', textDecoration: 'none',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{p.nombre}</span>
                  <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Parclick affiliate CTA */}
      {PARCLICK_AFF && (
        <a
          href={`https://www.parclick.es/?aff=${PARCLICK_AFF}`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            marginTop: '1rem', padding: '.85rem 1.25rem',
            background: 'color-mix(in srgb, var(--accent) 8%, var(--card-bg))',
            border: '1px solid var(--line)', borderRadius: 4,
            fontSize: '.88rem', fontWeight: 700, color: 'var(--accent)',
            textDecoration: 'none', transition: 'all .15s',
          }}
        >
          <Car size={16} weight="bold" aria-hidden="true" />
          {es ? 'Reservar parking cerca de la playa' : 'Book parking near the beach'}
          <span style={{ fontSize: '.75rem', opacity: .7 }}>Parclick</span>
        </a>
      )}
    </section>
  )
}
