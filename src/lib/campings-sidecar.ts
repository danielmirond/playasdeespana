// src/lib/campings-sidecar.ts
//
// Campings por provincia, de un JSON cosechado offline.
//
// POR QUÉ. Las 24 landings provinciales pedían los campings a Overpass
// EN RUNTIME y llevaban meses sirviendo «No se han encontrado
// campings»: el mirror principal devolvía 406 por el User-Agent, la
// consulta de bbox provincial no cabía en los cinco segundos de
// presupuesto, y el buildGuard corta la red durante el build, así que
// la página nacía vacía. Google las indexó igual —6.702 impresiones en
// 90 días para páginas sin contenido—.
//
// Un camping cambia dos veces al año: no hay razón para preguntarlo en
// tiempo de petición. Mismo patrón que aparcamientos, chiringuitos y
// yoga. Se cosecha con scripts/build-campings.mjs desde el extracto de
// Geofabrik y aquí solo se lee.
//
// El camino de Overpass en src/lib/campings.ts SE QUEDA: lo usan las
// fichas de playa, que consultan un radio pequeño y sí funcionan.
import campingsData from '@/../public/data/campings.json'
import { toSlug } from '@/lib/playas'
import type { CampingConPlaya } from '@/lib/campings'

interface Sidecar {
  actualizado: string
  pool: CampingConPlaya[]
  provincias: Record<string, number[]>
}

const DATA = campingsData as unknown as Sidecar

export const ACTUALIZADO_CAMPINGS = DATA.actualizado

/** Campings de una provincia, ya ordenados por distancia a la arena. */
export function campingsDeProvincia(provinciaSlug: string): CampingConPlaya[] {
  const idx = DATA.provincias[provinciaSlug]
  if (!idx) return []
  return idx.map(i => DATA.pool[i]).filter(Boolean)
}

/** Igual, pero aceptando el nombre de la provincia tal y como se escribe. */
export function campingsDeProvinciaPorNombre(nombre: string): CampingConPlaya[] {
  return campingsDeProvincia(toSlug(nombre))
}

export function provinciasConCampings(): string[] {
  return Object.keys(DATA.provincias)
}
