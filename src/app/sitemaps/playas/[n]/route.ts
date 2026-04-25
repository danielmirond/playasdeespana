import { NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'

export const revalidate = 86400
const BASE  = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CHUNK = 1000

export async function GET(_req: Request, context: any) {
  const { n: nStr } = await context.params
  const n = parseInt(nStr, 10)
  if (!n || n < 1) return new NextResponse('Not found', { status: 404 })

  const playas = await getPlayas()
  const slice  = playas.slice((n - 1) * CHUNK, n * CHUNK)
  if (!slice.length) return new NextResponse('Not found', { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  const urls = slice.map((p: any) => `  <url>
    <loc>${BASE}/playas/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${p.bandera ? '0.9' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/playas/${p.slug}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/beaches/${p.slug}"/>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
