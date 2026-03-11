// src/lib/fotos.ts

const PLACES_KEY   = process.env.GOOGLE_PLACES_KEY ?? ''
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'google' | 'unsplash' | 'wikimedia'
  autor?: string
}

// Busca la playa en Google Places y devuelve sus fotos
async function getFotosGoogle(nombre: string, lat: number, lon: number): Promise<FotoPlaya[]> {
  if (!PLACES_KEY) return []
  try {
    const params = new URLSearchParams({
      query:    `playa ${nombre}`,
      location: `${lat},${lon}`,
      radius:   '2000',
      key:      PLACES_KEY,
      language: 'es',
    })
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const place = data.results?.[0]
    if (!place?.photos?.length) return []

    return place.photos.slice(0, 6).map((p: any): FotoPlaya => ({
      url:    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${p.photo_reference}&key=${PLACES_KEY}`,
      thumb:  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${PLACES_KEY}`,
      fuente: 'google',
    }))
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
      url:    p.urls.regular,
      thumb:  p.urls.small,
      fuente: 'unsplash',
      autor:  p.user?.name,
    }))
  } catch {
    return []
  }
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
        iiurlwidth:  '1200',
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
          return {
            url:    ii.thumburl,
            thumb:  ii.thumburl.replace(/\/\d+px-/, '/400px-'),
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

export async function getFotos(nombre: string, municipio: string, lat: number, lon: number): Promise<FotoPlaya[]> {
  const google = await getFotosGoogle(nombre, lat, lon)
  if (google.length >= 3) return google

  // Fallback 1: Wikimedia Commons (gratuito, sin límite)
  const wikimedia = await getFotosWikimedia(nombre, municipio)
  if (wikimedia.length >= 2) return wikimedia.slice(0, 6)

  // Fallback 2: Unsplash
  const unsplash = await getFotosUnsplash(nombre, municipio)
  if (unsplash.length > 0) return unsplash.slice(0, 6)

  return wikimedia.slice(0, 6)
}
