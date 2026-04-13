// src/app/page.tsx — Homepage orientada a producto.
//
// Estructura:
//   1. Hero — "¿A qué playa voy hoy?" + CTAs
//   2. Buscador (con filtros funcionales)
//   3. Top playas hoy (por score 0-100 real)
//   4. Evita hoy (playas con peor score)
//   5. Favoritas + Cercanas (client blocks)
//   6. Hub SEO: comunidades + banderas + perros + nudistas
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hero from '@/components/home/Hero'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import Comunidades from '@/components/home/Comunidades'
import ClientBlocks from '@/components/home/ClientBlocks'
import { getPlayas, getComunidades } from '@/lib/playas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Playas de España — ¿A qué playa voy hoy?',
  description: 'Motor de decisión en tiempo real: puntuamos cada playa de 0 a 100 según el viento, oleaje, temperatura y servicios. Elige la mejor playa para hoy.',
  openGraph: {
    title: 'Playas de España — ¿A qué playa voy hoy?',
    description: 'Puntuamos cada playa de 0 a 100 en tiempo real.',
    url: 'https://playas-espana.com',
    images: [{ url: '/api/og?playa=Playas+de+España', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [playas, comunidades] = await Promise.all([
    getPlayas(),
    getComunidades(),
  ])

  // Seleccionar ~30 candidatas geográficamente diversas y bien equipadas
  // para que el score tenga sentido. 3 por cada comunidad costera, preferimos
  // playas con socorrismo / bandera / parking (más comparables).
  const candidatas: typeof playas = []
  const porComunidad = new Map<string, typeof playas>()
  for (const p of playas) {
    if (!p.lat || !p.lng) continue
    const list = porComunidad.get(p.comunidad) ?? []
    list.push(p)
    porComunidad.set(p.comunidad, list)
  }

  const COSTERAS = ['Galicia', 'Asturias', 'Cantabria', 'País Vasco',
    'Cataluña', 'Comunitat Valenciana', 'Murcia', 'Andalucía',
    'Islas Baleares', 'Canarias', 'Ceuta', 'Melilla']

  for (const com of COSTERAS) {
    const list = porComunidad.get(com) ?? []
    // Priorizar las que tienen más servicios (heurística rápida)
    const scored = list.map(p => ({
      p,
      pts: (p.bandera ? 3 : 0) + (p.socorrismo ? 2 : 0) + (p.parking ? 1 : 0) + (p.duchas ? 1 : 0),
    })).sort((a, b) => b.pts - a.pts)
    candidatas.push(...scored.slice(0, 3).map(x => x.p))
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Buscador />
        <Destacadas playas={candidatas} topCount={8} avoidCount={4} />
        <ClientBlocks />
        <Comunidades comunidades={comunidades} />

        {/* Hub SEO — links a secciones temáticas */}
        <section style={{
          maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 1rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 800,
            color: 'var(--ink)', margin: '0 0 1rem', letterSpacing: '-.015em',
          }}>
            Descubre más
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '.55rem',
          }}>
            {[
              { href: '/banderas-azules', label: 'Banderas Azules', count: playas.filter(p => p.bandera).length },
              { href: '/playas-perros', label: 'Playas para perros', count: playas.filter(p => p.perros).length },
              { href: '/playas-nudistas', label: 'Playas nudistas', count: playas.filter(p => p.nudista).length },
              { href: '/comunidades', label: 'Todas las comunidades', count: comunidades.length },
              { href: '/mapa', label: 'Mapa interactivo', count: playas.length },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.85rem 1.1rem',
                background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                borderRadius: 12, textDecoration: 'none',
                transition: 'all .15s',
              }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{item.label}</span>
                <span style={{
                  fontSize: '.78rem', fontWeight: 700, color: 'var(--accent)',
                  background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))',
                  padding: '.2rem .55rem', borderRadius: 100,
                }}>{item.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '1.75rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
        maxWidth: '1000px', margin: '0 auto',
        fontSize: '.78rem', color: 'var(--muted)',
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: '.9rem' }}>
          Playas de España
        </span>
        <nav style={{ display: 'flex', gap: '.85rem', flexWrap: 'wrap' }}>
          <Link href="/comunidades" style={{ color: 'var(--muted)' }}>Comunidades</Link>
          <Link href="/banderas-azules" style={{ color: 'var(--muted)' }}>Banderas Azules</Link>
          <Link href="/playas-perros" style={{ color: 'var(--muted)' }}>Perros</Link>
          <Link href="/playas-nudistas" style={{ color: 'var(--muted)' }}>Nudistas</Link>
          <Link href="/mapa" style={{ color: 'var(--muted)' }}>Mapa</Link>
        </nav>
        <span>Open-Meteo · MITECO · IGN · OSM</span>
      </footer>
    </>
  )
}
