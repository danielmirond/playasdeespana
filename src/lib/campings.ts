// src/lib/campings.ts — Campings y áreas de autocaravanas cercanas via OSM.
//
// Usa el helper `queryOverpass` con retry + mirrors. Busca:
//   - tourism=camp_site    (camping tradicional)
//   - tourism=caravan_site (área de autocaravanas)
// Radio 10 km: los campings suelen estar más retirados de la costa que
// hoteles, y 5 km dejaba muchas playas sin resultados.
import { haversine } from './geo'
import { queryOverpass } from './overpass'
import { kvCached } from './kv-cache'

const RADIUS_M = 10000

export interface Camping {
  id:          string
  nombre:      string
  tipo:        'Camping' | 'Autocaravanas' | 'Glamping'
  /** Categoría 1-5 estrellas/tridentes inferida de tags OSM + nombre */
  categoria:   number
  distancia_m: number
  /** Servicios disponibles (lista de labels cortos en ES) */
  servicios:   string[]
  /** true si admite tiendas, false si solo autocaravanas */
  tiendas:     boolean
  /** true si admite autocaravanas */
  autocaravanas: boolean
  /** true si hay cabañas/bungalows */
  bungalows:   boolean
  /** true si acepta perros (puede ser undefined si OSM no lo dice) */
  perros?:     boolean
  website?:    string | null
  telefono?:   string | null
  email?:      string | null
  lat:         number
  lon:         number
  source:      'osm'
}

// Infiere 1-5 estrellas desde tags + nombre. Los campings españoles
// usan el sistema oficial de 1ª, 2ª, 3ª categoría + lujo.
function inferirCategoria(tags: Record<string, string>): number {
  const stars = parseInt(tags['stars'] ?? tags['tourism:stars'] ?? '0')
  if (stars > 0) return Math.min(stars, 5)
  const nombre = (tags.name ?? '').toLowerCase()
  if (nombre.includes('resort') || nombre.includes('lujo') || nombre.includes('premium')) return 5
  if (nombre.includes('glamping') || nombre.includes('1ª') || nombre.includes('primera')) return 4
  if (nombre.includes('2ª') || nombre.includes('segunda')) return 3
  if (nombre.includes('3ª') || nombre.includes('tercera')) return 2
  if (tags.tourism === 'caravan_site') return 2
  return 3  // default categoría media
}

function isGlamping(tags: Record<string, string>): boolean {
  const nombre = (tags.name ?? '').toLowerCase()
  return nombre.includes('glamping') || tags.glamping === 'yes'
}

// Extrae servicios visibles desde tags OSM. Priorizamos los más
// relevantes para elegir camping (no listamos todo el catálogo OSM).
function extraerServicios(tags: Record<string, string>): string[] {
  const out: string[] = []
  if (tags.swimming_pool === 'yes' || tags.swimming_pool === 'outdoor') out.push('Piscina')
  if (tags.playground === 'yes')          out.push('Parque infantil')
  if (tags.restaurant === 'yes' || tags.amenity === 'restaurant') out.push('Restaurante')
  if (tags.bar === 'yes' || tags.amenity === 'bar') out.push('Bar')
  if (tags.supermarket === 'yes' || tags.shop === 'supermarket') out.push('Supermercado')
  if (tags['sanitary_dump_station'] === 'yes' || tags.sanitary === 'yes') out.push('Vaciado')
  if (tags.power_supply === 'yes' || tags.electricity === 'yes') out.push('Enganche eléctrico')
  if (tags.shower === 'yes' || tags.showers === 'yes') out.push('Duchas')
  if (tags.washing_machine === 'yes' || tags.laundry === 'yes') out.push('Lavandería')
  if (tags.wifi === 'yes' || tags.internet_access === 'wlan' || tags.internet_access === 'yes') out.push('WiFi')
  return out
}

// TTL: campings cambian poco. 7 días.
const KV_TTL_CAMPINGS = 7 * 24 * 3600

export function getCampings(lat: number, lon: number): Promise<Camping[]> {
  return kvCached('campings', [lat, lon], KV_TTL_CAMPINGS, () => fetchCampingsFromOverpass(lat, lon))
}

async function fetchCampingsFromOverpass(lat: number, lon: number): Promise<Camping[]> {
  // Nodes + ways (camping grandes suelen estar mapeados como área). `out center`
  // nos da lat/lon del centro para los ways. Limitamos a 40 resultados para
  // evitar JSON enorme de Overpass.
  const query = `[out:json][timeout:1];
(
  node["tourism"="camp_site"](around:${RADIUS_M},${lat},${lon});
  node["tourism"="caravan_site"](around:${RADIUS_M},${lat},${lon});
  way["tourism"="camp_site"](around:${RADIUS_M},${lat},${lon});
  way["tourism"="caravan_site"](around:${RADIUS_M},${lat},${lon});
);
out center body 40;`

  const elements = await queryOverpass(query, {
    timeoutPerAttempt: 6000, // Reducido de 7s: 3 mirrors × 2s = 6s máx durante build
    revalidate: 86400,
    label: 'campings',
  })
  if (!elements) return []

  return elements
    .filter((el: any) => el.tags?.name)
    .map((el: any): Camping => {
      const tags = el.tags ?? {}
      const elLat = el.lat ?? el.center?.lat ?? lat
      const elLon = el.lon ?? el.center?.lon ?? lon
      const esAutocaravanasSolo = tags.tourism === 'caravan_site'
      const glamping = isGlamping(tags)
      const tipo: Camping['tipo'] = glamping ? 'Glamping' : esAutocaravanasSolo ? 'Autocaravanas' : 'Camping'

      // Perros: OSM lo marca con dog=yes/no
      let perros: boolean | undefined
      if (tags.dog === 'yes' || tags.dogs === 'yes') perros = true
      else if (tags.dog === 'no' || tags.dogs === 'no') perros = false

      return {
        id:          String(el.id),
        nombre:      tags.name,
        tipo,
        categoria:   inferirCategoria(tags),
        distancia_m: Math.round(haversine(lat, lon, elLat, elLon)),
        servicios:   extraerServicios(tags),
        tiendas:     tags.tents !== 'no' && !esAutocaravanasSolo,
        autocaravanas: tags.caravans !== 'no' || esAutocaravanasSolo,
        bungalows:   tags.cabins === 'yes' || tags.static_caravans === 'yes',
        perros,
        website:     tags.website ?? tags['contact:website'] ?? null,
        telefono:    tags.phone ?? tags['contact:phone'] ?? null,
        email:       tags.email ?? tags['contact:email'] ?? null,
        lat:         elLat,
        lon:         elLon,
        source:      'osm',
      }
    })
    .sort((a: Camping, b: Camping) => a.distancia_m - b.distancia_m)
    .slice(0, 5)
}


// ── Por provincia / bbox ────────────────────────────────────────────
//
// Consulta Overpass UNA vez para todo el bbox de una provincia y
// devuelve campings con la playa más cercana adjunta. Pensado para las
// landings /campings y /campings/[provincia] que necesitan listar
// campings reales (no playas).

export interface CampingConPlaya extends Camping {
  /** Playa más cercana al camping (de playas.json). */
  playa: {
    slug:       string
    nombre:     string
    municipio:  string
    distancia_m:number
  } | null
}

interface BBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

function bboxFromPoints(points: Array<{lat: number; lng: number}>, padding = 0.05): BBox {
  if (points.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  return {
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding,
    minLng: Math.min(...lngs) - padding,
    maxLng: Math.max(...lngs) + padding,
  }
}

/**
 * Devuelve campings dentro del bbox de un conjunto de playas (provincia,
 * comunidad, etc.) con la playa más cercana adjunta. ISR 7 días por
 * defecto al cachear el fetch de Overpass.
 */
export async function getCampingsEnBbox(
  playas: Array<{ slug: string; nombre: string; municipio: string; lat: number; lng: number }>,
  options: { revalidate?: number; max?: number } = {}
): Promise<CampingConPlaya[]> {
  if (playas.length === 0) return []
  const bbox = bboxFromPoints(playas)
  // Overpass bbox: south,west,north,east
  const bboxStr = `${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}`

  const query = `[out:json][timeout:1];
(
  node["tourism"="camp_site"](${bboxStr});
  node["tourism"="caravan_site"](${bboxStr});
  way["tourism"="camp_site"](${bboxStr});
  way["tourism"="caravan_site"](${bboxStr});
);
out center body 200;`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elements = await queryOverpass(query, {
    timeoutPerAttempt: 6000, // Reducido para build
    revalidate: options.revalidate ?? 7 * 86400,
    label: 'campings-bbox',
  })
  if (!elements) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const max = options.max ?? 100

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const camps: CampingConPlaya[] = elements
    .filter((el: any) => el.tags?.name)
    .map((el: any): CampingConPlaya => {
      const tags = el.tags ?? {}
      const elLat = el.lat ?? el.center?.lat
      const elLon = el.lon ?? el.center?.lon
      if (typeof elLat !== 'number' || typeof elLon !== 'number') return null as never

      // Playa más cercana
      let nearest = null as CampingConPlaya['playa']
      let nearestDist = Infinity
      for (const p of playas) {
        const d = haversine(elLat, elLon, p.lat, p.lng)
        if (d < nearestDist) {
          nearestDist = d
          nearest = { slug: p.slug, nombre: p.nombre, municipio: p.municipio, distancia_m: Math.round(d) }
        }
      }

      const esAutocaravanasSolo = tags.tourism === 'caravan_site'
      const glamping = isGlamping(tags)
      const tipo: Camping['tipo'] = glamping ? 'Glamping' : esAutocaravanasSolo ? 'Autocaravanas' : 'Camping'

      let perros: boolean | undefined
      if (tags.dog === 'yes' || tags.dogs === 'yes') perros = true
      else if (tags.dog === 'no' || tags.dogs === 'no') perros = false

      return {
        id:          String(el.id),
        nombre:      tags.name,
        tipo,
        categoria:   inferirCategoria(tags),
        distancia_m: nearest?.distancia_m ?? 0,
        servicios:   extraerServicios(tags),
        tiendas:     tags.tents !== 'no' && !esAutocaravanasSolo,
        autocaravanas: tags.caravans !== 'no' || esAutocaravanasSolo,
        bungalows:   tags.cabins === 'yes' || tags.static_caravans === 'yes',
        perros,
        website:     tags.website ?? tags['contact:website'] ?? null,
        telefono:    tags.phone ?? tags['contact:phone'] ?? null,
        email:       tags.email ?? tags['contact:email'] ?? null,
        lat:         elLat,
        lon:         elLon,
        source:      'osm',
        playa:       nearest,
      }
    })
    .filter(Boolean)
    .sort((a: CampingConPlaya, b: CampingConPlaya) => (a.playa?.distancia_m ?? Infinity) - (b.playa?.distancia_m ?? Infinity))
    .slice(0, max)

  return camps
}
