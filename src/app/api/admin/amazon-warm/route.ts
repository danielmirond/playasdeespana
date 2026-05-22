// src/app/api/admin/amazon-warm/route.ts
//
// Calienta el cache KV de productos Amazon Creators API.
// Pide TODOS los ASINs del catalogo estatico y los cachea con datos
// vivos (precio, imagen, rating, stock). Ideal para llamar 1x/dia
// via cron (TTL del cache es 6h, pero precios pueden cambiar antes).
//
// Endpoint:
//   GET /api/admin/amazon-warm
//
// AUTH: Bearer CRON_SECRET (si configurado). Sin secret, exige
// &confirm=YES (idempotente pero costoso en quota API).

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { PRODUCTOS } from '@/lib/amazon-productos'
import { getProductoVivo, creatorsApiActivo } from '@/lib/amazon-creators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get('authorization')
    const isLocal = req.nextUrl.hostname === 'localhost'
    if (auth !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  } else {
    if (req.nextUrl.searchParams.get('confirm') !== 'YES') {
      return NextResponse.json(
        { error: 'CRON_SECRET no configurado. Añade &confirm=YES.' },
        { status: 403 },
      )
    }
  }

  if (!creatorsApiActivo()) {
    return NextResponse.json({
      error:  'Amazon Creators API no configurada',
      hint:   'Define AMAZON_CREATORS_ACCESS_KEY, AMAZON_CREATORS_SECRET_KEY y AMAZON_CREATORS_PARTNER_TAG en Vercel.',
      action: 'noop',
    }, { status: 200 })
  }

  // Recolectar todos los ASINs únicos del catálogo estático.
  const asinsSet = new Set<string>()
  for (const productosCat of Object.values(PRODUCTOS)) {
    for (const p of productosCat) {
      asinsSet.add(p.asin)
    }
  }
  const asins = Array.from(asinsSet)

  // Throttle suave: 1 req cada 800ms para no saturar el rate-limit
  // inicial de Creators API (1 req/sec). Si tu quota es >1 req/sec
  // baja este sleep.
  let success = 0
  let fail = 0
  const errores: string[] = []

  for (const asin of asins) {
    try {
      const p = await getProductoVivo(asin)
      if (p) success++
      else { fail++; errores.push(asin) }
    } catch (e) {
      fail++
      errores.push(`${asin}: ${String(e).slice(0, 60)}`)
    }
    await new Promise(r => setTimeout(r, 800))
  }

  return NextResponse.json({
    action:  'warm',
    asins:   asins.length,
    success,
    fail,
    errores: errores.slice(0, 20),
  })
}
