// src/components/playa/FichaBody.tsx
import type { Playa, Restaurante } from '@/types'
import type { FotoPlaya } from '@/lib/fotos'
import type { HotelReal } from '@/lib/hoteles'
import type { ForecastDay, TurbidezData, MeteoData } from '@/lib/marine'
import IluEstado from './IluEstado'
import TraficoSection from './TraficoSection'
import SurfSection from './SurfSection'
import { ESTADOS } from '@/lib/estados'
import styles from './FichaBody.module.css'
import FichaAsideActions from './FichaAsideActions'
import TextoSEO from './TextoSEO'


interface Meteo {
  agua: number; olas: number; viento: number; vientoRacha: number
  vientoDireccion: string; uv: number; tempAire: number
  amanecer?: string; atardecer?: string; estado: string; periodo?: number
}
interface OleajeHora { h: string; v: number }
interface SolData { amanecer: string; atardecer: string; horas_luz: string; pct_dia: number }
interface Calidad { nivel: string; porcentaje: number; temporada: number }
interface Props {
  playa:         Playa
  meteo:         Meteo
  solData?:      SolData | null
  oleajeHoras?:  OleajeHora[] | null
  calidad?:      Calidad | null
  restaurantes?: Restaurante[]
  fotos?:        FotoPlaya[]
  hoteles?:      HotelReal[]
  turbidez?:     TurbidezData | null
  forecastSurf?: ForecastDay[] | null
  meteoForecast?: MeteoData[]
}

const SERVICIOS = [
  { key: 'socorrismo', label: 'Socorrismo' },
  { key: 'duchas',     label: 'Duchas' },
  { key: 'accesible',  label: 'Accesible PMR' },
  { key: 'parking',    label: 'Parking' },
  { key: 'bandera',    label: 'Bandera Azul' },
  { key: 'perros',     label: 'Perros' },
]

const MOCK_REST = [
  { nombre:'El Chiringuito', tipo:'Pescado fresco',     dist:120, precio:'€€',  rating:9.1 },
  { nombre:'Sa Roqueta',     tipo:'Arroces · Mariscos', dist:340, precio:'€€€', rating:8.8 },
  { nombre:'Beso Beach',     tipo:'Mediterráneo',        dist:500, precio:'€€€', rating:8.6 },
]

const MOCK_HOTELS = [
  { nombre:'Hotel Playa',    estrellas:4, dist:500,  rating:9.2, precio:280 },
  { nombre:'Hostal Central', estrellas:3, dist:1200, rating:8.5, precio:120 },
]

const COLORES_CALIDAD: Record<string, [string, string]> = {
  'Excelente':  ['#22c55e', '#2a5e2a'],
  'Buena':      ['#3b82f6', '#1e3a7e'],
  'Suficiente': ['#f59e0b', '#7a4008'],
  'Deficiente': ['#ef4444', '#7a1010'],
}

export default function FichaBody({ playa, meteo, solData, oleajeHoras, calidad, restaurantes, fotos, hoteles, turbidez, forecastSurf, meteoForecast }: Props) {
  const estado   = ESTADOS[meteo.estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
  const horasLuz = solData?.horas_luz ?? '—'

  const nivelCalidad          = calidad?.nivel ?? 'Excelente'
  const [dotColor, textColor] = COLORES_CALIDAD[nivelCalidad] ?? ['#9a7848', '#9a7848']
  const pctCalidad            = calidad?.porcentaje ?? 99
  const temporadaCalidad      = calidad?.temporada ?? 2024

  const restList = restaurantes && restaurantes.length > 0 ? restaurantes : null

  return (
    <div className={styles.wrap}>
      <div className={styles.main} style={{}}>

        {/* FOTOS */}
        <div className={styles.card} id="s-fotos">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>📷 Galería</span>
            <span className={styles.cardSrc}>Unsplash · Wikimedia</span>
          </div>
          <div className={styles.galeria}>
            {fotos && fotos.length > 0 ? (
              <div className={fotos.length === 1 ? styles.galeriaUna : styles.galeria}>
                <div className={styles.gFoto} style={{ gridRow: fotos.length > 1 ? '1/3' : undefined, backgroundImage:`url(${fotos[0].url})`, backgroundSize:'cover', backgroundPosition:'center' }}/>
                {fotos[1] && <div className={styles.gFoto} style={{ backgroundImage:`url(${fotos[1].url})`, backgroundSize:'cover', backgroundPosition:'center' }}/>}
                {fotos[2] && <div className={`${styles.gFoto} ${styles.gFotoMas}`} style={{ backgroundImage:`url(${fotos[2].url})`, backgroundSize:'cover', backgroundPosition:'center' }}>
                  {fotos.length > 3 && (
                    <div className={styles.gMasOverlay}><span className={styles.gMasN}>+{fotos.length - 2}</span><span className={styles.gMasL}>Ver fotos</span></div>
                  )}
                  <div className={styles.gFuente}>{fotos[0].fuente === 'google' ? '📍 Google' : '📷 Unsplash'}</div>
                </div>}
              </div>
            ) : (
              <>
                <div className={styles.gFoto} style={{ background:'linear-gradient(160deg,#1a6b8a,#2a9a7a)', gridRow:'1/3' }}/>
                <div className={styles.gFoto} style={{ background:'linear-gradient(160deg,#1a4a6e,#2a7aaa)' }}/>
                <div className={`${styles.gFoto} ${styles.gFotoMas}`} style={{ background:'linear-gradient(160deg,#3a6a8a,#5a9aaa)' }}>
                  <div className={styles.gMasOverlay}><span className={styles.gMasN}>+8</span><span className={styles.gMasL}>Ver fotos</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* OLEAJE */}
        <div className={styles.card} id="s-meteo">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>🌊 Oleaje · 6 horas</span>
            <span className={styles.cardSrc}>Open-Meteo Marine</span>
          </div>
          <div className={styles.cardBody}>
            <OleajeChart olas={meteo.olas} oleajeHoras={oleajeHoras} />
          </div>

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop: '.85rem' }}>
            <span className={styles.cardTitle}>☀️ Luz solar</span>
            <span className={styles.cardSrc}>Sunrise-Sunset API</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.solRow}>
              <div className={styles.sr}><span className={styles.srV}>🌅 {solData?.amanecer ?? meteo.amanecer ?? '—'}</span><span className={styles.srL}>Amanecer</span></div>
              <div className={styles.sr}><span className={styles.srV}>{horasLuz}</span><span className={styles.srL}>Horas de luz</span></div>
              <div className={styles.sr}><span className={styles.srV}>🌇 {solData?.atardecer ?? meteo.atardecer ?? '—'}</span><span className={styles.srL}>Atardecer</span></div>
            </div>
          </div>

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop: '.85rem' }}>
            <span className={styles.cardTitle}>🌡 Temperatura</span>
            <span className={styles.cardSrc}>AEMET</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tempGrid}>
              <TempCell icon="🌡" val={`${meteo.tempAire}°C`}     label="Temperatura aire"/>
              <TempCell icon="💧" val={`${meteo.agua}°C`}         label="Temperatura agua"/>
              <TempCell icon="🤔" val={`${meteo.tempAire - 2}°C`} label="Sensación térmica"/>
              <TempCell icon="☀️" val={`UV ${meteo.uv}`}          label="Índice UV"/>
            </div>
          </div>

          <div className={styles.divider}/>

          <div className={styles.cardHead} style={{ paddingTop: '.85rem' }}>
            <span className={styles.cardTitle}>💨 Viento</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.vientoRow}>
              <CompassSVG dir={meteo.vientoDireccion}/>
              <table className={styles.vTable}>
                <tbody>
                  <tr><td className={styles.vtK}>Velocidad</td><td className={styles.vtV}>{meteo.viento} km/h</td></tr>
                  <tr><td className={styles.vtK}>Racha máxima</td><td className={styles.vtV}>{meteo.vientoRacha} km/h</td></tr>
                  <tr><td className={styles.vtK}>Dirección</td><td className={styles.vtV}>{meteo.vientoDireccion}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CALIDAD AGUA */}
        <div className={styles.card} id="s-calidad">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>💧 Calidad del agua</span>
            <span className={styles.cardSrc}>EEA · 2006/7/CE</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cqNivel}>
              <div className={styles.cqDot} style={{ background: dotColor }}/>
              <span className={styles.cqLabel} style={{ color: textColor }}>{nivelCalidad}</span>
            </div>
            <div className={styles.cqBar}>
              <div className={styles.cqBarIn} style={{ width:`${pctCalidad}%`, background:`linear-gradient(90deg,${textColor},${dotColor})` }}/>
            </div>
            <DataRow k="Muestras conformes" v={`${pctCalidad}%`} />
            <DataRow k="Temporada"          v={String(temporadaCalidad)} />
            <DataRow k="Clasificación"      v={`${nivelCalidad} (Directiva 2006/7/CE)`} />
          </div>
        </div>

        {/* ACTIVIDADES — reemplazado por SurfSection */}
        <SurfSection
          playa={playa}
          olas={meteo.olas}
          viento={meteo.viento}
          vientoDir={meteo.vientoDireccion}
          agua={meteo.agua}
          periodo={meteo.periodo}
          forecast={forecastSurf ?? undefined}
          turbidez={turbidez}
          meteo={meteoForecast}
        />

        {/* TRÁFICO */}
        <TraficoSection playa={playa} />

        {/* RESTAURANTES */}
        <div className={styles.card} id="s-comer">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>🍽 Dónde comer</span>
            <span className={styles.cardSrc}>
              {restList
                ? restList[0]?.source === 'google' ? 'Google Places · 800m' : 'OpenStreetMap · 800m'
                : 'Datos de ejemplo'}
            </span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.list}>
              {(restList ?? MOCK_REST.map(r => ({ ...r, distancia_m: r.dist, reseñas: 0, horario: '', googleId: null, source: 'mock' }))).slice(0, 5).map((r: any) => {
                const mapsUrl = r.googleId
                  ? `https://www.google.com/maps/place/?q=place_id:${r.googleId}`
                  : `https://www.google.com/maps/search/${encodeURIComponent(r.nombre)}`
                return (
                  <div key={r.id ?? r.nombre} className={styles.listItem}>
                    <span className={styles.listEmoji}>🍽</span>
                    <div className={styles.listInfo}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                        <div className={styles.listNombre}>{r.nombre}</div>
                      </a>
                      <div className={styles.listMeta}>
                        {r.tipo} · {r.distancia_m}m · {r.precio}
                        {r.reseñas > 0 && <span style={{ color:'#9a7848' }}> · {r.reseñas.toLocaleString('es')} reseñas</span>}
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
            <span className={styles.cardTitle}>🏨 Dónde dormir</span>
            <span className={styles.cardSrc}>{hoteles && hoteles.length > 0 ? 'Google Places · 2km' : 'Datos de ejemplo'}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.list}>
              {(hoteles && hoteles.length > 0 ? hoteles : MOCK_HOTELS.map(h => ({
                id: h.nombre, googleId: null, nombre: h.nombre, estrellas: h.estrellas,
                distancia_m: h.dist, rating: h.rating, reseñas: 0, precio: `${h.precio}€`,
                foto: null, website: null, telefono: null, source: 'mock'
              }))).map((h: any) => {
                const mapsUrl = h.googleId ? `https://www.google.com/maps/place/?q=place_id:${h.googleId}` : `https://www.google.com/maps/search/${encodeURIComponent(h.nombre)}`
                return (
                  <div key={h.id} className={styles.hotelItem}>
                    <div className={styles.hotelFoto} style={h.foto ? { backgroundImage:`url(${h.foto})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>{!h.foto && '🏨'}</div>
                    <div className={styles.listInfo}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                        <div className={styles.listNombre}>{h.nombre}</div>
                      </a>
                      <div className={styles.hotelStars}>{'★'.repeat(Math.min(h.estrellas,5))}{'☆'.repeat(Math.max(0,5-h.estrellas))}</div>
                      <div className={styles.listMeta}>{h.distancia_m}m{h.rating > 0 && <span> · {h.rating} ⭐ ({h.reseñas?.toLocaleString('es')})</span>}{h.precio && <span> · {h.precio}</span>}</div>
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
            <span className={styles.cardTitle}>✅ Servicios</span>
            <span className={styles.cardSrc}>MITECO</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.srvGrid}>
              {SERVICIOS.map(s => {
                const on = !!(playa as any)[s.key]
                return <span key={s.key} className={`${styles.srv} ${on ? styles.srvSi : styles.srvNo}`}>{on ? '✓' : '✗'} {s.label}</span>
              })}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className={styles.card} id="s-info">
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>ℹ️ Información</span>
            <span className={styles.cardSrc}>MITECO 2024</span>
          </div>
          <div className={styles.cardBody}>
            {playa.longitud    && <DataRow k="Longitud"      v={`${playa.longitud} m`}/>}
            {playa.anchura     && <DataRow k="Anchura media" v={`${playa.anchura} m`}/>}
            {playa.composicion && <DataRow k="Composición"   v={playa.composicion}/>}
            {playa.tipo        && <DataRow k="Tipo"          v={playa.tipo}/>}
            <DataRow k="Municipio"   v={playa.municipio}/>
            <DataRow k="Provincia"   v={playa.provincia}/>
            <DataRow k="Comunidad"   v={playa.comunidad}/>
            <DataRow k="Coordenadas" v={`${playa.lat}° N, ${playa.lng}° E`} mono/>
          </div>
        </div>
        <TextoSEO playa={playa} />

      </div>

      {/* ASIDE */}
      <aside className={styles.aside}>
        <div className={styles.asideCard}>
          <div className={styles.aeIlu}><IluEstado estado={meteo.estado} size="sm"/></div>
          <div className={styles.aeEstado} style={{ color: estado.dot }}>{estado.label}</div>
          <div className={styles.aeFrase}><em>{estado.frase}</em></div>
          <div className={styles.aePill}><span className={styles.aeDot} style={{ background: estado.dot }}/>Actualizado hace 1h</div>
          <div className={styles.aeQs}>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.agua}°C</span><span className={styles.aeQl}>💧 Agua</span></div>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.tempAire}°C</span><span className={styles.aeQl}>🌡 Aire</span></div>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.olas}m</span><span className={styles.aeQl}>🌊 Olas</span></div>
            <div className={styles.aeQ}><span className={styles.aeQv}>{meteo.viento}km/h</span><span className={styles.aeQl}>💨 Viento</span></div>
          </div>
        </div>
        <FichaAsideActions nombre={playa.nombre} lat={playa.lat} lng={playa.lng} slug={playa.slug} />
      </aside>
    </div>
  )
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
    <svg width="82" height="82" viewBox="0 0 82 82" style={{ flexShrink:0 }}>
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

function OleajeChart({ olas, oleajeHoras }: { olas: number; oleajeHoras?: OleajeHora[] | null }) {
  const datos = oleajeHoras ?? [
    { h:'Ahora', v: olas },
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
