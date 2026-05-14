// src/app/api/admin/fotos-refresh/route.ts
//
// Endpoint admin para purgar y refrescar fotos de una playa concreta
// cuando se detecte foto incorrecta (compartida con playa vecina,
// genérica indebida, etc.).
//
// Auth: Authorization: Bearer $CRON_SECRET (mismo header que los crons).
//
// Uso:
//   GET /api/admin/fotos-refresh?slug=kontxa-hondartza
//
// Respuesta:
//   {
//     "slug": "kontxa-hondartza",
//     "purged": ["fotos:slug:kontxa", "fotos:43.3192:-1.9826"],
//     "fotos": [...],   // resultado de la cascada en vivo (sin deadline)
//   }

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPlayaBySlug } from '@/lib/playas'
import { refetchAndStoreFotos } from '@/lib/fotos'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  // Auth idéntica a los crons de Vercel.
  const authHeader = req.headers.get('authorization')
  const expected   = process.env.CRON_SECRET
  const ok         = expected && authHeader === `Bearer ${expected}`
  const isLocal    = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
  if (!ok && !isLocal) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 })

  const playa = await getPlayaBySlug(slug)
  if (!playa) return NextResponse.json({ error: 'playa not found' }, { status: 404 })

  // Purgar entradas KV viejas para esta playa. Importamos kv inline
  // para no introducir dependencia dura en build (kv es opcional).
  const purged: string[] = []
  try {
    const mod = await (Function('return import("@vercel/kv")')() as Promise<{ kv: { del: (k: string) => Promise<number> } }>)
    const keys = [
      // Nueva clave (con nombre)
      `fotos:${(playa.nombre ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}:${playa.lat.toFixed(4)}:${playa.lng.toFixed(4)}`,
      // Clave legacy (solo coords)
      `fotos:${playa.lat.toFixed(4)}:${playa.lng.toFixed(4)}`,
    ]
    for (const k of keys) {
      try {
        await mod.kv.del(k)
        purged.push(k)
      } catch { /* ignore */ }
    }
  } catch {
    // KV no disponible: no rompe el refetch, solo no purgamos.
  }

  // Refetch sin deadline (refetchAndStoreFotos ya persiste el resultado).
  const fotos = await refetchAndStoreFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia)

  return NextResponse.json({
    slug,
    nombre: playa.nombre,
    purged,
    fotos: fotos.slice(0, 6),
    count: fotos.length,
  })
}
