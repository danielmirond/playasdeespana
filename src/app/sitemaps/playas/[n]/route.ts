// src/app/sitemaps/playas/[n]/route.ts
// Sitemap por chunks de 1000 fichas. Incluye:
//   - <xhtml:link hreflang> para alternate ES/EN
//   - <image:image> con la OG image dinámica (Google Imágenes / image sitemap)
//   - lastmod = mtime real del dataset MITECO (no `new Date()` por build,
//     que Google detecta como timestamp spam — Content Warehouse leak).

import { NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'
import { getPlayasDataModified } from '@/lib/dateModified'

export const revalidate = 86400
const BASE  = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CHUNK = 1000

// Escapa caracteres XML inválidos en URL params (& en query strings).
function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export async function GET(_req: Request, context: any) {
  const { n: nStr } = await context.params
  const n = parseInt(nStr, 10)
  if (!n || n < 1) return new NextResponse('Not found', { status: 404 })

  const playas = await getPlayas()
  const slice  = playas.slice((n - 1) * CHUNK, n * CHUNK)
  if (!slice.length) return new NextResponse('Not found', { status: 404 })

  // mtime real del dataset (no fecha de build, que Google detecta como spam).
  const lastmod = getPlayasDataModified().split('T')[0]

  const urls = slice.map((p: any) => {
    // OG image dinámica generada en /api/og?slug=X. Siempre devuelve algo.
    const ogUrl = `${BASE}/api/og?slug=${encodeURIComponent(p.slug)}`
    const titulo = xmlEscape(`Playa ${p.nombre} (${p.municipio}, ${p.provincia})`)
    const caption = xmlEscape(
      `Estado del mar, oleaje y servicios en la playa ${p.nombre} en ${p.municipio} (${p.provincia}). Datos oficiales MITECO.`
    )

    return `  <url>
    <loc>${BASE}/playas/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${p.bandera ? '0.9' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/playas/${p.slug}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/beaches/${p.slug}"/>
    <image:image>
      <image:loc>${xmlEscape(ogUrl)}</image:loc>
      <image:title>${titulo}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
