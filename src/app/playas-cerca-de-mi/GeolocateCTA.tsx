'use client'
// src/app/playas-cerca-de-mi/GeolocateCTA.tsx
// CTA cliente: pide geolocation y redirige a /buscar?lat=X&lng=Y&orden=cercanas
// que ya ordena por distancia y muestra score en tiempo real.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, SpinnerGap, WarningCircle } from '@phosphor-icons/react'

type Estado = 'idle' | 'buscando' | 'error' | 'denegado'

export default function GeolocateCTA() {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>('idle')

  function activar() {
    if (!navigator.geolocation) {
      setEstado('error')
      return
    }
    setEstado('buscando')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4)
        const lng = pos.coords.longitude.toFixed(4)
        router.push(`/buscar?lat=${lat}&lng=${lng}&orden=cercanas`)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setEstado('denegado')
        else setEstado('error')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 },
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '.75rem', marginBottom: '2.5rem',
    }}>
      <button
        onClick={activar}
        disabled={estado === 'buscando'}
        aria-busy={estado === 'buscando'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '.55rem',
          padding: '.85rem 1.65rem',
          background: 'var(--tinta-900)', color: 'var(--arena-50)',
          fontFamily: 'var(--font-sans)',
          fontSize: '.95rem', fontWeight: 500,
          border: 'none', borderRadius: 4,
          cursor: estado === 'buscando' ? 'wait' : 'pointer',
          transition: 'opacity .15s',
          minHeight: 48,
        }}
      >
        {estado === 'buscando'
          ? <><SpinnerGap size={18} weight="bold" className="spin" aria-hidden="true" /> Buscando tu posición…</>
          : <><MapPin size={18} weight="fill" aria-hidden="true" /> Activar ubicación</>}
      </button>

      {estado === 'denegado' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '.5rem',
          padding: '.75rem 1rem',
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 4,
          fontSize: '.85rem', color: 'var(--ink)',
          maxWidth: 460,
        }}>
          <WarningCircle size={18} weight="fill" color="var(--aceptable)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <div>
            Tu navegador bloqueó el acceso. Puedes buscar manualmente por{' '}
            <a href="#comunidades" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>comunidad</a>{' '}
            o{' '}
            <a href="/buscar" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>explorar el mapa</a>.
          </div>
        </div>
      )}
      {estado === 'error' && (
        <div style={{
          fontSize: '.8rem', color: 'var(--muted)',
          textAlign: 'center', maxWidth: 460,
        }}>
          No pudimos obtener tu ubicación. <a href="#comunidades" style={{ color: 'var(--accent)' }}>Explora por comunidad ↓</a>
        </div>
      )}

      <p style={{
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: '.68rem', color: 'var(--muted)',
        letterSpacing: '.04em', marginTop: '.1rem',
      }}>
        Sin registro · sin guardar tu ubicación · funciona en móvil y escritorio
      </p>

      <style>{`
        .spin { animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
