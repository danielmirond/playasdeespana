// /aparcar-playa/[provincia] — dónde dejar el coche en las playas de una
// provincia, con los municipios ordenados por aparcamientos mapeados.
//
// La cabeza que le faltaba a la vertical. Cada fila baja a la página de
// municipio, que es la que tiene el detalle; esta ordena y da el marco.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import PieLanding from '@/components/seo/PieLanding'
import { getProvinciasAparca, getProvinciaAparca } from '@/lib/aparcar-provincia'

export const revalidate = 86400
const BASE = 'https://playas-espana.com'

interface Props { params: Promise<{ provincia: string }> }

export async function generateStaticParams() {
  return [...(await getProvinciasAparca()).keys()].map(provincia => ({ provincia }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { provincia } = await params
  const p = await getProvinciaAparca(provincia)
  if (!p) return {}
  return {
    title: `Dónde aparcar en las playas de ${p.nombre}`,
    description: `${p.municipios.length} municipios de ${p.nombre} con aparcamiento mapeado cerca de la playa: a qué playa se llega en coche y a cuál conviene ir en autobús.`,
    alternates: { canonical: `/aparcar-playa/${provincia}` },
    openGraph: { type: 'website', url: `${BASE}/aparcar-playa/${provincia}` },
  }
}

export default async function AparcarProvincia({ params }: Props) {
  const { provincia } = await params
  const p = await getProvinciaAparca(provincia)
  if (!p) notFound()

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.3rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Dónde aparcar en las playas de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{p.nombre}</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: 640 }}>
          {p.municipios.length} municipios de {p.nombre} con aparcamiento mapeado a menos de 1,5 km de
          la playa, ordenados por cuántos tienen. Son los que están anotados en OpenStreetMap: puede
          faltar alguno, y ninguno garantiza sitio un domingo de agosto.
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {p.municipios.map(m => (
            <li key={m.slug} style={{ borderBottom: '1px solid var(--line)' }}>
              <Link href={`/municipio/${m.slug}/donde-aparcar`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'baseline', padding: '12px 0', minHeight: 44, boxSizing: 'border-box', textDecoration: 'none', color: 'var(--ink)' }}>
                <span style={{ fontSize: '.98rem' }}>Dónde aparcar en {m.nombre}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {m.aparcamientos}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <PieLanding
          provincia={p.nombre}
          provinciaSlug={p.slug}
          vertical="aparcar-playa"
          etiqueta="Aparcar"
          municipios={p.municipios.map(m => ({ slug: m.slug, nombre: m.nombre }))}
        />
      </main>
    </>
  )
}
