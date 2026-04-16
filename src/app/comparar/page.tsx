import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import ComparadorPlayas from './ComparadorPlayas'

export const metadata: Metadata = {
  title: 'Comparar playas — ¿Cuál es mejor hoy?',
  description: 'Compara 2 o 3 playas lado a lado: puntuación en tiempo real, viento, oleaje, temperatura, servicios y accesibilidad.',
  alternates: { canonical: '/comparar' },
}

export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Comparar playas</span>
        </nav>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
          fontWeight: 900, color: 'var(--ink)', marginBottom: '.4rem',
        }}>
          Comparar playas
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2rem', maxWidth: 500 }}>
          Elige 2 o 3 playas y compáralas lado a lado con puntuación en tiempo real.
          Te decimos cuál es mejor hoy.
        </p>
        <ComparadorPlayas />
      </main>
    </>
  )
}
