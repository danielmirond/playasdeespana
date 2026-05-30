import { getLocalityBySlug, getAllLocalities } from '@/lib/boat-rental-localities'
import { samboatAwinUrl, getBoatRentalCanonical, boatRentalSlug } from '@/lib/boat-rental-helpers'
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
  const title = `Alquiler de barcos en ${locality.locality} desde €${locality.pricing.small.min}/día | Playas de España`
  const description = locality.description.substring(0, 160)

  return {
    title,
    description,
    openGraph: { title, description, url: canonical, type: 'website', images: [locality.images.hero.unsplashUrl] },
    alternates: { canonical },
  }
}

export default async function LocalityPage({ params }: { params: Promise<LocalityPageParams> }) {
  const { locality: localitySlug } = await params
  const locality = getLocalityBySlug(localitySlug)
  if (!locality) notFound()

  const afinityId = process.env.NEXT_PUBLIC_AWIN_AFFID || 'playasdeespana'
  const awinUrl = samboatAwinUrl(afinityId, locality.samboatUrl, `playasdeespana_${locality.slug}`)

  return (
    <BoatRentalLocalityPage
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
