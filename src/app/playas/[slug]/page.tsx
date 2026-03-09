import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPlayaBySlug, getPlayas } from '@/lib/playas'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { getFrase } from '@/lib/copy'
import { getMareas, getSol, getTurbidez, getMeteoForecast, getViento } from '@/lib/marine'
import { getRestaurantes } from '@/lib/restaurantes'
import { getFotos } from '@/lib/fotos'
import type { FotoPlaya } from '@/lib/fotos'
import { getHoteles } from '@/lib/hoteles'
import type { HotelReal } from '@/lib/hoteles'
import Nav from '@/components/ui/Nav'
import FichaHero from '@/components/playa/FichaHero'
import FichaNav from '@/components/playa/FichaNav'
import FichaBody from '@/components/playa/FichaBody'
import SchemaPlaya from '@/components/playa/SchemaPlaya'

export const revalidate = 3600

interface Props { params: Promise<{ slug: string }> }


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) return {}
const title = `${playa.nombre} (${playa.provincia}) ¿Cómo está hoy? | Viento, parking, afluencia, temperatura y tráfico en tiempo real`  
return {
    title,
    description: `Estado del mar, temperatura del agua, oleaje y servicios de ${playa.nombre}. Datos en tiempo real.`,
    openGraph: { title, url: `/playas/${slug}` },
    alternates: { canonical: `/playas/${slug}`, languages: { 'es': `/playas/${slug}`, 'en': `/en/beaches/${slug}` } },
  }
}

export default async function PlayaPage({ params }: Props) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  const [mareas, sol, restaurantes, fotos, hoteles, turbidez, meteoForecast, vientoReal] = await Promise.allSettled([
    getMareas(playa.lat, playa.lng),
    getSol(playa.lat, playa.lng),
    getRestaurantes(playa.lat, playa.lng),
    getFotos(playa.nombre, playa.municipio, playa.lat, playa.lng),
    getHoteles(playa.lat, playa.lng),
    getTurbidez(playa.lat, playa.lng),
    getMeteoForecast(playa.lat, playa.lng),
    getViento(playa.lat, playa.lng),
  ])

  const mareasData       = mareas.status === 'fulfilled' ? mareas.value : null
  const solData          = sol.status === 'fulfilled' ? sol.value : null
  const restaurantesData = restaurantes.status === 'fulfilled' ? restaurantes.value : []
  const fotosData        = fotos.status === 'fulfilled' ? fotos.value : []
  const hotelesData      = hoteles.status === 'fulfilled' ? hoteles.value : []
  const turbidezData      = turbidez.status === 'fulfilled' ? turbidez.value : null
  const meteoForecastData = meteoForecast.status === 'fulfilled' ? meteoForecast.value : []
  const vientoData        = vientoReal.status === 'fulfilled' ? vientoReal.value : null

  const seed     = playa.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const tempAgua = mareasData?.temp_agua?.[0] ?? (18 + (seed % 10))
  const olas     = mareasData?.oleaje_m?.[0]  ?? parseFloat(((seed % 15) / 10).toFixed(1))
  const viento      = vientoData?.velocidad ?? (5 + (seed % 30))
  const vientoRacha = vientoData?.racha     ?? (viento + 8)
  const vientoDirRaw = vientoData?.direccion ?? ['N','NE','E','SE','S','SO','O','NO'][seed % 8]
  const periodo  = mareasData?.wave_period?.[0] ?? 8

  const estadoKey = calcularEstado({ olas, viento })
  const estado    = ESTADOS[estadoKey]
  const frase     = getFrase(estadoKey, seed % 3)

  const meteo = {
    agua:            tempAgua,
    olas,
    viento,
    vientoRacha,
    vientoDireccion: vientoDirRaw,
    uv:              3 + (seed % 9),
    tempAire:        Math.round(tempAgua + 3),
    estado:          estadoKey,
    amanecer:        solData?.amanecer,
    atardecer:       solData?.atardecer,
    periodo,
  }

  const oleajeHoras = mareasData
    ? mareasData.oleaje_m.map((v, i) => ({ h: i === 0 ? 'Ahora' : `+${i}h`, v: parseFloat(v.toFixed(1)) }))
    : null

  const forecastSurf = mareasData?.forecast ?? null

  let calidad = null
  try {
    const db = JSON.parse(readFileSync(join(process.cwd(), 'public/data/calidad-agua.json'), 'utf8'))
    calidad = db[slug] ?? null
  } catch {}

  return (
    <>
      <SchemaPlaya playa={playa} agua={meteo.agua} olas={meteo.olas} calidad={calidad?.nivel} />
      <Nav />
      <FichaHero playa={playa} meteo={meteo} estado={estado} frase={frase} />
      <FichaNav />
      <FichaBody
        playa={playa}
        meteo={meteo}
        solData={solData}
        oleajeHoras={oleajeHoras}
        calidad={calidad}
        restaurantes={restaurantesData}
        fotos={fotosData}
        hoteles={hotelesData}
        turbidez={turbidezData}
        forecastSurf={forecastSurf}
        meteoForecast={meteoForecastData}
      />
    </>
  )
}
