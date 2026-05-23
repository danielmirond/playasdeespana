// src/lib/calasSecretas.ts
//
// Selecciona "calas secretas" por destino aplicando heurística sobre
// el dataset real (5054 playas). Tu moat editorial: mientras los
// competidores se inventan "10 calas secretas de Mallorca" sin
// fundamento, tú las encuentras en datos oficiales MITECO + OSM:
//
// Heurística "cala secreta":
//   - longitud ≤ 200 m (calas pequeñas)
//   - SIN socorrismo + SIN parking + SIN duchas (poco urbanizada)
//   - SIN bandera azul (no en circuito turístico oficial)
//   - nombre evocativo (cala, caleta, ensenada, playa de…)
//   - tiene coords (renderizable en mapa)
//
// Captura el cluster:
//   - 'cala secreta' SV 880, KD 14
//   - 'calas secretas' SV 170, KD 8
//   - 'calas escondidas mallorca/ibiza/menorca/...' long-tail
//   - 'mejores calas' + destino

import type { Playa } from '@/types'
import { getPlayas } from './playas'

export interface DestinoCalasSecretas {
  slug:        string                                // URL slug
  nombre:      string                                // "Mallorca"
  provincia:   string
  filterDescr: string                                // 1 frase contexto
  /** Filtro lambda sobre playas para identificar las del destino */
  filter:      (p: Playa) => boolean
  /** Intro editorial específica del destino */
  hero:        string
}

// Municipios por isla (las islas baleares vienen mezcladas en provincia)
const IBIZA_MUNIS      = new Set(['Ibiza','Sant Antoni de Portmany','Sant Josep de sa Talaia','Santa Eulalia del Río','Sant Joan de Labritja','Eivissa','Sant Antoni'])
const MENORCA_MUNIS    = new Set(['Mahón','Maó','Ciudadela','Ciutadella','Es Mercadal','Es Migjorn Gran','Alaior','Ferreries','Sant Lluís','Es Castell','Maó-Mahón','Ciutadella de Menorca'])
const FORMENTERA_MUNIS = new Set(['Formentera','Sant Francesc Xavier','Sant Francesc de Formentera','La Mola','El Pilar de la Mola'])

export const DESTINOS_CALAS: DestinoCalasSecretas[] = [
  {
    slug:      'mallorca',
    nombre:    'Mallorca',
    provincia: 'Islas Baleares',
    filterDescr: 'Mallorca tiene 550 km de costa. Las calas escondidas se concentran en la Serra de Tramuntana y en el sureste (Santanyí, Manacor).',
    filter: (p) =>
      p.provincia === 'Islas Baleares'
      && !IBIZA_MUNIS.has(p.municipio)
      && !MENORCA_MUNIS.has(p.municipio)
      && !FORMENTERA_MUNIS.has(p.municipio),
    hero: 'Mallorca tiene 550 km de costa pero el 90 % del turismo se concentra en 12 playas conocidas. Estas calas secretas requieren caminata o llegar por mar — y compensan.',
  },
  {
    slug:      'ibiza',
    nombre:    'Ibiza',
    provincia: 'Islas Baleares',
    filterDescr: 'Ibiza concentra su turismo en 8 calas famosas. El resto del litoral (oeste y norte) guarda joyas accesibles solo a pie o por mar.',
    filter: (p) =>
      p.provincia === 'Islas Baleares' && IBIZA_MUNIS.has(p.municipio),
    hero: 'Más allá de Cala Comte, Salinas y Cala Bassa, Ibiza esconde calas vírgenes en el noroeste y norte. Pocas tienen acceso terrestre cómodo — lo que las protege del turismo masivo.',
  },
  {
    slug:      'menorca',
    nombre:    'Menorca',
    provincia: 'Islas Baleares',
    filterDescr: 'Menorca es Reserva de la Biosfera. Sus calas vírgenes del sur (Macarella vecinas) y norte salvaje ocultan rincones que aún no figuran en TripAdvisor.',
    filter: (p) =>
      p.provincia === 'Islas Baleares' && MENORCA_MUNIS.has(p.municipio),
    hero: 'Aparte de Macarella, Mitjana y Turqueta, Menorca esconde calas microscópicas en el sur (Trebalúger, Escorxada) y un norte salvaje rojizo (Cavalleria, Pregonda) con calitas escondidas entre.',
  },
  {
    slug:      'costa-brava',
    nombre:    'Costa Brava',
    provincia: 'Girona',
    filterDescr: 'La Costa Brava (Girona) tiene 200 km de litoral entre Blanes y la frontera francesa. El tramo del Cap de Creus es la zona menos transitada.',
    filter: (p) => p.provincia === 'Girona' || p.provincia === 'Gerona',
    hero: 'La Costa Brava tiene 250 calas reconocidas, pero solo 30-40 figuran en blogs. Las otras 200+ son justamente las "secretas" — algunas en el Parc Natural del Cap de Creus solo accesibles por mar.',
  },
  {
    slug:      'cabo-de-gata',
    nombre:    'Cabo de Gata',
    provincia: 'Almería',
    filterDescr: 'Cabo de Gata-Níjar es Parque Natural. Calas mineralizadas, agua transparente, fondo volcánico. Las accesibles solo a pie son las menos urbanizadas.',
    filter: (p) =>
      p.provincia === 'Almería' && (
        ['Níjar','Nijar','San José'].includes(p.municipio)
        || (p.municipio?.toLowerCase().includes('níjar'))
        || (p.municipio?.toLowerCase().includes('nijar'))
      ),
    hero: 'Cabo de Gata es Parque Natural protegido: sin urbanizaciones, sin chiringuitos en la mayoría. Calas como Enmedio, del Cuervo o del Bergantín solo son accesibles por sendero o mar.',
  },
  {
    slug:      'costa-blanca',
    nombre:    'Costa Blanca',
    provincia: 'Alicante',
    filterDescr: 'La Costa Blanca tiene 240 km. Más allá de Benidorm y Calp, las pequeñas calas de Jávea, Moraira y Villajoyosa permanecen tranquilas.',
    filter: (p) => p.provincia === 'Alicante',
    hero: 'Más allá del eje Benidorm-Calp, la Costa Blanca tiene cientos de calas pequeñas (Jávea, Moraira, Villajoyosa, El Campello) que la mayoría ignora.',
  },
  {
    slug:      'asturias',
    nombre:    'Asturias',
    provincia: 'Asturias',
    filterDescr: 'Asturias tiene 350 km de costa salvaje cantábrica. Playas blancas + acantilados verdes + arena, todo concentrado en calas pequeñas.',
    filter: (p) => p.provincia === 'Asturias',
    hero: 'Asturias es donde el norte español esconde sus mejores secretos: playas blancas, acantilados verdes, ríos que mueren en arena. El 80 % de las calas asturianas no aparece en mapas turísticos.',
  },
  {
    slug:      'galicia',
    nombre:    'Galicia',
    provincia: 'Pontevedra/A Coruña',
    filterDescr: 'Galicia (Pontevedra, A Coruña, Lugo) tiene las Rías Baixas y la Costa da Morte. Cientos de praias pequeñas con arena fina y agua transparente.',
    filter: (p) => ['A Coruña','La Coruña','Pontevedra','Lugo'].includes(p.provincia),
    hero: 'Galicia tiene la mayor densidad de playas de España (>1300 catalogadas). Aparte de Rodas y Catedrais, hay cientos de praias "secretas" en las Rías Baixas y la Costa da Morte donde nunca verás más de 20 personas.',
  },
]

export interface CalaSecreta {
  slug:        string                                // playa slug en /playas/X
  nombre:      string
  municipio:   string
  longitud:    number | null                         // metros
  composicion: string | null                         // 'arena', 'roca', etc.
  lat:         number
  lng:         number
  razon:       string                                // por qué es secreta
}

const NOMBRE_EVOCATIVO = /\b(cala|caleta|caló|playa de|ensenada|illa|cova|illeta|punta|praia)\b/i

function esSecreta(p: Playa): boolean {
  if (!p.lat || !p.lng) return false
  if (p.socorrismo) return false
  if (p.parking)    return false
  if (p.duchas)     return false
  if (p.bandera)    return false
  if (typeof p.longitud === 'number' && p.longitud > 200) return false
  if (!NOMBRE_EVOCATIVO.test(p.nombre ?? '')) return false
  return true
}

function razonSecreta(p: Playa): string {
  const partes: string[] = []
  if (typeof p.longitud === 'number' && p.longitud > 0 && p.longitud <= 80) {
    partes.push(`Cala microscópica (${p.longitud} m)`)
  } else if (typeof p.longitud === 'number' && p.longitud > 0) {
    partes.push(`Cala pequeña (${p.longitud} m)`)
  } else {
    partes.push('Cala pequeña')
  }

  const composiciones: Record<string, string> = {
    'roca':         'fondo de roca con charcos naturales',
    'grava':        'guijarros poco frecuentados',
    'arena':        'arena fina',
    'mixta':        'arena y roca mezclada',
  }
  const compTxt = composiciones[(p.composicion ?? '').toLowerCase()] ?? p.composicion
  if (compTxt) partes.push(`con ${compTxt}`)

  partes.push('sin chiringuitos ni servicios oficiales')
  partes.push('lo que la mantiene fuera del radar turístico')

  return partes.join(', ') + '.'
}

/** Devuelve las top N calas secretas del destino aplicando la
 *  heurística y ordenando por "más pequeña primero" (las microscópicas
 *  son la promesa más fuerte del cluster). */
export async function getCalasSecretasByDestino(slug: string, n = 8): Promise<CalaSecreta[]> {
  const dest = DESTINOS_CALAS.find(d => d.slug === slug)
  if (!dest) return []

  const playas = await getPlayas()
  const candidates = playas.filter(p => dest.filter(p) && esSecreta(p))

  candidates.sort((a, b) => {
    const lenA = a.longitud ?? 999
    const lenB = b.longitud ?? 999
    // Microscópicas (longitud > 0 muy pequeña) primero
    if (lenA > 0 && lenB > 0) return lenA - lenB
    if (lenA === 0 && lenB > 0) return 1
    if (lenA > 0 && lenB === 0) return -1
    return a.slug.localeCompare(b.slug)
  })

  return candidates.slice(0, n).map(p => ({
    slug:        p.slug,
    nombre:      p.nombre,
    municipio:   p.municipio,
    longitud:    typeof p.longitud === 'number' && p.longitud > 0 ? p.longitud : null,
    composicion: p.composicion,
    lat:         p.lat,
    lng:         p.lng,
    razon:       razonSecreta(p),
  }))
}

export function getDestinoCalasBySlug(slug: string): DestinoCalasSecretas | null {
  return DESTINOS_CALAS.find(d => d.slug === slug) ?? null
}
