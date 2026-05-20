// src/app/api/admin/fotos-refresh/route.ts
//
// Endpoint para refrescar fotos de una playa concreta cuando hay
// foto incorrecta o vacía cacheada.
//
// AUTH: si CRON_SECRET está configurado, exige Authorization: Bearer.
// Si NO está configurado, el endpoint es PÚBLICO con rate-limit
// (refrescar fotos no es destructivo: solo recompone cache).
//
// Rate-limit: 60 req/min por IP (KV) cuando es público. Si KV no
// está conectado, fallback a 1 req cada ~500ms global (sleep en
// lambda) para no saturar Wikimedia/Flickr.
//
// Uso:
//   GET /api/admin/fotos-refresh?slug=kontxa-hondartza

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPlayaBySlug } from '@/lib/playas'
import { refetchAndStoreFotos } from '@/lib/fotos'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'
export const maxDuration = 30

// Helper para rate-limit por IP usando KV (60 req/min por IP).
async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const mod = await (import("@vercel/kv") as Promise<{
      kv: {
        incr: (k: string) => Promise<number>
        expire: (k: string, s: number) => Promise<unknown>
      }
    }>)
    const minute = Math.floor(Date.now() / 60000)
    const key = `rl:fotos-refresh:${ip}:${minute}`
    const count = await mod.kv.incr(key)
    if (count === 1) await mod.kv.expire(key, 65)
    return count <= 60
  } catch {
    // KV no disponible: rate-limit pasivo (sleep 400ms al final).
    return true
  }
}

export async function GET(req: NextRequest) {
  // Auth opcional: si hay CRON_SECRET, requiere Bearer. Si no, abierto.
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = req.headers.get('authorization')
    const isLocal    = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
    if (authHeader !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 })

  // Rate-limit por IP (solo si endpoint es público).
  if (!expected) {
    const ip = (req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown')
    const within = await checkRateLimit(ip)
    if (!within) {
      return NextResponse.json({ error: 'rate limit (60/min)' }, { status: 429 })
    }
  }

  const playa = await getPlayaBySlug(slug)
  if (!playa) return NextResponse.json({ error: 'playa not found' }, { status: 404 })

  // Purgar entradas KV viejas para esta playa.
  const purged: string[] = []
  try {
    const mod = await (import("@vercel/kv") as Promise<{ kv: { del: (k: string) => Promise<number> } }>)
    const nombreNorm = (playa.nombre ?? '').toLowerCase().normalize('NFD')
      .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '').slice(0, 40)
    const keys = [
      `fotos:${nombreNorm}:${playa.lat.toFixed(4)}:${playa.lng.toFixed(4)}`,  // nueva
      `fotos:${playa.lat.toFixed(4)}:${playa.lng.toFixed(4)}`,                  // legacy
    ]
    for (const k of keys) {
      try {
        await mod.kv.del(k)
        purged.push(k)
      } catch { /* ignore */ }
    }
  } catch {
    // KV no disponible.
  }

  // Refetch sin deadline + persistir en KV.
  const fotos = await refetchAndStoreFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia)

  // Pause defensiva si endpoint es público y KV-rate-limit no funcionó.
  if (!expected) await new Promise(r => setTimeout(r, 400))

  return NextResponse.json({
    slug,
    nombre: playa.nombre,
    purged,
    fotos: fotos.slice(0, 6),
    count: fotos.length,
  })
}
