// src/lib/seo/boat-rental-schema.ts
// Structured data (schema.org) for boat rental pages
// Implements: LocalBusiness, FAQPage, Article, BreadcrumbList, TouristAttraction

import type { BoatRentalLocality } from '@/lib/boat-rental-localities'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://playas-espana.com'

/**
 * LocalBusiness schema for locality pages
 * Tells Google: this is a business location offering boat rentals
 */
export function generateLocalBusinessSchema(locality: BoatRentalLocality, locality_slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/alquiler-barco/costas/${locality.coast.toLowerCase().replace(/\s+/g, '-')}/provincias/${locality.province.toLowerCase()}/`,
    name: `Alquiler de Barcos en ${locality.locality}`,
    description: locality.description,
    url: `${BASE_URL}/alquiler-barco/costas/${locality.coast.toLowerCase().replace(/\s+/g, '-')}/provincias/${locality.province.toLowerCase()}/${locality_slug}`,
    areaServed: [
      {
        '@type': 'Place',
        name: locality.coast
      },
      {
        '@type': 'Place',
        name: locality.province
      }
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Barco pequeño (< 5.5m)',
        description: 'Barco sin patrón para navegantes experimentados',
        priceCurrency: 'EUR',
        price: `${locality.pricing.small.min}-${locality.pricing.small.max}`,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
        url: `${BASE_URL}/alquiler-barco`
      },
      {
        '@type': 'Offer',
        name: 'Barco mediano (5.5-8m)',
        priceCurrency: 'EUR',
        price: `${locality.pricing.medium.min}-${locality.pricing.medium.max}`,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Con patrón profesional',
        priceCurrency: 'EUR',
        price: `${locality.pricing.captain.min}-${locality.pricing.captain.max}`,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock'
      }
    ],
    image: locality.images.hero.unsplashUrl,
    priceRange: `€${locality.pricing.small.min}-${locality.pricing.captain.max}`
  }
}

/**
 * FAQPage schema for FAQ sections
 * Targets featured snippets in Google
 */
export function generateFAQSchema(faqItems: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}

/**
 * Article schema for blog/guide pages
 * Use for master guides like "Cómo alquilar un barco en España"
 */
export function generateArticleSchema(params: {
  headline: string
  description: string
  author?: string
  datePublished?: string
  dateModified?: string
  imageUrl?: string
  articleBody?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${BASE_URL}#article`,
    headline: params.headline,
    description: params.description,
    image: params.imageUrl || `${BASE_URL}/og-default.png`,
    datePublished: params.datePublished || new Date().toISOString(),
    dateModified: params.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: params.author || 'Playas de España',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'Playas de España',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`
      }
    }
  }
}

/**
 * BreadcrumbList schema
 * Helps Google understand site structure
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  }
}

/**
 * TouristAttraction schema for beaches/moorings
 * Links beaches as attractions near boat rental locations
 */
export function generateTouristAttractionSchema(beach: {
  name: string
  description: string
  locality: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: beach.name,
    description: beach.description,
    areaServed: beach.locality,
    nearbyServices: {
      '@type': 'Service',
      name: 'Boat Rental',
      url: `${BASE_URL}/alquiler-barco`
    }
  }
}

/**
 * AggregateOffer schema for comparing pricing
 * Use for pages showing multiple boat options
 */
export function generateAggregateOfferSchema(locality: BoatRentalLocality) {
  const offers = [
    locality.pricing.small,
    locality.pricing.medium,
    locality.pricing.captain
  ]

  const prices = offers.flatMap(o => [o.min, o.max])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: minPrice.toString(),
    highPrice: maxPrice.toString(),
    offerCount: 3,
    offers: [
      {
        '@type': 'Offer',
        name: 'Small Boat (<5.5m)',
        price: `${locality.pricing.small.min}-${locality.pricing.small.max}`
      },
      {
        '@type': 'Offer',
        name: 'Medium Boat (5.5-8m)',
        price: `${locality.pricing.medium.min}-${locality.pricing.medium.max}`
      },
      {
        '@type': 'Offer',
        name: 'With Captain',
        price: `${locality.pricing.captain.min}-${locality.pricing.captain.max}`
      }
    ]
  }
}

/**
 * Organization schema for homepage
 * Establishes brand authority
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Playas de España',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Guía completa de playas, fondeos y alquiler de barcos en España',
    sameAs: [
      'https://www.instagram.com/playasdeespana',
      'https://twitter.com/playasdeespana'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34-XXX-XXXXXX',
      contactType: 'Customer Service'
    }
  }
}
