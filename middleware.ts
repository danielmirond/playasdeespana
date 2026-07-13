// middleware.ts (raíz del proyecto) — ÚNICO middleware activo.
// Hace dos cosas: (1) 410 Gone para fichas de playa extranjeras/sin costa
// (dataset OSM con coords fuera de España o provincia interior), y
// (2) redirecciones de locale ES↔EN.
//
// IMPORTANTE: con `src/app`, Next usa el middleware de la RAÍZ. Antes había
// también un src/middleware.ts (410) que NUNCA se compilaba → el 410 no
// funcionaba. Se ha fusionado aquí y eliminado el duplicado.
import { NextRequest, NextResponse } from 'next/server'
import EXTRANJERAS_ARR from './src/data/slugs-extranjeras.json'
import DUPLICADOS_MAP from './src/data/duplicados.json'

const SUPPORTED_LOCALES = ['en']
const DEFAULT_LOCALE    = 'es'

// Slugs de "playas" fuera del ámbito (extranjeras/interiores). Generado por
// scripts/extract-extranjeras.mjs. Se sirve 410 (purga de índice más rápida
// que 404) y se dejan de enlazar (getPlayas las filtra).
const EXTRANJERAS = new Set(EXTRANJERAS_ARR as string[])

// Fichas duplicadas (misma playa importada 2-4 veces, <0.8 km). Se hace 301 a
// la ficha canónica para consolidar señales y quitar la autocanibalización.
// Generado por scripts/build-duplicados.mjs (analiza public/data/playas.json).
const DUPLICADOS = DUPLICADOS_MAP as Record<string, string>

const GONE_HTML =
  '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 Gone</title></head><body style="font-family:Georgia,serif;text-align:center;padding:4rem 2rem;color:#2a1a08;background:#f5ecd5"><h1>410 · Contenido retirado</h1><p>Esta ficha ya no pertenece al ámbito de Playas de España y se ha retirado del catálogo.</p><p><a href="/" style="color:#6b400a">Ir a Playas de España</a></p></body></html>'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 410 Gone para la vertical retirada /yoga-playa (auditoría jul-2026):
  // plantilla por provincia sin ningún dato real detrás (perfil doorway).
  if (pathname === '/yoga-playa' || pathname.startsWith('/yoga-playa/')) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  }

  // 0) 410 Gone para fichas extranjeras/sin costa (ES e EN).
  const mFicha = pathname.match(/^\/(playas|en\/beaches)\/([^/?#]+)/)
  if (mFicha) {
    const slug = decodeURIComponent(mFicha[2])
    if (EXTRANJERAS.has(slug)) {
      return new NextResponse(GONE_HTML, {
        status: 410,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
      })
    }
    // 0bis) 301 de ficha duplicada → canónica (misma playa duplicada en dataset).
    const canon = DUPLICADOS[slug]
    if (canon) {
      const url = req.nextUrl.clone()
      url.pathname = `/${mFicha[1]}/${canon}`
      return NextResponse.redirect(url, { status: 301 })
    }
  }

  // Redirigir /en/playas/[slug] → /en/beaches/[slug]
  if (pathname.startsWith('/en/playas/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace('/en/playas/', '/en/beaches/')
    return NextResponse.redirect(url, { status: 301 })
  }

  // Redirigir /en/comunidad/[slug] → /en/communities/[slug]
  if (pathname.startsWith('/en/comunidad/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace('/en/comunidad/', '/en/communities/')
    return NextResponse.redirect(url, { status: 301 })
  }

  // Redirigir /en/provincia/[slug] → /en/provinces/[slug]
  if (pathname.startsWith('/en/provincia/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace('/en/provincia/', '/en/provinces/')
    return NextResponse.redirect(url, { status: 301 })
  }

  // Redirigir /en/municipio/[slug] → /en/towns/[slug]
  if (pathname.startsWith('/en/municipio/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace('/en/municipio/', '/en/towns/')
    return NextResponse.redirect(url, { status: 301 })
  }

  // No redirigir rutas ya localizadas, API, archivos estáticos, ni rutas ES-only
  if (
    pathname.startsWith('/en') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/alquiler-barco') ||
    pathname.includes('.')
  ) return NextResponse.next()

  // Leer Accept-Language
  const acceptLang = req.headers.get('accept-language') ?? ''
  const preferred  = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase()

  // Solo redirigir si el idioma preferido es inglés y no han elegido ES
  const localeCookie = req.cookies.get('locale')?.value
  if (localeCookie === DEFAULT_LOCALE) return NextResponse.next()

  if (preferred === 'en' && SUPPORTED_LOCALES.includes('en')) {
    const url = req.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon|og-default|data|.*\\..*).*)'],
}
