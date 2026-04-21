// src/components/home/MonetizacionBlock.tsx
// Bloque de CTAs de monetización: Hoteles + Actividades + Restaurantes.
// Cada card lleva un affiliate link contextual. Se muestra debajo de las
// playas destacadas para captar al usuario ya en modo "decisión tomada →
// necesito complementos (hotel, coche, actividad)".
import Link from 'next/link'
import { Bed, ForkKnife, MapTrifold, Ticket } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale?: 'es' | 'en'
}

const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID ?? ''
const CIVITATIS_AFF = process.env.NEXT_PUBLIC_CIVITATIS_AFF ?? ''
const THEFORK_AFF = process.env.NEXT_PUBLIC_THEFORK_AFF ?? ''

interface CTA {
  icon: typeof Bed
  label: string
  desc: string
  href: string
  color: string
  tag?: string
}

export default function MonetizacionBlock({ locale = 'es' }: Props) {
  const es = locale === 'es'

  const ctas: CTA[] = [
    {
      icon: Bed,
      label: es ? 'Hoteles cerca de la playa' : 'Hotels near the beach',
      desc: es ? 'Los mejores precios en Booking.com' : 'Best prices on Booking.com',
      href: BOOKING_AID
        ? `https://www.booking.com/index.html?aid=${BOOKING_AID}&label=playas-espana-home`
        : 'https://www.booking.com',
      color: '#003580',
      tag: 'Booking',
    },
    {
      icon: Ticket,
      label: es ? 'Actividades y excursiones' : 'Activities & tours',
      desc: es ? 'Surf, kayak, snorkel, rutas en barco…' : 'Surf, kayak, snorkel, boat tours…',
      href: CIVITATIS_AFF
        ? `https://www.civitatis.com/es/?aid=${CIVITATIS_AFF}`
        : 'https://www.civitatis.com/es/',
      color: '#ff6600',
      tag: 'Civitatis',
    },
    {
      icon: ForkKnife,
      label: es ? 'Reservar restaurante' : 'Book a restaurant',
      desc: es ? 'Reserva mesa con TheFork' : 'Book a table with TheFork',
      href: THEFORK_AFF
        ? `https://www.thefork.es/?aff=${THEFORK_AFF}`
        : 'https://www.thefork.es',
      color: '#00a77a',
      tag: 'TheFork',
    },
    {
      icon: MapTrifold,
      label: es ? 'Alquiler de coches' : 'Car rental',
      desc: es ? 'Compara precios en todas las compañías' : 'Compare prices across all providers',
      href: 'https://www.rentalcars.com/',
      color: '#0770e3',
      tag: 'Rentalcars',
    },
  ]

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.75rem)', fontWeight: 700,
        color: 'var(--ink)', margin: '0 0 1rem', letterSpacing: '-.015em',
        lineHeight: 1.1,
      }}>
        {es
          ? <>Prepara <em style={{ fontWeight: 500, color: 'var(--accent)' }}>tu día de playa</em></>
          : <>Plan <em style={{ fontWeight: 500, color: 'var(--accent)' }}>your beach day</em></>}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '.6rem',
      }}>
        {ctas.map(c => {
          const Icon = c.icon
          return (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '1rem 1.1rem',
                background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                borderRadius: 6, textDecoration: 'none',
                transition: 'all .15s',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 4,
                background: `${c.color}12`, border: `1.5px solid ${c.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} weight="bold" color={c.color} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--ink)', lineHeight: 1.2 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.15rem' }}>
                  {c.desc}
                </div>
              </div>
              {c.tag && (
                <span style={{
                  fontSize: '.65rem', fontWeight: 700, color: c.color,
                  background: `${c.color}10`, padding: '.15rem .35rem',
                  borderRadius: 4, flexShrink: 0,
                }}>
                  {c.tag}
                </span>
              )}
            </a>
          )
        })}
      </div>
    </section>
  )
}
