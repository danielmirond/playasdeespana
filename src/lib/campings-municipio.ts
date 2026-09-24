// src/lib/campings-municipio.ts — los campings cerca de las playas de un
// municipio, para /municipio/[slug]/camping-cerca.
//
// DE DÓNDE SALE. Del sidecar de OpenStreetMap (public/data/osm-pois.json),
// que ya indexa 1.636 campings por playa dentro de un radio: se reúnen los
// de todas las playas del municipio, se quitan repetidos y a cada uno se
// le asigna la playa que le queda más cerca. Cero red, cero KV: es lo que
// hace que la página exista para 766 municipios sin depender de Overpass.
//
// LO QUE NO HAY. Precios, disponibilidad, fotos ni reseñas: OSM no los
// tiene y no se inventan. Lo que sí hay y ninguna web de reservas da es la
// distancia a la playa y qué playa es, con su bandera y su estado.
import type { Playa } from '@/types'
import { osmCampings } from './osm-pois'

export interface CampingCerca {
  id: string
  nombre: string
  estrellas: number
  website: string | null
  telefono: string | null
  lat: number
  lng: number
  /** La playa del municipio más cercana y a cuántos metros. */
  playa: { slug: string; nombre: string; bandera: boolean; socorrismo: boolean; perros: boolean; metros: number }
}

/** Mínimo para tener página: con uno solo no hay nada que comparar. */
export const MINIMO_CAMPINGS = 2

export async function campingsDelMunicipio(playas: Playa[]): Promise<CampingCerca[]> {
  const porId = new Map<string, CampingCerca>()
  for (const p of playas) {
    if (!p.lat || !p.lng) continue
    const lista = await osmCampings(p.lat, p.lng)
    for (const c of lista ?? []) {
      const previo = porId.get(c.id)
      if (previo && previo.playa.metros <= c.distancia_m) continue
      porId.set(c.id, {
        id: c.id, nombre: c.nombre, estrellas: c.categoria,
        website: c.website ?? null, telefono: c.telefono ?? null,
        lat: c.lat, lng: c.lon,
        playa: { slug: p.slug, nombre: p.nombre, bandera: !!p.bandera, socorrismo: !!p.socorrismo, perros: !!p.perros, metros: c.distancia_m },
      })
    }
  }
  return [...porId.values()].sort((a, b) => a.playa.metros - b.playa.metros)
}

export const metros = (m: number) => m < 1000 ? `${Math.round(m / 50) * 50} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`
