// src/app/api/calidad-agua/route.ts
// Sirve JSON pre-procesado de EEA Bathing Water (build time)
import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  try {
    const db: Record<string, string> = JSON.parse(
      readFileSync(join(process.cwd(), 'public', 'data', 'calidad-agua.json'), 'utf-8')
    )
    const body = id ? { id, calidad: db[id] ?? null } : db
    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=2592000' },
    })
  } catch {
    return NextResponse.json({ error: 'Datos no disponibles' }, { status: 503 })
  }
}
