'use client'
// C2 (auditoría CRO) — continuidad del deep-link ficha → hub.
// Si el hub recibe ?near=<slug-playa> (desde el ContextualCTA de una ficha),
// muestra un breadcrumb "← volver a {playa}" para mantener el calor de la
// intención. Lectura en CLIENTE dentro de <Suspense> → la página sigue siendo
// estática/ISR e indexable (sin ?near = versión genérica, canonical intacto).
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function pretty(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function Inner({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const near = useSearchParams().get('near')
  if (!near) return null
  const base = locale === 'en' ? '/en/beaches' : '/playas'
  return (
    <Link
      href={`${base}/${near}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '.4rem',
        margin: '0 0 1rem', padding: '.4rem .8rem', borderRadius: 999,
        background: 'var(--card-bg, #faf4e6)', border: '1px solid var(--line)',
        color: 'var(--accent)', fontWeight: 600, fontSize: '.82rem', textDecoration: 'none',
      }}
    >
      ← {locale === 'en' ? 'Back to' : 'Volver a'} {pretty(near)}
    </Link>
  )
}

export default function NearContext({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  return (
    <Suspense fallback={null}>
      <Inner locale={locale} />
    </Suspense>
  )
}
