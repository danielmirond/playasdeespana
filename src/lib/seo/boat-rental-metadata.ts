// src/lib/seo/boat-rental-metadata.ts
// SEO Metadata templates for boat rental pages
// Implements keyword strategy with dynamic locality/coast/province data

export interface MetadataParams {
  type: 'hub' | 'coast' | 'province' | 'locality'
  locality?: string
  coast?: string
  province?: string
  localityCount?: number  // for coast pages
  mooringCount?: number
  priceMin?: number
  priceMax?: number
  googleTrendsVolume?: number
}

export function generateBoatRentalTitle(params: MetadataParams): string {
  switch (params.type) {
    case 'hub':
      return 'Alquila Barcos en España | Fondeos Seguro + Precios | Playas de España'

    case 'coast':
      return `Alquiler de Barcos en ${params.coast} | Fondeos + ${params.localityCount} Localidades`

    case 'province':
      return `Alquiler de Barcos en ${params.province} | Fondeos Seguros + Precios`

    case 'locality':
      return `Alquila Barco en ${params.locality} | ${params.coast} | Fondeos Seguros & Accesibles`

    default:
      return 'Alquiler de Barcos en España'
  }
}

export function generateBoatRentalDescription(params: MetadataParams): string {
  switch (params.type) {
    case 'hub':
      return 'Alquiler de barcos, yates y catamaranes en 50+ costas españolas. Fondeos seguros, playas hermosas, comparativa de precios. Reserva en SamBoat, Nautal, ClickBoat. Desde €100/día.'

    case 'coast':
      return `Alquila barcos en ${params.coast}: ${params.localityCount} localidades, ${params.mooringCount} fondeos recomendados. Playas accesibles en barco. Precios desde €${params.priceMin}/día. Reserva directo.`

    case 'province':
      return `Alquiler de barcos en ${params.province}. Playas accesibles solo por mar, fondeos protegidos, playas hermosas. Precios competitivos. Navega con SamBoat, Nautal o ClickBoat.`

    case 'locality':
      return `Alquila barco en ${params.locality}, ${params.coast}. ${params.mooringCount} fondeos seguros, ${params.localityCount} calas accesibles en barco. Precios desde €${params.priceMin}/día. Reserva con patrón o sin patrón.`

    default:
      return ''
  }
}

export function generateOGImage(params: MetadataParams): string {
  const label = params.type === 'locality'
    ? `Alquila Barco en ${params.locality}`
    : params.type === 'coast'
    ? `Fondeos: ${params.coast}`
    : params.type === 'hub'
    ? 'Alquiler de Barcos España'
    : 'Playas de España'

  return `/api/og?playa=${encodeURIComponent(label)}`
}

// Alternates for bilingual pages
export function generateAlternates(params: MetadataParams) {
  const base = 'https://playas-espana.com'

  let esPath = ''
  let enPath = ''

  if (params.type === 'hub') {
    esPath = '/alquiler-barco'
    enPath = '/en/boat-rental'
  } else if (params.type === 'coast') {
    const coastSlug = params.coast?.toLowerCase().replace(/\s+/g, '-')
    esPath = `/alquiler-barco/costas/${coastSlug}`
    enPath = `/en/boat-rental/coasts/${coastSlug}`
  } else if (params.type === 'province') {
    const provinceSlug = params.province?.toLowerCase().replace(/\s+/g, '-')
    esPath = `/alquiler-barco/provincia/${provinceSlug}`
    enPath = `/en/boat-rental/province/${provinceSlug}`
  } else if (params.type === 'locality') {
    const localitySlug = params.locality?.toLowerCase().replace(/\s+/g, '-')
    const coastSlug = params.coast?.toLowerCase().replace(/\s+/g, '-')
    const provinceSlug = params.province?.toLowerCase().replace(/\s+/g, '-')
    esPath = `/alquiler-barco/costas/${coastSlug}/provincias/${provinceSlug}/${localitySlug}`
    enPath = `/en/boat-rental/coasts/${coastSlug}/provinces/${provinceSlug}/${localitySlug}`
  }

  return {
    canonical: `${base}${esPath}`,
    alternates: {
      languages: {
        es: `${base}${esPath}`,
        en: `${base}${enPath}`,
        'x-default': `${base}${enPath}`
      }
    }
  }
}
