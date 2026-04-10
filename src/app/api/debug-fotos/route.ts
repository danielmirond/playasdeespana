// src/app/api/debug-fotos/route.ts
// Endpoint de diagnóstico: comprueba si Unsplash y Wikimedia responden
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
  const results: Record<string, unknown> = {
    unsplash_key_set: !!UNSPLASH_KEY,
    unsplash_key_length: UNSPLASH_KEY.length,
    unsplash_key_prefix: UNSPLASH_KEY.slice(0, 6) || 'MISSING',
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

  // Test Flickr public feed (sin key)
  try {
    const startFlickr = Date.now()
    const resFlickr = await fetch(
      'https://www.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&tags=sansebastian,beach&tagmode=all'
    )
    results.flickr_status = resFlickr.status
    results.flickr_ms = Date.now() - startFlickr
    if (resFlickr.ok) {
      const data = await resFlickr.json()
      results.flickr_results = data?.items?.length ?? 0
      results.flickr_sample = data?.items?.[0]?.media?.m ?? null
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
