'use client'
// src/components/playa/FichaBody.tsx
import { SLOTS } from '@/lib/adsense'
import { useEffect, useState } from 'react'
import type { Playa, Restaurante } from '@/types'
import type { FotoPlaya } from '@/lib/fotos'
import type { HotelReal } from '@/lib/hoteles'
import type { Camping } from '@/lib/campings'
import type { CentroBuceo } from '@/lib/buceo'
import { Dato, CertBadge, type Certeza } from './Certeza'
import Medusa from '@/components/ui/Medusa'
import { nombrarViento } from '@/lib/vientos'
import ListaPOI from './ListaPOI'
import CuadernoCTA from './CuadernoCTA'
import type { ForecastDay, TurbidezData } from '@/lib/marine'
import type { MeteoForecast } from '@/lib/meteo'
import type { BanderaPlaya, MedusasRiesgo } from '@/lib/seguridad'
import type { MareasDia } from '@/lib/mareas-lunar'
import type { HoraIdeal } from '@/lib/hora-ideal'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import IluEstado from './IluEstado'
import Collapsible from '@/components/ui/Collapsible'
import { ESTADOS } from '@/lib/estados'
import { getProductosParaPlaya } from '@/lib/amazon-productos'
import { getTiposParaPlaya } from '@/lib/tiposQueLlevar'
import styles from './FichaBody.module.css'
import FichaAsideActions from './FichaAsideActions'
import TextoSEO from './TextoSEO'
import HubsRelacionados from './HubsRelacionados'
import AlquilerBarcoCTA, { debeMostrarCTABarco } from './AlquilerBarcoCTA'
import FerriesCTA from './FerriesCTA'
import PhotoCarousel from './PhotoCarousel'
import type { Escuela } from '@/lib/escuelas'
import { generarFaqsPlaya } from '@/lib/faqsPlaya'
import { nombreMostrado } from '@/lib/nombres-populares'
import { introBrevePlaya } from '@/lib/copyPlaya'
import { nombreConPlaya } from '@/lib/geo'
import { generarReporteSistema } from '@/lib/reporteSistema'
import EstadoHoy from './EstadoHoy'
import AsistentePlaya from './AsistentePlaya'
import TrustSeal from '@/components/common/TrustSeal'
import ContextualCTA from './ContextualCTA'
import { flags } from '@/lib/flags'
import { hayBanderaRoja, ordenBanderaRoja, BLOQUES_DUROS } from '@/lib/bandera-roja'
import AffiliatesCTABlock from './AffiliatesCTABlock'
import OpinionesDestacadas from './OpinionesDestacadas'
import BeachVideoToggle from './BeachVideoToggle'
import WebcamPlaya from './WebcamPlaya'
import { Camera, Waves, Sun, Drop, ForkKnife, Bed, Thermometer, Wind, Car, Bus, Bicycle, Person, MapPin, Star, Fish, SunHorizon, Flag, Gauge, Martini } from '@phosphor-icons/react'
import Hueco from '@/components/ui/Hueco'
import { tinte } from '@/lib/tinte'
import { miles } from '@/lib/miles'
import { zonaHoraria } from '@/lib/zona-horaria'
import GygActivities from '@/components/GygActivities'

const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID ?? ''
const PARCLICK_AFF = process.env.NEXT_PUBLIC_PARCLICK_AFF ?? ''
const CIVITATIS_AFF = process.env.NEXT_PUBLIC_CIVITATIS_AFF ?? ''
const THEFORK_AFF = process.env.NEXT_PUBLIC_THEFORK_AFF ?? ''
const RENTALCARS_AFF = process.env.NEXT_PUBLIC_RENTALCARS_AFF ?? ''
const PITCHUP_AFF = process.env.NEXT_PUBLIC_PITCHUP_AFF ?? ''

// Lazy load below-fold components (SSR habilitado para SEO; solo Leaflet no soporta SSR)
const TraficoSection = dynamic(() => import('./TraficoSection'))
const SurfSection = dynamic(() => import('./SurfSection'))
const EscuelasSection = dynamic(() => import('./EscuelasSection'))
const MapaLeaflet = dynamic(() => import('@/components/ui/MapaLeafletWrapper'), { ssr: false })
const ReportarDrawer = dynamic(() => import('./ReportarDrawer'), { ssr: false })
const AfiliacionDrawer = dynamic(() => import('./AfiliacionDrawer'), { ssr: false })
const AsideAfiliacionCTA = dynamic(() => import('./AsideAfiliacionCTA'), { ssr: false })
const Opiniones = dynamic(() => import('./Opiniones'))
const VotacionPlaya = dynamic(() => import('./VotacionPlaya'), {
  ssr: false,
  loading: () => <div style={{ height: 148, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--card-bg)' }} />,
})

interface Meteo {
  // null = el fetch cayó y NO hay dato real; la UI muestra "—", nunca inventa.
  agua: number | null; olas: number | null; viento: number | null; vientoRacha: number
  /** Rumbo meteorológico en grados. Alimenta lib/vientos. */
  vientoDirDeg?: number | null
  vientoDireccion: string; uv: number | null; tempAire: number | null
  sensacion: number | null; humedad: number
  amanecer?: string; atardecer?: string; estado: string; periodo?: number
}
interface OleajeHora { h: string; v: number }
interface SolData { amanecer: string; atardecer: string; horas_luz: string; pct_dia: number }
interface Calidad { nivel: string; porcentaje: number; temporada: number }
interface Props {
  playa:          Playa
  meteo:          Meteo
  solData?:       SolData | null
  oleajeHoras?:   OleajeHora[] | null
  calidad?:       Calidad | null
  restaurantes?:  Restaurante[]
  fotos?:         FotoPlaya[]
  hoteles?:       HotelReal[]
  campings?:      Camping[]
  centrosBuceo?:  CentroBuceo[]
  escuelas?:      Escuela[]
  turbidez?:      TurbidezData | null
  forecastSurf?:  ForecastDay[] | null
  meteoForecast?: MeteoForecast[]
  dateModified?:   string
  banderaPlaya?:   BanderaPlaya
  /** Predicción oficial AEMET del día (null sin API key o sin mapeo). */
  aemet?:          import('@/lib/aemet').AemetPlaya | null
  boya?:           import('@/lib/boyas').DatosBoya | null
  /** Capa que ganó la cascada de bandera — decide la insignia de fuente */
  certBandera?:    Certeza
  /**
   * Baño prohibido de forma permanente (catálogo oficial), distinto de
   * la bandera del día: el mar puede estar en calma y seguir prohibido.
   */
  usoProhibido?: boolean
  /** Avisos de viento de bañistas en las últimas 24 h */
  vientoReportado?: { n: number; detalle: string; detalleEn: string } | null
  chiringuitos?:   import('@/lib/chiringuitos-playa').ChiringuitoCerca[]
  medusas?:        MedusasRiesgo
  mareasLunar?:    MareasDia
  /**
   * Predicción OFICIAL de Puertos del Estado para el municipio, si lo hay.
   * Cuando llega, manda sobre la estimación lunar: medido 39 min de error
   * en la lunar frente a la tabla armónica (Cádiz, ago-2026).
   */
  mareasOficiales?: { extremos: Array<{ hora: string; dia: string; tipo: 'pleamar' | 'bajamar'; altura: number }>; ubicacion: string } | null
  horaIdeal?:      HoraIdeal
  playasCercanas?: { slug: string; nombre: string; municipio: string; distKm: number; bandera?: boolean; foto?: string }[]
  /** Agregado de opiniones server-side para SSR + JSON-LD. */
  opinionesIniciales?: import('@/lib/opiniones').OpinionesAgregadas | null
  /** Necesidades generadas por el asistente (reglas + IA opcional).
   *  Se renderiza una sección "Qué necesitas hoy" arriba del bloque
   *  de fotos para que sea visible above-the-fold. */
  necesidades?:    import('@/lib/asistentePlaya').Necesidad[]
  /** Video YouTube si existe. Se renderiza con BeachVideoToggle
   *  (click-to-load) después del asistente, ya no above-the-fold. */
  videoData?:      import('@/lib/videos').VideoPlaya | null
  /** Webcams en directo cercanas (Windy). [] si no hay clave o no hay cam. */
  webcams?:        import('@/lib/webcams').Webcam[]
  locale?:         'es' | 'en'
  /** Slug del municipio si la página existe (ver getMunicipioSlugsSet). */
  municipioSlug?:  string
  /** Slug de la provincia si la página existe. */
  provinciaSlug?:  string
  /**
   * Qué día es hoy, decidido por el SERVIDOR y en hora peninsular.
   *
   * TraficoSection lo necesita para estimar la afluencia por hora, y lo
   * calculaba con `new Date()` en su propio render. Como es un
   * componente cliente que TAMBIÉN se renderiza en servidor, eso daba
   * dos respuestas distintas —Vercel corre en UTC, el visitante está en
   * Madrid— y rompía la hidratación en cada ficha.
   *
   * Fijar la zona horaria dentro del componente no bastaría: la página
   * es ISR con una hora de caducidad, así que el HTML cacheado puede
   * ser de ayer aunque el reloj coincida. Viniendo del servidor como
   * prop, cliente y servidor dicen lo mismo por construcción.
   *
   * Formato `YYYY-MM-DD`. Una sola fecha en vez de día y mes sueltos:
   * de ella salen el día de la semana, el mes y si es festivo, y así no
   * pueden descuadrarse entre sí.
   */
  hoyISO:          string
}

const T = {
  es: {
    galeria:(n:string)=>`Fotos de ${n}`, galSrc:'Wikimedia · Flickr · Unsplash', verFotos:'Ver fotos',
    oleaje:(n:string)=>`Oleaje y olas en ${n} ahora`, oleajeSrc:'Open-Meteo Marine',
    luzSolar:'Luz solar', luzSrc:'Sunrise-Sunset API',
    mareas:(n:string)=>`Mareas en ${n} hoy`, mareasSrc:'Estimación lunar',
    pleamar:'Pleamar', bajamar:'Bajamar', coeficiente:'Coeficiente',
    vivas:'Mareas vivas', muertas:'Mareas muertas', mediasLabel:'Mareas medias',
    amanecer:'Amanecer', horasLuz:'Horas de luz', atardecer:'Atardecer',
    temperatura:(n:string)=>`Temperatura del agua y aire en ${n}`, tempSrc:'Open-Meteo',
    tempAire:'Temperatura aire', tempAgua:'Temperatura agua',
    sensacion:'Sensación térmica', indiceUV:'Índice UV', humedad:'Humedad',
    viento:(n:string)=>`Viento en ${n} hoy`, velocidad:'Velocidad', racha:'Racha máxima', direccion:'Dirección',
    seguridad:(n:string)=>`Bandera y medusas en ${n}`, seguridadSrc:'Estimación Open-Meteo',
    banderaLabel:'Bandera de baño', medusasLabel:'Medusas',
    calidad:(n:string)=>`Calidad del agua en ${n}`, calidadSrc:'EEA · 2006/7/CE',
    muestras:'Muestras conformes', temporada:'Temporada', clasificacion:'Clasificación',
    comer:(n:string)=>`Restaurantes cerca de ${n}`, comerSrcOSM:'OpenStreetMap · 800m', resenas:'reseñas',
    chiringuitos:(n:string)=>`Chiringuitos en ${n}`, chiringuitosSrc:'Google Places',
    chiringuitosTodos:(p:string)=>`Todos los chiringuitos de ${p} →`,
    dormir:(n:string)=>`Hoteles cerca de ${n}`, dormirSrc:'OpenStreetMap · 2km',
    servicios:(n:string)=>`Servicios en ${n}`, serviciosSrc:'MITECO',
    info:(n:string)=>`Información de ${n}`, infoSrc:'MITECO 2024',
    longitud:'Longitud', anchura:'Anchura media', composicion:'Composición', tipo:'Tipo',
    municipio:'Municipio', provincia:'Provincia', comunidad:'Comunidad', coordenadas:'Coordenadas',
    actualizado:'Actualizado', agua:'Agua', aire:'Aire', olas:'Olas', vientoLabel:'Viento',
    nowLabel:'Ahora',
    SERVICIOS:[
      { key:'socorrismo', label:'Socorrismo' }, { key:'duchas', label:'Duchas' },
      { key:'accesible',  label:'Accesible PMR' }, { key:'parking', label:'Parking' },
      { key:'bandera',    label:'Bandera Azul' }, { key:'perros', label:'Perros' },
      { key:'aseos',      label:'Aseos' }, { key:'lavapies', label:'Lavapiés' },
      { key:'papelera',   label:'Papeleras' }, { key:'limpieza', label:'Limpieza' },
      { key:'telefonos',  label:'Teléfonos' }, { key:'oficina_turismo', label:'Oficina turismo' },
      { key:'zona_infantil',  label:'Zona infantil' },
      { key:'zona_deportiva', label:'Zona deportiva' },
      { key:'alquiler_sombrillas', label:'Alq. sombrillas' },
      { key:'alquiler_hamacas',    label:'Alq. hamacas' },
      { key:'alquiler_nautico',    label:'Alq. náutico' },
      { key:'club_nautico',  label:'Club náutico' },
      { key:'establecimientos', label:'Bares/restaurantes' },
      { key:'autobus',    label:'Autobús' },
    ],
    caracteristicas:(n:string)=>`Características de ${n}`,
    caractsSrc:'MITECO',
    grado_ocupacion:'Ocupación', grado_urbano:'Tipo de entorno', condiciones:'Condiciones del mar',
    paseo_maritimo:'Paseo marítimo', vegetacion:'Vegetación', zona_fondeo:'Zona de fondeo',
    forma_acceso:'Forma de acceso', carretera:'Carretera',
    tipo_paseo:'Nombre del paseo', parking_tipo:'Tipo de aparcamiento', parking_plazas:'Plazas de aparcamiento',
    fachada_litoral:'Fachada litoral', espacio_protegido:'Espacio protegido',
    puerto_seccion:(n:string)=>`Puerto deportivo cerca de ${n}`,
    puerto_dist_label:'Distancia',
    emergencias:(n:string)=>`Emergencias en ${n}`,
    emergenciasSrc:'Hospital más cercano',
    hospital:'Hospital', hospital_direccion:'Dirección', hospital_telefono:'Teléfono', hospital_dist:'Distancia',
    llamar:'Llamar', webAyuntamiento:'Web del ayuntamiento', fichaMiteco:'Ficha oficial MITECO',
    verSitio:'Visitar web',
  },
  en: {
    galeria:(n:string)=>`Photos of ${n}`, galSrc:'Wikimedia · Flickr · Unsplash', verFotos:'View photos',
    oleaje:(n:string)=>`Waves at ${n} now`, oleajeSrc:'Open-Meteo Marine',
    luzSolar:'Sunlight', luzSrc:'Sunrise-Sunset API',
    mareas:(n:string)=>`Tides at ${n} today`, mareasSrc:'Lunar estimate',
    pleamar:'High tide', bajamar:'Low tide', coeficiente:'Coefficient',
    vivas:'Spring tides', muertas:'Neap tides', mediasLabel:'Average tides',
    amanecer:'Sunrise', horasLuz:'Daylight hours', atardecer:'Sunset',
    temperatura:(n:string)=>`Water and air temperature at ${n}`, tempSrc:'Open-Meteo',
    tempAire:'Air temperature', tempAgua:'Water temperature',
    sensacion:'Feels like', indiceUV:'UV index', humedad:'Humidity',
    viento:(n:string)=>`Wind at ${n} today`, velocidad:'Speed', racha:'Max gust', direccion:'Direction',
    seguridad:(n:string)=>`Flag and jellyfish at ${n}`, seguridadSrc:'Open-Meteo estimate',
    banderaLabel:'Beach flag', medusasLabel:'Jellyfish',
    calidad:(n:string)=>`Water quality at ${n}`, calidadSrc:'EEA · 2006/7/CE',
    muestras:'Compliant samples', temporada:'Season', clasificacion:'Classification',
    comer:(n:string)=>`Restaurants near ${n}`, comerSrcOSM:'OpenStreetMap · 800m', resenas:'reviews',
    chiringuitos:(n:string)=>`Beach bars at ${n}`, chiringuitosSrc:'Google Places',
    chiringuitosTodos:(p:string)=>`All beach bars in ${p} →`,
    dormir:(n:string)=>`Hotels near ${n}`, dormirSrc:'OpenStreetMap · 2km',
    servicios:(n:string)=>`Facilities at ${n}`, serviciosSrc:'MITECO',
    info:(n:string)=>`Information about ${n}`, infoSrc:'MITECO 2024',
    longitud:'Length', anchura:'Average width', composicion:'Composition', tipo:'Type',
    municipio:'Municipality', provincia:'Province', comunidad:'Region', coordenadas:'Coordinates',
    actualizado:'Updated', agua:'Water', aire:'Air', olas:'Waves', vientoLabel:'Wind',
    nowLabel:'Now',
    SERVICIOS:[
      { key:'socorrismo', label:'Lifeguard' }, { key:'duchas', label:'Showers' },
      { key:'accesible',  label:'Accessible' }, { key:'parking', label:'Parking' },
      { key:'bandera',    label:'Blue Flag' }, { key:'perros', label:'Dogs allowed' },
      { key:'aseos',      label:'Toilets' }, { key:'lavapies', label:'Foot washers' },
      { key:'papelera',   label:'Bins' }, { key:'limpieza', label:'Cleaning' },
      { key:'telefonos',  label:'Phones' }, { key:'oficina_turismo', label:'Tourist office' },
      { key:'zona_infantil',  label:'Kids area' },
      { key:'zona_deportiva', label:'Sports area' },
      { key:'alquiler_sombrillas', label:'Umbrella rental' },
      { key:'alquiler_hamacas',    label:'Sunbed rental' },
      { key:'alquiler_nautico',    label:'Nautical rental' },
      { key:'club_nautico',  label:'Yacht club' },
      { key:'establecimientos', label:'Bars/restaurants' },
      { key:'autobus',    label:'Bus service' },
    ],
    caracteristicas:(n:string)=>`Features of ${n}`,
    caractsSrc:'MITECO',
    grado_ocupacion:'Occupation', grado_urbano:'Environment', condiciones:'Sea conditions',
    paseo_maritimo:'Boardwalk', vegetacion:'Vegetation', zona_fondeo:'Anchorage area',
    forma_acceso:'Access type', carretera:'Road',
    tipo_paseo:'Boardwalk name', parking_tipo:'Parking type', parking_plazas:'Parking capacity',
    fachada_litoral:'Coastal facade', espacio_protegido:'Protected area',
    puerto_seccion:(n:string)=>`Marina near ${n}`,
    puerto_dist_label:'Distance',
    emergencias:(n:string)=>`Emergencies at ${n}`,
    emergenciasSrc:'Nearest hospital',
    hospital:'Hospital', hospital_direccion:'Address', hospital_telefono:'Phone', hospital_dist:'Distance',
    llamar:'Call', webAyuntamiento:'City Hall website', fichaMiteco:'Official MITECO record',
    verSitio:'Visit website',
  },
}

// Calidad del agua (clasificación EEA) mapeada a paleta semántica brand book.
// Dot, texto → mismo color brand. "Buena" EEA usa --muybueno (no azul, que
// por regla brand sólo aparece en contexto marino no-verdict).
const COLORES_CALIDAD: Record<string, [string, string]> = {
  'Excelente':  ['var(--excelente)', '#2a4a14'],  // --excelente
  'Buena':      ['var(--muybueno)', '#4a5a20'],  // --muybueno
  'Suficiente': ['var(--aceptable)', '#7a4008'],  // --aceptable
  'Deficiente': ['var(--noapto)', '#4a1810'],  // --noapto
}

// ── C5 · Orden de módulos de la ficha (por defecto) ─────────────────
// La columna principal se ordena en tres fases mentales:
//   1) DECISIÓN  — ¿puedo/quiero ir hoy y estará bien para bañarme?
//   2) PLAN      — cómo organizo la visita (llegar, comer, dormir, hacer)
//   3) PROFUNDIDAD — datos, evidencia y exploración para quien quiera más
// Reorder() ordena de forma determinista en servidor y cliente (mismo
// output → sin CLS/flash). Antes era un flag ?orden=v2; ahora es el orden
// por defecto. Para volver al orden de origen: git revert de este cambio.
const ORDER_V2: string[] = [
  // 1 · DECISIÓN
  'intro', 'trust', 'estado', 'webcam', 'seguridad', 'calidad', 'opiniones-dest', 'cta-ctx',
  // 2 · PLAN
  'asistente', 'como-llegar', 'trafico', 'actividades-gyg', 'mejor-hora', 'afiliados', 'comer', 'chiringuitos', 'dormir',
  'campings', 'ferries', 'surf', 'buceo', 'cta-barco', 'ad',
  // 3 · PROFUNDIDAD
  'meteo', 'datos', 'ad-profundidad', 'fotos', 'video', 'opiniones', 'votacion', 'asistente-generico', 'cuaderno-cta', 'cercanas',
  'texto-seo', 'hubs', 'faqs', 'crosslinks',
]

// Reordena sus hijos por element.key según `order`. Claves ausentes en
// `order` conservan su posición de origen (sort estable). order=[] → identidad.
function Reorder({ order, quitar, children }: { order: string[]; quitar?: ReadonlySet<string>; children: React.ReactNode }) {
  const arr = (Array.isArray(children) ? children : [children])
    .flat(Infinity)
    .filter(Boolean)
    // `quitar` no oculta: descarta. Un bloque con display:none sigue en el
    // DOM, sigue contando impresiones y sigue estando para quien lea el
    // HTML. Con bandera roja tiene que no existir.
    .filter(el => !quitar || !quitar.has(String((el as React.ReactElement).key ?? ''))) as React.ReactElement[]
  const idx = (k: React.Key | null) => {
    const i = k == null ? -1 : order.indexOf(String(k))
    return i === -1 ? 1e9 : i
  }
  const sorted = [...arr].sort((a, b) => idx(a.key) - idx(b.key))
  return <>{sorted}</>
}

export default function FichaBody({ playa, meteo, solData, oleajeHoras, calidad, restaurantes, fotos, hoteles, campings, centrosBuceo, escuelas, turbidez, forecastSurf, meteoForecast, dateModified, banderaPlaya, aemet, boya, certBandera = 'estimado', usoProhibido = false, vientoReportado, chiringuitos, medusas, mareasLunar, mareasOficiales, horaIdeal, playasCercanas, opinionesIniciales, necesidades, videoData, webcams, locale = 'es', municipioSlug, provinciaSlug, hoyISO }: Props) {
  const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  // Nombre para titulares: usa el alias castellano cuando exista
  // (Kontxa Hondartza \u2192 La Concha de San Sebasti\u00e1n, As Catedrais \u2192
  // Playa de las Catedrales) para que H2 sean consistentes con el H1
  // del hero (que usa el mismo nombre). Antes, el H1 era "La Concha"
  // pero los H2 seguian con "Kontxa hondartza" \u2014 schizofrenia visible.
  const nombreH = locale === 'es' ? nombreMostrado(playa.slug, playa.nombre) : playa.nombre
  // Bandera roja: no se monetiza un día peligroso. Lo que mete al usuario en
  // el agua no se renderiza; lo que es comercio legítimo baja por debajo del
  // texto largo y pierde la urgencia. El criterio vive en lib/bandera-roja.
  const rojo = hayBanderaRoja(banderaPlaya)
  const ordenSecciones = rojo ? ordenBanderaRoja(ORDER_V2) : ORDER_V2
  const i18n     = T[locale]
  // El nombre local del viento, si hoy lo tiene y sopla para merecerlo.
  const vientoNombrado = meteo.vientoDirDeg != null && meteo.viento != null
    ? nombrarViento(playa.lat, playa.lng, meteo.vientoDirDeg, meteo.viento, locale)
    : null
  const estado   = ESTADOS[meteo.estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
  const amazonProductos = getProductosParaPlaya(playa, meteo.estado)

  // Lo que responde a una medición de hoy va arriba; lo demás, al final.
  const necesidadesDeHoy    = (necesidades ?? []).filter(n => n.prioridad === 'critica' || n.prioridad === 'alta')
  const necesidadesGenerales = (necesidades ?? []).filter(n => n.prioridad === 'media'   || n.prioridad === 'baja')
  const tiposGuia       = getTiposParaPlaya(playa)
  const horasLuz = solData?.horas_luz ?? '–'

  const nivelCalidad          = calidad?.nivel ?? 'Excelente'
  const [dotColor, textColor] = COLORES_CALIDAD[nivelCalidad] ?? ['var(--ink-soft)', 'var(--ink-soft)']
  const pctCalidad            = calidad?.porcentaje ?? 99
  const temporadaCalidad      = calidad?.temporada ?? 2024

  // Hoteles + restaurantes: si el server no los pudo traer (Overpass lento
  // o Vercel timeout), reintentamos client-side contra /api/*. Así la ficha
  // renderiza rápido y los datos aparecen cuando están listos.
  // Client retry para los 5 fetches Overpass cuando el SSR cae a [] por
  // deadline (1.5s). Cada API tiene KV cache, así que el retry es ms
  // tras la primera petición. Esto permite TTFB sub-segundo en el shell
  // sin perder los datos: simplemente aparecen tras hidratación.

  const [clientRestaurantes, setClientRestaurantes] = useState<Restaurante[]>(restaurantes ?? [])
  const [clientHoteles, setClientHoteles]           = useState<HotelReal[]>(hoteles ?? [])
  const [clientCampings, setClientCampings]         = useState<Camping[]>(campings ?? [])
  const [clientBuceo, setClientBuceo]               = useState<CentroBuceo[]>(centrosBuceo ?? [])
  const [loadingCercanos, setLoadingCercanos]       = useState(false)

  useEffect(() => {
    const needsRest    = !restaurantes  || restaurantes.length  === 0
    const needsHot     = !hoteles       || hoteles.length       === 0
    const needsCamp    = !campings      || campings.length      === 0
    const needsBuc     = !centrosBuceo  || centrosBuceo.length  === 0
    if (!needsRest && !needsHot && !needsCamp && !needsBuc) return

    const ac = new AbortController()
    setLoadingCercanos(true)

    const act = playa.actividades ?? {}
    const gFlag = (p: string) =>
      (p === '/api/buceo'    && (act.buceo || act.snorkel)) ||
      (p === '/api/escuelas' && (act.surf || act.windsurf || act.kite)) ? '&g=1' : ''
    const url = (p: string) => `${p}?lat=${playa.lat}&lon=${playa.lng}${gFlag(p)}`
    const promises: Promise<any>[] = []

    if (needsRest) {
      promises.push(
        fetch(url('/api/restaurantes'), { signal: ac.signal })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d?.restaurantes && Array.isArray(d.restaurantes)) setClientRestaurantes(d.restaurantes)
          })
          .catch(() => { /* silencioso, ya teníamos fallback UI */ })
      )
    }
    if (needsHot) {
      promises.push(
        fetch(url('/api/hoteles'), { signal: ac.signal })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d?.hoteles && Array.isArray(d.hoteles)) setClientHoteles(d.hoteles)
          })
          .catch(() => { /* silencioso */ })
      )
    }
    if (needsCamp) {
      promises.push(
        fetch(url('/api/campings'), { signal: ac.signal })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d?.campings && Array.isArray(d.campings)) setClientCampings(d.campings)
          })
          .catch(() => { /* silencioso */ })
      )
    }
    if (needsBuc) {
      promises.push(
        fetch(url('/api/buceo'), { signal: ac.signal })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d?.centros && Array.isArray(d.centros)) setClientBuceo(d.centros)
          })
          .catch(() => { /* silencioso */ })
      )
    }
    Promise.all(promises).finally(() => {
      if (!ac.signal.aborted) setLoadingCercanos(false)
    })
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playa.slug])

  const restList = clientRestaurantes && clientRestaurantes.length > 0 ? clientRestaurantes : null

  // Intro breve factual visible above-the-fold. Resuelve el brand
  // issue #7: antes el primer <p> visible era boilerplate del footer
  // ("Estado del mar y guía de las 5.000+ playas españolas..."). Ahora
  // cada ficha tiene 1-2 frases concretas: tipo + dimensiones +
  // servicios + actividades.
  const introTxt = locale === 'es' ? introBrevePlaya(playa, nombreConPlaya(nombreH)) : null

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        <Reorder order={ordenSecciones} quitar={rojo ? BLOQUES_DUROS : undefined}>

        {/* ORDEN ABOVE-THE-FOLD (post critique PR #84):
              1. Intro breve (texto, anchor reading)
              2. EstadoHoy (sistema + chips fusionados)
              3. AsistentePlaya (qué necesitas hoy — diferencial #1)
              4. ...resto (galería, mareas, hoteles, ...)
            El thumbnail strip + BeachVideo bajan a posición posterior
            (los maneja page.tsx). */}

        {/* 1. INTRO BREVE */}
        {introTxt && (
          <p key="intro" style={{
            margin: '0 0 1.5rem',
            padding: 0,
            fontSize: 'var(--fs-md)',
            lineHeight: 1.65,
            color: 'var(--ink)',
            fontWeight: 400,
          }}>
            {introTxt}
          </p>
        )}

        {/* C3 · Sello de confianza junto al score (auditoría CRO) */}
        <div key="trust" style={{ margin: '0 0 1rem' }}>
          <TrustSeal locale={locale} />
        </div>

        {/* 2. ESTADO HOY — fusión sistema + chips engagement */}
        <EstadoHoy
          key="estado"
          slug={playa.slug}
          nombre={nombreH}
          reporte={generarReporteSistema({
            oleaje:        meteo.olas,
            viento:        meteo.viento,
            vientoRacha:   meteo.vientoRacha,
            agua:          meteo.agua,
            bandera:       banderaPlaya,
            medusasRiesgo: medusas?.nivel ?? null,
            cert:          certBandera,
          })}
          locale={locale}
        />

        {/* C1 · CTA contextual (sube el 1er punto comercial al 3er módulo) */}
        {flags.contextualCTA && (
          <ContextualCTA key="cta-ctx" playa={playa} meteo={meteo} locale={locale} />
        )}

        {/* 3. ASISTENTE — solo lo que dispara un dato de HOY.
            Antes salían aquí los cuatro o cinco productos juntos, y una
            auditoría midió que los tres primeros enlaces de Amazon
            aparecían al 26% de la ficha. De esos tres, solo el protector
            solar estaba justificado —«índice UV de 8 (extremo)»—; la
            toalla y la botella son de siempre, no de hoy.
            La prioridad ya existía en el dato (critica/alta/media/baja),
            solo que nadie la usaba para decidir la posición: critica y
            alta responden a una medición, media y baja no. Las segundas
            bajan al final, donde siguen estando pero sin ocupar el sitio
            de la decisión. */}
        {necesidadesDeHoy.length > 0 && (
          <AsistentePlaya
            key="asistente"
            necesidades={necesidadesDeHoy}
            nombre={nombreH}
            locale={locale}
          />
        )}

        {/* WEBCAM en directo (Windy) — el "¿cómo está ahora?" definitivo.
            Gated por WINDY_API_KEY: webcams=[] si no hay clave → no renderiza. */}
        {webcams && webcams.length > 0 && (
          <div key="webcam" id="s-webcam">
            <WebcamPlaya webcams={webcams} nombre={nombreH} locale={locale} />
          </div>
        )}

        {/* 4. SEGURIDAD: BANDERA + MEDUSAS — movido aquí (PR #86)
            La gente decide '¿me meto o no?' antes que datos meteo
            abstractos. Va junto al estado-hoy. */}
        {(banderaPlaya || medusas || aemet?.hoy || boya) && (
          <div key="seguridad" className={styles.card} id="s-seguridad">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{i18n.seguridad(nombreH)}</h2>
              {/* Insignia de fuente (propuesta 2026 §5.4): el hueco derecho
                  del cardHead ya es donde el sitio dice de dónde viene cada
                  bloque. El grado lo marca la capa que ganó la cascada. */}
              <CertBadge cert={certBandera} locale={locale}>
                {certBandera === 'oficial' ? (locale === 'en' ? 'LIFEGUARD' : 'SOCORRISMO')
                  : certBandera === 'reportado' ? (locale === 'en' ? 'BEACHGOERS 24H' : 'BAÑISTAS 24H')
                  : (locale === 'en' ? 'MODEL' : 'MODELO')}
              </CertBadge>
            </div>
            <div className={styles.cardBody}>
              {/* Prohibición PERMANENTE de baño (clasificación oficial del
                  catálogo, no bandera del día). Va lo primero y no depende
                  de que hoy haya parte: el mar puede estar en calma y el
                  baño seguir prohibido, que es justo la confusión que esta
                  ficha tiene que deshacer. */}
              {usoProhibido && (
                <div role="alert" style={{
                  display: 'flex', gap: '.7rem', alignItems: 'flex-start',
                  padding: '.75rem .85rem', marginBottom: '1rem',
                  borderLeft: '3px solid #c0272d', borderRadius: 2,
                  background: 'color-mix(in srgb, #c0272d 8%, transparent)',
                }}>
                  <Flag size={18} weight="fill" color="#c0272d" aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--fs-base)', color: 'var(--ink)' }}>
                      {locale === 'en' ? 'Swimming is prohibited here' : 'El baño está prohibido en esta playa'}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)', marginTop: '.15rem' }}>
                      {locale === 'en'
                        ? 'Permanent classification: "restricted use" in the official beach register. It does not depend on today’s conditions.'
                        : 'Clasificación permanente como «uso prohibido» en el catálogo oficial de playas. No depende de las condiciones de hoy.'}
                    </div>
                  </div>
                </div>
              )}
              {banderaPlaya && (
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom: medusas ? '1rem' : 0 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:banderaPlaya.hex, flexShrink:0 }} aria-hidden />
                  <div>
                    <div style={{ fontWeight:700, fontSize: 'var(--fs-base)', color:'var(--ink)' }}>{locale === 'en' ? banderaPlaya.labelEn : banderaPlaya.label}</div>
                    <div style={{ fontSize:'var(--fs-xs)', color:'var(--muted)', marginTop:'.1rem' }}>{locale === 'en' ? banderaPlaya.motivoEn : banderaPlaya.motivo}</div>
                  </div>
                </div>
              )}
              {medusas && (
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:medusas.hex, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }} aria-hidden><Medusa size={16} weight="bold" color="#fff"/></div>
                  <div>
                    <div style={{ fontWeight:700, fontSize: 'var(--fs-base)', color:'var(--ink)' }}>{locale === 'en' ? medusas.labelEn : medusas.label}</div>
                    <div style={{ fontSize:'var(--fs-xs)', color:'var(--muted)', marginTop:'.1rem' }}>{locale === 'en' ? medusas.detalleEn : medusas.detalle}</div>
                  </div>
                </div>
              )}
              {/* VIENTO REPORTADO — misma gramática que bandera y medusas:
                  es dato de bañistas, así que trazo punteado. */}
              {vientoReportado && (
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginTop:'1rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--cert-reportado)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }} aria-hidden>
                    <Wind size={16} weight="bold" color="#fff"/>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize: 'var(--fs-base)', color:'var(--ink)' }}>
                      {locale === 'en' ? 'Strong wind reported' : 'Viento fuerte reportado'}
                    </div>
                    <div style={{ fontSize:'var(--fs-xs)', color:'var(--muted)', marginTop:'.1rem' }}>
                      {locale === 'en' ? vientoReportado.detalleEn : vientoReportado.detalle}
                    </div>
                  </div>
                </div>
              )}

              {/* BOYA — el único dato MEDIDO por un sensor físico de toda
                  la ficha. La propuesta 2026 le da tira de métricas propia
                  con el trazo sólido de "medido" bajo cada cifra. */}
              {boya && boya.hm0 != null && (
                <div style={{ marginTop:'.9rem', paddingTop:'.75rem', borderTop:'1px dashed var(--line)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.5rem', marginBottom:'.6rem', flexWrap:'wrap' }}>
                    {/* El título dice DE DÓNDE es el dato, no solo cómo se
                        obtuvo. Decía «Medido por boya» y las cuatro cifras
                        iban con certeza `medido` —trazo continuo de 2 px, el
                        más alto de la gramática— junto al nombre de la
                        playa. Todo cierto y todo mal atribuido: la boya está
                        a 38 km de mediana y la mitad son de aguas
                        profundas.

                        La certeza se queda en `medido` porque el sensor
                        midió de verdad; lo que cambia es el SUJETO. El
                        trazo dice cuánto me fío del número, no de qué sitio
                        habla, y esa segunda pregunta hay que contestarla
                        con palabras. */}
                    <strong style={{ fontSize:'var(--fs-xs)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--muted)' }}>
                      {locale === 'en'
                        ? `Open sea, ${boya.distanciaKm} km out`
                        : `Mar abierto, a ${boya.distanciaKm} km`}
                    </strong>
                    <CertBadge cert="medido" locale={locale}>
                      {`${boya.nombre} · ${boya.distanciaKm} km`}
                    </CertBadge>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(84px, 1fr))', gap:'.75rem' }}>
                    {[
                      { l: locale === 'en' ? 'Waves out there' : 'Olas mar adentro', v: boya.hm0.toLocaleString(locale === 'en' ? 'en' : 'es', { maximumFractionDigits: 1 }), u: 'm' },
                      ...(boya.tAgua != null ? [{ l: locale === 'en' ? 'Water' : 'Agua', v: boya.tAgua.toLocaleString(locale === 'en' ? 'en' : 'es', { maximumFractionDigits: 1 }), u: '°C' }] : []),
                      ...(boya.tp != null ? [{ l: locale === 'en' ? 'Period' : 'Periodo', v: String(Math.round(boya.tp)), u: 's' }] : []),
                      ...(boya.hmax != null ? [{ l: locale === 'en' ? 'Max out there' : 'Máx. mar adentro', v: boya.hmax.toLocaleString(locale === 'en' ? 'en' : 'es', { maximumFractionDigits: 1 }), u: 'm' }] : []),
                    ].map(m => (
                      <div key={m.l}>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize: 'var(--fs-xs)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'.3rem' }}>{m.l}</div>
                        <Dato v={m.v} u={m.u} cert="medido" size={22}/>
                      </div>
                    ))}
                  </div>
                  {/* La advertencia que faltaba, y va junto a las cifras,
                      no en letra pequeña al final: entre la boya y la
                      orilla la ola asomera, refracta y rompe. Una playa
                      abrigada recibe una fracción de lo que hay fuera; un
                      cabo puede recibir más. No se puede inferir, así que
                      no se insinúa.

                      Agua y periodo NO llevan advertencia a propósito: la
                      temperatura es coherente en decenas de kilómetros y el
                      periodo se conserva al propagarse. Esos dos sí
                      describen esta playa. */}
                  <p style={{ fontSize:'var(--fs-xs)', color:'var(--muted)', lineHeight:1.5, margin:'.6rem 0 0' }}>
                    {locale === 'en'
                      ? <>The wave height is what the sea is doing <b>out there</b>{boya.aguasProfundas ? ', in deep water' : ''} — not at the shore. Waves shoal and refract on the way in, so a sheltered beach gets a fraction of it and a headland can get more. Water temperature and period do describe this beach.</>
                      : <>La altura de ola es la del mar <b>ahí fuera</b>{boya.aguasProfundas ? ', en aguas profundas' : ''}, no la de la orilla. Al acercarse, la ola asomera y refracta: una playa abrigada recibe una fracción y un cabo puede recibir más. La temperatura del agua y el periodo sí describen esta playa.</>}
                  </p>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 'var(--fs-xs)', color:'var(--muted)', marginTop:'.6rem' }}>
                    {boya.hora} · {boya.nombre} · Puertos del Estado
                  </div>
                </div>
              )}
              {aemet?.hoy && (aemet.hoy.oleaje || aemet.hoy.viento || aemet.hoy.tAgua != null) && (
                <div style={{ marginTop:'.9rem', paddingTop:'.75rem', borderTop:'1px dashed var(--line)', fontSize:'var(--fs-sm)', color:'var(--ink)', lineHeight:1.6 }}>
                  <strong style={{ fontSize:'var(--fs-xs)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--muted)' }}>
                    {locale === 'en' ? 'AEMET official forecast today' : 'Predicción oficial AEMET hoy'}
                  </strong>
                  <div>
                    {aemet.hoy.oleaje && <>{locale === 'en' ? 'Sea' : 'Oleaje'}: <strong>{aemet.hoy.oleaje}</strong></>}
                    {aemet.hoy.viento && <> · {locale === 'en' ? 'wind' : 'viento'}: <strong>{aemet.hoy.viento}</strong></>}
                    {aemet.hoy.tAgua != null && <> · {locale === 'en' ? 'water' : 'agua'}: <strong>{aemet.hoy.tAgua}°C</strong></>}
                    {aemet.hoy.uvMax != null && <> · UV <strong>{aemet.hoy.uvMax}</strong></>}
                  </div>
                </div>
              )}
              {medusas && (
                <div style={{ fontSize: 'var(--fs-xs)', color:'var(--muted)', marginTop:'.85rem', lineHeight:1.5 }}>
                  {medusas.fuente === 'socorrismo'
                    ? (locale === 'en'
                      ? 'Reported today by the official lifeguard service (Generalitat de Catalunya). '
                      : 'Reportado hoy por el servicio oficial de socorrismo (Generalitat de Catalunya). ')
                    : medusas.fuente === 'banistas'
                      ? (locale === 'en'
                        ? 'Reported by beachgoers at this beach (last 24 h) via the "report status" button. '
                        : 'Reportado por bañistas en la playa (últimas 24 h) desde el botón de reportar estado. ')
                      : (locale === 'en'
                        ? 'Estimate from a weather model (water temperature, wind and season), not real-time sightings. '
                        : 'Estimación por modelo meteorológico (temperatura del agua, viento y estación), no avistamientos en tiempo real. ')}
                  <Link href="/medusas" style={{ color:'var(--accent)', fontWeight:600 }}>
                    {locale === 'en' ? 'Jellyfish season in Spain →' : 'Temporada de medusas en España →'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. CALIDAD AGUA — movido aquí (PR #86). Junto a seguridad
            porque pertenece al mismo bucket "¿puedo bañarme?". */}
        <div key="calidad" className={styles.card} id="s-calidad">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.calidad(nombreH)}</h2>
            <span className={styles.cardSrc}>{i18n.calidadSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cqNivel}>
              <div className={styles.cqDot} style={{ background: dotColor }}/>
              <span className={styles.cqLabel} style={{ color: textColor }}>{nivelCalidad}</span>
            </div>
            <div className={styles.cqBar}>
              <div className={styles.cqBarIn} style={{ width:`${pctCalidad}%`, background:`linear-gradient(90deg,${textColor},${dotColor})` }}/>
            </div>
            <DataRow k={i18n.muestras}     v={`${pctCalidad}%`} />
            <DataRow k={i18n.temporada}    v={String(temporadaCalidad)} />
            <DataRow k={i18n.clasificacion} v={`${nivelCalidad} (Directiva 2006/7/CE)`} />
          </div>
        </div>

        {/* 6. OPINIONES DESTACADAS — 3 opiniones inline (PR #86)
            Prueba social inline en Fase 1 (decisión).
            La sección completa sigue abajo para quien quiera más detalles. */}
        {opinionesIniciales?.items && opinionesIniciales.items.length > 0 && (
          <OpinionesDestacadas
            key="opiniones-dest"
            opiniones={opinionesIniciales.items}
            locale={locale}
          />
        )}

        {/* SECCIÓN COMPLETA DE OPINIONES
            Versión full con form para nuevas opiniones, paginación, etc.
            Se mantiene al final de la página para quien quiera profundizar. */}
        <Opiniones
          key="opiniones"
          slug={playa.slug}
          nombre={playa.nombre}
          initial={opinionesIniciales ?? null}
          locale={locale}
        />

        {/* Pedir la valoración DESPUÉS de haber dado algo: antes vivía en
            el aside y en móvil (donde el aside cae al flujo) aparecía a
            dos scrolls del hero, con cinco estrellas vacías y un "sé el
            primero en valorarla" antes de que el usuario hubiera visto
            fotos ni opiniones. Aquí llega cuando ya ha leído a otros. */}
        <VotacionPlaya key="votacion" slug={playa.slug} locale={locale} />

        {/* Puerta de entrada al cuaderno. El hero pliega "Estuve aquí" en
            el menú "···" para dejar una sola acción primaria, pero la
            acción tiene que REAPARECER aquí: nadie descubre un producto
            que solo vive detrás de tres puntos. Y aquí, tras leer la
            ficha entera, es cuando pedirla tiene sentido. */}
        {/* Lo genérico —toalla, botella, palas—, al final. Sigue
            disponible, pero ya no compite con la respuesta a «¿voy o
            no?». La clave va registrada en ORDER_V2: Reorder ordena con
            indexOf, que devuelve -1 para lo desconocido, así que un
            bloque sin registrar acabaría EL PRIMERO de la ficha. */}
        {necesidadesGenerales.length > 0 && (
          <AsistentePlaya
            key="asistente-generico"
            necesidades={necesidadesGenerales}
            nombre={nombreH}
            locale={locale}
            variante="generico"
          />
        )}

        <CuadernoCTA
          key="cuaderno-cta"
          slug={playa.slug}
          nombre={playa.nombre}
          municipio={playa.municipio}
          provincia={playa.provincia}
          comunidad={playa.comunidad}
          locale={locale}
        />

        {/* BLOQUE UNIFICADO DE CTAs AFILIADOS (PR #86 - Consolidación)
            Reemplaza 7 CTAs dispersos: TheFork, Booking, Civitatis, RentalCars, Pitchup
            con un bloque tabbed que mantiene todos los servicios accesibles. */}
        <AffiliatesCTABlock
          key="afiliados"
          playa={playa}
          affiliates={{
            booking: BOOKING_AID || undefined,
            thefork: THEFORK_AFF || undefined,
            civitatis: CIVITATIS_AFF || undefined,
            rentalcars: RENTALCARS_AFF || undefined,
            pitchup: PITCHUP_AFF || undefined,
          }}
          locale={locale}
        />

        {/* AD entre fotos-oleaje ELIMINADO en PR #86 (revisión orden):
            con galería movida abajo y secciones de seguridad arriba,
            el ad rompía el flow. El otro AdSlot al final de hoteles
            sigue activo. */}

        {/* OLEAJE + METEO */}
        <div key="meteo" className={styles.card} id="s-meteo">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{locale === 'en' ? <>Waves & <em>wind by hour</em> at {nombreH}</> : <>Oleaje y <em>viento por horas</em> en {nombreH}</>}</h2>
            <span className={styles.cardSrc}>{i18n.oleajeSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <OleajeChart olas={meteo.olas ?? 0} oleajeHoras={oleajeHoras} nowLabel={i18n.nowLabel} />
          </div>

          <Collapsible maxHeight={0} labelMore={locale === 'en' ? 'Sun, tides, temperature, wind' : 'Sol, mareas, temperatura, viento'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            <h2 className={styles.cardTitle}>{i18n.luzSolar}</h2>
            <span className={styles.cardSrc}>{i18n.luzSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.solRow}>
              <div className={styles.sr}><span className={styles.srV}><SunHorizon size={14} weight="bold" color="var(--accent)" style={{verticalAlign:'middle',marginRight:4}}/>{solData?.amanecer ?? meteo.amanecer ?? '–'}</span><span className={styles.srL}>{i18n.amanecer}</span></div>
              <div className={styles.sr}><span className={styles.srV}>{horasLuz}</span><span className={styles.srL}>{i18n.horasLuz}</span></div>
              <div className={styles.sr}><span className={styles.srV}><SunHorizon size={14} weight="bold" color="var(--muted)" style={{verticalAlign:'middle',marginRight:4}}/>{solData?.atardecer ?? meteo.atardecer ?? '–'}</span><span className={styles.srL}>{i18n.atardecer}</span></div>
            </div>
          </div>

          {/* MAREAS */}
          {mareasLunar && mareasLunar.zona !== 'mediterraneo' && (
            <>
              <div className={styles.divider}/>
              <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
                <h2 className={styles.cardTitle}>{i18n.mareas(nombreH)}</h2>
                {/* La insignia dice la verdad de cada caso: OFICIAL si hay
                    Puertos del Estado, ESTIMADO si es la lunar. Antes decía
                    «Estimación lunar» en gris pequeño y pintaba las horas
                    con el mismo peso que un dato medido. */}
                <CertBadge cert={mareasOficiales ? 'oficial' : 'estimado'} locale={locale}>
                  {mareasOficiales
                    ? (locale === 'en' ? 'PUERTOS DEL ESTADO' : 'PUERTOS DEL ESTADO')
                    : (locale === 'en' ? 'LUNAR ESTIMATE' : 'ESTIMACIÓN LUNAR')}
                </CertBadge>
              </div>
              <div className={styles.cardBody}>
                <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'.75rem' }}>
                  {(mareasOficiales
                    ? mareasOficiales.extremos.filter(e => e.dia === hoyISO).slice(0, 4).map(e => ({ tipo: e.tipo, hora: e.hora, altura: e.altura }))
                    : mareasLunar.mareas
                  ).map((m, i) => (
                    <div key={i} style={{
                      flex:'1 1 auto', minWidth:'70px', textAlign:'center',
                      // Pleamar y bajamar no son bueno y malo: son dos
                      // estados del mismo ciclo. Los distingue el tono del
                      // mar frente al de la arena, no un semáforo prestado
                      // de Tailwind.
                      background: tinte(m.tipo === 'pleamar' ? 'var(--sea-surf)' : 'var(--aceptable)', 8),
                      border: `1px solid ${tinte(m.tipo === 'pleamar' ? 'var(--sea-surf)' : 'var(--aceptable)', 20)}`,
                      borderRadius:'4px', padding:'.55rem .5rem',
                    }}>
                      <div style={{ fontSize:'var(--fs-xs)', color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>
                        {m.tipo === 'pleamar' ? (locale === 'en' ? '▲ High' : '▲ Plea.') : (locale === 'en' ? '▼ Low' : '▼ Baja.')}
                      </div>
                      <div style={{ fontSize: 'var(--fs-md)', fontWeight:800, color:'var(--ink)', marginTop:'.15rem' }}>{m.hora}</div>
                      <div style={{ fontSize:'var(--fs-xs)', color:'var(--muted)' }}>{m.altura}m</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--fs-xs)', color:'var(--muted)', flexWrap:'wrap', gap:'.4rem' }}>
                  {/* El «coeficiente» de la lunar era una media de zona, no un
                      cálculo: se retira. Vivas/muertas sí se sostiene, porque
                      sale de la fase lunar, que es exacta. */}
                  <span style={{ color: mareasLunar.tipo === 'vivas' ? 'var(--mar-500)' : mareasLunar.tipo === 'muertas' ? 'var(--aceptable)' : 'var(--muted)', fontWeight:600 }}>
                    {mareasLunar.tipo === 'vivas' ? i18n.vivas : mareasLunar.tipo === 'muertas' ? i18n.muertas : i18n.mediasLabel}
                  </span>
                  {municipioSlug && mareasOficiales && (
                    <Link href={locale === 'en' ? `/municipio/${municipioSlug}/tabla-de-mareas` : `/municipio/${municipioSlug}/tabla-de-mareas`}
                      style={{ color:'var(--ink)', fontWeight:600 }}>
                      {locale === 'en' ? 'Tide table for the next 3 days →' : 'Tabla de mareas de hoy, mañana y pasado →'}
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}

          {mareasLunar && mareasLunar.zona === 'mediterraneo' && (
            <>
              <div className={styles.divider}/>
              <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
                <h2 className={styles.cardTitle}>{i18n.mareas(nombreH)}</h2>
                <span className={styles.cardSrc}>{i18n.mareasSrc}</span>
              </div>
              <div className={styles.cardBody}>
                <p style={{ fontSize:'var(--fs-sm)', color:'var(--muted)', lineHeight:1.5 }}>
                  {locale === 'en'
                    ? `The Mediterranean has negligible tidal range (${mareasLunar.rango}m). Water level remains practically constant throughout the day.`
                    : `El Mediterráneo tiene un rango mareal insignificante (${mareasLunar.rango}m). El nivel del agua se mantiene prácticamente constante durante el día.`}
                </p>
              </div>
            </>
          )}

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            <h2 className={styles.cardTitle}>{i18n.temperatura(nombreH)}</h2>
            <span className={styles.cardSrc}>{i18n.tempSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tempGrid}>
              <TempCell icon={<Thermometer size={18} weight="bold" color="var(--accent)"/>} val={meteo.tempAire != null ? `${meteo.tempAire}°C` : '—'}   label={i18n.tempAire}/>
              <TempCell icon={<Drop size={18} weight="bold" color="var(--accent)"/>} val={meteo.agua != null ? `${meteo.agua}°C` : '—'}       label={i18n.tempAgua}/>
              <TempCell icon={<Thermometer size={18} weight="light" color="var(--muted)"/>} val={meteo.sensacion != null ? `${meteo.sensacion}°C` : '—'}  label={i18n.sensacion}/>
              <TempCell icon={<Sun size={18} weight="bold" color="var(--accent)"/>} val={meteo.uv != null ? `UV ${meteo.uv}` : '—'}        label={i18n.indiceUV}/>
              <TempCell icon={<Gauge size={18} weight="bold" color="var(--accent)"/>} val={`${meteo.humedad}%`}     label={i18n.humedad}/>
            </div>
            {meteo.uv != null && meteo.uv >= 3 && (
              <Link href="/protectores-solares" style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                marginTop: '.65rem', padding: '.6rem .85rem',
                background: meteo.uv >= 8 ? 'color-mix(in srgb, var(--noapto) 6%, transparent)' : meteo.uv >= 6 ? 'color-mix(in srgb, var(--limitado) 6%, transparent)' : 'color-mix(in srgb, var(--aceptable) 6%, transparent)',
                border: `1px solid ${meteo.uv >= 8 ? 'color-mix(in srgb, var(--noapto) 20%, transparent)' : meteo.uv >= 6 ? 'color-mix(in srgb, var(--limitado) 20%, transparent)' : 'color-mix(in srgb, var(--aceptable) 20%, transparent)'}`,
                borderRadius: 4, textDecoration: 'none', color: 'var(--ink)',
                fontSize: 'var(--fs-sm)', lineHeight: 1.4,
              }}>
                <Sun size={16} weight="bold" color={meteo.uv >= 8 ? 'var(--noapto)' : meteo.uv >= 6 ? 'var(--limitado)' : 'var(--aceptable)'} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span>
                  <strong style={{ color: meteo.uv >= 8 ? 'var(--noapto)' : meteo.uv >= 6 ? 'var(--limitado)' : 'var(--aceptable)' }}>
                    {meteo.uv >= 8 ? (locale === 'en' ? 'Very high UV' : 'UV muy alto') : meteo.uv >= 6 ? (locale === 'en' ? 'High UV' : 'UV alto') : (locale === 'en' ? 'Moderate UV' : 'UV moderado')}
                    {'. '}
                    {meteo.uv >= 6 ? 'SPF 50+' : 'SPF 30+'}
                  </strong>
                  {' '}
                  <span style={{ color: 'var(--muted)', fontSize: 'var(--fs-sm)' }}>
                    {locale === 'en' ? 'See our sunscreen guide →' : 'Ver guía de protectores →'}
                  </span>
                </span>
              </Link>
            )}
          </div>

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            {/* El título dice el NOMBRE cuando lo hay: «Levante en Los
                Lances hoy» es como esa playa llama a lo que pasa hoy, y lo
                que su gente escribiría al buscarlo. */}
            <h2 className={styles.cardTitle}>
              {vientoNombrado?.destacado
                ? (locale === 'en'
                    ? <>{vientoNombrado.nombreEn} at {nombreH} <em>today</em></>
                    : <><span style={{ textTransform:'capitalize' }}>{vientoNombrado.nombre}</span> en <em>{nombreH}</em> hoy</>)
                : i18n.viento(nombreH)}
            </h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.vientoRow}>
              <CompassSVG dir={meteo.vientoDireccion}/>
              <table className={styles.vTable}>
                <tbody>
                  <tr><td className={styles.vtK}>{i18n.velocidad}</td><td className={styles.vtV}>{meteo.viento != null ? `${meteo.viento} km/h` : '—'}</td></tr>
                  <tr><td className={styles.vtK}>{i18n.racha}</td><td className={styles.vtV}>{meteo.vientoRacha} km/h</td></tr>
                  <tr><td className={styles.vtK}>{i18n.direccion}</td><td className={styles.vtV}>{meteo.vientoDireccion}</td></tr>
                </tbody>
              </table>
            </div>
            {/* Y qué significa. Es lo único de esta tarjeta que contesta la
                pregunta real —«¿voy o no voy?»—: la cifra la da cualquiera;
                saber que el levante levanta arena y mar de fondo, no. */}
            {vientoNombrado?.destacado && (
              <p style={{ margin:'.7rem 0 0', fontSize:'var(--fs-sm)', lineHeight:1.55, color:'var(--ink)' }}>
                <strong style={{ textTransform:'capitalize' }}>{locale === 'en' ? vientoNombrado.nombreEn : vientoNombrado.nombre}</strong>
                {': '}{locale === 'en' ? vientoNombrado.efectoEn : vientoNombrado.efecto}.
              </p>
            )}
          </div>
          </Collapsible>
        </div>

        {/* SEGURIDAD + CALIDAD movidos a posición 4-5 (junto al
            asistente). Ver inicio del return. PR #86 reorganización. */}

        {/* ACTIVIDADES */}
        {meteo.olas != null && meteo.viento != null && <SurfSection
          key="surf"
          playa={playa} olas={meteo.olas} viento={meteo.viento}
          vientoDir={meteo.vientoDireccion} agua={meteo.agua ?? 20}
          periodo={meteo.periodo} forecast={forecastSurf ?? undefined}
          turbidez={turbidez} meteo={meteoForecast} hoyISO={hoyISO}
        />}


        {/* CÓMO LLEGAR */}
        <div key="como-llegar" className={styles.card} id="s-comoLlegar">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><Car size={16} weight='bold' style={{marginRight:'.35rem',verticalAlign:'middle'}}/>{locale === 'en' ? <>How to <em>get to</em> {nombreH}</> : <>Cómo <em>llegar</em> a {nombreH}</>}</h2>
          </div>
          <div className={styles.cardBody}>
            <Collapsible maxHeight={160} labelMore={locale === 'en' ? 'Show all options' : 'Ver todas las opciones'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=driving`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--accent)', color:'var(--on-accent)', textDecoration:'none', fontWeight:600, fontSize:'var(--fs-base)' }}>
                <Car size={18} weight='bold'/> {locale === 'en' ? 'By car. open in Google Maps' : 'En coche. abrir en Google Maps'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=transit`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--card-bg2)', color:'var(--accent)', textDecoration:'none', fontWeight:600, fontSize:'var(--fs-base)', border:'1px solid var(--line)' }}>
                <Bus size={18} weight='bold'/> {locale === 'en' ? 'By public transport' : 'En transporte público'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=bicycling`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--card-bg2)', color:'var(--accent)', textDecoration:'none', fontWeight:600, fontSize:'var(--fs-base)', border:'1px solid var(--line)' }}>
                <Bicycle size={18} weight='bold'/> {locale === 'en' ? 'By bike' : 'En bicicleta'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--card-bg2)', color:'var(--accent)', textDecoration:'none', fontWeight:600, fontSize:'var(--fs-base)', border:'1px solid var(--line)' }}>
                <Person size={18} weight='bold'/> {locale === 'en' ? 'Walking' : 'A pie'}
              </a>
            </div>

            {/* Detalles oficiales de acceso (MITECO) */}
            {(playa.forma_acceso || playa.carretera || playa.autobus_tipo || playa.parking_tipo || playa.parking_plazas || playa.tipo_paseo || playa.puerto_deportivo) && (
              <div style={{ marginTop: '1rem', padding: '.85rem 1rem', background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid var(--line)', borderRadius: '4px' }}>
                {playa.forma_acceso    && <DataRow k={i18n.forma_acceso}   v={playa.forma_acceso}/>}
                {playa.carretera       && <DataRow k={i18n.carretera}      v={playa.carretera}/>}
                {playa.autobus_tipo    && <DataRow k={locale === 'en' ? 'Bus type' : 'Tipo de autobús'} v={playa.autobus_tipo}/>}
                {playa.parking_tipo    && <DataRow k={i18n.parking_tipo}   v={playa.parking_tipo}/>}
                {playa.parking_plazas  && <DataRow k={i18n.parking_plazas} v={playa.parking_plazas}/>}
                {playa.tipo_paseo      && <DataRow k={i18n.tipo_paseo}     v={playa.tipo_paseo}/>}
                {playa.puerto_deportivo && (
                  <DataRow
                    k={locale === 'en' ? 'Marina' : 'Puerto deportivo'}
                    v={`${playa.puerto_deportivo}${playa.puerto_dist ? ` (${playa.puerto_dist})` : ''}`}
                    href={playa.puerto_web || undefined}
                  />
                )}
              </div>
            )}

            <MapaLeaflet lat={playa.lat} lng={playa.lng} nombre={playa.nombre} zoom={15} height="300px" />
            </Collapsible>
          </div>
        </div>

        {/* TRÁFICO */}
        {/* El id vive en la raíz de TraficoSection, no aquí: este div
            existe solo para dar la `key` a Reorder. Llevaba también
            id="s-trafico" y eran DOS elementos con el mismo id —HTML
            inválido—, así que cualquier índice apuntaba al envoltorio
            vacío en vez de a la sección. */}
        <div key="trafico">
          <TraficoSection playa={playa} hoyISO={hoyISO} />
        </div>

        {/* QUÉ HACER ALLÍ — detrás de «cómo llegar» y parking.
            Estaba al final de la ficha, al 60% del documento y después
            incluso de las FAQ, mientras restaurantes y hoteles ocupaban
            el 31-33%. Quien ya sabe cómo llegar es justo quien se
            pregunta qué hacer al llegar; enterrarlo tras las preguntas
            frecuentes lo condenaba a no verse.
            El widget decide solo si hay oferta: donde no la hay, no
            pinta nada, así que subirlo no mete relleno en las calas
            sin excursiones. */}
        {/* La variante del banner de repuesto se decide AQUÍ, en servidor,
            porque elegirla en cliente haría que el primer render difiera
            del servidor. Criterio, siguiendo las audiencias del brief:
              · A4 «Surf y deportes» → si la playa es de agua, la promo de
                actividades es lo más parecido a lo que el widget ofrecía.
              · UV alto → el protector gana a cualquier excursión cuando
                hay un 9 sobre la cabeza.
              · resto → el cuaderno, que es la conversión principal. */}
        <GygActivities
          key="actividades-gyg"
          query={playa.actividades?.surf
            // `, Spain` SIEMPRE, también aquí: esta rama se había quedado
            // sin país. Sin él, GetYourGuide resuelve el topónimo donde
            // quiere —hay un San Felipe en Panamá, un Cádiz en Filipinas y
            // un Santiago en medio mundo— y esta rama cubre todas las playas
            // marcadas como de surf.
            ? `surf ${playa.municipio || playa.provincia}, Spain`
            : `${playa.municipio || playa.provincia}, Spain`}
          cmp="ficha_playa"
          id="actividades"
          municipioSlug={municipioSlug}
          variante={
            (playa.actividades?.surf || playa.actividades?.buceo
              || playa.actividades?.snorkel || playa.actividades?.windsurf
              || playa.actividades?.kite)
              ? 'actividades'
              : (meteo?.uv ?? 0) >= 8 ? 'piel' : 'cuaderno'
          }
        />

        {/* MASIFICACIÓN + MEJOR HORA — H2 con nombre (long-tail "mejor hora
            playa X"). El dato ya existía (horaIdeal) pero vivía en el aside
            como etiqueta sin heading rastreable. */}
        {horaIdeal && (
          <div key="mejor-hora" className={styles.card} id="s-mejor-hora">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{locale === 'en' ? <>Crowds & <em>best time</em> to visit {nombreH}</> : <>Masificación y <em>mejor hora</em> para ir a {nombreH}</>}</h2>
              <span className={styles.cardSrc}>{locale === 'en' ? 'UV · light · tides' : 'UV · luz · mareas'}</span>
            </div>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.9rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--ink)' }}>{horaIdeal.franja}</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>{locale === 'en' ? horaIdeal.razonEn : horaIdeal.razon}</span>
              </div>
              {playa.parking && (
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.55, margin: '.7rem 0 0' }}>
                  {locale === 'en'
                    ? `${nombreH} has nearby parking — in high season it fills up before midday, so aim for the early slot.`
                    : `${nombreH} tiene aparcamiento cercano — en temporada alta se llena antes del mediodía; apunta a la franja temprana para no dar vueltas.`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* RESTAURANTES */}
        <div key="comer" className={styles.card} id="s-comer">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.comer(nombreH)}</h2>
            <span className={styles.cardSrc}>
              {restList ? (restList[0]?.source === 'google' ? 'Google Places' : i18n.comerSrcOSM) : ''}
            </span>
          </div>
          <div className={styles.cardBody}>
            {restList ? (
              <Collapsible maxHeight={200} labelMore={locale === 'en' ? 'Show all' : 'Ver todos'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
                <ListaPOI
                  variante="photo"
                  locale={locale}
                  iconoFallback={<ForkKnife size={18} weight="bold" />}
                  items={restList.slice(0, 6).map((r: any) => ({
                    id: String(r.id ?? r.nombre),
                    nombre: r.nombre,
                    meta: [r.tipo, r.precio, r.horario].filter(Boolean).join(' · '),
                    distancia: `${r.distancia_m} m`,
                    rating: r.rating,
                    reseñas: r.reseñas,
                    foto: r.foto,
                    href: r.googleId
                      ? `https://www.google.com/maps/place/?q=place_id:${r.googleId}`
                      : `https://www.google.com/maps/search/${encodeURIComponent(r.nombre)}`,
                    externo: true,
                  }))}
                />
              </Collapsible>
            ) : loadingCercanos ? (
              <div role="status" aria-live="polite" style={{ padding:'1rem 0', textAlign:'center' }}>
                <p style={{ fontSize:'var(--fs-sm)', color:'var(--muted)' }}>
                  {locale === 'en' ? 'Loading nearby restaurants…' : 'Buscando restaurantes cercanos…'}
                </p>
              </div>
            ) : (
              <div style={{ padding:'1rem 0', textAlign:'center' }}>
                <p style={{ fontSize:'var(--fs-sm)', color:'var(--muted)', marginBottom:'.75rem' }}>
                  {locale === 'en' ? 'No restaurants found nearby' : 'No se encontraron restaurantes cercanos'}
                </p>
                <a href={`https://www.google.com/maps/search/restaurantes/@${playa.lat},${playa.lng},15z`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'var(--fs-sm)', color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
                  {locale === 'en' ? 'Search on Google Maps →' : 'Buscar en Google Maps →'}
                </a>
              </div>
            )}
          </div>
        </div>
        {/* CHIRINGUITOS — sidecar Google Places (cosecha jul-2026), solo
            si hay alguno a ≤1 km. Rating y reseñas reales, cosa que el
            bloque OSM de arriba no tiene. */}
        {chiringuitos && chiringuitos.length > 0 && (
          <div key="chiringuitos" className={styles.card} id="s-chiringuitos">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{i18n.chiringuitos(nombreH)}</h2>
              <span className={styles.cardSrc}>{i18n.chiringuitosSrc}</span>
            </div>
            <div className={styles.cardBody}>
              {/* variante rating: aquí la nota ES el criterio y la foto no
                  aporta nada — un chiringuito se elige por reseñas. */}
              <ListaPOI
                variante="rating"
                locale={locale}
                items={chiringuitos.map(c => ({
                  id: c.googleId,
                  nombre: c.nombre,
                  // miles() y no toLocaleString: el ICU de Node no pone
                  // el separador y el del navegador sí, y un restaurante
                  // con 1.200 reseñas bastaba para romper la hidratación.
                  meta: c.reseñas > 0
                    ? `${miles(c.reseñas)} ${i18n.resenas}`
                    : undefined,
                  distancia: `${c.distancia_m} m`,
                  rating: c.rating,
                  href: `https://www.google.com/maps/place/?q=place_id:${c.googleId}`,
                  externo: true,
                }))}
              />
              <div style={{ marginTop:'.75rem' }}>
                <Link href={`/chiringuitos/${chiringuitos[0].provSlug}`} style={{ fontSize:'var(--fs-sm)', color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
                  {i18n.chiringuitosTodos(chiringuitos[0].provincia)}
                </Link>
              </div>
            </div>
          </div>
        )}
        <div key="dormir" className={styles.card} id="s-dormir">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.dormir(nombreH)}</h2>
            <span className={styles.cardSrc}>{clientHoteles && clientHoteles.length > 0 ? (clientHoteles[0]?.source === 'google' ? 'Google Places' : i18n.dormirSrc) : ''}</span>
          </div>
          <div className={styles.cardBody}>
            {clientHoteles && clientHoteles.length > 0 ? (
              <Collapsible maxHeight={200} labelMore={locale === 'en' ? 'Show all' : 'Ver todos'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
                <ListaPOI
                  variante="photo"
                  locale={locale}
                  iconoFallback={<Bed size={18} weight="bold" />}
                  items={clientHoteles.map((h: any) => ({
                    id: String(h.id ?? h.nombre),
                    nombre: h.nombre,
                    // Las estrellas solo si OSM/Places las conocen: dato
                    // estructural ausente se OMITE, no se pinta "—".
                    meta: [
                      h.estrellas > 0 ? '★'.repeat(Math.min(h.estrellas, 5)) : null,
                      h.precio,
                    ].filter(Boolean).join(' · ') || undefined,
                    distancia: h.distancia_m >= 1000 ? `${(h.distancia_m / 1000).toFixed(1)} km` : `${h.distancia_m} m`,
                    rating: h.rating,
                    reseñas: h.reseñas,
                    foto: h.foto,
                    href: h.googleId
                      ? `https://www.google.com/maps/place/?q=place_id:${h.googleId}`
                      : `https://www.google.com/maps/search/${encodeURIComponent(h.nombre)}`,
                    externo: true,
                  }))}
                />
              </Collapsible>
            ) : loadingCercanos ? (
              <div role="status" aria-live="polite" style={{ padding:'1rem 0', textAlign:'center' }}>
                <p style={{ fontSize:'var(--fs-sm)', color:'var(--muted)' }}>
                  {locale === 'en' ? 'Loading nearby hotels…' : 'Buscando hoteles cercanos…'}
                </p>
              </div>
            ) : (
              <div style={{ padding:'1rem 0', textAlign:'center' }}>
                <p style={{ fontSize:'var(--fs-sm)', color:'var(--muted)', marginBottom:'.75rem' }}>
                  {locale === 'en' ? 'No hotels found nearby' : 'No se encontraron hoteles cercanos'}
                </p>
                <a href={`https://www.google.com/maps/search/hoteles/@${playa.lat},${playa.lng},14z`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'var(--fs-sm)', color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
                  {locale === 'en' ? 'Search on Google Maps →' : 'Buscar en Google Maps →'}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* FERRY CTA. solo se muestra en Baleares y Canarias */}
        <FerriesCTA key="ferries" playa={playa} locale={locale} />

        {/* CAMPINGS Y AUTOCARAVANAS */}
        {clientCampings && clientCampings.length > 0 && (
          <div key="campings" className={styles.card} id="s-campings">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                <Car size={16} weight="bold" style={{marginRight:'.35rem',verticalAlign:'middle',color:'var(--accent)'}}/>
                {locale === 'en' ? <>Campsites <em>nearby</em></> : <><em>Campings</em> y autocaravanas</>}
              </h2>
              <span className={styles.cardSrc}>OpenStreetMap</span>
            </div>
            <div className={styles.cardBody}>
              {/* variante icon: un camping es una decisión funcional —
                  el icono identifica la categoría y la foto no aporta. */}
              <ListaPOI
                variante="icon"
                locale={locale}
                items={clientCampings.map(c => ({
                  id: String(c.id),
                  nombre: c.nombre,
                  meta: [
                    c.tipo,
                    c.categoria > 0 ? '★'.repeat(Math.min(c.categoria, 5)) : null,
                    c.autocaravanas ? (locale === 'en' ? 'Motorhomes' : 'Autocaravanas') : null,
                    c.tiendas ? (locale === 'en' ? 'Tents' : 'Tiendas') : null,
                    c.perros ? (locale === 'en' ? 'Dog-friendly' : 'Admite perros') : null,
                  ].filter(Boolean).join(' · '),
                  distancia: c.distancia_m >= 1000 ? `${(c.distancia_m / 1000).toFixed(1)} km` : `${c.distancia_m} m`,
                  icono: <Car size={18} weight="bold" />,
                  href: `https://www.google.com/maps/search/${encodeURIComponent(c.nombre)}/@${c.lat},${c.lon},15z`,
                  externo: true,
                }))}
              />
            </div>
          </div>
        )}

        {/* CENTROS DE BUCEO */}
        {clientBuceo && clientBuceo.length > 0 && (
          <div key="buceo" className={styles.card} id="s-buceo">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                <Fish size={16} weight="bold" style={{marginRight:'.35rem',verticalAlign:'middle',color:'#0891b2'}}/>
                {locale === 'en' ? <>Dive <em>centers</em></> : <>Centros de <em>buceo</em></>}
              </h2>
              <span className={styles.cardSrc}>OpenStreetMap</span>
            </div>
            <div className={styles.cardBody}>
              {/* variante plain: aquí solo hay nombre, tipo y distancia —
                  sin nota de terceros ni foto que aporte. */}
              <ListaPOI
                variante="plain"
                locale={locale}
                items={clientBuceo.map(c => ({
                  id: String(c.id),
                  nombre: c.nombre,
                  meta: [c.tipo, c.certificacion, ...c.servicios.slice(0, 2)]
                    .filter(Boolean).join(' · '),
                  distancia: c.distancia_m >= 1000 ? `${(c.distancia_m / 1000).toFixed(1)} km` : `${c.distancia_m} m`,
                  href: `https://www.google.com/maps/search/${encodeURIComponent(c.nombre)}/@${c.lat},${c.lon},15z`,
                  externo: true,
                }))}
              />
            </div>
          </div>
        )}

        {/* AD. entre hoteles y servicios */}
        {/* Último puesto de la fase PLAN: el lector ya tiene su respuesta
            —«¿puedo bañarme hoy?»— y ya ha organizado la visita. Antes de
            aquí el anuncio no molestaría: competiría con lo único que hace
            que la página merezca confianza. */}
        <Hueco key="ad" zona="profundidad" bloque={SLOTS.fichaPlan} locale={locale} />

        {/* DATOS DE LA PLAYA (PR #86 - Consolidación de Servicios + Info)
            Unifica servicios & equipamiento con información técnica.
            Antes estaban dispersos en 2 secciones, ahora en 1 para mejor
            escaneo visual y menor fragmentación de contenido. */}
        {/* Ya en PROFUNDIDAD: quien sigue aquí está explorando, no
            decidiendo. Va detrás de «datos», que es el bloque más árido y
            el que marca que la respuesta quedó atrás. */}
        <Hueco key="ad-profundidad" zona="cierre" bloque={SLOTS.fichaFondo} locale={locale} />

        <div key="datos" className={styles.card} id="s-datos">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{locale === 'en' ? <>About <em>{nombreH}</em></> : <>Características de <em>{nombreH}</em></>}</h2>
          </div>
          <div className={styles.cardBody}>
            {/* Subsección: Servicios & Equipamiento */}
            <div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: '.75rem' }}>
                {locale === 'en' ? 'Facilities & Services' : 'Servicios y Equipamiento'}
              </div>
              <div className={styles.srvGrid}>
                {i18n.SERVICIOS.map(s => {
                  const on = !!(playa as any)[s.key]
                  return <span key={s.key} className={`${styles.srv} ${on ? styles.srvSi : styles.srvNo}`}>{on ? 'Sí' : 'No'} · {s.label}</span>
                })}
              </div>
            </div>

            <div style={{ height: '1rem' }}/>

            {/* Subsección: Información Técnica (Collapsible) */}
            <Collapsible maxHeight={180} labelMore={locale === 'en' ? 'Show all details' : 'Ver todos los datos'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: '.75rem' }}>
                {locale === 'en' ? 'Technical Details' : 'Información Técnica'}
              </div>
              {playa.longitud    && <DataRow k={i18n.longitud}     v={`${playa.longitud} m`} cert="oficial"/>}
              {playa.anchura     && <DataRow k={i18n.anchura}      v={`${playa.anchura} m`} cert="oficial"/>}
              {playa.composicion && <DataRow k={i18n.composicion}  v={playa.composicion} cert="oficial"/>}
              {playa.tipo        && <DataRow k={i18n.tipo}         v={playa.tipo} cert="oficial"/>}
              {playa.grado_ocupacion && <DataRow k={i18n.grado_ocupacion} v={playa.grado_ocupacion} cert="oficial"/>}
              {playa.grado_urbano    && <DataRow k={i18n.grado_urbano}    v={playa.grado_urbano} cert="oficial"/>}
              {playa.fachada_litoral && <DataRow k={i18n.fachada_litoral} v={playa.fachada_litoral} cert="oficial"/>}
              {playa.condiciones     && <DataRow k={i18n.condiciones}     v={playa.condiciones} cert="oficial"/>}
              {playa.vegetacion      && <DataRow k={i18n.vegetacion}      v={locale === 'en' ? 'Yes' : 'Sí'} cert="oficial"/>}
              {playa.zona_fondeo     && <DataRow k={i18n.zona_fondeo}     v={locale === 'en' ? 'Yes' : 'Sí'} cert="oficial"/>}
              {playa.espacio_protegido && <DataRow k={i18n.espacio_protegido} v={locale === 'en' ? 'Yes' : 'Sí'} cert="oficial"/>}
              <DataRow
                k={i18n.municipio}
                v={playa.municipio}
                href={municipioSlug
                  ? (locale === 'en' ? `/en/towns/${municipioSlug}` : `/municipio/${municipioSlug}`)
                  : undefined}
              />
              <DataRow
                k={i18n.provincia}
                v={playa.provincia}
                href={provinciaSlug
                  ? (locale === 'en' ? `/en/provinces/${provinciaSlug}` : `/provincia/${provinciaSlug}`)
                  : undefined}
              />
              <DataRow
                k={i18n.comunidad}
                v={playa.comunidad}
                href={locale === 'en' ? `/en/communities/${slug(playa.comunidad)}` : `/comunidad/${slug(playa.comunidad)}`}
              />
              {/* El hemisferio se deduce del signo, no se da por hecho.
                  Estaba escrito «N, E» fijo, así que toda la costa
                  atlántica y Canarias mostraban «-13.839299° E» — una
                  longitud negativa es Oeste, y el signo y la letra se
                  contradecían en la misma línea. Se muestra el valor
                  absoluto con la letra que le toca, que es como se
                  escriben las coordenadas fuera de una hoja de cálculo. */}
              <DataRow k={i18n.coordenadas} v={coordenadasTxt(playa.lat, playa.lng, locale)} mono/>
              {playa.web_ayuntamiento && (
                <DataRow k={i18n.webAyuntamiento} v={i18n.verSitio} href={playa.web_ayuntamiento}/>
              )}
              {playa.url_miteco && (
                <DataRow k={i18n.fichaMiteco} v={i18n.verSitio} href={playa.url_miteco}/>
              )}
              {/* Emergencias embebidas */}
              {playa.hospital && (
                <>
                  <div style={{ height: '.5rem' }}/>
                  <DataRow k={i18n.hospital} v={playa.hospital}/>
                  {playa.hospital_dist && <DataRow k={i18n.hospital_dist} v={playa.hospital_dist}/>}
                  {playa.hospital_tel && (
                    <div style={{ marginTop:'.65rem', display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                      <a href={`tel:${playa.hospital_tel}`} style={{
                        display:'inline-flex', alignItems:'center',
                        background:'var(--noapto)', color:'#fff',
                        padding:'.4rem .85rem', borderRadius:'8px',
                        textDecoration:'none', fontSize:'var(--fs-xs)', fontWeight:700,
                      }}>
                        {i18n.llamar} {playa.hospital_tel}
                      </a>
                      <a href="tel:112" style={{
                        display:'inline-flex', alignItems:'center',
                        background:'color-mix(in srgb, var(--noapto) 10%, transparent)', color:'var(--noapto)',
                        border:'1px solid rgba(239,68,68,.3)',
                        padding:'.4rem .85rem', borderRadius:'8px',
                        textDecoration:'none', fontSize:'var(--fs-xs)', fontWeight:700,
                      }}>
                        112
                      </a>
                    </div>
                  )}
                </>
              )}
            </Collapsible>
          </div>
        </div>

        {/* OPINIONES movido a posición 6 (junto al asistente). PR #86. */}

        {/* GALERÍA FOTOS — movida aquí (PR #86) desde la posición 5
            (top). Antes robaba la atención antes de los datos críticos
            (seguridad, decisión de baño). Ahora va como confirmación
            visual tras todo el contenido de planning. */}
        <div key="fotos" className={styles.card} id="s-fotos">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.galeria(nombreH)}</h2>
            <span className={styles.cardSrc}>{i18n.galSrc}</span>
          </div>
          <PhotoCarousel
            fotos={fotos ?? []}
            nombreAlt={playa.nombre}
            locale={locale}
          />
        </div>

        {/* VÍDEO toggle — movido aquí (PR #86). Click-to-load: no
            carga el iframe hasta que el user pulsa. Wins LCP/INP. */}
        {videoData && (
          <BeachVideoToggle key="video" video={videoData} nombre={nombreH} locale={locale} />
        )}

        {/* PLAYAS CERCANAS */}
        {playasCercanas && playasCercanas.length > 0 && (
          <div key="cercanas" className={styles.card} id="s-cercanas">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{locale === 'en' ? <>Beaches <em>near</em> {nombreH}</> : <>Playas <em>cercanas</em> a {nombreH}</>}</h2>
            </div>
            <div className={styles.carousel}>
              {playasCercanas.map(pc => (
                <Link key={pc.slug} href={`${locale === 'en' ? '/en/beaches' : '/playas'}/${pc.slug}`} className={styles.cercanaCard} prefetch={true}>
                  {/* Foto solo si es la de ESA playa (el sidecar ya excluye
                      las genéricas). Sin foto, la tarjeta queda como estaba:
                      un hueco gris diría «cargando» y un icono de relleno
                      diría «foto no disponible», y ninguna de las dos cosas
                      es verdad — simplemente esta playa no tiene foto.
                      alt="" porque el nombre va escrito justo debajo: con
                      alt repetido, un lector de pantalla lo dice dos veces. */}
                  {pc.foto && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className={styles.cercanaFoto}
                      src={pc.foto}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className={styles.cercanaNombre}>{pc.nombre}</div>
                  <div className={styles.cercanaMeta}>{pc.municipio} · {pc.distKm < 10 ? pc.distKm.toFixed(1) : Math.round(pc.distKm)} km</div>
                  {pc.bandera && <span className={styles.cercanaBadge}><Flag size={12} weight="fill" color="var(--accent)"/></span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <TextoSEO key="texto-seo" playa={playa} locale={locale} />

        {/* CTA alquiler de barco — solo para costas relevantes */}
        {locale === 'es' && debeMostrarCTABarco(playa) && (
          <AlquilerBarcoCTA key="cta-barco" variant="card" region={playa.comunidad} />
        )}

        {/* Hubs temáticos relevantes (cross-linking semántico) */}
        <HubsRelacionados key="hubs" playa={playa} locale={locale} />

        {/* FAQS */}
        <FaqSection key="faqs" playa={playa} meteo={meteo} banderaPlaya={banderaPlaya} medusas={medusas} mareasLunar={mareasLunar} locale={locale} />

        {/* Cross-links: ruta + top de esta costa */}
        <CrossLinks key="crosslinks" playa={playa} locale={locale} />

        </Reorder>
      </div>

      {/* ASIDE */}
      <aside className={styles.aside}>

        {/* Ficha técnica — only physical specs, no badges (shown in hero) */}
        {(playa.longitud || playa.composicion || playa.tipo || calidad) && (
          <div className={styles.asideBox}>
            <div className={styles.abHead}>
              {locale === 'en' ? 'Beach facts' : 'Ficha técnica'}
            </div>
            <div className={styles.abBody}>
              {[
                playa.longitud    ? [locale === 'en' ? 'Length' : 'Longitud',        `${playa.longitud} m`] : null,
                playa.anchura     ? [locale === 'en' ? 'Width' : 'Anchura',          `${playa.anchura} m`] : null,
                playa.composicion ? [locale === 'en' ? 'Sand' : 'Arena',             playa.composicion] : null,
                playa.tipo        ? [locale === 'en' ? 'Type' : 'Tipo',              playa.tipo] : null,
                calidad           ? [locale === 'en' ? 'Water quality' : 'Calidad',  calidad.nivel] : null,
                playa.grado_ocupacion ? [locale === 'en' ? 'Crowding' : 'Ocupación', playa.grado_ocupacion] : null,
              ].filter(Boolean).map(row => {
                const [k, v] = row as [string, string]
                return (
                  <div key={k} className={styles.ftRow}>
                    <span className={styles.ftK}>{k}</span>
                    <span className={styles.ftV}>{v}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Estado card — IluEstado + frase + timestamp (unique location) */}
        <div className={styles.asideCard}>
          <div className={styles.aeIlu}><IluEstado estado={meteo.estado} size="sm" animated/></div>
          <div className={styles.aeEstado} style={{ color: estado.dot }}>{locale === 'en' ? estado.labelEn : estado.label}</div>
          <div className={styles.aeFrase}><em>{locale === 'en' ? estado.fraseEn : estado.frase}</em></div>
          <div className={styles.aePill}><span className={styles.aeDot} style={{ background: estado.dot }}/>{i18n.actualizado} · <time dateTime={dateModified}>{formatTime(dateModified, locale, zonaHoraria(playa.lat, playa.lng))}</time></div>
        </div>
        {/* soloDesktop: en móvil el aside cae al flujo principal y este
            resumen repetía el mismo 11:00-14:00 que la sección
            "Masificación y mejor hora" un par de scrolls más abajo —
            además con otra gramática de cabecera (antetítulo en
            versalitas vs H2 serif). En desktop vive en la columna
            sticky, donde sí aporta. */}
        {horaIdeal && (
          <div className={styles.soloDesktop} style={{
            background: `linear-gradient(160deg, ${tinte('var(--aceptable)', 8)}, color-mix(in srgb, var(--accent) 6%, transparent))`,
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            borderRadius: 6, padding: '.85rem 1rem',
          }}>
            <div style={{ fontSize:'var(--fs-xs)', fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              {locale === 'en' ? 'Best time to go' : 'Mejor hora para ir'}
            </div>
            <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--ink)', margin: '.3rem 0 .2rem', fontFamily: 'var(--font-serif)' }}>
              {horaIdeal.franja}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)', lineHeight: 1.4 }}>
              {locale === 'en' ? horaIdeal.razonEn : horaIdeal.razon}
            </div>
          </div>
        )}
        <div className={styles.soloDesktop}>
          <FichaAsideActions nombre={playa.nombre} lat={playa.lat} lng={playa.lng} slug={playa.slug} meteo={meteo.agua != null && meteo.olas != null && meteo.viento != null ? { agua: meteo.agua, olas: meteo.olas, viento: meteo.viento } : undefined} />
        </div>
        {/* La votación se movió al flujo principal, tras las opiniones:
            aquí, con el aside cayendo al flujo en móvil, pedía valorar
            antes de haber dado nada. */}
        {/* Mini-CTA "¿Qué llevar?" — sustituye al bloque Amazon de 6 productos
            siempre visible. Abre un drawer con la lista contextual. */}
        <AsideAfiliacionCTA
          nombre={playa.nombre}
          count={amazonProductos.length}
          locale={locale}
        />
      </aside>

      {/* Drawers globales (fixed) — escuchan custom events */}
      <ReportarDrawer slug={playa.slug} locale={locale} />
      {amazonProductos.length > 0 && (
        <AfiliacionDrawer
          nombre={playa.nombre}
          productos={[...amazonProductos]}
          slug={playa.slug}
          tiposGuia={tiposGuia}
          locale={locale}
        />
      )}
    </div>
  )
}

function FaqSection({ playa, meteo, banderaPlaya, medusas, mareasLunar, locale = 'es' }: {
  playa: Playa; meteo: Meteo; banderaPlaya?: BanderaPlaya; medusas?: MedusasRiesgo; mareasLunar?: MareasDia; locale?: 'es' | 'en'
}) {
  const es = locale === 'es'
  // Fuente única de verdad para las preguntas frecuentes: compartida
  // con SchemaPlaya JSON-LD para garantizar que el schema refleja
  // EXACTAMENTE lo que se muestra al usuario.
  const faqs = generarFaqsPlaya({
    playa,
    aguaC: meteo.agua,
    olasM: meteo.olas,
    vientoKmh: meteo.viento,
    vientoRacha: meteo.vientoRacha,
    vientoDir: meteo.vientoDireccion,
    banderaPlaya,
    medusas,
    mareasLunar,
    locale,
  })

  if (faqs.length === 0) return null

  return (
    <div className={styles.card} id="s-faqs">
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{es ? `Preguntas frecuentes sobre ${playa.nombre}` : `Frequently asked questions about ${playa.nombre}`}</h2>
      </div>
      <div className={styles.cardBody}>
        {faqs.map((faq, i) => (
          <details key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--line)' : 'none', padding: '.65rem 0' }}>
            <summary style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q}
              <span style={{ color: 'var(--muted)', fontSize: 'var(--fs-sm)', flexShrink: 0, marginLeft: '.5rem' }}>+</span>
            </summary>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5, marginTop: '.4rem' }}>{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

/**
 * Fecha y hora corta, sin depender de ICU.
 *
 * `toLocaleString(…, { month: 'short' })` sale distinto según los datos
 * ICU con los que se haya compilado cada entorno. Medido en el Node de
 * este proyecto: «15 sept,» — el navegador escribe otra cosa. Como este
 * componente se renderiza en las dos partes, esa diferencia rompe la
 * hidratación de la ficha entera.
 *
 * No es la primera vez que ICU muerde aquí: `TOTAL_PLAYAS_TXT` en
 * lib/playas ya formatea los miles a mano porque
 * `(4491).toLocaleString('es-ES')` devolvía «4491» pelado en este mismo
 * Node. La regla del sitio es no depender de un formato que cambia
 * según dónde se ejecute.
 *
 * La hora sí se pide a Intl, pero solo `hour`/`minute` con zona fijada:
 * ahí no hay nombres que traducir, solo dígitos.
 */
/**
 * Coordenadas con el hemisferio que les corresponde.
 *
 * En español el punto cardinal de longitud oeste es «O»; en inglés,
 * «W». Usar «W» en la versión española es un anglicismo silencioso que
 * se cuela en fichas de datos por copiar el formato inglés.
 */
function coordenadasTxt(lat: number, lng: number, locale: string): string {
  const es = locale !== 'en'
  const ns = lat >= 0 ? 'N' : 'S'
  const eo = lng >= 0 ? 'E' : (es ? 'O' : 'W')
  return `${Math.abs(lat).toFixed(6)}° ${ns}, ${Math.abs(lng).toFixed(6)}° ${eo}`
}

const MESES_ABREV: Record<'es' | 'en', string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

function formatTime(iso?: string, locale: string = 'es', tz = 'Europe/Madrid'): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    // Partes en la hora de LA PLAYA, sin nombres. Canarias va una
    // hora por detrás y este sello acompaña a datos de la propia
    // ficha: ponerlo en hora peninsular allí desmiente al dato.
    const partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(d)
    const p = (t: string) => partes.find(x => x.type === t)?.value ?? ''
    const dia = String(Number(p('day')))
    const mes = MESES_ABREV[locale === 'en' ? 'en' : 'es'][Number(p('month')) - 1]
    return `${dia} ${mes}, ${p('hour')}:${p('minute')}`
  } catch { return '' }
}

function TempCell({ icon, val, label }: { icon: React.ReactNode; val:string; label:string }) {
  return <div className={styles.tempCell}><span className={styles.tcIcon}>{icon}</span><div><span className={styles.tcV}>{val}</span><span className={styles.tcL}>{label}</span></div></div>
}

/**
 * Fila de la ficha técnica. 29 usos: es la cifra que más se repite del
 * sitio después del score.
 *
 * `cert` es opcional a propósito. Sin ella la fila se comporta como
 * siempre, así que añadirla no toca las 29 de golpe. Con ella, el valor
 * pasa por el mismo `.dato[data-cert]` que el resto del sistema y lleva
 * su trazo: el usuario ve de un vistazo que la longitud de la playa es
 * un dato OFICIAL —lo es— y no una medición de hoy.
 *
 * Es la diferencia entre afirmar y citar. El producto tenía la gramática
 * construida y la usaba en una sola cifra de toda la ficha.
 */
function DataRow({ k, v, mono, href, cert }: { k:string; v:string; mono?:boolean; href?:string; cert?:Certeza }) {
  const val = href
    ? <Link href={href} style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>{v}</Link>
    : cert
      ? <span className="dato" data-cert={cert}>{v}</span>
      : v
  return <div className={styles.dataRow}><span className={styles.drK}>{k}</span><span className={`${styles.drV} ${mono ? styles.drMono : ''}`}>{val}</span></div>
}

function CompassSVG({ dir }: { dir: string }) {
  const angles: Record<string,number> = { N:0,NE:45,E:90,SE:135,S:180,SO:225,O:270,NO:315 }
  const angle = angles[dir] ?? 0
  return (
    <svg width="82" height="82" viewBox="0 0 82 82" style={{ flexShrink:0 }} role="img" aria-label={`Viento dirección ${dir}`}>
      <circle cx="41" cy="41" r="37" fill="rgba(255,255,255,.45)" stroke="rgba(180,130,60,.2)" strokeWidth="1.5"/>
      <text x="41" y="10" textAnchor="middle" fontSize="8" fill="var(--ink-soft)" fontFamily="sans-serif" fontWeight="600">N</text>
      <text x="72" y="44" textAnchor="middle" fontSize="8" fill="var(--ink-soft)" fontFamily="sans-serif">E</text>
      <text x="41" y="77" textAnchor="middle" fontSize="8" fill="var(--ink-soft)" fontFamily="sans-serif">S</text>
      <text x="10" y="44" textAnchor="middle" fontSize="8" fill="var(--ink-soft)" fontFamily="sans-serif">O</text>
      <line x1="41" y1="14" x2="41" y2="68" stroke="rgba(180,130,60,.12)" strokeWidth="1"/>
      <line x1="14" y1="41" x2="68" y2="41" stroke="rgba(180,130,60,.12)" strokeWidth="1"/>
      <g transform={`rotate(${angle},41,41)`}>
        <polygon points="41,14 37,44 41,38 45,44" fill="var(--terra-800)"/>
        <polygon points="41,68 37,38 41,44 45,38" fill="color-mix(in srgb, var(--accent) 25%, transparent)"/>
      </g>
    </svg>
  )
}

function OleajeChart({ olas, oleajeHoras, nowLabel = 'Ahora' }: { olas: number; oleajeHoras?: OleajeHora[] | null; nowLabel?: string }) {
  const datos = oleajeHoras ?? [
    { h: nowLabel, v: olas },
    { h:'+1h', v: parseFloat((olas * 1.1).toFixed(1)) },
    { h:'+2h', v: parseFloat((olas * 1.2).toFixed(1)) },
    { h:'+3h', v: parseFloat((olas * 1.15).toFixed(1)) },
    { h:'+4h', v: parseFloat((olas * 1.0).toFixed(1)) },
    { h:'+5h', v: parseFloat((olas * 0.9).toFixed(1)) },
  ]
  const mx = Math.max(...datos.map(d => d.v))
  return (
    <div className={styles.oleajeWrap}>
      {datos.map((d, i) => {
        const pct = mx > 0 ? Math.max(14, (d.v / mx) * 70) : 14
        const col = d.v > 1.5 ? '#c44a1a' : d.v > .8 ? 'var(--accent2)' : '#a8c8e0'
        return (
          <div key={i} className={styles.ocCol}>
            <div className={styles.ocBar} style={{ height: pct, background: col, opacity: i === 0 ? 1 : .55 }}/>
            <span className={styles.ocVal}>{d.v}m</span>
            <span className={styles.ocTime}>{d.h}</span>
          </div>
        )
      })}
    </div>
  )
}

// Cross-links: connects the beach to its coast route + top 10 ranking
function CrossLinks({ playa, locale = 'es' }: { playa: Playa; locale?: 'es' | 'en' }) {
  const es = locale === 'es'
  // Find which costa this beach belongs to
  const COSTA_MAP: Record<string, { slug: string; nombre: string }> = {
    'Gipuzkoa': { slug: 'costa-vasca', nombre: 'Costa Vasca' },
    'Bizkaia': { slug: 'costa-vasca', nombre: 'Costa Vasca' },
    'Cantabria': { slug: 'costa-de-cantabria', nombre: 'Costa de Cantabria' },
    'Asturias': { slug: 'costa-verde', nombre: 'Costa Verde' },
    'A Coruña': { slug: 'rias-altas', nombre: 'Rías Altas' },
    'Lugo': { slug: 'rias-altas', nombre: 'Rías Altas' },
    'Pontevedra': { slug: 'rias-baixas', nombre: 'Rías Baixas' },
    'Huelva': { slug: 'costa-de-la-luz', nombre: 'Costa de la Luz' },
    'Cádiz': { slug: 'costa-de-la-luz', nombre: 'Costa de la Luz' },
    'Málaga': { slug: 'costa-del-sol', nombre: 'Costa del Sol' },
    'Granada': { slug: 'costa-tropical', nombre: 'Costa Tropical' },
    'Almería': { slug: 'costa-de-almeria', nombre: 'Costa de Almería' },
    'Murcia': { slug: 'costa-calida', nombre: 'Costa Cálida' },
    'Alicante': { slug: 'costa-blanca', nombre: 'Costa Blanca' },
    'Castellón': { slug: 'costa-del-azahar', nombre: 'Costa del Azahar' },
    'Valencia': { slug: 'costa-de-valencia', nombre: 'Costa de Valencia' },
    'Tarragona': { slug: 'costa-dorada', nombre: 'Costa Dorada' },
    'Barcelona': { slug: 'costa-del-garraf', nombre: 'Costa del Garraf' },
    'Girona': { slug: 'costa-brava', nombre: 'Costa Brava' },
    'Baleares': { slug: 'islas-baleares', nombre: 'Islas Baleares' },
    'Las Palmas': { slug: 'islas-canarias', nombre: 'Islas Canarias' },
    'Santa Cruz de Tenerife': { slug: 'islas-canarias', nombre: 'Islas Canarias' },
  }
  const costa = COSTA_MAP[playa.provincia]
  if (!costa) return null
  const routeBase = es ? '/rutas' : '/en/routes'
  const topBase = es ? '/top' : '/en/top'

  return (
    <div className={styles.card} style={{ padding: '1rem' }}>
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.65rem' }}>
        {es ? 'Descubre más de esta costa' : 'Discover more from this coast'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
        <Link href={`${routeBase}/ruta-${costa.slug}`} style={{
          display: 'flex', alignItems: 'center', gap: '.6rem',
          padding: '.65rem .85rem', borderRadius: 4,
          border: '1px solid var(--line)', textDecoration: 'none',
          transition: 'all .15s',
        }}>
          <span style={{ fontSize: 'var(--fs-md)' }} aria-hidden="true">🛣️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--ink)' }}>
              {es ? `Ruta por la ${costa.nombre}` : `${costa.nombre} Route`}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)' }}>
              {es ? '5 playas en coche con Google Maps' : '5 beaches by car with Google Maps'}
            </div>
          </div>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
        </Link>
        <Link href={`${topBase}/${costa.slug}`} style={{
          display: 'flex', alignItems: 'center', gap: '.6rem',
          padding: '.65rem .85rem', borderRadius: 4,
          border: '1px solid var(--line)', textDecoration: 'none',
          transition: 'all .15s',
        }}>
          <span style={{ fontSize: 'var(--fs-md)' }} aria-hidden="true">🏆</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--ink)' }}>
              {es ? `Top 10 ${costa.nombre}` : `Top 10 ${costa.nombre}`}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)' }}>
              {es ? 'Ranking de las mejores playas' : 'Best beaches ranking'}
            </div>
          </div>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
        </Link>
      </div>
    </div>
  )
}
