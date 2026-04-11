'use client'
import { useEffect, useRef, useState } from 'react'
import type { Playa } from '@/types'

interface Props {
  playas?:    Playa[]
  height?:    string
  comunidad?: string
  provincia?: string
}

const ESTADO_COLORES: Record<string, string> = {
  CALMA:   '#22c55e',
  BUENA:   '#3b82f6',
  AVISO:   '#f59e0b',
  PELIGRO: '#ef4444',
  SURF:    '#0ea5e9',
  VIENTO:  '#eab308',
}

function calcEstado(playa: Playa): string {
  const seed = playa.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const olas   = parseFloat(((seed % 15) / 10).toFixed(1))
  const viento = 5 + (seed % 30)
  if (olas >= 2.5 || viento >= 50) return 'PELIGRO'
  if (olas >= 1.5 && viento >= 35) return 'PELIGRO'
  if (olas >= 1.5) return 'SURF'
  if (viento >= 35) return 'VIENTO'
  if (olas >= 0.8 || viento >= 25) return 'AVISO'
  if (olas >= 0.4 || viento >= 15) return 'BUENA'
  return 'CALMA'
}

function toSlug(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function MapaPlayas({ playas: playasProp, height = '500px', comunidad, provincia }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapObj     = useRef<any>(null)
  const circleRef  = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [playas, setPlayas]           = useState<Playa[]>(playasProp ?? [])
  const [loading, setLoading]         = useState(!playasProp)
  const [filtro, setFiltro]           = useState<string>('TODOS')
  const [radio, setRadio]             = useState<number>(50)
  const [modoRadio, setModoRadio]     = useState(false)
  const [leafletReady, setLeafletReady] = useState(false)

  // Cargar playas si no vienen como prop
  useEffect(() => {
    if (playasProp) { setPlayas(playasProp); return }
    fetch('/data/playas.json')
      .then(r => r.json())
      .then((data: Playa[]) => {
        let filtradas = data
        if (comunidad) filtradas = data.filter(p => toSlug(p.comunidad ?? '') === toSlug(comunidad))
        if (provincia) filtradas = data.filter(p => toSlug(p.provincia ?? '') === toSlug(provincia))
        setPlayas(filtradas)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Cargar Leaflet
  useEffect(() => {
    if (typeof window === 'undefined' || mapObj.current) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLeafletReady(true)
    document.head.appendChild(script)
    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null } }
  }, [])

  // Crear mapa
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapObj.current || playas.length === 0) return
    const L = (window as any).L

    const map = L.map(mapRef.current, { zoomControl: true, preferCanvas: true }).setView([40.4, -3.7], 6)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18,
    }).addTo(map)

    if (playas.length > 1) {
      const bounds = L.latLngBounds(playas.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    map.on('click', (e: any) => {
      if (!(map as any)._modoRadio) return
      if (circleRef.current) circleRef.current.remove()
      circleRef.current = L.circle([e.latlng.lat, e.latlng.lng], {
        radius: (map as any)._radioKm * 1000,
        color: '#6b400a', fillColor: '#6b400a', fillOpacity: 0.08,
        weight: 2, dashArray: '6 4'
      }).addTo(map)
    })

    ;(map as any)._addMarkers = (f: string) => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      const items = f === 'TODOS' ? playas : playas.filter(p => calcEstado(p) === f)
      items.forEach(p => {
        const estado = calcEstado(p)
        const color  = ESTADO_COLORES[estado] ?? '#5a3d12'
        const seed   = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        const olas   = parseFloat(((seed % 15) / 10).toFixed(1))
        const viento = 5 + (seed % 30)
        const icon = L.divIcon({
          html: `<div style="width:9px;height:9px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          className: '', iconSize: [9, 9], iconAnchor: [4, 4],
        })
        const marker = L.marker([p.lat, p.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui;min-width:160px">
              <div style="font-weight:700;font-size:.88rem;margin-bottom:.2rem">${p.nombre}</div>
              <div style="font-size: .75rem;color:#666;margin-bottom:.4rem">${p.municipio ?? ''}, ${p.provincia ?? ''}</div>
              <div style="display:flex;gap:.3rem;margin-bottom:.5rem;align-items:center">
                <span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 7px;border-radius:100px;font-size: .72rem;font-weight:700">${estado}</span>
                <span style="font-size: .72rem;color:#666">${olas}m · ${viento}km/h</span>
              </div>
              <a href="/playas/${p.slug}" style="display:block;text-align:center;background:#6b400a;color:white;padding:5px 10px;border-radius:8px;font-size: .75rem;font-weight:600;text-decoration:none">Ver playa →</a>
            </div>
          `, { maxWidth: 220 })
          .addTo(map)
        markersRef.current.push(marker)
      })
    }
    ;(map as any)._addMarkers('TODOS')
    ;(map as any)._modoRadio = false
    ;(map as any)._radioKm = 50
  }, [leafletReady, playas])

  useEffect(() => { if (mapObj.current?._addMarkers) mapObj.current._addMarkers(filtro) }, [filtro])
  useEffect(() => { if (mapObj.current) mapObj.current._radioKm = radio; if (circleRef.current) circleRef.current.setRadius(radio * 1000) }, [radio])
  useEffect(() => {
    if (mapObj.current) mapObj.current._modoRadio = modoRadio
    if (!modoRadio && circleRef.current) { circleRef.current.remove(); circleRef.current = null }
  }, [modoRadio])

  const estados = ['TODOS', 'CALMA', 'BUENA', 'AVISO', 'SURF', 'VIENTO', 'PELIGRO']

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap',
        padding: '.6rem 1rem', background: 'var(--card-bg,#faf6ef)',
        borderBottom: '1px solid var(--line,#e8dcc8)',
      }}>
        <span style={{ fontSize:'.72rem', color: 'var(--muted,#5a3d12)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Estado</span>
        {estados.map(e => (
          <button
            key={e}
            type="button"
            onClick={() => setFiltro(e)}
            aria-pressed={filtro === e ? 'true' : 'false'}
            aria-label={e === 'TODOS' ? 'Mostrar todas las playas' : `Filtrar por estado ${e.toLowerCase()}`}
            style={{
              fontSize:'.72rem', fontWeight: 700, padding: '.2rem .55rem', borderRadius: '100px', border: '1.5px solid',
              borderColor: filtro === e ? (ESTADO_COLORES[e] ?? 'var(--accent,#6b400a)') : 'var(--line,#e8dcc8)',
              background: filtro === e ? ((ESTADO_COLORES[e] ?? '#6b400a') + '18') : 'transparent',
              color: filtro === e ? (ESTADO_COLORES[e] ?? 'var(--accent,#6b400a)') : 'var(--muted,#5a3d12)',
              cursor: 'pointer',
            }}
          >{e}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          {loading && <span style={{ fontSize:'.72rem', color: 'var(--muted,#5a3d12)' }}>Cargando…</span>}
          <button onClick={() => setModoRadio(r => !r)} style={{
            fontSize:'.72rem', fontWeight: 700, padding: '.2rem .6rem', borderRadius: '100px', border: '1.5px solid',
            borderColor: modoRadio ? 'var(--accent,#6b400a)' : 'var(--line,#e8dcc8)',
            background: modoRadio ? 'rgba(107,64,10,.1)' : 'transparent',
            color: modoRadio ? 'var(--accent,#6b400a)' : 'var(--muted,#5a3d12)', cursor: 'pointer',
          }}>Radio</button>
          {modoRadio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <input type="range" min={5} max={200} value={radio} onChange={e => setRadio(+e.target.value)}
                style={{ width: '70px', accentColor: 'var(--accent,#6b400a)' }} />
              <span style={{ fontSize:'.72rem', color: 'var(--muted,#5a3d12)', minWidth: '30px' }}>{radio}km</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {loading && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute', inset: 0, zIndex: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(240,230,208,.8)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--accent,#6b400a)', marginBottom: '.4rem' }} aria-hidden="true">~</div>
              <div style={{ fontSize: '.8rem', color: 'var(--ink,#2a1a08)', fontWeight: 600 }}>Cargando playas…</div>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          role="application"
          aria-label={
            playasProp
              ? `Mapa interactivo con ${playas.length} playas`
              : comunidad
                ? `Mapa interactivo de playas de ${comunidad}`
                : provincia
                  ? `Mapa interactivo de playas de ${provincia}`
                  : 'Mapa interactivo de playas de España'
          }
          style={{ height, width: '100%' }}
        />
      </div>

      <div style={{
        display: 'flex', gap: '.6rem', flexWrap: 'wrap', padding: '.4rem 1rem',
        background: 'var(--card-bg,#faf6ef)', borderTop: '1px solid var(--line,#e8dcc8)',
        fontSize:'.72rem', color: 'var(--muted,#5a3d12)',
      }}>
        {Object.entries(ESTADO_COLORES).map(([e, c]) => (
          <span key={e} style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />
            {e}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>{playas.length.toLocaleString('es')} playas</span>
        {modoRadio && <span style={{ color: 'var(--accent,#6b400a)' }}>· Clic en el mapa para ver radio</span>}
      </div>
    </div>
  )
}
