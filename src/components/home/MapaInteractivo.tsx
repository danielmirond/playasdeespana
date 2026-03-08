'use client'
import { useEffect, useRef, useState } from 'react'
import type { PlayaCard } from '@/types'

export default function MapaInteractivo({ playas }: { playas: PlayaCard[] }) {
  const mapRef  = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState<PlayaCard | null>(null)

  useEffect(() => {
    // Leaflet se carga dinámicamente para evitar SSR issues
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return
      // CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      // JS
      const L = (await import('leaflet' as any)).default ?? (await import('leaflet' as any))

      if (!mapRef.current || mapRef.current.dataset.initialized) return
      mapRef.current.dataset.initialized = '1'

      const map = L.map(mapRef.current, {
        center: [40.0, -3.7],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &amp; CartoDB',
        maxZoom: 18,
      }).addTo(map)

      // Icono personalizado
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:10px;height:10px;border-radius:50%;background:#2e7bb4;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
        iconSize: [10,10],
        iconAnchor: [5,5],
      })
      const iconAzul = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#3a8c5c;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
        iconSize: [12,12],
        iconAnchor: [6,6],
      })

      playas.forEach(p => {
        const marker = L.marker([p.lat, p.lon], { icon: p.bandera_azul ? iconAzul : icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:160px">
              <div style="font-weight:600;font-size:.85rem;margin-bottom:.2rem">${p.nombre}</div>
              <div style="font-size:.72rem;color:#7a8c7c;margin-bottom:.4rem">${p.municipio} · ${p.provincia}</div>
              ${p.bandera_azul ? '<div style="font-size:.65rem;color:#3a8c5c;font-weight:500">🏖 Bandera Azul</div>' : ''}
              <a href="/playas/${p.slug}" style="display:inline-block;margin-top:.4rem;font-size:.72rem;color:#2e7bb4;text-decoration:none">Ver condiciones →</a>
            </div>
          `, { maxWidth: 200 })
      })
      setReady(true)
    }
    loadLeaflet()
  }, [playas])

  return (
    <section className="section" id="mapa">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Mapa interactivo</div>
          <h2 className="section-title">Todas las <em>playas</em></h2>
          <p className="section-desc">
            <span className="map-legend-dot" style={{background:'#3a8c5c'}}/>Bandera Azul
            <span className="map-legend-dot" style={{background:'#2e7bb4',marginLeft:'.8rem'}}/>Resto de playas
          </p>
        </div>
        <div className="mapa-frame" ref={mapRef}/>
        {!ready && <div className="mapa-loading">Cargando mapa…</div>}
      </div>
    </section>
  )
}
