// src/app/sitemaps/playas/[n]/route.ts
// Sitemap por chunks de 1000 fichas. Incluye:
//   - <xhtml:link hreflang> para alternate ES/EN
//   - <image:image> con la OG image dinámica (Google Imágenes / image sitemap)
//   - SIN lastmod, changefreq ni priority: ver el porqué más abajo.

import { NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'
import { esIndexable } from '@/lib/calidad-indexacion'

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

  // Filtramos a fichas indexables (score >= 40): elimina slugs basura
  // OSM, sin nombre propio, sin coords, y provincias sin costa. Lo
  // que cae aquí coincide con lo que page.tsx marca como noindex,
  // así que el sitemap y robots están coherentes.
  const todas = await getPlayas()
  const playas = todas.filter(esIndexable)
  const slice  = playas.slice((n - 1) * CHUNK, n * CHUNK)
  if (!slice.length) return new NextResponse('Not found', { status: 404 })

  // Sin lastmod, a propósito.
  //
  // Se emitía el mtime del dataset, que es honesto en intención pero
  // inútil como señal: sale la MISMA fecha en las 4.375 fichas, y cambia
  // de golpe en todas cada vez que se toca el JSON —una corrección de
  // una tilde ponía «modificado hoy» en el sitio entero—. Google ignora
  // el lastmod cuando comprueba que no se corresponde con cambios
  // reales, y a partir de ahí lo ignora también donde sí es cierto.
  //
  // Lo que de verdad cambia cada hora es el dato meteorológico, y eso no
  // es «modificación de contenido» a efectos de rastreo: si lo fuera,
  // habría que declarar 4.375 URLs modificadas cada hora, que es
  // justamente la señal que hace que dejen de creerte.
  //
  // Mientras no haya fecha de cambio POR FICHA, omitirlo es más honesto
  // que emitir una común. El magazine sí conserva su lastmod porque ahí
  // la fecha es real y por artículo.
  //
  // Fuera también changefreq y priority: Google lleva años diciendo que
  // no los usa, y `hourly` en 4.375 URLs solo repetía la promesa que el
  // lastmod ya estaba incumpliendo.

  const urls = slice.map((p: any) => {
    // OG image dinámica generada en /api/og?slug=X. Siempre devuelve algo.
    const ogUrl = `${BASE}/api/og?slug=${encodeURIComponent(p.slug)}`
    const titulo = xmlEscape(`Playa ${p.nombre} (${p.municipio}, ${p.provincia})`)
    const caption = xmlEscape(
      `Estado del mar, oleaje y servicios en la playa ${p.nombre} en ${p.municipio} (${p.provincia}). Datos oficiales MITECO.`
    )

    return `  <url>
    <loc>${BASE}/playas/${p.slug}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/playas/${p.slug}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/beaches/${p.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/playas/${p.slug}"/>
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
