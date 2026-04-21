// src/components/home/ActividadesHoy.tsx
// "Actividades hoy" — qué puedes hacer según las playas + condiciones.
// Agrupa playas por tipo de actividad (surf, snorkel, paddle, etc.) y
// muestra las que tienen esa actividad registrada. No fetcha meteo: usa
// los atributos estáticos del JSON. El card enlaza a la ficha donde el
// usuario ve las condiciones reales.
import Link from 'next/link'
import type { Playa } from '@/types'
import { Waves, Eyeglasses, Boat, Wind } from '@phosphor-icons/react/dist/ssr'

interface Props {
  playas: Playa[]
  locale?: 'es' | 'en'
}

interface Actividad {
  key: keyof NonNullable<Playa['actividades']>
  label: string
  labelEn: string
  icon: typeof Waves
  desc: string
  descEn: string
  color: string
}

const ACTIVIDADES: Actividad[] = [
  {
    key: 'surf', label: 'Surf', labelEn: 'Surf',
    icon: Waves,
    desc: 'Playas con oleaje para surfear',
    descEn: 'Beaches with rideable waves',
    color: '#0ea5e9',
  },
  {
    key: 'snorkel', label: 'Snorkel', labelEn: 'Snorkel',
    icon: Eyeglasses,
    desc: 'Calas con buena visibilidad para buceo libre',
    descEn: 'Coves with good visibility for free diving',
    color: '#14b8a6',
  },
  {
    key: 'kayak', label: 'Kayak / Paddle', labelEn: 'Kayak / Paddle',
    icon: Boat,
    desc: 'Playas con aguas calmadas para remar',
    descEn: 'Calm waters for paddling',
    color: '#a855f7',
  },
  {
    key: 'windsurf', label: 'Windsurf / Kite', labelEn: 'Windsurf / Kite',
    icon: Wind,
    desc: 'Spots con viento para deportes de vela',
    descEn: 'Windy spots for sailing sports',
    color: '#eab308',
  },
]

export default function ActividadesHoy({ playas, locale = 'es' }: Props) {
  const es = locale === 'es'

  // Group beaches by activity
  const groups = ACTIVIDADES.map(act => {
    const matching = playas.filter(p => {
      const acts = p.actividades
      if (!acts) return false
      if (act.key === 'windsurf') return acts.windsurf || acts.kite
      if (act.key === 'kayak') return acts.kayak || acts.paddle
      return acts[act.key]
    }).slice(0, 4) // top 4 per activity
    return { ...act, playas: matching }
  }).filter(g => g.playas.length > 0)

  if (groups.length === 0) return null

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.75rem)', fontWeight: 700,
        color: 'var(--ink)', margin: '0 0 1.25rem', letterSpacing: '-.015em',
        lineHeight: 1.1,
      }}>
        {es
          ? <>Actividades <em style={{ fontWeight: 500, color: 'var(--accent)' }}>hoy</em></>
          : <>Activities <em style={{ fontWeight: 500, color: 'var(--accent)' }}>today</em></>}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '.75rem',
      }}>
        {groups.map(g => {
          const Icon = g.icon
          return (
            <div key={g.key} style={{
              background: 'var(--card-bg)', border: '1.5px solid var(--line)',
              borderRadius: 6, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '.55rem',
                padding: '.85rem 1rem .65rem',
                borderBottom: '1px solid var(--line)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 4,
                  background: `${g.color}14`, border: `1.5px solid ${g.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} weight="bold" color={g.color} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--ink)' }}>
                    {es ? g.label : g.labelEn}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
                    {es ? g.desc : g.descEn}
                  </div>
                </div>
              </div>

              {/* Beach list */}
              <div style={{ padding: '.4rem 0' }}>
                {g.playas.map(p => (
                  <Link
                    key={p.slug}
                    href={`/playas/${p.slug}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '.5rem 1rem',
                      fontSize: '.85rem', color: 'var(--ink)', textDecoration: 'none',
                      transition: 'background .1s',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700 }}>{p.nombre}</span>
                      <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '.4rem' }}>
                        {p.municipio}
                      </span>
                    </div>
                    <span style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
