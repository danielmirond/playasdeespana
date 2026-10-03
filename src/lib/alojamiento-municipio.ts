// src/lib/alojamiento-municipio.ts — dónde dormir en un municipio de costa.
//
// EL ÁNGULO. Booking sabe el precio y las fotos; nosotros sabemos a qué
// playa le queda más cerca cada hotel, y cómo está esa playa. Es lo mismo
// que hicimos con los campings y es lo único que un buscador de reservas
// no publica: la distancia a la arena concreta, con su bandera y su
// socorrismo. Por eso la lista se ordena por eso y no por precio.
//
// DOS FUENTES. OpenStreetMap pone el inventario: 19.000 alojamientos
// indexados por playa en el sidecar, con web y teléfono. Google Places
// pone lo que OSM no tiene y la gente mira primero: valoración, número de
// reseñas y nivel de precio. El cruce es por nombre, porque los dos
// sidecars se cosecharon por coordenadas de playa y no comparten id.
//
// POR QUÉ UN SIDECAR Y NO LLAMADAS. En julio una factura de 231 € enseñó
// lo que cuestan las llamadas en vivo: la clave salió de Vercel y lo que
// hay está congelado en el repo. 290 de los 363 municipios publicables
// tienen datos de Google; los 73 restantes salen solo con OSM y se ven
// igual de bien, sin estrellas.
import { cache } from 'react'
import type { Playa } from '@/types'
import { osmHoteles } from './osm-pois'
import gplaces from '@/data/gplaces-sidecar.json'

export interface Alojamiento {
  id: string
  nombre: string
  tipo: 'Hotel' | 'Hostal' | 'Casa de huéspedes' | 'Alojamiento'
  estrellas: number
  web: string | null
  telefono: string | null
  /** De Google, cuando lo tenemos. 0 si no. */
  valoracion: number
  resenas: number
  /** €, €€, €€€… Vacío si no consta. */
  precio: string
  lat: number
  lng: number
  /** La playa del municipio que le queda más cerca. */
  playa: { slug: string; nombre: string; bandera: boolean; socorrismo: boolean; metros: number }
}

type FichaGoogle = { nombre: string; rating: number; reseñas: number; precio: string; tipo: string; lat: number; lon: number }
const GOOGLE = gplaces as unknown as Record<string, FichaGoogle[]>

const norm = (s: string) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Palabras que no distinguen un hotel de otro y estorban al cruzar. */
const RUIDO = new Set(['hotel','hostal','apartamentos','apartamento','pension','casa','rural','playa','mar','sol','el','la','los','las','de','del','y','spa','resort','suites','boutique','albergue'])
const clave = (n: string) => norm(n).split(' ').filter(w => w.length > 2 && !RUIDO.has(w)).join(' ')

const hav = (la1: number, lo1: number, la2: number, lo2: number) => {
  const R = 6371000, r = (d: number) => d * Math.PI / 180
  const dLa = r(la2 - la1), dLo = r(lo2 - lo1)
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

/** El tipo lo dice OpenStreetMap. Adivinarlo del nombre dejaba como
 *  «Alojamiento» a hoteles que se llaman Toboso o Paradores. */
const TIPO = (t: string | undefined, nombre: string): Alojamiento['tipo'] => {
  const x = `${t ?? ''} ${nombre}`
  return /hostal|hostel/i.test(x) ? 'Hostal'
    : /hu[ée]sped|guest/i.test(x) ? 'Casa de huéspedes'
    : /hotel/i.test(x) ? 'Hotel' : 'Alojamiento'
}

/**
 * Los alojamientos de todas las playas del municipio, sin repetir, cada uno
 * con la playa que le queda más cerca y, si lo tenemos, su valoración.
 *
 * El orden es por distancia a la arena. Entre dos igual de cerca, manda la
 * valoración: quien busca dormir en la playa quiere la playa primero.
 */
export const alojamientosDelMunicipio = cache(async (playas: Playa[]): Promise<Alojamiento[]> => {
  const porId = new Map<string, Alojamiento>()
  // Fichas de Google de todas las playas del municipio, indexadas por nombre.
  const deGoogle = new Map<string, FichaGoogle>()
  for (const p of playas) {
    for (const f of GOOGLE[`lodging:${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`] ?? []) {
      const k = clave(f.nombre)
      if (k && !deGoogle.has(k)) deGoogle.set(k, f)
    }
  }

  for (const p of playas) {
    const lista = await osmHoteles(p.lat, p.lng)
    if (!lista) continue
    for (const h of lista) {
      const ya = porId.get(h.id)
      if (ya && ya.playa.metros <= h.distancia_m) continue
      porId.set(h.id, {
        id: h.id,
        nombre: h.nombre,
        tipo: TIPO(h.tipo, h.nombre),
        estrellas: h.estrellas ?? 0,
        web: h.website ?? null,
        telefono: h.telefono ?? null,
        valoracion: 0,
        resenas: 0,
        precio: '',
        lat: h.lat ?? p.lat,
        lng: h.lng ?? p.lng,
        playa: { slug: p.slug, nombre: p.nombre, bandera: !!p.bandera, socorrismo: !!p.socorrismo, metros: h.distancia_m },
      })
    }
  }

  // El cruce con Google se hace AL FINAL, sobre la lista ya deduplicada, y
  // cada ficha se gasta al asignarla. Hacerlo dentro del bucle fallaba por
  // los dos lados: «Perla Marina 2» heredaba las 2.050 reseñas del «Hotel
  // Perla Marina», y un hotel que aparecía en dos playas perdía la suya al
  // reescribirse con la ficha ya consumida.
  const lista = [...porId.values()].sort((a, b) =>
    a.playa.metros - b.playa.metros || b.resenas - a.resenas)
  for (const a of lista) {
    const k = clave(a.nombre)
    const g = k ? deGoogle.get(k) : undefined
    if (!g) continue
    deGoogle.delete(k)
    a.valoracion = g.rating
    a.resenas = g.reseñas
    a.precio = g.precio
  }
  return lista
})

/** Con menos de cinco no hay nada que comparar y la ficha de playa ya los lista. */
export const MINIMO_ALOJAMIENTOS = 5

export const tieneAlojamientos = cache(async (playas: Playa[]): Promise<boolean> => {
  if (playas.length < 2) return false
  return (await alojamientosDelMunicipio(playas)).length >= MINIMO_ALOJAMIENTOS
})

export const metros = (m: number): string =>
  m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${m} m`
