// src/components/seo/EnlacesGeoHubs.tsx — Bloque de enlazado interno para las
// páginas geográficas (comunidad / provincia / municipio, ~90 págs). Eran
// callejones sin salida: listaban playas y nada más, sin repartir autoridad
// al clúster vivo ni a los hubs temáticos (auditoría jul-2026).
//
// Server component, solo enlaces globales (sin scoping por provincia) para
// garantizar cero 404: los hubs por provincia no existen para todas.
import Link from 'next/link'

const VIVO = [
  { href: '/banderas-hoy',             t: 'Banderas en las playas hoy',   d: 'Semáforo en tiempo real por provincias' },
  { href: '/temperatura-del-agua',     t: 'Temperatura del agua hoy',     d: '¿Dónde está el mar más cálido?' },
  { href: '/webcams',                  t: 'Webcams de playas en directo', d: 'Mira el mar antes de salir' },
  { href: '/prediccion-fin-de-semana', t: 'Predicción del finde',        d: '¿Qué costa tendrá mejor tiempo?' },
]

const HUBS = [
  { href: '/banderas-azules',   t: 'Banderas Azules 2026' },
  { href: '/playas-perros',     t: 'Playas para perros' },
  { href: '/playas-nudistas',   t: 'Playas nudistas' },
  { href: '/playas-accesibles', t: 'Playas accesibles' },
  { href: '/calas-secretas',    t: 'Calas secretas' },
  { href: '/magazine',          t: 'Magazine' },
]

export default function EnlacesGeoHubs({ nombre }: { nombre: string }) {
  return (
    <nav aria-label={`Más recursos de playas para ${nombre}`} style={{ maxWidth: 1100, margin: '2.5rem auto 0', padding: '0 0 1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .8rem' }}>
        El mar, ahora mismo
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.6rem', marginBottom: '1.4rem' }}>
        {VIVO.map(l => (
          <Link key={l.href} href={l.href} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.75rem .9rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>{l.t} <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{l.d}</span>
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        {HUBS.map(h => (
          <Link key={h.href} href={h.href} style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 999, padding: '.4rem .85rem', textDecoration: 'none' }}>
            {h.t}
          </Link>
        ))}
      </div>
    </nav>
  )
}
