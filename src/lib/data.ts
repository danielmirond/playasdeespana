import fs from 'fs'
import path from 'path'
import type { Playa } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

function readJSON<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
  } catch { return null }
}

// Carga todas las playas del JSON generado por sync-playas.js
export function getAllPlayas(): Playa[] {
  return readJSON<Playa[]>('playas.json') ?? []
}

// Playas destacadas — bandera azul + calidad excelente, ordenadas por provincia conocida
export async function getPlayasDestacadas(n = 12): Promise<Playa[]> {
  const all = getAllPlayas()
  const featured = all
    .filter(p => p.bandera && (p as any).calidad_agua === "Excelente")
    .slice(0, n)
    .map(toCard)

  // Si no hay datos reales aún, devuelve mocks para desarrollo
  if (!featured.length) return getMockDestacadas(n)
  return featured
}

// Índice comunidad → lista de playas
export async function getPlayasPorComunidad(): Promise<Record<string, Playa[]>> {
  const all = getAllPlayas()
  const map: Record<string, Playa[]> = {}
  all.forEach(p => {
    if (!map[p.comunidad]) map[p.comunidad] = []
    map[p.comunidad].push(toCard(p))
  })
  return map
}

export async function getComunidades(): Promise<ComunidadSummary[]> {
  const all = getAllPlayas()
  const map: Record<string, { total: number; azul: number; lat: number; lon: number }> = {}
  all.forEach(p => {
    if (!map[p.comunidad]) map[p.comunidad] = { total: 0, azul: 0, lat: p.lat, lon: p.lng }
    map[p.comunidad].total++
    if (p.bandera) map[p.comunidad].azul++
  })
  const result = Object.entries(map).map(([nombre, d]) => ({ nombre, ...d }))
  if (!result.length) return getMockComunidades()
  return result
}

function toCard(p: Playa): Playa { return p }
}

// ── MOCKS para desarrollo (antes de ejecutar sync-playas.js) ─────────────────
export function getMockDestacadas(n: number): Playa[] {
  return MOCK_PLAYAS.slice(0, n)
}

export function getMockComunidades(): ComunidadSummary[] {
  return MOCK_COMUNIDADES
}

export interface ComunidadSummary {
  nombre: string; total: number; azul: number; lat: number; lon: number
}

const MOCK_PLAYAS: Playa[] = [
  { slug:'la-barceloneta-barcelona',     nombre:'La Barceloneta',    municipio:'Barcelona',     provincia:'Barcelona',     comunidad:'Cataluña',            lat:41.378, lon:2.194,  bandera_azul:false, calidad_agua:'Excelente' },
  { slug:'la-malagueta-malaga',          nombre:'La Malagueta',      municipio:'Málaga',         provincia:'Málaga',         comunidad:'Andalucía',           lat:36.718, lon:-4.407, bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'playa-de-riazor-a-coruna',     nombre:'Playa de Riazor',   municipio:'A Coruña',       provincia:'A Coruña',       comunidad:'Galicia',             lat:43.368, lon:-8.419, bandera_azul:true,  calidad_agua:'Buena'     },
  { slug:'maspalomas-san-bartolome',     nombre:'Maspalomas',         municipio:'San Bartolomé',  provincia:'Las Palmas',     comunidad:'Canarias',            lat:27.740, lon:-15.589,bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'can-pere-antoni-palma',        nombre:'Can Pere Antoni',   municipio:'Palma',          provincia:'Islas Baleares', comunidad:'Islas Baleares',      lat:39.556, lon:2.630,  bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'la-concha-san-sebastian',      nombre:'La Concha',         municipio:'San Sebastián',  provincia:'Gipuzkoa',       comunidad:'País Vasco',          lat:43.320, lon:-2.003, bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'playa-de-las-teresitas-santa-cruz', nombre:'Las Teresitas', municipio:'Santa Cruz',   provincia:'S.C. Tenerife',  comunidad:'Canarias',            lat:28.510, lon:-16.170,bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'playa-de-levante-benidorm',    nombre:'Playa de Levante',  municipio:'Benidorm',       provincia:'Alicante',       comunidad:'Comunitat Valenciana',lat:38.540, lon:-0.124, bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'playa-de-la-victoria-cadiz',   nombre:'Playa de la Victoria',municipio:'Cádiz',        provincia:'Cádiz',          comunidad:'Andalucía',           lat:36.522, lon:-6.306, bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'playa-de-san-lorenzo-gijon',   nombre:'Playa de San Lorenzo',municipio:'Gijón',        provincia:'Asturias',       comunidad:'Asturias',            lat:43.540, lon:-5.656, bandera_azul:true,  calidad_agua:'Buena'     },
  { slug:'playa-de-el-sardinero-santander',nombre:'El Sardinero',    municipio:'Santander',      provincia:'Cantabria',      comunidad:'Cantabria',           lat:43.477, lon:-3.793, bandera_azul:true,  calidad_agua:'Excelente' },
  { slug:'playa-es-trenc-campos',        nombre:'Es Trenc',          municipio:'Campos',         provincia:'Islas Baleares', comunidad:'Islas Baleares',      lat:39.340, lon:2.998,  bandera_azul:false, calidad_agua:'Excelente' },
]

const MOCK_COMUNIDADES: ComunidadSummary[] = [
  { nombre:'Andalucía',            total:820, azul:142, lat:36.7, lon:-4.4  },
  { nombre:'Cataluña',             total:440, azul:98,  lat:41.4, lon:2.2   },
  { nombre:'Comunitat Valenciana', total:390, azul:111, lat:39.5, lon:-0.4  },
  { nombre:'Canarias',             total:320, azul:88,  lat:28.3, lon:-15.4 },
  { nombre:'Galicia',              total:720, azul:134, lat:42.8, lon:-8.5  },
  { nombre:'Islas Baleares',       total:290, azul:80,  lat:39.6, lon:2.9   },
  { nombre:'Asturias',             total:210, azul:41,  lat:43.4, lon:-5.9  },
  { nombre:'Cantabria',            total:140, azul:33,  lat:43.3, lon:-4.0  },
  { nombre:'País Vasco',           total:90,  azul:22,  lat:43.3, lon:-2.4  },
  { nombre:'Murcia',               total:80,  azul:19,  lat:37.9, lon:-1.1  },
]
