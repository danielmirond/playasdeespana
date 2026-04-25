// src/app/api/widget/route.ts
// Endpoint público para el widget embebible. Devuelve score + meteo
// de una playa por slug. CORS abierto (cualquier dominio puede embeber).
import { NextRequest, NextResponse } from 'next/server'
import { getPlayaBySlug } from '@/lib/playas'
import { calcularPlayaScore, type MeteoInput } from '@/lib/scoring'

export const revalidate = 3600

async function fetchMeteoWidget(lat: number, lng: number): Promise<MeteoInput> {
  try {
    const h = new Date().getHours()
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }),
    ])
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    return {
      olas: parseFloat((marine?.hourly?.wave_height?.[h] ?? 0.4).toFixed(1)),
      agua: Math.round(marine?.hourly?.sea_surface_temperature?.[h] ?? 18),
      viento: Math.round(meteo?.hourly?.wind_speed_10m?.[h] ?? 10),
      uv: Math.round(meteo?.hourly?.uv_index?.[h] ?? 4),
    }
  } catch {
    return { agua: 18, olas: 0.4, viento: 10, uv: 4 }
  }
}

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Missing ?slug= parameter' }, { status: 400 })
  }

  const playa = await getPlayaBySlug(slug)
  if (!playa) {
    return NextResponse.json({ error: 'Beach not found' }, { status: 404 })
  }

  const meteo = await fetchMeteoWidget(playa.lat, playa.lng)
  const ps = calcularPlayaScore(playa, meteo)

  const data = {
    slug: playa.slug,
    nombre: playa.nombre,
    municipio: playa.municipio,
    provincia: playa.provincia,
    score: ps.score,
    label: ps.label,
    color: ps.color,
    agua: meteo.agua,
    olas: meteo.olas,
    viento: meteo.viento,
    uv: meteo.uv,
    bandera: !!playa.bandera,
    url: `https://playas-espana.com/playas/${playa.slug}`,
    updated: new Date().toISOString(),
  }

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
    },
  })
}
