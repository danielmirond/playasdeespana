// src/components/playa/SchemaPlaya.tsx
// JSON-LD structured data para Google — tipo Beach + TouristAttraction
import type { Playa } from '@/types'

interface Props {
  playa:    Playa
  agua:     number
  olas:     number
  calidad?: string
}

export default function SchemaPlaya({ playa, agua, olas, calidad }: Props) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playasdeespana.es'

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Beach', 'TouristAttraction'],
    name:        playa.nombre,
    description: `${playa.nombre} en ${playa.municipio}, ${playa.provincia}. Temperatura del agua: ${agua}°C. Oleaje: ${olas}m. ${calidad ? `Calidad del agua: ${calidad}.` : ''}`,
    url:         `${BASE}/playas/${playa.slug}`,
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   playa.lat,
      longitude:  playa.lng,
    },
    address: {
      '@type':           'PostalAddress',
      addressLocality:   playa.municipio,
      addressRegion:     playa.provincia,
      addressCountry:    'ES',
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name:    playa.comunidad,
    },
    amenityFeature: [
      playa.bandera    && { '@type': 'LocationFeatureSpecification', name: 'Bandera Azul',  value: true },
      playa.socorrismo && { '@type': 'LocationFeatureSpecification', name: 'Socorrismo',    value: true },
      playa.accesible  && { '@type': 'LocationFeatureSpecification', name: 'Accesible PMR', value: true },
      playa.duchas     && { '@type': 'LocationFeatureSpecification', name: 'Duchas',        value: true },
      playa.parking    && { '@type': 'LocationFeatureSpecification', name: 'Parking',       value: true },
      playa.perros     && { '@type': 'LocationFeatureSpecification', name: 'Perros',        value: true },
    ].filter(Boolean),
    touristType: ['Playa', 'Baño', 'Familia'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
