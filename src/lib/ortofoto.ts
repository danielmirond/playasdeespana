// src/lib/ortofoto.ts — ortofoto aérea del PNOA (Instituto Geográfico
// Nacional) por WMS. Oficial, de toda España y sin clave.
//
// PARA QUÉ EN UNA PÁGINA DE BUCEO. Desde arriba se ve lo que no se ve
// desde la arena: dónde hay fondo rocoso y dónde arena, porque el color
// del agua lo delata. En las Illes Medes los bajos salen en turquesa
// alrededor de la isla.
//
// LA PROPORCIÓN SE CALCULA. Un grado de longitud mide menos que uno de
// latitud, y cuánto menos depende de la latitud. Pedir 820×620 para una
// caja que sobre el terreno es cuadrada devuelve la foto deformada y con
// una banda blanca al lado: comprobado en el primer intento.
//
// Por eso aquí la caja se construye CUADRADA en metros y la imagen se
// pide cuadrada en píxeles. Así la escala es la misma en los dos ejes.

const WMS = 'https://www.ign.es/wms-inspire/pnoa-ma'
const M_POR_GRADO_LAT = 110574
const M_POR_GRADO_LON = 111320   // en el ecuador; se corrige por latitud

export interface Ortofoto { url: string; lado: number }

/**
 * Ortofoto cuadrada centrada en un punto.
 * @param km  lado del cuadrado, en kilómetros de terreno
 * @param px  lado de la imagen, en píxeles
 */
export function ortofoto(lat: number, lon: number, km = 2.2, px = 900): Ortofoto {
  const mitad = (km * 1000) / 2
  const dLat = mitad / M_POR_GRADO_LAT
  const dLon = mitad / (M_POR_GRADO_LON * Math.cos((lat * Math.PI) / 180))
  const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
  const q = new URLSearchParams({
    SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetMap',
    LAYERS: 'OI.OrthoimageCoverage', CRS: 'CRS:84',
    BBOX: bbox.map(n => n.toFixed(5)).join(','),
    WIDTH: String(px), HEIGHT: String(px),
    FORMAT: 'image/jpeg', STYLES: '',
  })
  return { url: `${WMS}?${q}`, lado: px }
}
