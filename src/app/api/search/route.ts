import { NextRequest, NextResponse } from 'next/server'
import { getAllPlayas } from '@/lib/data'

export const runtime = 'nodejs'
export const revalidate = 86400  // revalida 1 vez al día

let _index: { slug:string; nombre:string; municipio:string; provincia:string; _key:string }[] | null = null

function getIndex() {
  if (_index) return _index
  const playas = getAllPlayas()
  _index = playas.map(p => ({
    slug: p.slug,
    nombre: p.nombre,
    municipio: p.municipio,
    provincia: p.provincia,
    _key: [p.nombre, p.municipio, p.provincia]
      .join(' ').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  }))
  return _index
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const nq    = normalize(q)
  const index = getIndex()

  const results = index
    .filter(p => p._key.includes(nq))
    .sort((a, b) => {
      // Nombre empieza con query → primero
      const aN = normalize(a.nombre).startsWith(nq) ? 0 : 1
      const bN = normalize(b.nombre).startsWith(nq) ? 0 : 1
      return aN - bN
    })
    .slice(0, 8)
    .map(({ _key, ...p }) => p)

  return NextResponse.json({ results })
}
