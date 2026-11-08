// src/components/seo/PieLanding.tsx
//
// El pie de una landing provincial de servicio: lo que le faltaba a las
// 221 para dejar de ser un callejón sin salida.
//
// Medido en producción antes de escribirlo, sobre /campings/cadiz:
// 0 enlaces a /municipio/, 0 a /playas/, 0 a las otras verticales de su
// misma provincia y 0 BreadcrumbList. Recibía autoridad desde las 8.500
// páginas geográficas que la enlazan y no devolvía ninguna, y cada
// vertical vivía aislada de las demás: 221 páginas sueltas en vez de 28
// clústeres provinciales que se sostienen entre sí.
//
// Tres cosas, por orden de valor:
//   1. los municipios de la provincia, que es contenido local y además
//      cierra el ciclo con las páginas que la enlazan;
//   2. las otras verticales de la MISMA provincia;
//   3. el breadcrumb, visible y en JSON-LD.
import Link from 'next/link'
import { enlacesConversion } from '@/lib/enlaces-conversion'

const BASE = 'https://playas-espana.com'

export interface MunicipioEnlace { slug: string; nombre: string; n?: number }

interface Props {
  /** Nombre de la provincia, tal y como se escribe. */
  provincia: string
  provinciaSlug: string
  /** La vertical de ESTA página, para no enlazarse a sí misma. */
  vertical: string
  /** Cómo se llama en el breadcrumb: «Campings», «Buceo»… */
  etiqueta: string
  /** Municipios que esta landing lista. Se enlazan los primeros. */
  municipios?: MunicipioEnlace[]
}

export default async function PieLanding({ provincia, provinciaSlug, vertical, etiqueta, municipios = [] }: Props) {
  const otras = (await enlacesConversion(provincia))
    .filter(e => e.local && !e.href.startsWith(`/${vertical}`))

  const migas = [
    { n: 'Inicio', h: '/' },
    { n: etiqueta, h: `/${vertical}` },
    { n: provincia, h: null as string | null },
  ]

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.n,
      ...(m.h ? { item: `${BASE}${m.h}` } : {}),
    })),
  }

  const titulo = {
    margin: '0 0 10px',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '.22em',
    textTransform: 'uppercase' as const,
    fontWeight: 400,
    color: 'var(--muted)',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {municipios.length > 0 && (
        <section aria-label={`Municipios de ${provincia}`} style={{ marginTop: '2.5rem' }}>
          <h2 style={titulo}>{etiqueta} por municipio</h2>
          <p style={{ margin: 0, fontSize: '.92rem', lineHeight: 1.9 }}>
            {municipios.slice(0, 40).map((m, i) => (
              <span key={m.slug}>
                {i > 0 && <span style={{ color: 'var(--muted)' }}> · </span>}
                <Link href={`/municipio/${m.slug}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{m.nombre}</Link>
              </span>
            ))}
          </p>
        </section>
      )}

      {otras.length > 0 && (
        <section aria-label={`Más servicios en ${provincia}`} style={{ marginTop: '2rem' }}>
          <h2 style={titulo}>Más en {provincia}</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {otras.map(e => (
              <li key={e.href} style={{ borderBottom: '1px solid var(--line)' }}>
                <Link href={e.href} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'baseline', padding: '11px 0', minHeight: 44, boxSizing: 'border-box', fontSize: 14.5, textDecoration: 'none', color: 'var(--ink)' }}>
                  <span>{e.label}</span>
                  <span aria-hidden style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p style={{ marginTop: '1.6rem' }}>
        <Link href={`/provincia/${provinciaSlug}`} style={{ fontSize: '.9rem', color: 'var(--ink)', textDecoration: 'none' }}>
          Todas las playas de {provincia} <span aria-hidden="true">→</span>
        </Link>
      </p>
    </>
  )
}
