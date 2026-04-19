'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck } from '@phosphor-icons/react'
import { useState, useEffect, useCallback } from 'react'

// Categorías de cookies según AEPD/LSSI-CE:
// - tecnicas: estrictamente necesarias (exentas de consentimiento)
// - analiticas: Google Analytics 4 — requieren consentimiento
// - marketing: AdSense, afiliados — requieren consentimiento
export interface CookieConsent {
  tecnicas:   true       // siempre true (exentas)
  analiticas: boolean
  marketing:  boolean
  timestamp:  number     // Date.now() del consentimiento
}

const LS_KEY = 'cookie_consent_v2'

/** Lee el consentimiento actual. Retorna null si no hay. */
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

/** Comprueba si una categoría está consentida. */
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
    titulo:      'Configuración de cookies',
    texto:       'Usamos cookies propias y de terceros. Las técnicas son necesarias para que la web funcione. Las analíticas nos ayudan a entender cómo usas la web. Las de marketing permiten mostrar anuncios relevantes y enlaces de afiliación.',
    tecnicas:    'Técnicas (necesarias)',
    tecnicasDesc:'Sesión, preferencias de idioma, consentimiento. Siempre activas.',
    analiticas:  'Analíticas',
    analiticasDesc: 'Google Analytics 4 — datos anónimos de tráfico.',
    marketing:   'Marketing y afiliación',
    marketingDesc:  'Google AdSense, cookies de afiliados (Booking, Amazon, etc.).',
    aceptarTodo: 'Aceptar todo',
    rechazarOpcionales: 'Solo necesarias',
    guardar:     'Guardar preferencias',
    politica:    'Política de cookies',
  },
  en: {
    titulo:      'Cookie settings',
    texto:       'We use our own and third-party cookies. Technical cookies are necessary for the site to work. Analytics help us understand how you use the site. Marketing cookies enable relevant ads and affiliate links.',
    tecnicas:    'Technical (necessary)',
    tecnicasDesc:'Session, language, consent. Always active.',
    analiticas:  'Analytics',
    analiticasDesc: 'Google Analytics 4 — anonymous traffic data.',
    marketing:   'Marketing & affiliates',
    marketingDesc:  'Google AdSense, affiliate cookies (Booking, Amazon, etc.).',
    aceptarTodo: 'Accept all',
    rechazarOpcionales: 'Necessary only',
    guardar:     'Save preferences',
    politica:    'Cookie policy',
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

  useEffect(() => {
    const existing = readConsent()
    if (!existing) {
      setVisible(true)
    } else {
      setAnaliticas(existing.analiticas)
      setMarketing(existing.marketing)
    }
  }, [])

  const accept = useCallback((analytics: boolean, mkt: boolean) => {
    const consent: CookieConsent = {
      tecnicas: true,
      analiticas: analytics,
      marketing: mkt,
      timestamp: Date.now(),
    }
    saveConsent(consent)
    setVisible(false)
  }, [])

  if (!visible) return null

  const btnBase: React.CSSProperties = {
    padding: '.5rem 1.1rem',
    borderRadius: 100,
    fontSize: '.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={i18n.titulo}
      style={{
        position: 'fixed', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
        width: 'min(580px, calc(100vw - 1.5rem))',
        background: '#faf6ef', border: '1.5px solid #e8dcc8', borderRadius: 20,
        padding: '1.25rem 1.5rem', boxShadow: '0 8px 32px rgba(42,26,8,.15)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 2 }} aria-hidden="true">
          <ShieldCheck size={18} weight="bold" color="var(--accent,#6b400a)" />
        </span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2a1a08', marginBottom: '.25rem' }}>{i18n.titulo}</div>
          <p style={{ margin: 0, fontSize: '.78rem', lineHeight: 1.6, color: '#4a3520' }}>
            {i18n.texto}{' '}
            <Link href={locale === 'en' ? '/en/cookies' : '/cookies'} style={{ color: '#6b400a', textDecoration: 'underline' }}>
              {i18n.politica}
            </Link>
          </p>
        </div>
      </div>

      {/* Detalle granular */}
      {showDetails && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', padding: '.5rem 0' }}>
          {/* Técnicas — siempre activas */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem' }}>
            <input type="checkbox" checked disabled style={{ accentColor: '#6b400a' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#2a1a08' }}>{i18n.tecnicas}</div>
              <div style={{ fontSize: '.72rem', color: '#8a7560' }}>{i18n.tecnicasDesc}</div>
            </div>
          </label>
          {/* Analíticas */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={analiticas} onChange={e => setAnaliticas(e.target.checked)} style={{ accentColor: '#6b400a', width: 18, height: 18 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#2a1a08' }}>{i18n.analiticas}</div>
              <div style={{ fontSize: '.72rem', color: '#8a7560' }}>{i18n.analiticasDesc}</div>
            </div>
          </label>
          {/* Marketing */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ accentColor: '#6b400a', width: 18, height: 18 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#2a1a08' }}>{i18n.marketing}</div>
              <div style={{ fontSize: '.72rem', color: '#8a7560' }}>{i18n.marketingDesc}</div>
            </div>
          </label>
        </div>
      )}

      {/* Botones — equilibrados visualmente (AEPD anti dark-patterns) */}
      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {!showDetails && (
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            style={{ ...btnBase, border: '1.5px solid #e8dcc8', background: 'transparent', color: '#5a3d12', marginRight: 'auto' }}
          >
            {locale === 'en' ? 'Manage' : 'Configurar'}
          </button>
        )}
        {showDetails && (
          <button
            type="button"
            onClick={() => accept(analiticas, marketing)}
            style={{ ...btnBase, border: '1.5px solid #e8dcc8', background: 'transparent', color: '#5a3d12', marginRight: 'auto' }}
          >
            {i18n.guardar}
          </button>
        )}
        <button
          type="button"
          onClick={() => accept(false, false)}
          aria-label={locale === 'en' ? 'Reject optional cookies' : 'Rechazar cookies opcionales'}
          style={{ ...btnBase, border: '1.5px solid #6b400a', background: 'transparent', color: '#6b400a' }}
        >
          {i18n.rechazarOpcionales}
        </button>
        <button
          type="button"
          onClick={() => accept(true, true)}
          aria-label={locale === 'en' ? 'Accept all cookies' : 'Aceptar todas las cookies'}
          style={{ ...btnBase, border: 'none', background: '#6b400a', color: '#fff' }}
        >
          {i18n.aceptarTodo}
        </button>
      </div>
    </div>
  )
}
