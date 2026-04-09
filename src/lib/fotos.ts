// src/lib/fotos.ts — Fotos de playas via Wikimedia Commons y Unsplash (sin Google Places)

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'unsplash' | 'wikimedia'
  autor?: string
}

/** Pasa una URL de imagen por el proxy de Next.js para servir webp/avif */
function optimized(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
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
      const res = await fetch(
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
          const rawUrl   = ii.thumburl
          const rawThumb = ii.thumburl.replace(/\/\d+px-/, '/300px-')
          return {
            url:    optimized(rawUrl, 828),
            thumb:  optimized(rawThumb, 384),
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
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=6&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((p: any): FotoPlaya => ({
      url:    optimized(p.urls.regular, 828),
      thumb:  optimized(p.urls.small, 384),
      fuente: 'unsplash',
      autor:  p.user?.name,
    }))
  } catch {
    return []
  }
}

export async function getFotos(nombre: string, municipio: string, lat: number, lon: number): Promise<FotoPlaya[]> {
  // Wikimedia Commons primero (gratuito, sin límite)
  const wikimedia = await getFotosWikimedia(nombre, municipio)
  if (wikimedia.length >= 2) return wikimedia.slice(0, 6)

  // Fallback: Unsplash
  const unsplash = await getFotosUnsplash(nombre, municipio)
  if (unsplash.length > 0) return unsplash.slice(0, 6)

  return wikimedia.slice(0, 6)
}
