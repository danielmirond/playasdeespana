// src/app/api/bano-hoy/route.ts
// Datos para el widget flotante "¿Me baño hoy?": las mejores playas de hoy
// con score/veredicto/foto REALES. Lo consume BanoHoyWidget en cliente.
import { NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'
import { calcularPlayaScore, type MeteoInput } from '@/lib/scoring'
import { tieneFotoReal, getFotos } from '@/lib/fotos'

export const revalidate = 1800 // 30 min

function calcEstado(m: MeteoInput): string {
  if (m.olas >= 2.5 || m.viento >= 50) return 'PELIGRO'
  if (m.olas >= 1.5) return 'SURF'
  if (m.viento >= 35) return 'VIENTO'
  if (m.olas >= 0.8 || m.viento >= 25) return 'AVISO'
  if (m.olas >= 0.4 || m.viento >= 15) return 'BUENA'
  return 'CALMA'
}
function verdictSub(estado: string): string {
  switch (estado) {
    case 'CALMA':   return 'mar en calma'
    case 'BUENA':   return 'para bañarse hoy'
    case 'AVISO':   return 'algo de oleaje'
    case 'VIENTO':  return 'algo de viento'
    case 'SURF':    return 'olas para surf'
    case 'PELIGRO': return 'precaución hoy'
    default:        return 'para bañarse hoy'
  }
}

async function meteoBatch(coords: { lat: number; lng: number }[]): Promise<MeteoInput[]> {
  const ahora = new Date().getHours()
  const fb: MeteoInput = { agua: 18, olas: 0.4, viento: 10, uv: 4 }
  if (!coords.length) return []
  const lats = coords.map(c => c.lat.toFixed(4)).join(',')
  const lngs = coords.map(c => c.lng.toFixed(4)).join(',')
  try {
    const [rM, rF] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 3600 } }),
    ])
    const marine = rM.ok ? await rM.json() : null
    const meteo = rF.ok ? await rF.json() : null
    return coords.map((_, i) => {
      const mA = coords.length === 1 ? marine?.hourly : marine?.[i]?.hourly
      const fA = coords.length === 1 ? meteo?.hourly : meteo?.[i]?.hourly
      if (!mA && !fA) return fb
      return {
        olas:   parseFloat((mA?.wave_height?.[ahora] ?? 0.4).toFixed(1)),
        agua:   Math.round(mA?.sea_surface_temperature?.[ahora] ?? 18),
        viento: Math.round(fA?.wind_speed_10m?.[ahora] ?? 10),
        uv:     Math.round(fA?.uv_index?.[ahora] ?? 4),
      }
    })
  } catch {
    return coords.map(() => fb)
  }
}

export async function GET() {
  const playas = await getPlayas()
  // Candidatas: bien equipadas y con coords. Muestreo amplio para tener de
  // dónde elegir buenas HOY.
  const candidatas = playas
    .filter(p => p.lat && p.lng && (p.bandera || p.socorrismo || p.parking))
    .slice(0, 60)
  if (!candidatas.length) return NextResponse.json({ beaches: [] })

  const meteos = await meteoBatch(candidatas.map(p => ({ lat: p.lat, lng: p.lng })))
  let scored = candidatas.map((p, i) => {
    const m = meteos[i]
    return { p, ps: calcularPlayaScore(p, m), estado: calcEstado(m) }
  }).sort((a, b) => b.ps.score - a.ps.score)

  // Solo con foto real y buenas hoy; rotación por hora para variar.
  const conFoto = await Promise.all(scored.map(s => tieneFotoReal(s.p.slug)))
  scored = scored.filter((_, i) => conFoto[i]).filter(s => s.ps.score >= 55)
  const rot = new Date().getHours()
  const pick = scored.slice(0, 12)
  const rotated = [...pick].sort((a, b) => {
    const h = (s: string) => (s.charCodeAt(0) * 31 + rot * 17 + s.length) % 9973
    return h(a.p.slug + rot) - h(b.p.slug + rot)
  }).slice(0, 4)

  const beaches = await Promise.all(rotated.map(async s => {
    const fotos = await getFotos(s.p.nombre, s.p.municipio, s.p.lat, s.p.lng, s.p.provincia, s.p.slug)
    return {
      n:     s.p.nombre,
      r:     `${s.p.municipio} · ${s.p.provincia}`,
      s:     s.ps.score,
      v:     s.ps.label.toLowerCase(),
      vs:    verdictSub(s.estado),
      vc:    s.ps.color,
      thumb: fotos?.[0]?.thumb ?? null,
      slug:  s.p.slug,
    }
  }))

  return NextResponse.json({ beaches })
}
