// src/app/mi-cuaderno/page.tsx — "Mi cuaderno de playas": la capa de
// pertenencia del sitio. Shell servidor (metadata + copy indexable que
// explica qué es) + CuadernoClient (localStorage: visitas, insignias,
// compartir). Sin cuentas: el cuaderno vive en el dispositivo, igual que
// favoritas y reportes.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import CuadernoClient from './CuadernoClient'

export const metadata: Metadata = {
  title: 'Mi cuaderno de playas | Tus playas visitadas e insignias',
  description: 'Marca "estuve aquí" en las playas que has pisado y colecciona insignias: dos mares, vuelta a España, cazador del top 100… Tu diario playero, sin registro y gratis.',
  alternates: { canonical: '/mi-cuaderno' },
}

export default function MiCuadernoPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Mi cuaderno</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 2.8rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, marginBottom: '.6rem', letterSpacing: '-.015em' }}>
          Mi cuaderno de <em style={{ fontWeight: 500, color: 'var(--accent)' }}>playas</em>
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.65, maxWidth: 640, marginBottom: '2rem' }}>
          Cada playa que pisas, apuntada; cada hito, una insignia. Pulsa
          «Estuve aquí» en la ficha de cualquier playa y este cuaderno se va
          escribiendo solo. Vive en tu dispositivo: sin registro, sin cuentas
          y sin darnos tu correo.
        </p>

        <CuadernoClient />
      </main>
    </>
  )
}
