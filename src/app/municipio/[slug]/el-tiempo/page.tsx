// /municipio/[slug]/el-tiempo — Predicción meteorológica del municipio.
//
// POR QUÉ EXISTE. «El tiempo en X», «tiempo X mañana», «va a llover en X»
// son las consultas de meteo más volumétricas del turismo doméstico según
// GSC. Los tres competidores dominantes (tiempo.com, eltiempo.es y AEMET)
// venden solo meteo; nosotros lo cruzamos con el score de playas del
// mismo día — «con este tiempo, ¿a qué playa voy?» es la pregunta que la
// meteo aislada no responde y donde el sitio tiene inventario propio.
//
// POR QUÉ COLGANDO DE MUNICIPIO. La búsqueda va por localidad, no por
// costa ni provincia. Cuelga natural del municipio ya existente y hereda
// su autoridad.
//
// COBERTURA. Cualquier municipio del catálogo — la meteo es dato vivo,
// no depende del sidecar de POIs (que solo cubre ~25). Radar completo
// desde el primer día.
//
// LO QUE NO SE HACE:
//   • Sin prosa generada. La respuesta directa a «¿va a llover?» sale
//     de una regla mecánica sobre el forecast horario (ver
//     src/lib/tiempo-copy.ts).
//   • Sin invención cuando falta el dato: si Open-Meteo devuelve null,
//     `notFound()` y no se publica.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getMunicipios, getPlayasByMunicipio, getProvincias } from '@/lib/playas'
import { esCapitalHomonima } from '@/lib/geo-duplicadas'
import { getMeteoMunicipio, type MeteoMunicipio, type DiaTiempo } from '@/lib/meteo-municipio'
import {
  iconoDeWmo, textoDeWmo, etiquetaUv, etiquetaViento,
  respuestaLluvia, diaCorto, diaMes, diaLegible, soloHora, duracionHM,
} from '@/lib/tiempo-copy'
import IconoTiempo from '@/components/ui/IconoTiempo'
import { getMareas } from '@/lib/marine'
import { veredictoDia, mejorDia, type VeredictoDia } from '@/lib/dia-playa'
import { exposicionOleaje } from '@/lib/seguridad'
import { tieneMareas, ubicacionMareas } from '@/lib/mareas-portus'
import { tienePois } from '@/lib/municipio-pois'
import { getAvisos, type AvisoMeteo } from '@/lib/meteoalarm'
import { comunidadDe, comunidadParaAvisos } from '@/lib/comunidad'
import DelMunicipio from '@/components/ui/DelMunicipio'
import Hueco from '@/components/ui/Hueco'
import { SLOTS } from '@/lib/adsense'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'

export const maxDuration = 30
export const revalidate = 3600      // el forecast cambia cada hora

interface Props { params: Promise<{ slug: string }> }

// El coste real es Open-Meteo (500-1200 ms + Data Cache), no CPU. No
// pre-renderizamos nada; ISR bajo demanda para no gastar build minutes en
// municipios sin tráfico.
export function generateStaticParams() { return [] }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Con 1 playa basta: el tiempo no depende de cuántas playas tenga el
  // pueblo. Con el mínimo de 4 de la página raíz se quedaban fuera 444
  // municipios, y «el tiempo en X» se busca igual en los pequeños.
  const municipios = await getMunicipios(1)
  const m = municipios.find(x => x.slug === slug)
  if (!m) return {}
  // Igual que la raíz: si el nombre choca con el de SU PROVINCIA (Cádiz,
  // Málaga…) desambiguamos con «capital».
  //
  // La lista tiene que ser de provincias. Con la de municipios el slug se
  // encuentra a sí mismo y la condición es siempre cierta: el título decía
  // «El tiempo en Torrevieja capital» y «en Gijón capital», que no son
  // capitales de nada.
  const homonima = esCapitalHomonima(slug, (await getProvincias()).map(x => x.slug))
  const comoSeLlama = homonima ? `${m.nombre} capital` : m.nombre
  return {
    // «El tiempo en X» a secas lo gana el widget de Google; lo nuestro es el
    // veredicto de playa. Sin la respuesta en el título: regla de casa.
    title: `El tiempo en las playas de ${comoSeLlama}: qué día ir esta semana`,
    description: `Si hace día de playa hoy en ${comoSeLlama} y qué día de la semana es el mejor: viento con nombre, olas, lluvia y agua, con las playas más abrigadas según sople.`,
    alternates: { canonical: `/municipio/${slug}/el-tiempo` },
  }
}

// —————————————————————————————————————————————————————————————
// Sub-componentes de sección
// —————————————————————————————————————————————————————————————

function BloqueAhora({ meteo, actualizado }: { meteo: MeteoMunicipio['actual']; actualizado: string }) {
  const tipo = iconoDeWmo(meteo.wmo)
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
      }}>Ahora · {actualizado}</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
        color: 'var(--ink)', marginBottom: '.7rem', lineHeight: 1.15,
      }}>En este momento</h2>
      <div style={{
        border: '1px solid var(--line)', borderRadius: 10,
        background: 'var(--surface)', padding: '1.25rem 1.4rem',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 12vw, 4.5rem)',
            fontWeight: 700, lineHeight: 1, letterSpacing: '-.03em', color: 'var(--ink)',
            display: 'flex', alignItems: 'baseline', gap: '.1rem',
          }}>
            {meteo.temp}
            <span style={{ fontSize: '.5em', color: 'var(--muted)', fontWeight: 500 }}>°C</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500,
            fontSize: '1.05rem', color: 'var(--accent)', marginTop: '.3rem',
          }}>
            {textoDeWmo(meteo.wmo)}, sensación de {meteo.sensacion}°
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '.35rem .9rem',
            marginTop: '.6rem', fontSize: '.82rem', color: 'var(--muted)',
          }}>
            <span>Viento <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{meteo.viento_kmh} km/h {etiquetaViento(meteo.viento_kmh)}</strong></span>
            {meteo.uv != null && <span>UV <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{meteo.uv} {etiquetaUv(meteo.uv)}</strong></span>}
            <span>Humedad <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{meteo.humedad}%</strong></span>
            {meteo.presion != null && <span>Presión <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{meteo.presion} hPa</strong></span>}
          </div>
        </div>
        <IconoTiempo tipo={tipo} size={96} />
      </div>
    </section>
  )
}

function GraficoHoras({ hoy }: { hoy: MeteoMunicipio['hoy'] }) {
  if (hoy.length < 6) return null

  // Rango de temperaturas para escala en Y. Ampliamos ±1° para que la
  // curva no toque los bordes del área de dibujo.
  const temps = hoy.map(h => h.temp)
  const tMin = Math.min(...temps) - 1
  const tMax = Math.max(...temps) + 1
  const rango = Math.max(1, tMax - tMin)

  // Coords del gráfico
  const W = 720, H = 160
  const PADX = 40, PADY = 20
  const drawW = W - 2 * PADX
  const drawH = H - PADY - 30           // 30 abajo para etiquetas X

  const x = (i: number) => PADX + (i / (hoy.length - 1)) * drawW
  const y = (t: number) => PADY + (1 - (t - tMin) / rango) * drawH

  const puntos = hoy.map((h, i) => `${x(i)},${y(h.temp)}`).join(' ')

  // Curva Bezier suave: por simplicidad usamos polyline; la diferencia
  // visual a 720 px de ancho es mínima y el código es la mitad.
  const ahoraMs = Date.now()
  const idxAhora = hoy.findIndex(h => new Date(h.iso).getTime() >= ahoraMs)
  const xAhora = idxAhora >= 0 ? x(idxAhora) : -1

  // Horas de referencia en el eje X: 03, 06, 09, 12, 15, 18, 21.
  const marcas = [3, 6, 9, 12, 15, 18, 21]
    .map(h => ({ h, i: hoy.findIndex(x => x.hora === h) }))
    .filter(m => m.i >= 0)

  // Máxima probabilidad de lluvia entre las horas visibles, para el pie.
  const maxProb = hoy.reduce((m, h) => Math.max(m, h.prob_lluvia), 0)

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
      }}>Hoy por horas</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
        color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
      }}>Temperatura y lluvia hora a hora</h2>
      <div style={{
        border: '1px solid var(--line)', borderRadius: 8,
        padding: '1rem 1.25rem 1.25rem', background: 'var(--surface)',
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img"
             style={{ display: 'block', width: '100%', height: 'auto' }}
             aria-label={`Temperatura hora a hora hoy, entre ${Math.round(tMin + 1)}° y ${Math.round(tMax - 1)}°. Probabilidad máxima de lluvia ${maxProb} %.`}>
          {/* Eje Y y X */}
          <line x1={PADX} y1={PADY - 10} x2={PADX} y2={H - 30} stroke="var(--line-strong)" strokeWidth=".75"/>
          <line x1={PADX} y1={H - 30} x2={W - 10} y2={H - 30} stroke="var(--line-strong)" strokeWidth=".75"/>
          {/* Grid horizontal ligero */}
          <g stroke="var(--line)" strokeWidth=".5">
            <line x1={PADX} y1={y(tMax - 1)} x2={W - 10} y2={y(tMax - 1)} />
            <line x1={PADX} y1={y((tMin + tMax) / 2)} x2={W - 10} y2={y((tMin + tMax) / 2)} />
            <line x1={PADX} y1={y(tMin + 1)} x2={W - 10} y2={y(tMin + 1)} />
          </g>
          {/* Etiquetas Y */}
          <g fontFamily="var(--font-mono, monospace)" fontSize="9" fill="var(--muted)">
            <text x={PADX - 6} y={y(tMax - 1) + 3} textAnchor="end">{Math.round(tMax - 1)}°</text>
            <text x={PADX - 6} y={y((tMin + tMax) / 2) + 3} textAnchor="end">{Math.round((tMin + tMax) / 2)}°</text>
            <text x={PADX - 6} y={y(tMin + 1) + 3} textAnchor="end">{Math.round(tMin + 1)}°</text>
          </g>
          {/* Curva */}
          <polyline points={puntos} fill="none" stroke="var(--sun, #d48a1a)"
                    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Marcador AHORA */}
          {xAhora > 0 && (
            <>
              <line x1={xAhora} y1={PADY - 10} x2={xAhora} y2={H - 30}
                    stroke="var(--ink)" strokeWidth=".8" strokeDasharray="3 3" opacity=".5"/>
              <circle cx={xAhora} cy={y(hoy[idxAhora].temp)} r="4"
                      fill="var(--sun, #d48a1a)" stroke="var(--surface)" strokeWidth="2"/>
              <text x={xAhora} y={H - 15} textAnchor="middle"
                    fontFamily="var(--font-mono, monospace)" fontSize="9" fill="var(--ink)" fontWeight="600">
                ahora
              </text>
            </>
          )}
          {/* Etiquetas X */}
          <g fontFamily="var(--font-mono, monospace)" fontSize="9" fill="var(--muted)">
            {marcas.map(m => (
              <text key={m.h} x={x(m.i)} y={H - 15} textAnchor="middle">
                {String(m.h).padStart(2, '0')}h
              </text>
            ))}
          </g>
        </svg>
        <div style={{
          display: 'flex', gap: '1.25rem', fontSize: '.72rem',
          color: 'var(--muted)', marginTop: '.5rem', justifyContent: 'center',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
            <i style={{ width: 12, height: 3, borderRadius: 2, display: 'inline-block', background: 'var(--sun, #d48a1a)' }}/>
            Temperatura
          </span>
          <span style={{ opacity: .7 }}>
            Prob. máx. de lluvia hoy · {maxProb}%
          </span>
        </div>
      </div>
    </section>
  )
}

const COLOR_NIVEL = { bueno: 'var(--excelente)', regular: 'var(--aceptable)', malo: 'var(--noapto)' } as const

// La respuesta antes que los grados: «¿Hace día de playa hoy?» en grande,
// con el porqué, y debajo los 7 días como calendario de playa y el mejor.
function BloqueVeredicto({ hoy, veredictos, mejor, nombre }: {
  hoy: VeredictoDia; veredictos: VeredictoDia[]; mejor: VeredictoDia | null; nombre: string
}) {
  return (
    <section style={{ marginBottom: '2.25rem' }}>
      <div data-speakable style={{
        padding: '1.1rem 1.25rem', borderLeft: `3px solid ${COLOR_NIVEL[hoy.nivel]}`,
        background: 'var(--surface)', borderRadius: 3, marginBottom: '1rem',
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)', fontSize: '1rem', marginBottom: '.25rem' }}>
          ¿Hace día de playa hoy en {nombre}?
        </div>
        <div style={{ fontSize: '1.05rem', color: 'var(--ink)', lineHeight: 1.5 }}>
          <b style={{ color: COLOR_NIVEL[hoy.nivel] }}>{hoy.titulo}</b>: {hoy.motivo}.
        </div>
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 .75rem', display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '.35rem' }}>
        {veredictos.map((v, i) => (
          <li key={v.fecha} title={v.motivo} style={{
            textAlign: 'center', padding: '.55rem .2rem', borderRadius: 6,
            border: `1px solid ${mejor?.fecha === v.fecha ? COLOR_NIVEL.bueno : 'var(--line)'}`,
            background: 'var(--surface)',
          }}>
            <div style={{ fontSize: '.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{i === 0 ? 'Hoy' : diaCorto(v.fecha)}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: COLOR_NIVEL[v.nivel], fontSize: '.95rem', marginTop: '.15rem' }}>{v.titulo}</div>
            <div style={{ fontSize: '.62rem', color: 'var(--muted)', marginTop: '.2rem', lineHeight: 1.3 }}>{v.motivo.split(' · ')[0]}</div>
          </li>
        ))}
      </ol>
      <p style={{ margin: 0, fontSize: '.95rem', lineHeight: 1.55, color: 'var(--ink)' }}>
        {!mejor
          ? <>Ninguno de los próximos {veredictos.length} días pinta bien para la playa.</>
          : mejor.nivel === 'bueno'
            ? <><b>El mejor día es {mejor.fecha === veredictos[0].fecha ? 'hoy' : diaLegible(mejor.fecha)}</b>: {mejor.motivo}.</>
            : <><b>Ningún día es redondo; el menos malo, {mejor.fecha === veredictos[0].fecha ? 'hoy' : diaLegible(mejor.fecha)}</b>, con {mejor.motivo}.</>}
      </p>
    </section>
  )
}

function TarjetasSieteDias({ dias }: { dias: DiaTiempo[] }) {
  if (!dias.length) return null
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
      }}>Los próximos días</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
        color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
      }}>
        Predicción a <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{dias.length} días</em>
      </h2>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'grid', gap: '.35rem',
        gridTemplateColumns: `repeat(${Math.min(dias.length, 7)}, minmax(0, 1fr))`,
      }}>
        {dias.map((d, i) => (
          <li key={d.fecha} style={{
            border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--line)'}`,
            background: i === 0
              ? 'color-mix(in srgb, var(--accent) 5%, var(--surface))'
              : 'var(--surface)',
            borderRadius: 8, padding: '.7rem .35rem .8rem',
            textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '.25rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: '.62rem',
              textTransform: 'uppercase', letterSpacing: '.14em',
              color: i === 0 ? 'var(--accent)' : 'var(--muted)',
              fontWeight: i === 0 ? 500 : 400,
            }}>{diaCorto(d.fecha)}</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1,
            }}>{diaMes(d.fecha)}</span>
            <IconoTiempo tipo={iconoDeWmo(d.wmo)} size={30} />
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.05rem',
              fontWeight: 700, color: 'var(--ink)', lineHeight: 1,
            }}>{d.temp_max}°</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '.8rem',
              color: 'var(--muted)', lineHeight: 1,
            }}>{d.temp_min}°</span>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: '.58rem',
              letterSpacing: '.05em',
              color: d.prob_lluvia === 0 ? 'var(--muted)' : 'var(--rain, #4a7a90)',
              opacity: d.prob_lluvia === 0 ? .5 : 1,
              marginTop: '.1rem',
            }}>{d.prob_lluvia === 0 ? '0 mm' : `${d.prob_lluvia}%`}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Colores del sistema para cada nivel — ya definidos como tokens en el
// tema global (bloques amarillo/naranja/rojo con contraste suficiente).
const NIVEL_TOKEN: Record<AvisoMeteo['nivel'], { color: string; label: string }> = {
  yellow: { color: 'var(--alert-amber, #c48a1e)', label: 'Amarillo' },
  orange: { color: 'var(--alert-orange, #a04818)', label: 'Naranja' },
  red:    { color: 'var(--alert-red, #7a2818)', label: 'Rojo' },
}

function BloqueAvisos({ avisos, comunidad }: { avisos: AvisoMeteo[]; comunidad: string }) {
  if (avisos.length === 0) return null
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
      }}>Meteoalarm · Avisos oficiales</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
        color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
      }}>
        Avisos activos en <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{comunidad}</em>
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {avisos.map((a, i) => {
          const t = NIVEL_TOKEN[a.nivel]
          const desde = a.desde ? new Date(a.desde) : null
          const hasta = a.hasta ? new Date(a.hasta) : null
          return (
            <li key={`${a.desde}-${a.tipo}-${i}`} style={{
              padding: '.85rem 1rem',
              borderRadius: 6,
              display: 'flex', alignItems: 'baseline', gap: '.75rem',
              marginBottom: '.4rem',
              borderLeft: `4px solid ${t.color}`,
              background: `color-mix(in srgb, ${t.color} 8%, var(--surface))`,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)', fontSize: '.62rem',
                textTransform: 'uppercase', letterSpacing: '.1em',
                padding: '.1rem .5rem', borderRadius: 100,
                background: t.color, color: '#fff', flexShrink: 0,
              }}>{t.label}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  color: 'var(--ink)', fontSize: '.95rem',
                }}>{a.tipoLabel}</div>
                {(desde || hasta) && (
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.1rem' }}>
                    {desde ? formatearRango(desde, hasta) : ''}
                  </div>
                )}
                {a.descripcion && (
                  <div style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.2rem' }}>
                    {a.descripcion}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.6rem', lineHeight: 1.5 }}>
        Los avisos son de <strong>Meteoalarm</strong> y aplican al conjunto de {comunidad} (nivel NUTS 2, no municipal). Comprueba <a href="https://www.aemet.es/es/eltiempo/prediccion/avisos" target="_blank" rel="noopener nofollow" style={{ color: 'var(--muted)', borderBottom: '1px dotted currentColor' }}>AEMET</a> para el detalle por provincia.
      </p>
    </section>
  )
}

function formatearRango(desde: Date, hasta: Date | null): string {
  const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const fmt = (d: Date) => `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (!hasta) return `desde ${fmt(desde)}`
  return `${fmt(desde)} → ${fmt(hasta)}`
}

function BloqueSol({ hoy }: { hoy: DiaTiempo }) {
  if (!hoy?.amanecer || !hoy?.atardecer) return null
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
      }}>Sol de hoy</div>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
        color: 'var(--ink)', marginBottom: '.9rem', lineHeight: 1.15,
      }}>Amanece, atardece</h2>
      <div style={{
        padding: '1rem 1.25rem', border: '1px solid var(--line)',
        borderRadius: 8, background: 'var(--surface)',
        display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)', fontSize: '.62rem',
            textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--muted)',
            marginBottom: '.3rem',
          }}>Amanece</div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 700,
            fontSize: '1.15rem', color: 'var(--ink)', lineHeight: 1,
          }}>{soloHora(hoy.amanecer)}</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)', fontSize: '.62rem',
            textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--muted)',
            marginBottom: '.3rem',
          }}>Atardece</div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 700,
            fontSize: '1.15rem', color: 'var(--ink)', lineHeight: 1,
          }}>{soloHora(hoy.atardecer)}</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)', fontSize: '.62rem',
            textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--muted)',
            marginBottom: '.3rem',
          }}>Horas de luz</div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 700,
            fontSize: '1.15rem', color: 'var(--ink)', lineHeight: 1,
          }}>{duracionHM(hoy.amanecer, hoy.atardecer)}</div>
        </div>
      </div>
    </section>
  )
}

// —————————————————————————————————————————————————————————————
// Página
// —————————————————————————————————————————————————————————————

export default async function ElTiempoPage({ params }: Props) {
  const { slug } = await params
  const municipios = await getMunicipios(1)     // ver generateMetadata
  const municipio = municipios.find(m => m.slug === slug)
  if (!municipio) notFound()
  // La página raíz sí exige 4 playas: sin ella, el nombre en la miga y el
  // enlace «todas las playas» van a la ficha de la playa única, no a un 404.
  const tienePaginaMuni = municipios.some(m => m.slug === slug && m.count >= 4)

  // Necesitamos coordenadas para llamar a Open-Meteo. `getMunicipios()`
  // no las lleva —solo nombre y conteos—; el centroide sale del promedio
  // de las playas del municipio, que es lo que ya usan la página raíz y
  // el mapa. Sin playas en el catálogo no publicamos: mejor 404 que meteo
  // sin ancla geográfica.
  const playas = await getPlayasByMunicipio(slug)
  if (playas.length === 0) notFound()
  const enlaceMuni = tienePaginaMuni ? `/municipio/${slug}` : `/playas/${playas[0].slug}`
  const enlaces = await enlacesMunicipio(slug, municipio.nombre)
  const lat = playas.reduce((a, p) => a + p.lat, 0) / playas.length
  const lng = playas.reduce((a, p) => a + p.lng, 0) / playas.length

  const meteo = await getMeteoMunicipio(lat, lng)
  // Sin datos, notFound: mejor no publicar que publicar valores placebo.
  if (!meteo) notFound()

  // «Málaga capital» cuando la ciudad se llama igual que su provincia: la
  // lista es de PROVINCIAS, ver el comentario de generateMetadata.
  const esCapital = esCapitalHomonima(slug, (await getProvincias()).map(x => x.slug))
  const nombreH1 = esCapital ? `${municipio.nombre} capital` : municipio.nombre
  const provinciaSlug = municipio.provinciaSlug

  // Veredicto por día. El oleaje viene de la llamada marina (5 días) y puede
  // faltar: entonces se juzga con viento y lluvia, y se dice menos.
  const mar = await getMareas(lat, lng)
  const veredictos: VeredictoDia[] = meteo.dias.map((d, i) =>
    veredictoDia(d, mar?.forecast[i]?.olas_max ?? null, lat, lng))
  const hoyV = veredictos[0]
  const mejor = mejorDia(veredictos)

  // Qué playas quedan a resguardo con el viento del día. Antes aquí había un
  // «score /100» calculado con un seed del slug: números inventados con
  // aspecto de medición. Fuera. Esto sale de la orientación de cada playa
  // frente al viento dominante, la misma regla que corrige la bandera
  // estimada en las fichas. Solo tiene sentido cuando el viento molesta.
  const dirHoy = meteo.dias[0]?.viento_dir ?? null
  const ventoso = (meteo.dias[0]?.viento_max ?? 0) >= 20 && dirHoy != null
  const abrigadas = ventoso
    ? playas.filter(p => exposicionOleaje(p.lat, p.lng, dirHoy).abrigada).slice(0, 5)
    : []

  // Respuesta directa — copy mecánico
  const respuesta = respuestaLluvia(meteo.hoy, meteo.dias, nombreH1)

  // FAQPage schema con la pregunta que se ve. Regla del proyecto: el
  // schema no dice más de lo que el HTML muestra.
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Hace día de playa hoy en ${nombreH1}?`,
        acceptedAnswer: { '@type': 'Answer', text: `${hoyV.titulo}: ${hoyV.motivo}.` },
      },
      {
        '@type': 'Question',
        name: `¿Qué día es mejor para ir a la playa en ${nombreH1} esta semana?`,
        acceptedAnswer: { '@type': 'Answer', text: mejor
          ? (mejor.nivel === 'bueno' ? `${diaLegible(mejor.fecha)}: ${mejor.motivo}.` : `Ningún día es redondo; el menos malo es ${diaLegible(mejor.fecha)}, con ${mejor.motivo}.`)
          : `Ninguno de los próximos ${veredictos.length} días pinta bien para la playa en ${nombreH1}.` },
      },
      {
        '@type': 'Question',
        name: `¿Va a llover hoy en ${nombreH1}?`,
        acceptedAnswer: { '@type': 'Answer', text: respuesta },
      },
    ],
  }

  const [hayPois, hayMar, avisos] = await Promise.all([
    tienePois(slug),
    Promise.resolve(tieneMareas(slug)),
    // Con «España» en el dato, Meteoalarm no encontraba código NUTS y las
    // 148 playas valencianas y orensanas se quedaban sin avisos.
    getAvisos(comunidadParaAvisos(municipio.comunidad, municipio.provincia)),
  ])
  const marMediterraneo = hayMar && ubicacionMareas(slug)?.zona === 'mediterraneo'

  // Hora local del municipio para el eyebrow «Ahora · HH:MM». Sale del ISO
  // de la primera muestra horaria: Open-Meteo la devuelve en zona local
  // del municipio, así que aquí sacamos la hora exacta sin adivinarla.
  const actualizado = (() => {
    const ms = Date.now()
    const proximo = meteo.hoy.find(h => new Date(h.iso).getTime() >= ms) ?? meteo.hoy[meteo.hoy.length - 1]
    return proximo ? soloHora(proximo.iso) : '—:—'
  })()

  return (
    <>
      <Nav />
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <div style={{ borderBottom: '1px solid var(--line)', padding: '2rem 1.5rem 2.25rem' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <nav aria-label="Ruta de navegación" style={{
            fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.85rem',
            display: 'flex', flexWrap: 'wrap', gap: '.35rem',
          }}>
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            {/* Sin comunidad cuando el dato no dice nada: ver lib/comunidad. */}
            {(() => { const com = comunidadDe(municipio.comunidad, municipio.provincia); return com && (
              <>
                <Link href={`/comunidad/${com.slug}`}>{com.nombre}</Link>
                <span aria-hidden="true">›</span>
              </>
            ) })()}
            {provinciaSlug && (
              <>
                <Link href={`/provincia/${provinciaSlug}`}>{municipio.provincia}</Link>
                <span aria-hidden="true">›</span>
              </>
            )}
            {tienePaginaMuni
              ? <Link href={`/municipio/${slug}`}>{municipio.nombre}</Link>
              : <span>{municipio.nombre}</span>}
            <span aria-hidden="true">›</span>
            <span aria-current="page">El tiempo</span>
          </nav>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.85rem, 5vw, 2.4rem)',
            fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1, color: 'var(--ink)',
            marginBottom: '.3rem',
          }}>
            El tiempo en las playas de <em style={{ fontWeight: 500, color: 'var(--accent)', fontStyle: 'italic' }}>{nombreH1}</em>
          </h1>
          <p style={{
            fontSize: '1rem', color: 'var(--muted)',
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500,
            margin: 0,
          }}>si hace día de playa hoy, y qué día ir esta semana</p>
        </div>
      </div>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '2.5rem 1.5rem 3rem' }}>

        <BloqueVeredicto hoy={hoyV} veredictos={veredictos} mejor={mejor} nombre={nombreH1} />

        <BloqueAhora meteo={meteo.actual} actualizado={actualizado} />

        {/* Respuesta directa: schema arriba dice esto, HTML lo repite. */}
        <section style={{ marginBottom: '2rem' }}>
          <div data-speakable style={{
            padding: '1.1rem 1.25rem',
            borderLeft: '3px solid var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 5%, var(--surface))',
            borderRadius: 3,
          }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)',
              fontSize: '1rem', marginBottom: '.25rem',
            }}>
              ¿Va a llover hoy en {nombreH1}?
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              {respuesta}
            </div>
          </div>
        </section>

        {/* Avisos oficiales — se pintan antes del gráfico horario porque
            son información de seguridad y no un adorno. Cuando no hay,
            no hay bloque; nada de «sin avisos activos», que es paja. */}
        <BloqueAvisos avisos={avisos} comunidad={comunidadParaAvisos(municipio.comunidad, municipio.provincia)} />

        <GraficoHoras hoy={meteo.hoy} />
        <TarjetasSieteDias dias={meteo.dias} />
        {/* Zona herramienta: después de la predicción a 7 días, que es lo
            que se viene a consultar. Nunca antes del veredicto. */}
        <Hueco zona="herramienta" bloque={SLOTS.herramienta} />
        <BloqueSol hoy={meteo.dias[0]} />

        {/* Con viento, qué playas quedan a resguardo. Sin viento no hay
            bloque: no hay nada que recomendar. */}
        {ventoso && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem',
            }}>Con el viento de hoy</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: '.5rem', lineHeight: 1.15,
            }}>
              {abrigadas.length ? <>Las playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>más abrigadas</em></> : <>Hoy no hay playa abrigada</>}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '.85rem', lineHeight: 1.55 }}>
              {hoyV.viento ? `Sopla ${hoyV.viento}` : 'Sopla viento'} a {meteo.dias[0].viento_max} km/h.{' '}
              {abrigadas.length
                ? 'Estas dan la espalda a ese viento por cómo está orientada su costa; el resto lo reciben de frente.'
                : `Ninguna playa de ${municipio.nombre} queda claramente a resguardo de ese viento: mejor esperar a que amaine o mirar en el municipio de al lado.`}
            </p>
            {abrigadas.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
                {abrigadas.map(p => (
                  <li key={p.slug} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '.7rem .9rem', background: 'var(--surface)' }}>
                    <Link href={`/playas/${p.slug}`} style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px dotted var(--muted)' }}>{p.nombre}</Link>
                    {p.socorrismo && <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '.6rem' }}>Socorrismo</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <Hueco zona="cierre" bloque={SLOTS.cierre} />

        <DelMunicipio nombre={municipio.nombre} enlaces={enlaces} actual="elTiempo" />

        <p style={{
          marginTop: '2.5rem', paddingTop: '1.5rem',
          borderTop: '1px solid var(--line)', fontSize: '.74rem',
          color: 'var(--muted)', lineHeight: 1.55,
        }}>
          Datos meteorológicos de <strong style={{ color: 'var(--ink)' }}>Open-Meteo</strong>
          {' '}(predicción horaria y a {meteo.dias.length} días, cacheada 1&nbsp;h en la Data Cache
          de Vercel). Amanecer y atardecer con corrección de refracción atmosférica.
          {' '}<em>Próxima jornada con lluvia probable</em>: {(() => {
            const p = meteo.dias.slice(1).find(d => d.prob_lluvia >= 40)
            return p ? `${diaLegible(p.fecha)} (${p.prob_lluvia} % de probabilidad).` : 'ninguna en los próximos días.'
          })()}
        </p>

      </main>
    </>
  )
}
