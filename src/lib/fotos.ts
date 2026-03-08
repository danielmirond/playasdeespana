// src/lib/fotos.ts

const PLACES_KEY   = process.env.GOOGLE_PLACES_KEY ?? ''
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'google' | 'unsplash'
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

export async function getFotos(nombre: string, municipio: string, lat: number, lon: number): Promise<FotoPlaya[]> {
  const google = await getFotosGoogle(nombre, lat, lon)
  if (google.length >= 3) return google
  // Complementar con Unsplash si hay pocas de Google
  const unsplash = await getFotosUnsplash(nombre, municipio)
  return [...google, ...unsplash].slice(0, 6)
}
