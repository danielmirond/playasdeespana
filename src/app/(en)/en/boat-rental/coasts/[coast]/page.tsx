import { getLocalitiesByCoast } from '@/lib/boat-rental-localities'
import Link from 'next/link'
import type { Metadata } from 'next'

// Next 16: params asíncrono -> await obligatorio.
interface CoastPageParams {
  coast: string
}

export async function generateMetadata({ params }: { params: Promise<CoastPageParams> }): Promise<Metadata> {
  const { coast } = await params
  const decodedCoast = decodeURIComponent(coast)
  const title = `Boat Rental in ${decodedCoast} | Playas de España`
  const description = `Rent boats in ${decodedCoast}. Discover all provinces and localities with safe moorings, accessible beaches, and competitive rates.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default async function CoastPage({ params }: { params: Promise<CoastPageParams> }) {
  const { coast } = await params
  const decodedCoast = decodeURIComponent(coast)
  const localities = getLocalitiesByCoast(decodedCoast)

  const provinces = new Map<string, typeof localities>()
  localities.forEach((locality) => {
    if (!provinces.has(locality.province)) {
      provinces.set(locality.province, [])
    }
    provinces.get(locality.province)!.push(locality)
  })

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 py-16 px-4 md:py-24 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Boat Rental in {decodedCoast}
          </h1>
          <p className="text-lg text-blue-50 max-w-2xl">
            Explore all provinces and localities in {decodedCoast} to find your next boat adventure.
          </p>
        </div>
      </section>

      {/* PROVINCES */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {Array.from(provinces.entries()).map(([province, provinceLocs]) => (
          <div key={province} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {province} Province
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {provinceLocs.map((locality) => (
                <Link
                  key={locality.slug}
                  href={`/en/boat-rental/coasts/${coast}/provinces/${locality.province.toLowerCase()}/${locality.slug}`}
                  className="group border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {locality.locality}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {locality.description}
                  </p>
                </Link>
              ))}
            </div>

            <Link
              href={`/en/boat-rental/coasts/${coast}/provinces/${province.toLowerCase()}`}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              View all in {province} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
