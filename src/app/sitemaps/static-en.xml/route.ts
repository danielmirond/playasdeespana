import { NextResponse } from 'next/server'
import { getComunidades, getProvincias, getMunicipios } from '@/lib/playas'

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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
