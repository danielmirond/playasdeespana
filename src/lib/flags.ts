// src/lib/flags.ts — feature flags del sistema Litoral.
//
// La decisión se toma SIEMPRE en servidor y se pinta en <html data-flags>.
// Nunca un swap en cliente: produce FOUC y contamina la medición, porque
// parte de la sesión se mide con un sistema y parte con otro.
//
// ── Por qué por variable de entorno y no por petición ──────────────────
// El handoff pide «reversibilidad instantánea sin deploy». Con 4.491 fichas
// en ISR eso tiene un coste que conviene decir en voz alta: si el flag se
// resuelve por petición (cookie, Edge Config, middleware), esas páginas
// dejan de poder servirse desde caché estática — habría que cachear una
// variante por combinación de flags. El sitio pasaría de estático a
// dinámico para ganar unos minutos de rollback.
//
// Por eso los flags son de despliegue: variable de entorno + redeploy
// (~1 min en Vercel). Si algún día hace falta un A/B real por usuario,
// hay que montarlo en middleware y asumir el cambio en el modelo de caché
// — es una decisión de producto, no un detalle de implementación.
//
// Uso: FLAGS="ds_litoral_tokens ds_litoral_type" en el entorno.

// ── Flags previos a Litoral ────────────────────────────────────────────
// Constantes, ON al 100 %. Los mantiene la disciplina de la auditoría CRO:
// un flag por cambio, y se apaga aquí sin dejar deuda. No se migran al
// mecanismo de abajo porque no son visuales ni dependen de la hoja.
export const flags = {
  /** C1 · CTA contextual tras "Estado de hoy" en la ficha de playa. */
  contextualCTA: true,
} as const

export type FlagName = keyof typeof flags

// ── Sistema Litoral ────────────────────────────────────────────────────

/** Los flags del sistema. `ux_chrome_64` NO está: ya está consolidado. */
export const FLAGS = [
  'ux_ficha_orden',       // reorden CRO de la ficha (auditoría). Se mide aparte.
  'ds_litoral_tokens',    // hoja única: color, radios, sombras, motion
  'ds_litoral_type',      // Literata + Schibsted Grotesk
  'ds_sin_acento',        // interacción en tinta
  'ds_bronce_sello',      // sello y cuaderno en bronce
  'media_foto_duotone',   // tratamiento de foto
  'media_video_duotone',  // duotonos de vídeo
  'widget_bano_hoy',      // widget flotante en páginas externas
] as const

export type Flag = typeof FLAGS[number]

/**
 * Dependencias declaradas en el handoff. Un flag activo cuyo padre está
 * apagado no se aplica: enseñaría un estado intermedio que no es ningún
 * sistema. Se resuelve aquí y no en cada componente.
 */
const DEPENDE_DE: Partial<Record<Flag, Flag>> = {
  ds_sin_acento:       'ds_litoral_tokens',
  ds_bronce_sello:     'ds_litoral_tokens',
  media_foto_duotone:  'ds_litoral_tokens',
  media_video_duotone: 'ds_litoral_tokens',
  // ds_litoral_type se puede activar solo, sobre el sistema Arena, para un
  // A/B de tipografía puro. Es la excepción que el handoff documenta.
}

const esFlag = (s: string): s is Flag => (FLAGS as readonly string[]).includes(s)

let _cache: Set<Flag> | null = null

/** Flags activos, ya resueltas las dependencias. Se calcula una vez. */
export function getFlags(): Set<Flag> {
  if (_cache) return _cache
  const crudos = (process.env.FLAGS ?? '')
    .split(/[\s,]+/)
    .filter(Boolean)
    .filter(esFlag)

  const activos = new Set<Flag>(crudos)
  // Poda: si falta el padre, el hijo no entra.
  for (const f of [...activos]) {
    const padre = DEPENDE_DE[f]
    if (padre && !activos.has(padre)) activos.delete(f)
  }
  _cache = activos
  return activos
}

export const tieneFlag = (f: Flag): boolean => getFlags().has(f)

/** El atributo que va en <html>. Cadena vacía → atributo omitido. */
export const flagsAttr = (): string => [...getFlags()].join(' ')

/**
 * Variante para analítica. Permite cortar `sellar_playa` y `clic_afiliado`
 * por sistema visual, que es la razón de ser de todo el mecanismo.
 */
export const dsVariant = (): 'litoral' | 'arena' =>
  tieneFlag('ds_litoral_tokens') ? 'litoral' : 'arena'
