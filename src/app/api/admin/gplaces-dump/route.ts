// src/app/api/admin/gplaces-dump/route.ts — SOLO LECTURA de la caché KV de
// Google Places para la cosecha de emergencia (jul-2026, cargo de 231 €).
// Devuelve lo que haya en caché para unas coordenadas SIN computar nada:
// ni Google (key retirada) ni Overpass. Cero coste, cero efectos.
//
// GET /api/admin/gplaces-dump?lat=..&lng=..
// → { restaurantes, hoteles, buceo, escuelas } (null donde no hay caché)
// Auth: mismo patrón que el resto de /api/admin (Bearer CRON_SECRET si existe).
import { NextRequest, NextResponse } from 'next/server'
import { kvPeek } from '@/lib/kv-cache'
import { parseCoords } from '@/lib/validation'
import type { GPlace } from '@/lib/google-places'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = req.headers.get('authorization')
    const isLocal = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
    if (authHeader !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))
  if (!coords) return NextResponse.json({ error: 'lat/lng requeridos' }, { status: 400 })

  const la = coords.lat.toFixed(4), lo = coords.lon.toFixed(4)
  const [restaurantes, hoteles, buceoNuevo, buceoLegacy, escuelas] = await Promise.all([
    kvPeek<GPlace[] | null>('gplaces-v1', ['restaurant', la, lo]),
    kvPeek<GPlace[] | null>('gplaces-v1', ['lodging', la, lo]),
    kvPeek<GPlace[] | null>('gplaces-txt-v1', ['centro-de-buceo-inmersiones', la, lo]),
    // Query usada los primeros días (antes del gating del 23-jul): la mayor
    // parte de la caché pagada de buceo vive bajo esta clave.
    kvPeek<GPlace[] | null>('gplaces-txt-v1', ['centro-de-buceo', la, lo]),
    kvPeek<GPlace[] | null>('gplaces-txt-v1', ['escuela-de-surf-kitesurf-paddle', la, lo]),
  ])
  const buceo = buceoNuevo ?? buceoLegacy

  return NextResponse.json({ restaurantes, hoteles, buceo, escuelas })
}
