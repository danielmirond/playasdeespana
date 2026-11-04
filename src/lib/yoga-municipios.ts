// src/lib/yoga-municipios.ts
//
// Agrupa los estudios de yoga y pilates por MUNICIPIO, cruzando la playa
// cercana que ya trae cada estudio contra el catálogo de playas.
//
// El sidecar (scripts/build-yoga-estudios.mjs) indexa por provincia y a
// cada estudio le asigna la playa de la guía que le queda más cerca. Eso
// basta para el municipio: la playa sabe en cuál está.
//
// Tras deduplicar son 369 estudios en 148 municipios. El primer recuento
// decía 453 en 153: estaba inflado por el mismo solapamiento que
// duplicaba las tarjetas, y conviene dejarlo escrito para que nadie
// vuelva a contar sobre el sidecar en bruto.
//
// UMBRAL = 3: 52 municipios con 236 estudios, el 64 % del total. Con 2
// serían 89 municipios, 37 más por solo 74 estudios: casi todos nacerían
// con dos locales, que es el tipo de página fina que ya ha dado
// problemas de indexación en otras verticales del sitio.
import estudiosData from '@/data/yoga-estudios.json'
import { getPlayas, toSlug } from '@/lib/playas'

export const UMBRAL_ESTUDIOS = 3

export interface EstudioYoga {
  googleId: string
  nombre: string
  rating: number
  reseñas: number
  tipo: string
  playaCercana: { slug: string; nombre: string; distM: number } | null
}

export interface MunicipioYoga {
  slug: string
  nombre: string
  provincia: string
  provinciaSlug: string
  estudios: EstudioYoga[]
}

interface ProvEntry { provincia: string; comunidad: string; estudios: EstudioYoga[] }
const DATA = estudiosData as unknown as Record<string, ProvEntry>

let _cache: Map<string, MunicipioYoga> | null = null

/** Mapa slug de municipio → sus estudios, ya filtrado por el umbral. */
export async function getYogaPorMunicipio(): Promise<Map<string, MunicipioYoga>> {
  if (_cache) return _cache
  const playas = await getPlayas()
  const dePlaya = new Map(playas.map(p => [p.slug, p]))

  const acc = new Map<string, MunicipioYoga>()
  // Un mismo estudio aparece en VARIAS entradas provinciales del sidecar
  // —las cosechas por provincia se solapan en los límites—, así que hay
  // que deduplicar por googleId o el municipio cuenta cuatro veces el
  // mismo local. Encontrado en Tarifa: cuatro estudios reales pintados
  // dieciséis veces.
  const vistos = new Set<string>()
  for (const prov of Object.values(DATA)) {
    for (const e of prov.estudios) {
      if (!e.playaCercana) continue
      if (vistos.has(e.googleId)) continue
      vistos.add(e.googleId)
      const playa = dePlaya.get(e.playaCercana.slug)
      if (!playa) continue
      const slug = toSlug(playa.municipio)
      const ya = acc.get(slug)
      if (ya) ya.estudios.push(e)
      else acc.set(slug, {
        slug,
        nombre: playa.municipio,
        provincia: playa.provincia,
        provinciaSlug: toSlug(playa.provincia),
        estudios: [e],
      })
    }
  }

  // Orden por reseñas: el estudio con más gente detrás va primero, que es
  // la única señal de relevancia que tenemos y no la inventamos nosotros.
  for (const m of acc.values()) m.estudios.sort((a, b) => b.reseñas - a.reseñas)

  _cache = new Map([...acc].filter(([, m]) => m.estudios.length >= UMBRAL_ESTUDIOS))
  return _cache
}

export async function getYogaMunicipio(slug: string): Promise<MunicipioYoga | undefined> {
  return (await getYogaPorMunicipio()).get(slug)
}
