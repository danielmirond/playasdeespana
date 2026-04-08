// src/lib/validation.ts — Validación de parámetros de entrada para API routes

/** Valida y parsea coordenadas lat/lon de query params. Acepta tanto 'lon' como 'lng'. */
export function parseCoords(latStr: string | null, lonStr: string | null): { lat: number; lon: number } | null {
  if (!latStr || !lonStr) return null
  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)
  if (isNaN(lat) || isNaN(lon)) return null
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
  return { lat, lon }
}
