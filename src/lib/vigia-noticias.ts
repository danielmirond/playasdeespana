// src/lib/vigia-noticias.ts — Vigía de cierres de playa en prensa.
//
// ESTO NO PUBLICA NADA. No toca la bandera de ninguna ficha, no entra en la
// cascada y no es una fuente de datos. Es un CONTROL DE CALIDAD: busca a
// diario noticias de cierres y las contrasta con lo que estamos diciendo
// nosotros, para detectar los huecos que no sabemos que tenemos.
//
// La distinción importa y decide todo el diseño. Como fuente de datos, un
// falso positivo pinta una bandera equivocada en una ficha. Como control, un
// falso positivo solo hace que alguien mire. Por eso aquí se puede ser
// generoso con lo que se recoge: el coste del error es leer un informe de
// más, no publicar un aviso falso.
//
// Por qué hace falta pese a tener ocho fuentes oficiales: las fuentes dan el
// COLOR, no la CAUSA, y sobre todo no cubren toda España. El 15 de agosto de
// 2026 Málaga prohibió el baño en seis playas por E. coli y nuestras fichas
// decían "BUENA". Hoy eso ya lo veríamos por la Junta — pero no sabemos qué
// ayuntamiento cerrará mañana una playa donde no tenemos feed.
//
// Canal: RSS de Google News. Sin clave, máquina-legible, y devuelve titular,
// medio y fecha. No se scrapea el cuerpo de ninguna noticia: solo titulares.
import { getPlayas } from './playas'

const RSS = 'https://news.google.com/rss/search'

// Consultas separadas a propósito, no una sola con muchos OR: cada una trae
// su propio ranking de Google y juntas cubren más que su suma.
const CONSULTAS = [
  '"prohibido el baño" playa',
  '"playas cerradas" OR "cierre de playas"',
  '"bandera roja" playa vertido OR contaminación OR "E. coli"',
  'playa cerrada medusas OR vertido OR bacterias',
]

// Sin una de estas, el titular no habla de un cierre. Filtra ruido como la
// noticia de política internacional que salía por «bandera roja».
const SENALES = /\b(prohib\w*|cerrad\w*|cierra\w*|cierre|clausur\w*|precint\w*|vertido|e\.?\s?coli|bacteri\w*|contaminaci\w*|medusa\w*|fecal\w*)/i

export interface Aviso {
  titular: string
  medio: string
  fecha: string
  /** Municipios de nuestro catálogo mencionados en el titular */
  municipios: string[]
}

function texto(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(xml)
  if (!m) return ''
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Titulares de cierre de las últimas 48 h, con los municipios de nuestro
 * catálogo que aparecen en ellos.
 */
export async function getAvisos(): Promise<Aviso[]> {
  const playas = await getPlayas()
  // Municipios costeros nuestros, normalizados. Se descartan los de nombre
  // muy corto: «Mao» o «Ea» aparecerían dentro de cualquier palabra.
  const municipios = new Map<string, string>()
  for (const p of playas) {
    const m = (p.municipio ?? '').trim()
    if (m.length >= 5) municipios.set(norm(m), m)
  }

  const vistos = new Set<string>()
  const avisos: Aviso[] = []

  for (const q of CONSULTAS) {
    try {
      const url = `${RSS}?q=${encodeURIComponent(`${q} when:2d`)}&hl=es&gl=ES&ceid=ES:es`
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
        cache: 'no-store',
      })
      if (!res.ok) continue
      const xml = await res.text()
      for (const item of xml.match(/<item>[\s\S]*?<\/item>/g) ?? []) {
        const titular = texto(item, 'title')
        if (!titular || vistos.has(titular)) continue
        if (!SENALES.test(titular)) continue
        const t = norm(titular)
        // El titular tiene que nombrar la playa o el municipio: sin eso no
        // hay nada que contrastar y solo añadiría ruido al informe.
        const encontrados: string[] = []
        for (const [clave, nombre] of municipios) {
          if (t.includes(clave)) encontrados.push(nombre)
        }
        if (!encontrados.length) continue
        vistos.add(titular)
        avisos.push({
          titular,
          medio: texto(item, 'source') || '—',
          fecha: texto(item, 'pubDate'),
          // Si un titular nombra varios, se queda con el más específico
          // (el nombre más largo suele ser el municipio real, no la provincia).
          municipios: encontrados.sort((a, b) => b.length - a.length).slice(0, 3),
        })
      }
    } catch { /* una consulta caída no tumba el vigía */ }
  }
  return avisos
}
