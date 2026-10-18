// /portugal/playas/[slug] — la ficha portuguesa, con el componente de verdad.
//
// La primera versión era una página escrita a mano: 526 palabras contra las
// 2.367 de una ficha española, 4 secciones contra 18. No servía. De las 18
// secciones, 15 no tienen nada de español: oleaje por horas, mejor hora,
// calidad del agua, campings, aparcamiento, cercanas, datos, preguntas,
// cuaderno, opiniones, restaurantes, hoteles, buceo, actividades y fotos.
// Solo tres lo son —banderas autonómicas, AEMET y mareas de Puertos del
// Estado— y esas el componente ya sabe callarlas: son props opcionales y
// lo que no llega no se pinta.
//
// Así que aquí no se reescribe nada. Se prepara el mismo contrato de datos
// con lo que Portugal tiene y se pasa `geo`, que es lo único que el
// componente no podía deducir: que aquí no hay provincia sino región
// hidrográfica, y que el inventario es el de la APA.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FichaHero from '@/components/playa/FichaHero'
import FichaNav from '@/components/playa/FichaNav'
import FichaBody from '@/components/playa/FichaBody'
import Nav from '@/components/ui/Nav'
import { getPraia, getPraiasCosta, praiaComoPlaya, regionLegible, concelhoSlug, getFotoPraia } from '@/lib/praias'
import { getMeteoPlaya, getMeteoForecast } from '@/lib/meteo'
import { getMareas, getSol } from '@/lib/marine'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { getFrase } from '@/lib/copy'
import { calcularHoraIdeal } from '@/lib/hora-ideal'
import { robotsMeta } from '@/lib/robots-meta'
import type { Playa } from '@/types'

export const revalidate = 3600
export const dynamicParams = true
export function generateStaticParams() { return [] }

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getPraia(slug)
  if (!p) return {}
  return {
    title: `${p.nombre} (${p.municipio}) hoy: estado del mar y servicios`,
    description: `Temperatura del agua, oleaje y viento de ${p.nombre}, en ${p.municipio}. Servicios, bandera azul y temporada de baño según el inventario oficial portugués.`,
    alternates: { canonical: `/portugal/playas/${slug}` },
    robots: robotsMeta(),
  }
}

const fecha = (iso: string | null) => iso
  ? new Date(iso + 'T12:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' })
  : null

export default async function PraiaPage({ params }: Props) {
  const { slug } = await params
  const praia = await getPraia(slug)
  if (!praia) notFound()

  const [meteoData, mareasData, solData, forecast, costa, foto] = await Promise.all([
    getMeteoPlaya(praia.lat, praia.lng).catch(() => null),
    getMareas(praia.lat, praia.lng).catch(() => null),
    getSol(praia.lat, praia.lng).catch(() => null),
    getMeteoForecast(praia.lat, praia.lng).catch(() => []),
    getPraiasCosta(),
    getFotoPraia(slug),
  ])

  const h = new Date().getUTCHours()
  const olas = mareasData?.oleaje_m?.[h] ?? mareasData?.oleaje_m?.[0] ?? null
  const tempAgua = mareasData?.temp_agua?.[h] ?? mareasData?.temp_agua?.[0] ?? null
  const periodo = mareasData?.wave_period?.[h] ?? mareasData?.wave_period?.[0] ?? null
  const viento = meteoData?.viento_kmh ?? null

  const estadoKey = calcularEstado({ olas, viento })
  const estado = ESTADOS[estadoKey]
  const seed = praia.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  // La frase es una conclusión: sin dato de mar y viento, se calla.
  const frase = (olas != null && viento != null)
    ? getFrase(estadoKey, seed % 3)
    : 'Actualizando datos del mar…'

  const meteo = {
    agua: tempAgua, olas, viento,
    vientoRacha: meteoData?.viento_racha ?? null,
    vientoDireccion: meteoData?.viento_dir ?? null,
    vientoDirDeg: meteoData?.viento_dir_deg ?? null,
    uv: meteoData?.uv_max ?? null,
    tempAire: meteoData?.temp_aire ?? null,
    sensacion: meteoData?.sensacion ?? meteoData?.temp_aire ?? null,
    humedad: meteoData?.humedad ?? 0,
    estado: estadoKey,
    amanecer: solData?.amanecer,
    atardecer: solData?.atardecer,
    periodo,
    marFondo: mareasData?.mar_fondo_m?.[0] ?? null,
    marFondoPeriodo: mareasData?.mar_fondo_periodo?.[0] ?? null,
    marFondoDir: mareasData?.mar_fondo_dir?.[0] ?? null,
    marViento: mareasData?.mar_viento_m?.[0] ?? null,
  }

  const oleajeHoras = mareasData
    ? mareasData.oleaje_m.map((v, i) => ({ h: i === 0 ? 'Ahora' : `+${i}h`, v: parseFloat(v.toFixed(1)) }))
    : null

  // Mejor hora: puro cálculo sobre UV, amanecer/atardecer y mes, sin nada
  // español dentro. El mes se saca en Europe/Lisbon, no en Europe/Madrid:
  // Portugal va una hora por detrás y en el cambio de mes a medianoche la
  // ficha diría el mes siguiente. Sin `mareas`, que es opcional y aquí no
  // tenemos el formato lunar que espera.
  const mesLisboa = Number(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).slice(5, 7))
  const horaIdeal = calcularHoraIdeal({
    uv: meteoData?.uv_max ?? null,
    amanecer: solData?.amanecer,
    atardecer: solData?.atardecer,
    mes: mesLisboa,
  })

  const playa = praiaComoPlaya(praia) as unknown as Playa

  // Las praias de al lado, en el formato que espera la ficha.
  const cercanas = costa
    .filter(p => p.slug !== praia.slug)
    .map(p => ({ p, d: Math.hypot((p.lat - praia.lat) * 111, (p.lng - praia.lng) * 85) }))
    .sort((a, b) => a.d - b.d).slice(0, 6)
    .map(({ p, d }) => ({ ...praiaComoPlaya(p), distancia: d, href: `/portugal/playas/${p.slug}` }))

  const geo = {
    paisNombre: 'Portugal',
    paisHref: '/portugal',
    municipioHref: `/portugal/municipio/${concelhoSlug(praia.municipio)}`,
    regionEtiqueta: 'Región',
    region: regionLegible(praia.region),
    inventario: 'Agência Portuguesa do Ambiente (SNIRH)',
    fichaOficial: praia.fichaOficial,
  }

  return (
    <>
      <Nav />
      <FichaHero
        playa={playa}
        meteo={meteo}
        estado={estado}
        frase={frase}
        foto={foto}
        banderaPlaya={null}
        certBandera="estimado"
        hayFuenteOficial={false}
      />
      <FichaNav />
      <FichaBody
        playa={playa}
        meteo={meteo}
        solData={solData}
        oleajeHoras={oleajeHoras}
        meteoForecast={forecast}
        forecastSurf={mareasData?.forecast ?? null}
        geo={geo}
        horaIdeal={horaIdeal}
        playasCercanas={cercanas as never}
        certBandera="estimado"
        hoyISO={new Date().toISOString().slice(0, 10)}
        dateModified={new Date().toISOString()}
      />
      {/* Lo que el inventario portugués da y el español no. Va aquí, fuera
          del componente compartido, porque es específico de este país. */}
      <aside style={{ maxWidth: 820, margin: '0 auto', padding: '0 1.25rem 3rem', fontSize: '.88rem', lineHeight: 1.65, color: 'var(--muted)' }}>
        {praia.calidadAgua && <p style={{ margin: '0 0 .5rem' }}>
          Calidad del agua según la Agência Portuguesa do Ambiente: <b style={{ color: 'var(--ink)' }}>{praia.calidadAgua}</b>.
          {praia.temporadaInicio && <> Temporada de baño del {fecha(praia.temporadaInicio)} al {fecha(praia.temporadaFin)}.</>}
        </p>}
        {(praia.olasFuertes || praia.riesgoDesprendimiento || praia.obras) && (
          <p style={{ margin: '0 0 .5rem' }}>
            <b style={{ color: 'var(--ink)' }}>Avisos del inventario:</b>{' '}
            {[praia.olasFuertes && 'oleaje fuerte habitual',
              praia.riesgoDesprendimiento && 'riesgo de desprendimientos en el acantilado',
              praia.obras && 'obras en curso'].filter(Boolean).join(', ')}.
          </p>
        )}
        {praia.sillaAnfibia && <p style={{ margin: '0 0 .5rem' }}>Tiene <b style={{ color: 'var(--ink)' }}>silla anfibia</b>, un dato que el inventario español no recoge.</p>}
        <p style={{ margin: 0 }}>
          Servicios, bandera azul, accesibilidad y temporada salen del inventario de la {geo.inventario}.
          {praia.fichaOficial && <> <a href={praia.fichaOficial} target="_blank" rel="noopener">Ficha oficial de {praia.nombre}</a>.</>}
          {praia.webcam && <> <a href={praia.webcam} target="_blank" rel="noopener">Webcam en directo</a>.</>}
        </p>
      </aside>
    </>
  )
}
