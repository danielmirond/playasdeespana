// src/lib/adsense.ts — AdSense: el ID de editor y los bloques, en un sitio.
//
// EL ID DE EDITOR estaba leído por separado en AdSlot y en ConsentScripts,
// ambos con `?? ''`, y en producción la variable no estaba puesta: el sitio
// no servía UN SOLO anuncio y no lo delataba ningún error. El componente
// devolvía null, el script no se cargaba, todo parecía correcto.
//
// El valor real va escrito aquí y no solo en la variable porque un ID de
// editor es PÚBLICO por diseño —aparece en el HTML de cada página de cada
// sitio con AdSense—, así que no hay nada que proteger, y a cambio se evita
// que un despliegue sin la variable vuelva a apagar los ingresos en
// silencio. La variable sigue mandando, para poder probar con otra cuenta.
//
// OJO con el `||` y no `??`, igual que en AMAZON_TAG: una variable definida
// pero VACÍA pasa el filtro de `??` y deja el ID en blanco, que es
// exactamente el estado del que venimos.
export const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-1045482785137225'

/**
 * Los bloques, por emplazamiento.
 *
 * `data-ad-slot` tiene que ser el ID NUMÉRICO del bloque creado en AdSense.
 * Un nombre descriptivo —«lista-municipio»— no da error en ninguna parte y
 * sencillamente no sirve anuncios: la misma clase de fallo silencioso que
 * el ID de editor ausente. Aquí solo entran números.
 *
 * HOY TODOS APUNTAN AL MISMO BLOQUE, `display-1`, que es el único creado.
 * Funciona —AdSense permite reutilizar un bloque en varios sitios— pero el
 * informe no distingue de dónde viene cada impresión, así que no se podrá
 * saber si rinde el listado o la ficha. En cuanto haya un bloque por
 * emplazamiento, se cambia el número aquí y nada más.
 */
export type FormatoAd = 'auto' | 'autorelaxed' | 'horizontal' | 'rectangle' | 'vertical'

export interface Bloque {
  /** ID NUMÉRICO del bloque en AdSense. */
  id: string
  formato: FormatoAd
  /** Altura reservada, en px, para que al llegar no empuje el contenido. */
  alto: number
}

/**
 * Los bloques, por emplazamiento. **El formato viaja con el ID**, y no es
 * un capricho: los dos bloques creados son de tipos distintos y piden
 * marcado distinto. `display-1` (4246555668) es un display responsive;
 * `9947961561` es un Multiplex —`autorelaxed`—, que es una rejilla de
 * recomendaciones y NO lleva `data-full-width-responsive`. Separar formato
 * de ID es cómo se acaba sirviendo un Multiplex con marcado de display y
 * preguntándose por qué no rinde.
 *
 * `data-ad-slot` tiene que ser el ID numérico. Un nombre descriptivo
 * —«lista-municipio»— no da error en ninguna parte y sencillamente no
 * sirve anuncios: la misma clase de fallo silencioso que el ID de editor
 * ausente, que es de lo que venimos.
 *
 * El Multiplex va donde el contenido ya se ha dado —final de ficha, cierre
 * de página— porque parece contenido recomendado; intercalado en un listado
 * competiría con los resultados de verdad, que es justo lo que la regla de
 * los huecos prohíbe.
 */
export const SLOTS: Record<string, Bloque> = {
  /** Listados: municipio, provincia. Intercalado tras el 8.º resultado. */
  lista:       { id: '4246555668', formato: 'auto',        alto: 280 },
  /** Ficha, último puesto de la fase PLAN. */
  fichaPlan:   { id: '4246555668', formato: 'auto',        alto: 280 },
  /** Ficha, ya en PROFUNDIDAD: aquí el Multiplex encaja. */
  fichaFondo:  { id: '9947961561', formato: 'autorelaxed', alto: 420 },
  /** Cierre de páginas de respuesta. */
  cierre:      { id: '9947961561', formato: 'autorelaxed', alto: 420 },
  /** Después de una herramienta (tabla de mareas, comparar). */
  herramienta: { id: '4246555668', formato: 'auto',        alto: 280 },
}
