// src/lib/banderas-ferrol.ts — Bandera izada en las playas de Ferrol.
//
// La única fuente pública de bandera que existe en toda Galicia. El resto de
// la comunidad —A Coruña, Vigo, Sanxenxo incluidos— no publica nada
// máquina-legible, y Náyade tiene las 506 zonas gallegas «Sin Calificar»
// desde septiembre de 2025. Nueve playas son pocas; son las únicas que hay.
//
// La fuente es peculiar y conviene saberlo: el Concello mantiene un **Google
// My Maps público** y reparte el mismo parte por WhatsApp. Se llega por el
// `mid` que está a la vista en el HTML de la portada de ferrol.gal. Ojo: la
// página /praias enlaza un My Maps ANTIGUO que da 404; el bueno es este.
//
// EL COLOR VA EN EL HEXADECIMAL DEL styleUrl, no en el texto. Un parseo que
// buscara la palabra "vermella" no encontraría nada. Y `DB4436` NO es rojo
// de bandera: es la capa estática de Bandeira Azul, seis placemarks que hay
// que ignorar o marcaríamos media ciudad en rojo.
//
// Sin timestamp: el KML no lleva fecha. La frescura se infiere de que la
// descripción trae el mar y el viento del día. Según el Concello el primer
// parte sale al abrir el servizo. No afirmamos hora porque no la tenemos.
//
// Licencia: no declarada (My Maps público del Concello de Ferrol).
import type { BanderaPlaya } from './seguridad'
import { kvCached } from './kv-cache'
import mapa from '@/data/banderas-ferrol-map.json'

const MAPA = mapa as Record<string, string>          // nombre en el KML → slug
const POR_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(MAPA).map(([n, s]) => [s, n]),
)

const URL_KML = 'https://www.google.com/maps/d/kml?mid=1_oIncYJeLUc-7Sw9v1IvU1DSy3z8kVk&forcekml=1'

// Solo estos cuatro son bandera. DB4436 (Bandeira Azul) queda fuera a propósito.
const COLORES: Record<string, 'verde' | 'amarilla' | 'roja'> = {
  '0F9D58': 'verde', '558B2F': 'verde', 'FFEA00': 'amarilla', 'FF5252': 'roja',
}

export interface EstadoOficialFerrol {
  bandera: BanderaPlaya | null
  /** «Mar: rizada · Ceo: despexado · Vento: frouxo», tal cual lo escribe el socorrismo */
  detalle: string | null
}

export function tieneBanderaFerrol(slug: string): boolean {
  return slug in POR_SLUG
}

let _snap: { hoy: string; p: Promise<Record<string, { color: string; desc: string }>> } | null = null

async function getSnapshot() {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  if (_snap?.hoy === hoy) return _snap.p
  const p = cargar(hoy)
  _snap = { hoy, p }
  p.catch(() => { if (_snap?.p === p) _snap = null })
  return p
}

async function cargar(hoy: string) {
  return kvCached('banderas-ferrol', [hoy], 900, async () => {
    const res = await fetch(URL_KML, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const kml = await res.text()
    const out: Record<string, { color: string; desc: string }> = {}
    for (const pm of kml.match(/<Placemark>[\s\S]*?<\/Placemark>/g) ?? []) {
      const nombre = /<name>([^<]*)<\/name>/.exec(pm)?.[1]?.trim()
      const hex = /<styleUrl>#icon-\d+-([0-9A-F]{6})/.exec(pm)?.[1]
      if (!nombre || !hex || !COLORES[hex]) continue
      const desc = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(pm)?.[1] ?? ''
      out[nombre] = {
        color: COLORES[hex],
        // El texto viene con emojis y <br>. Se limpia a una línea legible.
        desc: desc.replace(/<[^>]+>/g, ' · ').replace(/\s+/g, ' ')
          .replace(/\s*·\s*·\s*/g, ' · ').replace(/^[\s·]+|[\s·]+$/g, ''),
      }
    }
    return out
  })
}

export async function getBanderaFerrol(slug: string): Promise<EstadoOficialFerrol | null> {
  const nombre = POR_SLUG[slug]
  if (!nombre) return null
  try {
    const snap = await getSnapshot()
    const f = snap[nombre]
    if (!f) return null
    const attr = '(Concello de Ferrol)'
    const bandera: BanderaPlaya =
      f.color === 'roja'
        ? { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
            motivo: `Bandera oficial izada hoy — baño prohibido ${attr}`,
            motivoEn: 'Official flag flying today — no swimming', hex: '#ef4444' }
        : f.color === 'amarilla'
          ? { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
              motivo: `Bandera oficial izada hoy ${attr}`,
              motivoEn: 'Official flag flying today', hex: '#f59e0b' }
          : { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
              motivo: `Bandera oficial izada hoy en la playa ${attr}`,
              motivoEn: 'Official flag flying today', hex: '#22c55e' }
    return { bandera, detalle: f.desc || null }
  } catch {
    return null
  }
}
