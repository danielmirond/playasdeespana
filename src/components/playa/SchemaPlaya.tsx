// src/components/playa/SchemaPlaya.tsx
// JSON-LD structured data para Google — Beach + TouristAttraction +
// BreadcrumbList + FAQPage (opcional).
//
// El FAQPage solo se emite si la página pasa las mismas preguntas que
// renderiza visiblemente en el HTML (ver FichaBody → FaqSection). La
// fuente de verdad es `generarFaqsPlaya()` en src/lib/faqsPlaya.ts; de
// esa forma el schema SIEMPRE refleja el HTML y Google no reporta
// "Duplicate FAQ" por mismatch entre JSON-LD y visible content.
import type { Playa } from '@/types'
import { generarTextoPlaya } from '@/lib/textoPlaya'
import type { FaqItem } from '@/lib/faqsPlaya'

interface Props {
  playa:         Playa
  agua:          number
  olas:          number
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

export default function SchemaPlaya({ playa, agua, olas, dateModified, faqs }: Props) {
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
    datePublished:       '2026-03-09',
    ...(dateModified ? { dateModified } : {}),
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
