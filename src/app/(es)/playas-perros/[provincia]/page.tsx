// /playas-perros/[provincia] — playas caninas de una provincia y la
// normativa que las rige.
//
// Las consultas que traen impresiones son provinciales y la única página
// publicada era nacional. Y la mitad de ellas preguntan por la NORMATIVA,
// no por la playa: «normativa perros playas cantabria», 126 impresiones.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import PieLanding from '@/components/seo/PieLanding'
import { getProvinciasPerros, getProvinciaPerros, NORMATIVA } from '@/lib/perros-provincia'

export const revalidate = 86400
const BASE = 'https://playas-espana.com'

interface Props { params: Promise<{ provincia: string }> }

export async function generateStaticParams() {
  return [...(await getProvinciasPerros()).keys()].map(provincia => ({ provincia }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { provincia } = await params
  const p = await getProvinciaPerros(provincia)
  if (!p) return {}
  return {
    title: `Playas para perros en ${p.nombre}: cuáles y qué normativa`,
    description: `Las ${p.playas.length} playas de ${p.nombre} donde se puede ir con perro, con el estado del mar de hoy en cada una, y qué exige la ordenanza antes de bajar a la arena.`,
    alternates: { canonical: `/playas-perros/${provincia}` },
    openGraph: { type: 'website', url: `${BASE}/playas-perros/${provincia}` },
  }
}

export default async function PerrosProvincia({ params }: Props) {
  const { provincia } = await params
  const p = await getProvinciaPerros(provincia)
  if (!p) notFound()

  const municipios = [...new Set(p.playas.map(x => x.municipio))]
  const h2 = {
    fontFamily: 'var(--font-serif)', fontSize: '1.25rem',
    margin: '2.25rem 0 .7rem', color: 'var(--ink)',
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.3rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Playas para perros en <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{p.nombre}</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 1rem', maxWidth: 640 }}>
          {p.playas.length} playas de {p.nombre} en {municipios.length} municipios admiten perros, según el
          inventario del Ministerio y lo anotado en OpenStreetMap. Abajo, lo que suele exigir la ordenanza:
          es el ayuntamiento quien decide, y los carteles del acceso mandan sobre cualquier lista.
        </p>

        <h2 style={h2}>Las playas</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {p.playas.map(x => (
            <li key={x.slug} style={{ borderBottom: '1px solid var(--line)' }}>
              <Link href={`/playas/${x.slug}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'baseline', padding: '12px 0', minHeight: 44, boxSizing: 'border-box', textDecoration: 'none', color: 'var(--ink)' }}>
                <span style={{ fontSize: '.98rem' }}>{x.nombre}</span>
                <span style={{ fontSize: '.8rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{x.municipio}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* La otra mitad de la intención: no buscan una playa, buscan si
            les van a multar. */}
        <h2 style={h2}>Qué dice la normativa</h2>
        <p style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'var(--ink)', maxWidth: 660, margin: '0 0 1rem' }}>
          {NORMATIVA.quienRegula}
        </p>
        <ul style={{ margin: '0 0 1rem 1.1rem', lineHeight: 1.8, fontSize: '.93rem', color: 'var(--ink)', maxWidth: 660 }}>
          {NORMATIVA.loHabitual.map(t => <li key={t}>{t}</li>)}
        </ul>
        <p style={{ fontSize: '.88rem', lineHeight: 1.7, color: 'var(--muted)', maxWidth: 660 }}>
          <b style={{ color: 'var(--ink)' }}>Dónde comprobarlo:</b> {NORMATIVA.dondeMirar}
        </p>

        <PieLanding
          provincia={p.nombre}
          provinciaSlug={p.slug}
          vertical="playas-perros"
          etiqueta="Playas para perros"
          municipios={municipios.map(m => ({ slug: m.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), nombre: m }))}
        />
      </main>
    </>
  )
}
