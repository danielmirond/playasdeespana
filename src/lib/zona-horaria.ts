// src/lib/zona-horaria.ts — España tiene dos horas, no una.
//
// Todo el sitio pedía y formateaba las horas en Europe/Madrid, fijo. En
// Canarias eso adelanta una hora TODO lo que lleva reloj: amanecer,
// atardecer, oleaje por horas, mejor hora para ir, marcas de tiempo.
//
// Lo detectó una auditoría externa mirando Dunas de Corralejo: la ficha
// daba amanecer 08:23 y atardecer 21:36 cuando en Fuerteventura, a
// mediados de agosto, el sol sale sobre las 07:25 y se pone sobre las
// 20:40. Una hora exacta de desfase.
//
// No es un detalle cosmético: son ~560 fichas, y el error lo detecta al
// instante justo el público que más las usa —canarios y turistas allí—.
// Un sitio cuya promesa es «el dato es de fiar» no puede equivocarse en
// a qué hora se pone el sol.
//
// La zona se deduce de las coordenadas y no de la provincia porque las
// funciones de datos (getSol, getMareas, getMeteoPlaya) solo reciben lat
// y lng. La caja cubre las ocho islas con margen: de El Hierro (-18.2)
// a Lanzarote (-13.3) y de El Hierro sur (27.5) a Alegranza (29.5).

/** Caja de las Canarias, con margen sobre los extremos reales. */
const CANARIAS = { latMin: 27.4, latMax: 29.6, lngMin: -18.3, lngMax: -13.2 }

/**
 * La zona horaria IANA que le toca a un punto del litoral español.
 *
 * Devuelve 'Atlantic/Canary' dentro del archipiélago y 'Europe/Madrid'
 * en el resto —península, Baleares, Ceuta y Melilla, que sí comparten
 * hora peninsular—.
 */
export function zonaHoraria(lat: number, lng: number): string {
  if (
    lat >= CANARIAS.latMin && lat <= CANARIAS.latMax &&
    lng >= CANARIAS.lngMin && lng <= CANARIAS.lngMax
  ) return 'Atlantic/Canary'
  return 'Europe/Madrid'
}

/** La misma zona, lista para meter en una URL de Open-Meteo. */
export const zonaHorariaParam = (lat: number, lng: number): string =>
  encodeURIComponent(zonaHoraria(lat, lng))
