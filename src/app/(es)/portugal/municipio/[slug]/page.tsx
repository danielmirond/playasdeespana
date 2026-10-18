// /portugal/municipio/[slug] — las praias de un concelho.
//
// El equivalente portugués de /municipio/[slug]: 98 concelhos con dos o
// más praias. Se escribe aquí en vez de reutilizar la página española
// porque aquella cruza AEMET, mareas de Puertos del Estado y las seis
// subpáginas del municipio, que en Portugal todavía no existen. Lo que sí
// se comparte es lo que importa: el orden por servicios y el criterio de
// no afirmar lo que el inventario no dice.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getConcelho, getConcelhos, regionLegible } from '@/lib/praias'
import { robotsMeta } from '@/lib/robots-meta'

export const revalidate = 86400
export const dynamicParams = true
export function generateStaticParams() { return [] }

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = await getConcelho(slug)
  if (!c) return {}
  return {
    title: `Playas de ${c.nombre} (Portugal): las ${c.praias.length} praias del concelho`,
    description: `Las ${c.praias.length} praias de ${c.nombre}, con sus servicios, bandera azul y temporada de baño según el inventario oficial portugués.`,
    alternates: { canonical: `/portugal/municipio/${slug}` },
    robots: robotsMeta(),
  }
}

export default async function ConcelhoPage({ params }: Props) {
  const { slug } = await params
  const c = await getConcelho(slug)
  if (!c || c.praias.length < 2) notFound()

  // Primero las que más resuelven: bandera, socorrismo y accesibilidad son
  // lo que decide una tarde con niños o con una silla de ruedas.
  const praias = [...c.praias].sort((a, b) =>
    ((b.bandera ? 4 : 0) + (b.socorrismo ? 3 : 0) + (b.accesible ? 2 : 0) + (b.parking ? 1 : 0)) -
    ((a.bandera ? 4 : 0) + (a.socorrismo ? 3 : 0) + (a.accesible ? 2 : 0) + (a.parking ? 1 : 0))
    || a.nombre.localeCompare(b.nombre))

  const conBandera = praias.filter(p => p.bandera).length
  const conSocorro = praias.filter(p => p.socorrismo).length
  const conSilla = praias.filter(p => p.sillaAnfibia).length
  const otros = (await getConcelhos(2)).filter(x => x.slug !== slug && x.region === c.region).slice(0, 8)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
        <nav style={{ fontSize: '.75rem', color: 'var(--muted)', display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span>
          <Link href="/portugal">Portugal</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{c.nombre}</span>
        </nav>

        <p style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>
          {regionLegible(c.region)} · Portugal · {praias.length} praias
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', margin: '.2rem 0 .7rem', lineHeight: 1.1 }}>
          Playas de {c.nombre}
        </h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.65, margin: '0 0 1.6rem' }}>
          {c.nombre} tiene <b>{praias.length} praias</b> en el inventario oficial portugués
          {conBandera > 0 && <>, <b>{conBandera}</b> con bandera azul</>}
          {conSocorro > 0 && <> y <b>{conSocorro}</b> con socorrismo</>}.
          {conSilla > 0 && <> {conSilla === 1 ? 'Una tiene' : `${conSilla} tienen`} silla anfibia, que es el dato de accesibilidad que el inventario español no recoge.</>}
        </p>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.6rem' }}>
          {praias.map(p => {
            const tiene = [
              p.bandera && 'Bandera Azul', p.socorrismo && 'socorrismo', p.duchas && 'duchas',
              p.aseos && 'aseos', p.parking && 'aparcamiento', p.accesible && 'accesible',
              p.sillaAnfibia && 'silla anfibia',
            ].filter(Boolean)
            return (
              <li key={p.slug} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '.8rem 1rem', background: 'var(--card-bg)' }}>
                <Link href={`/portugal/playas/${p.slug}`} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {p.nombre}
                </Link>
                <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                  {tiene.length ? tiene.join(' · ') : 'Sin servicios anotados en el inventario'}
                </div>
                {(p.olasFuertes || p.riesgoDesprendimiento) && (
                  <div style={{ fontSize: '.78rem', color: 'var(--aceptable)', marginTop: '.2rem' }}>
                    {[p.olasFuertes && 'oleaje fuerte habitual', p.riesgoDesprendimiento && 'riesgo de desprendimientos'].filter(Boolean).join(' · ')}
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        {otros.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: '2.2rem 0 .7rem' }}>
              Otros concelhos del {regionLegible(c.region)}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {otros.map(o => (
                <li key={o.slug}>
                  <Link href={`/portugal/municipio/${o.slug}`} style={{ display: 'inline-block', padding: '.35rem .75rem', borderRadius: 100, border: '1px solid var(--line)', fontSize: '.84rem', color: 'var(--ink)' }}>
                    {o.nombre} <span style={{ color: 'var(--muted)' }}>{o.praias.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <p style={{ margin: '2rem 0 0', fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          Servicios, bandera azul y accesibilidad salen del inventario de la Agência Portuguesa do Ambiente
          (SNIRH). El estado del mar de cada praia se actualiza cada hora con Open-Meteo.
        </p>
      </main>
    </>
  )
}
