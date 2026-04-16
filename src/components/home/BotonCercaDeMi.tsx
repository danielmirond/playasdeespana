'use client'
// src/components/home/BotonCercaDeMi.tsx
// Botón que pide geolocalización del navegador y redirige a /buscar
// con las coordenadas + orden=cercanas. Si el usuario deniega, navega
// a /buscar normal.
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin } from '@phosphor-icons/react'

interface Props {
  className?: string
  locale?: 'es' | 'en'
}

export default function BotonCercaDeMi({ className, locale = 'es' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const es = locale === 'es'

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      router.push('/buscar')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        router.push(`/buscar?lat=${latitude.toFixed(4)}&lng=${longitude.toFixed(4)}&orden=cercanas`)
      },
      () => {
        // Denegado o error → ir a buscar sin coords
        router.push('/buscar')
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }, [router])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      aria-label={es ? 'Encontrar playas cerca de mi ubicación' : 'Find beaches near my location'}
      style={{ gap: '.45rem' }}
    >
      <MapPin size={16} weight="bold" aria-hidden="true" />
      {loading
        ? (es ? 'Buscando…' : 'Searching…')
        : (es ? 'Cerca de mí' : 'Near me')}
    </button>
  )
}
