'use client'
import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  nombre?: string
  zoom?: number
  height?: string
}

export default function MapaLeaflet({ lat, lng, nombre, zoom = 15, height = '300px' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    if (typeof window === 'undefined') return

    const initMap = () => {
      const L = (window as any).L
      if (!L || !ref.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: false })
      map.setView([lat, lng], zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (nombre) L.marker([lat, lng]).addTo(map).bindPopup(nombre).openPopup()

      mapRef.current = map
    }

    if ((window as any).L) {
      initMap()
    } else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [lat, lng, zoom, nombre])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={ref}
        role="application"
        aria-label={nombre ? `Mapa interactivo de ${nombre}` : 'Mapa interactivo'}
        tabIndex={0}
        style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden', marginTop: '1rem' }}
      />
    </>
  )
}
