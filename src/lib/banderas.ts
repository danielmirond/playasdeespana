// src/lib/banderas.ts — el motor del semáforo de banderas.
//
// Vivía dentro de app/banderas-hoy/page.tsx. Sale aquí porque ahora hay dos
// consumidores: el semáforo nacional y las páginas por zona. Duplicar el
// batch de Open-Meteo habría significado dos sitios donde ajustar timeouts,
// umbrales y ventanas de caché — y que se desincronicen es cuestión de
// tiempo.
//
// Por qué existen las páginas por zona: en los datos de Search Console de
// marzo a agosto de 2026, las consultas con «bandera» son el 46 % de TODOS
// los clics del sitio (922 de 1.993) con un CTR del 5,00 % frente al 1,00 %
// global. Y la demanda es estacional de manera brutal: 34 impresiones en
// mayo, 11.768 en julio. La variante geográfica ya se captura sin tener
// página — «banderas playas hoy cataluña», o Tarragona con 425 impresiones
// al 5,88 % en posición 7,6.

import { calcularBandera, estimarMedusas } from './seguridad'
import { getBanderaCat, tieneBanderaCat } from './banderas-cat'
import { getBanderaCan, tieneBanderaCan } from './banderas-can'
import { getBanderaAnd, tieneBanderaAnd } from './banderas-and'
import { getBanderaBiz, tieneBanderaBiz } from './banderas-biz'
import { getBanderaGip, tieneBanderaGip } from './banderas-gip'
import { getBanderaSb, tieneBanderaSb } from './banderas-sb'
import { getBanderaFerrol, tieneBanderaFerrol } from './banderas-ferrol'
import { getBanderaGijon, tieneBanderaGijon } from './banderas-gijon'
import { fetchWithTimeout } from './fetch-timeout'
import type { Playa } from '@/types'

export interface MeteoBandera {
  olas: number
  viento: number
  racha: number
  tempAgua: number | null
  vientoDir: string
}

/** Provincias costeras tal y como aparecen en el dataset. */
export const COSTERAS: Array<{ comunidad: string; provincias: string[] }> = [
  { comunidad: 'Galicia',              provincias: ['A Coruña', 'Lugo', 'Pontevedra'] },
  { comunidad: 'Asturias',             provincias: ['Asturias'] },
  { comunidad: 'Cantabria',            provincias: ['Cantabria'] },
  { comunidad: 'País Vasco',           provincias: ['Bizkaia', 'Gipuzkoa'] },
  { comunidad: 'Cataluña',             provincias: ['Girona', 'Barcelona', 'Tarragona'] },
  { comunidad: 'Comunitat Valenciana', provincias: ['Castellón', 'Valencia', 'Alicante'] },
  { comunidad: 'Murcia',               provincias: ['Murcia'] },
  { comunidad: 'Andalucía',            provincias: ['Huelva', 'Cádiz', 'Málaga', 'Granada', 'Almería'] },
  { comunidad: 'Islas Baleares',       provincias: ['Baleares'] },
  { comunidad: 'Canarias',             provincias: ['Las Palmas', 'Santa Cruz de Tenerife'] },
  { comunidad: 'Ceuta y Melilla',      provincias: ['Ceuta', 'Melilla'] },
]

/** Grados meteorológicos → rumbo de 16 puntos (para estimarMedusas). */
export function gradosADireccion(deg: number | null): string {
  if (deg == null || Number.isNaN(deg)) return ''
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16]
}

/**
 * Las mejores playas de una provincia, por servicios.
 *
 * `limite` lo decide quien llama: el semáforo nacional enseña 6 por
 * provincia porque lista 20 provincias; una página de zona puede permitirse
 * muchas más, que es justamente lo que la hace útil frente al hub.
 */
export function topDeProvincia(playas: Playa[], provincia: string, limite: number): Playa[] {
  // El dataset tenía «Baleares» e «Islas Baleares» como si fueran dos. Se
  // unificó, pero se aceptan las dos por si vuelve a colarse en un sync.
  const nombres = provincia === 'Baleares' ? ['Baleares', 'Islas Baleares'] : [provincia]
  return playas
    .filter(p => nombres.includes(p.provincia) && p.lat && p.lng)
    .map(p => ({ p, pts: (p.bandera ? 3 : 0) + (p.socorrismo ? 2 : 0) + (p.duchas ? 1 : 0) + (p.parking ? 1 : 0) }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, limite)
    .map(x => x.p)
}

/**
 * Oleaje, viento y temperatura del agua para una lista de coordenadas.
 * En lotes de 50 porque es el límite práctico de Open-Meteo por llamada.
 */
export async function meteoBatch(coords: { lat: number; lng: number }[]): Promise<MeteoBandera[]> {
  const fb: MeteoBandera = { olas: 0.4, viento: 10, racha: 15, tempAgua: null, vientoDir: '' }
  if (!coords.length) return []
  const hora = parseInt(
    new Intl.DateTimeFormat('es-ES', { hour: 'numeric', hour12: false, timeZone: 'Europe/Madrid' }).format(new Date()),
    10,
  ) || 12

  const CHUNK = 50
  const chunks: { lat: number; lng: number }[][] = []
  for (let i = 0; i < coords.length; i += CHUNK) chunks.push(coords.slice(i, i + CHUNK))

  const results = await Promise.all(chunks.map(async chunk => {
    const lats = chunk.map(c => c.lat.toFixed(4)).join(',')
    const lngs = chunk.map(c => c.lng.toFixed(4)).join(',')
    try {
      // 8s: la página es ISR — la regeneración corre en background, así que
      // un timeout generoso no penaliza TTFB y evita caer a fallback en frío.
      const [rM, rF] = await Promise.all([
        fetchWithTimeout(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 1800 } }, 8000),
        fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { next: { revalidate: 1800 } }, 8000),
      ])
      const marine = rM.ok ? await rM.json() : null
      const meteo  = rF.ok ? await rF.json() : null
      return chunk.map((_, i) => {
        const mA = chunk.length === 1 ? marine?.hourly : marine?.[i]?.hourly
        const fA = chunk.length === 1 ? meteo?.hourly : meteo?.[i]?.hourly
        if (!mA && !fA) return fb
        const sst = mA?.sea_surface_temperature?.[hora]
        return {
          olas:      parseFloat((mA?.wave_height?.[hora] ?? 0.4).toFixed(1)),
          viento:    Math.round(fA?.wind_speed_10m?.[hora] ?? 10),
          racha:     Math.round(fA?.wind_gusts_10m?.[hora] ?? 15),
          tempAgua:  typeof sst === 'number' ? Math.round(sst) : null,
          vientoDir: gradosADireccion(fA?.wind_direction_10m?.[hora] ?? null),
        }
      })
    } catch {
      return chunk.map(() => fb)
    }
  }))
  return results.flat()
}

/**
 * Playa + su meteo + bandera + riesgo de medusas.
 *
 * La bandera pasa por la MISMA cascada oficial que la ficha (ago-2026).
 * Antes solo estimaba con oleaje y viento, y el resultado era que
 * /banderas-hoy/malaga pintaba La Misericordia con «0,4 m · 7 km/h» —mar
 * en calma— el mismo día en que su ficha decía «No te bañes» porque la
 * Junta la tenía en roja por E. coli. El sitio se contradecía consigo
 * mismo, y encima en la página que rankea para «banderas playas hoy».
 *
 * Coste: una llamada por comunidad, no por playa. Los adaptadores
 * comparten snapshot vía KV y memo de proceso, así que un listado de 200
 * playas andaluzas sigue haciendo UNA petición a la Junta.
 *
 * `cert` viaja con cada fila para que el listado pueda distinguir lo izado
 * de lo estimado, igual que hace la ficha.
 */
export async function conBanderas(playas: Playa[]) {
  const meteos = await meteoBatch(playas.map(p => ({ lat: p.lat, lng: p.lng })))
  const oficiales = await Promise.all(playas.map(async p => {
    // Cada playa está como mucho en una comunidad, así que solo se
    // consulta el adaptador que le corresponde: los `tiene*` son lookups
    // en memoria contra el mapa, sin red.
    try {
      if (tieneBanderaCat(p.slug)) return (await getBanderaCat(p.slug))?.bandera ?? null
      if (tieneBanderaCan(p.slug)) return (await getBanderaCan(p.slug))?.bandera ?? null
      if (tieneBanderaBiz(p.slug)) return (await getBanderaBiz(p.slug))?.bandera ?? null
      if (tieneBanderaGip(p.slug)) return (await getBanderaGip(p.slug))?.bandera ?? null
      if (tieneBanderaSb(p.slug)) return (await getBanderaSb(p.slug))?.bandera ?? null
      if (tieneBanderaFerrol(p.slug)) return (await getBanderaFerrol(p.slug))?.bandera ?? null
      if (tieneBanderaGijon(p.slug)) return (await getBanderaGijon(p.slug))?.bandera ?? null
      if (tieneBanderaAnd(p.slug)) {
        const o = await getBanderaAnd(p.slug)
        if (o?.cerrada) {
          return { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
            motivo: 'Playa cerrada hoy por la autoridad competente',
            motivoEn: 'Beach closed today by the authorities', hex: '#ef4444' } as const
        }
        return o?.bandera ?? null
      }
    } catch { /* una fuente caída no puede tumbar el listado entero */ }
    return null
  }))
  return playas.map((p, i) => {
    const m = meteos[i]
    const oficial = oficiales[i]
    // Si la playa tiene fuente oficial y hoy no ha llegado, NO se estima:
    // misma regla que la ficha. Mejor un hueco que un verde inventado
    // sobre una playa con el baño prohibido.
    const tieneFuente = tieneBanderaCat(p.slug) || tieneBanderaCan(p.slug)
      || tieneBanderaBiz(p.slug) || tieneBanderaGip(p.slug) || tieneBanderaAnd(p.slug)
    const bandera = oficial ?? (tieneFuente ? null : calcularBandera(m.olas, m.viento, m.racha))
    return {
      p, m,
      bandera,
      cert: (oficial ? 'oficial' : bandera ? 'estimado' : 'sindato') as 'oficial' | 'estimado' | 'sindato',
      medusas: estimarMedusas(p.lat, p.lng, m.tempAgua, m.viento, m.vientoDir),
    }
  })
}

/**
 * Las zonas con página propia.
 *
 * Cinco, no treinta, a propósito. El sitio ya tiene 171 páginas de
 * /municipio con 7 clics y 186 de /playas-accesibles con 3: añadir
 * geografía por sistema no ha funcionado nunca aquí, y el 38 % de las
 * impresiones del sitio ya vive en la posición 21 o peor.
 *
 * Estas cinco son las únicas con demanda MEDIDA en Search Console. Si en
 * seis semanas entran en el top 10, se extiende al resto de la costa; si se
 * quedan en la treinta, se para y no hemos creado 25 páginas muertas.
 */
export const ZONAS: Array<{
  slug: string
  nombre: string
  tipo: 'provincia' | 'comunidad'
  /** Provincias del dataset que agrupa. */
  provincias: string[]
  /**
   * De dónde sale la demanda de esta zona. Se anota SIEMPRE, porque de
   * aquí depende cómo se juzgue después:
   *
   * `gsc`         impresiones medidas en Search Console mar–ago 2026.
   *               Se comparan contra su propio número.
   * `sugerencias` el autocompletado de Google la propone al teclear
   *               «banderas hoy». Hay volumen detrás, sin cifra exacta.
   * `cobertura`   ninguna señal propia; entra por completar el mapa de
   *               la costa. Es la apuesta, y conviene saber cuál es:
   *               este sitio ya tiene 171 páginas de municipio con 7
   *               clics y 186 de accesibles con 3. Multiplicar
   *               geografía por sistema no le ha funcionado nunca.
   */
  evidencia: 'gsc' | 'sugerencias' | 'cobertura'
  /** Impresiones medidas mar–ago 2026. 0 si la evidencia no es GSC. */
  impresiones: number
}> = [
  { slug: 'tarragona', nombre: 'Tarragona', tipo: 'provincia', provincias: ['Tarragona'], evidencia: 'gsc', impresiones: 425 },
  { slug: 'valencia',  nombre: 'Valencia',  tipo: 'provincia', provincias: ['Valencia'],  evidencia: 'gsc', impresiones: 238 },
  { slug: 'cataluna',  nombre: 'Cataluña',  tipo: 'comunidad', provincias: ['Girona', 'Barcelona', 'Tarragona'], evidencia: 'gsc', impresiones: 184 },
  { slug: 'barcelona', nombre: 'Barcelona', tipo: 'provincia', provincias: ['Barcelona'], evidencia: 'gsc', impresiones: 93 },
  { slug: 'cantabria', nombre: 'Cantabria', tipo: 'comunidad', provincias: ['Cantabria'], evidencia: 'gsc', impresiones: 64 },

  // Segunda tanda (11-08-2026): la costa por provincias.
  //
  // Cuatro de estas —Bizkaia, Asturias, Alicante y Málaga— las propone
  // el autocompletado de Google al teclear «banderas hoy», y una
  // sugerencia solo aparece si hay volumen detrás. El resto entra por
  // cobertura, sin señal propia.
  //
  // Lo que NO justifica esta tanda: que las cinco de arriba funcionen.
  // Se publicaron el 8 de agosto y tres días no dicen nada en SEO.
  //
  // Ceuta (13 playas) y Melilla (6) se quedan fuera: no dan para una
  // página que se sostenga.
  //
  // La Manga del Mar Menor tiene demanda propia en el autocompletado
  // pero es una localidad, no una provincia: una franja de 20 km
  // repartida entre Cartagena y San Javier, que necesita recorte por
  // coordenadas. Queda para cuando se baje de nivel.
  { slug: 'a-coruna',    nombre: 'A Coruña',    tipo: 'provincia', provincias: ['A Coruña'],    evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'lugo',        nombre: 'Lugo',        tipo: 'provincia', provincias: ['Lugo'],        evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'pontevedra',  nombre: 'Pontevedra',  tipo: 'provincia', provincias: ['Pontevedra'],  evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'asturias',    nombre: 'Asturias',    tipo: 'comunidad', provincias: ['Asturias'],    evidencia: 'sugerencias', impresiones: 0 },
  { slug: 'bizkaia',     nombre: 'Bizkaia',     tipo: 'provincia', provincias: ['Bizkaia'],     evidencia: 'sugerencias', impresiones: 0 },
  { slug: 'gipuzkoa',    nombre: 'Gipuzkoa',    tipo: 'provincia', provincias: ['Gipuzkoa'],    evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'girona',      nombre: 'Girona',      tipo: 'provincia', provincias: ['Girona'],      evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'castellon',   nombre: 'Castellón',   tipo: 'provincia', provincias: ['Castellón'],   evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'alicante',    nombre: 'Alicante',    tipo: 'provincia', provincias: ['Alicante'],    evidencia: 'sugerencias', impresiones: 0 },
  { slug: 'murcia',      nombre: 'Murcia',      tipo: 'comunidad', provincias: ['Murcia'],      evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'huelva',      nombre: 'Huelva',      tipo: 'provincia', provincias: ['Huelva'],      evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'cadiz',       nombre: 'Cádiz',       tipo: 'provincia', provincias: ['Cádiz'],       evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'malaga',      nombre: 'Málaga',      tipo: 'provincia', provincias: ['Málaga'],      evidencia: 'sugerencias', impresiones: 0 },
  { slug: 'granada',     nombre: 'Granada',     tipo: 'provincia', provincias: ['Granada'],     evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'almeria',     nombre: 'Almería',     tipo: 'provincia', provincias: ['Almería'],     evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'baleares',    nombre: 'Baleares',    tipo: 'comunidad', provincias: ['Baleares'],    evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'las-palmas',  nombre: 'Las Palmas',  tipo: 'provincia', provincias: ['Las Palmas'],  evidencia: 'cobertura',   impresiones: 0 },
  { slug: 'tenerife',    nombre: 'Santa Cruz de Tenerife', tipo: 'provincia', provincias: ['Santa Cruz de Tenerife'], evidencia: 'cobertura', impresiones: 0 },
]

export const zonaPorSlug = (slug: string) => ZONAS.find(z => z.slug === slug)
