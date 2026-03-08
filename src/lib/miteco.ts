// src/lib/miteco.ts
// Fetches beach data from MITECO via Esri ArcGIS Feature Service

import type { Playa } from '@/types'

const BASE =
  'https://services1.arcgis.com/nCKYwcSONQTkPA4K/arcgis/rest' +
  '/services/Playas_Espa%C3%B1olas/FeatureServer/0/query'

const FIELDS = [
  'OBJECTID', 'NOMBRE', 'MUNICIPIO', 'PROVINCIA', 'LONGITUD_PLAYA',
  'ANCHURA', 'TIPO_ARENA', 'COMPOSICION', 'ASEOS', 'DUCHAS',
  'SOCORRISMO', 'ACCESIBILIDAD', 'PERROS', 'PARKING', 'BAR',
  'BANDERA_AZUL',
].join(',')

// Genera slug SEO-friendly desde nombre y municipio
export function slugify(nombre: string, municipio: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // elimina acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  return `${clean(nombre)}-${clean(municipio)}`
}

// Normaliza un feature GeoJSON de Esri al tipo Playa interno
function normalizeFeature(f: any, idAemetMap: Record<string, string>): Playa {
  const p = f.properties
  const [lon, lat] = f.geometry?.coordinates ?? [0, 0]
  const id = String(f.id ?? p.OBJECTID)
  const nombre = p.NOMBRE?.trim() ?? ''
  const municipio = p.MUNICIPIO?.trim() ?? ''

  return {
    id,
    slug: slugify(nombre, municipio),
    nombre,
    municipio,
    provincia: p.PROVINCIA?.trim() ?? '',
    comunidad: provinciaAComunidad(p.PROVINCIA),
    geo: { lat, lon },
    id_miteco: id,
    id_aemet: idAemetMap[id] ?? null,
    id_eea: null,  // se cruza en sync:calidad
    fisico: {
      longitud_m: p.LONGITUD_PLAYA ?? 0,
      anchura_m: p.ANCHURA ?? 0,
      arena: p.TIPO_ARENA ?? '',
      composicion: p.COMPOSICION ?? '',
    },
    servicios: {
      socorrismo: p.SOCORRISMO === 'S',
      aseos: p.ASEOS === 'S',
      duchas: p.DUCHAS === 'S',
      accesible: p.ACCESIBILIDAD === 'S',
      perros: p.PERROS === 'S',
      parking: p.PARKING === 'S',
      bar: p.BAR === 'S',
    },
    bandera_azul: p.BANDERA_AZUL === 'S',
    calidad_agua: null,  // se enriquece con EEA
  }
}

// Fetch con paginación automática (Esri limita a 1000 por request)
export async function fetchTodasLasPlayas(
  idAemetMap: Record<string, string> = {}
): Promise<Playa[]> {
  const playas: Playa[] = []
  let offset = 0
  const pageSize = 1000

  while (true) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: FIELDS,
      f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    })

    const res = await fetch(`${BASE}?${params}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },  // caché 7 días
    })

    if (!res.ok) throw new Error(`MITECO error ${res.status}`)
    const data = await res.json()
    const features = data.features ?? []
    playas.push(...features.map((f: any) => normalizeFeature(f, idAemetMap)))

    if (features.length < pageSize) break
    offset += pageSize
  }

  return playas
}

// Fetch una sola playa por slug (para página dinámica)
export async function fetchPlayaPorSlug(slug: string): Promise<Playa | null> {
  // En producción esto vendría de tu BD o de un JSON estático generado en build
  // Aquí se muestra la lógica de fallback contra la API
  const params = new URLSearchParams({
    where: `LOWER(NOMBRE) LIKE '%${slug.split('-')[0]}%'`,
    outFields: FIELDS,
    f: 'geojson',
    resultRecordCount: '10',
  })

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  const features = data.features ?? []
  if (!features.length) return null

  const candidates = features.map((f: any) => normalizeFeature(f, {}))
  return candidates.find((p: Playa) => p.slug === slug) ?? candidates[0]
}

// Mapa provincia → comunidad autónoma (simplificado)
function provinciaAComunidad(prov: string): string {
  const map: Record<string, string> = {
    'A CORUÑA': 'Galicia', 'LUGO': 'Galicia', 'PONTEVEDRA': 'Galicia',
    'ASTURIAS': 'Asturias',
    'CANTABRIA': 'Cantabria',
    'BIZKAIA': 'País Vasco', 'GIPUZKOA': 'País Vasco',
    'NAVARRA': 'Navarra',
    'GIRONA': 'Cataluña', 'BARCELONA': 'Cataluña', 'TARRAGONA': 'Cataluña',
    'CASTELLÓN': 'Comunitat Valenciana', 'VALENCIA': 'Comunitat Valenciana',
    'ALICANTE': 'Comunitat Valenciana',
    'MURCIA': 'Murcia',
    'ALMERÍA': 'Andalucía', 'GRANADA': 'Andalucía', 'MÁLAGA': 'Andalucía',
    'CÁDIZ': 'Andalucía', 'HUELVA': 'Andalucía',
    'LAS PALMAS': 'Canarias', 'SANTA CRUZ DE TENERIFE': 'Canarias',
    'ILLES BALEARS': 'Islas Baleares',
    'CEUTA': 'Ceuta', 'MELILLA': 'Melilla',
  }
  return map[prov?.toUpperCase()] ?? 'España'
}
