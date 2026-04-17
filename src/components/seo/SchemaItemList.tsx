// src/components/seo/SchemaItemList.tsx
// JSON-LD ItemList para páginas de listado (comunidad, provincia,
// banderas-azules, playas-perros, playas-nudistas, etc.).
//
// Google usa ItemList para entender que la página es una lista navegable
// y puede mostrar carruseles ricos en SERP. También refuerza la autoridad
// tópica al declarar explícitamente que el sitio cura colecciones de
// entidades relacionadas (Beach).

interface BeachItem {
  slug:      string
  nombre:    string
  municipio: string
  provincia: string
}

interface Props {
  /** Título descriptivo de la lista, ej: "Playas con Bandera Azul en Cádiz" */
  name:        string
  /** URL canónica de la página de listado */
  url:         string
  description?: string
  beaches:     BeachItem[]
  /** Locale para construir el path (/playas/ vs /en/beaches/) */
  locale?:     'es' | 'en'
  /** Si la lista está ordenada por algún criterio. Default: false */
  ordered?:    boolean
}

export default function SchemaItemList({ name, url, description, beaches, locale = 'es', ordered = false }: Props) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const beachPath = locale === 'en' ? '/en/beaches' : '/playas'

  const itemList = {
    '@context':           'https://schema.org',
    '@type':              ordered ? 'ItemList' : 'CollectionPage',
    '@id':                url,
    name,
    ...(description ? { description } : {}),
    url,
    ...(ordered ? { itemListOrder: 'https://schema.org/ItemListOrderAscending' } : {}),
    numberOfItems:        beaches.length,
    mainEntity: {
      '@type':            'ItemList',
      numberOfItems:      beaches.length,
      itemListElement:    beaches.slice(0, 100).map((b, i) => ({
        '@type':   'ListItem',
        position:  i + 1,
        url:       `${BASE}${beachPath}/${b.slug}`,
        item: {
          '@type':   'Beach',
          '@id':     `${BASE}${beachPath}/${b.slug}#beach`,
          name:      b.nombre,
          url:       `${BASE}${beachPath}/${b.slug}`,
          address: {
            '@type':         'PostalAddress',
            addressLocality: b.municipio,
            addressRegion:   b.provincia,
            addressCountry:  'ES',
          },
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
    />
  )
}
