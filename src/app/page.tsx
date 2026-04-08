// src/app/page.tsx
import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import Hero from '@/components/home/Hero'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import Comunidades from '@/components/home/Comunidades'
import ClientBlocks from '@/components/home/ClientBlocks'
import { getPlayas, getComunidades } from '@/lib/playas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Playas de España — Estado del mar en tiempo real',
  description: 'Temperatura del agua, oleaje, calidad y servicios de las 5.611 playas españolas. Datos Open-Meteo y EEA actualizados cada hora.',
  openGraph: {
    title: 'Playas de España',
    description: 'Estado del mar en tiempo real',
    url: 'https://playas-espana.com',
    images: [{ url: '/api/og?playa=Playas+de+España', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [playas, comunidades] = await Promise.all([
    getPlayas(),
    getComunidades(),
  ])

  // Una por comunidad para diversidad geográfica
  const porComunidad: Record<string, typeof playas[0]> = {}
  for (const p of playas) {
    if (!porComunidad[p.comunidad]) porComunidad[p.comunidad] = p
  }
  const destacadas = Object.values(porComunidad).slice(0, 12)

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Buscador />
        <ClientBlocks />
        <Destacadas playas={destacadas} />
        <Comunidades comunidades={comunidades} />
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
          Playas de España
        </span>
        <nav style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <a href="/comunidades" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Comunidades</a>
          <a href="/banderas-azules" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Banderas Azules</a>
          <a href="/mapa" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Mapa</a>
        </nav>
        <span>Open-Meteo · EEA · OSM</span>
      </footer>
    </>
  )
}
