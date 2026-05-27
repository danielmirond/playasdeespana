import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boat Rental in Spain | Playas de España',
  description: 'Rent boats across Spanish coasts. Safe moorings, beautiful beaches, competitive prices. Book with SamBoat.',
  keywords: 'boat rental Spain, catamaran rental, yacht rental, sailing boats',
  openGraph: {
    title: 'Boat Rental in Spain',
    description: 'Discover the best boat rental offers across Spanish coasts',
    type: 'website',
    url: 'https://playas-espana.com/en/boat-rental',
  },
}

export default function BoatRentalLayout({ children }: { children: React.ReactNode }) {
  return children
}
