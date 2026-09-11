// src/app/not-found.tsx. Custom 404 with beach suggestions
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import type { Metadata } from 'next'

// `noindex` explícito. Hasta sep-2026 esta página se servía con código 200
// en fichas, municipios, provincias y tablas de mareas —el `loading.tsx` de
// esas rutas empezaba a enviar la respuesta antes del `notFound()`— y heredaba
// el `index, follow` del layout: cualquier URL inexistente era indexable, y
// Search Console tenía 158 fichas inexistentes recibiendo impresiones. Los
// `loading.tsx` se han retirado; esto es la segunda red, por si el estado
// vuelve a colarse como 200 por otro camino.
export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main role="main" style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem 1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }} aria-hidden="true">🌊</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700,
          color: 'var(--ink)', marginBottom: '.5rem',
        }}>
          Playa no encontrada
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--muted)', maxWidth: 420, marginBottom: '2rem', lineHeight: 1.6 }}>
          La página que buscas no existe o ha cambiado de dirección.
          Pero hay más de 4.400 playas esperándote.
        </p>
        <div style={{ display: 'flex', gap: '.55rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" style={{
            background: 'var(--accent)', color: '#fff',
            padding: '.75rem 1.25rem', borderRadius: 6,
            fontSize: '.92rem', fontWeight: 800, textDecoration: 'none',
            minHeight: 44, display: 'inline-flex', alignItems: 'center',
          }}>
            Ir al inicio
          </Link>
          <Link href="/buscar" style={{
            background: 'var(--card-bg)', color: 'var(--accent)',
            border: '1px solid var(--line)',
            padding: '.65rem 1.15rem', borderRadius: 4,
            fontSize: '.85rem', fontWeight: 700, textDecoration: 'none',
            minHeight: 44, display: 'inline-flex', alignItems: 'center',
          }}>
            Buscar playas
          </Link>
          <Link href="/rutas" style={{
            background: 'var(--card-bg)', color: 'var(--accent)',
            border: '1px solid var(--line)',
            padding: '.65rem 1.15rem', borderRadius: 4,
            fontSize: '.85rem', fontWeight: 700, textDecoration: 'none',
            minHeight: 44, display: 'inline-flex', alignItems: 'center',
          }}>
            Ver rutas
          </Link>
        </div>
      </main>
    </>
  )
}
