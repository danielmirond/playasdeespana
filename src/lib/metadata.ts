import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// ── Helper para fichas de playa ───────────────────────────────────────────────
export function buildPlayaMetadata({
  nombre,
  municipio,
  provincia,
  comunidad,
  slug,
  calidad,
  oleaje,
  tempAgua,
  tempAire,
  viento,
  banderaAzul,
}: {
  nombre: string
  municipio: string
  provincia: string
  comunidad: string
  slug: string
  calidad: string | null
  oleaje?: number | null
  tempAgua?: number | null
  tempAire?: number | null
  viento?: number | null
  banderaAzul?: boolean
}): Metadata {
  const canonical = `${BASE}/playas/${slug}`
  const title     = `${nombre} — ${municipio}, ${provincia}`
  const badges    = [
    banderaAzul            ? 'Bandera Azul'              : null,
    calidad                ? `Agua ${calidad}`            : null,
    oleaje   != null       ? `Oleaje ${oleaje}m`          : null,
    tempAgua != null       ? `${tempAgua}°C agua`         : null,
    tempAire != null       ? `${tempAire}°C aire`         : null,
    viento   != null       ? `Viento ${viento}km/h`       : null,
  ].filter(Boolean).join(' · ')

  const description = `${nombre} en ${municipio} (${provincia}). ${badges}. Condiciones en tiempo real: oleaje, temperatura del agua, calidad EEA y servicios.`

  const ogImage = new URL(`${BASE}/api/og`)
  ogImage.searchParams.set('playa',     nombre)
  ogImage.searchParams.set('municipio', `${municipio} · ${provincia}`)
  if (tempAgua) ogImage.searchParams.set('temp_agua', String(tempAgua))
  if (tempAire) ogImage.searchParams.set('temp_aire', String(tempAire))
  if (oleaje)   ogImage.searchParams.set('oleaje',    String(oleaje))
  if (viento)   ogImage.searchParams.set('viento',    String(viento))
  if (calidad)  ogImage.searchParams.set('calidad',   calidad)
  if (banderaAzul) ogImage.searchParams.set('azul',   'true')
  ogImage.searchParams.set('comunidad', comunidad)

  return {
    title,
    description,
    alternates: {
      canonical,
      // Sin versiones en otros idiomas por ahora — solo es, marcar explícitamente
      languages: { 'es-ES': canonical },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Playas de España',
      locale: 'es_ES',
      type: 'website',
      images: [{
        url: ogImage.toString(),
        width: 1200,
        height: 630,
        alt: `${nombre} — condiciones en tiempo real`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.toString()],
      site: '@playasdeespana',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

// ── Helper para páginas de comunidad ─────────────────────────────────────────
export function buildComunidadMetadata({
  nombre,
  slugComunidad,
  totalPlayas,
  playasAzul,
}: {
  nombre: string
  slugComunidad: string
  totalPlayas: number
  playasAzul: number
}): Metadata {
  const canonical   = `${BASE}/comunidad/${slugComunidad}`
  const title       = `Playas de ${nombre} — Condiciones en tiempo real`
  const description = `${totalPlayas} playas en ${nombre}. ${playasAzul} con Bandera Azul. Oleaje, temperatura del agua y calidad EEA actualizados cada hora.`

  return {
    title,
    description,
    alternates: { canonical, languages: { 'es-ES': canonical } },
    openGraph: {
      title, description,
      url: canonical,
      siteName: 'Playas de España',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  }
}
