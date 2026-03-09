// src/components/playa/SchemaPlaya.tsx
// JSON-LD structured data para Google — Beach + TouristAttraction + FAQPage + BreadcrumbList
import type { Playa } from '@/types'
import { generarTextoPlaya } from '@/lib/textoPlaya'

interface Props {
  playa:    Playa
  agua:     number
  olas:     number
  calidad?: string
}

const ACTIVIDAD_LABELS: Record<string, string> = {
  surf:      'Surf',
  windsurf:  'Windsurf',
  kite:      'Kitesurf',
  snorkel:   'Snorkel',
  buceo:     'Buceo',
  kayak:     'Kayak',
  paddle:    'Paddle surf',
}

export default function SchemaPlaya({ playa, agua, olas, calidad }: Props) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const url  = `${BASE}/playas/${playa.slug}`

  const actividades = Object.entries(playa.actividades ?? {})
    .filter(([, v]) => v)
    .map(([k]) => ACTIVIDAD_LABELS[k] ?? k)

  const textoSEO = generarTextoPlaya(playa)

  const amenityFeature = [
    playa.bandera    && { '@type': 'LocationFeatureSpecification', name: 'Bandera Azul',       value: true },
    playa.socorrismo && { '@type': 'LocationFeatureSpecification', name: 'Socorrismo',         value: true },
    playa.accesible  && { '@type': 'LocationFeatureSpecification', name: 'Accesible PMR',      value: true },
    playa.duchas     && { '@type': 'LocationFeatureSpecification', name: 'Duchas',             value: true },
    playa.parking    && { '@type': 'LocationFeatureSpecification', name: 'Parking',            value: true },
    playa.perros     && { '@type': 'LocationFeatureSpecification', name: 'Perros permitidos',  value: true },
    playa.nudista    && { '@type': 'LocationFeatureSpecification', name: 'Playa nudista',      value: true },
    ...actividades.map(a => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
  ].filter(Boolean)

  // FAQPage — preguntas reales de intención de visita
  const faqs = [
    {
      q: `¿Cómo está el agua en ${playa.nombre} hoy?`,
      a: `La temperatura del agua en ${playa.nombre} es actualmente de ${agua}°C, con un oleaje de ${olas}m.${calidad ? ` La calidad del agua es ${calidad} según la Directiva europea 2006/7/CE.` : ''}`,
    },
    playa.socorrismo !== undefined && {
      q: `¿Tiene socorrismo ${playa.nombre}?`,
      a: playa.socorrismo
        ? `Sí, ${playa.nombre} cuenta con servicio de socorrismo en temporada alta.`
        : `${playa.nombre} no dispone de servicio de socorrismo. Te recomendamos extremar la precaución.`,
    },
    playa.parking !== undefined && {
      q: `¿Hay parking cerca de ${playa.nombre}?`,
      a: playa.parking
        ? `Sí, hay zona de aparcamiento próxima a ${playa.nombre}.`
        : `${playa.nombre} no dispone de parking oficial. Consulta el estado del tráfico en tiempo real en esta página.`,
    },
    playa.perros !== undefined && {
      q: `¿Se pueden llevar perros a ${playa.nombre}?`,
      a: playa.perros
        ? `Sí, ${playa.nombre} es una playa donde se permiten perros.`
        : `No, en ${playa.nombre} no está permitido el acceso con perros, especialmente en temporada alta.`,
    },
    actividades.length > 0 && {
      q: `¿Qué actividades se pueden hacer en ${playa.nombre}?`,
      a: `En ${playa.nombre} puedes practicar: ${actividades.join(', ')}.`,
    },
    playa.bandera !== undefined && {
      q: `¿Tiene bandera azul ${playa.nombre}?`,
      a: playa.bandera
        ? `Sí, ${playa.nombre} tiene bandera azul, garantía de calidad del agua y gestión medioambiental responsable.`
        : `${playa.nombre} no tiene bandera azul en la última temporada registrada.`,
    },
  ].filter(Boolean) as { q: string; a: string }[]

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type':          'Question',
      name:             q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  // BreadcrumbList
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio',        item: BASE },
      { '@type': 'ListItem', position: 2, name: playa.comunidad, item: `${BASE}/comunidad/${playa.comunidad.toLowerCase().replace(/ /g, '-')}` },
      { '@type': 'ListItem', position: 3, name: playa.provincia, item: `${BASE}/provincia/${playa.provincia.toLowerCase().replace(/ /g, '-')}` },
      { '@type': 'ListItem', position: 4, name: playa.nombre,    item: url },
    ],
  }

  // Beach principal
  const beach = {
    '@context': 'https://schema.org',
    '@type':    ['Beach', 'TouristAttraction'],
    name:        playa.nombre,
    description: textoSEO,
    url,
    sameAs:      url,
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   playa.lat,
      longitude:  playa.lng,
    },
    hasMap: `https://www.google.com/maps?q=${playa.lat},${playa.lng}`,
    address: {
      '@type':          'PostalAddress',
      addressLocality:  playa.municipio,
      addressRegion:    playa.provincia,
      addressCountry:   'ES',
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name:    playa.comunidad,
    },
    additionalProperty: [
      ...(playa.longitud    ? [{ '@type': 'PropertyValue', name: 'Longitud',    value: `${playa.longitud} metros` }] : []),
      ...(playa.anchura     ? [{ '@type': 'PropertyValue', name: 'Anchura',     value: `${playa.anchura} metros` }]  : []),
      ...(playa.composicion ? [{ '@type': 'PropertyValue', name: 'Composición', value: playa.composicion }]          : []),
      ...(playa.tipo        ? [{ '@type': 'PropertyValue', name: 'Tipo',        value: playa.tipo }]                 : []),
    ],
    amenityFeature,
    touristType: [
      'Playa', 'Baño', 'Turismo de sol y playa', 'Familia',
      ...(actividades.length > 0 ? ['Deportes acuáticos'] : []),
      ...(playa.nudista ? ['Playa nudista'] : []),
    ],
    isAccessibleForFree: true,
    publicAccess:        true,
  }

  const schemas = [beach, breadcrumb, ...(faqSchema ? [faqSchema] : [])]

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  )
}
