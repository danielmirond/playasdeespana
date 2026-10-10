// src/app/rutas/configurar/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import ConfiguradorRuta from './ConfiguradorRuta'

export const metadata: Metadata = {
  title: 'Configura tu ruta de playas | Playas de España',
  description: 'Crea tu propia ruta de playas por cualquier costa de España. Elige costa, número de paradas, filtros y abre el itinerario en Google Maps.',
  alternates: { canonical: '/rutas/configurar' },
}

export default function ConfigurarPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/rutas" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Rutas</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Configurar</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
          fontWeight: 700, letterSpacing: '-.025em', color: 'var(--ink)',
          lineHeight: 1.1, marginBottom: '.4rem',
        }}>
          Configura tu ruta de playas
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2rem', maxWidth: 520, lineHeight: 1.6 }}>
          Elige una costa, ajusta el número de paradas y filtra por servicios.
          Te generamos el itinerario optimizado con enlace directo a Google Maps.
        </p>

        <ConfiguradorRuta />
      </main>
    </>
  )
}
