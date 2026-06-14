'use client'
// Banner discreto para instalar la PWA.
//  - Android/Chrome: captura `beforeinstallprompt` y lanza el prompt nativo.
//  - iOS/Safari: no hay prompt programático → muestra instrucciones
//    (Compartir → Añadir a inicio).
//  - No se muestra si ya está instalada (display-mode: standalone) ni si el
//    usuario lo descartó (localStorage, 60 días).
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DAYS = 60

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

function dismissedRecently(): boolean {
  try {
    const v = localStorage.getItem(DISMISS_KEY)
    if (!v) return false
    return Date.now() - Number(v) < DISMISS_DAYS * 864e5
  } catch { return false }
}

// El banner de cookies (cookie_consent_v2) tiene prioridad: no mostramos el
// de instalar hasta que el usuario haya respondido, para no solaparlos.
function cookieChoiceMade(): boolean {
  try { return localStorage.getItem('cookie_consent_v2') != null } catch { return true }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Ya instalada → no mostrar.
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone || dismissedRecently()) return

    const ua = window.navigator.userAgent
    const iOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)

    // Muestra solo cuando ya se respondió a cookies (sondeo ligero hasta 3 min).
    let poll: ReturnType<typeof setInterval> | undefined
    const showWhenCookieDone = () => {
      if (cookieChoiceMade()) { setShow(true); return }
      let tries = 0
      poll = setInterval(() => {
        if (cookieChoiceMade() || ++tries > 120) { setShow(true); clearInterval(poll) }
      }, 1500)
    }

    if (iOS) {
      setIsIOS(true)
      const t = setTimeout(showWhenCookieDone, 4000)
      return () => { clearTimeout(t); if (poll) clearInterval(poll) }
    }

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      showWhenCookieDone()
    }
    const onInstalled = () => setShow(false)
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
      if (poll) clearInterval(poll)
    }
  }, [])

  if (!show) return null

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
    setShow(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    try { await deferred.userChoice } catch {}
    setDeferred(null)
    setShow(false)
  }

  return (
    <div role="dialog" aria-label="Instalar Playas de España" style={{
      position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
      zIndex: 1200, width: 'min(440px, calc(100vw - 24px))',
      background: 'var(--surface, #faf4e6)', border: '1px solid var(--line)', borderRadius: 12,
      boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(42,26,8,.18))',
      padding: '.9rem 1rem', display: 'flex', alignItems: 'center', gap: '.85rem',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={40} height={40} style={{ flex: '0 0 auto', width: 40, height: 40, borderRadius: 9 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '.92rem', lineHeight: 1.2 }}>Instala Playas de España</div>
        <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.15rem', lineHeight: 1.35 }}>
          {isIOS
            ? <>Pulsa <strong>Compartir</strong> <span aria-hidden="true">􀈂</span> y luego <strong>“Añadir a pantalla de inicio”</strong>.</>
            : <>Acceso directo en tu móvil, a pantalla completa.</>}
        </div>
      </div>
      {!isIOS && (
        <button onClick={install} style={{
          flex: '0 0 auto', padding: '.55rem .9rem', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 8, fontWeight: 800, fontSize: '.85rem', cursor: 'pointer',
        }}>Instalar</button>
      )}
      <button onClick={dismiss} aria-label="Cerrar" style={{
        flex: '0 0 auto', width: 30, height: 30, background: 'transparent', border: 'none',
        color: 'var(--muted)', fontSize: '1.3rem', lineHeight: 1, cursor: 'pointer',
      }}>×</button>
    </div>
  )
}
