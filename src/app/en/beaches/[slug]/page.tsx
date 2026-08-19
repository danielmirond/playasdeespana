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
import type { BanderaPlaya } from '@/lib/seguridad'
import { getBanderaCat, tieneBanderaCat } from '@/lib/banderas-cat'
import { getBanderaCan, tieneBanderaCan } from '@/lib/banderas-can'
import { getBanderaAnd, tieneBanderaAnd } from '@/lib/banderas-and'
import { getBanderaBiz, tieneBanderaBiz } from '@/lib/banderas-biz'
import { getBanderaGip, tieneBanderaGip } from '@/lib/banderas-gip'
import { getBanderaSb, tieneBanderaSb } from '@/lib/banderas-sb'
import { getBanderaFerrol, tieneBanderaFerrol } from '@/lib/banderas-ferrol'
import { getBanderaGijon, tieneBanderaGijon } from '@/lib/banderas-gijon'
import { esUsoProhibido } from '@/lib/playas-prohibidas'
import { getMareasMunicipio } from '@/lib/mareas-portus'
import { toSlug as slugMuni } from '@/lib/playas'
import { nombreConPlaya, haversine } from '@/lib/geo'
import { estimarMareas } from '@/lib/mareas-lunar'
import { calcularHoraIdeal } from '@/lib/hora-ideal'
import { getRestaurantes } from '@/lib/restaurantes'
import { getCampings } from '@/lib/campings'
import type { Camping } from '@/lib/campings'
import { getCentrosBuceo } from '@/lib/buceo'
import type { CentroBuceo } from '@/lib/buceo'
import { getFotos } from '@/lib/fotos'
import { getHoteles } from '@/lib/hoteles'
import Nav from '@/components/ui/Nav'
import FichaHero from '@/components/playa/FichaHero'
import FichaNav from '@/components/playa/FichaNav'
import FichaBody from '@/components/playa/FichaBody'
import SchemaPlaya from '@/components/playa/SchemaPlaya'
import { generarFaqsPlaya } from '@/lib/faqsPlaya'
import { calcularPlayaScore } from '@/lib/scoring'
import { dsVariant } from '@/lib/flags'

export const revalidate = 3600
export const maxDuration = 25

export async function generateStaticParams() {
  // ISR on-demand. no pre-render at build to avoid 45-min timeout.
  return []
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [playa, cal] = await Promise.all([getPlayaBySlug(slug), getCalidad(slug)])
  if (!playa) return {}

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const np = nombreConPlaya(playa.nombre)
  // Este title medía 135 caracteres servidos y Google enseñaba menos de
  // la mitad: se cortaba en «…conditions, wind and w». Es exactamente el
  // title largo que la versión española corrigió hace tiempo, y que aquí
  // nunca se portó.
  //
  // La estructura ahora imita a la española, que sí rinde: el nombre
  // primero —es lo que se busca— y después qué encuentras. Y sin «How
  // is», que gastaba siete caracteres antes del topónimo.
  //
  // 46 caracteres con un nombre típico, dentro del corte incluso con
  // nombres largos.
  const title = `${playa.nombre} today: sea, flag and facilities`
  const description = `Sea conditions at ${np} today. Water temperature, waves, wind, flag, jellyfish and facilities. Nearby parking, hotels and restaurants.`

  const ogImage = new URL(`${BASE}/api/og`)
  ogImage.searchParams.set('playa', np)
  ogImage.searchParams.set('municipio', `${playa.municipio} · ${playa.provincia}`)
  if (playa.bandera) ogImage.searchParams.set('azul', 'true')
  ogImage.searchParams.set('comunidad', playa.comunidad)
  if (cal?.nivel) ogImage.searchParams.set('calidad', cal.nivel)

  const ogUrl = ogImage.toString()

  return {
    // absolute: sin la marca del layout, igual que en la ficha en
    // español. En una ficha la marca no llega a verse y solo gasta 19
    // caracteres. En OG sí se queda: al compartir no hay corte y aporta
    // contexto.
    title: { absolute: title },
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
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${np}. live sea conditions` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
    alternates: {
      canonical: `/en/beaches/${slug}`,
      languages: { 'es': `/playas/${slug}`, 'en': `/en/beaches/${slug}`, 'x-default': `/playas/${slug}` },
    },
  }
}

export default async function BeachPageEn({ params }: Props) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  const [mareas, sol, meteoPlayaResult, restaurantes, fotos, hoteles, turbidez, meteoForecast, calidadResult, allPlayasResult, municipioSlugsResult, votosResult, campingsResult, buceoResult,
    banderaCatResult, banderaCanResult, banderaAndResult, banderaBizResult, banderaGipResult, banderaSbResult, banderaFerResult, banderaGijResult] = await Promise.allSettled([
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
    getCampings(playa.lat, playa.lng),
    getCentrosBuceo(playa.lat, playa.lng),
    // Banderas OFICIALES. Faltaban aquí: esta página calculaba la bandera
    // con calcularBandera y punto, sin ninguna capa oficial encima. Es
    // decir, el 15-ago-2026 la ficha inglesa de La Misericordia decía
    // "Green flag — Calm sea, safe for swimming" mientras el ayuntamiento
    // tenía el baño prohibido por E. coli. Un turista extranjero es
    // justamente quien menos posibilidades tiene de leer el aviso local.
    getBanderaCat(slug),
    getBanderaCan(slug),
    getBanderaAnd(slug),
    // Bandera OFICIAL izada (Bizkaia). Aporta el estado cerrada/precintada,
    // que va aparte del color: una playa puede estar precintada sin bandera.
    getBanderaBiz(slug),
    // Bandera OFICIAL izada (Gipuzkoa, KostaSystem de la Diputación).
    getBanderaGip(slug),
    // Bandera izada en municipios con SafeBeach (Levante, Baleares, Murcia).
    getBanderaSb(slug),
    // Ferrol: única fuente de bandera pública de Galicia. Gijón: única de Asturias.
    getBanderaFerrol(slug),
    getBanderaGijon(slug),
  ])
  const campingsData: Camping[] = campingsResult.status === 'fulfilled' ? campingsResult.value : []
  const buceoData: CentroBuceo[] = buceoResult.status === 'fulfilled' ? buceoResult.value : []

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
  // Misma cascada y mismas reglas que la ficha en español: la bandera
  // oficial izada REEMPLAZA a la estimación, y si sabemos que hay fuente
  // oficial pero no hemos podido leerla no se adivina.
  let banderaPlaya: BanderaPlaya | undefined = calcularBandera(olas, viento, vientoRacha)
  let certBandera: 'oficial' | 'reportado' | 'estimado' | 'sindato' = 'estimado'
  const oficialCat = banderaCatResult.status === 'fulfilled' ? banderaCatResult.value : null
  const oficialCan = banderaCanResult.status === 'fulfilled' ? banderaCanResult.value : null
  const oficialFer = banderaFerResult?.status === 'fulfilled' ? banderaFerResult.value : null
  const oficialGij = banderaGijResult?.status === 'fulfilled' ? banderaGijResult.value : null
  const oficialSb = banderaSbResult?.status === 'fulfilled' ? banderaSbResult.value : null
  const oficialGip = banderaGipResult?.status === 'fulfilled' ? banderaGipResult.value : null
  const oficialBiz = banderaBizResult?.status === 'fulfilled' ? banderaBizResult.value : null
  const oficialAnd = banderaAndResult.status === 'fulfilled' ? banderaAndResult.value : null
  if (oficialCat?.bandera) { banderaPlaya = oficialCat.bandera; certBandera = 'oficial' }
  if (oficialCan?.bandera) { banderaPlaya = oficialCan.bandera; certBandera = 'oficial' }
  if (oficialAnd?.bandera) { banderaPlaya = oficialAnd.bandera; certBandera = 'oficial' }
  if (oficialBiz?.bandera) { banderaPlaya = oficialBiz.bandera; certBandera = 'oficial' }
  if (oficialGip?.bandera) { banderaPlaya = oficialGip.bandera; certBandera = 'oficial' }
  if (oficialSb?.bandera) { banderaPlaya = oficialSb.bandera; certBandera = 'oficial' }
  if (oficialFer?.bandera) { banderaPlaya = oficialFer.bandera; certBandera = 'oficial' }
  if (oficialGij?.bandera) { banderaPlaya = oficialGij.bandera; certBandera = 'oficial' }
  //
  // QUIÉN ENTRA AQUÍ Y QUIÉN NO, que es una decisión y no un olvido:
  //
  // Entran las administraciones con parte diario. Si su feed no responde,
  // no adivinamos.
  //
  // NO entran SafeBeach ni Gijón, porque en ellas devolver null es el
  // estado NORMAL: SafeBeach viene en gris fuera del horario de socorrismo
  // —verificado a las 09:17 con Guardamar y Valencia en gris cuando la
  // tarde anterior tenían bandera— y Gijón tiene `bandera: null` en todas
  // sus zonas buena parte del día. Aplicarles la regla dejaría Baleares,
  // Levante y Gijón en blanco cada noche, que es ruido, no seguridad.
  const oficialFallo =
    (tieneBanderaCat(slug) && !oficialCat) ||
    (tieneBanderaCan(slug) && !oficialCan) ||
    (tieneBanderaAnd(slug) && !oficialAnd) ||
    (tieneBanderaBiz(slug) && !oficialBiz) ||
    (tieneBanderaGip(slug) && !oficialGip) ||
    (tieneBanderaFerrol(slug) && !oficialFer)
  if (oficialFallo && certBandera !== 'oficial') { banderaPlaya = undefined; certBandera = 'sindato' }
  if (oficialAnd?.cerrada && banderaPlaya?.color !== 'roja') {
    banderaPlaya = {
      color: 'roja', label: 'Red flag', labelEn: 'Red flag',
      motivo: 'Beach closed today by the authorities',
      motivoEn: 'Beach closed today by the authorities', hex: '#ef4444',
    }
    certBandera = 'oficial'
  }
  const medusas = estimarMedusas(playa.lat, playa.lng, tempAgua, viento, vientoDirRaw)
  const mareasLunar = estimarMareas(playa.lat, playa.lng)
  // Predicción OFICIAL de Puertos del Estado para el municipio. Si llega,
  // manda sobre la lunar en el bloque de mareas de la ficha. Misma llamada
  // que la página /municipio/[slug]/tabla-de-mareas, compartida vía KV.
  // Con su propio plazo: este await está fuera del Promise.all con deadline
  // de la ficha, y en frío Portus puede tardar. Si no llega en 1,5 s, la
  // ficha sigue con la lunar —marcada como estimación— y el warming de
  // KV hará que la siguiente la tenga.
  const mareasOficialesRaw = await Promise.race([
    getMareasMunicipio(slugMuni(playa.municipio ?? ''), playa.lat, playa.lng).catch(() => null),
    new Promise<null>(r => setTimeout(() => r(null), 1500)),
  ])
  const mareasOficiales = mareasOficialesRaw
    ? { extremos: mareasOficialesRaw.extremos.map(e => ({ hora: e.hora, dia: e.dia, tipo: e.tipo, altura: e.altura })), ubicacion: mareasOficialesRaw.ubicacion.nombre }
    : null

  // Qué día es hoy, en hora peninsular y decidido aquí, en el servidor.
  // Mismo motivo que en la ficha en español: TraficoSection se renderiza
  // en las dos partes y calcularlo por su cuenta daba UTC en Vercel y
  // hora local en el navegador, rompiendo la hidratación. Las playas son
  // las mismas aunque la página esté en inglés.
  const hoyMadridISO = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())                                  // YYYY-MM-DD

  const horaIdeal = calcularHoraIdeal({
    uv: meteoPlayaData?.uv_max ?? null,
    amanecer: solData?.amanecer,
    atardecer: solData?.atardecer,
    mareas: mareasLunar,
    mes: Number(hoyMadridISO.slice(5, 7)),
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
      {/* banderaPlaya y variante no se pasaban en la versión inglesa. Sin
          bandera no había regla de bandera roja: el hero inglés pintaba el
          score con el mar cerrado, que es justo lo que el manual prohíbe.
          Y sin variante se quedaba sin la rejilla 2×2 de la española. */}
      <FichaHero
        playa={playa}
        meteo={meteo}
        estado={estado}
        frase={frase}
        locale="en"
        municipioSlug={municipioSlugProp}
        provinciaSlug={provinciaSlug}
        playaScore={playaScore}
        banderaPlaya={banderaPlaya}
        certBandera={certBandera}
        variante={dsVariant()}
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
        campings={campingsData}
        centrosBuceo={buceoData}
        turbidez={turbidezData}
        forecastSurf={forecastSurf}
        meteoForecast={meteoForecastData}
        dateModified={dateModified}
        banderaPlaya={banderaPlaya}
        certBandera={certBandera}
        usoProhibido={esUsoProhibido(slug)}
        medusas={medusas}
        mareasLunar={mareasLunar}
        mareasOficiales={mareasOficiales}
        horaIdeal={horaIdeal}
        playasCercanas={playasCercanas}
        municipioSlug={municipioSlugProp}
        provinciaSlug={provinciaSlug}
        hoyISO={hoyMadridISO}
      />
    </>
  )
}
