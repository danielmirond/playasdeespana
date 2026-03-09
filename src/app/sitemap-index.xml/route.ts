// src/app/sitemap-index.xml/route.ts
import { NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'

export const revalidate = 86400
const BASE  = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playasdeespana.es'
const CHUNK = 1000

export async function GET() {
  const playas    = await getPlayas()
  const numChunks = Math.ceil(playas.length / CHUNK)
  const today     = new Date().toISOString().split('T')[0]

  const entries: string[] = []

  entries.push(`  <sitemap>
    <loc>${BASE}/sitemaps/static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`)

  for (let i = 1; i <= numChunks; i++) {
    entries.push(`  <sitemap>
    <loc>${BASE}/sitemaps/playas/${i}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
