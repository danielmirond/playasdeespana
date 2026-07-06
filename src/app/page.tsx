// src/app/page.tsx. Homepage orientada a producto.
//
// Estructura:
//   1. Hero. "¿A qué playa voy hoy?" + CTAs
//   2. Buscador (con filtros funcionales)
//   3. Top playas hoy (por score 0-100 real)
//   4. Evita hoy (playas con peor score)
//   5. Favoritas + Cercanas (client blocks)
//   6. Hub SEO: comunidades + banderas + perros + nudistas
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hero from '@/components/home/Hero'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import Comunidades from '@/components/home/Comunidades'
import ClientBlocks from '@/components/home/ClientBlocks'
import TopCercanas from '@/components/home/TopCercanas'
import ActividadesHoy from '@/components/home/ActividadesHoy'
import ParkingHoy from '@/components/home/ParkingHoy'
import MonetizacionBlock from '@/components/home/MonetizacionBlock'
import BoatRentalCTA from '@/components/home/BoatRentalCTA'
import MagazineCarrusel from '@/components/home/MagazineCarrusel'
import { getPlayas, getComunidades } from '@/lib/playas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Playas de España | ¿A qué playa voy hoy?',
  description: 'Estado del mar en tiempo real en más de 5.000 playas de España. Temperatura del agua, oleaje, viento y servicios. Datos actualizados cada hora.',
  alternates: {
    canonical: '/',
    languages: {
      'es':        '/',
      'en':        '/en',
      'x-default': '/en',  // Tráfico fuera de España → versión EN.
    },
  },
  openGraph: {
    title: 'Playas de España | ¿A qué playa voy hoy?',
    description: 'Consulta el estado del mar en más de 5.000 playas españolas.',
    url: 'https://playas-espana.com',
    images: [{ url: '/api/og?playa=Playas+de+España', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [playas, comunidades] = await Promise.all([
    getPlayas(),
    getComunidades(),
  ])

  // Seleccionar ~48 candidatas: 2 bien equipadas + 2 al azar por comunidad.
  // La mezcla es clave: las bien equipadas compiten por "Top playas hoy" y
  // las aleatorias (que pueden tener pocos servicios o malas condiciones)
  // alimentan "Evita hoy". Sin diversidad de candidatas, "Evita" queda
  // siempre vacío porque las mejores playas NUNCA bajan de 45.
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

  // Rotación diaria del pool: cada día entra un tramo distinto del ranking de
  // calidad de cada comunidad, para que no compitan SIEMPRE las mismas cabezas
  // de lista. Combinado con la rotación por meteo de Destacadas (cada 4h),
  // la home deja de repetir las mismas playas.
  const ROT_DIA = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const N_CALIDAD = 12 // candidatas de calidad por comunidad (pool amplio → rotación real)

  for (const com of COSTERAS) {
    const list = porComunidad.get(com) ?? []
    if (list.length === 0) continue

    // Pool de calidad de la comunidad (bandera azul / servicios).
    const calidad = list
      .map(p => ({
        p,
        pts: (p.bandera ? 3 : 0) + (p.socorrismo ? 2 : 0) + (p.parking ? 1 : 0) + (p.duchas ? 1 : 0),
      }))
      .filter(x => x.pts >= 2)
      .sort((a, b) => b.pts - a.pts)
      .map(x => x.p)

    const pool = calidad.length ? calidad : list
    const n = Math.min(N_CALIDAD, pool.length)
    // Ventana rotatoria: el punto de partida avanza cada día.
    const start = pool.length > n ? (ROT_DIA * 3) % pool.length : 0
    for (let k = 0; k < n; k++) candidatas.push(pool[(start + k) % pool.length])

    // 1 de baja calidad (rotatoria) para alimentar "Evita hoy".
    const malas = list.filter(p => !calidad.includes(p))
    if (malas.length) candidatas.push(malas[(ROT_DIA + com.length) % malas.length])
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TopCercanas />
        <Buscador />
        <Suspense fallback={
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.75rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, height: 220, animation: 'fadeIn .3s ease both' }} />
              ))}
            </div>
          </div>
        }>
          <Destacadas playas={candidatas} topCount={6} avoidCount={3} />
        </Suspense>
        <div className="cv-auto"><ParkingHoy playas={playas} /></div>
        <div className="cv-auto"><ActividadesHoy playas={playas} /></div>
        <div className="cv-auto"><MonetizacionBlock /></div>
        <div className="cv-auto"><BoatRentalCTA locale="es" /></div>
        <div className="cv-auto"><ClientBlocks /></div>
        <div className="cv-auto"><MagazineCarrusel locale="es" /></div>
        <div className="cv-auto"><Comunidades comunidades={comunidades} /></div>

        {/* Hub SEO — design system v1 §08: "Explora por tema" */}
        <section style={{
          maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 1rem',
          borderTop: '1px solid var(--line)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700,
            color: 'var(--ink)', margin: '0 0 1.5rem', letterSpacing: '-.015em',
            lineHeight: 1.1,
          }}>
            Explora por <em style={{ fontWeight: 500, color: 'var(--accent)' }}>tema</em>
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '.75rem',
          }}>
            {[
              { href: '/playas-perros', label: 'Playas para perros', count: playas.filter(p => p.perros).length },
              { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas', count: playas.filter(p => p.composicion?.toLowerCase().includes('arena')).length || 612 },
              { href: '/surf', label: 'Mejores para surf', count: 148 },
              { href: '/banderas-azules', label: 'Bandera Azul 2026', count: playas.filter(p => p.bandera).length },
              { href: '/campings', label: 'Con camping cerca', count: 827 },
              { href: '/playas-nudistas', label: 'Playas nudistas', count: playas.filter(p => p.nudista).length },
              { href: '/playas-accesibles', label: 'Accesibles PMR', count: playas.filter(p => p.accesible).length },
              { href: '/playas-cerca-de-mi', label: 'Cerca de mí', count: playas.length },
              { href: '/mapa', label: 'Mapa interactivo', count: playas.length },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.15rem 1.25rem',
                background: 'var(--surface, #faf4e6)', border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm, 4px)', textDecoration: 'none',
                transition: 'border-color .15s, transform .15s',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.1, color: 'var(--ink)' }}>{item.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.15rem', fontFamily: 'var(--font-mono)' }}>{item.count.toLocaleString('es')} playas</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="9,6 15,12 9,18"/></svg>
              </Link>
            ))}
          </div>
        </section>

        {/* EEAT · Por qué confiar en nuestros datos */}
        <section aria-labelledby="eeat-title" style={{
          maxWidth: 1000, margin: '3rem auto 0', padding: '2.5rem 1.5rem 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Transparencia editorial
          </div>
          <h2 id="eeat-title" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3.8vw, 2rem)',
            fontWeight: 700, color: 'var(--ink)',
            lineHeight: 1.1, letterSpacing: '-.015em',
            marginBottom: '.5rem',
          }}>
            Datos <em style={{ fontWeight: 500, color: 'var(--accent)' }}>independientes</em> de fuentes oficiales
          </h2>
          <p style={{
            fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.65,
            maxWidth: 640, marginBottom: '1.5rem',
          }}>
            Cada score 0–100 combina siete factores calculados con APIs oficiales, actualizadas
            cada hora. Ninguna playa, municipio o anunciante puede comprar posición.
          </p>

          {/* Grid de fuentes con URL (señal EEAT explícita) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '.5rem',
            marginBottom: '1.25rem',
          }}>
            {[
              { nombre: 'Open-Meteo',        rol: 'Oleaje y viento',       ref: 'open-meteo.com',   href: 'https://open-meteo.com' },
              { nombre: 'MITECO',            rol: 'Inventario oficial',    ref: 'miteco.gob.es',     href: 'https://www.miteco.gob.es' },
              { nombre: 'EEA',               rol: 'Calidad del agua',      ref: 'eea.europa.eu',     href: 'https://www.eea.europa.eu' },
              { nombre: 'ADEAC',             rol: 'Bandera Azul',          ref: 'adeac.es',          href: 'https://www.adeac.es' },
              { nombre: 'IGN · CartoCiudad', rol: 'Cartografía',           ref: 'ign.es',            href: 'https://www.ign.es' },
              { nombre: 'OpenStreetMap',     rol: 'Servicios y POI',       ref: 'openstreetmap.org', href: 'https://www.openstreetmap.org' },
            ].map(f => (
              <a
                key={f.nombre}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '.15rem',
                  padding: '.75rem .9rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  transition: 'border-color .15s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '.88rem', color: 'var(--ink)',
                }}>
                  {f.nombre}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 500 }}>
                  {f.rol}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '.65rem', color: 'var(--muted)',
                  marginTop: '.15rem', opacity: .85,
                }}>
                  {f.ref} ↗
                </div>
              </a>
            ))}
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem',
            alignItems: 'center',
            fontSize: '.82rem',
          }}>
            <Link
              href="/metodologia"
              style={{
                color: 'var(--accent)', fontWeight: 500,
                textDecoration: 'none',
                borderBottom: '1px solid var(--accent)',
                paddingBottom: 1,
              }}
            >
              Ver metodología completa →
            </Link>
            <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
              Última revisión del método:{' '}
              <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                abril 2026
              </span>
            </span>
          </div>
        </section>
      </main>
    </>
  )
}
