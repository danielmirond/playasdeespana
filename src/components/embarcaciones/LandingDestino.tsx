// src/components/embarcaciones/LandingDestino.tsx
//
// Componente shared para landings premium /alquiler-yate/[destino]
// y /alquiler-catamaran/[destino]. Mismo layout, contenido derivado
// del catálogo (src/lib/embarcaciones.ts).
//
// Server component — sin JS de cliente. Inyecta Schema Service +
// FAQPage para rich results.

import Link from 'next/link'
import type { DestinoEmbarcacion } from '@/lib/embarcaciones'
import { urlSamboatPremium } from '@/lib/embarcaciones'

const SAMBOAT_AFF = process.env.NEXT_PUBLIC_SAMBOAT_AFF ?? ''

interface Props {
  tipo:    'yate' | 'catamaran' | 'sin-licencia'
  destino: DestinoEmbarcacion
}

function tipoLabel(tipo: Props['tipo']): { es: string; cap: string } {
  switch (tipo) {
    case 'yate':         return { es: 'yate',       cap: 'Yate' }
    case 'catamaran':    return { es: 'catamarán',  cap: 'Catamarán' }
    case 'sin-licencia': return { es: 'barco sin licencia', cap: 'Barco sin licencia' }
  }
}

function precioRango(tipo: Props['tipo'], d: DestinoEmbarcacion): string {
  if (tipo === 'yate'      && d.precios.yateSemana)     return `${d.precios.yateSemana[0].toLocaleString('es')}–${d.precios.yateSemana[1].toLocaleString('es')}€/semana`
  if (tipo === 'catamaran' && d.precios.catamaranDia)   return `${d.precios.catamaranDia[0].toLocaleString('es')}–${d.precios.catamaranDia[1].toLocaleString('es')}€/día`
  if (tipo === 'sin-licencia' && d.precios.barcoSinLicDia) return `${d.precios.barcoSinLicDia[0]}–${d.precios.barcoSinLicDia[1]}€/día`
  return ''
}

export default function LandingDestino({ tipo, destino }: Props) {
  const t = tipoLabel(tipo)
  const precio = precioRango(tipo, destino)
  const cta = SAMBOAT_AFF
    ? urlSamboatPremium(destino, SAMBOAT_AFF, `pde-${tipo}-${destino.slug}`)
    : `https://www.samboat.es/alquiler-barco/${destino.enSamboat}`

  // FAQs comunes + específicas del tipo
  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `¿Cuánto cuesta alquilar un ${t.es} en ${destino.nombre}?`,
      a: precio
        ? `El rango actual es ${precio}. El precio varía por modelo (eslora, año), temporada (alta julio-agosto +30%) y si incluye patrón/skipper (suma 150-300€/día).`
        : `Los precios dependen del modelo y la temporada. En general en ${destino.nombre} el ticket medio se sitúa entre los segmentos económico, medio y luxury que verás al filtrar en el buscador.`,
    },
    {
      q: tipo === 'sin-licencia'
        ? `¿Qué barcos sin licencia puedo pilotar?`
        : `¿Necesito licencia/título para pilotarlo?`,
      a: tipo === 'sin-licencia'
        ? `En España sin titulación puedes pilotar embarcaciones de hasta 5 metros de eslora y motor menor de 15 CV (RD 875/2014). Velocidad limitada y zona costera (máx. 2 millas).`
        : `Para ${t.es} sí. La titulación PER (Patrón Embarcaciones Recreo) es la mínima para esloras 8-15 m. Si no la tienes, alquila con skipper incluido — añade 150-300€/día.`,
    },
    {
      q: `¿Mejor temporada para ir a ${destino.nombre}?`,
      a: destino.temporada,
    },
    {
      q: `¿Qué incluye el precio?`,
      a: `Habitualmente: ${t.es}, seguro básico, equipo de seguridad obligatorio. NO incluye: combustible (estimar 150-400€/día), limpieza final (50-150€), patrón (si lo necesitas), comida/bebida.`,
    },
    {
      q: `¿Se pueden visitar las calas más cerradas/protegidas?`,
      a: `Sí, son justamente las accesibles principalmente por mar. ${destino.fondeos.slice(0, 3).map(f => f.nombre).join(', ')} son ejemplos clásicos.`,
    },
  ]

  // Schema FAQPage + Service
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type':         'Question',
      name:            f.q,
      acceptedAnswer:  { '@type': 'Answer', text: f.a },
    })),
  }

  const serviceSchema = {
    '@context':    'https://schema.org',
    '@type':       'Service',
    serviceType:   `Alquiler de ${t.es}`,
    name:          `Alquiler de ${t.es} en ${destino.nombre}`,
    areaServed:    { '@type': 'Place', name: destino.nombre },
    provider:      { '@type': 'Organization', name: 'Samboat (vía Awin)' },
    description:   destino.hero,
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        <Link href="/">Inicio</Link>
        <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
        <Link href={`/alquiler-${tipo}`}>Alquiler de {t.es}</Link>
        <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
        <span aria-current="page">{destino.nombre}</span>
      </nav>

      {/* HERO */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '.72rem', fontWeight: 600,
          letterSpacing: '.14em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          Alquiler de {t.es} · {destino.provincia}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          {t.cap} en <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{destino.nombre}</em>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--ink)', maxWidth: 720, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {destino.hero}
        </p>

        {precio && (
          <div style={{
            display: 'inline-block',
            background: 'rgba(196,138,30,.1)',
            border: '1px solid rgba(196,138,30,.3)',
            padding: '.45rem .85rem',
            borderRadius: 100,
            fontSize: '.85rem',
            color: '#7a4a08',
            marginBottom: '1.2rem',
          }}>
            <strong>Precio actual: {precio}</strong>
          </div>
        )}

        <a
          href={cta}
          target="_blank"
          rel="sponsored noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem',
            padding: '.85rem 1.5rem',
            background: '#a04818',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: '.95rem',
          }}
        >
          Ver {t.es}s disponibles en {destino.nombre} →
        </a>
      </header>

      {/* INSIDER */}
      <section style={{
        margin: '0 0 2.5rem',
        padding: '1rem 1.25rem',
        background: 'var(--card-bg, #faf6ef)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 4,
        fontSize: '.92rem',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--accent)' }}>💡 Truco de local: </strong>
        {destino.insider}
      </section>

      {/* FONDEOS TOP */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '.65rem', color: 'var(--ink)' }}>
          Calas y fondeos accesibles por mar
        </h2>
        <p style={{ fontSize: '.9rem', color: 'var(--muted)', marginBottom: '1.25rem', maxWidth: 700 }}>
          Estos son los puntos top donde te llevará un {t.es} en {destino.nombre} — varios son accesibles únicamente desde el agua.
        </p>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          {destino.fondeos.map((f, i) => (
            <li key={f.nombre} style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '.85rem 1rem',
              display: 'flex',
              gap: '.85rem',
            }}>
              <span style={{
                flexShrink: 0,
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '.78rem', fontWeight: 700,
              }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.15rem' }}>
                  {f.playaSlug
                    ? <Link href={`/playas/${f.playaSlug}`} style={{ color: 'inherit' }}>{f.nombre} →</Link>
                    : f.nombre}
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {f.descripcion}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* TEMPORADA */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, marginBottom: '.5rem', color: 'var(--ink)' }}>
          Cuándo ir
        </h2>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.6, maxWidth: 700 }}>
          {destino.temporada}
        </p>
      </section>

      {/* CTA FINAL */}
      <section style={{
        background: 'linear-gradient(135deg, #a04818 0%, #7a2818 100%)',
        color: '#fff',
        padding: '2rem 1.5rem',
        borderRadius: 10,
        textAlign: 'center',
        margin: '0 0 2.5rem',
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 .5rem' }}>
          Compara {t.es}s disponibles en {destino.nombre}
        </h2>
        <p style={{ fontSize: '.95rem', opacity: .9, margin: '0 0 1.2rem', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Catálogo completo de Samboat con filtros por eslora, año, capacidad y patrón.
        </p>
        <a
          href={cta}
          target="_blank"
          rel="sponsored noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '.85rem 1.75rem',
            background: '#fff',
            color: '#7a2818',
            textDecoration: 'none',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: '.95rem',
          }}
        >
          Ver disponibilidad →
        </a>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)' }}>
          Preguntas frecuentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
          {faqs.map((f, i) => (
            <details key={i} style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '.7rem 1rem',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--ink)', fontSize: '.92rem' }}>
                {f.q}
              </summary>
              <p style={{ marginTop: '.55rem', fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* SCHEMA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </main>
  )
}
