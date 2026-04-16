// src/lib/fotos.ts — Fotos de playas con matching preciso playa↔ubicación
// Estrategia en cascada:
//   1. Wikimedia Commons: geosearch por coordenadas (radio 800m) — más preciso
//   2. Flickr: feed público con tags (nombre+municipio+beach) — sin key
//   3. Wikimedia Commons: text search con nombre + municipio entre comillas
//   4. Unsplash: búsqueda por municipio (requiere UNSPLASH_ACCESS_KEY)
import { fetchWithTimeout } from './fetch-timeout'

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'unsplash' | 'wikimedia' | 'flickr'
  autor?: string
}

// Palabras negativas que descartamos de títulos de Wikimedia
// (mapas, logos, diagramas, símbolos, placas, etc.)
const NEGATIVAS = /\b(map|mapa|plan|logo|flag|bandera|diagram|diagrama|coat|escudo|sign|placa|street|coordinate|rotulo|icon|chart|grafic)\b/i

// Palabras positivas que boostean relevancia
const POSITIVAS = /\b(beach|playa|platja|praia|costa|mar|arena|sand|shore|coast|bahia|bay|ensenada|acantilado|cliff)\b/i

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

// Wikimedia — geosearch por coordenadas (radio 800m desde la playa)
async function getFotosWikimediaGeo(lat: number, lon: number): Promise<FotoPlaya[]> {
  try {
    const params = new URLSearchParams({
      action:       'query',
      generator:    'geosearch',
      ggsnamespace: '6',
      ggscoord:     `${lat}|${lon}`,
      ggsradius:    '800', // metros
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
    const pages = Object.values(data.query?.pages ?? {}) as any[]
    return extraerFotosDePages(pages).slice(0, 6)
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
          if (NEGATIVAS.test(titulo)) return null
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
 * Obtiene fotos de una playa con máxima precisión:
 * 1. Geosearch en Wikimedia por coordenadas (800m radio) — sin API key
 * 2. Flickr feed público con tags (nombre + municipio + beach) — sin API key
 * 3. Text search en Wikimedia con nombre + municipio entre comillas
 * 4. Unsplash con municipio (fotos genéricas de la zona)
 *
 * Las fuentes se consultan en paralelo para evitar waterfall.
 */
export async function getFotos(
  nombre: string,
  municipio: string,
  lat: number,
  lon: number,
  provincia: string = ''
): Promise<FotoPlaya[]> {
  const [wikiGeo, flickr, wikiText, unsplash] = await Promise.all([
    getFotosWikimediaGeo(lat, lon),
    getFotosFlickr(nombre, municipio),
    getFotosWikimediaText(nombre, municipio),
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

  // Prioridad: wikimedia geo > flickr geo > wikimedia texto > unsplash
  agregar(wikiGeo)
  if (combinadas.length < 6) agregar(flickr)
  if (combinadas.length < 6) agregar(wikiText)
  if (combinadas.length < 6) agregar(unsplash)

  return combinadas.slice(0, 6)
}
