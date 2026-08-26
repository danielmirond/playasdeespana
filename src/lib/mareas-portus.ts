// src/lib/mareas-portus.ts — Predicción OFICIAL de mareas, de Puertos del
// Estado, por municipio.
//
// Fuente: el mismo `portus` no documentado del que salen las boyas.
//   GET /portussvr/api/predData/portus/SEA_LEVEL_PLEABAJA/{id}?locale=es&cero=0
//   → pleamares y bajamares con hora y nivel (indicador 1 = pleamar, 0 = bajamar)
//   GET /portussvr/api/predData/portus/SEA_LEVEL/{id}?locale=es
//   → serie horaria: Nivel, Marea astronómica y Residuo meteorológico
// Sin clave. 916 ubicaciones (48 puertos, 241 localidades, 627 playas); el
// mapeo municipio → ubicación es offline (src/data/mareas-map.json, por
// centroide, generado por scripts/build-mareas-map.mjs).
//
// POR QUÉ ESTA Y NO LA ESTIMACIÓN LUNAR QUE YA TENÍAMOS. Medido hoy en
// Cádiz: la estimación lunar daba la pleamar a las 20:01 y la tabla
// armónica a las 20:40 — 39 minutos. Eso es la diferencia entre llegar a
// una playa de acceso por bajamar con la arena abierta o con el agua por la
// rodilla. Portus coincide con la tabla armónica AL MINUTO (Cádiz 14:20 y
// 20:40; Gijón 09:30 y 15:39).
//
// LAS HORAS VIENEN EN UTC. Sin esa conversión, Portus parecía ir dos horas
// por delante de todo el mundo. Se pasan a Europe/Madrid — o a
// Atlantic/Canary, que ya lo resuelve zonaHoraria().
//
// LO QUE ESTA FUENTE DA Y LOS COMPETIDORES NO: el nivel con corrección
// meteorológica. La serie separa «Marea» (astronómica) de «Residuo»
// (viento y presión). No es la tabla teórica del almanaque: es el agua que
// habrá. Y LO QUE NO DA: horizonte. Solo ~3 días, porque la corrección
// meteorológica no se predice a un mes. Una «tabla de mareas de agosto»
// necesita armónicos, que no tenemos; por eso la página es de hoy, mañana
// y pasado, y no un calendario.
//
// Certeza: OFICIAL. Trazo continuo y atribución visible a Puertos del Estado.
import { zonaHoraria } from './zona-horaria'
import mapa from '@/data/mareas-map.json'

export interface UbicacionMarea {
  id: number; nombre: string; tipo: 'Puerto' | 'Localidad' | 'Playa'
  d: number; zona: 'atlantico' | 'cantabrico' | 'mediterraneo' | 'canarias'
  municipio: string; provincia: string
}
const MAPA = mapa as Record<string, UbicacionMarea>

export interface Extremo {
  /** ISO con zona local ya aplicada */
  iso: string
  /** «HH:MM» en hora local de la costa */
  hora: string
  /** «YYYY-MM-DD» local */
  dia: string
  tipo: 'pleamar' | 'bajamar'
  /** metros sobre el cero del puerto */
  altura: number
}
export interface PuntoHora {
  iso: string; hora: string; dia: string
  nivel: number; astronomica: number; residuo: number
}
export interface MareasMunicipio {
  ubicacion: UbicacionMarea
  extremos: Extremo[]
  serie: PuntoHora[]
  /** Rango del primer ciclo completo, para decir «hoy sube 2,1 m» */
  rangoHoy: number | null
}

const API = 'https://portus.puertos.es/portussvr/api/predData/portus'

export function tieneMareas(slugMunicipio: string): boolean {
  return slugMunicipio in MAPA
}
export function ubicacionMareas(slugMunicipio: string): UbicacionMarea | null {
  return MAPA[slugMunicipio] ?? null
}

/** «2026-08-19 06:14:00.0» (UTC) → partes en la zona local de la costa */
function local(fechaUtc: string, tz: string) {
  const d = new Date(fechaUtc.replace(' ', 'T').replace(/\.0$/, '') + 'Z')
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d)
  const g = (t: string) => f.find(x => x.type === t)?.value ?? ''
  return { iso: d.toISOString(), dia: `${g('year')}-${g('month')}-${g('day')}`, hora: `${g('hour')}:${g('minute')}` }
}

function valor(fila: { datos: Array<{ nombreParametro: string; valor: string }> }, nombre: string): number | null {
  const v = fila.datos?.find(x => x.nombreParametro?.toLowerCase().startsWith(nombre.toLowerCase()))?.valor
  const n = v == null ? NaN : parseFloat(v)
  return Number.isFinite(n) ? n : null
}

// Memo de proceso DELANTE de KV, como las ocho fuentes de bandera. Sin él,
// en un entorno sin KV cada render paga el timeout interno del kv.set
// (1.500 ms) y la ficha, que espera como mucho 1.500 ms, pierde la carrera
// por un milisegundo: medido 1.502 ms en local. En producción KV responde
// en 10 ms y no pasa, pero no se diseña para «en producción irá bien».
const _memo = new Map<number, { t: number; p: Promise<MareasMunicipio | null> }>()
const MEMO_MS = 10 * 60 * 1000

export async function getMareasMunicipio(slugMunicipio: string, lat: number, lng: number): Promise<MareasMunicipio | null> {
  const ubi = MAPA[slugMunicipio]
  if (!ubi) return null
  const m = _memo.get(ubi.id)
  if (m && Date.now() - m.t < MEMO_MS) return m.p
  const p = cargarMareas(ubi, lat, lng)
  _memo.set(ubi.id, { t: Date.now(), p })
  p.then(v => { if (!v) _memo.delete(ubi.id) }).catch(() => _memo.delete(ubi.id))
  return p
}

async function cargarMareas(ubi: UbicacionMarea, lat: number, lng: number): Promise<MareasMunicipio | null> {
  const tz = zonaHoraria(lat, lng)
  try {
    // Una clave por ubicación y día; 30 min de TTL. La predicción se
    // regenera varias veces al día pero las horas de los extremos no
    // saltan entre pasadas.
    // Sin `kvCached`: los dos fetch de abajo son GET con `next.revalidate`
    // de 30 min, así que la Data Cache de Vercel los guarda sin gastar cuota
    // —y el memo de proceso de arriba evita repetirlos dentro del render—.
    // Ver `meteo.ts`: KV se reserva para POST y snapshots compartidos.
    return await (async () => {
      const cab = { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' }
      const [r1, r2] = await Promise.all([
        fetch(`${API}/SEA_LEVEL_PLEABAJA/${ubi.id}?locale=es&cero=0`, { headers: cab, signal: AbortSignal.timeout(6000), next: { revalidate: 1800 } }),
        fetch(`${API}/SEA_LEVEL/${ubi.id}?locale=es`, { headers: cab, signal: AbortSignal.timeout(6000), next: { revalidate: 1800 } }),
      ])
      if (!r1.ok) return null
      type Fila = { fecha: string; datos: Array<{ nombreParametro: string; valor: string }> }
      const ext = await r1.json() as Fila[]
      const extremos: Extremo[] = []
      for (const f of ext ?? []) {
        const ind = valor(f, 'indicador'); const niv = valor(f, 'nivel')
        if (ind == null || niv == null || !f.fecha) continue
        const l = local(f.fecha, tz)
        extremos.push({ ...l, tipo: ind >= 0.5 ? 'pleamar' : 'bajamar', altura: Math.round(niv * 100) / 100 })
      }
      if (!extremos.length) return null

      let serie: PuntoHora[] = []
      if (r2.ok) {
        const filas = await r2.json() as Fila[]
        for (const f of filas ?? []) {
          const n = valor(f, 'Nivel'); const a = valor(f, 'Marea'); const r = valor(f, 'Residuo')
          if (n == null || !f.fecha) continue
          serie.push({ ...local(f.fecha, tz), nivel: n, astronomica: a ?? n, residuo: r ?? 0 })
        }
      }
      // rango de hoy: pleamar más alta menos bajamar más baja del primer día
      const hoy = extremos[0].dia
      const deHoy = extremos.filter(e => e.dia === hoy)
      const ple = deHoy.filter(e => e.tipo === 'pleamar').map(e => e.altura)
      const baj = deHoy.filter(e => e.tipo === 'bajamar').map(e => e.altura)
      const rangoHoy = ple.length && baj.length ? Math.round((Math.max(...ple) - Math.min(...baj)) * 100) / 100 : null

      return { ubicacion: ubi, extremos, serie, rangoHoy }
    })()
  } catch (e) {
    // Se deja rastro: un null silencioso aquí costó una tarde de buscar el
    // fallo en el sitio equivocado. Solo en servidor y solo el mensaje.
    if (typeof window === 'undefined') console.warn('[mareas-portus]', ubi.id, (e as Error)?.message?.slice(0, 120))
    return null
  }
}
