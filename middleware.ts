// middleware.ts (raíz del proyecto)
import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LOCALES = ['en']
const DEFAULT_LOCALE    = 'es'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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

  // No redirigir rutas ya localizadas, API, archivos estáticos
  if (
    pathname.startsWith('/en') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
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
