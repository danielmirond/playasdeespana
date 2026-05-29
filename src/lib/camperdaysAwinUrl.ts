// src/lib/camperdaysAwinUrl.ts
// Helper de afiliación Camperdays (Awin) — espejo de samboatAwinUrl.
// Link de referencia aprobado:
//   https://www.awin1.com/cread.php?awinmid=52113&awinaffid=2870719&ued=...
const AWIN_MID = '52113'              // Camperdays ES (advertiser)
const AWIN_AFFID = '2870719'         // nuestro ID de afiliado Awin
// Destino por defecto: la página de España de Camperdays (verificada, mejor
// que la home porque ya muestra resultados de alquiler en España).
const DEFAULT_UED = 'https://www.camperdays.es/campervans-spain.html'

/**
 * Construye un enlace de afiliado Camperdays vía Awin.
 * @param clickref  Etiqueta de medición por página/etapa (ej. "playasdeespana_camper_madrid").
 * @param ued       Deep-link de destino en camperdays.es (opcional).
 */
export function camperdaysAwinUrl(clickref: string, ued: string = DEFAULT_UED): string {
  const params = new URLSearchParams({
    awinmid: AWIN_MID,
    awinaffid: AWIN_AFFID,
    clickref,
    ued,
  })
  return `https://www.awin1.com/cread.php?${params.toString()}`
}
