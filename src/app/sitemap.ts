import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playasdeespana.es'
const PLAYAS_PER_SITEMAP = 1000  // Google soporta hasta 50.000, pero 1.000 es más manejable

export default function sitemap(): MetadataRoute.Sitemap {
  // El sitemap index se genera via sitemap.xml dinámico — este archivo
  // solo devuelve las URLs estáticas (home + comunidades) para el sitemap raíz.
  // Los sitemaps de playas se sirven desde /sitemaps/playas-[n].xml
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/#buscador`,    changeFrequency: 'monthly', priority: 0.5 },
  ]
}
