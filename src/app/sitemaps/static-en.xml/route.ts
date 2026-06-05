import { NextResponse } from 'next/server'
import { getComunidades, getProvincias, getMunicipios } from '@/lib/playas'
import { getAllArticlesEn, CATEGORIES } from '@/lib/magazine'
import { getCamperCitiesEn } from '@/lib/autocaravana-localities'

export const revalidate = 604800
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export async function GET() {
  const [comunidades, provincias, municipios] = await Promise.all([
    getComunidades(),
    getProvincias(),
    getMunicipios(),
  ])
  const today = new Date().toISOString().split('T')[0]

  const urls: string[] = []

  // EN static pages
  const estaticas = [
    { url: '/en',                priority: '1.0', freq: 'daily' },
    { url: '/en/search',         priority: '0.8', freq: 'weekly' },
    { url: '/en/communities',    priority: '0.8', freq: 'weekly' },
    { url: '/en/blue-flag',      priority: '0.8', freq: 'weekly' },
  ]
  for (const p of estaticas) {
    urls.push(`  <url>
    <loc>${BASE}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
  }

  // EN communities
  for (const c of comunidades) {
    urls.push(`  <url>
    <loc>${BASE}/en/communities/${c.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  // EN provinces
  for (const p of provincias) {
    urls.push(`  <url>
    <loc>${BASE}/en/provinces/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  }

  // EN towns (municipios with >3 beaches)
  for (const m of municipios) {
    urls.push(`  <url>
    <loc>${BASE}/en/towns/${m.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
  }

  // EN commercial hubs
  for (const p of ['/en/campervan-rental', '/en/yacht-rental', '/en/catamaran-rental']) {
    urls.push(`  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  }
  // EN campervan city pages (translated only)
  for (const c of getCamperCitiesEn()) {
    urls.push(`  <url>
    <loc>${BASE}/en/campervan-rental/${c.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
  }

  // EN content pillars
  for (const p of ['/en/islands', '/en/crystal-clear-water-beaches']) {
    urls.push(`  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  }

  // EN Magazine — índice, categorías y artículos traducidos
  const mag: Array<{ url: string; priority: string; freq: string }> = [
    { url: '/en/magazine', priority: '0.7', freq: 'weekly' },
    ...Object.keys(CATEGORIES).map((c) => ({ url: `/en/magazine/category/${c}`, priority: '0.6', freq: 'weekly' })),
    ...getAllArticlesEn().map((a) => ({ url: `/en/magazine/${a.slug}`, priority: '0.6', freq: 'monthly' })),
  ]
  for (const p of mag) {
    urls.push(`  <url>
    <loc>${BASE}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
