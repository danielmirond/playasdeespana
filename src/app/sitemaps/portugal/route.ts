// src/app/sitemaps/portugal/route.ts
// Las 755 praias, sus concelhos y el índice. Un solo sitemap: caben de
// sobra en el límite de 50.000 y partirlo por chunks solo añadiría
// rutas que mantener.
//
// Sin lastmod, por el mismo motivo que el de playas: el dataset de la
// APA se regenera entero cada vez que se cosecha, así que la fecha
// sería común a las 755 y Google aprende a ignorarla.
//
// Van también las fluviales. Tienen nombre oficial, coordenadas y
// calidad de agua de la APA —el mismo mínimo con el que se decidió no
// desindexar las playas españolas sin inventario—, y son 29.
import { NextResponse } from 'next/server'
import { getPraias, getConcelhos } from '@/lib/praias'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

const xmlEscape = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const [praias, concelhos] = await Promise.all([getPraias(), getConcelhos()])

  const locs = [
    `${BASE}/portugal`,
    ...concelhos.map(c => `${BASE}/portugal/municipio/${c.slug}`),
    ...praias.map(p => `${BASE}/portugal/playas/${p.slug}`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map(l => `  <url><loc>${xmlEscape(l)}</loc></url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
