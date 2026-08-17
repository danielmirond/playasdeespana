// src/lib/playas-prohibidas.ts — Playas donde el baño está PROHIBIDO de forma
// permanente, según la clasificación oficial del catálogo.
//
// No es tiempo real y por eso no vive con los adaptadores de bandera: es un
// atributo estable de la playa, como que tenga socorrista o duchas. El
// catálogo de socorrismo del Gobierno de Canarias clasifica cada playa como
// Libre / Peligrosa / Uso Prohibido, y 44 de las que tienen ficha nuestra
// están en la tercera categoría.
//
// Publicábamos esas 44 fichas sin decirlo. Es el mismo fallo que nos hizo
// mostrar "BUENA" en playas de Málaga con el baño prohibido por E. coli, con
// el agravante de que este dato ni siquiera cambia: llevaba meses disponible.
//
// El sidecar lo genera scripts/build-banderas-can-map.mjs (por coordenadas,
// ≤350 m; nunca por nombre). De momento solo cubre Canarias, que es la única
// comunidad que publica esta clasificación de forma máquina-legible.
import prohibidas from '@/data/playas-prohibidas.json'

interface PlayaProhibida { nombre: string; municipio: string }

const PROHIBIDAS = prohibidas as Record<string, PlayaProhibida>

/** ¿El baño está permanentemente prohibido en esta playa? */
export function esUsoProhibido(slug: string): boolean {
  return slug in PROHIBIDAS
}

/** Datos oficiales de la playa prohibida (nombre y municipio del catálogo). */
export function getUsoProhibido(slug: string): PlayaProhibida | null {
  return PROHIBIDAS[slug] ?? null
}

/** Cuántas hay. Para paneles y para no cantar cifras a ojo en la copy. */
export const TOTAL_PROHIBIDAS = Object.keys(PROHIBIDAS).length
