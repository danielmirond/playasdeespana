import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import { getPlayaBySlug, getPlayas, getMunicipioSlugsSet, toSlug } from '@/lib/playas'
import { getCalidad } from '@/lib/calidad'
import { esIndexable, esExtranjera } from '@/lib/calidad-indexacion'
import { getVotos } from '@/lib/votos'
import { getReportes } from '@/lib/reportes'
import { getOpiniones } from '@/lib/opiniones'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { getFrase } from '@/lib/copy'
import { getMareas, getSol, getTurbidez } from '@/lib/marine'
import { getMeteoPlaya, getMeteoForecast } from '@/lib/meteo'
import { calcularBandera, estimarMedusas } from '@/lib/seguridad'
import { nombreConPlaya, haversine } from '@/lib/geo'
import { descripcionPlaya, introBrevePlaya } from '@/lib/copyPlaya'
import { getNecesidades } from '@/lib/asistentePlaya'
import { nombreMostrado } from '@/lib/nombres-populares'
import { estimarMareas } from '@/lib/mareas-lunar'
import { calcularHoraIdeal } from '@/lib/hora-ideal'
import { getRestaurantes } from '@/lib/restaurantes'
import { getCampings } from '@/lib/campings'
import type { Camping } from '@/lib/campings'
import { getCentrosBuceo } from '@/lib/buceo'
import type { CentroBuceo } from '@/lib/buceo'
import { getFotos, refetchAndStoreFotos, FOTOS_GENERICAS_POR_ESTADO } from '@/lib/fotos'
import type { FotoPlaya } from '@/lib/fotos'
import { getVideoYouTube } from '@/lib/videos'
import BeachVideoToggle from '@/components/playa/BeachVideoToggle'
import { getHoteles } from '@/lib/hoteles'
import { getEscuelas } from '@/lib/escuelas'
import type { Escuela } from '@/lib/escuelas'
import type { HotelReal } from '@/lib/hoteles'
import Nav from '@/components/ui/Nav'
import FichaHero from '@/components/playa/FichaHero'
import FichaNav from '@/components/playa/FichaNav'
import FichaBody from '@/components/playa/FichaBody'
import SchemaPlaya from '@/components/playa/SchemaPlaya'
import { generarFaqsPlaya } from '@/lib/faqsPlaya'
import { calcularPlayaScore } from '@/lib/scoring'
import { getPlayasDataModified } from '@/lib/dateModified'

// Mtime real del dataset MITECO. Reemplaza al fallback `new Date()` que
// Google detecta como timestamp-spam (lastSignificantUpdate del leak).
const PLAYAS_DATA_MODIFIED = getPlayasDataModified()

export const revalidate = 3600
// Dejamos techo de 25 s al render (Overpass para hoteles/restaurantes puede
// tardar 5-8 s). Hobby plan cappea a 10 s, Pro hasta 60 s. la plataforma
// elige el mínimo. Si la lookup server-side falla, FichaBody reintenta
// desde el cliente via /api/hoteles y /api/restaurantes.
export const maxDuration = 25

// Pre-renderizamos en build solo las TOP 30 fichas más populares.
// Antes era todas las banderas azules (647 × 17 fetches = timeout).
// Ahora con KV cache + deadline 1.5s + cron warm, build solo procesa
// 30 páginas y la mayoría de fetches sirve desde KV en ms.
//
// El resto (~5000 playas) sigue ISR con SWR 7d. Garantizamos TTFB
// CDN-edge para las más visitadas (las que mueven la aguja en NavBoost).
export async function generateStaticParams() {
  // Importamos getPlayas dentro de la función para evitar el cycle entre
  // este archivo y src/lib/playas durante el build initial.
  const { getPlayas } = await import('@/lib/playas')
  const playas = await getPlayas()

  // Heurística sin GSC: top 30 con Bandera Azul + servicios + accesibilidad.
  // Misma lógica que el cron /api/cron/warm?slice=top (mantener sincronizado).
  return playas
    .map(p => ({
      slug: p.slug,
      score:
        (p.bandera     ? 5 : 0) +
        (p.socorrismo  ? 1 : 0) +
        (p.parking     ? 1 : 0) +
        (p.accesible   ? 1 : 0) +
        (p.lat && p.lng ? 1 : 0),
    }))
    .filter(x => x.score >= 7)            // bandera azul + ≥2 servicios
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(x => ({ slug: x.slug }))
}

interface Props { params: Promise<{ slug: string }> }


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [playa, cal] = await Promise.all([getPlayaBySlug(slug), getCalidad(slug)])
  if (!playa) return {}

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  // Si la playa tiene alias popular (Kontxa Hondartza → La Concha),
  // lo usamos en title y descripcion para SEO castellano. Schema y H1
  // mantienen el oficial bilingue.
  const nombreParaSeo = nombreMostrado(slug, playa.nombre)
  const np = nombreConPlaya(nombreParaSeo)
  // Title corto (~50-60 chars) para que Google no lo trunque en SERP.
  // Antes era 134 chars → Google cortaba a "... Parking, hoteles y don..."
  // Estructura: [Nombre] hoy: estado del mar, bandera y servicios
  const title = `${np} hoy: estado del mar, bandera y servicios`
  // Meta description varía por atributos (bandera azul, actividades,
  // composición, dimensiones). Evita el "duplicate description" de
  // Search Console cuando 2.500 fichas comparten meta description
  // idéntica salvo el nombre.
  const description = descripcionPlaya(playa, np)

  const ogImage = new URL(`${BASE}/api/og`)
  ogImage.searchParams.set('playa', np)
  ogImage.searchParams.set('municipio', `${playa.municipio} · ${playa.provincia}`)
  if (playa.bandera) ogImage.searchParams.set('azul', 'true')
  ogImage.searchParams.set('comunidad', playa.comunidad)
  if (cal?.nivel) ogImage.searchParams.set('calidad', cal.nivel)

  const ogUrl = ogImage.toString()

  // Indexabilidad: fichas de baja calidad (slugs basura, sin nombre
  // propio, sin coords) van con noindex,follow. Mantienen valor de
  // crawl interno (follow) pero no compiten en SERP.
  const indexable = esIndexable(playa)

  return {
    title,
    description,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `${BASE}/playas/${slug}`,
      siteName: 'Playas de España',
      locale: 'es_ES',
      type: 'article',
      publishedTime: '2026-03-09T00:00:00Z',
      modifiedTime: new Date().toISOString(),
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${np}. condiciones en tiempo real` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
    alternates: {
      canonical: `/playas/${slug}`,
      languages: {
        'es':        `/playas/${slug}`,
        'en':        `/en/beaches/${slug}`,
        'x-default': `/en/beaches/${slug}`,
      },
    },
  }
}

export default async function PlayaPage({ params }: Props) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  // Deadline global de 1.5s sobre las fetches paralelas. Lo que no
  // resuelva se cae a fallback (vacío/null) — el cliente reintenta vía
  // /api/* tras hidratación (restaurantes, hoteles, campings, buceo,
  // escuelas tienen route handler propio). Antes era 4s y dejaba TTFB
  // hasta 4s en p99 si Overpass no respondía. 1.5s mantiene el meteo
  // y la cascada de fotos pero corta los Overpass lentos.
  //
  // ORDEN: los fetches críticos para hero/above-the-fold van primero
  // (no afecta tiempo, pero deja claro el contrato).
  const promesas = [
    // Críticos
    getMeteoPlaya(playa.lat, playa.lng),
    getSol(playa.lat, playa.lng),
    getMareas(playa.lat, playa.lng),
    getCalidad(slug),
    getFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia),
    getReportes(slug),
    getOpiniones(slug, 1, 10),
    getVotos(slug),
    getMeteoForecast(playa.lat, playa.lng),
    getTurbidez(playa.lat, playa.lng),
    // Usados below-the-fold (más sensibles a deadline)
    getRestaurantes(playa.lat, playa.lng),
    getHoteles(playa.lat, playa.lng),
    getCampings(playa.lat, playa.lng),
    getCentrosBuceo(playa.lat, playa.lng),
    getEscuelas(playa.lat, playa.lng),
    // Datos del filesystem (rápidos)
    getPlayas(),
    getMunicipioSlugsSet(),
    // Video YouTube — cache KV 30d, llamada API solo en miss
    getVideoYouTube(playa.nombre, playa.municipio, slug),
  ] as const
  const DEADLINE_MS = 1500
  const conDeadline = promesas.map(p =>
    Promise.race([
      p.then(v => ({ status: 'fulfilled' as const, value: v })),
      new Promise<{ status: 'rejected'; reason: string }>(r =>
        setTimeout(() => r({ status: 'rejected', reason: 'deadline' }), DEADLINE_MS)
      ),
    ]).catch(reason => ({ status: 'rejected' as const, reason: String(reason) }))
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [
    meteoPlaya, sol, mareas, calidadResult, fotos,
    reportesResult, opinionesResult, votosResult,
    meteoForecast, turbidez,
    restaurantes, hoteles, campingsResult, buceoResult, escuelasResult,
    allPlayasResult, municipioSlugsResult,
    videoResult,
  ] = await Promise.all(conDeadline) as any[]
  const videoData = videoResult?.status === 'fulfilled' ? videoResult.value : null
  const reportesData  = reportesResult.status === 'fulfilled'  ? reportesResult.value  : null
  const opinionesData = opinionesResult.status === 'fulfilled' ? opinionesResult.value : null
  const campingsData: Camping[] = campingsResult.status === 'fulfilled' ? campingsResult.value : []
  const buceoData: CentroBuceo[] = buceoResult.status === 'fulfilled' ? buceoResult.value : []

  // Warming post-respuesta: si algún fetch cayó por deadline, lo
  // re-disparamos en background DESPUÉS de devolver el HTML al usuario.
  // El cómputo termina sin bloquear al cliente actual; KV queda poblado
  // para el siguiente visitante. Soluciona el peor caso TTFB (cold KV +
  // Overpass lento). Vercel `after()` garantiza ejecución hasta 30s post-
  // respuesta antes de suspender la lambda.
  // Helpers para detectar resultados "no útiles":
  // - rejected (deadline)
  // - fulfilled pero con array vacío / null (la API respondió sin datos)
  // Ambos casos merecen warming post-respuesta: el primero porque el
  // dato no llegó; el segundo porque kvCached NO persiste arrays vacíos
  // (correcto para no envenenar el cache) — sin warming quedaría
  // permanentemente sin foto/hoteles si el cron warm tampoco lo logra.
  const needsWarm = (r: any): boolean => {
    if (!r || r.status === 'rejected') return true
    const v = r.value
    if (v === null || v === undefined) return true
    if (Array.isArray(v) && v.length === 0) return true
    return false
  }

  const failed: Array<[string, () => Promise<unknown>]> = []
  if (needsWarm(meteoPlaya))     failed.push(['meteo',  () => getMeteoPlaya(playa.lat, playa.lng)])
  if (needsWarm(mareas))         failed.push(['mareas', () => getMareas(playa.lat, playa.lng)])
  if (needsWarm(sol))            failed.push(['sol',    () => getSol(playa.lat, playa.lng)])
  // Para fotos: usamos refetchAndStoreFotos (salta el cache, incluido
  // el negative marker que se puede haber escrito al caer en deadline).
  // Así garantizamos un segundo intento real sin restricciones de tiempo.
  if (needsWarm(fotos))          failed.push(['fotos',  () => refetchAndStoreFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia)])
  if (needsWarm(restaurantes))   failed.push(['rest',   () => getRestaurantes(playa.lat, playa.lng)])
  if (needsWarm(hoteles))        failed.push(['hot',    () => getHoteles(playa.lat, playa.lng)])
  if (needsWarm(campingsResult)) failed.push(['camp',   () => getCampings(playa.lat, playa.lng)])
  if (needsWarm(buceoResult))    failed.push(['buc',    () => getCentrosBuceo(playa.lat, playa.lng)])
  if (needsWarm(escuelasResult)) failed.push(['esc',    () => getEscuelas(playa.lat, playa.lng)])

  if (failed.length > 0) {
    after(async () => {
      // Ejecutamos en paralelo. Ignoramos errores individuales — el
      // objetivo es solo poblar KV; ya servimos al usuario actual.
      await Promise.allSettled(failed.map(([, fn]) => fn()))
    })
  }

  // Enlaces condicionales de municipio y provincia: solo enlazamos el
  // municipio si tiene página propia (>=4 playas). La provincia siempre
  // es enlazable si existe. Cádiz / Cádiz genera dos links distintos.
  const municipioSlug = toSlug(playa.municipio)
  const provinciaSlug = playa.provincia ? toSlug(playa.provincia) : undefined
  const municipioSlugsSet = municipioSlugsResult.status === 'fulfilled' ? municipioSlugsResult.value : new Set<string>()
  const municipioSlugProp = municipioSlugsSet.has(municipioSlug) ? municipioSlug : undefined

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

  // dateModified prioritiza señales reales (Content Warehouse:
  // lastSignificantUpdate / semanticDateInfo). Orden:
  //   1. timestamp del meteo (cambia ~cada hora, refleja contenido actual)
  //   2. mtime del dataset MITECO (cambia con cada sync semanal)
  //   3. mtime del page.tsx (cambia con cada deploy del template)
  // Evitar `new Date()` por build: Google lo detecta como timestamp spam.
  const dateModified = meteoPlayaData?.timestamp ?? PLAYAS_DATA_MODIFIED

  const banderaPlaya = calcularBandera(olas, viento, vientoRacha)
  const medusas = estimarMedusas(playa.lat, playa.lng, tempAgua, viento, vientoDirRaw)
  const mareasLunar = estimarMareas(playa.lat, playa.lng)

  // Asistente "qué necesitas hoy" — reglas + IA opcional + cache 24h.
  // Independiente del cascade de fotos/video, no añade deadline.
  const necesidadesAsistente = await getNecesidades({
    playa,
    meteo: {
      agua:        meteo.agua,
      olas:        meteo.olas,
      viento:      meteo.viento,
      vientoRacha: meteo.vientoRacha,
      uv:          meteo.uv,
      tempAire:    meteo.tempAire,
    },
    bandera:  banderaPlaya,
    medusas,
    estado:   meteo.estado,
  }).catch(() => [])

  // Score 0-100 en tiempo real
  const playaScore = calcularPlayaScore(playa, {
    agua: meteo.agua,
    olas: meteo.olas,
    viento: meteo.viento,
    uv: meteo.uv,
  })
  const horaIdeal = calcularHoraIdeal({
    uv: meteoPlayaData?.uv_max ?? null,
    amanecer: solData?.amanecer,
    atardecer: solData?.atardecer,
    mareas: mareasLunar,
    mes: new Date().getMonth() + 1,
  })

  const calidad = calidadResult.status === 'fulfilled' ? calidadResult.value : null

  // Fallback genérico si la cascada de fotos cayó a [] (deadline,
  // negative cache, playa sin fotos en ninguna fuente). Mostramos una
  // foto genérica del pool por estado del mar para que el hero NUNCA
  // quede sin imagen. Marcamos source='__fallback' para distinguirla
  // de fotos reales en el schema (no representativeOfPage).
  const hayFotoReal = fotosData.length > 0
  let fotoHero = fotosData[0]
  if (!hayFotoReal) {
    const pool = FOTOS_GENERICAS_POR_ESTADO[(estadoKey as string).toUpperCase()] ?? FOTOS_GENERICAS_POR_ESTADO.CALMA
    const idx = (playa.slug.length + (estadoKey as string).length) % pool.length
    fotoHero = {
      url:    pool[idx],
      thumb:  pool[idx],
      fuente: 'unsplash' as const,
    }
  }

  const preloadFoto = fotoHero?.thumb ?? null

  // Playas cercanas (server-side, sin API extra)
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
        fotoUrl={hayFotoReal ? fotosData[0]?.url : null}
        fotoAutor={hayFotoReal ? fotosData[0]?.autor : undefined}
        rating={(() => {
          // Preferimos opiniones (rating + texto) sobre votos legacy (solo rating).
          if (opinionesData && opinionesData.total > 0) {
            return { ratingValue: opinionesData.media, ratingCount: opinionesData.total }
          }
          if (votosResult.status !== 'fulfilled') return null
          const v = votosResult.value
          return v && v.votos > 0 ? { ratingValue: v.media, ratingCount: v.votos } : null
        })()}
        reviews={opinionesData?.items ?? undefined}
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
          locale: 'es',
        })}
        video={videoData ? {
          videoId:      videoData.videoId,
          title:        videoData.title,
          channelTitle: videoData.channelTitle,
          publishedAt:  videoData.publishedAt,
          thumbnail:    videoData.thumbnail,
        } : null}
      />
      <Nav />
      <FichaHero
        playa={playa}
        meteo={meteo}
        estado={estado}
        frase={frase}
        municipioSlug={municipioSlugProp}
        provinciaSlug={provinciaSlug}
        playaScore={playaScore}
        reportes={reportesData}
        foto={fotoHero ?? null}
      />
      {/* BeachVideo se renderiza ahora dentro de FichaBody como
          BeachVideoToggle (click-to-load) tras el bloque asistente
          y antes de la galería completa. Esto saca el iframe del
          above-the-fold y mejora LCP/INP — el critique de diseño
          (PR #84) destacó que el video estaba robando atención
          antes del contenido textual concreto. */}
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
        campings={campingsData}
        centrosBuceo={buceoData}
        escuelas={escuelasData}
        turbidez={turbidezData}
        forecastSurf={forecastSurf}
        meteoForecast={meteoForecastData}
        dateModified={dateModified}
        banderaPlaya={banderaPlaya}
        medusas={medusas}
        mareasLunar={mareasLunar}
        horaIdeal={horaIdeal}
        playasCercanas={playasCercanas}
        opinionesIniciales={opinionesData}
        municipioSlug={municipioSlugProp}
        provinciaSlug={provinciaSlug}
        necesidades={necesidadesAsistente}
        videoData={videoData}
      />
    </>
  )
}
