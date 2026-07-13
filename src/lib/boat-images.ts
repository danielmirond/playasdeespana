// src/lib/boat-images.ts — Acceso al sidecar de héroes de alquiler de barco,
// pre-resuelto offline por scripts/enrich-barcos-images.mjs desde fuentes
// libres (Wikimedia Commons / Openverse) con autor + licencia. O(1), sin red.
import data from '@/../public/data/barcos-images.json'

export interface BoatImage {
  url: string
  width: number
  height: number
  credit: string   // "Autor · Licencia" (obligatorio mostrarlo: CC By/SA)
  source: string   // "wikimedia" | "openverse"
}

const MAP = data as Record<string, BoatImage>

export function getBoatImage(slug: string): BoatImage | null {
  return MAP[slug] ?? null
}
