import { getLocalityBySlug } from '@/lib/boat-rental-localities'
import { samboatAwinUrl } from '@/lib/boat-rental-helpers'
import { getBoatImage } from '@/lib/boat-images'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

// Next 16: params asíncrono -> await obligatorio.
interface LocalityPageParams {
  coast: string
  province: string
  locality: string
}

export async function generateMetadata({ params }: { params: Promise<LocalityPageParams> }): Promise<Metadata> {
  const { coast, province, locality: localitySlug } = await params
  const locality = getLocalityBySlug(localitySlug)

  if (!locality) {
    return {}
  }

  const canonical = `https://playas-espana.com/en/boat-rental/coasts/${coast}/provinces/${province}/${localitySlug}`
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

export default async function LocalityPage({ params }: { params: Promise<LocalityPageParams> }) {
  const { locality: localitySlug } = await params
  const locality = getLocalityBySlug(localitySlug)

  if (!locality) {
    notFound()
  }

  const afinityId = process.env.NEXT_PUBLIC_AWIN_AFFID || 'playasdeespana'
  const awinUrl = samboatAwinUrl(afinityId, locality.samboatUrl, `playasdeespana_en_${locality.slug}`)
  const hero = getBoatImage(locality.slug)

  // Merge beaches + moorings into one card per spot (same dedupe as the ES ficha).
  const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
  const moorByName = new Map(locality.moorings.map(m => [norm(m.name), m]))
  const usados = new Set<string>()
  const lugares = locality.beaches.map(b => {
    const m = moorByName.get(norm(b.name))
    if (m) usados.add(norm(b.name))
    return { ...b, mooring: m }
  }) as Array<{ name: string; distance: string; description: string; mooring?: (typeof locality.moorings)[number] }>
  for (const m of locality.moorings) {
    if (!usados.has(norm(m.name))) lugares.push({ name: m.name, distance: '', description: m.description, mooring: m })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO — real photo (Wikimedia/Openverse) with gradient for legibility */}
      <section
        className="relative bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 py-16 px-4 md:py-24 text-white"
        style={hero ? { background: `linear-gradient(135deg, rgba(12,74,110,.82), rgba(8,145,178,.62)), url('${hero.url}') center/cover` } : undefined}
      >
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
        {hero?.credit && (
          <span className="absolute right-2 bottom-1 text-[10px] text-white/70" style={{ textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>
            Photo: {hero.credit} · Wikimedia
          </span>
        )}
      </section>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* BEACHES + MOORINGS (merged: most localities repeat the same spot in both lists) */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Beaches, Coves &amp; Anchorages by Boat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lugares.map((l, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">{l.name}</h3>
                {l.distance && <p className="text-sm text-gray-600 mb-2">{l.distance}</p>}
                <p className="text-sm text-gray-600">{l.description}</p>
                {l.mooring && (
                  <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-dashed border-gray-200">
                    ⚓ Anchorage ~{l.mooring.depth}m · {l.mooring.protection} protection
                  </p>
                )}
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
            rel="noopener noreferrer sponsored"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Boats on SamBoat →
          </a>
        </section>
      </div>
    </div>
  )
}
