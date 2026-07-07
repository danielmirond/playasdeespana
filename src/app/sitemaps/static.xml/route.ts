// src/app/sitemaps/static.xml/route.ts
// Sitemap completo con TODAS las secciones del site.
//
// Cada URL emite <image:image> apuntando a la OG dinámica /api/og?playa=X
// (Content Warehouse: imageQualityClickSignals — Google Imágenes asocia
// una imagen representativa a cada URL del KG).

import { NextResponse } from 'next/server'
import {
  getComunidades, getProvincias, getMunicipios,
  getPlayas, getPerrosStats, getNudistasStats, getAccesiblesStats,
} from '@/lib/playas'
import { getRutas, COSTAS } from '@/lib/rutas'
import { getCamperCities } from '@/lib/autocaravana-localities'
import { getAllLocalities } from '@/lib/boat-rental-localities'
import { boatRentalSlug } from '@/lib/boat-rental-helpers'
import { getAllArticles, CATEGORIES } from '@/lib/magazine'
import { TIPOS } from '@/lib/tiposQueLlevar'
import { getPlayasDataModified } from '@/lib/dateModified'

export const revalidate = 604800
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/** Devuelve URL absoluta a la OG dinámica con el título dado. */
function ogFor(label: string): string {
  return `${BASE}/api/og?playa=${encodeURIComponent(label)}`
}

interface UrlOpts {
  hreflangEn?: string
  /** Etiqueta humana para la OG image. Si se omite, deriva del path. */
  ogLabel?:    string
  /** Caption para image:caption */
  caption?:    string
}

function u(path: string, priority: string, freq: string, today: string, opts: UrlOpts | string = {}) {
  // Backwards-compat: si el 5º arg es un string, lo tratamos como hreflangEn.
  const o: UrlOpts = typeof opts === 'string' ? { hreflangEn: opts } : opts
  const derived = path.replace(/^\//, '').replace(/-/g, ' ').replace(/\//g, ' · ') || 'Playas de España'
  const ogLabel = o.ogLabel ?? derived
  const caption = o.caption ?? `Información de ${ogLabel} en Playas de España`

  let xml = `  <url>
    <loc>${BASE}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>`
  if (o.hreflangEn) {
    xml += `
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}${path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${o.hreflangEn}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${o.hreflangEn}" />`
  }
  xml += `
    <image:image>
      <image:loc>${xmlEscape(ogFor(ogLabel))}</image:loc>
      <image:title>${xmlEscape(ogLabel)}</image:title>
      <image:caption>${xmlEscape(caption)}</image:caption>
    </image:image>
  </url>`
  return xml
}

export async function GET() {
  const [comunidades, provincias, municipios, playas] = await Promise.all([
    getComunidades(), getProvincias(), getMunicipios(), getPlayas(),
  ])
  const [perrosStats, nudistasStats, accesiblesStats, rutas] = await Promise.all([
    getPerrosStats(), getNudistasStats(), getAccesiblesStats(), getRutas(playas),
  ])
  // lastmod real del dataset (no fecha de build).
  const today = getPlayasDataModified().split('T')[0]
  const urls: string[] = []

  // Static pages (ES + EN)
  const pages = [
    { es: '/',                       en: '/en',                    p: '1.0', f: 'daily' },
    { es: '/playas-cerca-de-mi',     en: null,                     p: '0.9', f: 'weekly' },
    { es: '/playas-sin-viento',      en: null,                     p: '0.8', f: 'daily' },
    { es: '/prediccion-fin-de-semana', en: null,                   p: '0.8', f: 'daily' },
    { es: '/mapa',                   en: null,                     p: '0.9', f: 'daily' },
    { es: '/buscar',                 en: '/en/search',             p: '0.8', f: 'weekly' },
    { es: '/comunidades',            en: null,                     p: '0.8', f: 'weekly' },
    { es: '/banderas-azules',        en: '/en/blue-flag',          p: '0.8', f: 'weekly' },
    { es: '/playas-perros',          en: '/en/dog-beaches',        p: '0.7', f: 'weekly' },
    { es: '/playas-nudistas',        en: '/en/nudist-beaches',     p: '0.7', f: 'weekly' },
    { es: '/playas-accesibles',      en: '/en/accessible-beaches', p: '0.7', f: 'weekly' },
    { es: '/atardeceres',            en: '/en/sunsets',            p: '0.7', f: 'weekly' },
    { es: '/surf',                   en: '/en/surf',               p: '0.8', f: 'daily' },
    { es: '/top',                    en: '/en/top',                p: '0.8', f: 'weekly' },
    { es: '/rutas',                  en: '/en/routes',             p: '0.8', f: 'weekly' },
    { es: '/rutas/configurar',       en: '/en/routes/configure',   p: '0.7', f: 'weekly' },
    // Pillar pages — hubs temáticos y comerciales
    { es: '/campings',               en: null,                     p: '0.7', f: 'weekly' },
    { es: '/buceo',                  en: null,                     p: '0.7', f: 'weekly' },
    { es: '/playas-autocaravana',    en: null,                     p: '0.7', f: 'weekly' },
    { es: '/playas-aguas-cristalinas', en: null,                   p: '0.7', f: 'weekly' },
    { es: '/playas-paradisiacas',    en: null,                   p: '0.7', f: 'weekly' },
    { es: '/calas-con-encanto',      en: null,                   p: '0.7', f: 'weekly' },
    { es: '/protectores-solares',    en: null,                     p: '0.6', f: 'monthly' },
    { es: '/seguros-viaje',          en: null,                     p: '0.6', f: 'monthly' },
    { es: '/alquiler-barco-playa',   en: null,                     p: '0.6', f: 'monthly' },
    { es: '/familias',               en: null,                     p: '0.6', f: 'weekly' },
    { es: '/playas-secretas',        en: null,                     p: '0.6', f: 'weekly' },
    { es: '/medusas',                en: null,                     p: '0.6', f: 'weekly' },
    { es: '/islas',                  en: null,                     p: '0.6', f: 'weekly' },
    { es: '/playa-del-dia',          en: null,                     p: '0.6', f: 'daily' },
    { es: '/comparar',               en: null,                     p: '0.6', f: 'weekly' },
    { es: '/calidad-agua',           en: null,                     p: '0.6', f: 'weekly' },
    { es: '/banderas-negras',        en: null,                     p: '0.7', f: 'weekly' },
    { es: '/banderas-hoy',           en: null,                     p: '0.7', f: 'hourly' },
    { es: '/temperatura-del-agua',   en: null,                     p: '0.7', f: 'hourly' },
    // EEAT + legal
    { es: '/widget',                  en: null,                     p: '0.5', f: 'monthly' },
    { es: '/metodologia',            en: null,                     p: '0.5', f: 'monthly' },
    { es: '/aviso-legal',            en: null,                     p: '0.3', f: 'yearly' },
    { es: '/privacidad',             en: null,                     p: '0.3', f: 'yearly' },
    { es: '/cookies',                en: null,                     p: '0.3', f: 'yearly' },
  ]
  for (const pg of pages) urls.push(u(pg.es, pg.p, pg.f, today, pg.en ?? undefined))

  // All beach pages
  for (const p of playas) {
    urls.push(u(`/playas/${p.slug}`, '0.7', 'daily', today, `/en/beaches/${p.slug}`))
  }

  // Comunidades / provincias / municipios
  for (const c of comunidades) urls.push(u(`/comunidad/${c.slug}`, '0.8', 'weekly', today, `/en/communities/${c.slug}`))
  for (const p of provincias) urls.push(u(`/provincia/${p.slug}`, '0.7', 'weekly', today, `/en/provinces/${p.slug}`))
  for (const m of municipios) urls.push(u(`/municipio/${m.slug}`, '0.6', 'weekly', today, `/en/towns/${m.slug}`))

  // Themed sections subpages
  for (const c of perrosStats.comunidades) urls.push(u(`/playas-perros/comunidad/${c.slug}`, '0.6', 'weekly', today))
  for (const p of perrosStats.provincias) urls.push(u(`/playas-perros/provincia/${p.slug}`, '0.6', 'weekly', today))
  for (const m of perrosStats.municipios) urls.push(u(`/playas-perros/municipio/${m.slug}`, '0.5', 'weekly', today))
  for (const c of nudistasStats.comunidades) urls.push(u(`/playas-nudistas/comunidad/${c.slug}`, '0.6', 'weekly', today))
  for (const p of nudistasStats.provincias) urls.push(u(`/playas-nudistas/provincia/${p.slug}`, '0.6', 'weekly', today))
  for (const c of accesiblesStats.comunidades) urls.push(u(`/playas-accesibles/comunidad/${c.slug}`, '0.6', 'weekly', today))
  for (const p of accesiblesStats.provincias) urls.push(u(`/playas-accesibles/provincia/${p.slug}`, '0.6', 'weekly', today))

  // Mejores playas por provincia
  for (const p of provincias) {
    urls.push(u(`/mejores-playas/${p.slug}`, '0.6', 'weekly', today))
  }

  // Topic × provincia pages (campings, buceo, clases-surf, etc.)
  const TOPIC_SLUGS = [
    'campings', 'buceo', 'clases-surf', 'kitesurf', 'windsurf',
    'hoteles-playa', 'chiringuitos', 'alquiler-barco', 'yoga-playa',
  ]
  const provSlugs = provincias.map(p => p.slug)
  for (const topic of TOPIC_SLUGS) {
    for (const pSlug of provSlugs) {
      urls.push(u(`/${topic}/${pSlug}`, '0.5', 'weekly', today))
    }
  }

  // Top 10 by coast
  for (const c of COSTAS) urls.push(u(`/top/${c.slug}`, '0.7', 'weekly', today, `/en/top/${c.slug}`))

  // Guías "qué llevar" por tipo (editorial — sustituye a las páginas
  // por playa que generaban thin content)
  for (const t of TIPOS) urls.push(u(`/que-llevar/${t.slug}`, '0.6', 'monthly', today))

  // Routes
  for (const r of rutas) urls.push(u(`/rutas/${r.slug}`, '0.7', 'weekly', today, `/en/routes/${r.slug}`))

  // Alquiler de autocaravanas — hub + guías + ciudades/regiones
  for (const p of ['/alquiler-autocaravana', '/alquiler-autocaravana/precios', '/alquiler-autocaravana/tipos', '/alquiler-autocaravana/barata-ofertas', '/alquiler-autocaravana/caravana-vs-autocaravana-vs-camper']) {
    urls.push(u(p, '0.7', 'weekly', today))
  }
  for (const c of getCamperCities()) urls.push(u(`/alquiler-autocaravana/${c.slug}`, '0.6', 'weekly', today))

  // Alquiler de barcos — jerarquía canónica costa → provincia → localidad.
  // (Antes el sitemap solo listaba el hub plano; las páginas ricas /costas/**
  // no se enviaban a Google. Se generan desde el dataset → escalan solas.)
  {
    const boatLocs = getAllLocalities()
    const coasts = new Set<string>()
    const provinces = new Set<string>() // "coastSlug/provinceSlug"
    for (const l of boatLocs) {
      const cs = boatRentalSlug(l.coast)
      const ps = boatRentalSlug(l.province)
      coasts.add(cs)
      provinces.add(`${cs}/${ps}`)
      urls.push(u(`/alquiler-barco/costas/${cs}/provincias/${ps}/${l.slug}`, '0.7', 'weekly', today))
    }
    for (const cs of coasts) urls.push(u(`/alquiler-barco/costas/${cs}`, '0.7', 'weekly', today))
    for (const cp of provinces) urls.push(u(`/alquiler-barco/costas/${cp.split('/')[0]}/provincias/${cp.split('/')[1]}`, '0.6', 'weekly', today))
  }

  // Magazine — índice, categorías y artículos
  urls.push(u('/magazine', '0.7', 'weekly', today))
  for (const c of Object.keys(CATEGORIES)) urls.push(u(`/magazine/categoria/${c}`, '0.6', 'weekly', today))
  for (const a of getAllArticles()) urls.push(u(`/magazine/${a.slug}`, '0.6', 'monthly', today))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
