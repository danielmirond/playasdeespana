import { getLocalitiesByCoast } from '@/lib/boat-rental-localities'
import Link from 'next/link'
import type { Metadata } from 'next'

interface ProvincePageParams {
  coast: string
  province: string
}

export const maxDuration = 30
export async function generateMetadata({ params }: { params: ProvincePageParams }): Promise<Metadata> {
  const decodedCoast = decodeURIComponent(params.coast)
  const decodedProvince = decodeURIComponent(params.province)
  const title = `Boat Rental in ${decodedProvince}, ${decodedCoast} | Playas de España`
  const description = `Browse boat rental options in ${decodedProvince}. Explore safe moorings, scenic beaches, and competitive rates.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default function ProvincePage({ params }: { params: ProvincePageParams }) {
  const decodedCoast = decodeURIComponent(params.coast)
  const decodedProvince = decodeURIComponent(params.province)
  const allLocalities = getLocalitiesByCoast(decodedCoast)
  const localities = allLocalities.filter(
    (loc) => loc.province.toLowerCase() === decodedProvince.toLowerCase()
  )

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 py-16 px-4 md:py-24 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Boat Rental in {decodedProvince}
          </h1>
          <p className="text-lg text-blue-50 max-w-2xl">
            Discover all available boat rental options and moorings in {decodedProvince}, {decodedCoast}.
          </p>
        </div>
      </section>

      {/* LOCALITIES */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localities.map((locality) => (
            <Link
              key={locality.slug}
              href={`/en/boat-rental/coasts/${params.coast}/provinces/${params.province}/${locality.slug}`}
              className="group border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                {locality.locality}
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                {locality.description}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{locality.beaches.length} Beaches</span>
                <span className="text-blue-600 font-semibold">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
