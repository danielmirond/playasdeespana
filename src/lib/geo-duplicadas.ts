// src/lib/geo-duplicadas.ts — cuando la provincia y la comunidad son lo mismo.
//
// En las comunidades uniprovinciales, /comunidad/X y /provincia/X no se
// parecen: son la MISMA página. Medido en producción sobre las listas de
// fichas enlazadas:
//
//   /comunidad/islas-baleares  ↔ /provincia/baleares    414 playas, 100%
//   /comunidad/asturias        ↔ /provincia/asturias    232 playas,  99%
//   /comunidad/murcia          ↔ /provincia/murcia      197 playas, 100%
//   /comunidad/cantabria       ↔ /provincia/cantabria   111 playas, 100%
//
// Tres de los cuatro pares tenían además el TITLE idéntico, palabra por
// palabra, y cada página se auto-canonicalizaba. Es contenido duplicado
// de manual: dos URLs compitiendo por la misma consulta con lo mismo
// dentro, y Google eligiendo una por su cuenta.
//
// Retocar los titles no arregla esto. Con el contenido idéntico, dos
// titles distintos siguen siendo dos páginas iguales.
//
// SE ELIGE CANONICAL Y NO 301 a propósito: las dos URLs siguen
// respondiendo 200 y la señal es reversible en un despliegue. Un 301 es
// más contundente pero mata la URL, y sin mirar antes en Search Console
// cuál de las dos recibe clics hoy, matar la que ya posiciona cuesta
// semanas de recuperación. Si los datos confirman la dirección, esto se
// asciende a 301.
//
// LA DIRECCIÓN es hacia /comunidad porque:
//   - la home enlaza solo a /comunidad/X (comprobado en producción);
//   - su H1 dice «Playas de Asturias» y el de provincia solo «Asturias».
//
// El caso a vigilar es Baleares: el slug que sobrevive es
// `islas-baleares` y la gente busca «playas de Baleares». Si Search
// Console dice que /provincia/baleares es la que rinde, este par se da
// la vuelta —solo hay que mover su línea en el mapa de abajo—.

/**
 * Slug de provincia → slug de comunidad que se queda con la canonical.
 * Solo comunidades uniprovinciales: en las demás, provincia y comunidad
 * son páginas legítimamente distintas.
 */
export const PROVINCIA_A_COMUNIDAD: Record<string, string> = {
  // Costeras, por volumen de playas.
  'baleares':   'islas-baleares',   // 414
  'asturias':   'asturias',         // 232
  'murcia':     'murcia',           // 197
  'cantabria':  'cantabria',        // 111
  'ceuta':      'ceuta',            //  13
  'melilla':    'melilla',          //   6
  // De interior y residuales, pero duplicadas igual.
  'valladolid': 'castilla-y-leon',  //   1
  'badajoz':    'extremadura',      //   4
  'madrid':     'madrid',           //   1
}

/**
 * La URL canónica de una página de provincia. Devuelve la de comunidad
 * cuando son la misma cosa, y la propia en cualquier otro caso.
 */
export function canonicalDeProvincia(slugProvincia: string): string {
  const com = PROVINCIA_A_COMUNIDAD[slugProvincia]
  return com ? `/comunidad/${com}` : `/provincia/${slugProvincia}`
}

/** ¿Esta provincia es en realidad una comunidad uniprovincial? */
export const esProvinciaDuplicada = (slug: string): boolean =>
  slug in PROVINCIA_A_COMUNIDAD

/* ── Cuando la capital se llama igual que la provincia ──────────────
 *
 * Once slugs son a la vez provincia y municipio: Cádiz, Barcelona,
 * Valencia, Málaga, Almería, Tarragona, A Coruña, Pontevedra, Santa
 * Cruz de Tenerife, Ceuta y Melilla. En todos, el municipio es la
 * capital.
 *
 * Aquí el contenido SÍ es distinto —la provincia de Cádiz tiene 121
 * playas y la ciudad 10—, así que no hay nada que consolidar. El
 * problema es que ambas se presentaban igual: H1 «Playas de Cádiz» en
 * las dos y titles casi calcados. Ni el usuario ni Google podían saber
 * cuál es cuál.
 *
 * Se desambigua con las dos formas que la gente escribe de verdad:
 * «playas de la provincia de Cádiz» y «playas de Cádiz capital».
 *
 * La colisión NO se guarda en una lista: se detecta cruzando los slugs
 * de provincia con los de municipio en cada render. Una lista a mano
 * envejece —ya nos pasó con las zonas del sitemap, que se quedaron en
 * cinco cuando eran veintitrés— y esta se puede derivar del dato.
 */

/** ¿El nombre de este municipio choca con el de su provincia? */
export function esCapitalHomonima(
  slugMunicipio: string,
  slugsProvincia: Iterable<string>,
): boolean {
  for (const s of slugsProvincia) if (s === slugMunicipio) return true
  return false
}
