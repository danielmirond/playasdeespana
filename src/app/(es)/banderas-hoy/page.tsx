// src/app/banderas-hoy/page.tsx — Semáforo de banderas EN VIVO por provincia.
// Captura la búsqueda "banderas playas hoy" (+80% en Trends) y variantes
// provinciales ("banderas playas bizkaia/cantabria…"). Calculamos la bandera
// estimada (verde/amarilla/roja) con oleaje + viento en tiempo real
// (calcularBandera, el mismo motor que usan las fichas) para las playas
// principales de cada provincia costera. ISR 30 min.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import AuthorByline from '@/components/seo/AuthorByline'
import { getPlayas } from '@/lib/playas'
import { estimarMedusas } from '@/lib/seguridad'
// El motor del semáforo vive en lib/banderas desde que hay páginas por
// zona: duplicar el batch de Open-Meteo eran dos sitios donde ajustar
// timeouts y umbrales, y que se desincronicen es cuestión de tiempo.
import { COSTERAS, conBanderas, topDeProvincia, ZONAS } from '@/lib/banderas'
import type { Playa } from '@/types'

export const revalidate = 1800

const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  title: '¿Qué bandera hay hoy en la playa? Semáforo en tiempo real',
  description: 'Semáforo de banderas en las playas de España hoy: estimación verde, amarilla o roja por oleaje y viento en tiempo real, provincia a provincia, actualizada cada 30 minutos.',
  alternates: { canonical: '/banderas-hoy' },
  openGraph: {
    type: 'website', url: `${BASE}/banderas-hoy`,
    images: [{ url: '/api/og?playa=Banderas%20en%20las%20playas%20hoy', width: 1200, height: 630 }],
  },
}


const POR_PROVINCIA = 6

const FAQ = [
  { q: '¿Qué bandera hay en la playa hoy?', a: 'Depende de cada playa: la bandera se decide cada mañana según el oleaje, el viento y las condiciones locales. En este semáforo ves la estimación de hoy para las principales playas del litoral, actualizada cada 30 minutos, y desde cada provincia puedes entrar a la ficha de tu playa para ver su bandera, la temperatura del agua y el estado del mar. En las playas de Cataluña mostramos además la bandera oficial izada que reporta el propio socorrismo.' },
  { q: '¿Qué significa cada bandera en la playa?', a: 'Verde: baño permitido, condiciones normales. Amarilla: precaución, baño con limitaciones por oleaje o viento moderados. Roja: baño prohibido por condiciones peligrosas. La bandera oficial la iza cada mañana el servicio de socorrismo de la playa.' },
  { q: '¿Cómo se calcula este semáforo?', a: 'Estimamos la bandera de cada playa con datos de oleaje y viento en tiempo real de modelos oficiales (Open-Meteo), aplicando umbrales de seguridad: roja con olas ≥1,5 m o viento muy fuerte; amarilla con oleaje o viento moderados; verde en calma. Además estimamos el riesgo de medusas con la temperatura del agua y el viento hacia la orilla, y lo marcamos con el icono 🪼. Se actualiza cada 30 minutos.' },
  { q: '¿Por qué a veces hay bandera roja con el mar en calma?', a: 'Porque una bandera roja oficial no solo se iza por oleaje o viento: también por presencia de medusas, por mala calidad del agua (vertidos, contaminación) o por corrientes peligrosas. Nuestro semáforo estima la bandera con oleaje y viento y añade el riesgo de medusas, pero no detecta vertidos ni decisiones locales del socorrista. Por eso en un día de mar tranquilo con invasión de medusas la playa puede estar en roja aunque aquí la veas en verde.' },
  { q: '¿Esta bandera es la oficial de la playa?', a: 'No. Es una estimación meteorológica orientativa. La bandera oficial y vinculante la decide el socorrista de cada playa según las condiciones locales del momento (oleaje, corrientes, medusas, calidad del agua), y puede diferir de la estimación. Consulta siempre la bandera izada en el puesto de vigilancia.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

const HEX = { verde: 'var(--excelente)', amarilla: 'var(--aceptable)', roja: '#a8301a' } as const

export default async function BanderasHoyPage() {
  const playas = await getPlayas()

  // Selección top-6 por provincia y meteo en batch (una sola pasada).
  const porProvincia: Array<{ comunidad: string; provincia: string; playas: Playa[] }> = []
  for (const c of COSTERAS) for (const prov of c.provincias) {
    porProvincia.push({ comunidad: c.comunidad, provincia: prov, playas: topDeProvincia(playas, prov, POR_PROVINCIA) })
  }
  const flat = porProvincia.flatMap(g => g.playas)
  // conBanderas, no calcularBandera a pelo: incluye la cascada oficial
  // (Cataluña, Canarias, Andalucía, Bizkaia). Cuando esta página estimaba
  // por su cuenta, pintaba La Misericordia en calma el mismo día que su
  // ficha decía «No te bañes» — el sitio contradiciéndose a sí mismo.
  const conB = await conBanderas(flat)

  let idx = 0
  const grupos = porProvincia.map(g => {
    const items = g.playas.map(() => {
      const { p, m, bandera, medusas, cert } = conB[idx++]
      return { p, m, bandera, medusas, cert }
    })
    const counts = { verde: 0, amarilla: 0, roja: 0 }
    let medusasAlto = 0
    for (const it of items) {
      // `bandera` puede ser null: playa con fuente oficial cuyo parte de
      // hoy no ha llegado. No se cuenta en ningún color en vez de
      // engordar el de verdes.
      if (it.bandera) counts[it.bandera.color as keyof typeof counts]++
      if (it.medusas.nivel === 'alto') medusasAlto++
    }
    return { ...g, items, counts, medusasAlto }
  })

  const total = { verde: 0, amarilla: 0, roja: 0 }
  let medusasAltoTotal = 0
  for (const g of grupos) {
    total.verde += g.counts.verde; total.amarilla += g.counts.amarilla; total.roja += g.counts.roja
    medusasAltoTotal += g.medusasAlto
  }
  const nMonitorizadas = total.verde + total.amarilla + total.roja

  const actualizado = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date())

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Banderas hoy</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Banderas en las playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>hoy</em> <span aria-hidden="true">🚩</span>
        </h1>
        <AuthorByline
          headline="Banderas en las playas hoy: semáforo por provincias"
          url={`${BASE}/banderas-hoy`}
          dateModified={new Date().toISOString()}
          description="Semáforo de banderas estimadas (verde, amarilla, roja) por oleaje y viento en tiempo real, provincia a provincia."
          articleSection="Estado del mar"
        />
        <p data-speakable style={{ fontSize: '.92rem', color: 'var(--muted)', margin: '0 0 1rem', maxWidth: 620, lineHeight: 1.6 }}>
          Estimación de bandera para {nMonitorizadas} playas principales del litoral, calculada con el oleaje y el viento
          de ahora mismo, más el riesgo de medusas (🪼). Actualizado a las {actualizado} (hora peninsular), se recalcula cada 30 minutos.
        </p>

        {/* Resumen nacional */}
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(['verde', 'amarilla', 'roja'] as const).map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 999, padding: '.45rem .9rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: HEX[c], flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: '.82rem', color: 'var(--ink)' }}>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{total[c]}</strong> {c === 'verde' ? 'verdes' : c === 'amarilla' ? 'amarillas' : 'rojas'}
              </span>
            </div>
          ))}
          {medusasAltoTotal > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'rgba(168,48,26,.08)', border: '1px solid rgba(168,48,26,.3)', borderRadius: 999, padding: '.45rem .9rem' }}>
              <span aria-hidden="true">🪼</span>
              <span style={{ fontSize: '.82rem', color: 'var(--ink)' }}>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{medusasAltoTotal}</strong> con riesgo alto de medusas
              </span>
            </div>
          )}
        </div>
        <div style={{ background: 'color-mix(in srgb, var(--aceptable) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--aceptable) 30%, transparent)', borderRadius: 6, padding: '.8rem 1rem', fontSize: '.8rem', color: 'var(--ink)', lineHeight: 1.55, marginBottom: '2.25rem', maxWidth: 640 }}>
          <strong>Importante:</strong> es una estimación meteorológica orientativa (oleaje y viento). La bandera oficial
          la iza el socorrista de cada playa y puede diferir: una <strong>bandera roja</strong> real también puede
          deberse a <strong>medusas</strong> o a la <strong>calidad del agua</strong> (vertidos), que esta estimación no
          detecta. El icono 🪼 marca las playas con riesgo alto de medusas estimado hoy. Consulta siempre la bandera
          izada en el puesto de vigilancia.
        </div>

        {/* Zonas con página propia. Va ANTES del listado, no en el pie:
            son las cinco con demanda medida en Search Console y el hub es
            su única fuente de enlaces internos. Enterradas abajo tardarían
            meses en descubrirse. */}
        <nav aria-label="Banderas por zona" style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Ver por zona:</span>
          {ZONAS.map(z => (
            <Link key={z.slug} href={`/banderas-hoy/${z.slug}`} style={{ fontSize: '.82rem', color: 'var(--accent)', textDecoration: 'none', border: '1px solid var(--line)', borderRadius: 999, padding: '.35rem .8rem' }}>
              {z.nombre}
            </Link>
          ))}
        </nav>

        {/* Semáforo por comunidad → provincia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.9rem' }}>
          {COSTERAS.map(c => {
            const provs = grupos.filter(g => g.comunidad === c.comunidad)
            if (!provs.length) return null
            return (
              <section key={c.comunidad} aria-label={`Banderas hoy en ${c.comunidad}`}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .65rem' }}>{c.comunidad}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {provs.map(g => (
                    <details key={g.provincia} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6 }}>
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.8rem 1rem', cursor: 'pointer', listStyle: 'none' }}>
                        <span style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--ink)', flex: 1 }}>{g.provincia}</span>
                        <span style={{ display: 'inline-flex', gap: '.35rem', alignItems: 'center' }} aria-label={`${g.counts.verde} verdes, ${g.counts.amarilla} amarillas, ${g.counts.roja} rojas`}>
                          {g.items.map((it, i) => (
                            <span key={i} title={it.bandera ? `${it.p.nombre}: bandera ${it.bandera.color}` : `${it.p.nombre}: sin parte oficial hoy`} style={{ width: 11, height: 11, borderRadius: '50%', background: it.bandera?.hex ?? 'transparent', border: it.bandera ? undefined : '1.5px dashed #9aa3a6', display: 'inline-block' }} />
                          ))}
                        </span>
                        {g.medusasAlto > 0 && (
                          <span title={`${g.medusasAlto} playa(s) con riesgo alto de medusas`} aria-label={`${g.medusasAlto} con riesgo alto de medusas`} style={{ fontSize: '.78rem' }}>🪼</span>
                        )}
                        <span aria-hidden="true" style={{ fontSize: '.72rem', color: 'var(--muted)' }}>▾</span>
                      </summary>
                      <div style={{ borderTop: '1px solid var(--line)', padding: '.5rem 1rem .75rem' }}>
                        {g.items.map(it => (
                          <div key={it.p.slug} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.45rem 0', borderBottom: '1px dashed var(--line)' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: it.bandera?.hex ?? 'transparent', border: it.bandera ? undefined : '1.5px dashed #9aa3a6', flexShrink: 0 }} aria-hidden="true" />
                            <Link href={`/playas/${it.p.slug}`} style={{ flex: 1, fontSize: '.84rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {it.p.nombre} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.74rem' }}>· {it.p.municipio}</span>
                            </Link>
                            {it.medusas.nivel !== 'bajo' && (
                              <span title={it.medusas.label} aria-label={it.medusas.label} style={{ fontSize: '.8rem', flexShrink: 0, opacity: it.medusas.nivel === 'alto' ? 1 : 0.55 }}>🪼</span>
                            )}
                            <span style={{ fontSize: '.7rem', color: 'var(--muted)', flexShrink: 0 }}>{it.m.olas} m · {it.m.viento} km/h</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* FAQ */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '2.5rem 0 1rem' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2.5rem' }}>
          {FAQ.map(f => (
            <details key={f.q} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.8rem 1rem' }}>
              <summary style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.6, margin: '.6rem 0 0' }}>{f.a}</p>
            </details>
          ))}
        </div>

        {/* Cross-links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.6rem' }}>
          <Link href="/banderas-negras" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas Negras 2026 <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Los puntos negros del litoral según Ecologistas en Acción.</span>
          </Link>
          <Link href="/calidad-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Calidad del agua <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Muestreos oficiales EEA playa a playa.</span>
          </Link>
          <Link href="/temperatura-del-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Temperatura del agua hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>¿Dónde está el mar más cálido para bañarse?</span>
          </Link>
          <Link href="/prediccion-fin-de-semana" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Predicción del finde <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>¿Qué costa tendrá mejores condiciones?</span>
          </Link>
        </div>
      </main>
    </>
  )
}
