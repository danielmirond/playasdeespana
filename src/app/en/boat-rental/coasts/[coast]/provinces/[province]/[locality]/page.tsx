import { getLocalityBySlug } from '@/lib/boat-rental-localities'
import { samboatAwinUrl } from '@/lib/boat-rental-helpers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

interface LocalityPageParams {
  coast: string
  province: string
  locality: string
}

export const maxDuration = 30
export async function generateMetadata({ params }: { params: LocalityPageParams }): Promise<Metadata> {
  const locality = getLocalityBySlug(params.locality)

  if (!locality) {
    return {}
  }

  const canonical = `https://playas-espana.com/en/boat-rental/coasts/${params.coast}/provinces/${params.province}/${params.locality}`
  const title = `Rent Boats in ${locality.locality} | Playas de España`
  const description = locality.description.substring(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    alternates: {
      canonical,
    },
  }
}

export default function LocalityPage({ params }: { params: LocalityPageParams }) {
  const locality = getLocalityBySlug(params.locality)

  if (!locality) {
    notFound()
  }

  const afinityId = process.env.NEXT_PUBLIC_AWIN_AFFID || 'playasdeespana'
  const awinUrl = samboatAwinUrl(afinityId, locality.samboatUrl, `playasdeespana_en_${locality.slug}`)

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 py-16 px-4 md:py-24 text-white">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-4">
            <Link href="/en/boat-rental" className="text-blue-50 hover:text-white">
              ← Back to Boat Rental
            </Link>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Rent Boats in {locality.locality}
          </h1>
          <p className="text-lg text-blue-50 max-w-2xl">
            {locality.description}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* BEACHES */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Accessible Beaches by Boat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locality.beaches.map((beach, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">{beach.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{beach.distance}</p>
                <p className="text-sm text-gray-600">{beach.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MOORINGS */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Recommended Moorings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locality.moorings.map((mooring, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">{mooring.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Depth: {mooring.depth}m</p>
                  <p>Protection: {mooring.protection}</p>
                  <p>{mooring.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Rental Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Small Boats</h3>
              <p className="text-lg font-bold text-blue-600 mb-1">
                €{locality.pricing.small.min} - €{locality.pricing.small.max}
              </p>
              <p className="text-sm text-gray-600">Per day</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Medium Boats</h3>
              <p className="text-lg font-bold text-blue-600 mb-1">
                €{locality.pricing.medium.min} - €{locality.pricing.medium.max}
              </p>
              <p className="text-sm text-gray-600">Per day</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">With Captain</h3>
              <p className="text-lg font-bold text-blue-600 mb-1">
                €{locality.pricing.captain.min} - €{locality.pricing.captain.max}
              </p>
              <p className="text-sm text-gray-600">Per day</p>
            </div>
          </div>
        </section>

        {/* INFO */}
        <section className="mb-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Best Season</h3>
              <p className="text-gray-600">{locality.bestSeason}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Insider Tip</h3>
              <p className="text-gray-600">{locality.insiderTip}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {locality.faq && locality.faq.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {locality.faq.map((item, idx) => (
                <details key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-bold text-gray-900 cursor-pointer">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Rent?</h2>
          <p className="mb-6 text-blue-100">Browse available boats and book your adventure on SamBoat</p>
          <a
            href={awinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Boats on SamBoat →
          </a>
        </section>
      </div>
    </div>
  )
}
