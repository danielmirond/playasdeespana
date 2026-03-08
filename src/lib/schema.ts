// Generadores de JSON-LD para todas las páginas

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playasdeespana.es'

// ── WebSite — solo en home ────────────────────────────────────────────────────
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Playas de España',
    url: BASE,
    description: 'Condiciones en tiempo real de más de 3.500 playas españolas.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/api/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Playas de España',
      url: BASE,
    },
  }
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────
export function buildBreadcrumb(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ── Beach (ficha de playa) ────────────────────────────────────────────────────
export function buildBeachSchema({
  nombre, municipio, provincia, slug,
  lat, lon, longitud, anchura,
  servicios, banderaAzul, calidad,
  tempAgua, oleaje,
}: {
  nombre: string; municipio: string; provincia: string; slug: string
  lat: number; lon: number; longitud?: number; anchura?: number
  servicios: Record<string, boolean>
  banderaAzul: boolean; calidad: string | null
  tempAgua?: number | null; oleaje?: number | null
}) {
  const url = `${BASE}/playas/${slug}`

  const amenities = Object.entries(servicios)
    .filter(([, v]) => v)
    .map(([k]) => ({
      '@type': 'LocationFeatureSpecification',
      name: k,
      value: true,
    }))

  return {
    '@context': 'https://schema.org',
    '@type': ['Beach', 'TouristAttraction'],
    name: nombre,
    url,
    description: `Playa ${nombre} en ${municipio}, ${provincia}. ${banderaAzul ? 'Bandera Azul. ' : ''}${calidad ? `Calidad del agua: ${calidad}.` : ''}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lon,
    },
    ...(longitud || anchura ? {
      additionalProperty: [
        longitud ? { '@type': 'PropertyValue', name: 'longitud', value: longitud, unitCode: 'MTR' } : null,
        anchura  ? { '@type': 'PropertyValue', name: 'anchura',  value: anchura,  unitCode: 'MTR' } : null,
      ].filter(Boolean)
    } : {}),
    amenityFeature: amenities,
    containedInPlace: {
      '@type': 'City',
      name: municipio,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: provincia,
        containedInPlace: { '@type': 'Country', name: 'España', sameAs: 'https://www.wikidata.org/wiki/Q29' },
      },
    },
    ...(tempAgua != null ? {
      additionalProperty: [{
        '@type': 'PropertyValue',
        name: 'Temperatura del agua',
        value: tempAgua,
        unitCode: 'CEL',
      }]
    } : {}),
  }
}

// ── ItemList — para páginas de comunidad ──────────────────────────────────────
export function buildItemListSchema(
  playas: { nombre: string; slug: string }[],
  comunidad: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Playas de ${comunidad}`,
    numberOfItems: playas.length,
    itemListElement: playas.slice(0, 50).map((p, i) => ({  // max 50 en schema
      '@type': 'ListItem',
      position: i + 1,
      name: p.nombre,
      url: `${BASE}/playas/${p.slug}`,
    })),
  }
}

// ── Serializer — para usar en <script type="application/ld+json"> ─────────────
export function jsonLd(data: object) {
  return JSON.stringify(data)
}
