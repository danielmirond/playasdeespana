// src/lib/flags.ts
// Feature flags simples y reversibles. Hoy son constantes (ON al 100%),
// pero centralizan el punto de control: para un A/B real, asignar variante
// aquí por anonId (cookie) y devolver el flag según la cohorte.
//
// Disciplina (auditoría CRO): un flag por cambio; si un test no mueve la
// afiliación sin dañar los guardrails (LCP/CLS/bounce), se apaga aquí sin
// dejar deuda.
export const flags = {
  /** C1 · CTA contextual tras "Estado de hoy" en la ficha de playa. */
  contextualCTA: true,
} as const

export type FlagName = keyof typeof flags
