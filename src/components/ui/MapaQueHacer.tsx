'use client'
// src/components/ui/MapaQueHacer.tsx — Mapa de la subpágina «Qué hacer».
//
// PARA QUÉ. Un mapa único que muestra TODO en el mismo lienzo: las playas
// mejor equipadas y los POIs del catálogo (museos, monumentos, miradores,
// cultura y parques). Cada categoría con su color, popup con el nombre, y
// leyenda visible debajo del mapa. Sin filtros: es un mapa de un plan de
// visita, no una herramienta de exploración.
//
// POR QUÉ NO EXTENDER MapaPlayas. MapaPlayas tiene lógica de estado del
// mar por playa (colores dependientes de meteo, filtros por estado, modo
// radio) que aquí sobra. Duplicar el arranque de Leaflet es barato — el
// script se cachea en el navegador y el CSS solo se inyecta una vez.
import { useEffect, useRef } from 'react'
import type { Poi } from '@/lib/municipio-pois'

interface PlayaMarcador {
  slug: string
  nombre: string
  lat: number
  lng: number
  bandera?: boolean
}

interface Props {
  centro: { lat: number; lng: number }
  playas: PlayaMarcador[]
  museos: Poi[]
  monumentos: Poi[]
  miradores: Poi[]
  cultura: Poi[]
  parques: Poi[]
  height?: string
}

// Colores del sistema. Cada categoría se lee de un vistazo.
const COLOR = {
  playa:     '#3d6b1f',   // verde bandera
  museo:     '#6b400a',   // terracota accent
  monumento: '#2a1a08',   // tinta oscura
  mirador:   '#e8a030',   // ocre para faros/miradores (visible sobre tierra)
  cultura:   '#4a7a90',   // marino para cines/teatros
  parque:    '#8a8a30',   // oliva para verde real
} as const

function icono(color: string, size: number, L: any) {
  // Círculo relleno con borde blanco y sombra sutil. Sin emoji.
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #faf4e6;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function popupPlaya(p: PlayaMarcador): string {
  return `<div style="font-family:var(--font-sans,system-ui);min-width:170px;color:#2a1a08">
    <div style="font-family:var(--font-serif,Georgia,serif);font-weight:700;font-size:1rem;line-height:1.15;margin-bottom:.3rem;letter-spacing:-.01em">${escapar(p.nombre)}</div>
    <div style="font-family:var(--font-mono,ui-monospace,monospace);font-size:.68rem;color:${COLOR.playa};margin-bottom:.5rem;letter-spacing:.04em;text-transform:uppercase">Playa${p.bandera ? ' · Bandera Azul' : ''}</div>
    <a href="/playas/${escapar(p.slug)}" style="display:block;text-align:center;background:#6b400a;color:#faf4e6;padding:6px 10px;border-radius:4px;font-size:.75rem;font-weight:500;text-decoration:none">Ver ficha →</a>
  </div>`
}

function popupPoi(p: Poi, color: string): string {
  const acc = p.pmr ? ' · Accesible' : ''
  const gmapsHref = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
  const href = p.website ?? gmapsHref
  const rel = p.website ? 'noopener nofollow' : 'noopener'
  return `<div style="font-family:var(--font-sans,system-ui);min-width:170px;color:#2a1a08">
    <div style="font-family:var(--font-serif,Georgia,serif);font-weight:700;font-size:1rem;line-height:1.15;margin-bottom:.3rem;letter-spacing:-.01em">${escapar(p.nombre)}</div>
    <div style="font-family:var(--font-mono,ui-monospace,monospace);font-size:.68rem;color:${color};margin-bottom:.5rem;letter-spacing:.04em;text-transform:uppercase">${escapar(p.tipo)}${acc}</div>
    <a href="${href}" target="_blank" rel="${rel}" style="display:block;text-align:center;background:#6b400a;color:#faf4e6;padding:6px 10px;border-radius:4px;font-size:.75rem;font-weight:500;text-decoration:none">${p.website ? 'Web oficial →' : 'Cómo llegar →'}</a>
  </div>`
}

// Escapar HTML mínimamente. Los nombres vienen de OSM (público) pero
// pueden llevar ampersands o comillas.
function escapar(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function MapaQueHacer({
  centro, playas, museos, monumentos, miradores, cultura, parques, height = '360px',
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<any>(null)
  const listoRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || mapObj.current) return
    // Reutilizamos Leaflet si ya está cargado por otro mapa de la página.
    const W = window as any
    const arranque = () => setUp()
    const setUp = () => {
      if (!mapRef.current || mapObj.current) return
      const L = W.L
      if (!L) return
      const map = L.map(mapRef.current, {
        zoomControl: true,
        preferCanvas: true,
        scrollWheelZoom: false,
      }).setView([centro.lat, centro.lng], 14)
      mapObj.current = map

      // Rueda solo tras clic: evita atrapar el scroll de la página cuando
      // el cursor cruza el mapa por accidente.
      map.on('click', () => map.scrollWheelZoom.enable())
      map.on('mouseout', () => map.scrollWheelZoom.disable())

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Todos los puntos, ordenados: playas debajo (más grandes), POIs
      // encima con tamaño menor para que la playa siga siendo el ancla.
      const puntos: [number, number][] = []
      playas.forEach(p => {
        L.marker([p.lat, p.lng], { icon: icono(COLOR.playa, 13, L) }).bindPopup(popupPlaya(p)).addTo(map)
        puntos.push([p.lat, p.lng])
      })
      const enPool = (arr: Poi[], color: string) => {
        arr.forEach(p => {
          L.marker([p.lat, p.lng], { icon: icono(color, 9, L) }).bindPopup(popupPoi(p, color)).addTo(map)
          puntos.push([p.lat, p.lng])
        })
      }
      enPool(museos, COLOR.museo)
      enPool(monumentos, COLOR.monumento)
      enPool(miradores, COLOR.mirador)
      enPool(cultura, COLOR.cultura)
      enPool(parques, COLOR.parque)

      // Bounds a los puntos si hay al menos 2; si no, un zoom decente al
      // centro del municipio.
      if (puntos.length >= 2) {
        const bounds = L.latLngBounds(puntos)
        map.fitBounds(bounds, { padding: [30, 30] })
      }
    }

    if (W.L) { setUp(); return }
    // Cargar Leaflet si no está montado. CSS + script; el CSS lo pone el
    // primer mapa que llegue, los siguientes lo encuentran ya en el DOM.
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = arranque
      document.head.appendChild(s)
    } else {
      // Otro mapa está cargando: reintentamos cada 100 ms hasta 3 s.
      let intentos = 0
      const t = setInterval(() => {
        intentos++
        if ((window as any).L) { clearInterval(t); arranque(); return }
        if (intentos > 30) clearInterval(t)
      }, 100)
    }
    listoRef.current = true

    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totales = {
    playas: playas.length,
    museos: museos.length,
    monumentos: monumentos.length,
    miradores: miradores.length,
    cultura: cultura.length,
    parques: parques.length,
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      <div
        ref={mapRef}
        role="application"
        aria-label="Mapa de qué hacer en el municipio"
        style={{ width: '100%', height, background: 'var(--card-bg)' }}
      />
      {/* Leyenda: qué es cada punto. Solo se muestran las categorías con
          contenido — si no hay miradores no aparece «Miradores». */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '.65rem 1rem',
        padding: '.7rem .95rem', borderTop: '1px solid var(--line)',
        background: 'var(--card-bg)', fontSize: '.72rem', color: 'var(--muted)',
      }}>
        {totales.playas > 0 && <ItemLeyenda color={COLOR.playa} tam={11} label="Playas" n={totales.playas} />}
        {totales.museos > 0 && <ItemLeyenda color={COLOR.museo} tam={9} label="Museos" n={totales.museos} />}
        {totales.monumentos > 0 && <ItemLeyenda color={COLOR.monumento} tam={9} label="Monumentos" n={totales.monumentos} />}
        {totales.miradores > 0 && <ItemLeyenda color={COLOR.mirador} tam={9} label="Miradores" n={totales.miradores} />}
        {totales.cultura > 0 && <ItemLeyenda color={COLOR.cultura} tam={9} label="Cultura" n={totales.cultura} />}
        {totales.parques > 0 && <ItemLeyenda color={COLOR.parque} tam={9} label="Parques" n={totales.parques} />}
      </div>
    </div>
  )
}

function ItemLeyenda({ color, tam, label, n }: { color: string; tam: number; label: string; n: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
      <span style={{
        width: tam, height: tam, borderRadius: '50%',
        background: color, border: '1.5px solid #faf4e6',
        boxShadow: '0 1px 2px rgba(0,0,0,.25)',
        display: 'inline-block',
      }} aria-hidden="true"/>
      <span>{label} · <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>{n}</span></span>
    </span>
  )
}
