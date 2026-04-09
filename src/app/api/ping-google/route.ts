// src/app/api/ping-google/route.ts
// Notifica a Google y Bing que el sitemap se ha actualizado
// Llamar después de cada deploy: GET /api/ping-google

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const SITEMAP = `${BASE}/sitemap-index.xml`

export async function GET() {
  const results: { engine: string; status: string }[] = []

  // Google Sitemap Ping
  try {
    const res = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`)
    results.push({ engine: 'Google', status: res.ok ? 'ok' : `error ${res.status}` })
  } catch {
    results.push({ engine: 'Google', status: 'error' })
  }

  // Bing/IndexNow Sitemap Ping
  try {
    const res = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`)
    results.push({ engine: 'Bing', status: res.ok ? 'ok' : `error ${res.status}` })
  } catch {
    results.push({ engine: 'Bing', status: 'error' })
  }

  return NextResponse.json({
    sitemap: SITEMAP,
    pinged: new Date().toISOString(),
    results,
  })
}
