'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Playa } from '@/types'
import styles from './Cercanas.module.css'

interface PlayaConDist extends Playa { distKm: number }

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

type Estado = 'idle' | 'loading' | 'ok' | 'denied' | 'error'

interface Props { locale?: 'es' | 'en' }
export default function Cercanas({ locale = 'es' }: Props) {
  const [estado, setEstado]   = useState<Estado>('idle')
  const [playas, setPlayas]   = useState<PlayaConDist[]>([])
  const [meteos, setMeteos]   = useState<Record<string, { agua: number; olas: number; estado: string }>>({})

  const buscar = () => {
    if (!navigator.geolocation) { setEstado('error'); return }
    setEstado('loading')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const res   = await fetch('/data/playas.json')
        const todas: Playa[] = await res.json()
        const cercanas = todas
          .map(p => ({ ...p, distKm: haversine(lat, lng, p.lat, p.lng) }))
          .sort((a, b) => a.distKm - b.distKm)
          .slice(0, 6)
        setPlayas(cercanas)
        setEstado('ok')

        // Cargar meteo en paralelo
        const meteoEntries = await Promise.all(
          cercanas.map(async p => {
            try {
              const ahora = new Date().getHours()
              const r = await fetch(
                `https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lng}`
                + `&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`
              )
              if (!r.ok) return [p.slug, null] as const
              const d = await r.json()
              const olas  = parseFloat((d.hourly?.wave_height?.[ahora] ?? 0.3).toFixed(1))
              const agua  = Math.round(d.hourly?.sea_surface_temperature?.[ahora] ?? 18)
              const est   = olas >= 2.5 ? 'PELIGRO' : olas >= 1.5 ? 'SURF' : olas >= 0.8 ? 'AVISO' : 'CALMA'
              return [p.slug, { agua, olas, estado: est }] as const
            } catch { return [p.slug, null] as const }
          })
        )
        const m: Record<string, { agua: number; olas: number; estado: string }> = {}
        meteoEntries.forEach(([slug, v]) => { if (v) m[slug] = v })
        setMeteos(m)
      },
      () => setEstado('denied')
    )
  }

  const ESTADO_COLOR: Record<string, string> = {
    CALMA: '#22c55e', BUENA: '#3b82f6', AVISO: '#f59e0b',
    PELIGRO: '#ef4444', SURF: '#0ea5e9', VIENTO: '#eab308',
  }
  const ESTADO_LABEL: Record<string, string> = {
    CALMA: 'Calma', BUENA: 'Buenas cond.', AVISO: 'Aviso',
    PELIGRO: 'Peligro', SURF: 'Surf', VIENTO: 'Viento',
  }

  if (estado === 'idle') return (
    <section className={styles.section}>
      <div className={styles.hd}>
        <span className={styles.hdTitle}>📍 Playas cercanas</span>
      </div>
      <div className={styles.cta}>
        <p className={styles.ctaTxt}>{locale === 'en' ? 'Discover the nearest beaches to you right now.' : 'Descubre las playas más próximas a ti ahora mismo.'}</p>
        <button className={styles.ctaBtn} onClick={buscar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
          {locale === 'en' ? 'Use my location' : 'Usar mi ubicación'}
        </button>
        <p className={styles.ctaHint}>{locale === 'en' ? 'Only used to calculate distances, never stored.' : 'Solo se usa para calcular distancias, no se guarda.'}</p>
      </div>
    </section>
  )

  if (estado === 'loading') return (
    <section className={styles.section}>
      <div className={styles.hd}><span className={styles.hdTitle}>📍 Playas cercanas</span></div>
      <div className={styles.cta}>
        <div className={styles.spinner}/>
        <p className={styles.ctaTxt}>Buscando playas cercanas…</p>
      </div>
    </section>
  )

  if (estado === 'denied') return (
    <section className={styles.section}>
      <div className={styles.hd}><span className={styles.hdTitle}>📍 Playas cercanas</span></div>
      <div className={styles.cta}>
        <p className={styles.ctaTxt}>Permiso de ubicación denegado. Actívalo en la configuración del navegador.</p>
        <button className={styles.ctaBtn} onClick={() => setEstado('idle')}>Reintentar</button>
      </div>
    </section>
  )

  return (
    <section className={styles.section}>
      <div className={styles.hd}>
        <span className={styles.hdTitle}>📍 Playas cercanas</span>
        <button className={styles.hdRefresh} onClick={buscar}>↻ Actualizar</button>
      </div>
      <div className={styles.grid}>
        {playas.map(p => {
          const m = meteos[p.slug]
          const estColor = ESTADO_COLOR[m?.estado ?? 'CALMA']
          const estLabel = ESTADO_LABEL[m?.estado ?? 'CALMA']
          return (
            <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.nombre}>{p.nombre}</div>
                  <div className={styles.lugar}>{p.municipio} · {p.provincia}</div>
                </div>
                <div className={styles.dist}>{p.distKm < 10 ? p.distKm.toFixed(1) : Math.round(p.distKm)} km</div>
              </div>
              <div className={styles.cardBot}>
                {m ? (
                  <>
                    <span className={styles.pill} style={{ background: estColor + '22', color: estColor, border: `1px solid ${estColor}44` }}>
                      <span className={styles.pillDot} style={{ background: estColor }}/>
                      {estLabel}
                    </span>
                    <span className={styles.dato}>💧{m.agua}°</span>
                    <span className={styles.dato}>🌊{m.olas}m</span>
                  </>
                ) : (
                  <span className={styles.cargando}>Cargando…</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
