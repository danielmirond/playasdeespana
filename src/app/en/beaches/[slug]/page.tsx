// src/app/en/beaches/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPlayaBySlug } from '@/lib/playas'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { getFrase } from '@/lib/copy'
import { getMareas, getSol, getTurbidez } from '@/lib/marine'
import { getMeteoPlaya, getMeteoForecast } from '@/lib/meteo'
import { calcularBandera, estimarMedusas } from '@/lib/seguridad'
import { nombreConPlaya } from '@/lib/geo'
import { estimarMareas } from '@/lib/mareas-lunar'
import { getRestaurantes } from '@/lib/restaurantes'
import { getFotos } from '@/lib/fotos'
import { getHoteles } from '@/lib/hoteles'
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

  const title = `How is ${playa.nombre} today | Flag, conditions, wind and water temperature - Parking, hotels and where to eat nearby`
  const description = `Sea conditions at ${nombreConPlaya(playa.nombre)} today. Water temperature, waves, wind, flag, jellyfish and facilities. Nearby parking, hotels and restaurants.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/en/beaches/${slug}`,
      locale: 'en_GB',
      type: 'article',
      publishedTime: '2026-03-09T00:00:00Z',
      modifiedTime: new Date().toISOString(),
    },
    alternates: {
      canonical: `/en/beaches/${slug}`,
      languages: { 'es': `/playas/${slug}`, 'en': `/en/beaches/${slug}` },
    },
  }
}

export default async function BeachPageEn({ params }: Props) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  const [mareas, sol, meteoPlayaResult, restaurantes, fotos, hoteles, turbidez, meteoForecast] = await Promise.allSettled([
    getMareas(playa.lat, playa.lng),
    getSol(playa.lat, playa.lng),
    getMeteoPlaya(playa.lat, playa.lng),
    getRestaurantes(playa.lat, playa.lng),
    getFotos(playa.nombre, playa.municipio, playa.lat, playa.lng),
    getHoteles(playa.lat, playa.lng),
    getTurbidez(playa.lat, playa.lng),
    getMeteoForecast(playa.lat, playa.lng),
  ])

  const mareasData        = mareas.status          === 'fulfilled' ? mareas.value          : null
  const solData           = sol.status             === 'fulfilled' ? sol.value             : null
  const meteoPlayaData    = meteoPlayaResult.status === 'fulfilled' ? meteoPlayaResult.value : null
  const restaurantesData  = restaurantes.status    === 'fulfilled' ? restaurantes.value    : []
  const fotosData         = fotos.status           === 'fulfilled' ? fotos.value           : []
  const hotelesData       = hoteles.status         === 'fulfilled' ? hoteles.value         : []
  const turbidezData      = turbidez.status        === 'fulfilled' ? turbidez.value        : null
  const meteoForecastData = meteoForecast.status   === 'fulfilled' ? meteoForecast.value   : []

  // Datos marinos (oleaje, temperatura agua) de Open-Meteo Marine
  const tempAgua     = mareasData?.temp_agua?.[0]   ?? null
  const olas         = mareasData?.oleaje_m?.[0]    ?? 0
  const periodo      = mareasData?.wave_period?.[0] ?? 8

  // Datos atmosféricos (viento, UV, temp aire, sensación, humedad) de Open-Meteo Forecast
  const viento       = meteoPlayaData?.viento_kmh   ?? 0
  const vientoRacha  = meteoPlayaData?.viento_racha ?? 0
  const vientoDirRaw = meteoPlayaData?.viento_dir   ?? 'N'

  const seed      = playa.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const estadoKey = calcularEstado({ olas, viento })
  const estado    = ESTADOS[estadoKey]
  const frase     = getFrase(estadoKey, seed % 3)

  const meteo = {
    agua: tempAgua ?? 18, olas, viento, vientoRacha,
    vientoDireccion: vientoDirRaw,
    uv: meteoPlayaData?.uv_max ?? 5,
    tempAire: meteoPlayaData?.temp_aire ?? 22,
    sensacion: meteoPlayaData?.sensacion ?? meteoPlayaData?.temp_aire ?? 20,
    humedad: meteoPlayaData?.humedad ?? 0,
    estado: estadoKey,
    amanecer: solData?.amanecer,
    atardecer: solData?.atardecer,
    periodo,
  }

  const oleajeHoras = mareasData
    ? mareasData.oleaje_m.map((v, i) => ({ h: i === 0 ? 'Now' : `+${i}h`, v: parseFloat(v.toFixed(1)) }))
    : null

  const forecastSurf = mareasData?.forecast ?? null

  const dateModified = meteoPlayaData?.timestamp ?? new Date().toISOString()

  const banderaPlaya = calcularBandera(olas, viento, vientoRacha)
  const medusas = estimarMedusas(playa.lat, playa.lng, tempAgua, viento, vientoDirRaw)
  const mareasLunar = estimarMareas(playa.lat, playa.lng)

  let calidad = null
  try {
    const db = JSON.parse(readFileSync(join(process.cwd(), 'public/data/calidad-agua.json'), 'utf8'))
    calidad = db[slug] ?? null
  } catch {}

  return (
    <>
      <SchemaPlaya playa={playa} agua={meteo.agua} olas={meteo.olas} viento={meteo.viento} calidad={calidad?.nivel} banderaColor={banderaPlaya.color} banderaLabel={banderaPlaya.labelEn} medusasLabel={medusas.labelEn} mareasTexto={mareasLunar.zona === 'mediterraneo' ? `Mediterranean tides are negligible (${mareasLunar.rango}m).` : `Today's high tides at ${playa.nombre} are at ${mareasLunar.mareas.filter(m => m.tipo === 'pleamar').map(m => m.hora).join(' and ')} (${mareasLunar.rango}m). Coefficient ${mareasLunar.coeficiente}.`} dateModified={dateModified} />
      <Nav />
      <FichaHero playa={playa} meteo={meteo} estado={estado} frase={frase} locale="en" />
      <FichaNav locale="en" />
      <FichaBody locale="en"
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
        dateModified={dateModified}
        banderaPlaya={banderaPlaya}
        medusas={medusas}
        mareasLunar={mareasLunar}
      />
    </>
  )
}
