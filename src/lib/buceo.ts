// src/lib/buceo.ts — Centros y clubes de buceo cercanos via OSM Overpass.
// Query específica que filtra solo diving centers/schools, excluyendo
// surf y demás deportes que mezcla getEscuelas().
import { haversine } from './geo'
import { queryOverpass } from './overpass'

const RADIUS_M = 15000 // 15 km: centros de buceo están más dispersos

export interface CentroBuceo {
  id:           string
  nombre:       string
  tipo:         string
  distancia_m:  number
  certificacion?: string   // PADI, SSI, CMAS, ACUC, etc.
  profundidad?: string
  servicios:    string[]
  website?:     string | null
  telefono?:    string | null
  email?:       string | null
  lat:          number
  lon:          number
  source:       'osm'
}

function detectarCertificacion(tags: Record<string, string>): string | undefined {
  const name = (tags.name ?? '').toUpperCase()
  const desc = (tags.description ?? '').toUpperCase()
  const all = `${name} ${desc}`
  if (all.includes('PADI'))  return 'PADI'
  if (all.includes('SSI'))   return 'SSI'
  if (all.includes('CMAS'))  return 'CMAS'
  if (all.includes('ACUC'))  return 'ACUC'
  if (all.includes('NAUI'))  return 'NAUI'
  if (all.includes('FEDAS')) return 'FEDAS'
  return undefined
}

function detectarTipo(tags: Record<string, string>): string {
  const name = (tags.name ?? '').toLowerCase()
  if (name.includes('club'))   return 'Club de buceo'
  if (name.includes('school') || name.includes('escuela') || name.includes('escola')) return 'Escuela de buceo'
  if (name.includes('center') || name.includes('centro') || name.includes('centre')) return 'Centro de buceo'
  if (tags.amenity === 'diving_school') return 'Escuela de buceo'
  return 'Centro de buceo'
}

function extraerServicios(tags: Record<string, string>): string[] {
  const out: string[] = []
  const name = (tags.name ?? '' + ' ' + (tags.description ?? '')).toLowerCase()
  if (name.includes('snorkel'))    out.push('Snorkel')
  if (name.includes('bautismo') || name.includes('discover') || name.includes('try')) out.push('Bautismo')
  if (name.includes('curso') || name.includes('course'))     out.push('Cursos')
  if (name.includes('nitrox'))     out.push('Nitrox')
  if (name.includes('noche') || name.includes('night'))      out.push('Nocturno')
  if (name.includes('foto') || name.includes('photo'))       out.push('Foto submarina')
  if (tags.rental === 'yes')       out.push('Alquiler equipo')
  if (tags.shop === 'scuba_diving' || tags.shop === 'dive')  out.push('Tienda')
  if (out.length === 0) out.push('Inmersiones guiadas')
  return out
}

export async function getCentrosBuceo(lat: number, lon: number): Promise<CentroBuceo[]> {
  const query = `[out:json][timeout:10];
(
  node["sport"="scuba_diving"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="diving_school"](around:${RADIUS_M},${lat},${lon});
  node["shop"="scuba_diving"](around:${RADIUS_M},${lat},${lon});
  node["name"~"buceo|diving|dive|submarinism|inmersion|submarinis",i](around:${RADIUS_M},${lat},${lon});
  way["sport"="scuba_diving"](around:${RADIUS_M},${lat},${lon});
  way["amenity"="diving_school"](around:${RADIUS_M},${lat},${lon});
);
out center body 30;`

  const elements = await queryOverpass(query, {
    timeoutPerAttempt: 7000,
    revalidate: 86400,
    label: 'buceo',
  })
  if (!elements) return []

  return elements
    .filter((el: any) => el.tags?.name)
    .map((el: any): CentroBuceo => {
      const tags = el.tags ?? {}
      const elLat = el.lat ?? el.center?.lat ?? lat
      const elLon = el.lon ?? el.center?.lon ?? lon
      return {
        id:            String(el.id),
        nombre:        tags.name,
        tipo:          detectarTipo(tags),
        distancia_m:   Math.round(haversine(lat, lon, elLat, elLon)),
        certificacion: detectarCertificacion(tags),
        servicios:     extraerServicios(tags),
        website:       tags.website ?? tags['contact:website'] ?? null,
        telefono:      tags.phone ?? tags['contact:phone'] ?? null,
        email:         tags.email ?? tags['contact:email'] ?? null,
        lat:           elLat,
        lon:           elLon,
        source:        'osm',
      }
    })
    .sort((a: CentroBuceo, b: CentroBuceo) => a.distancia_m - b.distancia_m)
    .slice(0, 8)
}
