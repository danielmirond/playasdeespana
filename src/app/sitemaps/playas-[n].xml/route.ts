// src/app/sitemaps/playas-[n].xml/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { getPlayas } from '@/lib/playas'

export const revalidate = 86400
const BASE  = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playasdeespana.es'
const CHUNK = 1000

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ 'n.xml': string }> }
) {
  const raw = await params; const raw = await params; const n   = parseInt(raw?.replace('.xml', ''), 10)
  if (!n || n < 1) return new NextResponse('Not found', { status: 404 })

  const playas = await getPlayas()
  const slice  = playas.slice((n - 1) * CHUNK, n * CHUNK)
  if (!slice.length) return new NextResponse('Not found', { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  const urls = slice.map(p => `  <url>
    <loc>${BASE}/playas/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${p.bandera ? '0.9' : '0.7'}</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
