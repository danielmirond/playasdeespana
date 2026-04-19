'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, X } from '@phosphor-icons/react'
import { useState, useEffect, useCallback, useRef } from 'react'

// Consentimiento granular por categoría (AEPD/LSSI-CE + RGPD).
// Categorías:
// - tecnicas: estrictamente necesarias (exentas art. 22.2 LSSI)
// - analiticas: Google Analytics 4 — requiere consentimiento
// - marketing: AdSense + afiliados — requiere consentimiento
export interface CookieConsent {
  tecnicas:   true
  analiticas: boolean
  marketing:  boolean
  timestamp:  number
}

const LS_KEY = 'cookie_consent_v2'

export function readConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CookieConsent
  } catch {
    return null
  }
}

export function hasConsent(cat: 'analiticas' | 'marketing'): boolean {
  const c = readConsent()
  return c?.[cat] ?? false
}

function saveConsent(c: CookieConsent) {
  localStorage.setItem(LS_KEY, JSON.stringify(c))
  window.dispatchEvent(new Event('cookie-consent-change'))
}

const t = {
  es: {
    titulo:      'Cookies',
    texto:       'Usamos cookies técnicas (necesarias) y, con tu permiso, analíticas y de marketing. Puedes aceptar, rechazar o configurar.',
    tecnicas:    'Técnicas (siempre activas)',
    tecnicasDesc:'Necesarias para que la web funcione (consentimiento, favoritos, reportes).',
    analiticas:  'Analíticas',
    analiticasDesc: 'Google Analytics 4 — tráfico anónimo.',
    marketing:   'Marketing y afiliación',
    marketingDesc:  'Google AdSense, enlaces de afiliados (Booking, Amazon, etc.).',
    aceptarTodo: 'Aceptar',
    rechazar:    'Rechazar',
    configurar:  'Configurar',
    guardar:     'Guardar',
    politica:    'Política de cookies',
    cerrar:      'Cerrar (rechazar opcionales)',
  },
  en: {
    titulo:      'Cookies',
    texto:       'We use technical cookies (required) and, with your permission, analytics and marketing. You can accept, reject or configure.',
    tecnicas:    'Technical (always on)',
    tecnicasDesc:'Required for the site to work (consent, favourites, reports).',
    analiticas:  'Analytics',
    analiticasDesc: 'Google Analytics 4 — anonymous traffic.',
    marketing:   'Marketing & affiliates',
    marketingDesc:  'Google AdSense, affiliate links (Booking, Amazon, etc.).',
    aceptarTodo: 'Accept',
    rechazar:    'Reject',
    configurar:  'Configure',
    guardar:     'Save',
    politica:    'Cookie policy',
    cerrar:      'Close (reject optional)',
  },
}

export default function CookieBanner() {
  const pathname = usePathname()
  const locale = pathname.startsWith('/en') ? 'en' : 'es'
  const i18n = t[locale]
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analiticas, setAnaliticas] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const existing = readConsent()
    if (!existing) setVisible(true)
    else {
      setAnaliticas(existing.analiticas)
      setMarketing(existing.marketing)
    }
  }, [])

  const accept = useCallback((analytics: boolean, mkt: boolean) => {
    saveConsent({
      tecnicas: true,
      analiticas: analytics,
      marketing: mkt,
      timestamp: Date.now(),
    })
    setVisible(false)
  }, [])

  // ESC cierra rechazando opcionales (UX esperada)
  useEffect(() => {
    if (!visible) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') accept(false, false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, accept])

  // Al abrir detalles, focus en el primer toggle (a11y)
  useEffect(() => {
    if (showDetails && rootRef.current) {
      const first = rootRef.current.querySelector<HTMLInputElement>('input[type="checkbox"]:not(:disabled)')
      first?.focus()
    }
  }, [showDetails])

  if (!visible) return null

  const btnBase: React.CSSProperties = {
    padding: '.55rem 1.1rem',
    borderRadius: 100,
    fontSize: '.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 40,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={i18n.titulo}
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        maxWidth: 540,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'var(--card-bg, #faf6ef)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 6,
        padding: '.85rem 1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '.6rem',
        fontSize: '.85rem',
        animation: 'cbSlideUp .25s cubic-bezier(.4,0,.2,1) both',
        willChange: 'transform',
      }}
    >
      {/* Close button (top-right) — rechaza opcionales, UX esperada */}
      <button
        type="button"
        onClick={() => accept(false, false)}
        aria-label={i18n.cerrar}
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 32, height: 32, borderRadius: '50%',
          border: 'none', background: 'transparent', color: '#8a7560',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X size={16} weight="bold" aria-hidden="true" />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.6rem', paddingRight: '2rem' }}>
        <ShieldCheck size={18} weight="bold" color="var(--accent,#6b400a)" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ margin: 0, fontSize: '.82rem', lineHeight: 1.55, color: '#4a3520' }}>
          <strong style={{ color: '#2a1a08' }}>{i18n.titulo}.</strong>{' '}
          {i18n.texto}{' '}
          <Link href={locale === 'en' ? '/en/cookies' : '/cookies'} style={{ color: '#6b400a', textDecoration: 'underline' }}>
            {i18n.politica}
          </Link>
        </p>
      </div>

      {/* Detalle granular */}
      {showDetails && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', paddingLeft: '1.6rem' }}>
          <Toggle checked disabled label={i18n.tecnicas} desc={i18n.tecnicasDesc} />
          <Toggle checked={analiticas} onChange={setAnaliticas} label={i18n.analiticas} desc={i18n.analiticasDesc} />
          <Toggle checked={marketing} onChange={setMarketing} label={i18n.marketing} desc={i18n.marketingDesc} />
        </div>
      )}

      {/* Botones — equilibrados (anti dark-pattern AEPD) */}
      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!showDetails ? (
          <>
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              style={{ ...btnBase, border: 'none', background: 'transparent', color: '#5a3d12', marginRight: 'auto', textDecoration: 'underline' }}
            >
              {i18n.configurar}
            </button>
            <button
              type="button"
              onClick={() => accept(false, false)}
              style={{ ...btnBase, border: '1.5px solid #6b400a', background: 'transparent', color: '#6b400a' }}
            >
              {i18n.rechazar}
            </button>
            <button
              type="button"
              onClick={() => accept(true, true)}
              style={{ ...btnBase, border: 'none', background: '#6b400a', color: '#fff' }}
            >
              {i18n.aceptarTodo}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => accept(false, false)}
              style={{ ...btnBase, border: '1.5px solid #6b400a', background: 'transparent', color: '#6b400a', marginRight: 'auto' }}
            >
              {i18n.rechazar}
            </button>
            <button
              type="button"
              onClick={() => accept(analiticas, marketing)}
              style={{ ...btnBase, border: 'none', background: '#6b400a', color: '#fff' }}
            >
              {i18n.guardar}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Toggle({ checked, disabled, onChange, label, desc }: {
  checked:   boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
  label:     string
  desc:      string
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '.5rem',
      fontSize: '.78rem', cursor: disabled ? 'default' : 'pointer',
      padding: '.3rem 0',
    }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        style={{ accentColor: '#6b400a', width: 18, height: 18, flexShrink: 0 }}
      />
      <div>
        <div style={{ fontWeight: 700, color: '#2a1a08' }}>{label}</div>
        <div style={{ fontSize: '.7rem', color: '#8a7560', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </label>
  )
}
