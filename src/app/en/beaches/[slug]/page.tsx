// src/app/en/beaches/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPlayaBySlug, getPlayas, getMunicipioSlugsSet, toSlug } from '@/lib/playas'
import { getCalidad } from '@/lib/calidad'
import { getVotos } from '@/lib/votos'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { getFrase } from '@/lib/copy'
import { getMareas, getSol, getTurbidez } from '@/lib/marine'
import { getMeteoPlaya, getMeteoForecast } from '@/lib/meteo'
import { calcularBandera, estimarMedusas } from '@/lib/seguridad'
import { nombreConPlaya, haversine } from '@/lib/geo'
import { estimarMareas } from '@/lib/mareas-lunar'
import { calcularHoraIdeal } from '@/lib/hora-ideal'
import { getRestaurantes } from '@/lib/restaurantes'
import { getFotos } from '@/lib/fotos'
import { getHoteles } from '@/lib/hoteles'
import Nav from '@/components/ui/Nav'
import FichaHero from '@/components/playa/FichaHero'
import FichaNav from '@/components/playa/FichaNav'
import FichaBody from '@/components/playa/FichaBody'
import SchemaPlaya from '@/components/playa/SchemaPlaya'
import { generarFaqsPlaya } from '@/lib/faqsPlaya'
import { calcularPlayaScore } from '@/lib/scoring'

export const revalidate = 3600
export const maxDuration = 25

export async function generateStaticParams() {
  // ISR on-demand — no pre-render at build to avoid 45-min timeout.
  return []
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) return {}

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const np = nombreConPlaya(playa.nombre)
  const title = `How is ${playa.nombre} today | Flag, conditions, wind and water temperature - Parking, hotels and where to eat nearby`
  const description = `Sea conditions at ${np} today. Water temperature, waves, wind, flag, jellyfish and facilities. Nearby parking, hotels and restaurants.`

  // OG image dinámica vía /api/og con paleta por comunidad
  const ogImage = new URL(`${BASE}/api/og`)
  ogImage.searchParams.set('playa', np)
  ogImage.searchParams.set('municipio', `${playa.municipio} · ${playa.provincia}`)
  if (playa.bandera) ogImage.searchParams.set('azul', 'true')
  ogImage.searchParams.set('comunidad', playa.comunidad)
  const cal = await getCalidad(slug)
  if (cal?.nivel) ogImage.searchParams.set('calidad', cal.nivel)

  const ogUrl = ogImage.toString()

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/en/beaches/${slug}`,
      siteName: 'Playas de España',
      locale: 'en_GB',
      type: 'article',
      publishedTime: '2026-03-09T00:00:00Z',
      modifiedTime: new Date().toISOString(),
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${np} — live sea conditions` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
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

  const [mareas, sol, meteoPlayaResult, restaurantes, fotos, hoteles, turbidez, meteoForecast, calidadResult, allPlayasResult, municipioSlugsResult, votosResult] = await Promise.allSettled([
    getMareas(playa.lat, playa.lng),
    getSol(playa.lat, playa.lng),
    getMeteoPlaya(playa.lat, playa.lng),
    getRestaurantes(playa.lat, playa.lng),
    getFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia),
    getHoteles(playa.lat, playa.lng),
    getTurbidez(playa.lat, playa.lng),
    getMeteoForecast(playa.lat, playa.lng),
    getCalidad(slug),
    getPlayas(),
    getMunicipioSlugsSet(),
    getVotos(slug),
  ])

  const municipioSlug = toSlug(playa.municipio)
  const provinciaSlug = playa.provincia ? toSlug(playa.provincia) : undefined
  const municipioSlugsSet = municipioSlugsResult.status === 'fulfilled' ? municipioSlugsResult.value : new Set<string>()
  const municipioSlugProp = municipioSlugsSet.has(municipioSlug) ? municipioSlug : undefined

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

  const playaScore = calcularPlayaScore(playa, { agua: meteo.agua, olas: meteo.olas, viento: meteo.viento, uv: meteo.uv })
  const banderaPlaya = calcularBandera(olas, viento, vientoRacha)
  const medusas = estimarMedusas(playa.lat, playa.lng, tempAgua, viento, vientoDirRaw)
  const mareasLunar = estimarMareas(playa.lat, playa.lng)
  const horaIdeal = calcularHoraIdeal({
    uv: meteoPlayaData?.uv_max ?? null,
    amanecer: solData?.amanecer,
    atardecer: solData?.atardecer,
    mareas: mareasLunar,
    mes: new Date().getMonth() + 1,
  })

  const calidad = calidadResult.status === 'fulfilled' ? calidadResult.value : null

  const preloadFoto = fotosData[0]?.thumb ?? null

  const allPlayas = allPlayasResult.status === 'fulfilled' ? allPlayasResult.value : []
  const playasCercanas = allPlayas
    .filter(p => p.slug !== playa.slug)
    .map(p => ({ ...p, distKm: haversine(playa.lat, playa.lng, p.lat, p.lng) / 1000 }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 6)

  return (
    <>
      {preloadFoto && <link rel="preload" as="image" href={preloadFoto} />}
      <SchemaPlaya
        playa={playa}
        agua={meteo.agua}
        olas={meteo.olas}
        viento={meteo.viento}
        uv={meteo.uv}
        tempAire={meteo.tempAire}
        calidadNivel={calidad?.nivel ?? null}
        fotoUrl={fotosData[0]?.url ?? null}
        fotoAutor={fotosData[0]?.autor}
        rating={(() => {
          if (votosResult.status !== 'fulfilled') return null
          const v = votosResult.value
          return v && v.votos > 0 ? { ratingValue: v.media, ratingCount: v.votos } : null
        })()}
        dateModified={dateModified}
        faqs={generarFaqsPlaya({
          playa,
          aguaC: meteo.agua,
          olasM: meteo.olas,
          vientoKmh: meteo.viento,
          vientoRacha: meteo.vientoRacha,
          vientoDir: meteo.vientoDireccion,
          banderaPlaya,
          medusas,
          mareasLunar,
          locale: 'en',
        })}
      />
      <Nav />
      <FichaHero
        playa={playa}
        meteo={meteo}
        estado={estado}
        frase={frase}
        locale="en"
        municipioSlug={municipioSlugProp}
        provinciaSlug={provinciaSlug}
        playaScore={playaScore}
      />
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
        horaIdeal={horaIdeal}
        playasCercanas={playasCercanas}
        municipioSlug={municipioSlugProp}
        provinciaSlug={provinciaSlug}
      />
    </>
  )
}
