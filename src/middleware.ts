// src/middleware.ts
//
// Responde 410 Gone para fichas de playa cuya provincia NO tiene
// costa (Badajoz, Zamora, Cuenca, Madrid, etc.). El dataset OSM
// las incluye como "playa" porque hay charcas, embalses o piscinas
// naturales etiquetadas como leisure=beach, pero no encajan en el
// ámbito de "Playas de España" (litoral). 410 le dice a Google
// "esto NO vuelve" — purga del índice mucho más rápido que 404
// (que reintenta semanas).
//
// Mantenemos el middleware ligero: solo lee el slug, consulta una
// lista pre-computada de slugs extranjeros (cached en memoria) y
// devuelve 410 si match. El resto pasa.

import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  // Solo afecta a fichas de playa. El resto del sitio sin tocar.
  matcher: ['/playas/:slug*', '/en/beaches/:slug*'],
}

// Slugs extranjeros pre-computados en build via script. Si no existe
// el JSON aún (primer despliegue), el middleware no rompe — solo no
// devuelve 410 hasta que el script se ejecute.
//
// El JSON se genera con: `node scripts/extract-extranjeras.mjs`
// y se commitea junto al middleware.
let SLUGS_EXTRANJERAS: Set<string> | null = null

async function loadExtranjeras(): Promise<Set<string>> {
  if (SLUGS_EXTRANJERAS) return SLUGS_EXTRANJERAS
  try {
    const mod = await import('./data/slugs-extranjeras.json')
    const arr: string[] = (mod as { default?: string[] }).default ?? (mod as unknown as string[])
    SLUGS_EXTRANJERAS = new Set(arr)
  } catch {
    SLUGS_EXTRANJERAS = new Set()
  }
  return SLUGS_EXTRANJERAS
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const m = path.match(/^\/(?:playas|en\/beaches)\/([^/?#]+)/)
  if (!m) return NextResponse.next()
  const slug = decodeURIComponent(m[1])

  const extranjeras = await loadExtranjeras()
  if (extranjeras.has(slug)) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>Esta playa ya no pertenece al ámbito de Playas de España (interior sin costa) y se ha retirado del catálogo.</p></body></html>`,
      {
        status: 410,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
        },
      },
    )
  }

  return NextResponse.next()
}
