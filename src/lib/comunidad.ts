// src/lib/comunidad.ts — la comunidad que el dataset no dice bien.
//
// EL FALLO. 148 playas de Castellón, Valencia, Alicante y Ourense traen
// «España» en el campo `comunidad`. No es un nombre raro: es que no hay dato,
// y alguien lo rellenó con el país.
//
// Y NO ERA SOLO FEO. La miga de pan decía «Inicio › España › Alicante», y
// `meteoalarm.ts` busca los avisos por nombre de comunidad: con «España» no
// encontraba ninguno, así que esas 148 playas y sus municipios se quedaban
// sin avisos de temporal, viento o lluvia, que es justo lo que hay que ver
// antes de ir a la playa. También existe /comunidad/espana, una página hub
// que no debería existir.
//
// ESTO ES UN PARCHE, no el arreglo. Lo suyo es corregirlo en el dataset, en
// `npm run sync:playas`, y que nadie tenga que acordarse de esto. Mientras
// tanto, cualquier sitio que lea la comunidad debería pasar por aquí.
// La grafía es la que ya usa el resto del catálogo —«Comunitat Valenciana»,
// 225 playas— para que el enlace caiga en el hub que existe y no en uno nuevo.
const POR_PROVINCIA: Record<string, string> = {
  'Castellón': 'Comunitat Valenciana',
  'Valencia':  'Comunitat Valenciana',
  'Alicante':  'Comunitat Valenciana',
  'Ourense':   'Galicia',
}

/** Mismo slug que `toSlug` de lib/playas, que es quien fabrica los hubs. */
const aSlug = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * La comunidad de verdad. Devuelve `null` cuando no hay nada que decir —en
 * Asturias, Murcia, Cantabria, Madrid, Navarra, La Rioja, Ceuta y Melilla la
 * comunidad se llama igual que la provincia, y repetirla en una miga de pan
 * («Asturias › Asturias») solo hace ruido.
 */
export function comunidadDe(
  comunidad: string | undefined,
  provincia: string | undefined,
): { nombre: string; slug: string } | null {
  const c = comunidad === 'España' || !comunidad ? POR_PROVINCIA[provincia ?? ''] : comunidad
  if (!c || c === provincia) return null
  return { nombre: c, slug: aSlug(c) }
}

/** La comunidad para buscar avisos: aquí sí interesa aunque repita nombre. */
export function comunidadParaAvisos(comunidad: string | undefined, provincia: string | undefined): string {
  if (comunidad && comunidad !== 'España') return comunidad
  return POR_PROVINCIA[provincia ?? ''] ?? provincia ?? ''
}
