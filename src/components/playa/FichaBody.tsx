'use client'
// src/components/playa/FichaBody.tsx
import { useEffect, useState } from 'react'
import type { Playa, Restaurante } from '@/types'
import type { FotoPlaya } from '@/lib/fotos'
import type { HotelReal } from '@/lib/hoteles'
import type { Camping } from '@/lib/campings'
import type { CentroBuceo } from '@/lib/buceo'
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
import styles from './FichaBody.module.css'
import FichaAsideActions from './FichaAsideActions'
import TextoSEO from './TextoSEO'
import HubsRelacionados from './HubsRelacionados'
import FerriesCTA from './FerriesCTA'
import PhotoCarousel from './PhotoCarousel'
import type { Escuela } from '@/lib/escuelas'
import { generarFaqsPlaya } from '@/lib/faqsPlaya'
import { Camera, Waves, Sun, Drop, ForkKnife, Bed, Thermometer, Wind, Car, Bus, Bicycle, Person, MapPin, Star, Fish, SunHorizon, Flag, Gauge } from '@phosphor-icons/react'
import AdSlot from '@/components/ui/AdSlot'

const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID ?? ''
const PARCLICK_AFF = process.env.NEXT_PUBLIC_PARCLICK_AFF ?? ''
const CIVITATIS_AFF = process.env.NEXT_PUBLIC_CIVITATIS_AFF ?? ''
const THEFORK_AFF = process.env.NEXT_PUBLIC_THEFORK_AFF ?? ''
const RENTALCARS_AFF = process.env.NEXT_PUBLIC_RENTALCARS_AFF ?? ''

// Lazy load below-fold components (SSR habilitado para SEO; solo Leaflet no soporta SSR)
const TraficoSection = dynamic(() => import('./TraficoSection'))
const SurfSection = dynamic(() => import('./SurfSection'))
const EscuelasSection = dynamic(() => import('./EscuelasSection'))
const MapaLeaflet = dynamic(() => import('@/components/ui/MapaLeafletWrapper'), { ssr: false })
const ReportarDrawer = dynamic(() => import('./ReportarDrawer'), { ssr: false })
const VotacionPlaya = dynamic(() => import('./VotacionPlaya'), {
  ssr: false,
  loading: () => <div style={{ height: 148, borderRadius: 6, border: '1px solid var(--line,#e8dcc8)', background: 'var(--card-bg,#faf6ef)' }} />,
})

interface Meteo {
  agua: number; olas: number; viento: number; vientoRacha: number
  vientoDireccion: string; uv: number; tempAire: number
  sensacion: number; humedad: number
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
  medusas?:        MedusasRiesgo
  mareasLunar?:    MareasDia
  horaIdeal?:      HoraIdeal
  playasCercanas?: { slug: string; nombre: string; municipio: string; distKm: number; bandera?: boolean }[]
  locale?:         'es' | 'en'
  /** Slug del municipio si la página existe (ver getMunicipioSlugsSet). */
  municipioSlug?:  string
  /** Slug de la provincia si la página existe. */
  provinciaSlug?:  string
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
  'Excelente':  ['#3d6b1f', '#2a4a14'],  // --excelente
  'Buena':      ['#7a8a30', '#4a5a20'],  // --muybueno
  'Suficiente': ['#c48a1e', '#7a4008'],  // --aceptable
  'Deficiente': ['#7a2818', '#4a1810'],  // --noapto
}

export default function FichaBody({ playa, meteo, solData, oleajeHoras, calidad, restaurantes, fotos, hoteles, campings, centrosBuceo, escuelas, turbidez, forecastSurf, meteoForecast, dateModified, banderaPlaya, medusas, mareasLunar, horaIdeal, playasCercanas, locale = 'es', municipioSlug, provinciaSlug }: Props) {
  const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const i18n     = T[locale]
  const estado   = ESTADOS[meteo.estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
  const amazonProductos = getProductosParaPlaya(playa, meteo.estado)
  const horasLuz = solData?.horas_luz ?? '–'

  const nivelCalidad          = calidad?.nivel ?? 'Excelente'
  const [dotColor, textColor] = COLORES_CALIDAD[nivelCalidad] ?? ['#5a3d12', '#5a3d12']
  const pctCalidad            = calidad?.porcentaje ?? 99
  const temporadaCalidad      = calidad?.temporada ?? 2024

  // Hoteles + restaurantes: si el server no los pudo traer (Overpass lento
  // o Vercel timeout), reintentamos client-side contra /api/*. Así la ficha
  // renderiza rápido y los datos aparecen cuando están listos.
  const [clientRestaurantes, setClientRestaurantes] = useState<Restaurante[]>(restaurantes ?? [])
  const [clientHoteles, setClientHoteles]           = useState<HotelReal[]>(hoteles ?? [])
  const [loadingCercanos, setLoadingCercanos]       = useState(false)

  useEffect(() => {
    const needsRest = !restaurantes || restaurantes.length === 0
    const needsHot  = !hoteles || hoteles.length === 0
    if (!needsRest && !needsHot) return

    const ac = new AbortController()
    setLoadingCercanos(true)

    const url = (p: string) => `${p}?lat=${playa.lat}&lon=${playa.lng}`
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

    Promise.all(promises).finally(() => {
      if (!ac.signal.aborted) setLoadingCercanos(false)
    })
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playa.slug])

  const restList = clientRestaurantes && clientRestaurantes.length > 0 ? clientRestaurantes : null

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>

        {/* FOTOS */}
        <div className={styles.card} id="s-fotos">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.galeria(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{i18n.galSrc}</span>
          </div>
          <PhotoCarousel
            fotos={fotos ?? []}
            nombreAlt={playa.nombre}
            locale={locale}
          />
        </div>

        {/* AD. entre fotos y oleaje */}
        <AdSlot slot="fotos-oleaje" format="horizontal" />

        {/* OLEAJE + METEO */}
        <div className={styles.card} id="s-meteo">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{locale === 'en' ? <>Sea & <em>weather</em></> : <>Mar y <em>meteo</em></>}</h2>
            <span className={styles.cardSrc}>{i18n.oleajeSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <OleajeChart olas={meteo.olas} oleajeHoras={oleajeHoras} nowLabel={i18n.nowLabel} />
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
                <h2 className={styles.cardTitle}>{i18n.mareas(playa.nombre)}</h2>
                <span className={styles.cardSrc}>{i18n.mareasSrc}</span>
              </div>
              <div className={styles.cardBody}>
                <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'.75rem' }}>
                  {mareasLunar.mareas.map((m, i) => (
                    <div key={i} style={{
                      flex:'1 1 auto', minWidth:'70px', textAlign:'center',
                      background: m.tipo === 'pleamar' ? 'rgba(59,130,246,.08)' : 'rgba(245,158,11,.08)',
                      border: `1px solid ${m.tipo === 'pleamar' ? 'rgba(59,130,246,.2)' : 'rgba(245,158,11,.2)'}`,
                      borderRadius:'4px', padding:'.55rem .5rem',
                    }}>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>
                        {m.tipo === 'pleamar' ? (locale === 'en' ? '▲ High' : '▲ Plea.') : (locale === 'en' ? '▼ Low' : '▼ Baja.')}
                      </div>
                      <div style={{ fontSize:'1.05rem', fontWeight:800, color:'var(--ink)', marginTop:'.15rem' }}>{m.hora}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)' }}>{m.altura}m</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'var(--muted)' }}>
                  <span>{i18n.coeficiente}: <strong style={{ color:'var(--ink)' }}>{mareasLunar.coeficiente}</strong></span>
                  <span style={{ color: mareasLunar.tipo === 'vivas' ? '#4a7a90' : mareasLunar.tipo === 'muertas' ? '#c48a1e' : 'var(--muted)', fontWeight:600 }}>
                    {mareasLunar.tipo === 'vivas' ? i18n.vivas : mareasLunar.tipo === 'muertas' ? i18n.muertas : i18n.mediasLabel}
                  </span>
                </div>
              </div>
            </>
          )}

          {mareasLunar && mareasLunar.zona === 'mediterraneo' && (
            <>
              <div className={styles.divider}/>
              <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
                <h2 className={styles.cardTitle}>{i18n.mareas(playa.nombre)}</h2>
                <span className={styles.cardSrc}>{i18n.mareasSrc}</span>
              </div>
              <div className={styles.cardBody}>
                <p style={{ fontSize:'.78rem', color:'var(--muted)', lineHeight:1.5 }}>
                  {locale === 'en'
                    ? `The Mediterranean has negligible tidal range (${mareasLunar.rango}m). Water level remains practically constant throughout the day.`
                    : `El Mediterráneo tiene un rango mareal insignificante (${mareasLunar.rango}m). El nivel del agua se mantiene prácticamente constante durante el día.`}
                </p>
              </div>
            </>
          )}

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            <h2 className={styles.cardTitle}>{i18n.temperatura(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{i18n.tempSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tempGrid}>
              <TempCell icon={<Thermometer size={18} weight="bold" color="var(--accent)"/>} val={`${meteo.tempAire}°C`}   label={i18n.tempAire}/>
              <TempCell icon={<Drop size={18} weight="bold" color="var(--accent)"/>} val={`${meteo.agua}°C`}       label={i18n.tempAgua}/>
              <TempCell icon={<Thermometer size={18} weight="light" color="var(--muted)"/>} val={`${meteo.sensacion}°C`}  label={i18n.sensacion}/>
              <TempCell icon={<Sun size={18} weight="bold" color="var(--accent)"/>} val={`UV ${meteo.uv}`}        label={i18n.indiceUV}/>
              <TempCell icon={<Gauge size={18} weight="bold" color="var(--accent)"/>} val={`${meteo.humedad}%`}     label={i18n.humedad}/>
            </div>
            {meteo.uv >= 3 && (
              <Link href="/protectores-solares" style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                marginTop: '.65rem', padding: '.6rem .85rem',
                background: meteo.uv >= 8 ? 'rgba(122,40,24,.06)' : meteo.uv >= 6 ? 'rgba(160,72,24,.06)' : 'rgba(196,138,30,.06)',
                border: `1px solid ${meteo.uv >= 8 ? 'rgba(122,40,24,.2)' : meteo.uv >= 6 ? 'rgba(160,72,24,.2)' : 'rgba(196,138,30,.2)'}`,
                borderRadius: 4, textDecoration: 'none', color: 'var(--ink)',
                fontSize: '.82rem', lineHeight: 1.4,
              }}>
                <Sun size={16} weight="bold" color={meteo.uv >= 8 ? '#7a2818' : meteo.uv >= 6 ? '#a04818' : '#c48a1e'} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span>
                  <strong style={{ color: meteo.uv >= 8 ? '#7a2818' : meteo.uv >= 6 ? '#a04818' : '#c48a1e' }}>
                    {meteo.uv >= 8 ? (locale === 'en' ? 'Very high UV' : 'UV muy alto') : meteo.uv >= 6 ? (locale === 'en' ? 'High UV' : 'UV alto') : (locale === 'en' ? 'Moderate UV' : 'UV moderado')}
                    {'. '}
                    {meteo.uv >= 6 ? 'SPF 50+' : 'SPF 30+'}
                  </strong>
                  {' '}
                  <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
                    {locale === 'en' ? 'See our sunscreen guide →' : 'Ver guía de protectores →'}
                  </span>
                </span>
              </Link>
            )}
          </div>

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            <h2 className={styles.cardTitle}>{i18n.viento(playa.nombre)}</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.vientoRow}>
              <CompassSVG dir={meteo.vientoDireccion}/>
              <table className={styles.vTable}>
                <tbody>
                  <tr><td className={styles.vtK}>{i18n.velocidad}</td><td className={styles.vtV}>{meteo.viento} km/h</td></tr>
                  <tr><td className={styles.vtK}>{i18n.racha}</td><td className={styles.vtV}>{meteo.vientoRacha} km/h</td></tr>
                  <tr><td className={styles.vtK}>{i18n.direccion}</td><td className={styles.vtV}>{meteo.vientoDireccion}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          </Collapsible>
        </div>

        {/* SEGURIDAD: BANDERA + MEDUSAS + CALIDAD */}
        {(banderaPlaya || medusas) && (
          <div className={styles.card} id="s-seguridad">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{i18n.seguridad(playa.nombre)}</h2>
              <span className={styles.cardSrc}>{i18n.seguridadSrc}</span>
            </div>
            <div className={styles.cardBody}>
              {banderaPlaya && (
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom: medusas ? '1rem' : 0 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:banderaPlaya.hex, flexShrink:0 }} aria-hidden />
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.88rem', color:'var(--ink)' }}>{locale === 'en' ? banderaPlaya.labelEn : banderaPlaya.label}</div>
                    <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:'.1rem' }}>{locale === 'en' ? banderaPlaya.motivoEn : banderaPlaya.motivo}</div>
                  </div>
                </div>
              )}
              {medusas && (
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:medusas.hex, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }} aria-hidden><Fish size={16} weight="bold" color="#fff"/></div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.88rem', color:'var(--ink)' }}>{locale === 'en' ? medusas.labelEn : medusas.label}</div>
                    <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:'.1rem' }}>{locale === 'en' ? medusas.detalleEn : medusas.detalle}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALIDAD AGUA */}
        <div className={styles.card} id="s-calidad">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.calidad(playa.nombre)}</h2>
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

        {/* ACTIVIDADES */}
        <SurfSection
          playa={playa} olas={meteo.olas} viento={meteo.viento}
          vientoDir={meteo.vientoDireccion} agua={meteo.agua}
          periodo={meteo.periodo} forecast={forecastSurf ?? undefined}
          turbidez={turbidez} meteo={meteoForecast}
        />

        {/* Civitatis affiliate CTA */}
        {CIVITATIS_AFF && (
          <div style={{
            background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
            borderRadius: 6, padding: '1rem 1.15rem', marginBottom: '.85rem',
            display: 'flex', alignItems: 'center', gap: '.75rem',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {locale === 'en' ? `Activities near ${playa.nombre}` : `Actividades cerca de ${playa.nombre}`}
              </div>
              <div style={{ fontSize:'.74rem', color: 'rgba(255,255,255,.85)' }}>
                {locale === 'en' ? 'Surf lessons, kayak tours, snorkeling and more' : 'Clases de surf, kayak, snorkel y más'}
              </div>
            </div>
            <a
              href={`https://www.civitatis.com/es/${playa.municipio.toLowerCase().replace(/\s+/g,'-')}/?aid=${CIVITATIS_AFF}`}
              target="_blank" rel="noopener noreferrer sponsored"
              style={{
                padding: '.55rem 1rem', background: '#fff', color: '#ff6b35',
                borderRadius: 4, fontSize: '.78rem', fontWeight: 500,
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              {locale === 'en' ? 'Explore →' : 'Ver →'}
            </a>
          </div>
        )}

        {/* CÓMO LLEGAR */}
        <div className={styles.card} id="s-comoLlegar">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><Car size={16} weight='bold' style={{marginRight:'.35rem',verticalAlign:'middle'}}/>{locale === 'en' ? <>How to <em>get there</em></> : <>Cómo <em>llegar</em></>}</h2>
          </div>
          <div className={styles.cardBody}>
            <Collapsible maxHeight={160} labelMore={locale === 'en' ? 'Show all options' : 'Ver todas las opciones'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=driving`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--accent,#6b400a)', color:'#fff', textDecoration:'none', fontWeight:600, fontSize:'.9rem' }}>
                <Car size={18} weight='bold'/> {locale === 'en' ? 'By car. open in Google Maps' : 'En coche. abrir en Google Maps'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=transit`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--card-bg2,#f5ede0)', color:'var(--accent,#6b400a)', textDecoration:'none', fontWeight:600, fontSize:'.9rem', border:'1px solid var(--line,#e8dcc8)' }}>
                <Bus size={18} weight='bold'/> {locale === 'en' ? 'By public transport' : 'En transporte público'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=bicycling`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--card-bg2,#f5ede0)', color:'var(--accent,#6b400a)', textDecoration:'none', fontWeight:600, fontSize:'.9rem', border:'1px solid var(--line,#e8dcc8)' }}>
                <Bicycle size={18} weight='bold'/> {locale === 'en' ? 'By bike' : 'En bicicleta'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'4px', background:'var(--card-bg2,#f5ede0)', color:'var(--accent,#6b400a)', textDecoration:'none', fontWeight:600, fontSize:'.9rem', border:'1px solid var(--line,#e8dcc8)' }}>
                <Person size={18} weight='bold'/> {locale === 'en' ? 'Walking' : 'A pie'}
              </a>
              {/* Rentalcars affiliate */}
              {RENTALCARS_AFF && (
                <a
                  href={`https://www.rentalcars.com/search-results?latitude=${playa.lat}&longitude=${playa.lng}&affiliateCode=${RENTALCARS_AFF}`}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                    padding: '.9rem 1.1rem', borderRadius: 4,
                    background: '#0071c2', color: '#fff',
                    textDecoration: 'none', fontWeight: 600, fontSize: '.9rem',
                  }}
                >
                  <Car size={18} weight="bold" />
                  {locale === 'en' ? 'Rent a car. Rentalcars.com' : 'Alquilar coche. Rentalcars.com'}
                </a>
              )}
            </div>

            {/* Detalles oficiales de acceso (MITECO) */}
            {(playa.forma_acceso || playa.carretera || playa.autobus_tipo || playa.parking_tipo || playa.parking_plazas || playa.tipo_paseo || playa.puerto_deportivo) && (
              <div style={{ marginTop: '1rem', padding: '.85rem 1rem', background: 'rgba(107,64,10,.05)', border: '1px solid var(--line)', borderRadius: '4px' }}>
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
        <div id="s-trafico">
          <TraficoSection playa={playa} />
        </div>

        {/* RESTAURANTES */}
        <div className={styles.card} id="s-comer">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.comer(playa.nombre)}</h2>
            <span className={styles.cardSrc}>
              {restList ? i18n.comerSrcOSM : ''}
            </span>
          </div>
          <div className={styles.cardBody}>
            <Collapsible maxHeight={200} labelMore={locale === 'en' ? 'Show all' : 'Ver todos'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
            <div className={styles.list}>
              {restList ? restList.slice(0, 5).map((r: any) => {
                const mapsUrl = r.googleId ? `https://www.google.com/maps/place/?q=place_id:${r.googleId}` : `https://www.google.com/maps/search/${encodeURIComponent(r.nombre)}`
                return (
                  <div key={r.id ?? r.nombre} className={styles.listItem}>
                    <ForkKnife size={16} weight='bold' style={{color:'var(--accent,#6b400a)'}}/> 
                    <div className={styles.listInfo}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                        <div className={styles.listNombre}>{r.nombre}</div>
                      </a>
                      <div className={styles.listMeta}>
                        {r.tipo} · {r.distancia_m}m · {r.precio}
                        {r.reseñas > 0 && <span style={{ color:'#5a3d12' }}> · {r.reseñas.toLocaleString(locale === 'en' ? 'en' : 'es')} {i18n.resenas}</span>}
                        {r.horario && <span style={{ color: r.horario === 'Abierto ahora' ? '#3d6b1f' : '#7a2818', marginLeft:'6px' }}>· {r.horario}</span>}
                      </div>
                      {r.resena && <div style={{ fontSize:'.75rem', color:'#6b5a3e', fontStyle:'italic', marginTop:'4px', lineHeight:'1.4' }}>"{r.resena}"</div>}
                      {(r.website || r.telefono) && (
                        <div style={{ display:'flex', gap:'8px', marginTop:'6px', flexWrap:'wrap' }}>
                          {r.website && <a href={r.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.75rem', background:'#6b400a', color:'#fff', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600 }}>Web</a>}
                          {r.telefono && <a href={`tel:${r.telefono}`} style={{ fontSize:'.75rem', background:'rgba(107,64,10,.12)', color:'#6b400a', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600, border:'1px solid rgba(107,64,10,.3)' }}>{r.telefono}</a>}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 }}>
                      {r.rating > 0 && <span className={styles.rating}>{r.rating}</span>}
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.75rem', color:'#6b400a', fontWeight:600, textDecoration:'none' }}>Ver →</a>
                    </div>
                  </div>
                )
              }) : loadingCercanos ? (
                <div role="status" aria-live="polite" style={{ padding:'1rem 0', textAlign:'center' }}>
                  <p style={{ fontSize:'.82rem', color:'var(--muted)' }}>
                    {locale === 'en' ? 'Loading nearby restaurants…' : 'Buscando restaurantes cercanos…'}
                  </p>
                </div>
              ) : (
                <div style={{ padding:'1rem 0', textAlign:'center' }}>
                  <p style={{ fontSize:'.82rem', color:'var(--muted)', marginBottom:'.75rem' }}>
                    {locale === 'en' ? 'No restaurants found nearby' : 'No se encontraron restaurantes cercanos'}
                  </p>
                  <a href={`https://www.google.com/maps/search/restaurantes/@${playa.lat},${playa.lng},15z`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.78rem', color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
                    {locale === 'en' ? 'Search on Google Maps →' : 'Buscar en Google Maps →'}
                  </a>
                </div>
              )}
            </div>
            {/* TheFork / ElTenedor affiliate CTA */}
            {THEFORK_AFF && (
              <a
                href={`https://www.thefork.es/search?cityId=&geoSlug=&q=${encodeURIComponent(playa.municipio)}&partner=${THEFORK_AFF}`}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  width: '100%', padding: '.65rem', marginTop: '.6rem',
                  background: '#00665c', color: '#fff', borderRadius: 4,
                  fontSize: '.8rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                <ForkKnife size={16} weight="bold" />
                {locale === 'en' ? `Book a table in ${playa.municipio}` : `Reservar mesa en ${playa.municipio}`}
              </a>
            )}
            </Collapsible>
          </div>
        </div>
        <div className={styles.card} id="s-dormir">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.dormir(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{clientHoteles && clientHoteles.length > 0 ? i18n.dormirSrc : ''}</span>
          </div>
          <div className={styles.cardBody}>
            <Collapsible maxHeight={200} labelMore={locale === 'en' ? 'Show all' : 'Ver todos'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
            <div className={styles.list}>
              {clientHoteles && clientHoteles.length > 0 ? clientHoteles.map((h: any) => {
                const mapsUrl = h.googleId ? `https://www.google.com/maps/place/?q=place_id:${h.googleId}` : `https://www.google.com/maps/search/${encodeURIComponent(h.nombre)}`
                return (
                  <div key={h.id} className={styles.hotelItem}>
                    <div
                      className={styles.hotelFoto}
                      role={h.foto ? 'img' : undefined}
                      aria-label={h.foto ? (locale === 'en' ? `Photo of ${h.nombre}` : `Foto de ${h.nombre}`) : undefined}
                      style={h.foto ? { backgroundImage:`url(${h.foto})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}
                    >
                      {!h.foto && <Bed size={22} color='var(--muted,#5a3d12)' aria-hidden="true"/>}
                    </div>
                    <div className={styles.listInfo}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                        <div className={styles.listNombre}>{h.nombre}</div>
                      </a>
                      <div className={styles.hotelStars}>{'★'.repeat(Math.min(h.estrellas,5))}{'☆'.repeat(Math.max(0,5-h.estrellas))}</div>
                      <div className={styles.listMeta}>{h.distancia_m}m{h.rating > 0 && <span> · {h.rating} <Star size={12} weight="fill" color="#f5a623" style={{verticalAlign:'middle'}}/> ({h.reseñas?.toLocaleString(locale === 'en' ? 'en' : 'es')})</span>}{h.precio && <span> · {h.precio}</span>}</div>
                      {(h.website || h.telefono) && (
                        <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
                          {h.website && <a href={h.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.75rem', background:'#6b400a', color:'#fff', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600 }}>Web</a>}
                          {h.telefono && <a href={`tel:${h.telefono}`} style={{ fontSize:'.75rem', background:'rgba(107,64,10,.12)', color:'#6b400a', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600, border:'1px solid rgba(107,64,10,.3)' }}>{h.telefono}</a>}
                        </div>
                      )}
                    </div>
                    {h.rating > 0 && <span className={styles.rating}>{h.rating}</span>}
                  </div>
                )
              }) : loadingCercanos ? (
                <div role="status" aria-live="polite" style={{ padding:'1rem 0', textAlign:'center' }}>
                  <p style={{ fontSize:'.82rem', color:'var(--muted)' }}>
                    {locale === 'en' ? 'Loading nearby hotels…' : 'Buscando hoteles cercanos…'}
                  </p>
                </div>
              ) : (
                <div style={{ padding:'1rem 0', textAlign:'center' }}>
                  <p style={{ fontSize:'.82rem', color:'var(--muted)', marginBottom:'.75rem' }}>
                    {locale === 'en' ? 'No hotels found nearby' : 'No se encontraron hoteles cercanos'}
                  </p>
                  <a href={`https://www.google.com/maps/search/hoteles/@${playa.lat},${playa.lng},14z`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.78rem', color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
                    {locale === 'en' ? 'Search on Google Maps →' : 'Buscar en Google Maps →'}
                  </a>
                </div>
              )}
            </div>
            {/* Booking.com affiliate CTA */}
            {BOOKING_AID && (
              <a
                href={`https://www.booking.com/searchresults.html?aid=${BOOKING_AID}&label=playa-${playa.slug}&latitude=${playa.lat}&longitude=${playa.lng}&radius=5&checkin=&checkout=`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  width: '100%', padding: '.7rem', marginTop: '.6rem',
                  background: '#003580', color: '#fff', borderRadius: 4,
                  fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
                  transition: 'opacity .15s',
                }}
              >
                <Bed size={16} weight="bold" />
                {locale === 'en' ? `Find hotels near ${playa.nombre}` : `Buscar hoteles cerca de ${playa.nombre}`}
              </a>
            )}
            </Collapsible>
          </div>
        </div>

        {/* FERRY CTA. solo se muestra en Baleares y Canarias */}
        <FerriesCTA playa={playa} locale={locale} />

        {/* CAMPINGS Y AUTOCARAVANAS */}
        {campings && campings.length > 0 && (
          <div className={styles.card} id="s-campings">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                <Car size={16} weight="bold" style={{marginRight:'.35rem',verticalAlign:'middle',color:'var(--accent,#6b400a)'}}/>
                {locale === 'en' ? <>Campsites <em>nearby</em></> : <><em>Campings</em> y autocaravanas</>}
              </h2>
              <span className={styles.cardSrc}>OpenStreetMap</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.list}>
                {campings.map(c => {
                  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(c.nombre)}/@${c.lat},${c.lon},15z`
                  return (
                    <div key={c.id} className={styles.listItem}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 4, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(61,107,31,.1)', color: '#3d6b1f', fontSize: '1.5rem',
                      }} aria-hidden="true">⛺</div>
                      <div className={styles.listInfo}>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className={styles.listNombre}>{c.nombre}</div>
                        </a>
                        <div style={{ fontSize: '.66rem', color: '#3d6b1f', fontWeight: 700, marginTop: '.1rem' }}>
                          {c.tipo}
                          {c.categoria > 0 && (
                            <span style={{ marginLeft: '.35rem', color: 'var(--muted,#5a3d12)' }}>
                              · {'★'.repeat(Math.min(c.categoria, 5))}
                            </span>
                          )}
                        </div>
                        <div className={styles.listMeta}>
                          {c.distancia_m >= 1000 ? `${(c.distancia_m/1000).toFixed(1)} km` : `${c.distancia_m} m`}
                          {c.autocaravanas && <span> · {locale === 'en' ? 'Motorhomes' : 'Autocaravanas'}</span>}
                          {c.tiendas && <span> · {locale === 'en' ? 'Tents' : 'Tiendas'}</span>}
                          {c.bungalows && <span> · {locale === 'en' ? 'Bungalows' : 'Bungalows'}</span>}
                          {c.perros && <span> · {locale === 'en' ? 'Dog-friendly' : 'Admite perros'}</span>}
                        </div>
                        {c.servicios.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginTop: '.35rem' }}>
                            {c.servicios.slice(0, 5).map(s => (
                              <span key={s} style={{
                                fontSize: '.62rem', padding: '.1rem .4rem',
                                background: 'rgba(107,64,10,.08)',
                                color: '#4a2c05',
                                borderRadius: 4, fontWeight: 500,
                              }}>{s}</span>
                            ))}
                          </div>
                        )}
                        {(c.website || c.telefono) && (
                          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                            {c.website && (
                              <a href={c.website} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '.7rem', background: '#3d6b1f', color: '#fff', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>
                                Web
                              </a>
                            )}
                            {c.telefono && (
                              <a href={`tel:${c.telefono}`}
                                style={{ fontSize: '.7rem', background: 'rgba(61,107,31,.1)', color: '#166534', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(34,197,94,.3)' }}>
                                {c.telefono}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pitchup affiliate CTA */}
              {process.env.NEXT_PUBLIC_PITCHUP_AFF && (
                <a
                  href={`https://www.pitchup.com/es/campings/espana/?aff=${process.env.NEXT_PUBLIC_PITCHUP_AFF}&q=${encodeURIComponent(playa.municipio)}`}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                    width: '100%', padding: '.7rem', marginTop: '.6rem',
                    background: '#ff6b35', color: '#fff', borderRadius: 4,
                    fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  ⛺ {locale === 'en' ? `Book camping with Pitchup` : `Reservar camping en Pitchup`}
                </a>
              )}

              {/* Fallback: Booking.com también tiene campings */}
              {!process.env.NEXT_PUBLIC_PITCHUP_AFF && process.env.NEXT_PUBLIC_BOOKING_AID && (
                <a
                  href={`https://www.booking.com/searchresults.html?aid=${process.env.NEXT_PUBLIC_BOOKING_AID}&label=camping-${playa.slug}&latitude=${playa.lat}&longitude=${playa.lng}&radius=10&nflt=privacy_type%3D3`}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                    width: '100%', padding: '.7rem', marginTop: '.6rem',
                    background: '#003580', color: '#fff', borderRadius: 4,
                    fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  ⛺ {locale === 'en' ? 'Find campsites on Booking.com' : 'Buscar campings en Booking.com'}
                </a>
              )}
            </div>
          </div>
        )}

        {/* CENTROS DE BUCEO */}
        {centrosBuceo && centrosBuceo.length > 0 && (
          <div className={styles.card} id="s-buceo">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                <Fish size={16} weight="bold" style={{marginRight:'.35rem',verticalAlign:'middle',color:'#0891b2'}}/>
                {locale === 'en' ? <>Dive <em>centers</em></> : <>Centros de <em>buceo</em></>}
              </h2>
              <span className={styles.cardSrc}>OpenStreetMap</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.list}>
                {centrosBuceo.map(c => {
                  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(c.nombre)}/@${c.lat},${c.lon},15z`
                  return (
                    <div key={c.id} className={styles.listItem}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 4, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(8,145,178,.12)', color: '#0891b2', fontSize: '1.3rem',
                      }} aria-hidden="true"><Fish size={22} weight="bold" /></div>
                      <div className={styles.listInfo}>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className={styles.listNombre}>{c.nombre}</div>
                        </a>
                        <div style={{ fontSize: '.66rem', color: '#0891b2', fontWeight: 700, marginTop: '.1rem' }}>
                          {c.tipo}
                          {c.certificacion && <span style={{ marginLeft: '.35rem', background: '#0891b222', padding: '.1rem .35rem', borderRadius: 4, fontSize: '.6rem' }}>{c.certificacion}</span>}
                        </div>
                        <div className={styles.listMeta}>
                          {c.distancia_m >= 1000 ? `${(c.distancia_m/1000).toFixed(1)} km` : `${c.distancia_m} m`}
                        </div>
                        {c.servicios.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginTop: '.35rem' }}>
                            {c.servicios.slice(0, 4).map(s => (
                              <span key={s} style={{
                                fontSize: '.62rem', padding: '.1rem .4rem',
                                background: 'rgba(8,145,178,.08)', color: '#0e7490',
                                borderRadius: 4, fontWeight: 500,
                              }}>{s}</span>
                            ))}
                          </div>
                        )}
                        {(c.website || c.telefono) && (
                          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                            {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.7rem', background: '#0891b2', color: '#fff', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>Web</a>}
                            {c.telefono && <a href={`tel:${c.telefono}`} style={{ fontSize: '.7rem', background: 'rgba(8,145,178,.12)', color: '#0e7490', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(8,145,178,.3)' }}>{c.telefono}</a>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* AD. entre hoteles y servicios */}
        <AdSlot slot="hoteles-servicios" format="horizontal" />

        {/* SERVICIOS */}
        <div className={styles.card} id="s-servicios">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{locale === 'en' ? <>Facilities <em>&amp; services</em></> : <>Servicios <em>y equipamiento</em></>}</h2>
            <span className={styles.cardSrc}>{i18n.serviciosSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.srvGrid}>
              {i18n.SERVICIOS.map(s => {
                const on = !!(playa as any)[s.key]
                return <span key={s.key} className={`${styles.srv} ${on ? styles.srvSi : styles.srvNo}`}>{on ? 'Sí' : 'No'} · {s.label}</span>
              })}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className={styles.card} id="s-info">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.info(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{i18n.infoSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <Collapsible maxHeight={180} labelMore={locale === 'en' ? 'Show all details' : 'Ver todos los datos'} labelLess={locale === 'en' ? 'Show less' : 'Ver menos'}>
            {playa.longitud    && <DataRow k={i18n.longitud}     v={`${playa.longitud} m`}/>}
            {playa.anchura     && <DataRow k={i18n.anchura}      v={`${playa.anchura} m`}/>}
            {playa.composicion && <DataRow k={i18n.composicion}  v={playa.composicion}/>}
            {playa.tipo        && <DataRow k={i18n.tipo}         v={playa.tipo}/>}
            {playa.grado_ocupacion && <DataRow k={i18n.grado_ocupacion} v={playa.grado_ocupacion}/>}
            {playa.grado_urbano    && <DataRow k={i18n.grado_urbano}    v={playa.grado_urbano}/>}
            {playa.fachada_litoral && <DataRow k={i18n.fachada_litoral} v={playa.fachada_litoral}/>}
            {playa.condiciones     && <DataRow k={i18n.condiciones}     v={playa.condiciones}/>}
            {playa.vegetacion      && <DataRow k={i18n.vegetacion}      v={locale === 'en' ? 'Yes' : 'Sí'}/>}
            {playa.zona_fondeo     && <DataRow k={i18n.zona_fondeo}     v={locale === 'en' ? 'Yes' : 'Sí'}/>}
            {playa.espacio_protegido && <DataRow k={i18n.espacio_protegido} v={locale === 'en' ? 'Yes' : 'Sí'}/>}
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
            <DataRow k={i18n.coordenadas} v={`${playa.lat}° N, ${playa.lng}° E`} mono/>
            {playa.web_ayuntamiento && (
              <DataRow k={i18n.webAyuntamiento} v={i18n.verSitio} href={playa.web_ayuntamiento}/>
            )}
            {playa.url_miteco && (
              <DataRow k={i18n.fichaMiteco} v={i18n.verSitio} href={playa.url_miteco}/>
            )}
            {/* Emergencias embebidas en info */}
            {playa.hospital && (
              <>
                <div style={{ height: '.5rem' }}/>
                <DataRow k={i18n.hospital} v={playa.hospital}/>
                {playa.hospital_dist && <DataRow k={i18n.hospital_dist} v={playa.hospital_dist}/>}
                {playa.hospital_tel && (
                  <div style={{ marginTop:'.65rem', display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                    <a href={`tel:${playa.hospital_tel}`} style={{
                      display:'inline-flex', alignItems:'center',
                      background:'#7a2818', color:'#fff',
                      padding:'.4rem .85rem', borderRadius:'8px',
                      textDecoration:'none', fontSize:'.72rem', fontWeight:700,
                    }}>
                      {i18n.llamar} {playa.hospital_tel}
                    </a>
                    <a href="tel:112" style={{
                      display:'inline-flex', alignItems:'center',
                      background:'rgba(122,40,24,.1)', color:'#7a2818',
                      border:'1px solid rgba(239,68,68,.3)',
                      padding:'.4rem .85rem', borderRadius:'8px',
                      textDecoration:'none', fontSize:'.72rem', fontWeight:700,
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

        {/* PLAYAS CERCANAS */}
        {playasCercanas && playasCercanas.length > 0 && (
          <div className={styles.card} id="s-cercanas">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{locale === 'en' ? <>Beaches <em>nearby</em></> : <>Playas <em>cercanas</em></>}</h2>
            </div>
            <div className={styles.carousel}>
              {playasCercanas.map(pc => (
                <Link key={pc.slug} href={`${locale === 'en' ? '/en/beaches' : '/playas'}/${pc.slug}`} className={styles.cercanaCard} prefetch={true}>
                  <div className={styles.cercanaNombre}>{pc.nombre}</div>
                  <div className={styles.cercanaMeta}>{pc.municipio} · {pc.distKm < 10 ? pc.distKm.toFixed(1) : Math.round(pc.distKm)} km</div>
                  {pc.bandera && <span className={styles.cercanaBadge}><Flag size={12} weight="fill" color="var(--accent)"/></span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <TextoSEO playa={playa} locale={locale} />

        {/* Hubs temáticos relevantes (cross-linking semántico) */}
        <HubsRelacionados playa={playa} locale={locale} />

        {/* FAQS */}
        <FaqSection playa={playa} meteo={meteo} banderaPlaya={banderaPlaya} medusas={medusas} mareasLunar={mareasLunar} locale={locale} />

        {/* Cross-links: ruta + top de esta costa */}
        <CrossLinks playa={playa} locale={locale} />

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
          <div className={styles.aePill}><span className={styles.aeDot} style={{ background: estado.dot }}/>{i18n.actualizado} · <time dateTime={dateModified}>{formatTime(dateModified, locale)}</time></div>
        </div>
        {horaIdeal && (
          <div style={{
            background: 'linear-gradient(160deg, rgba(245,158,11,.08), rgba(107,64,10,.06))',
            border: '1px solid rgba(107,64,10,.25)',
            borderRadius: 6, padding: '.85rem 1rem',
          }}>
            <div style={{ fontSize:'.72rem', fontWeight: 700, color: 'var(--accent,#6b400a)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              {locale === 'en' ? 'Best time to go' : 'Mejor hora para ir'}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)', margin: '.3rem 0 .2rem', fontFamily: 'var(--font-serif)' }}>
              {horaIdeal.franja}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.4 }}>
              {locale === 'en' ? horaIdeal.razonEn : horaIdeal.razon}
            </div>
          </div>
        )}
        <FichaAsideActions nombre={playa.nombre} lat={playa.lat} lng={playa.lng} slug={playa.slug} meteo={{ agua: meteo.agua, olas: meteo.olas, viento: meteo.viento }} />
        <VotacionPlaya slug={playa.slug} locale={locale} />
        {/* ReportarEstado ahora vive en un drawer disparado desde el "+ avisar"
            del hero. El componente se monta fuera del aside (más abajo). */}
        {/* Amazon affiliate — contextual products for this beach */}
        {amazonProductos.length > 0 && (
          <div style={{
            background: 'var(--card-bg,#faf6ef)', border: '1px solid var(--line,#e8dcc8)',
            borderRadius: 6, padding: '.7rem', display: 'flex', flexDirection: 'column', gap: '.35rem',
          }}>
            <div style={{ fontSize:'.72rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 .2rem' }}>
              {locale === 'en' ? 'Gear for this beach' : 'Equipo para esta playa'}
            </div>
            {amazonProductos.map(p => (
              <a
                key={p.asin}
                href={`https://www.amazon.es/dp/${p.asin}/?tag=nuus-21`}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  padding: '.45rem .6rem', borderRadius: 4,
                  border: '1px solid var(--line,#e8dcc8)', background: 'rgba(255,255,255,.5)',
                  fontSize: '.75rem', fontWeight: 500, color: 'var(--ink)', textDecoration: 'none',
                }}
              >
                <span style={{ flex: 1 }}>{p.nombre}</span>
                <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>{p.precio}€</span>
                <span style={{ fontSize:'.72rem', color: 'var(--accent)', fontWeight: 600 }}>→</span>
              </a>
            ))}
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', opacity: .7, padding: '0 .2rem', marginTop: '.1rem' }}>
              Amazon.es · enlaces de afiliado
            </div>
          </div>
        )}
      </aside>

      {/* Drawer global para "+ avisar" — escucha custom event del hero */}
      <ReportarDrawer slug={playa.slug} locale={locale} />
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
          <details key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--line,#e8dcc8)' : 'none', padding: '.65rem 0' }}>
            <summary style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q}
              <span style={{ color: 'var(--muted)', fontSize:'.75rem', flexShrink: 0, marginLeft: '.5rem' }}>+</span>
            </summary>
            <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.5, marginTop: '.4rem' }}>{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

function formatTime(iso?: string, locale: string = 'es'): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(locale === 'en' ? 'en-GB' : 'es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Madrid',
    })
  } catch { return '' }
}

function TempCell({ icon, val, label }: { icon: React.ReactNode; val:string; label:string }) {
  return <div className={styles.tempCell}><span className={styles.tcIcon}>{icon}</span><div><span className={styles.tcV}>{val}</span><span className={styles.tcL}>{label}</span></div></div>
}

function DataRow({ k, v, mono, href }: { k:string; v:string; mono?:boolean; href?:string }) {
  const val = href
    ? <Link href={href} style={{ color:'var(--accent,#6b400a)', textDecoration:'none', fontWeight:600 }}>{v}</Link>
    : v
  return <div className={styles.dataRow}><span className={styles.drK}>{k}</span><span className={`${styles.drV} ${mono ? styles.drMono : ''}`}>{val}</span></div>
}

function CompassSVG({ dir }: { dir: string }) {
  const angles: Record<string,number> = { N:0,NE:45,E:90,SE:135,S:180,SO:225,O:270,NO:315 }
  const angle = angles[dir] ?? 0
  return (
    <svg width="82" height="82" viewBox="0 0 82 82" style={{ flexShrink:0 }} role="img" aria-label={`Viento dirección ${dir}`}>
      <circle cx="41" cy="41" r="37" fill="rgba(255,255,255,.45)" stroke="rgba(180,130,60,.2)" strokeWidth="1.5"/>
      <text x="41" y="10" textAnchor="middle" fontSize="8" fill="#5a3d12" fontFamily="sans-serif" fontWeight="600">N</text>
      <text x="72" y="44" textAnchor="middle" fontSize="8" fill="#5a3d12" fontFamily="sans-serif">E</text>
      <text x="41" y="77" textAnchor="middle" fontSize="8" fill="#5a3d12" fontFamily="sans-serif">S</text>
      <text x="10" y="44" textAnchor="middle" fontSize="8" fill="#5a3d12" fontFamily="sans-serif">O</text>
      <line x1="41" y1="14" x2="41" y2="68" stroke="rgba(180,130,60,.12)" strokeWidth="1"/>
      <line x1="14" y1="41" x2="68" y2="41" stroke="rgba(180,130,60,.12)" strokeWidth="1"/>
      <g transform={`rotate(${angle},41,41)`}>
        <polygon points="41,14 37,44 41,38 45,44" fill="#6b400a"/>
        <polygon points="41,68 37,38 41,44 45,38" fill="rgba(107,64,10,.25)"/>
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
        const col = d.v > 1.5 ? '#c44a1a' : d.v > .8 ? '#e8a030' : '#a8c8e0'
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
      <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.65rem' }}>
        {es ? 'Descubre más de esta costa' : 'Discover more from this coast'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
        <Link href={`${routeBase}/ruta-${costa.slug}`} style={{
          display: 'flex', alignItems: 'center', gap: '.6rem',
          padding: '.65rem .85rem', borderRadius: 4,
          border: '1px solid var(--line)', textDecoration: 'none',
          transition: 'all .15s',
        }}>
          <span style={{ fontSize: '1rem' }} aria-hidden="true">🛣️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>
              {es ? `Ruta por la ${costa.nombre}` : `${costa.nombre} Route`}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
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
          <span style={{ fontSize: '1rem' }} aria-hidden="true">🏆</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>
              {es ? `Top 10 ${costa.nombre}` : `Top 10 ${costa.nombre}`}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              {es ? 'Ranking de las mejores playas' : 'Best beaches ranking'}
            </div>
          </div>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
        </Link>
      </div>
    </div>
  )
}
