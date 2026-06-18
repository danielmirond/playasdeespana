// src/components/playa/ContextualCTA.tsx
// C1 — tarjeta CTA contextual, renderizada tras "Estado de hoy" en la ficha.
// Tono según partner (mar = barco, accent = resto). SSR, indexable, sin CLS.
// data-cta + data-intent → eventos GA4 (intent_click) ya instrumentados.
import Link from 'next/link'
import { pickContextualCTA } from '@/lib/cta/contextualCTA'
import type { Playa } from '@/types'

export default function ContextualCTA({
  playa, meteo, locale = 'es',
}: {
  playa: Playa
  meteo: { estado?: string; olas?: number }
  locale?: 'es' | 'en'
}) {
  const cta = pickContextualCTA(playa, meteo, locale)
  const bg = cta.tone === 'mar' ? 'var(--mar-700, #2d5266)' : 'var(--accent, #6b400a)'
  return (
    <Link
      href={cta.href}
      data-cta="contextual"
      data-intent={cta.intent}
      aria-label={cta.title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        background: bg, color: 'var(--arena-100, #f5ecd5)',
        borderRadius: 10, padding: '0.95rem 1.2rem', minHeight: 44,
        textDecoration: 'none', boxShadow: 'var(--shadow-sm)', margin: '0 0 1.25rem',
      }}
    >
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{cta.title}</span>
        <span style={{ display: 'block', fontSize: '.85rem', opacity: .85, marginTop: '.2rem', lineHeight: 1.4 }}>{cta.sub}</span>
      </span>
      <span aria-hidden="true" style={{ flex: '0 0 auto', fontWeight: 800, fontSize: '1.2rem' }}>→</span>
    </Link>
  )
}
