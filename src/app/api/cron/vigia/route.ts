// src/app/api/cron/vigia/route.ts — Contraste diario: ¿lo que dice la prensa
// coincide con lo que decimos nosotros?
//
// NO PUBLICA NADA Y NO PUEDE. No escribe en ninguna ficha, no toca la
// cascada de banderas y no cambia un solo color. Genera un informe y lo
// guarda; lo que se haga con él es decisión humana.
//
// Qué busca: los huecos que no sabemos que tenemos. Hoy sabemos que
// Cantabria no tiene fuente porque la buscamos. Lo que no sabemos es cuándo
// un ayuntamiento cerrará una playa donde no llega ninguno de nuestros ocho
// feeds. El 15 de agosto de 2026 eso fue Málaga, y nuestras fichas decían
// "BUENA" mientras el baño estaba prohibido por E. coli.
//
// Lo valioso no es el aviso puntual sino el PATRÓN ACUMULADO: si un mes de
// informes muestra que siempre se nos escapa la misma provincia, ahí hace
// falta una fuente. El informe dice dónde buscar la siguiente.
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getAvisos } from '@/lib/vigia-noticias'
import { getPlayas } from '@/lib/playas'
import { getBanderaCat, tieneBanderaCat } from '@/lib/banderas-cat'
import { getBanderaCan, tieneBanderaCan } from '@/lib/banderas-can'
import { getBanderaAnd, tieneBanderaAnd } from '@/lib/banderas-and'
import { getBanderaBiz, tieneBanderaBiz } from '@/lib/banderas-biz'
import { getBanderaGip, tieneBanderaGip } from '@/lib/banderas-gip'
import { getBanderaSb, tieneBanderaSb } from '@/lib/banderas-sb'
import { getBanderaFerrol, tieneBanderaFerrol } from '@/lib/banderas-ferrol'
import { getBanderaGijon, tieneBanderaGijon } from '@/lib/banderas-gijon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Bandera oficial de una playa, mirando solo la fuente que le corresponde. */
async function oficialDe(slug: string) {
  try {
    if (tieneBanderaCat(slug))    return { fuente: 'Cataluña',  b: (await getBanderaCat(slug))?.bandera ?? null }
    if (tieneBanderaCan(slug))    return { fuente: 'Canarias',  b: (await getBanderaCan(slug))?.bandera ?? null }
    if (tieneBanderaAnd(slug))    return { fuente: 'Andalucía', b: (await getBanderaAnd(slug))?.bandera ?? null }
    if (tieneBanderaBiz(slug))    return { fuente: 'Bizkaia',   b: (await getBanderaBiz(slug))?.bandera ?? null }
    if (tieneBanderaGip(slug))    return { fuente: 'Gipuzkoa',  b: (await getBanderaGip(slug))?.bandera ?? null }
    if (tieneBanderaSb(slug))     return { fuente: 'SafeBeach', b: (await getBanderaSb(slug))?.bandera ?? null }
    if (tieneBanderaFerrol(slug)) return { fuente: 'Ferrol',    b: (await getBanderaFerrol(slug))?.bandera ?? null }
    if (tieneBanderaGijon(slug))  return { fuente: 'Gijón',     b: (await getBanderaGijon(slug))?.bandera ?? null }
  } catch { /* una fuente caída no invalida el informe */ }
  return { fuente: null, b: null }
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  const isLocal = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
  if (expected) {
    if (req.headers.get('authorization') !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  } else if (!isLocal && req.nextUrl.searchParams.get('confirm') !== 'YES') {
    return NextResponse.json({ error: 'CRON_SECRET no configurado. Añade &confirm=YES.' }, { status: 403 })
  }

  const avisos = await getAvisos()
  const playas = await getPlayas()

  // Municipios nombrados hoy en titulares de cierre.
  const senalados = new Set<string>()
  for (const a of avisos) for (const m of a.municipios) senalados.add(m)

  // Para cada uno: ¿qué estamos diciendo de sus playas?
  const informe: Array<Record<string, unknown>> = []
  for (const muni of senalados) {
    const suyas = playas.filter(p => p.municipio === muni).slice(0, 30)
    let conFuente = 0, enRoja = 0, sinFuente = 0
    const fuentes = new Set<string>()
    for (const p of suyas) {
      const { fuente, b } = await oficialDe(p.slug)
      if (fuente) { conFuente++; fuentes.add(fuente) } else sinFuente++
      if (b?.color === 'roja') enRoja++
    }
    // El punto ciego: la prensa habla de cierres y nosotros no tenemos NI
    // fuente oficial NI ninguna roja. Ahí es donde hay que mirar.
    const ciego = enRoja === 0
    informe.push({
      municipio: muni,
      playas: suyas.length,
      conFuenteOficial: conFuente,
      sinFuenteOficial: sinFuente,
      enRojaAhora: enRoja,
      fuentes: [...fuentes],
      puntoCiego: ciego,
      titulares: avisos.filter(a => a.municipios.includes(muni)).map(a => a.titular).slice(0, 3),
    })
  }
  informe.sort((a, b) => Number(b.puntoCiego) - Number(a.puntoCiego))

  const resumen = {
    fecha: new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date()),
    titularesRecogidos: avisos.length,
    municipiosSenalados: senalados.size,
    puntosCiegos: informe.filter(i => i.puntoCiego).length,
  }

  // Se guarda para poder mirar el patrón acumulado, que es donde está el
  // valor. Con await, nunca fire-and-forget: en serverless, un set sin
  // esperar muere con la respuesta y la clave no se escribe jamás.
  try {
    const { kv } = await import('@vercel/kv')
    await Promise.race([
      kv.set(`vigia:${resumen.fecha.slice(0, 10)}`, { resumen, informe }, { ex: 60 * 60 * 24 * 90 }),
      new Promise(r => setTimeout(r, 1500)),
    ])
  } catch { /* KV degradado: el informe se devuelve igual */ }

  return NextResponse.json({ resumen, informe, avisos })
}
