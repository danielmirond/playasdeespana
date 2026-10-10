import type { Metadata } from 'next'
import FloatingBoatCTA from '@/components/FloatingBoatCTA'

export const metadata: Metadata = {
  title: 'Alquiler de barcos en España: compara por costa y localidad',
  description: 'Alquila barco en cualquier costa española: con o sin licencia, con patrón, precios por temporada y calas accesibles solo por mar. Compara en SamBoat.',
  openGraph: {
    title: 'Alquiler de barcos en España',
    description: 'Compara alquiler de barcos por costa y localidad: precios, fondeos y calas accesibles solo por mar.',
    type: 'website',
    url: 'https://playas-espana.com/alquiler-barco',
  },
}

export default function BoatRentalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingBoatCTA />
    </>
  )
}
