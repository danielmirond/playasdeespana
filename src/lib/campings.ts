// src/lib/campings.ts — Campings y áreas de autocaravanas cercanas via OSM.
//
// Usa el helper `queryOverpass` con retry + mirrors. Busca:
//   - tourism=camp_site    (camping tradicional)
//   - tourism=caravan_site (área de autocaravanas)
// Radio 10 km: los campings suelen estar más retirados de la costa que
// hoteles, y 5 km dejaba muchas playas sin resultados.
import { haversine } from './geo'
import { queryOverpass } from './overpass'

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

export async function getCampings(lat: number, lon: number): Promise<Camping[]> {
  // Nodes + ways (camping grandes suelen estar mapeados como área). `out center`
  // nos da lat/lon del centro para los ways. Limitamos a 40 resultados para
  // evitar JSON enorme de Overpass.
  const query = `[out:json][timeout:8];
(
  node["tourism"="camp_site"](around:${RADIUS_M},${lat},${lon});
  node["tourism"="caravan_site"](around:${RADIUS_M},${lat},${lon});
  way["tourism"="camp_site"](around:${RADIUS_M},${lat},${lon});
  way["tourism"="caravan_site"](around:${RADIUS_M},${lat},${lon});
);
out center body 40;`

  const elements = await queryOverpass(query, {
    timeoutPerAttempt: 7000,
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
