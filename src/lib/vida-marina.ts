// src/lib/vida-marina.ts — lector del sidecar de especies por municipio.
//
// Lo genera scripts/build-vida-marina.mjs desde OBIS. En runtime no se
// llama a nadie: es un JSON.
//
// La página solo existe donde hay dato suficiente, y el umbral no es un
// capricho: medido con el filtro de profundidad que separa «está en estas
// aguas» de «lo ves buceando», 5 de cada 18 municipios salen a cero. Una
// subpágina vacía en la mitad del mapa es la fábrica de páginas flojas
// que arrastran a las buenas.
import { cache } from 'react'

export interface EspecieMarina {
  /** Nombre científico. El común se añade aparte, ver NOMBRES. */
  n: string
  clase: string
  registros: number
}

export interface VidaMarinaMunicipio {
  nombre: string
  /** Especies encontradas en total; `especies` trae las 60 primeras. */
  total: number
  especies: EspecieMarina[]
}

/** Clase científica → cómo lo llama alguien que no es biólogo. */
export const GRUPOS: Record<string, string> = {
  Teleostei: 'Peces',
  Elasmobranchii: 'Tiburones y rayas',
  Cephalopoda: 'Pulpos, sepias y calamares',
  Echinoidea: 'Erizos de mar',
  Asteroidea: 'Estrellas de mar',
  Holothuroidea: 'Pepinos de mar',
  Ophiuroidea: 'Ofiuras',
  Hexacorallia: 'Corales y anémonas',
}

const cargar = cache(async (): Promise<Record<string, VidaMarinaMunicipio>> => {
  try {
    const { default: data } = await import('@/../public/data/vida-marina.json', {
      assert: { type: 'json' },
    })
    return data as unknown as Record<string, VidaMarinaMunicipio>
  } catch {
    return {}
  }
})

export const getVidaMarina = cache(async (slug: string): Promise<VidaMarinaMunicipio | null> =>
  (await cargar())[slug] ?? null)

/** Para enlaces-municipio: evita enlazar a una página que haría notFound. */
export const tieneVidaMarina = cache(async (slug: string): Promise<boolean> =>
  !!(await cargar())[slug])

/** Agrupadas por clase, en el orden en que a alguien le interesan. */
export function porGrupo(especies: EspecieMarina[]): Array<[string, EspecieMarina[]]> {
  const orden = ['Teleostei', 'Cephalopoda', 'Elasmobranchii', 'Hexacorallia',
                 'Asteroidea', 'Echinoidea', 'Holothuroidea', 'Ophiuroidea']
  const m = new Map<string, EspecieMarina[]>()
  for (const e of especies) {
    if (!m.has(e.clase)) m.set(e.clase, [])
    m.get(e.clase)!.push(e)
  }
  return orden.filter(c => m.has(c)).map(c => [c, m.get(c)!])
}
