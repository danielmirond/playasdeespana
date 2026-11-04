// src/components/seo/ServiciosGeo.tsx
//
// El bloque de servicios de una página geográfica, con los enlaces ya
// localizados por enlacesConversion(). Server component: la lista se
// resuelve en build y no añade JS al cliente.
//
// Va en la ficha, en el municipio y en la provincia, que son las tres
// plantillas que conocen su geografía. El pie del sitio sigue llevando
// los hubs nacionales: eso es navegación global y debe ser igual en
// todas las páginas.
import Link from 'next/link'
import { enlacesConversion } from '@/lib/enlaces-conversion'

interface Props {
  provincia?: string
  municipio?: string
  /** Encabezado. Por defecto nombra la provincia si la hay. */
  titulo?: string
}

export default async function ServiciosGeo({ provincia, municipio, titulo }: Props) {
  const enlaces = await enlacesConversion(provincia, municipio)
  if (!enlaces.length) return null

  const encabezado = titulo ?? (provincia ? `Servicios en ${provincia}` : 'Servicios de playa')

  return (
    <section aria-labelledby="servicios-geo" style={{ padding: '18px 20px', borderBlock: '1px solid var(--line)' }}>
      <h2
        id="servicios-geo"
        style={{
          margin: '0 0 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '.22em',
          textTransform: 'uppercase',
          fontWeight: 400,
          color: 'var(--muted)',
        }}
      >
        {encabezado}
      </h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {enlaces.map(e => (
          <li key={e.href} style={{ borderBottom: '1px solid var(--line)' }}>
            <Link
              href={e.href}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'baseline',
                padding: '11px 0',
                minHeight: 44,
                boxSizing: 'border-box',
                fontSize: 14.5,
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <span>{e.label}</span>
              <span aria-hidden style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
