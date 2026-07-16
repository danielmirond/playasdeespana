import { BOAT_RENTAL_LOCALITIES } from './boat-rental-localities'
/**
 * Boat Rental Affiliate Helpers
 * SamBoat integration via Awin
 */

const SAMBOAT_AWIN_MID = '32683'
const SAMBOAT_BASE_URL = 'https://www.samboat.es'

export const samboatAwinUrl = (
  affId: string,
  samboatPath: string,
  clickref?: string
): string => {
  const ued = `${SAMBOAT_BASE_URL}${samboatPath}`
  const params = new URLSearchParams({
    awinmid: SAMBOAT_AWIN_MID,
    awinaffid: affId,
    clickref: clickref || 'playasdeespana',
    ued: ued,
  })

  return `https://www.awin1.com/cread.php?${params.toString()}`
}

/**
 * Track SamBoat clicks in GA4
 * Usage: trackSamBoatClick('mallorca', 'Costa Brava')
 */
export const trackSamBoatClick = (locality: string, coast: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'samboat_click', {
      event_category: 'affiliate',
      event_label: locality,
      coast: coast,
      value: 1,
    })
  }
}

/**
 * Slug canónico para alquiler de barcos. Normaliza acentos completos (NFD)
 * y espacios → guion. Debe coincidir con slugifyLoc() de
 * boat-rental-localities.ts para que las URLs jerárquicas casen con el matching.
 * "Islas Baleares" -> "islas-baleares", "Málaga" -> "malaga".
 */
export const boatRentalSlug = (s: string): string =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')

// Alias retrocompatibles
export const getCoastSlug = (coast: string): string => boatRentalSlug(coast)
export const getProvinceSlug = (province: string): string => boatRentalSlug(province)

/**
 * Construct canonical URL for boat rental page
 */
export const getBoatRentalCanonical = (coast: string, province: string, locality: string): string => {
  return `https://playas-espana.com/alquiler-barco/costas/${boatRentalSlug(coast)}/provincias/${boatRentalSlug(province)}/${boatRentalSlug(locality)}`
}

/**
 * Enlace interno de alquiler de barcos para una FICHA de playa costera.
 * - Si el municipio de la playa casa con una localidad de barcos → su ficha.
 * - Si la provincia tiene localidades pero el municipio no casa → hub de la
 *   costa (siempre correcto; evita enlazar "Mallorca" desde una playa de
 *   Ibiza).
 * - Provincia sin oferta → null (la ficha no muestra CTA).
 */
export function getBoatLinkForPlaya(
  provincia: string | undefined,
  municipio: string | undefined,
): { label: string; href: string } | null {
  if (!provincia) return null
  const norm = (x: string) => (x ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const PROV_MAP: Record<string, string> = {
    'islas baleares': 'baleares',
    'santa cruz de tenerife': 'tenerife',
    'las palmas': 'tenerife', // sin oferta propia: Canarias → Tenerife (misma costa)
  }
  const pn = PROV_MAP[norm(provincia)] ?? norm(provincia)
  const locs = Object.values(BOAT_RENTAL_LOCALITIES).filter(l => norm(l.province) === pn)
  if (!locs.length) return null

  const mn = norm(municipio ?? '')
  const byMuni = mn
    ? locs.find(l => mn.includes(norm(l.locality)) || norm(l.locality).includes(mn))
    : undefined
  if (byMuni) {
    return {
      label: byMuni.locality,
      href: `/alquiler-barco/costas/${boatRentalSlug(byMuni.coast)}/provincias/${boatRentalSlug(byMuni.province)}/${byMuni.slug}`,
    }
  }
  const coast = locs[0].coast
  return { label: coast, href: `/alquiler-barco/costas/${boatRentalSlug(coast)}` }
}


/**
 * Matching de las calas/playas listadas en una ficha de barcos contra
 * nuestras fichas de playa. Conservador: solo enlaza con igualdad
 * normalizada o contención con ≥6 caracteres, dentro de la(s) provincia(s)
 * equivalentes del dataset. Devuelve { nombreCala: slugNuestro }.
 */
export function matchBeachSlugs(
  province: string,
  beachNames: string[],
  playas: Array<{ slug: string; nombre: string; provincia: string }>,
): Record<string, string> {
  const norm = (x: string) => (x ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b(playa|platja|praia|cala|calo|caló|es|sa|ses|de|del|de la|la|el|les|los|las|d')\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const PROVS: Record<string, string[]> = {
    baleares: ['baleares', 'islas baleares'],
    tenerife: ['santa cruz de tenerife'],
  }
  const pn = (province ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const targets = new Set(PROVS[pn] ?? [pn])
  const pool = playas.filter(pl => targets.has((pl.provincia ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')))

  const out: Record<string, string> = {}
  for (const name of beachNames) {
    const n = norm(name)
    if (n.length < 4) continue
    let best: { slug: string; score: number } | null = null
    for (const pl of pool) {
      const m = norm(pl.nombre)
      if (!m) continue
      let score = 0
      if (m === n) score = 3
      else if ((m.includes(n) && n.length >= 6) || (n.includes(m) && m.length >= 6)) score = 2
      if (score > (best?.score ?? 0)) best = { slug: pl.slug, score }
    }
    if (best) out[name] = best.slug
  }
  return out
}
