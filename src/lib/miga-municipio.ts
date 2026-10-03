// src/lib/miga-municipio.ts — la miga de pan de las páginas de municipio,
// como dato estructurado.
//
// POR QUÉ. Las nueve páginas que cuelgan de un municipio pintaban su miga
// visible (Inicio › Comunidad › Provincia › Municipio › Sección) pero
// ninguna la declaraba en BreadcrumbList, así que en los resultados de
// Google salía la URL cruda en vez de la ruta. Con nueve páginas por
// municipio y cientos de municipios, eso es mucha miga perdida.
//
// Se escribe una vez aquí para que las nueve digan lo mismo: si la miga
// visible y la declarada no coinciden, Google ignora la segunda.
import { comunidadDe } from './comunidad'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export interface DatosMiga {
  slug: string
  nombre: string
  provincia: string
  provinciaSlug: string
  comunidad: string
  /** El último escalón, el de esta página: «Camping», «Aparcar»… */
  seccion?: string
  /** Su ruta, cuando la sección tiene página propia. */
  seccionHref?: string
  /** Si el municipio no tiene raíz publicada, no se enlaza. */
  conRaiz?: boolean
}

/** El JSON-LD que acompaña a la miga visible. Mismos escalones y mismo orden. */
export function migaMunicipio(d: DatosMiga) {
  const items: { name: string; item?: string }[] = [{ name: 'Inicio', item: BASE }]
  const com = comunidadDe(d.comunidad, d.provincia)
  if (com) items.push({ name: com.nombre, item: `${BASE}/comunidad/${com.slug}` })
  items.push({ name: d.provincia, item: `${BASE}/provincia/${d.provinciaSlug}` })
  items.push({ name: d.nombre, item: d.conRaiz === false ? undefined : `${BASE}/municipio/${d.slug}` })
  if (d.seccion) items.push({ name: d.seccion, item: d.seccionHref ? `${BASE}${d.seccionHref}` : undefined })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: x.name,
      // El último escalón va sin url: es la página en la que estás.
      ...(x.item && i < items.length - 1 ? { item: x.item } : {}),
    })),
  }
}
