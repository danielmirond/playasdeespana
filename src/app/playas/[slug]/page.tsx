import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPlayaBySlug, getPlayas } from '@/lib/playas'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { getFrase } from '@/lib/copy'
import { getMareas, getSol, getTurbidez } from '@/lib/marine'
import { getMeteoPlaya, getMeteoForecast } from '@/lib/meteo'
import { calcularBandera, estimarMedusas } from '@/lib/seguridad'
import { getRestaurantes } from '@/lib/restaurantes'
import { getFotos } from '@/lib/fotos'
import type { FotoPlaya } from '@/lib/fotos'
import { getHoteles } from '@/lib/hoteles'
import { getEscuelas } from '@/lib/escuelas'
import type { Escuela } from '@/lib/escuelas'
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
  const title = `Cómo está ${playa.nombre} hoy | Bandera, estado, viento y temperatura del agua - Parking, hoteles y donde comer cerca`
  const now = new Date().toISOString()
  return {
    title,
    description: `Estado del mar, temperatura del agua, oleaje y servicios de ${playa.nombre}. Datos en tiempo real.`,
    openGraph: {
      title,
      description: `Estado del mar, temperatura del agua, oleaje y servicios de ${playa.nombre}. Datos en tiempo real.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/playas/${slug}`,
      siteName: 'Playas de España',
      locale: 'es_ES',
      type: 'article',
      publishedTime: '2026-03-09T00:00:00Z',
      modifiedTime: now,
      images: [{
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?playa=${encodeURIComponent(playa.nombre)}&municipio=${encodeURIComponent(playa.municipio + ' · ' + playa.provincia)}&comunidad=${encodeURIComponent(playa.comunidad)}&azul=${playa.bandera ? 'true' : 'false'}`,
        width: 1200,
        height: 630,
        alt: `${playa.nombre} - Estado del mar hoy`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Estado del mar, temperatura del agua, oleaje y servicios de ${playa.nombre}. Datos en tiempo real.`,
      images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?playa=${encodeURIComponent(playa.nombre)}&municipio=${encodeURIComponent(playa.municipio + ' · ' + playa.provincia)}&comunidad=${encodeURIComponent(playa.comunidad)}&azul=${playa.bandera ? 'true' : 'false'}`],
    },
    alternates: { canonical: `/playas/${slug}`, languages: { 'es': `/playas/${slug}`, 'en': `/en/beaches/${slug}` } },
  }
}

export default async function PlayaPage({ params }: Props) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  const [mareas, sol, meteoPlaya, restaurantes, fotos, hoteles, escuelasResult, turbidez, meteoForecast] = await Promise.allSettled([
    getMareas(playa.lat, playa.lng),
    getSol(playa.lat, playa.lng),
    getMeteoPlaya(playa.lat, playa.lng),
    getRestaurantes(playa.lat, playa.lng),
    getFotos(playa.nombre, playa.municipio, playa.lat, playa.lng),
    getHoteles(playa.lat, playa.lng),
    getEscuelas(playa.lat, playa.lng),
    getTurbidez(playa.lat, playa.lng),
    getMeteoForecast(playa.lat, playa.lng),
  ])

  const mareasData        = mareas.status === 'fulfilled' ? mareas.value : null
  const solData           = sol.status === 'fulfilled' ? sol.value : null
  const meteoPlayaData    = meteoPlaya.status === 'fulfilled' ? meteoPlaya.value : null
  const restaurantesData  = restaurantes.status === 'fulfilled' ? restaurantes.value : []
  const fotosData         = fotos.status === 'fulfilled' ? fotos.value : []
  const hotelesData       = hoteles.status === 'fulfilled' ? hoteles.value : []
  const escuelasData      = escuelasResult.status === 'fulfilled' ? escuelasResult.value : []
  const turbidezData      = turbidez.status === 'fulfilled' ? turbidez.value : null
  const meteoForecastData = meteoForecast.status === 'fulfilled' ? meteoForecast.value : []

  // Datos marinos (oleaje, temperatura agua) de Open-Meteo Marine
  const tempAgua = mareasData?.temp_agua?.[0] ?? null
  const olas     = mareasData?.oleaje_m?.[0]  ?? 0
  const periodo  = mareasData?.wave_period?.[0] ?? 8

  // Datos atmosféricos (viento, UV, temp aire, sensación, humedad) de Open-Meteo Forecast
  const viento       = meteoPlayaData?.viento_kmh   ?? 0
  const vientoRacha  = meteoPlayaData?.viento_racha ?? 0
  const vientoDirRaw = meteoPlayaData?.viento_dir   ?? 'N'

  const seed      = playa.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const estadoKey = calcularEstado({ olas, viento })
  const estado    = ESTADOS[estadoKey]
  const frase     = getFrase(estadoKey, seed % 3)

  const meteo = {
    agua:            tempAgua ?? 18,
    olas,
    viento,
    vientoRacha,
    vientoDireccion: vientoDirRaw,
    uv:              meteoPlayaData?.uv_max ?? 5,
    tempAire:        meteoPlayaData?.temp_aire ?? 22,
    sensacion:       meteoPlayaData?.sensacion ?? meteoPlayaData?.temp_aire ?? 20,
    humedad:         meteoPlayaData?.humedad ?? 0,
    estado:          estadoKey,
    amanecer:        solData?.amanecer,
    atardecer:       solData?.atardecer,
    periodo,
  }

  const oleajeHoras = mareasData
    ? mareasData.oleaje_m.map((v, i) => ({ h: i === 0 ? 'Ahora' : `+${i}h`, v: parseFloat(v.toFixed(1)) }))
    : null

  const forecastSurf = mareasData?.forecast ?? null

  const dateModified = meteoPlayaData?.timestamp ?? new Date().toISOString()

  const banderaPlaya = calcularBandera(olas, viento, vientoRacha)
  const medusas = estimarMedusas(playa.lat, playa.lng, tempAgua, viento, vientoDirRaw)

  let calidad = null
  try {
    const db = JSON.parse(readFileSync(join(process.cwd(), 'public/data/calidad-agua.json'), 'utf8'))
    calidad = db[slug] ?? null
  } catch {}

  return (
    <>
      <SchemaPlaya playa={playa} agua={meteo.agua} olas={meteo.olas} calidad={calidad?.nivel} dateModified={dateModified} />
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
        escuelas={escuelasData}
        turbidez={turbidezData}
        forecastSurf={forecastSurf}
        meteoForecast={meteoForecastData}
        dateModified={dateModified}
        banderaPlaya={banderaPlaya}
        medusas={medusas}
      />
    </>
  )
}
