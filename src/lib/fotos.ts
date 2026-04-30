// src/lib/fotos.ts — Fotos de playas con matching preciso playa↔ubicación
// Estrategia en cascada (de más preciso a más genérico):
//   1. Wikimedia Commons: geosearch por coordenadas (radio 1500m) — sin key
//   2. OpenVerse: agregador CC (Wikimedia + Flickr + más) por nombre+municipio — sin key
//   3. Flickr: feed público con tags (nombre+municipio+beach) — sin key
//   4. Wikimedia Commons: text search con nombre + municipio — sin key
//   5. Pexels: búsqueda por municipio (requiere PEXELS_API_KEY)
//   6. Unsplash: búsqueda por municipio (requiere UNSPLASH_ACCESS_KEY)
import { fetchWithTimeout } from './fetch-timeout'

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
const PEXELS_KEY   = process.env.PEXELS_API_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'unsplash' | 'wikimedia' | 'flickr' | 'openverse' | 'pexels'
  autor?: string
}

// Palabras negativas que descartamos de títulos / nombres de archivo.
// Cubre: cartografía y símbolos; arquitectura urbana y religiosa;
// vehículos, militar, eventos deportivos no costeros; industria;
// otros falsos positivos que el filtro original dejaba pasar (Melilla
// con tanques de 'arena' del desierto, Castro-Urdiales con iglesia,
// Mapillary street-view en El Chorrillo, etc.).
const NEGATIVAS = new RegExp(
  '\\b(' +
  // Cartografía y símbolos
  'map|mapa|plan(o|os)?|logo|flag|bandera|diagram|diagrama|' +
  'coat|escudo|sign|placa|coordinate|rotulo|icon|chart|grafic|' +
  // Arquitectura religiosa
  'iglesia|church|ermita|capilla|basilica|catedral|cathedral|' +
  'convento|monasterio|monastery|abadia|abbey|santuario|' +
  // Arquitectura civil / monumentos / culturales
  'monumento|monument|estatua|statue|busto|bust|escultura|sculpture|' +
  'museo|museum|ayuntamiento|edificio|building|fachada|facade|' +
  'castillo|castle|fortaleza|fortress|alcazaba|alcazar|tower|' +
  'cementerio|cemetery|tumba|tomb|necropolis|' +
  // Captura urbana y vehículos
  'street(view)?|streetview|mapillary|panoramio|driving|coche|car|' +
  'vehiculo|vehicle|camion|truck|bus|train|aerial|drone|' +
  // Interiores y detalles arquitectónicos
  'interior(_de)?|fachada|' +
  // Militar / vehículos pesados
  'tanque|tank|militar|military|ejercito|army|guerra|war|soldado|soldier|' +
  'arma|weapon|cuartel|barracks|maniobra|training_exercise|' +
  // Eventos deportivos no costeros
  'motocross|motorbike|motorcycle|motocicleta|moto_|enduro|' +
  'carrera|race|racing|carreras|competicion|maraton|marathon|' +
  'futbol|football|baloncesto|basketball|tenis|tennis|golf|' +
  // Conciertos / festivales / fiestas
  'concierto|concert|festival|fiesta|party|disco|nightclub|' +
  // Industrial / no recreativo
  'fabrica|factory|industrial|silo|chimenea|chimney|grua|crane|' +
  // Personas en primer plano (queremos paisaje, no retratos)
  'retrato|portrait|selfie|autorretrato|self_portrait|posing|posando|' +
  'modelo|model|models|modelos|modeling|fashion|moda|' +
  'family|familia|wedding|boda|novio|novia|bride|groom|' +
  'niño|niños|nina|ninas|kid|kids|child|children|baby|bebe|toddler|' +
  'gente|people|crowd|multitud|grupo|group|equipo|team|' +
  'bañista|bañistas|bather|bathers|swimmer|swimmers|' +
  'sunbather|tomando_el_sol|tumbado|tumbada|broncear|tanning|' +
  'beachgoer|beachgoers|turista|tourist|visitante|visitor|' +
  'amigos|friends|pareja|couple|abrazo|hug|kissing|besando|' +
  'bikini|swimsuit|topless|nudista|nudist|naked|nude|desnudo|desnuda|' +
  // Otros típicos falsos positivos
  'parking_lot|garaje|garage|hotel(?!_playa)|restaurante(?!_playa)' +
  ')\\b',
  'i'
)

// Palabras positivas que se requieren para aceptar fotos en modo
// estricto (cards, listados). Si el título no menciona playa/costa/
// mar/arena/etc., se descarta.
const POSITIVAS = new RegExp(
  '\\b(' +
  // Términos directos
  'beach|playa(?!_de_aparcamiento)|platja|praia|' +
  // Geografía costera
  'costa|coast|shore|orilla|ribera|litoral|seaside|seafront|' +
  'mar|sea|ocean|oceano|bahia|bay|ensenada|cala|caleta|' +
  // Elementos típicos de playa
  'arena|sand|sandy|duna|dune|guijarro|pebble|rocosa|' +
  'acantilado|cliff|escarpado|rompiente|cantera|paseo_maritimo|' +
  // Elementos visibles (sin personas en primer plano)
  'chiringuito|sombrilla|umbrella|hamaca|paseo|' +
  // Actividades como signal de contexto playero (la mayoría muestran
  // mar/olas, no retratos): mantenemos pero NEGATIVAS personas filtra
  // primero los que sí son retratos de surfistas/etc.
  'surf|surfing|kitesurf|windsurf|snorkel|paddle|kayak|' +
  // Estados visuales asociables
  'atardecer|sunset|amanecer|sunrise|horizonte|horizon|' +
  // Conceptos editoriales
  'panoramica|panorama|vista|view' +
  ')\\b',
  'i'
)

function extraerFotosDePages(pages: any[]): FotoPlaya[] {
  return pages
    .map((p: any) => {
      const ii = p.imageinfo?.[0]
      if (!ii?.thumburl) return null
      const titulo = (p.title ?? '').toLowerCase()
      if (NEGATIVAS.test(titulo)) return null
      const ext = ii.url?.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return null
      const w = ii.width ?? 0
      const h = ii.height ?? 0
      // Descartar imágenes muy pequeñas, verticales raras o mapas
      if (w > 0 && h > 0) {
        if (w < 500) return null
        // Aspect ratio razonable (ni cuadrados raros ni verticales extremos)
        const ratio = w / h
        if (ratio < 0.7 || ratio > 3) return null
      }
      const score = POSITIVAS.test(titulo) ? 1 : 0
      // Wikimedia devuelve un thumb a 800px (iiurlwidth). Usamos esa misma
      // URL para ambos tamaños: evita falsos 404 que aparecían antes por
      // intentar reconstruir un /300px-/ que no siempre existe (imágenes
      // más pequeñas que 800, o con nombres con dígitos que rompían el regex).
      return {
        score,
        url: ii.thumburl,
        thumb: ii.thumburl,
        fuente: 'wikimedia' as const,
        autor: ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').slice(0, 60) ?? undefined,
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.score - a.score)
    .map(({ score, ...rest }: any) => rest) as FotoPlaya[]
}

// Wikimedia — geosearch por coordenadas (1500m). MODO ESTRICTO:
// la geosearch devuelve cualquier foto subida en la zona (iglesias,
// monumentos, edificios). Filtramos exigiendo que el nombre del
// archivo contenga al menos una palabra del catálogo POSITIVAS. Si
// no hay matches, devolvemos vacío y dejamos que otra fuente lo
// intente, en lugar de servir un edificio cercano.
async function getFotosWikimediaGeo(lat: number, lon: number): Promise<FotoPlaya[]> {
  try {
    const params = new URLSearchParams({
      action:       'query',
      generator:    'geosearch',
      ggsnamespace: '6',
      ggscoord:     `${lat}|${lon}`,
      ggsradius:    '1500',
      ggslimit:     '30',
      prop:         'imageinfo|pageprops',
      iiprop:       'url|extmetadata|size',
      iiurlwidth:   '800',
      format:       'json',
      origin:       '*',
    })
    const res = await fetchWithTimeout(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = Object.values(data.query?.pages ?? {}) as any[]
    const fotos = extraerFotosDePages(pages)
    const beachish = fotos.filter(f => {
      try {
        return POSITIVAS.test(decodeURIComponent(f.url).toLowerCase())
      } catch { return false }
    })
    return beachish.slice(0, 6)
  } catch {
    return []
  }
}

// Wikimedia — búsqueda textual con nombre + municipio entre comillas
async function getFotosWikimediaText(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  // Preparar queries combinando nombre de playa + municipio en varias formas
  const n = nombre.replace(/"/g, '')
  const m = municipio.replace(/"/g, '')
  const queries = [
    `"${n}" "${m}"`,            // nombre + municipio (máxima precisión)
    `"${n}" ${m} beach`,
    `"${n}" ${m} playa`,
    `"${n}" ${m}`,
    `${n} ${m}`,
  ]

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        action:      'query',
        generator:   'search',
        gsrnamespace:'6',
        gsrsearch:   `${q} filetype:bitmap`,
        gsrlimit:    '10',
        prop:        'imageinfo|pageprops',
        iiprop:      'url|extmetadata|size',
        iiurlwidth:  '800',
        format:      'json',
        origin:      '*',
      })
      const res = await fetchWithTimeout(
        `https://commons.wikimedia.org/w/api.php?${params}`,
        { next: { revalidate: 86400 } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const pages = Object.values(data.query?.pages ?? {}) as any[]
      const fotos = extraerFotosDePages(pages)
      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

// Unsplash — búsqueda por municipio + keywords playa
async function getFotosUnsplash(municipio: string, provincia: string): Promise<FotoPlaya[]> {
  if (!UNSPLASH_KEY) return []
  // Probar varias queries de más a menos específicas
  const queries = [
    `${municipio} beach`,
    `${municipio} playa`,
    `${municipio} coast`,
    `${provincia} beach spain`,
  ]
  for (const q of queries) {
    try {
      const res = await fetchWithTimeout(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&content_filter=high`,
        {
          headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      const results = data.results ?? []
      if (results.length === 0) continue
      return results.map((p: any): FotoPlaya => ({
        url:    p.urls.regular,
        thumb:  p.urls.small,
        fuente: 'unsplash',
        autor:  p.user?.name,
      }))
    } catch {
      continue
    }
  }
  return []
}

// OpenVerse — agregador CC (Wikimedia + Flickr + Smithsonian + …)
// API pública sin key. Rate limit: 100 req/min anónimo, 5000/min con key.
// https://api.openverse.org/v1/images/
async function getFotosOpenVerse(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  // Probar de más específico a más general
  const queries = [
    `"${nombre}" "${municipio}"`,
    `"${nombre}" ${municipio} beach`,
    `${nombre} ${municipio} playa`,
    `${municipio} beach`,
  ]
  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        q,
        license_type: 'all-cc',          // commercial-friendly + share-alike
        category:     'photograph',       // descarta ilustraciones, mapas
        size:         'large',
        aspect_ratio: 'wide',
        page_size:    '8',
      })
      const res = await fetchWithTimeout(
        `https://api.openverse.org/v1/images/?${params}`,
        { next: { revalidate: 86400 } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const results = data?.results ?? []
      if (results.length === 0) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fotos: FotoPlaya[] = results.map((r: any): FotoPlaya | null => {
        const url = r.url
        const thumb = r.thumbnail ?? r.url
        if (!url || typeof url !== 'string') return null
        const titulo = (r.title ?? '').toLowerCase()
        if (NEGATIVAS.test(titulo)) return null
        // Modo estricto: el título debe sugerir playa. OpenVerse devuelve
        // resultados aunque la query incluya "beach" — algunos no son
        // playa (motocross, eventos, etc.). Sin POSITIVAS, descartamos.
        if (!POSITIVAS.test(titulo)) return null
        return {
          url,
          thumb,
          fuente: 'openverse' as const,
          autor: r.creator?.slice(0, 60) ?? undefined,
        }
      }).filter(Boolean) as FotoPlaya[]

      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

// Pexels — fotos profesionales con API key gratuita (200 req/h).
// Útil como fallback genérico por municipio si nada más funciona.
async function getFotosPexels(municipio: string, provincia: string): Promise<FotoPlaya[]> {
  if (!PEXELS_KEY) return []
  const queries = [
    `${municipio} beach`,
    `${municipio} playa`,
    `${municipio} costa`,
    `${provincia} beach spain`,
  ]
  for (const q of queries) {
    try {
      const res = await fetchWithTimeout(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&size=large`,
        {
          headers: { Authorization: PEXELS_KEY },
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      const photos = data?.photos ?? []
      if (photos.length === 0) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return photos.map((p: any): FotoPlaya => ({
        url:    p.src?.large2x ?? p.src?.large ?? p.src?.original,
        thumb:  p.src?.medium ?? p.src?.small,
        fuente: 'pexels',
        autor:  p.photographer,
      })).filter((f: FotoPlaya) => !!f.url)
    } catch {
      continue
    }
  }
  return []
}

// Flickr — feed público sin API key (usando tags)
// Limitación: no soporta geosearch, solo filtrado por tags
// Devuelve hasta 20 fotos públicas recientes con esos tags
async function getFotosFlickr(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  // Normalizar: tags en Flickr no admiten tildes ni espacios
  const normalizar = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

  const nombreTag = normalizar(nombre)
  const municipioTag = normalizar(municipio)

  // Probar combinaciones de tags de más específico a más general
  const queries = [
    `${nombreTag},${municipioTag},beach`,
    `${municipioTag},playa`,
    `${municipioTag},beach`,
  ].filter(q => !q.startsWith(',') && !q.endsWith(','))

  for (const tags of queries) {
    try {
      const params = new URLSearchParams({
        format:         'json',
        nojsoncallback: '1',
        tags:           tags,
        tagmode:        'all', // debe tener TODOS los tags
      })
      const res = await fetchWithTimeout(
        `https://www.flickr.com/services/feeds/photos_public.gne?${params}`,
        { next: { revalidate: 86400 } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const items = data?.items ?? []
      if (items.length === 0) continue

      const fotos: FotoPlaya[] = items
        .map((item: any): FotoPlaya | null => {
          const titulo = (item.title ?? '').toLowerCase()
          const tagsStr = (item.tags ?? '').toLowerCase()
          // NEGATIVAS también sobre tags: 'Desembarco en Melilla' tenía
          // título limpio pero tags 'ejercito soldado guerra playa' que
          // delatan el contenido. Sin esto pasaba el filtro porque
          // 'playa' está en tags (POSITIVAS match).
          if (NEGATIVAS.test(titulo) || NEGATIVAS.test(tagsStr)) return null
          // Modo estricto: Flickr devuelve muchas fotos con título críptico
          // (DSC_1234, IMG_001). Aceptamos si título O tags incluyen
          // POSITIVAS (descarta DSC_xxxx con tags neutros).
          if (!POSITIVAS.test(titulo) && !POSITIVAS.test(tagsStr)) return null
          // item.media.m es el thumbnail de tamaño M (240px). Subimos a _c
          // (800px, disponible desde 2012) en vez de _b (1024px) porque
          // _b falta en fotos pequeñas o antiguas y producía imágenes rotas.
          const mediaUrl = item.media?.m ?? ''
          if (!mediaUrl) return null
          if (!/_m\.(jpg|jpeg|png)/i.test(mediaUrl)) return null
          const url = mediaUrl.replace(/_m\.(jpg|jpeg|png)/i, '_c.$1')
          const thumb = mediaUrl // _m queda como thumb
          return {
            url,
            thumb,
            fuente: 'flickr' as const,
            autor: item.author?.replace(/^.*\("(.+)"\)$/, '$1') ?? undefined,
          }
        })
        .filter(Boolean) as FotoPlaya[]

      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

/**
 * Pool de fotos genéricas por estado. Cuando ninguna fuente devuelve
 * foto específica, se usa una imagen Unsplash de las que proyecta la
 * atmósfera del estado (3 por estado para evitar repeticiones cuando
 * varias cards comparten estado).
 */
export const FOTOS_GENERICAS_POR_ESTADO: Record<string, string[]> = {
  CALMA: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=70',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=900&q=70',
    'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=900&q=70',
  ],
  BUENA: [
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=70',
    'https://images.unsplash.com/photo-1525428781336-2bc7a72d68a8?w=900&q=70',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900&q=70',
  ],
  AVISO: [
    'https://images.unsplash.com/photo-1535262971677-1c823d4c814e?w=900&q=70',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=900&q=70',
    'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=900&q=70',
  ],
  SURF: [
    'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=900&q=70',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&q=70',
    'https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=900&q=70',
  ],
  VIENTO: [
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=900&q=70',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=70',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900&q=70',
  ],
  PELIGRO: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=900&q=70',
    'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=900&q=70',
    'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=900&q=70',
  ],
}

export const FOTO_GENERICA_DEFAULT = FOTOS_GENERICAS_POR_ESTADO.CALMA[0]

function poolFor(estado?: string): string[] {
  const key = (estado ?? 'CALMA').toUpperCase()
  return FOTOS_GENERICAS_POR_ESTADO[key] ?? FOTOS_GENERICAS_POR_ESTADO.CALMA
}

/**
 * Helper para cards de listado y otros usos donde solo necesitamos el
 * thumb principal. Reusa la cascada completa de getFotos() (Wikimedia
 * geo → OpenVerse → Flickr → Wikimedia text → Pexels → Unsplash) para
 * coherencia visual con la ficha.
 *
 * Acepta `excluir?: Set<string>` para dedupe entre cards: si la primera
 * foto válida ya está en el set, prueba con la siguiente, y así. Si
 * ninguna candidata es única, recurre al pool genérico del estado
 * eligiendo el primer item no usado.
 *
 * Pasar `fallback: false` para devolver null cuando no hay alternativa.
 */
export async function getFotoThumb(
  nombre: string,
  municipio: string,
  lat: number,
  lon: number,
  provincia: string = '',
  options: { fallback?: boolean; estado?: string; excluir?: Set<string> } = {}
): Promise<string | null> {
  const fotos = await getFotos(nombre, municipio, lat, lon, provincia)
  const usado = options.excluir
  // Buscar el primer thumb que no esté ya en uso
  for (const f of fotos) {
    if (f?.thumb && (!usado || !usado.has(f.thumb))) return f.thumb
  }
  if (options.fallback === false) return null
  // Pool genérico: primer item del estado que no esté ya en uso
  const pool = poolFor(options.estado)
  for (const url of pool) {
    if (!usado || !usado.has(url)) return url
  }
  // Si todo está usado (caso muy improbable), devolvemos el primero
  return pool[0] ?? FOTO_GENERICA_DEFAULT
}

/**
 * Obtiene fotos de una playa con cascada multi-fuente.
 *
 * Cinco fuentes en paralelo, ordenadas de más específico (geo) a más
 * genérico (municipio). Combina sin duplicados:
 *   1. Wikimedia Commons geosearch (1500m) — sin key
 *   2. OpenVerse agregador CC — sin key
 *   3. Flickr feed público por tags — sin key
 *   4. Wikimedia Commons text search — sin key
 *   5. Pexels por municipio — requiere PEXELS_API_KEY
 *   6. Unsplash por municipio — requiere UNSPLASH_ACCESS_KEY
 */
export async function getFotos(
  nombre: string,
  municipio: string,
  lat: number,
  lon: number,
  provincia: string = ''
): Promise<FotoPlaya[]> {
  const [wikiGeo, openverse, flickr, wikiText, pexels, unsplash] = await Promise.all([
    getFotosWikimediaGeo(lat, lon),
    getFotosOpenVerse(nombre, municipio),
    getFotosFlickr(nombre, municipio),
    getFotosWikimediaText(nombre, municipio),
    getFotosPexels(municipio, provincia),
    getFotosUnsplash(municipio, provincia),
  ])

  // Combinar sin duplicados (por URL)
  const vistas = new Set<string>()
  const combinadas: FotoPlaya[] = []

  const agregar = (fotos: FotoPlaya[]) => {
    for (const f of fotos) {
      if (vistas.has(f.url)) continue
      vistas.add(f.url)
      combinadas.push(f)
      if (combinadas.length >= 6) return
    }
  }

  // Prioridad: geo-precisas primero, agregador después, fallbacks genéricos al final
  agregar(wikiGeo)
  if (combinadas.length < 6) agregar(openverse)
  if (combinadas.length < 6) agregar(flickr)
  if (combinadas.length < 6) agregar(wikiText)
  if (combinadas.length < 6) agregar(pexels)
  if (combinadas.length < 6) agregar(unsplash)

  return combinadas.slice(0, 6)
}
