import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TopicProvinciaPage, { type TopicConfig } from '@/components/seo/TopicProvinciaPage'
import Link from 'next/link'
import { getProvinciasCosteras, getPlayasByProvinciaSlug } from '@/lib/provinciaTopicHelpers'
import { getMunicipiosBuceo, MAX_CENTROS_POR_MUNICIPIO, type MunicipioBuceo } from '@/lib/buceo-resumen'

export const maxDuration = 60
export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export async function generateStaticParams() {
  const provs = await getProvinciasCosteras()
  return provs.slice(0, 5).map(p => ({ provincia: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) return {}
  const title = `Buceo en ${data.provincia.nombre}: centros y puntos de inmersión por municipio`
  return {
    title,
    description: `Centros de buceo y puntos de inmersión en ${data.provincia.nombre}, municipio a municipio, con la playa que queda más cerca de cada uno.`,
    alternates: { canonical: `/buceo/${provincia}` },
    openGraph: { title, url: `${BASE}/buceo/${provincia}`, type: 'article' },
  }
}

// La config se monta con los datos de la provincia. Antes era fija y
// prometía «bautismos desde 40 €», «Open Water desde 300 €», «PADI tiene
// el 80 % de los centros» y «acceso a reservas marinas», todo sin fuente, y
// ordenaba las playas por un campo que el dataset no trae.
function config(provincia: string, municipios: MunicipioBuceo[]): TopicConfig {
  const centros = municipios.reduce((n, m) => n + m.centros, 0)
  const puntos = municipios.reduce((n, m) => n + m.puntos, 0)
  return {
    slug: 'buceo',
    gygActivity: 'submarinismo',
    emoji: '🤿',
    color: '#3d93b0',
    tituloTopic: 'Centros de buceo',
    ocultarPlayas: true,
    intro: municipios.length
      ? `En ${provincia} tenemos localizados ${centros} ${centros === 1 ? 'centro' : 'centros'} de buceo en ${municipios.length} ${municipios.length === 1 ? 'municipio' : 'municipios'} (contamos hasta ${MAX_CENTROS_POR_MUNICIPIO} por municipio)${puntos ? ` y ${puntos} ${puntos === 1 ? 'punto' : 'puntos'} de inmersión señalados en OpenStreetMap` : ''}. Los municipios enlazados tienen su página de snorkel y buceo, con los centros, la playa que les queda más cerca y la vida marina registrada en su litoral.`
      : `Todavía no tenemos centros de buceo localizados en ${provincia}.`,
    highlights: [],
    faqs: [
      {
        q: '¿Dónde se puede bucear en {provincia}?',
        aProvincia: (p) => municipios.length
          ? `Tenemos centros localizados en ${municipios.length} ${municipios.length === 1 ? 'municipio' : 'municipios'} de ${p}, entre ellos ${municipios.slice(0, 3).map(m => m.nombre).join(', ')}. En la página de snorkel y buceo de cada municipio están los centros y, cuando OpenStreetMap los tiene, los puntos de inmersión.`
          : `En ${p} todavía no tenemos centros de buceo localizados.`,
      },
      {
        q: '¿De dónde salen los centros de buceo?',
        aGeneric: `De Google Maps, consultado una vez por municipio costero y con un máximo de ${MAX_CENTROS_POR_MUNICIPIO} por municipio. Los puntos de inmersión salen de OpenStreetMap. No pagamos ni cobramos por aparecer en la lista.`,
      },
    ],
    relacionados: [
      { href: '/buceo', label: 'Buceo en España' },
      { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
      { href: '/seguros-viaje', label: 'Seguros (deportes acuáticos)' },
    ],
    extraSections: () => municipios.length ? (
      <section aria-labelledby="h2-muni-buceo" style={{ marginBottom: '2.5rem' }}>
        <h2 id="h2-muni-buceo" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Buceo por municipio en {provincia}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.5rem' }}>
          {municipios.map(m => {
            const texto = (
              <>
                <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)' }}>{m.nombre}</span>
                <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>
                  {m.centros > 0 && <>{m.centros} {m.centros === 1 ? 'centro' : 'centros'}</>}
                  {m.centros > 0 && m.puntos > 0 && ' · '}
                  {m.puntos > 0 && <>{m.puntos} {m.puntos === 1 ? 'punto' : 'puntos'} de inmersión</>}
                </span>
              </>
            )
            const caja = { display: 'flex', flexDirection: 'column' as const, gap: '.15rem', padding: '.8rem 1rem', borderRadius: 6, background: 'var(--card-bg)', border: '1px solid var(--line)', textDecoration: 'none', color: 'inherit' }
            return m.conPagina
              ? <Link key={m.slug} href={`/municipio/${m.slug}/snorkel-buceo`} prefetch={false} style={caja}>{texto}</Link>
              : <div key={m.slug} style={caja}>{texto}</div>
          })}
        </div>
      </section>
    ) : null,
  }
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  const municipios = (await getMunicipiosBuceo())
    .filter(m => m.provinciaSlug === data.provincia.slug)
    .sort((a, b) => b.puntos - a.puntos || b.centros - a.centros || a.nombre.localeCompare(b.nombre, 'es'))
  return <TopicProvinciaPage config={config(data.provincia.nombre, municipios)} provincia={data.provincia} playas={data.playas} />
}
