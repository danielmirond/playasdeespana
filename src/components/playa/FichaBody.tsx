'use client'
// src/components/playa/FichaBody.tsx
import type { Playa, Restaurante } from '@/types'
import type { FotoPlaya } from '@/lib/fotos'
import type { HotelReal } from '@/lib/hoteles'
import type { ForecastDay, TurbidezData } from '@/lib/marine'
import type { MeteoForecast } from '@/lib/meteo'
import type { BanderaPlaya, MedusasRiesgo } from '@/lib/seguridad'
import type { MareasDia } from '@/lib/mareas-lunar'
import dynamic from 'next/dynamic'
import IluEstado from './IluEstado'
import { ESTADOS } from '@/lib/estados'
import styles from './FichaBody.module.css'
import FichaAsideActions from './FichaAsideActions'
import TextoSEO from './TextoSEO'
import type { Escuela } from '@/lib/escuelas'
import { Camera, Waves, Sun, Drop, ForkKnife, Bed, Thermometer, Wind, Car, Bus, Bicycle, Person, MapPin, Star } from '@/components/ui/Icons'

// Lazy load heavy below-fold components
const TraficoSection = dynamic(() => import('./TraficoSection'), { ssr: false })
const SurfSection = dynamic(() => import('./SurfSection'), { ssr: false })
const EscuelasSection = dynamic(() => import('./EscuelasSection'), { ssr: false })
const MapaLeaflet = dynamic(() => import('@/components/ui/MapaLeafletWrapper'), { ssr: false })

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
  escuelas?:      Escuela[]
  turbidez?:      TurbidezData | null
  forecastSurf?:  ForecastDay[] | null
  meteoForecast?: MeteoForecast[]
  dateModified?:   string
  banderaPlaya?:   BanderaPlaya
  medusas?:        MedusasRiesgo
  mareasLunar?:    MareasDia
  locale?:         'es' | 'en'
}

const T = {
  es: {
    galeria:(n:string)=>`Fotos de ${n}`, galSrc:'Wikimedia · Unsplash', verFotos:'Ver fotos',
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
    actualizado:'Actualizado', agua:'Agua', aire:'🌡 Aire', olas:'Olas', vientoLabel:'Viento',
    nowLabel:'Ahora',
    SERVICIOS:[
      { key:'socorrismo', label:'Socorrismo' }, { key:'duchas', label:'Duchas' },
      { key:'accesible',  label:'Accesible PMR' }, { key:'parking', label:'Parking' },
      { key:'bandera',    label:'Bandera Azul' }, { key:'perros', label:'Perros' },
    ],
  },
  en: {
    galeria:(n:string)=>`Photos of ${n}`, galSrc:'Wikimedia · Unsplash', verFotos:'View photos',
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
    actualizado:'Updated', agua:'Water', aire:'🌡 Air', olas:'Waves', vientoLabel:'Wind',
    nowLabel:'Now',
    SERVICIOS:[
      { key:'socorrismo', label:'Lifeguard' }, { key:'duchas', label:'Showers' },
      { key:'accesible',  label:'Accessible' }, { key:'parking', label:'Parking' },
      { key:'bandera',    label:'Blue Flag' }, { key:'perros', label:'Dogs allowed' },
    ],
  },
}

const COLORES_CALIDAD: Record<string, [string, string]> = {
  'Excelente':  ['#22c55e', '#2a5e2a'],
  'Buena':      ['#3b82f6', '#1e3a7e'],
  'Suficiente': ['#f59e0b', '#7a4008'],
  'Deficiente': ['#ef4444', '#7a1010'],
}

export default function FichaBody({ playa, meteo, solData, oleajeHoras, calidad, restaurantes, fotos, hoteles, escuelas, turbidez, forecastSurf, meteoForecast, dateModified, banderaPlaya, medusas, mareasLunar, locale = 'es' }: Props) {
  const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const i18n     = T[locale]
  const estado   = ESTADOS[meteo.estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
  const horasLuz = solData?.horas_luz ?? '—'

  const nivelCalidad          = calidad?.nivel ?? 'Excelente'
  const [dotColor, textColor] = COLORES_CALIDAD[nivelCalidad] ?? ['#9a7848', '#9a7848']
  const pctCalidad            = calidad?.porcentaje ?? 99
  const temporadaCalidad      = calidad?.temporada ?? 2024

  const restList = restaurantes && restaurantes.length > 0 ? restaurantes : null

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>

        {/* FOTOS */}
        <div className={styles.card} id="s-fotos">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.galeria(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{i18n.galSrc}</span>
          </div>
          <div className={styles.galeria}>
            {fotos && fotos.length > 0 ? (
              <div className={fotos.length === 1 ? styles.galeriaUna : styles.galeria}>
                <div className={styles.gFoto} style={{ gridRow: fotos.length > 1 ? '1/3' : undefined }}>
                  <img src={fotos[0].thumb} alt={`${playa.nombre} - foto 1`} loading="eager" fetchPriority="high" width={800} height={450} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>
                {fotos[1] && <div className={styles.gFoto}>
                  <img src={fotos[1].thumb} alt={`${playa.nombre} - foto 2`} loading="lazy" width={400} height={300} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>}
                {fotos[2] && <div className={`${styles.gFoto} ${styles.gFotoMas}`}>
                  <img src={fotos[2].thumb} alt={`${playa.nombre} - foto 3`} loading="lazy" width={400} height={300} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  {fotos.length > 3 && (
                    <div className={styles.gMasOverlay}><span className={styles.gMasN}>+{fotos.length - 2}</span><span className={styles.gMasL}>{i18n.verFotos}</span></div>
                  )}
                  <div className={styles.gFuente}>{fotos[0].fuente === 'wikimedia' ? <><Camera size={12}/> Wikimedia Commons</> : <><Camera size={12}/> Unsplash</>}</div>
                </div>}
              </div>
            ) : (
              <>
                <div className={styles.gFoto} style={{ background:'linear-gradient(160deg,#1a6b8a,#2a9a7a)', gridRow:'1/3' }}/>
                <div className={styles.gFoto} style={{ background:'linear-gradient(160deg,#1a4a6e,#2a7aaa)' }}/>
                <div className={`${styles.gFoto} ${styles.gFotoMas}`} style={{ background:'linear-gradient(160deg,#3a6a8a,#5a9aaa)' }}>
                  <div className={styles.gMasOverlay}><span className={styles.gMasN}>+8</span><span className={styles.gMasL}>{i18n.verFotos}</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* OLEAJE + METEO */}
        <div className={styles.card} id="s-meteo">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.oleaje(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{i18n.oleajeSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <OleajeChart olas={meteo.olas} oleajeHoras={oleajeHoras} nowLabel={i18n.nowLabel} />
          </div>

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            <h2 className={styles.cardTitle}>{i18n.luzSolar}</h2>
            <span className={styles.cardSrc}>{i18n.luzSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.solRow}>
              <div className={styles.sr}><span className={styles.srV}>🌅 {solData?.amanecer ?? meteo.amanecer ?? '—'}</span><span className={styles.srL}>{i18n.amanecer}</span></div>
              <div className={styles.sr}><span className={styles.srV}>{horasLuz}</span><span className={styles.srL}>{i18n.horasLuz}</span></div>
              <div className={styles.sr}><span className={styles.srV}>🌇 {solData?.atardecer ?? meteo.atardecer ?? '—'}</span><span className={styles.srL}>{i18n.atardecer}</span></div>
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
                      border: `1.5px solid ${m.tipo === 'pleamar' ? 'rgba(59,130,246,.2)' : 'rgba(245,158,11,.2)'}`,
                      borderRadius:'12px', padding:'.55rem .5rem',
                    }}>
                      <div style={{ fontSize:'.65rem', color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>
                        {m.tipo === 'pleamar' ? (locale === 'en' ? '▲ High' : '▲ Plea.') : (locale === 'en' ? '▼ Low' : '▼ Baja.')}
                      </div>
                      <div style={{ fontSize:'1.05rem', fontWeight:800, color:'var(--ink)', marginTop:'.15rem' }}>{m.hora}</div>
                      <div style={{ fontSize:'.65rem', color:'var(--muted)' }}>{m.altura}m</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'var(--muted)' }}>
                  <span>{i18n.coeficiente}: <strong style={{ color:'var(--ink)' }}>{mareasLunar.coeficiente}</strong></span>
                  <span style={{ color: mareasLunar.tipo === 'vivas' ? '#3b82f6' : mareasLunar.tipo === 'muertas' ? '#f59e0b' : 'var(--muted)', fontWeight:600 }}>
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
              <TempCell icon="🌡" val={`${meteo.tempAire}°C`}   label={i18n.tempAire}/>
              <TempCell icon="💧" val={`${meteo.agua}°C`}       label={i18n.tempAgua}/>
              <TempCell icon="🤔" val={`${meteo.sensacion}°C`}  label={i18n.sensacion}/>
              <TempCell icon="☀️" val={`UV ${meteo.uv}`}        label={i18n.indiceUV}/>
              <TempCell icon="💦" val={`${meteo.humedad}%`}     label={i18n.humedad}/>
            </div>
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
        </div>

        {/* SEGURIDAD: BANDERA + MEDUSAS */}
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
                  <div style={{ width:28, height:28, borderRadius:'50%', background:medusas.hex, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem' }} aria-hidden>🪼</div>
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

        {/* CÓMO LLEGAR */}
        <div className={styles.card} id="s-comoLlegar">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><Car size={16} weight='bold' style={{marginRight:'.35rem',verticalAlign:'middle'}}/>{locale === 'en' ? `How to get to ${playa.nombre}` : `Cómo llegar a ${playa.nombre}`}</h2>
          </div>
          <div className={styles.cardBody}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=driving`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'12px', background:'var(--accent,#b06820)', color:'#fff', textDecoration:'none', fontWeight:600, fontSize:'.9rem' }}>
                <Car size={18} weight='bold'/> {locale === 'en' ? 'By car — open in Google Maps' : 'En coche — abrir en Google Maps'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=transit`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'12px', background:'var(--card-bg2,#f5ede0)', color:'var(--accent,#b06820)', textDecoration:'none', fontWeight:600, fontSize:'.9rem', border:'1.5px solid var(--line,#e8dcc8)' }}>
                <Bus size={18} weight='bold'/> {locale === 'en' ? 'By public transport' : 'En transporte público'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=bicycling`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'12px', background:'var(--card-bg2,#f5ede0)', color:'var(--accent,#b06820)', textDecoration:'none', fontWeight:600, fontSize:'.9rem', border:'1.5px solid var(--line,#e8dcc8)' }}>
                <Bicycle size={18} weight='bold'/> {locale === 'en' ? 'By bike' : 'En bicicleta'}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${playa.lat},${playa.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.9rem 1.1rem', borderRadius:'12px', background:'var(--card-bg2,#f5ede0)', color:'var(--accent,#b06820)', textDecoration:'none', fontWeight:600, fontSize:'.9rem', border:'1.5px solid var(--line,#e8dcc8)' }}>
                <Person size={18} weight='bold'/> {locale === 'en' ? 'Walking' : 'A pie'}
              </a>
            </div>
            <MapaLeaflet lat={playa.lat} lng={playa.lng} nombre={playa.nombre} zoom={15} height="300px" />
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
            <div className={styles.list}>
              {restList ? restList.slice(0, 5).map((r: any) => {
                const mapsUrl = r.googleId ? `https://www.google.com/maps/place/?q=place_id:${r.googleId}` : `https://www.google.com/maps/search/${encodeURIComponent(r.nombre)}`
                return (
                  <div key={r.id ?? r.nombre} className={styles.listItem}>
                    <ForkKnife size={16} weight='bold' style={{color:'var(--accent,#b06820)'}}/> 
                    <div className={styles.listInfo}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                        <div className={styles.listNombre}>{r.nombre}</div>
                      </a>
                      <div className={styles.listMeta}>
                        {r.tipo} · {r.distancia_m}m · {r.precio}
                        {r.reseñas > 0 && <span style={{ color:'#9a7848' }}> · {r.reseñas.toLocaleString(locale === 'en' ? 'en' : 'es')} {i18n.resenas}</span>}
                        {r.horario && <span style={{ color: r.horario === 'Abierto ahora' ? '#22c55e' : '#ef4444', marginLeft:'6px' }}>· {r.horario}</span>}
                      </div>
                      {r.resena && <div style={{ fontSize:'.75rem', color:'#6b5a3e', fontStyle:'italic', marginTop:'4px', lineHeight:'1.4' }}>"{r.resena}"</div>}
                      {(r.website || r.telefono) && (
                        <div style={{ display:'flex', gap:'8px', marginTop:'6px', flexWrap:'wrap' }}>
                          {r.website && <a href={r.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.7rem', background:'#b06820', color:'#fff', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600 }}>🌐 Web</a>}
                          {r.telefono && <a href={`tel:${r.telefono}`} style={{ fontSize:'.7rem', background:'rgba(176,104,32,.12)', color:'#b06820', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600, border:'1px solid rgba(176,104,32,.3)' }}>📞 {r.telefono}</a>}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 }}>
                      {r.rating > 0 && <span className={styles.rating}>{r.rating}</span>}
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.7rem', color:'#b06820', fontWeight:600, textDecoration:'none' }}>Ver →</a>
                    </div>
                  </div>
                )
              }) : (
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
          </div>
        </div>
        <div className={styles.card} id="s-dormir">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.dormir(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{hoteles && hoteles.length > 0 ? i18n.dormirSrc : ''}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.list}>
              {hoteles && hoteles.length > 0 ? hoteles.map((h: any) => {
                const mapsUrl = h.googleId ? `https://www.google.com/maps/place/?q=place_id:${h.googleId}` : `https://www.google.com/maps/search/${encodeURIComponent(h.nombre)}`
                return (
                  <div key={h.id} className={styles.hotelItem}>
                    <div className={styles.hotelFoto} style={h.foto ? { backgroundImage:`url(${h.foto})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>{!h.foto && <Bed size={22} color='var(--muted,#8a7560)'/>}</div>
                    <div className={styles.listInfo}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                        <div className={styles.listNombre}>{h.nombre}</div>
                      </a>
                      <div className={styles.hotelStars}>{'★'.repeat(Math.min(h.estrellas,5))}{'☆'.repeat(Math.max(0,5-h.estrellas))}</div>
                      <div className={styles.listMeta}>{h.distancia_m}m{h.rating > 0 && <span> · {h.rating} ⭐ ({h.reseñas?.toLocaleString(locale === 'en' ? 'en' : 'es')})</span>}{h.precio && <span> · {h.precio}</span>}</div>
                      {(h.website || h.telefono) && (
                        <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
                          {h.website && <a href={h.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.7rem', background:'#b06820', color:'#fff', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600 }}>🌐 Web</a>}
                          {h.telefono && <a href={`tel:${h.telefono}`} style={{ fontSize:'.7rem', background:'rgba(176,104,32,.12)', color:'#b06820', padding:'3px 8px', borderRadius:'4px', textDecoration:'none', fontWeight:600, border:'1px solid rgba(176,104,32,.3)' }}>📞 {h.telefono}</a>}
                        </div>
                      )}
                    </div>
                    {h.rating > 0 && <span className={styles.rating}>{h.rating}</span>}
                  </div>
                )
              }) : (
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
          </div>
        </div>

        {/* SERVICIOS */}
        <div className={styles.card} id="s-servicios">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.servicios(playa.nombre)}</h2>
            <span className={styles.cardSrc}>{i18n.serviciosSrc}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.srvGrid}>
              {i18n.SERVICIOS.map(s => {
                const on = !!(playa as any)[s.key]
                return <span key={s.key} className={`${styles.srv} ${on ? styles.srvSi : styles.srvNo}`}>{on ? '✓' : '✗'} {s.label}</span>
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
            {playa.longitud    && <DataRow k={i18n.longitud}     v={`${playa.longitud} m`}/>}
            {playa.anchura     && <DataRow k={i18n.anchura}      v={`${playa.anchura} m`}/>}
            {playa.composicion && <DataRow k={i18n.composicion}  v={playa.composicion}/>}
            {playa.tipo        && <DataRow k={i18n.tipo}         v={playa.tipo}/>}
            <DataRow k={i18n.municipio}   v={playa.municipio} href={locale === 'en' ? `/en/towns/${slug(playa.municipio)}` : `/municipio/${slug(playa.municipio)}`}/>
            <DataRow k={i18n.provincia}   v={playa.provincia} href={locale === 'en' ? `/en/provinces/${slug(playa.provincia)}` : `/provincia/${slug(playa.provincia)}`}/>
            <DataRow k={i18n.comunidad}   v={playa.comunidad} href={locale === 'en' ? `/en/communities/${slug(playa.comunidad)}` : `/comunidad/${slug(playa.comunidad)}`}/>
            <DataRow k={i18n.coordenadas} v={`${playa.lat}° N, ${playa.lng}° E`} mono/>
          </div>
        </div>

        <TextoSEO playa={playa} locale={locale} />

        {/* FAQS */}
        <FaqSection playa={playa} meteo={meteo} banderaPlaya={banderaPlaya} medusas={medusas} mareasLunar={mareasLunar} locale={locale} />

      </div>

      {/* ASIDE */}
      <aside className={styles.aside}>
        <div className={styles.asideCard}>
          <div className={styles.aeIlu}><IluEstado estado={meteo.estado} size="sm"/></div>
          <div className={styles.aeEstado} style={{ color: estado.dot }}>{estado.label}</div>
          <div className={styles.aeFrase}><em>{estado.frase}</em></div>
          <div className={styles.aePill}><span className={styles.aeDot} style={{ background: estado.dot }}/>{i18n.actualizado} · <time dateTime={dateModified}>{formatTime(dateModified, locale)}</time></div>
          <div className={styles.aeQs}>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.agua}°C</span><span className={styles.aeQl}>{i18n.agua}</span></div>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.tempAire}°C</span><span className={styles.aeQl}>{i18n.aire}</span></div>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.olas}m</span><span className={styles.aeQl}>{i18n.olas}</span></div>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.viento}km/h</span><span className={styles.aeQl}>{i18n.vientoLabel}</span></div>
          </div>
        </div>
        <FichaAsideActions nombre={playa.nombre} lat={playa.lat} lng={playa.lng} slug={playa.slug} />
      </aside>
    </div>
  )
}

function FaqSection({ playa, meteo, banderaPlaya, medusas, mareasLunar, locale = 'es' }: {
  playa: Playa; meteo: Meteo; banderaPlaya?: BanderaPlaya; medusas?: MedusasRiesgo; mareasLunar?: MareasDia; locale?: 'es' | 'en'
}) {
  const n = playa.nombre
  const es = locale === 'es'

  const faqs: { q: string; a: string }[] = [
    {
      q: es ? `¿Cómo está el agua en ${n} hoy?` : `How is the water at ${n} today?`,
      a: es
        ? `La temperatura del agua en ${n} es de ${meteo.agua}°C con olas de ${meteo.olas}m.`
        : `Water temperature at ${n} is ${meteo.agua}°C with ${meteo.olas}m waves.`,
    },
    banderaPlaya ? {
      q: es ? `¿Qué bandera tiene ${n} hoy?` : `What flag does ${n} have today?`,
      a: es ? (banderaPlaya.label + '. ' + banderaPlaya.motivo + '.') : (banderaPlaya.labelEn + '. ' + banderaPlaya.motivoEn + '.'),
    } : null,
    medusas ? {
      q: es ? `¿Hay medusas en ${n}?` : `Are there jellyfish at ${n}?`,
      a: es ? (medusas.label + '. ' + medusas.detalle + '.') : (medusas.labelEn + '. ' + medusas.detalleEn + '.'),
    } : null,
    {
      q: es ? `¿Cuánto viento hace en ${n}?` : `How windy is it at ${n}?`,
      a: es
        ? `El viento en ${n} es de ${meteo.viento} km/h con rachas de ${meteo.vientoRacha} km/h (dirección ${meteo.vientoDireccion}).`
        : `Wind at ${n} is ${meteo.viento} km/h with gusts of ${meteo.vientoRacha} km/h (${meteo.vientoDireccion}).`,
    },
    mareasLunar ? {
      q: es ? `¿A qué hora es la pleamar en ${n}?` : `What time is high tide at ${n}?`,
      a: (() => {
        const pleas = mareasLunar.mareas.filter(m => m.tipo === 'pleamar')
        const tipoLabel = es
          ? (mareasLunar.tipo === 'vivas' ? 'mareas vivas' : mareasLunar.tipo === 'muertas' ? 'mareas muertas' : 'mareas medias')
          : (mareasLunar.tipo === 'vivas' ? 'spring tides' : mareasLunar.tipo === 'muertas' ? 'neap tides' : 'average tides')
        if (mareasLunar.zona === 'mediterraneo') {
          return es
            ? `En el Mediterráneo las mareas son insignificantes (${mareasLunar.rango}m). El nivel del agua apenas varía.`
            : `Mediterranean tides are negligible (${mareasLunar.rango}m). Water level barely changes.`
        }
        return es
          ? `Hoy las pleamares en ${n} son a las ${pleas.map(p => p.hora).join(' y ')} (${pleas[0]?.altura}m). Coeficiente ${mareasLunar.coeficiente}, ${tipoLabel}.`
          : `Today's high tides at ${n} are at ${pleas.map(p => p.hora).join(' and ')} (${pleas[0]?.altura}m). Coefficient ${mareasLunar.coeficiente}, ${tipoLabel}.`
      })(),
    } : null,
    playa.parking !== undefined ? {
      q: es ? `¿Hay parking cerca de ${n}?` : `Is there parking near ${n}?`,
      a: es
        ? (playa.parking ? `Sí, hay aparcamiento próximo a ${n}.` : `${n} no dispone de parking oficial.`)
        : (playa.parking ? `Yes, there is parking near ${n}.` : `${n} does not have official parking.`),
    } : null,
    playa.perros !== undefined ? {
      q: es ? `¿Se permiten perros en ${n}?` : `Are dogs allowed at ${n}?`,
      a: es
        ? (playa.perros ? `Sí, ${n} permite perros.` : `No, en ${n} no se permiten perros.`)
        : (playa.perros ? `Yes, dogs are allowed at ${n}.` : `No, dogs are not allowed at ${n}.`),
    } : null,
  ].filter(Boolean) as { q: string; a: string }[]

  if (faqs.length === 0) return null

  return (
    <div className={styles.card} id="s-faqs">
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{es ? `Preguntas frecuentes sobre ${n}` : `Frequently asked questions about ${n}`}</h2>
      </div>
      <div className={styles.cardBody}>
        {faqs.map((faq, i) => (
          <details key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--line,#e8dcc8)' : 'none', padding: '.65rem 0' }}>
            <summary style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q}
              <span style={{ color: 'var(--muted)', fontSize: '.7rem', flexShrink: 0, marginLeft: '.5rem' }}>+</span>
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

function TempCell({ icon, val, label }: { icon:string; val:string; label:string }) {
  return <div className={styles.tempCell}><span className={styles.tcIcon}>{icon}</span><div><span className={styles.tcV}>{val}</span><span className={styles.tcL}>{label}</span></div></div>
}

function DataRow({ k, v, mono, href }: { k:string; v:string; mono?:boolean; href?:string }) {
  const val = href
    ? <a href={href} style={{ color:'var(--accent,#b06820)', textDecoration:'none', fontWeight:600 }}>{v}</a>
    : v
  return <div className={styles.dataRow}><span className={styles.drK}>{k}</span><span className={`${styles.drV} ${mono ? styles.drMono : ''}`}>{val}</span></div>
}

function CompassSVG({ dir }: { dir: string }) {
  const angles: Record<string,number> = { N:0,NE:45,E:90,SE:135,S:180,SO:225,O:270,NO:315 }
  const angle = angles[dir] ?? 0
  return (
    <svg width="82" height="82" viewBox="0 0 82 82" style={{ flexShrink:0 }} role="img" aria-label={`Viento dirección ${dir}`}>
      <circle cx="41" cy="41" r="37" fill="rgba(255,255,255,.45)" stroke="rgba(180,130,60,.2)" strokeWidth="1.5"/>
      <text x="41" y="10" textAnchor="middle" fontSize="8" fill="#9a7848" fontFamily="sans-serif" fontWeight="600">N</text>
      <text x="72" y="44" textAnchor="middle" fontSize="8" fill="#9a7848" fontFamily="sans-serif">E</text>
      <text x="41" y="77" textAnchor="middle" fontSize="8" fill="#9a7848" fontFamily="sans-serif">S</text>
      <text x="10" y="44" textAnchor="middle" fontSize="8" fill="#9a7848" fontFamily="sans-serif">O</text>
      <line x1="41" y1="14" x2="41" y2="68" stroke="rgba(180,130,60,.12)" strokeWidth="1"/>
      <line x1="14" y1="41" x2="68" y2="41" stroke="rgba(180,130,60,.12)" strokeWidth="1"/>
      <g transform={`rotate(${angle},41,41)`}>
        <polygon points="41,14 37,44 41,38 45,44" fill="#b06820"/>
        <polygon points="41,68 37,38 41,44 45,38" fill="rgba(176,104,32,.25)"/>
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
