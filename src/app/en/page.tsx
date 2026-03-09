// src/app/en/page.tsx
import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import HeroEn from '@/components/home/HeroEn'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import ComunidadesEn from '@/components/home/ComunidadesEn'
import ClientBlocks from '@/components/home/ClientBlocks'
import { getPlayas, getComunidades } from '@/lib/playas'
import en from '@/messages/en.json'

export const revalidate = 3600

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  alternates: {
    canonical: 'https://playasdeespana.es/en',
    languages: { 'es': 'https://playasdeespana.es', 'en': 'https://playasdeespana.es/en' },
  },
  openGraph: {
    title: en.meta.og_title,
    description: en.meta.og_description,
    url: 'https://playasdeespana.es/en',
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
        <ComunidadesEn comunidades={comunidades} />
      </main>
      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '1.75rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
        maxWidth: '1000px', margin: '0 auto',
        fontSize: '.75rem', color: 'var(--muted)',
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: '.9rem' }}>
          Beaches of Spain
        </span>
        <span>{en.footer.data_sources}</span>
      </footer>
    </>
  )
}
