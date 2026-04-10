// src/app/api/debug-fotos/route.ts
// Endpoint de diagnóstico: comprueba si Unsplash y Wikimedia responden
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
  const FLICKR_KEY   = process.env.FLICKR_API_KEY ?? ''
  const results: Record<string, unknown> = {
    unsplash_key_set: !!UNSPLASH_KEY,
    unsplash_key_length: UNSPLASH_KEY.length,
    unsplash_key_prefix: UNSPLASH_KEY.slice(0, 6) || 'MISSING',
    flickr_key_set: !!FLICKR_KEY,
    flickr_key_length: FLICKR_KEY.length,
    flickr_key_prefix: FLICKR_KEY.slice(0, 6) || 'MISSING',
  }

  // Test Unsplash
  try {
    const startUnsplash = Date.now()
    const resUnsplash = await fetch(
      'https://api.unsplash.com/search/photos?query=playa+barcelona&per_page=3',
      {
        headers: UNSPLASH_KEY ? { Authorization: `Client-ID ${UNSPLASH_KEY}` } : {},
      }
    )
    results.unsplash_status = resUnsplash.status
    results.unsplash_ms = Date.now() - startUnsplash
    if (resUnsplash.ok) {
      const data = await resUnsplash.json()
      results.unsplash_results = data.results?.length ?? 0
      results.unsplash_sample = data.results?.[0]?.urls?.small ?? null
    } else {
      results.unsplash_error = await resUnsplash.text()
    }
  } catch (e: any) {
    results.unsplash_error = e.message
  }

  // Test Flickr (geosearch en La Concha, San Sebastián)
  try {
    const startFlickr = Date.now()
    const params = new URLSearchParams({
      method: 'flickr.photos.search',
      api_key: FLICKR_KEY,
      format: 'json',
      nojsoncallback: '1',
      lat: '43.3183',
      lon: '-1.9812',
      radius: '1',
      radius_units: 'km',
      tags: 'beach,playa',
      per_page: '3',
      extras: 'url_m',
    })
    const resFlickr = await fetch(`https://api.flickr.com/services/rest/?${params}`)
    results.flickr_status = resFlickr.status
    results.flickr_ms = Date.now() - startFlickr
    if (resFlickr.ok) {
      const data = await resFlickr.json()
      results.flickr_stat = data.stat
      results.flickr_results = data?.photos?.photo?.length ?? 0
      results.flickr_sample = data?.photos?.photo?.[0]?.url_m ?? null
      if (data.stat === 'fail') results.flickr_error = data.message
    }
  } catch (e: any) {
    results.flickr_error = e.message
  }

  // Test Wikimedia
  try {
    const startWiki = Date.now()
    const params = new URLSearchParams({
      action: 'query', generator: 'search', gsrnamespace: '6',
      gsrsearch: 'La Concha beach Spain filetype:bitmap',
      gsrlimit: '3', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '400',
      format: 'json', origin: '*',
    })
    const resWiki = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
    results.wikimedia_status = resWiki.status
    results.wikimedia_ms = Date.now() - startWiki
    if (resWiki.ok) {
      const data = await resWiki.json()
      const pages = Object.values(data.query?.pages ?? {}) as any[]
      results.wikimedia_results = pages.length
      results.wikimedia_sample = pages[0]?.imageinfo?.[0]?.thumburl ?? null
    }
  } catch (e: any) {
    results.wikimedia_error = e.message
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
