// src/app/top/[slug]/page.tsx. Top 10 playas de una costa
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { getPlayas } from '@/lib/playas'
import { COSTAS } from '@/lib/rutas'

export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return COSTAS.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const costa = COSTAS.find(c => c.slug === slug)
  if (!costa) return {}
  return {
    title: `Top 10 mejores playas de la ${costa.nombre} | Ranking`,
    description: `Las 10 mejores playas de la ${costa.nombre} (${costa.provincias.join(', ')}). Ranking por servicios, bandera azul, accesibilidad y ocupación.`,
    alternates: { canonical: `/top/${slug}` },
  }
}

function staticScore(p: any): number {
  let s = 40
  if (p.bandera) s += 15; if (p.socorrismo) s += 12; if (p.duchas) s += 8
  if (p.parking) s += 8; if (p.accesible) s += 5; if (p.aseos) s += 3
  if (p.descripcion && !p.descripcion_generada) s += 5
  const g = (p.grado_ocupacion ?? '').toLowerCase()
  if (g.includes('bajo')) s += 8; else if (g.includes('alto')) s -= 3
  return Math.min(100, s)
}

export default async function TopCostaPage({ params }: Props) {
  const { slug } = await params
  const costa = COSTAS.find(c => c.slug === slug)
  if (!costa) notFound()

  const playas = await getPlayas()
  const costaPlayas = playas
    .filter(p => costa.provincias.includes(p.provincia) && p.lat && p.lng)
    .map(p => ({ p, score: staticScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  const top = costaPlayas.map(x => x.p)

  const listSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: `Top 10 mejores playas de la ${costa.nombre}`,
    numberOfItems: top.length,
    itemListElement: top.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p.nombre,
      url: `https://playas-espana.com/playas/${p.slug}`,
    })),
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/top" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Top 10</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{costa.nombre}</span>
        </nav>

        <div style={{ borderLeft: `4px solid ${costa.color === '#f8fafc' ? 'var(--accent)' : costa.color}`, paddingLeft: '1.25rem', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
            fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '.4rem',
          }}>
            Top 10 mejores playas de la {costa.nombre}
          </h1>
          <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.55, maxWidth: 560 }}>
            {costa.descripcion}
          </p>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.25rem' }}>
            {costa.zonaLabel} · {costa.provincias.join(', ')}
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, overflow: 'hidden', marginBottom: '2rem',
        }}>
          <MapaPlayas playas={top} height="400px" />
        </div>

        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {costaPlayas.map(({ p, score }, i) => {
            const sc = score >= 75 ? '#3d6b1f' : score >= 55 ? '#c48a1e' : score >= 35 ? '#a04818' : '#7a2818'
            return (
              <li key={p.slug}>
                <Link href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: 6, padding: '1rem 1.15rem',
                  textDecoration: 'none', transition: 'all .15s',
                }}>
                  <span style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: i < 3 ? 'var(--accent)' : 'var(--metric-bg)',
                    border: i < 3 ? 'none' : '1px solid var(--line)',
                    color: i < 3 ? '#fff' : 'var(--ink)',
                    fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                    {p.descripcion && !(p as any).descripcion_generada && (
                      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.2rem', lineHeight: 1.4 }}>
                        {(p.descripcion ?? '').slice(0, 100)}…
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '.2rem', flexWrap: 'wrap', marginTop: '.3rem' }}>
                      {p.bandera && <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.1rem .3rem', borderRadius: 4 }}>Bandera Azul</span>}
                      {p.socorrismo && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Socorrismo</span>}
                      {p.parking && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>Parking</span>}
                      {p.accesible && <span style={{ fontSize: '.65rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>PMR</span>}
                    </div>
                  </div>
                  <span style={{
                    background: sc, color: '#fff',
                    fontFamily: 'var(--font-serif)', fontWeight: 700,
                    fontSize: '1rem', padding: '.35rem .55rem', borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    {score}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href={`/rutas/ruta-${costa.slug}`} style={{
            fontSize: '.92rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none',
          }}>
            🛣️ Ver la ruta por la {costa.nombre} →
          </Link>
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
    </>
  )
}
