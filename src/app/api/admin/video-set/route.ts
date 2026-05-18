// src/app/api/admin/video-set/route.ts
//
// Endpoint para asignar manualmente un video YouTube a una playa
// (override del auto-search). Útil para top playas donde quieres
// calidad curada (La Concha, As Catedrais, Bolonia...).
//
// AUTH: si CRON_SECRET está configurado, exige Authorization: Bearer.
// Si NO está configurado, requiere param ?confirm=YES (sin auth).
// Es destructivo (sobreescribe override), por eso no es público
// abierto como /api/admin/fotos-refresh.
//
// Uso:
//   SET    GET /api/admin/video-set?slug=playa-de-bolonia&yt=JQtjHZfiRRo
//   DELETE GET /api/admin/video-set?slug=playa-de-bolonia&delete=1

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPlayaBySlug } from '@/lib/playas'
import { setVideoManual, deleteVideoManual, type VideoPlaya } from '@/lib/videos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = req.headers.get('authorization')
    const isLocal = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
    if (authHeader !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  } else {
    // Sin secret, exigir confirm explícito (mata risk casual).
    if (req.nextUrl.searchParams.get('confirm') !== 'YES') {
      return NextResponse.json(
        { error: 'CRON_SECRET no configurado. Añade &confirm=YES si entiendes el riesgo.' },
        { status: 403 },
      )
    }
  }

  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 })

  const playa = await getPlayaBySlug(slug)
  if (!playa) return NextResponse.json({ error: 'playa not found' }, { status: 404 })

  // Modo delete: borrar el override.
  if (req.nextUrl.searchParams.get('delete')) {
    await deleteVideoManual(slug)
    return NextResponse.json({ slug, action: 'deleted' })
  }

  const yt = req.nextUrl.searchParams.get('yt')?.trim()
  if (!yt) return NextResponse.json({ error: 'missing yt (videoId)' }, { status: 400 })

  // Validar formato YouTube videoId (11 chars alfanuméricos + - _)
  if (!/^[A-Za-z0-9_-]{11}$/.test(yt)) {
    return NextResponse.json({ error: 'yt formato inválido (esperado 11 chars)' }, { status: 400 })
  }

  // Resolver metadata desde YouTube si tenemos clave (para channelTitle,
  // title, etc.). Si no, guardamos mínimo necesario.
  const YT_KEY = process.env.YOUTUBE_API_KEY
  let video: VideoPlaya = {
    videoId:      yt,
    title:        playa.nombre,
    channelId:    '',
    channelTitle: '(manual)',
    publishedAt:  new Date().toISOString(),
    thumbnail:    `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    fuente:       'youtube-manual',
  }

  if (YT_KEY) {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        id:   yt,
        key:  YT_KEY,
      })
      const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
      if (r.ok) {
        const d = await r.json()
        const it = d?.items?.[0]
        if (it?.snippet) {
          video = {
            videoId:      yt,
            title:        it.snippet.title ?? playa.nombre,
            channelId:    it.snippet.channelId ?? '',
            channelTitle: it.snippet.channelTitle ?? '',
            publishedAt:  it.snippet.publishedAt ?? new Date().toISOString(),
            thumbnail:    it.snippet.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
            fuente:       'youtube-manual',
          }
        }
      }
    } catch {
      /* usamos el video minimal si la llamada falla */
    }
  }

  await setVideoManual(slug, video)

  return NextResponse.json({
    slug,
    action: 'set',
    video,
  })
}
