// src/lib/fotos.ts — Fotos de playas con matching preciso playa↔ubicación
// Estrategia en cascada:
//   1. Wikimedia Commons: geosearch por coordenadas (radio 800m) — más preciso
//   2. Flickr: geosearch por coordenadas (radio 1km) con tag "beach"
//   3. Wikimedia Commons: text search con nombre + municipio entre comillas
//   4. Unsplash: búsqueda por municipio (Unsplash no tiene playas específicas)
import { fetchWithTimeout } from './fetch-timeout'

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
const FLICKR_KEY   = process.env.FLICKR_API_KEY ?? ''

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
      return {
        score,
        url: ii.thumburl,
        thumb: ii.thumburl.replace(/\/\d+px-/, '/300px-'),
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

// Flickr — geosearch por coordenadas + tag beach (Creative Commons)
// Docs: https://www.flickr.com/services/api/flickr.photos.search.html
async function getFotosFlickr(
  lat: number,
  lon: number,
  nombre: string,
  municipio: string
): Promise<FotoPlaya[]> {
  if (!FLICKR_KEY) return []

  // Intentar primero búsqueda geo (muy precisa), luego fallback con texto
  const queries = [
    { lat, lon, radius: '1', tags: 'beach,playa', text: '' },   // 1 km
    { lat, lon, radius: '2', tags: 'beach,playa', text: '' },   // 2 km
    { lat: 0, lon: 0, radius: '', tags: '', text: `${nombre} ${municipio}` }, // texto
  ]

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        method:          'flickr.photos.search',
        api_key:         FLICKR_KEY,
        format:          'json',
        nojsoncallback:  '1',
        content_type:    '1',   // solo fotos (no screenshots)
        media:           'photos',
        sort:            'relevance',
        per_page:        '20',
        extras:          'url_m,url_l,owner_name,geo,tags',
        license:         '1,2,3,4,5,6,7,9,10', // todas las CC + Public Domain
        safe_search:     '1',
      })
      if (q.lat && q.lon) {
        params.set('lat', String(q.lat))
        params.set('lon', String(q.lon))
        params.set('radius', q.radius)
        params.set('radius_units', 'km')
      }
      if (q.tags) params.set('tags', q.tags)
      if (q.text) params.set('text', q.text)

      const res = await fetchWithTimeout(
        `https://api.flickr.com/services/rest/?${params}`,
        { next: { revalidate: 86400 } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const photos = data?.photos?.photo ?? []
      if (photos.length === 0) continue

      const fotos: FotoPlaya[] = photos
        .filter((p: any) => p.url_l || p.url_m)
        .map((p: any): FotoPlaya | null => {
          const titulo = (p.title ?? '').toLowerCase()
          // Filtrar títulos no relevantes
          if (NEGATIVAS.test(titulo)) return null
          const url = p.url_l ?? p.url_m
          const thumb = p.url_m ?? p.url_l
          if (!url) return null
          return {
            url,
            thumb,
            fuente: 'flickr' as const,
            autor: p.ownername ?? undefined,
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
 * 2. Geosearch en Flickr por coordenadas (1-2km radio) — requiere FLICKR_API_KEY
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
    getFotosFlickr(lat, lon, nombre, municipio),
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
