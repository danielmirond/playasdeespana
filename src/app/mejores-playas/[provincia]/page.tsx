// src/app/mejores-playas/[provincia]/page.tsx
// Long-tail SEO: "Mejores playas de [provincia]" — ~50 páginas automáticas.
// Ranking por score de servicios (bandera azul + socorrismo + parking + duchas).
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getProvincias } from '@/lib/playas'
import SchemaItemList from '@/components/seo/SchemaItemList'

export const revalidate = 86400

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

interface Props { params: Promise<{ provincia: string }> }

export async function generateStaticParams() {
  const provs = await getProvincias()
  return provs.map(p => ({ provincia: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { provincia } = await params
  const provs = await getProvincias()
  const prov = provs.find(p => p.slug === provincia)
  if (!prov) return {}
  return {
    title: `Mejores playas de ${prov.nombre} — Ranking ${new Date().getFullYear()}`,
    description: `Las ${Math.min(prov.count, 20)} mejores playas de ${prov.nombre}: ranking por servicios, Bandera Azul, accesibilidad y estado del mar. Datos actualizados.`,
    alternates: { canonical: `/mejores-playas/${provincia}` },
  }
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function MejoresPlayasProvinciaPage({ params }: Props) {
  const { provincia: slug } = await params
  const [playas, provs] = await Promise.all([getPlayas(), getProvincias()])
  const prov = provs.find(p => p.slug === slug)
  if (!prov) notFound()

  const provinciaPlayas = playas
    .filter(p => slugify(p.provincia) === slug)
    .map(p => ({
      ...p,
      pts: (p.bandera ? 4 : 0) + (p.socorrismo ? 3 : 0) + (p.accesible ? 2 : 0)
        + (p.parking ? 1 : 0) + (p.duchas ? 1 : 0),
    }))
    .sort((a, b) => b.pts - a.pts)

  const top = provinciaPlayas.slice(0, 20)
  const comSlug = slugify(top[0]?.comunidad ?? '')

  return (
    <>
      <SchemaItemList
        name={`Mejores playas de ${prov.nombre}`}
        description={`Ranking de las mejores playas de ${prov.nombre} por servicios, Bandera Azul y accesibilidad.`}
        url={`${BASE}/mejores-playas/${slug}`}
        beaches={top.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
        ordered
      />
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <Link href={`/provincia/${slug}`}>{prov.nombre}</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Mejores playas</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          Las <em style={{ fontWeight: 500, color: 'var(--accent)' }}>mejores playas</em> de {prov.nombre}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 640, marginBottom: '2rem', lineHeight: 1.6 }}>
          Ranking de las {top.length} playas mejor equipadas de {prov.nombre}, ordenadas por
          Bandera Azul, socorrismo, accesibilidad y servicios. Estado del mar en tiempo real
          en cada ficha.
        </p>

        <ol style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: '.5rem',
        }}>
          {top.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/playas/${p.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.85rem 1rem', borderRadius: 6,
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                textDecoration: 'none', color: 'inherit',
                transition: 'border-color .15s',
              }}>
                <span style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)',
                  letterSpacing: '-.01em', flexShrink: 0, width: 36,
                }}>
                  n°{i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.2 }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.1rem' }}>
                    {p.municipio}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.25rem', flexShrink: 0, flexWrap: 'wrap' }}>
                  {p.bandera && <span style={{ fontSize: '.6rem', fontWeight: 500, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.12rem .35rem', borderRadius: 100 }}>B. Azul</span>}
                  {p.socorrismo && <span style={{ fontSize: '.6rem', fontWeight: 500, color: 'var(--muted)', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.12rem .35rem', borderRadius: 100 }}>Socorr.</span>}
                  {p.accesible && <span style={{ fontSize: '.6rem', fontWeight: 500, color: '#3d6b1f', background: 'rgba(61,107,31,.08)', padding: '.12rem .35rem', borderRadius: 100 }}>PMR</span>}
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {provinciaPlayas.length > 20 && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href={`/provincia/${slug}`} style={{
              fontSize: '.88rem', fontWeight: 500, color: 'var(--accent)',
              borderBottom: '1px solid var(--accent)', paddingBottom: 1,
              textDecoration: 'none',
            }}>
              Ver las {provinciaPlayas.length} playas de {prov.nombre} →
            </Link>
          </div>
        )}

        {comSlug && (
          <div style={{ marginTop: '2.5rem' }}>
            <Link href={`/comunidad/${comSlug}`} style={{
              fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none',
            }}>
              ← Todas las playas de {top[0]?.comunidad}
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
