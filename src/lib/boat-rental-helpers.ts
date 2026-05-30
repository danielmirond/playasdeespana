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
