// src/lib/vientos.ts — El nombre del viento, que es como lo llama la gente.
//
// La rejilla del hero decía «viento 13 km/h». Un 13 no dice nada; «levante
// 13 km/h» en Tarifa lo dice todo, y «tramontana» en el Empordà decide si
// vas a la playa o no. Los nombres no son decoración: son el vocabulario
// con el que cada costa decide su día.
//
// LO IMPORTANTE: el nombre depende de la COSTA, no solo del rumbo. El
// mismo viento del nordeste es tramontana en Girona, gregal en Valencia,
// nordés en Galicia y nada especial en Cádiz. Así que esto no es una tabla
// de 16 rumbos: es rumbo × región. Y solo se nombra lo que tiene nombre
// local —el resto se queda en el rumbo («del oeste»), que es honesto y no
// finge un folclore que no existe.
//
// SOLO A PARTIR DE CIERTA FUERZA. La tramontana a 5 km/h no es tramontana,
// es brisa. El nombre aparece cuando el viento molesta: ≥ 20 km/h para los
// que traen arena y ola (levante, tramontana, mistral, cierzo en el delta),
// ≥ 25 para los demás. Por debajo, solo el rumbo.
//
// Y el «molesta» de cada uno es distinto y se dice: el levante levanta
// arena y mar de fondo; la tramontana tira sombrillas y deja el mar
// picado; el poniente en Málaga es el bueno, aplana el mar; el terral es
// el calor seco que baja de tierra. Eso es lo que la gente quiere saber.

export interface VientoNombrado {
  /** «levante», «tramontana», «nordés»… o el rumbo si no hay nombre local */
  nombre: string
  nombreEn: string
  /** rumbo de 16 puntos («NE») */
  rumbo: string
  /** qué significa en esa playa, en una frase corta, o null si es viento normal */
  efecto: string | null
  efectoEn: string | null
  /** true si el viento tiene nombre local Y sopla con fuerza suficiente */
  destacado: boolean
}

type Region = 'cantabrico' | 'galicia' | 'atlantico-sur' | 'alboran' | 'levante' | 'catalunya' | 'baleares' | 'canarias'

function region(lat: number, lng: number): Region {
  if (lat < 29.5) return 'canarias'
  if (lat >= 43.0 && lng > -8.0) return 'cantabrico'
  if (lng <= -8.0 && lat >= 41.6) return 'galicia'
  if (lng <= -5.9 && lat < 37.4) return 'atlantico-sur'
  if (lat < 37.4) return 'alboran'
  if (lng > 1.0 && lat >= 38.5 && lat <= 40.2) return 'baleares'
  if (lat >= 40.5 && lng > 0.2) return 'catalunya'
  return 'levante'
}

const RUMBOS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'] as const
const RUMBO_TXT: Record<string, [string, string]> = {
  N: ['del norte','northerly'], NNE: ['del norte','northerly'], NE: ['del nordeste','north-easterly'], ENE: ['del nordeste','north-easterly'],
  E: ['del este','easterly'], ESE: ['del este','easterly'], SE: ['del sureste','south-easterly'], SSE: ['del sureste','south-easterly'],
  S: ['del sur','southerly'], SSO: ['del sur','southerly'], SO: ['del suroeste','south-westerly'], OSO: ['del suroeste','south-westerly'],
  O: ['del oeste','westerly'], ONO: ['del oeste','westerly'], NO: ['del noroeste','north-westerly'], NNO: ['del noroeste','north-westerly'],
}

// Nombre local por región y sector. Solo los que de verdad se usan en la
// costa; el umbral dice a partir de qué velocidad merece el nombre.
interface Local { sector: readonly string[]; nombre: string; en: string; efecto: string; efectoEn: string; umbral: number }
const LOCALES: Record<Region, Local[]> = {
  'atlantico-sur': [
    { sector: ['E','ESE','ENE'], nombre: 'levante', en: 'levante (easterly)', umbral: 20,
      efecto: 'levanta arena y mar de fondo; en el Estrecho es el viento que lo cambia todo', efectoEn: 'blows sand and builds swell; in the Strait it changes everything' },
    { sector: ['O','OSO','ONO','SO'], nombre: 'poniente', en: 'poniente (westerly)', umbral: 25,
      efecto: 'trae humedad y mar más tranquilo que el levante', efectoEn: 'humid, with a calmer sea than the levante' },
  ],
  'alboran': [
    { sector: ['E','ESE','ENE'], nombre: 'levante', en: 'levante (easterly)', umbral: 20,
      efecto: 'mar picado y agua más fría en la Costa del Sol', efectoEn: 'choppy sea and colder water on the Costa del Sol' },
    { sector: ['O','OSO','ONO'], nombre: 'poniente', en: 'poniente (westerly)', umbral: 25,
      efecto: 'aplana el mar y es el bueno para el baño', efectoEn: 'flattens the sea — the good one for swimming' },
    { sector: ['N','NNO','NNE'], nombre: 'terral', en: 'terral (hot land wind)', umbral: 15,
      efecto: 'calor seco que baja de la sierra; sube mucho la temperatura', efectoEn: 'dry heat coming down from the hills; temperatures jump' },
  ],
  'levante': [
    { sector: ['E','ESE','ENE'], nombre: 'levante', en: 'levante (easterly)', umbral: 20,
      efecto: 'mar de fondo y agua revuelta en toda la costa valenciana', efectoEn: 'swell and murky water all along the Valencian coast' },
    { sector: ['NE','NNE'], nombre: 'gregal', en: 'gregal (north-easterly)', umbral: 25,
      efecto: 'frío para la época y mar picado', efectoEn: 'cool for the season, choppy sea' },
    { sector: ['O','OSO','ONO'], nombre: 'poniente', en: 'poniente (westerly)', umbral: 25,
      efecto: 'viento de tierra, con calor seco y mar plano', efectoEn: 'offshore, with dry heat and a flat sea' },
    { sector: ['SE','SSE'], nombre: 'xaloc', en: 'xaloc (south-easterly)', umbral: 25,
      efecto: 'húmedo y pegajoso; oleaje corto', efectoEn: 'humid and sticky; short chop' },
  ],
  'catalunya': [
    { sector: ['N','NNE','NNO'], nombre: 'tramontana', en: 'tramontana (northerly)', umbral: 20,
      efecto: 'tira sombrillas y deja el mar picado; en el Empordà manda ella', efectoEn: 'knocks over parasols and leaves a choppy sea; in the Empordà it rules' },
    { sector: ['NE','ENE'], nombre: 'gregal', en: 'gregal (north-easterly)', umbral: 25,
      efecto: 'mar de fondo en la costa central', efectoEn: 'swell on the central coast' },
    { sector: ['E','ESE'], nombre: 'llevant', en: 'llevant (easterly)', umbral: 20,
      efecto: 'el que trae los temporales de mar; agua revuelta', efectoEn: 'the one that brings sea storms; murky water' },
    { sector: ['SO','SSO','OSO'], nombre: 'garbí', en: 'garbí (south-westerly)', umbral: 25,
      efecto: 'la brisa de tarde; marejadilla, nada grave', efectoEn: 'the afternoon breeze; slight chop, nothing serious' },
    { sector: ['NO','ONO'], nombre: 'mestral', en: 'mestral (north-westerly)', umbral: 20,
      efecto: 'seco y racheado; en el delta del Ebro, el que más molesta', efectoEn: 'dry and gusty; in the Ebro delta, the most annoying one' },
  ],
  'baleares': [
    { sector: ['N','NNE','NNO'], nombre: 'tramuntana', en: 'tramuntana (northerly)', umbral: 20,
      efecto: 'frío y racheado; la cara norte se cierra', efectoEn: 'cold and gusty; the north coast closes' },
    { sector: ['E','ESE','ENE'], nombre: 'llevant', en: 'llevant (easterly)', umbral: 20,
      efecto: 'mar de fondo en la costa este', efectoEn: 'swell on the east coast' },
    { sector: ['SO','SSO','OSO'], nombre: 'llebeig', en: 'llebeig (south-westerly)', umbral: 25,
      efecto: 'húmedo; oleaje en el sur y oeste', efectoEn: 'humid; chop on the south and west' },
    { sector: ['NO','ONO'], nombre: 'mestral', en: 'mestral (north-westerly)', umbral: 20,
      efecto: 'seco y fuerte; bahías del oeste expuestas', efectoEn: 'dry and strong; western bays exposed' },
    { sector: ['SE','SSE'], nombre: 'xaloc', en: 'xaloc (south-easterly)', umbral: 25,
      efecto: 'bochorno y calima', efectoEn: 'sultry, with haze' },
  ],
  'galicia': [
    { sector: ['NE','NNE','ENE'], nombre: 'nordés', en: 'nordés (north-easterly)', umbral: 20,
      efecto: 'el de verano — seco, frío y con agua más fría por afloramiento', efectoEn: 'the summer one — dry, cool, with colder water from upwelling' },
    { sector: ['SO','SSO','OSO','S'], nombre: 'vendaval', en: 'vendaval (south-westerly)', umbral: 30,
      efecto: 'el de los temporales, con lluvia y mar gruesa', efectoEn: 'the storm wind; rain and heavy seas' },
  ],
  'cantabrico': [
    { sector: ['NE','NNE','ENE'], nombre: 'nordeste', en: 'north-easterly', umbral: 25,
      efecto: 'agua fría por afloramiento y mar movida en la orilla', efectoEn: 'cold water from upwelling and a lively shore break' },
    { sector: ['NO','ONO','NNO'], nombre: 'noroeste', en: 'north-westerly', umbral: 25,
      efecto: 'el que trae el mar de fondo a las playas abiertas', efectoEn: 'the one that brings swell to the open beaches' },
    { sector: ['S','SSO','SSE'], nombre: 'sur', en: 'southerly (föhn)', umbral: 20,
      efecto: 'viento viento de tierra, con calor seco y mar plano en la orilla', efectoEn: 'offshore, with dry heat and a flat shore' },
  ],
  'canarias': [
    { sector: ['NE','NNE','ENE','N'], nombre: 'alisio', en: 'trade wind', umbral: 25,
      efecto: 'el de siempre — fresco, constante y mar movida en la cara norte', efectoEn: 'the usual one — fresh, steady, with a lively sea on the north side' },
    { sector: ['E','ESE','SE'], nombre: 'calima', en: 'calima (Saharan wind)', umbral: 15,
      efecto: 'aire del Sáhara, con calor, polvo y poca visibilidad', efectoEn: 'Saharan air, with heat, dust and poor visibility' },
  ],
}

export function nombrarViento(lat: number, lng: number, grados: number, kmh: number, locale: 'es' | 'en' = 'es'): VientoNombrado {
  const idx = Math.round(((grados % 360) + 360) % 360 / 22.5) % 16
  const rumbo = RUMBOS[idx]
  const [txtEs, txtEn] = RUMBO_TXT[rumbo]
  const reg = region(lat, lng)
  const local = LOCALES[reg].find(l => l.sector.includes(rumbo))
  if (local && kmh >= local.umbral) {
    return { nombre: local.nombre, nombreEn: local.en, rumbo, efecto: local.efecto, efectoEn: local.efectoEn, destacado: true }
  }
  return { nombre: txtEs, nombreEn: txtEn, rumbo, efecto: null, efectoEn: null, destacado: false }
}
