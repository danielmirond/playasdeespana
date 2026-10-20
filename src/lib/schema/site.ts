// src/lib/schema/site.ts — los dos grafos globales, en el idioma de la página.
//
// Vivían dentro de layout.tsx con `inLanguage: 'es-ES'` y el buscador
// apuntando a /buscar, y se servían igual en las 4.948 páginas inglesas:
// le decíamos a Google que una página en inglés está en español y que su
// buscador vive en una URL castellana.
import { AUTOR_PLAYAS_ESPANA } from '@/lib/autoria'
import { TOTAL_PUBLICADAS_TXT, TOTAL_PUBLICADAS_TXT_EN } from '@/lib/playas'
import { TOTAL_PRAIAS_COSTA_TXT } from '@/lib/praias'

export type Idioma = 'es' | 'en'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// Organization. No depende del idioma: es la misma entidad.
// Todos los schemas de la app referencian su @id (Beach.publisher,
// Article.author…) para que Google fusione las menciones en una sola
// entidad del Knowledge Graph.
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  ...AUTOR_PLAYAS_ESPANA,
}

/**
 * WebSite + SearchAction: activa el cuadro de búsqueda de Google bajo el
 * dominio en la SERP. El @id es el mismo en los dos idiomas a propósito:
 * es un solo sitio web, no dos.
 */
export function websiteSchema(locale: Idioma) {
  const es = locale === 'es'
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: es ? BASE_URL : `${BASE_URL}/en`,
    name: es ? 'Playas de España' : 'Beaches of Spain',
    alternateName: ['playas-espana.com', 'Playas España'],
    // La descripción del sitio va en el JSON-LD de TODAS las páginas,
    // también las de /portugal, así que nombra los dos países por el
    // mismo motivo que el pie: describir el sitio como guía de playas
    // españolas era falso en 755 de ellas.
    description: es
      ? `Estado del mar y guía de ${TOTAL_PUBLICADAS_TXT} playas de España y ${TOTAL_PRAIAS_COSTA_TXT} praias de Portugal. Oleaje y viento cada hora (Open-Meteo); inventarios del MITECO y la APA, y calidad del agua de la EEA, de actualización anual.`
      : `Sea conditions and guide for ${TOTAL_PUBLICADAS_TXT_EN} beaches in Spain and ${TOTAL_PRAIAS_COSTA_TXT} in Portugal. Waves and wind update hourly (Open-Meteo); the MITECO and APA inventories and EEA water quality are updated yearly.`,
    inLanguage: es ? 'es-ES' : 'en-GB',
    publisher: { '@id': AUTOR_PLAYAS_ESPANA['@id'] },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}${es ? '/buscar' : '/en/search'}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
