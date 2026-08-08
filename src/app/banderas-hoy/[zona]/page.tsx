// src/app/banderas-hoy/[zona]/page.tsx — el semáforo, por zona.
//
// Cuelga de /banderas-hoy y no de una ruta nueva a propósito: esa página es
// la que mejor rinde de todo el sitio —5,90 % de CTR en posición 7,1, tres
// veces y media lo normal de su banda— y las hijas heredan su contexto
// temático y su enlazado.
//
// Solo cinco zonas, las que tienen demanda MEDIDA. La lista y el porqué
// están en lib/banderas (ZONAS). No es una plantilla para multiplicar
// geografía: el sitio ya tiene 171 páginas de /municipio con 7 clics.
//
// ISR 30 min, igual que el hub, porque la promesa es la misma: la bandera
// de hoy, no la de esta mañana.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import AuthorByline from '@/components/seo/AuthorByline'
import { getPlayas } from '@/lib/playas'
import { conBanderas, topDeProvincia, ZONAS, zonaPorSlug } from '@/lib/banderas'
import type { Playa } from '@/types'

export const revalidate = 1800

/**
 * Lista cerrada, no plantilla abierta.
 *
 * Sin esto, /banderas-hoy/soria devolvía 200 con una página vacía —
 * comprobado— y cualquier slug inventado habría sido una URL indexable
 * más. En un sitio donde el 38 % de las impresiones ya vive en la
 * posición 21 o peor, abrir la puerta a geografía infinita es
 * exactamente el error que estas páginas intentan no repetir.
 */
export const dynamicParams = false

const BASE = 'https://playas-espana.com'

// Una zona enseña muchas más playas que el hub (que pone 6 por provincia
// porque lista veinte). Es lo que justifica su existencia frente a él: si
// mostrara las mismas seis, sería una página duplicada con otro título.
const POR_PROVINCIA = 24

export function generateStaticParams() {
  return ZONAS.map(z => ({ zona: z.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ zona: string }> }): Promise<Metadata> {
  const { zona } = await params
  const z = zonaPorSlug(zona)
  if (!z) return {}
  const donde = z.tipo === 'provincia' ? `la provincia de ${z.nombre}` : z.nombre
  return {
    // El título lleva la pregunta tal cual se busca. Y no adelanta la
    // respuesta: cuántas están en verde hoy es justo el motivo del clic.
    title: `¿Qué bandera hay hoy en las playas de ${z.nombre}?`,
    description: `Semáforo de banderas en las playas de ${donde} hoy: estimación verde, amarilla o roja según el oleaje y el viento en tiempo real, playa a playa, actualizada cada 30 minutos.`,
    alternates: { canonical: `/banderas-hoy/${z.slug}` },
    openGraph: {
      type: 'website',
      url: `${BASE}/banderas-hoy/${z.slug}`,
      images: [{ url: `/api/og?playa=${encodeURIComponent(`Banderas hoy en ${z.nombre}`)}`, width: 1200, height: 630 }],
    },
  }
}

export default async function BanderasZonaPage({ params }: { params: Promise<{ zona: string }> }) {
  const { zona } = await params
  const z = zonaPorSlug(zona)
  if (!z) notFound()

  const playas = await getPlayas()

  const porProvincia: Array<{ provincia: string; playas: Playa[] }> = z.provincias
    .map(prov => ({ provincia: prov, playas: topDeProvincia(playas, prov, POR_PROVINCIA) }))
    .filter(g => g.playas.length > 0)

  const plano = porProvincia.flatMap(g => g.playas)
  const conB = await conBanderas(plano)

  let i = 0
  const grupos = porProvincia.map(g => {
    const items = g.playas.map(() => conB[i++])
    const cuenta = { verde: 0, amarilla: 0, roja: 0 }
    let medusasAlto = 0
    for (const it of items) {
      cuenta[it.bandera.color as keyof typeof cuenta]++
      if (it.medusas.nivel === 'alto') medusasAlto++
    }
    return { ...g, items, cuenta, medusasAlto }
  })

  const total = { verde: 0, amarilla: 0, roja: 0 }
  for (const g of grupos) {
    total.verde += g.cuenta.verde; total.amarilla += g.cuenta.amarilla; total.roja += g.cuenta.roja
  }
  const n = total.verde + total.amarilla + total.roja
  const actualizado = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date())

  const faq = [
    {
      q: `¿Qué bandera hay hoy en las playas de ${z.nombre}?`,
      a: `Ahora mismo estimamos ${total.verde} playas en verde, ${total.amarilla} en amarilla y ${total.roja} en roja de las ${n} principales de ${z.nombre}, calculado con el oleaje y el viento en tiempo real y actualizado cada 30 minutos. La bandera oficial la iza el socorrista de cada playa y puede diferir.`,
    },
    {
      q: `¿Con qué frecuencia se actualiza?`,
      a: `Cada 30 minutos. Los datos de oleaje y viento vienen de modelos oficiales (Open-Meteo) y la estimación se recalcula con cada actualización, así que lo que ves corresponde a las condiciones de ahora, no a las de esta mañana.`,
    },
    {
      q: `¿Es la bandera oficial de la playa?`,
      a: `No. Es una estimación meteorológica orientativa a partir del oleaje y el viento. La bandera oficial y vinculante la decide el socorrista según las condiciones locales del momento —corrientes, medusas, calidad del agua—, que esta estimación no ve. Consulta siempre la bandera izada en el puesto de vigilancia.`,
    },
  ]
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  }

  const otras = ZONAS.filter(o => o.slug !== z.slug)

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          <Link href="/banderas-hoy">Banderas hoy</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{z.nombre}</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Banderas en las playas de {z.nombre} <em style={{ fontWeight: 500, color: 'var(--accent)' }}>hoy</em>
        </h1>
        <AuthorByline
          headline={`Banderas en las playas de ${z.nombre} hoy`}
          url={`${BASE}/banderas-hoy/${z.slug}`}
          dateModified={new Date().toISOString()}
          description={`Semáforo de banderas estimadas por oleaje y viento en tiempo real en las playas de ${z.nombre}.`}
          articleSection="Estado del mar"
        />
        <p data-speakable style={{ fontSize: '.92rem', color: 'var(--muted)', margin: '0 0 1.25rem', maxWidth: 620, lineHeight: 1.6 }}>
          Estimación de bandera para {n} playas de {z.nombre}, calculada con el oleaje y el viento de ahora mismo.
          Actualizado a las {actualizado} (hora peninsular); se recalcula cada 30 minutos.
        </p>

        {/* Resumen: la respuesta de un vistazo, que es lo que se ha buscado */}
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          {([['verde', total.verde], ['amarilla', total.amarilla], ['roja', total.roja]] as const).map(([color, cuantas]) => (
            <div key={color} style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 999, padding: '.45rem .9rem',
            }}>
              <span aria-hidden="true" style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: color === 'verde' ? 'var(--excelente)' : color === 'amarilla' ? 'var(--aceptable)' : 'var(--noapto)',
              }} />
              <span style={{ fontSize: '.82rem', color: 'var(--ink)' }}>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{cuantas}</strong> en {color}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: 'color-mix(in srgb, var(--aceptable) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--aceptable) 30%, transparent)', borderRadius: 6, padding: '.8rem 1rem', fontSize: '.8rem', color: 'var(--ink)', lineHeight: 1.55, marginBottom: '2rem', maxWidth: 640 }}>
          <strong>Importante:</strong> es una estimación meteorológica orientativa (oleaje y viento). La bandera oficial
          la iza el socorrista de cada playa y puede diferir: una <strong>bandera roja</strong> real también puede
          deberse a <strong>medusas</strong> o a la <strong>calidad del agua</strong>, que esta estimación no detecta.
        </div>

        {grupos.map(g => (
          <section key={g.provincia} aria-label={`Banderas hoy en ${g.provincia}`} style={{ marginBottom: '2rem' }}>
            {/* El encabezado de provincia solo cuando la zona agrupa varias:
                en /banderas-hoy/tarragona sería repetir el H1. */}
            {grupos.length > 1 && (
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .65rem' }}>{g.provincia}</h2>
            )}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.25rem 1rem .5rem' }}>
              {g.items.map(it => (
                <div key={it.p.slug} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.5rem 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: it.bandera.hex, flexShrink: 0 }} aria-hidden="true" />
                  <Link href={`/playas/${it.p.slug}`} style={{ flex: 1, fontSize: '.86rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.p.nombre} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.74rem' }}>· {it.p.municipio}</span>
                  </Link>
                  {it.medusas.nivel !== 'bajo' && (
                    <span title={it.medusas.label} aria-label={it.medusas.label} style={{ fontSize: '.8rem', flexShrink: 0, opacity: it.medusas.nivel === 'alto' ? 1 : 0.55 }}>🪼</span>
                  )}
                  <span style={{ fontSize: '.7rem', color: 'var(--muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{it.m.olas} m · {it.m.viento} km/h</span>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section aria-label="Preguntas frecuentes" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .75rem' }}>Preguntas frecuentes</h2>
          {faq.map(x => (
            <details key={x.q} style={{ borderBottom: '1px solid var(--line)', padding: '.7rem 0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)' }}>{x.q}</summary>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.6, margin: '.5rem 0 0' }}>{x.a}</p>
            </details>
          ))}
        </section>

        <nav aria-label="Banderas en otras zonas" style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Otras zonas:</span>
          {otras.map(o => (
            <Link key={o.slug} href={`/banderas-hoy/${o.slug}`} style={{ fontSize: '.8rem', color: 'var(--accent)', textDecoration: 'none', border: '1px solid var(--line)', borderRadius: 999, padding: '.3rem .7rem' }}>
              {o.nombre}
            </Link>
          ))}
          <Link href="/banderas-hoy" style={{ fontSize: '.8rem', color: 'var(--accent)', textDecoration: 'none', border: '1px solid var(--line)', borderRadius: 999, padding: '.3rem .7rem' }}>
            Toda España
          </Link>
        </nav>
      </main>
    </>
  )
}
