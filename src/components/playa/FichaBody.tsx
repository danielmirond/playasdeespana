'use client'
// src/components/playa/FichaBody.tsx
import type { Playa, Restaurante } from '@/types'
import type { FotoPlaya } from '@/lib/fotos'
import type { HotelReal } from '@/lib/hoteles'
import type { ForecastDay, TurbidezData } from '@/lib/marine'
import type { MeteoForecast } from '@/lib/meteo'
import IluEstado from './IluEstado'
import TraficoSection from './TraficoSection'
import SurfSection from './SurfSection'
import { ESTADOS } from '@/lib/estados'
import styles from './FichaBody.module.css'
import FichaAsideActions from './FichaAsideActions'
import TextoSEO from './TextoSEO'
import EscuelasSection from './EscuelasSection'
import type { Escuela } from '@/lib/escuelas'
import MapaLeaflet from '@/components/ui/MapaLeafletWrapper'
import { Camera, Waves, Sun, Drop, ForkKnife, Bed, Thermometer, Wind, Car, Bus, Bicycle, Person, MapPin, Star } from '@/components/ui/Icons'

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
  dateModified?:  string
  locale?:        'es' | 'en'
}

const T = {
  es: {
    galeria:'Galería', galSrc:'Wikimedia · Unsplash', verFotos:'Ver fotos',
    oleaje:'Oleaje · 6 horas', oleajeSrc:'Open-Meteo Marine',
    luzSolar:'Luz solar', luzSrc:'Sunrise-Sunset API',
    amanecer:'Amanecer', horasLuz:'Horas de luz', atardecer:'Atardecer',
    temperatura:'🌡 Temperatura', tempSrc:'Open-Meteo',
    tempAire:'Temperatura aire', tempAgua:'Temperatura agua',
    sensacion:'Sensación térmica', indiceUV:'Índice UV', humedad:'Humedad',
    viento:'💨 Viento', velocidad:'Velocidad', racha:'Racha máxima', direccion:'Dirección',
    calidad:'Calidad del agua', calidadSrc:'EEA · 2006/7/CE',
    muestras:'Muestras conformes', temporada:'Temporada', clasificacion:'Clasificación',
    comer:'Dónde comer', comerSrcOSM:'OpenStreetMap · 800m', comerSrcMock:'Datos de ejemplo', resenas:'reseñas',
    dormir:'Dónde dormir', dormirSrc:'OpenStreetMap · 2km', dormirSrcMock:'Datos de ejemplo',
    servicios:'✅ Servicios', serviciosSrc:'MITECO',
    info:'ℹ️ Información', infoSrc:'MITECO 2024',
    longitud:'Longitud', anchura:'Anchura media', composicion:'Composición', tipo:'Tipo',
    municipio:'Municipio', provincia:'Provincia', comunidad:'Comunidad', coordenadas:'Coordenadas',
    actualizado:'Actualizado', agua:'Agua', aire:'🌡 Aire', olas:'Olas', vientoLabel:'Viento',
    nowLabel:'Ahora',
    SERVICIOS:[
      { key:'socorrismo', label:'Socorrismo' }, { key:'duchas', label:'Duchas' },
      { key:'accesible',  label:'Accesible PMR' }, { key:'parking', label:'Parking' },
      { key:'bandera',    label:'Bandera Azul' }, { key:'perros', label:'Perros' },
    ],
    MOCK_REST:[
      { nombre:'El Chiringuito', tipo:'Pescado fresco',     dist:120, precio:'€€',  rating:9.1 },
      { nombre:'Sa Roqueta',     tipo:'Arroces · Mariscos', dist:340, precio:'€€€', rating:8.8 },
      { nombre:'Beso Beach',     tipo:'Mediterráneo',        dist:500, precio:'€€€', rating:8.6 },
    ],
    MOCK_HOTELS:[
      { nombre:'Hotel Playa',    estrellas:4, dist:500,  rating:9.2, precio:280 },
      { nombre:'Hostal Central', estrellas:3, dist:1200, rating:8.5, precio:120 },
    ],
  },
  en: {
    galeria:'Gallery', galSrc:'Wikimedia · Unsplash', verFotos:'View photos',
    oleaje:'Waves · 6 hours', oleajeSrc:'Open-Meteo Marine',
    luzSolar:'Sunlight', luzSrc:'Sunrise-Sunset API',
    amanecer:'Sunrise', horasLuz:'Daylight hours', atardecer:'Sunset',
    temperatura:'🌡 Temperature', tempSrc:'Open-Meteo',
    tempAire:'Air temperature', tempAgua:'Water temperature',
    sensacion:'Feels like', indiceUV:'UV index', humedad:'Humidity',
    viento:'💨 Wind', velocidad:'Speed', racha:'Max gust', direccion:'Direction',
    calidad:'Water quality', calidadSrc:'EEA · 2006/7/CE',
    muestras:'Compliant samples', temporada:'Season', clasificacion:'Classification',
    comer:'Where to eat', comerSrcOSM:'OpenStreetMap · 800m', comerSrcMock:'Sample data', resenas:'reviews',
    dormir:'Where to stay', dormirSrc:'OpenStreetMap · 2km', dormirSrcMock:'Sample data',
    servicios:'✅ Facilities', serviciosSrc:'MITECO',
    info:'ℹ️ Information', infoSrc:'MITECO 2024',
    longitud:'Length', anchura:'Average width', composicion:'Composition', tipo:'Type',
    municipio:'Municipality', provincia:'Province', comunidad:'Region', coordenadas:'Coordinates',
    actualizado:'Updated', agua:'Water', aire:'🌡 Air', olas:'Waves', vientoLabel:'Wind',
    nowLabel:'Now',
    SERVICIOS:[
      { key:'socorrismo', label:'Lifeguard' }, { key:'duchas', label:'Showers' },
      { key:'accesible',  label:'Accessible' }, { key:'parking', label:'Parking' },
      { key:'bandera',    label:'Blue Flag' }, { key:'perros', label:'Dogs allowed' },
    ],
    MOCK_REST:[
      { nombre:'Beach Bar',    tipo:'Fresh seafood',  dist:120, precio:'€€',  rating:9.1 },
      { nombre:'Sa Roqueta',   tipo:'Rice · Seafood', dist:340, precio:'€€€', rating:8.8 },
      { nombre:'Beso Beach',   tipo:'Mediterranean',  dist:500, precio:'€€€', rating:8.6 },
    ],
    MOCK_HOTELS:[
      { nombre:'Beach Hotel',    estrellas:4, dist:500,  rating:9.2, precio:280 },
      { nombre:'Central Hostel', estrellas:3, dist:1200, rating:8.5, precio:120 },
    ],
  },
}

const COLORES_CALIDAD: Record<string, [string, string]> = {
  'Excelente':  ['#22c55e', '#2a5e2a'],
  'Buena':      ['#3b82f6', '#1e3a7e'],
  'Suficiente': ['#f59e0b', '#7a4008'],
  'Deficiente': ['#ef4444', '#7a1010'],
}

export default function FichaBody({ playa, meteo, solData, oleajeHoras, calidad, restaurantes, fotos, hoteles, escuelas, turbidez, forecastSurf, meteoForecast, dateModified, locale = 'es' }: Props) {
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
            <h2 className={styles.cardTitle}>{i18n.galeria}</h2>
            <span className={styles.cardSrc}>{i18n.galSrc}</span>
          </div>
          <div className={styles.galeria}>
            {fotos && fotos.length > 0 ? (
              <div className={fotos.length === 1 ? styles.galeriaUna : styles.galeria}>
                <div className={styles.gFoto} style={{ gridRow: fotos.length > 1 ? '1/3' : undefined, backgroundImage:`url(${fotos[0].url})`, backgroundSize:'cover', backgroundPosition:'center' }}/>
                {fotos[1] && <div className={styles.gFoto} style={{ backgroundImage:`url(${fotos[1].url})`, backgroundSize:'cover', backgroundPosition:'center' }}/>}
                {fotos[2] && <div className={`${styles.gFoto} ${styles.gFotoMas}`} style={{ backgroundImage:`url(${fotos[2].url})`, backgroundSize:'cover', backgroundPosition:'center' }}>
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
            <h2 className={styles.cardTitle}>{i18n.oleaje}</h2>
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

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop:'.85rem' }}>
            <h2 className={styles.cardTitle}>{i18n.temperatura}</h2>
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
            <h2 className={styles.cardTitle}>{i18n.viento}</h2>
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

        {/* CALIDAD AGUA */}
        <div className={styles.card} id="s-calidad">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.calidad}</h2>
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
            <h2 className={styles.cardTitle}><Car size={16} weight='bold' style={{marginRight:'.35rem',verticalAlign:'middle'}}/>{locale === 'en' ? 'How to get there' : 'Cómo llegar'}</h2>
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
            <h2 className={styles.cardTitle}>{i18n.comer}</h2>
            <span className={styles.cardSrc}>
              {restList ? i18n.comerSrcOSM : i18n.comerSrcMock}
            </span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.list}>
              {(restList ?? i18n.MOCK_REST.map(r => ({ ...r, distancia_m: r.dist, reseñas: 0, horario: '', googleId: null, source: 'mock' }))).slice(0, 5).map((r: any) => {
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
              })}
            </div>
          </div>
        </div>

        {/* HOTELES */}
        <div className={styles.card} id="s-dormir">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.dormir}</h2>
            <span className={styles.cardSrc}>{hoteles && hoteles.length > 0 ? i18n.dormirSrc : i18n.dormirSrcMock}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.list}>
              {(hoteles && hoteles.length > 0 ? hoteles : i18n.MOCK_HOTELS.map(h => ({
                id: h.nombre, googleId: null, nombre: h.nombre, estrellas: h.estrellas,
                distancia_m: h.dist, rating: h.rating, reseñas: 0, precio: `${h.precio}€`,
                foto: null, website: null, telefono: null, source: 'mock'
              }))).map((h: any) => {
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
              })}
            </div>
          </div>
        </div>

        {/* SERVICIOS */}
        <div className={styles.card} id="s-servicios">
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{i18n.servicios}</h2>
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
            <h2 className={styles.cardTitle}>{i18n.info}</h2>
            <span className={styles.cardSrc}>{i18n.infoSrc}</span>
          </div>
          <div className={styles.cardBody}>
            {playa.longitud    && <DataRow k={i18n.longitud}     v={`${playa.longitud} m`}/>}
            {playa.anchura     && <DataRow k={i18n.anchura}      v={`${playa.anchura} m`}/>}
            {playa.composicion && <DataRow k={i18n.composicion}  v={playa.composicion}/>}
            {playa.tipo        && <DataRow k={i18n.tipo}         v={playa.tipo}/>}
            <DataRow k={i18n.municipio}   v={playa.municipio}/>
            <DataRow k={i18n.provincia}   v={playa.provincia}/>
            <DataRow k={i18n.comunidad}   v={playa.comunidad}/>
            <DataRow k={i18n.coordenadas} v={`${playa.lat}° N, ${playa.lng}° E`} mono/>
          </div>
        </div>

        <TextoSEO playa={playa} locale={locale} />

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

function DataRow({ k, v, mono }: { k:string; v:string; mono?:boolean }) {
  return <div className={styles.dataRow}><span className={styles.drK}>{k}</span><span className={`${styles.drV} ${mono ? styles.drMono : ''}`}>{v}</span></div>
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
