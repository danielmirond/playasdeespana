// src/components/playa/SchemaPlaya.tsx
// JSON-LD structured data. Beach + TouristDestination + WaterBodyForSwimming +
// BreadcrumbList + FAQPage + AggregateRating (cuando hay votos).
//
// Estrategia semántica (Schema.org + Knowledge Graph):
//   - Beach: la entidad principal con todas las propiedades físicas
//   - TouristDestination: vincula la playa al ecosistema turístico
//   - WaterBodyForSwimming: declara explícitamente el agua como cuerpo
//     bañable, con temperatura y oleaje como QuantitativeValue
//   - isPartOf: cadena de pertenencia municipio → provincia → comunidad
//   - amenityFeature: servicios y características para filtros de Google
//   - aggregateRating: confianza social cuando hay valoraciones
//   - potentialAction: acción de "cómo llegar" navegable
//
// El FAQPage solo se emite si la página pasa las mismas preguntas que
// renderiza visiblemente en el HTML. La fuente de verdad es
// `generarFaqsPlaya()`. De esa forma el schema SIEMPRE refleja el HTML
// y Google no reporta "Duplicate FAQ" por mismatch.
import type { Playa } from '@/types'
import { generarTextoPlaya } from '@/lib/textoPlaya'
import type { FaqItem } from '@/lib/faqsPlaya'

interface AggregateRatingData {
  ratingValue: number  // media (1-5)
  ratingCount: number  // total de valoraciones
}

interface Props {
  playa:         Playa
  agua:          number
  olas:          number
  viento?:       number
  uv?:           number | null
  tempAire?:     number
  calidadNivel?: string | null  // 'Excelente' | 'Buena' | ...
  fotoUrl?:      string | null
  fotoAutor?:    string
  rating?:       AggregateRatingData | null
  dateModified?: string
  /** FAQs visibles en la página. Deben coincidir EXACTAMENTE con las
   *  que FichaBody renderiza, para evitar mismatch entre schema y HTML. */
  faqs?:         FaqItem[]
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

export default function SchemaPlaya({
  playa, agua, olas, viento, uv, tempAire,
  calidadNivel, fotoUrl, fotoAutor, rating,
  dateModified, faqs,
}: Props) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const url  = `${BASE}/playas/${playa.slug}`

  const actividades = Object.entries(playa.actividades ?? {})
    .filter(([, v]) => v)
    .map(([k]) => ACTIVIDAD_LABELS[k] ?? k)

  const textoSEO = generarTextoPlaya(playa)

  const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // amenityFeature: características booleanas que Google muestra como filtros
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

  // additionalProperty: propiedades cuantitativas/categóricas
  const additionalProperty = [
    ...(playa.longitud    ? [{ '@type': 'PropertyValue', name: 'Longitud',    value: playa.longitud, unitCode: 'MTR', unitText: 'metros' }] : []),
    ...(playa.anchura     ? [{ '@type': 'PropertyValue', name: 'Anchura',     value: playa.anchura,  unitCode: 'MTR', unitText: 'metros' }]  : []),
    ...(playa.composicion ? [{ '@type': 'PropertyValue', name: 'Composición', value: playa.composicion }] : []),
    ...(playa.tipo        ? [{ '@type': 'PropertyValue', name: 'Tipo',        value: playa.tipo }] : []),
    ...(calidadNivel      ? [{ '@type': 'PropertyValue', name: 'Calidad del agua (EEA)', value: calidadNivel }] : []),
    // Condiciones actuales como propiedades del Beach
    { '@type': 'PropertyValue', name: 'Temperatura del agua', value: agua, unitCode: 'CEL', unitText: '°C' },
    { '@type': 'PropertyValue', name: 'Altura del oleaje',    value: olas, unitCode: 'MTR', unitText: 'metros' },
    ...(viento != null   ? [{ '@type': 'PropertyValue', name: 'Velocidad del viento', value: viento,   unitCode: 'KMH', unitText: 'km/h' }] : []),
    ...(uv != null       ? [{ '@type': 'PropertyValue', name: 'Índice UV',            value: uv }] : []),
    ...(tempAire != null ? [{ '@type': 'PropertyValue', name: 'Temperatura del aire', value: tempAire, unitCode: 'CEL', unitText: '°C' }] : []),
  ]

  // Cadena de pertenencia administrativa (isPartOf)
  // municipio → provincia → comunidad → España
  const isPartOfChain = {
    '@type': 'AdministrativeArea',
    name:    playa.municipio,
    url:     `${BASE}/municipio/${slugify(playa.municipio)}`,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name:    playa.provincia,
      url:     `${BASE}/provincia/${slugify(playa.provincia)}`,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name:    playa.comunidad,
        url:     `${BASE}/comunidad/${slugify(playa.comunidad)}`,
        containedInPlace: {
          '@type': 'Country',
          name:    'España',
          identifier: 'ES',
        },
      },
    },
  }

  // BreadcrumbList. Inicio › Comunidad › Provincia › Municipio › Playa
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio',          item: BASE },
      { '@type': 'ListItem', position: 2, name: playa.comunidad,   item: `${BASE}/comunidad/${slugify(playa.comunidad)}` },
      { '@type': 'ListItem', position: 3, name: playa.provincia,   item: `${BASE}/provincia/${slugify(playa.provincia)}` },
      { '@type': 'ListItem', position: 4, name: playa.municipio,   item: `${BASE}/municipio/${slugify(playa.municipio)}` },
      { '@type': 'ListItem', position: 5, name: playa.nombre,      item: url },
    ],
  }

  // Photo. declara la imagen principal con autoría (importante para citaciones)
  const photoEntity = fotoUrl ? {
    '@type':       'ImageObject',
    url:           fotoUrl,
    contentUrl:    fotoUrl,
    ...(fotoAutor ? {
      creator: { '@type': 'Person', name: fotoAutor },
      copyrightHolder: { '@type': 'Person', name: fotoAutor },
    } : {}),
  } : null

  // Beach principal. Beach + TouristDestination (entidades híbridas)
  const beach = {
    '@context': 'https://schema.org',
    '@type':    ['Beach', 'TouristDestination', 'TouristAttraction'],
    '@id':      `${url}#beach`,
    identifier: playa.slug,
    name:        playa.nombre,
    alternateName: [
      `Playa de ${playa.nombre}`,
      `${playa.nombre} (${playa.municipio})`,
    ],
    description: textoSEO,
    url,
    mainEntityOfPage: url,
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   playa.lat,
      longitude:  playa.lng,
      addressCountry: 'ES',
    },
    hasMap: `https://www.google.com/maps?q=${playa.lat},${playa.lng}`,
    address: {
      '@type':          'PostalAddress',
      addressLocality:  playa.municipio,
      addressRegion:    playa.provincia,
      addressCountry:   'ES',
    },
    containedInPlace: isPartOfChain,
    isPartOf:         isPartOfChain,
    additionalProperty,
    amenityFeature,
    touristType: [
      'Playa', 'Baño', 'Turismo de sol y playa', 'Familia',
      ...(actividades.length > 0 ? ['Deportes acuáticos'] : []),
      ...(playa.nudista ? ['Naturismo'] : []),
      ...(playa.bandera ? ['Turismo de calidad'] : []),
    ],
    audience: [
      { '@type': 'PeopleAudience', audienceType: 'Bañistas' },
      ...(actividades.includes('Surf') ? [{ '@type': 'PeopleAudience', audienceType: 'Surfistas' }] : []),
      ...(playa.accesible ? [{ '@type': 'PeopleAudience', audienceType: 'Personas con movilidad reducida' }] : []),
      ...(playa.perros    ? [{ '@type': 'PeopleAudience', audienceType: 'Familias con perros' }] : []),
    ],
    isAccessibleForFree: true,
    publicAccess:        true,
    smokingAllowed:      false,
    // Acción "cómo llegar". Google la usa para Discover y assistant
    potentialAction: {
      '@type': 'TravelAction',
      target:  `https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}`,
      name:    `Cómo llegar a ${playa.nombre}`,
    },
    // Foto principal con autoría
    ...(photoEntity ? { image: photoEntity, photo: photoEntity } : {}),
    // Aggregate rating de los usuarios (votos)
    ...(rating && rating.ratingCount > 0 ? {
      aggregateRating: {
        '@type':     'AggregateRating',
        ratingValue: rating.ratingValue,
        ratingCount: rating.ratingCount,
        bestRating:  5,
        worstRating: 1,
      },
    } : {}),
    datePublished: '2026-03-09',
    ...(dateModified ? { dateModified } : {}),
  }

  // WaterBodyForSwimming. entidad separada para el cuerpo de agua,
  // con temperatura y oleaje. Permite a Google entender "agua de baño".
  const waterBody = {
    '@context': 'https://schema.org',
    '@type':    'WaterBodyForSwimming',
    '@id':      `${url}#water`,
    name:       `Aguas de ${playa.nombre}`,
    isPartOf:   { '@id': `${url}#beach` },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Temperatura', value: agua, unitCode: 'CEL', unitText: '°C' },
      { '@type': 'PropertyValue', name: 'Altura del oleaje', value: olas, unitCode: 'MTR', unitText: 'metros' },
      ...(calidadNivel ? [{ '@type': 'PropertyValue', name: 'Calidad EEA', value: calidadNivel }] : []),
    ],
  }

  // FAQPage: solo se emite si la página va a renderizar el mismo array
  // visible en el HTML. Así evitamos el "Duplicate FAQ" de Search Console.
  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type':          'Question',
      name:             f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(beach) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(waterBody) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
