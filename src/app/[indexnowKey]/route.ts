// src/app/[indexnowKey]/route.ts
//
// Sirve el archivo de verificación de IndexNow. El protocolo requiere
// que /<KEY>.txt devuelva la KEY como texto plano para autenticar
// que somos los dueños del dominio.
//
// Atajo: como no podemos tener un archivo dinámico literal en /public,
// capturamos cualquier path de primer nivel que termine en .txt y, si
// el slug coincide con INDEXNOW_KEY, lo servimos. Cualquier otra cosa
// devuelve 404 (importante: NO interferir con otras rutas).

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ indexnowKey: string }> }) {
  const { indexnowKey } = await params
  const key = process.env.INDEXNOW_KEY

  // Solo respondemos al patrón <KEY>.txt
  if (!key || !indexnowKey.endsWith('.txt')) {
    return new NextResponse('Not found', { status: 404 })
  }
  const requested = indexnowKey.slice(0, -4)  // strip .txt
  if (requested !== key) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(key, {
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
