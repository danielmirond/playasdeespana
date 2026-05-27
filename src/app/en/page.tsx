// src/app/en/page.tsx
import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import HeroEn from '@/components/home/HeroEn'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import ComunidadesEn from '@/components/home/ComunidadesEn'
import ClientBlocks from '@/components/home/ClientBlocks'
import BoatRentalCTA from '@/components/home/BoatRentalCTA'
import { getPlayas, getComunidades } from '@/lib/playas'
import en from '@/messages/en.json'

export const revalidate = 3600

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  alternates: {
    canonical: 'https://playas-espana.com/en',
    languages: { 'es': 'https://playas-espana.com', 'en': 'https://playas-espana.com/en' },
  },
  openGraph: {
    title: en.meta.og_title,
    description: en.meta.og_description,
    url: 'https://playas-espana.com/en',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

export default async function HomePageEn() {
  const [playas, comunidades] = await Promise.all([getPlayas(), getComunidades()])

  const porComunidad: Record<string, typeof playas[0]> = {}
  for (const p of playas) {
    if (!porComunidad[p.comunidad]) porComunidad[p.comunidad] = p
  }
  const destacadas = Object.values(porComunidad).slice(0, 12)

  return (
    <>
      <Nav />
      <main>
        <HeroEn />
        <Buscador locale="en" />
        <ClientBlocks locale="en" />
        <Destacadas playas={destacadas} locale="en" />
        <BoatRentalCTA locale="en" />
        <ComunidadesEn comunidades={comunidades} />
      </main>
    </>
  )
}
