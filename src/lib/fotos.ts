// src/lib/fotos.ts — Fotos de playas via Wikimedia Commons y Unsplash (sin Google Places)
import { fetchWithTimeout } from './fetch-timeout'

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'unsplash' | 'wikimedia'
  autor?: string
}

// Wikimedia Commons — búsqueda por nombre de playa
async function getFotosWikimedia(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  try {
    const queries = [
      `${nombre} beach Spain`,
      `${nombre} playa`,
      `${municipio} beach`,
    ]
    for (const q of queries) {
      const params = new URLSearchParams({
        action:      'query',
        generator:   'search',
        gsrnamespace:'6',
        gsrsearch:   `${q} filetype:bitmap`,
        gsrlimit:    '8',
        prop:        'imageinfo',
        iiprop:      'url|extmetadata',
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
      const fotos = pages
        .map((p: any) => {
          const ii = p.imageinfo?.[0]
          if (!ii?.thumburl) return null
          const ext = ii.url?.split('.').pop()?.toLowerCase()
          if (!['jpg','jpeg','png','webp'].includes(ext ?? '')) return null
          return {
            url:    ii.thumburl,
            thumb:  ii.thumburl.replace(/\/\d+px-/, '/300px-'),
            fuente: 'wikimedia' as const,
            autor:  ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '') ?? undefined,
          }
        })
        .filter(Boolean) as FotoPlaya[]

      if (fotos.length >= 2) return fotos.slice(0, 6)
    }
    return []
  } catch {
    return []
  }
}

// Fallback: Unsplash con query de playa
async function getFotosUnsplash(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  if (!UNSPLASH_KEY) return []
  try {
    const query = encodeURIComponent(`playa ${municipio} España`)
    const res = await fetchWithTimeout(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=6&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((p: any): FotoPlaya => ({
      url:    p.urls.regular,
      thumb:  p.urls.small,
      fuente: 'unsplash',
      autor:  p.user?.name,
    }))
  } catch {
    return []
  }
}

export async function getFotos(nombre: string, municipio: string, lat: number, lon: number): Promise<FotoPlaya[]> {
  // Ambas fuentes en paralelo para evitar waterfall
  const [wikimedia, unsplash] = await Promise.all([
    getFotosWikimedia(nombre, municipio),
    getFotosUnsplash(nombre, municipio),
  ])

  // Prioridad Wikimedia (gratuito, sin límite)
  if (wikimedia.length >= 2) return wikimedia.slice(0, 6)
  if (unsplash.length > 0) return unsplash.slice(0, 6)
  return wikimedia.slice(0, 6)
}
