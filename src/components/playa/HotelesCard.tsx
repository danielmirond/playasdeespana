import { Bed } from '@phosphor-icons/react'
import type { HotelReal as Hotel } from '@/lib/hoteles'

function Estrellas({ n }: { n: number }) {
  return (
    <span className="hotel-stars" aria-label={`${n} estrellas`}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

function RatingBadge({ rating, count }: { rating: number; count: number | null }) {
  const color = rating >= 8.5 ? '#3a8c5c' : rating >= 7 ? '#2e7bb4' : '#d4a96a'
  return (
    <span className="hotel-rating" style={{ background: color }}>
      {rating.toFixed(1)}
      {count && <span className="hotel-rating-count">{count > 999 ? `${Math.round(count/1000)}k` : count}</span>}
    </span>
  )
}

export default function HotelesCard({ hoteles, nombrePlaya }: { hoteles: any[]; nombrePlaya: string }) {
  if (!hoteles.length) return null

  const tieneBooking = hoteles.some(h => ( h as any).source === 'booking')

  return (
    <div className="section-card">
      <div className="card-head">
        <h3 className="card-title">Dónde dormir</h3>
        <span className="card-sub">cerca de {nombrePlaya}</span>
      </div>

      <div className="hoteles-list">
        {hoteles.map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="hotel-item"
          >
            {/* Foto o placeholder */}
            <div className="hotel-foto" style={{ background: '#e8ede5' }}>
              {h.foto
                ? <img src={h.foto} alt={h.nombre} loading="lazy"/>
                : <span className="hotel-foto-icon"><Bed size={22} weight="regular" color="var(--muted,#8a7560)"/></span>
              }
            </div>

            {/* Info */}
            <div className="hotel-info">
              <div className="hotel-nombre">{h.nombre}</div>
              {h.estrellas && <Estrellas n={h.estrellas}/>}
              {h.direccion && <div className="hotel-dir">{h.direccion}</div>}
              <div className="hotel-meta">
                <span className="hotel-dist">{h.distancia_m < 1000 ? `${h.distancia_m}m` : `${(h.distancia_m/1000).toFixed(1)}km`}</span>
                {h.rating && <RatingBadge rating={h.rating} count={h.rating_count}/>}
              </div>
            </div>

            {/* Precio */}
            <div className="hotel-precio">
              {h.precio_desde
                ? <>
                    <span className="hp-desde">desde</span>
                    <span className="hp-num">{Math.round(h.precio_desde)}€</span>
                    <span className="hp-noche">/noche</span>
                  </>
                : <span className="hp-ver">Ver →</span>
              }
            </div>
          </a>
        ))}
      </div>

      {/* Footer con atribución */}
      <div className="hoteles-footer">
        {tieneBooking
          ? <>Precios orientativos · <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer">Booking.com</a></>
          : <>Datos: OpenStreetMap · Reservas vía Booking.com</>
        }
      </div>
    </div>
  )
}
