// src/components/common/TrustSeal.tsx
// C3 (auditoría CRO) — Sello "datos oficiales · cada hora".
// Refuerza confianza junto al score (ficha) y al buscador (home). Sin estado,
// sin fondo (cero CLS). El pulso del punto vive en globals.css (.trust-dot),
// gated por prefers-reduced-motion. Enlaza a /metodología.
import Link from 'next/link'

export default function TrustSeal({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const text = locale === 'en'
    ? 'Official data · updated hourly'
    : 'Datos oficiales · actualizados cada hora'
  const aria = locale === 'en'
    ? 'Official data updated hourly — see methodology'
    : 'Datos oficiales actualizados cada hora — ver metodología'
  return (
    <Link
      href="/metodologia"
      aria-label={aria}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: 11, letterSpacing: '.04em',
        color: 'var(--muted)', textDecoration: 'none',
      }}
    >
      <span
        className="trust-dot"
        aria-hidden="true"
        style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--excelente, #3d6b1f)', flex: '0 0 auto' }}
      />
      <span>{text}</span>
    </Link>
  )
}
