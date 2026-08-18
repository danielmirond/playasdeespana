// src/app/api/admin/banderas-diag/route.ts — Diagnóstico de alcance de los
// feeds de bandera DESDE VERCEL.
//
// Motivo: tras desplegar los adaptadores, las 22 fichas de Bizkaia se
// quedaron sin bandera mientras Cataluña, Canarias y Andalucía funcionaban.
// El feed de la Diputación responde en 0,5 s desde una máquina en España y
// desde Node en local, así que el problema está en el camino Vercel →
// apps.bizkaia.eus, no en el código. Sin ver el error real solo se puede
// especular: bloqueo por IP de centro de datos, por User-Agent, TLS, o
// simple latencia contra el deadline.
//
// Esta ruta llama a cada origen SIN deadline y devuelve lo que pasa: código
// HTTP, tamaño, tiempo y el error con su `cause`, que es donde Node esconde
// el motivo real de un fallo de red.
//
// No expone datos: solo metadatos de la petición.
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getConIzenpe } from '@/lib/banderas-biz'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UA = 'playas-espana.com (+https://playas-espana.com)'

const ORIGENES: Array<{ nombre: string; url: string; init?: RequestInit }> = [
  { nombre: 'bizkaia', url: 'https://apps.bizkaia.eus/HKDE000M/rest/situacion' },
  // El mismo origen sin nuestro User-Agent: si este pasa y el de arriba no,
  // el bloqueo es por UA y se arregla cambiando una cadena.
  { nombre: 'bizkaia-sin-ua', url: 'https://apps.bizkaia.eus/HKDE000M/rest/situacion', init: { headers: {} } },
  { nombre: 'canarias', url: 'https://www3.gobiernodecanarias.org/aplicaciones/infoplayas/socorrismo/api/flags' },
  { nombre: 'gipuzkoa', url: 'https://backend.tokitek.com/data/apps/105/neodata.json' },
]

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = req.headers.get('authorization')
    const isLocal = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
    if (authHeader !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  } else if (req.nextUrl.searchParams.get('confirm') !== 'YES') {
    return NextResponse.json(
      { error: 'CRON_SECRET no configurado. Añade &confirm=YES si entiendes el riesgo.' },
      { status: 403 },
    )
  }

  const resultados = await Promise.all(ORIGENES.map(async o => {
    const t0 = Date.now()
    try {
      const res = await fetch(o.url, {
        signal: AbortSignal.timeout(15000),
        headers: o.init?.headers !== undefined ? (o.init.headers as HeadersInit) : { 'User-Agent': UA },
        cache: 'no-store',
      })
      const body = await res.text()
      return { origen: o.nombre, ok: res.ok, http: res.status, bytes: body.length, ms: Date.now() - t0 }
    } catch (e) {
      const err = e as Error & { cause?: { message?: string; code?: string } }
      return {
        origen: o.nombre, ok: false, ms: Date.now() - t0,
        error: err.name, mensaje: err.message,
        // Aquí es donde Node guarda el motivo de verdad (ECONNRESET,
        // CERT_HAS_EXPIRED, UNABLE_TO_VERIFY_LEAF_SIGNATURE…).
        causa: err.cause?.code ?? err.cause?.message ?? null,
      }
    }
  }))

  // El camino REAL que usa el adaptador: node:https con la raíz de Izenpe
  // pasada solo en esta conexión. Los `bizkaia*` de arriba usan fetch pelado
  // a propósito y son el control: deben seguir fallando.
  let conCA: Record<string, unknown>
  const t0 = Date.now()
  try {
    const xml = await getConIzenpe('https://apps.bizkaia.eus/HKDE000M/rest/situacion', 8000)
    conCA = { origen: 'bizkaia-con-ca-izenpe', ok: true, bytes: xml.length, ms: Date.now() - t0 }
  } catch (e) {
    const err = e as Error & { cause?: { message?: string; code?: string }; code?: string }
    conCA = {
      origen: 'bizkaia-con-ca-izenpe', ok: false, ms: Date.now() - t0,
      error: err.name, mensaje: err.message,
      codigo: err.code ?? null,
      causa: err.cause?.code ?? err.cause?.message ?? null,
    }
  }
  resultados.push(conCA as never)

  return NextResponse.json({
    region: process.env.VERCEL_REGION ?? null,
    node: process.version,
    resultados,
  })
}
