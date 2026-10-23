// src/components/playa/Destacado.tsx — la tarjeta del patrocinado.
//
// Va ENCIMA de la lista de la sección y separada de ella. Mezclarlo con
// los POIs saldría más caro de lo que se cobra: el lector que descubre
// que la primera fila estaba pagada deja de creerse las otras cinco, y
// de paso las mediciones del resto de la ficha.
import type { Destacado as Dato } from '@/lib/destacados'

export default function Destacado({ dato, locale = 'es' }: { dato: Dato; locale?: 'es' | 'en' }) {
  const es = locale === 'es'
  return (
    <aside
      style={{
        display: 'flex', gap: '.85rem', alignItems: 'flex-start',
        border: '1px solid var(--line)', borderLeft: '3px solid var(--accent)',
        borderRadius: 8, padding: '.85rem 1rem', marginBottom: '.9rem',
        background: 'var(--card-bg2, var(--card-bg))',
      }}
    >
      {dato.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dato.foto} alt="" width={64} height={64} loading="lazy"
          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
        />
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        {/* El rótulo va PRIMERO y en la misma tipografía con la que el
            resto de la ficha dice de dónde sale cada dato. */}
        <span style={{
          display: 'block', fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'var(--ink-mute, #8aa0ad)', marginBottom: '.3rem',
        }}>{es ? 'Patrocinado' : 'Sponsored'}</span>

        <a
          href={dato.href}
          target="_blank"
          // sponsored: es un enlace pagado y Google pide declararlo.
          rel="sponsored nofollow noopener"
          data-destacado={dato.nombre}
          style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.02rem', fontWeight: 700,
            color: 'var(--ink)', textDecoration: 'none', display: 'block',
          }}
        >{dato.nombre}</a>

        <p style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.5, margin: '.2rem 0 0' }}>
          {dato.texto}
        </p>

        {dato.telefono && (
          <a href={`tel:${dato.telefono.replace(/\s+/g, '')}`}
             data-destacado-tel={dato.nombre}
             style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 600, display: 'inline-block', marginTop: '.35rem' }}>
            {dato.telefono}
          </a>
        )}
      </div>
    </aside>
  )
}
