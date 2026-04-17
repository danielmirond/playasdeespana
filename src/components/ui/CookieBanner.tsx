'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

const t = {
  es: { texto: 'Usamos cookies propias y de terceros para analizar el tráfico y mejorar tu experiencia.', aceptar: 'Aceptar', rechazar: 'Solo esenciales', politica: 'Política de cookies' },
  en: { texto: 'We use cookies to analyse traffic and improve your experience.', aceptar: 'Accept', rechazar: 'Essential only', politica: 'Cookie policy' },
}

export default function CookieBanner() {
  const pathname = usePathname()
  const locale = pathname.startsWith('/en') ? 'en' : 'es'
  const [visible, setVisible] = useState(false)
  const i18n = t[locale]
  useEffect(() => { if (!localStorage.getItem('cookie_consent')) setVisible(true) }, [])
  if (!visible) return null
  const aLabelAceptar = locale === 'en' ? 'Accept all cookies' : 'Aceptar todas las cookies'
  const aLabelRechazar = locale === 'en' ? 'Only essential cookies' : 'Aceptar solo cookies esenciales'
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={locale === 'en' ? 'Cookie consent' : 'Consentimiento de cookies'}
      style={{ position:'fixed', bottom:'1.25rem', left:'50%', transform:'translateX(-50%)', width:'min(560px, calc(100vw - 2rem))', background:'#faf6ef', border:'1.5px solid #e8dcc8', borderRadius:'20px', padding:'1.25rem 1.5rem', boxShadow:'0 8px 32px rgba(42,26,8,.12)', zIndex:9999, display:'flex', flexDirection:'column', gap:'.75rem' }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:'.75rem' }}>
        <span style={{ flexShrink:0, display:'flex', alignItems:'center' }} aria-hidden="true"><ShieldCheck size={18} weight="bold" color="var(--accent,#6b400a)"/></span>
        <p style={{ margin:0, fontSize:'.82rem', lineHeight:'1.6', color:'#4a3520' }}>
          {i18n.texto}{' '}
          <Link href={locale === 'en' ? '/en/cookies' : '/cookies'} style={{ color:'#6b400a', textDecoration:'underline' }}>{i18n.politica}</Link>
        </p>
      </div>
      <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end' }}>
        <button
          type="button"
          onClick={() => { localStorage.setItem('cookie_consent', 'essential'); setVisible(false) }}
          aria-label={aLabelRechazar}
          style={{ padding:'.45rem 1rem', borderRadius:'100px', border:'1.5px solid #e8dcc8', background:'transparent', color:'#5a3d12', fontSize:'.78rem', fontWeight:600, cursor:'pointer' }}
        >{i18n.rechazar}</button>
        <button
          type="button"
          onClick={() => { localStorage.setItem('cookie_consent', 'all'); setVisible(false) }}
          aria-label={aLabelAceptar}
          style={{ padding:'.45rem 1rem', borderRadius:'100px', border:'none', background:'#6b400a', color:'#fff', fontSize:'.78rem', fontWeight:700, cursor:'pointer' }}
        >{i18n.aceptar}</button>
      </div>
    </div>
  )
}
