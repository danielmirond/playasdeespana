// src/app/api/meteo/[id]/route.ts
// Proxy server-side para AEMET — nunca expone la API key al cliente

import { NextRequest, NextResponse } from 'next/server'

const AEMET_BASE = 'https://opendata.aemet.es/opendata/api'
const KEY = process.env.AEMET_API_KEY ?? ''

export const runtime = 'nodejs'
export const revalidate = 10800  // 3h

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!KEY) {
    return NextResponse.json({ error: 'AEMET_API_KEY no configurada' }, { status: 500 })
  }

  const { id } = await params

  try {
    // Paso 1 — AEMET devuelve una meta-URL con los datos reales
    const meta = await fetch(
      `${AEMET_BASE}/prediccion/especifica/playa/${id}`,
      { headers: { api_key: KEY } }
    ).then(r => r.json())

    if (meta.estado !== 200) {
      return NextResponse.json({ error: meta.descripcion }, { status: 502 })
    }

    // Paso 2 — fetch a la URL real de datos
    const data = await fetch(meta.datos).then(r => r.json())
    const hoy = data?.[0]?.prediccion?.dia?.[0] ?? {}

    const payload = {
      temp_agua:   hoy.tempAgua ?? null,
      oleaje_m:    parseFloat(hoy.oleajeMax) || null,
      estado_mar:  hoy.estadoCielo?.[0]?.descripcion ?? null,
      viento_kmh:  hoy.viento?.[0]?.velocidad ?? null,
      viento_dir:  hoy.viento?.[0]?.direccion ?? null,
      viento_racha:hoy.rachaMax?.[0]?.value ?? null,
      temp_max:    hoy.temperatura?.maxima ?? null,
      temp_min:    hoy.temperatura?.minima ?? null,
      sensacion:   hoy.sensTermica?.maxima ?? null,
      humedad:     hoy.humedadRelativa?.maxima ?? null,
      uv_max:      hoy.uvMax ?? null,
      timestamp:   new Date().toISOString(),
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=21600',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
