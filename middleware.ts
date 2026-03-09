// middleware.ts (raíz del proyecto)
import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LOCALES = ['en']
const DEFAULT_LOCALE    = 'es'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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
