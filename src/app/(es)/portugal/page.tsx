// /portugal — la puerta de entrada.
//
// 726 praias de costa en 144 concelhos, del inventario de la APA. La
// página se ordena por región hidrográfica porque es la división que trae
// el dato: inventarla por distritos habría significado mapear 144
// concelhos a mano y equivocarse en varios.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPraiasCosta, getConcelhos, regionLegible } from '@/lib/praias'
import { robotsMeta } from '@/lib/robots-meta'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas de Portugal: las 726 praias de costa, con datos oficiales',
  description: 'Estado del mar, servicios, bandera azul y temporada de baño de las praias portuguesas, con el inventario de la Agência Portuguesa do Ambiente y el oleaje cada hora.',
  alternates: { canonical: '/portugal' },
  robots: robotsMeta(),
}

export default async function PortugalPage() {
  const [costa, concelhos] = await Promise.all([getPraiasCosta(), getConcelhos(2)])

  const porRegion = new Map<string, typeof concelhos>()
  for (const c of concelhos) {
    if (!porRegion.has(c.region)) porRegion.set(c.region, [])
    porRegion.get(c.region)!.push(c)
  }
  const regiones = [...porRegion.entries()].sort((a, b) => b[1].length - a[1].length)
  const conBandera = costa.filter(p => p.bandera).length
  const conSilla = costa.filter(p => p.sillaAnfibia).length

  return (
    <>
      <Nav bajadaLogo="DE ESPAÑA Y PORTUGAL" />
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
        <nav style={{ fontSize: '.75rem', color: 'var(--muted)', display: 'flex', gap: '.4rem', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Portugal</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 6vw, 2.8rem)', margin: '0 0 .6rem', lineHeight: 1.1 }}>
          Playas de <em>Portugal</em>
        </h1>
        <p style={{ fontSize: '1.02rem', lineHeight: 1.7, margin: '0 0 1.4rem', maxWidth: '62ch' }}>
          {costa.length} praias de costa con los mismos datos que las españolas: oleaje, viento y
          temperatura del agua cada hora. Los servicios salen del inventario de la Agência Portuguesa
          do Ambiente, que está mejor relleno que el español: aquí no hay «no consta».
          {conBandera > 0 && <> {conBandera} tienen bandera azul</>}
          {conSilla > 0 && <> y {conSilla} tienen silla anfibia, un dato de accesibilidad que en España no se publica</>}.
        </p>

        {regiones.map(([region, lista]) => (
          <section key={region} style={{ marginBottom: '1.6rem' }}>
            <h2 style={{ fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 .5rem', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
              {regionLegible(region)} · {lista.length} concelhos
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {lista.map(c => (
                <li key={c.slug}>
                  <Link href={`/portugal/municipio/${c.slug}`} style={{ display: 'inline-block', padding: '.35rem .75rem', borderRadius: 100, border: '1px solid var(--line)', background: 'var(--card-bg)', fontSize: '.84rem', color: 'var(--ink)' }}>
                    {c.nombre} <span style={{ color: 'var(--muted)' }}>{c.praias.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p style={{ margin: '2rem 0 0', fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          Inventario de la Agência Portuguesa do Ambiente (SNIRH), publicado en dados.gov.pt. El estado
          del mar es de Open-Meteo. Los concelhos con una sola praia no tienen página propia: la praia
          la tiene igual.
        </p>
      </main>
    </>
  )
}
