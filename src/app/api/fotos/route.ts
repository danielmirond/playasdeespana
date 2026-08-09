import { NextRequest, NextResponse } from 'next/server'
import { getFotos } from '@/lib/fotos'
import { getPlayaBySlug } from '@/lib/playas'

export const runtime = 'nodejs'

/**
 * Fotos de una playa por slug.
 *
 * Historia de un fallo que llegó a producción: el único llamante
 * (TopCercanas) manda SOLO `?slug=`, y esta ruta cogía nombre,
 * municipio, lat y lon de la query. Al no venir, caían a sus valores
 * por defecto —«playa», '', 0, 0— y se llamaba a getFotos() sin el
 * slug, que es justo el parámetro con el que consulta el sidecar.
 *
 * Resultado: se saltaba el sidecar curado y se ejecutaba la cascada en
 * vivo buscando la palabra suelta «playa» en el punto 0°,0°, o sea el
 * golfo de Guinea. Una única clave de caché —fotos:playa:0.0000:0.0000—
 * compartida por las 4.491 playas del sitio: TODAS recibían la misma
 * lista. Y como TopCercanas deduplica repartiendo candidatas distintas
 * de esa lista entre las tarjetas, la home acabó enseñando seis
 * fotogramas del mismo reportaje macro de arañas saltarinas como si
 * fueran las playas de Barcelona.
 *
 * El arreglo es pasar el slug y resolver los datos reales de la playa
 * en el servidor, no confiar en que el cliente los mande.
 */
export async function GET(req: NextRequest) {
  const sp   = req.nextUrl.searchParams
  const slug = sp.get('slug') ?? ''

  if (!slug) return NextResponse.json({ fotos: [] })

  // Los datos de la playa salen del catálogo, no de la query. Antes se
  // aceptaban como parámetros y bastaba con omitirlos para envenenar
  // una entrada de caché que sirve a todo el sitio.
  const playa = await getPlayaBySlug(slug)
  if (!playa) return NextResponse.json({ fotos: [] })

  const fotos = await getFotos(
    playa.nombre,
    playa.municipio,
    playa.lat,
    playa.lng,
    playa.provincia ?? '',
    slug,
  )

  return NextResponse.json({ fotos }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
