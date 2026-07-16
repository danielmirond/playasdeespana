import { getLocalityBySlug, getAllLocalities } from '@/lib/boat-rental-localities'
import { samboatAwinUrl, getBoatRentalCanonical, boatRentalSlug, matchBeachSlugs } from '@/lib/boat-rental-helpers'
import { getPlayas } from '@/lib/playas'
import { getBoatImage } from '@/lib/boat-images'
import BoatRentalLocalityPage from '@/components/BoatRentalLocalityPage'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Next 16: params es asíncrono → await obligatorio. Leerlo en síncrono
// devolvía undefined y getLocalityBySlug(undefined) caía en notFound()
// (todas las fichas daban 404).
interface LocalityPageParams {
  coast: string
  province: string
  locality: string
}

// SSG: pre-renderiza todas las fichas conocidas.
export function generateStaticParams() {
  return getAllLocalities().map((loc) => ({
    coast: boatRentalSlug(loc.coast),
    province: boatRentalSlug(loc.province),
    locality: loc.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<LocalityPageParams> }): Promise<Metadata> {
  const { locality: localitySlug } = await params
  const locality = getLocalityBySlug(localitySlug)
  if (!locality) return {}

  const canonical = getBoatRentalCanonical(locality.coast, locality.province, locality.locality)
  const title = `Alquiler de barcos en ${locality.locality} | Playas de España`
  const description = locality.description.substring(0, 160)
  const hero = getBoatImage(locality.slug)
  const ogImage = hero
    ? { url: hero.url, width: hero.width, height: hero.height }
    : { url: `/api/og?playa=${encodeURIComponent(`Alquiler de barcos en ${locality.locality}`)}`, width: 1200, height: 630 }

  return {
    title,
    description,
    openGraph: { title, description, url: canonical, type: 'website', images: [ogImage] },
    alternates: { canonical },
  }
}

export default async function LocalityPage({ params }: { params: Promise<LocalityPageParams> }) {
  const { locality: localitySlug } = await params
  const locality = getLocalityBySlug(localitySlug)
  if (!locality) notFound()

  const afinityId = process.env.NEXT_PUBLIC_AWIN_AFFID || 'playasdeespana'
  const awinUrl = samboatAwinUrl(afinityId, locality.samboatUrl, `playasdeespana_${locality.slug}`)
  const hero = getBoatImage(locality.slug)

  // Enlazar las calas listadas con nuestras fichas de playa (matching
  // conservador por nombre dentro de la provincia — antes eran texto plano).
  const playas = await getPlayas()
  const nombres = [...locality.beaches.map(b => b.name), ...locality.moorings.map(m => m.name)]
  const beachLinks = matchBeachSlugs(locality.province, nombres, playas)

  return (
    <BoatRentalLocalityPage
      heroImage={hero ? { url: hero.url, credit: hero.credit } : null}
      beachLinks={beachLinks}
      coast={locality.coast}
      province={locality.province}
      locality={locality.locality}
      slug={locality.slug}
      description={locality.description}
      beaches={locality.beaches}
      moorings={locality.moorings}
      pricing={locality.pricing}
      regulations={locality.regulations}
      bestSeason={locality.bestSeason}
      insiderTip={locality.insiderTip}
      faq={locality.faq}
      googleTrendsVolume={locality.googleTrendsVolume}
      samboatAwinUrl={awinUrl}
      samboatDeeplink={locality.samboatUrl}
      images={locality.images}
    />
  )
}
