'use client'
import { Drop, Heart, Waves } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Playa } from '@/types'
import { ESTADOS } from '@/lib/estados'
import styles from './Favoritas.module.css'

const KEY = 'playas_favoritas'

export function useFavoritas() {
  const [favs, setFavs] = useState<string[]>([])

  useEffect(() => {
    try { setFavs(JSON.parse(localStorage.getItem(KEY) ?? '[]')) } catch {}
  }, [])

  const toggle = (slug: string) => {
    setFavs(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  const esFavorita = (slug: string) => favs.includes(slug)
  return { favs, toggle, esFavorita }
}

// Botón reutilizable para usar en FichaBody u otros sitios
export function BtnFavorita({ slug, nombre }: { slug: string; nombre: string }) {
  const { esFavorita, toggle } = useFavoritas()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const es = esFavorita(slug)
  return (
    <button
      className={`${styles.btnFav} ${es ? styles.btnFavOn : ''}`}
      onClick={e => { e.preventDefault(); toggle(slug) }}
      title={es ? 'Quitar de favoritas' : 'Añadir a favoritas'}
      aria-label={es ? `Quitar ${nombre} de favoritas` : `Añadir ${nombre} a favoritas`}
    >
      {es ? '♥' : '♡'}
    </button>
  )
}

// Bloque home de favoritas
interface Props { locale?: 'es' | 'en' }
export default function Favoritas({ locale = 'es' }: Props) {
  const { favs, toggle } = useFavoritas()
  const [playas, setPlayas]   = useState<Playa[]>([])
  const [meteos, setMeteos]   = useState<Record<string, { agua: number; olas: number; estado: string }>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || favs.length === 0) return
    fetch(`/api/playas-by-slug?slugs=${favs.join(',')}`)
      .then(r => r.json())
      .then((encontradas: Playa[]) => {
        setPlayas(encontradas)

        // Meteo
        Promise.all(encontradas.map(async p => {
          try {
            const ahora = new Date().getHours()
            const r = await fetch(
              `https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lng}`
              + `&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`
            )
            if (!r.ok) return [p.slug, null] as const
            const d = await r.json()
            const olas = parseFloat((d.hourly?.wave_height?.[ahora] ?? 0.3).toFixed(1))
            const agua = Math.round(d.hourly?.sea_surface_temperature?.[ahora] ?? 18)
            const est  = olas >= 2.5 ? 'PELIGRO' : olas >= 1.5 ? 'SURF' : olas >= 0.8 ? 'AVISO' : 'CALMA'
            return [p.slug, { agua, olas, estado: est }] as const
          } catch { return [p.slug, null] as const }
        })).then(entries => {
          const m: Record<string, { agua: number; olas: number; estado: string }> = {}
          entries.forEach(([slug, v]) => { if (v) m[slug] = v })
          setMeteos(m)
        })
      })
  }, [favs, mounted])

  if (!mounted || favs.length === 0) return null

  const ESTADO_COLOR = Object.fromEntries(Object.entries(ESTADOS).map(([k, v]) => [k, v.dot]))
  const ESTADO_LABEL = Object.fromEntries(Object.entries(ESTADOS).map(([k, v]) => [k, v.label]))

  return (
    <section className={styles.section}>
      <div className={styles.hd}>
        <span className={styles.hdTitle}><Heart size={14} weight="fill" color="var(--accent,#6b400a)" style={{verticalAlign:'middle',marginRight:4}}/> Mis favoritas</span>
        <span className={styles.hdCount}>{favs.length} {locale === 'en' ? 'saved' : 'guardadas'}</span>
      </div>
      <div className={styles.grid}>
        {playas.map(p => {
          const m = meteos[p.slug]
          const estColor = ESTADO_COLOR[m?.estado ?? 'CALMA']
          const estLabel = ESTADO_LABEL[m?.estado ?? 'CALMA']
          return (
            <div key={p.slug} className={styles.card}>
              <Link href={`/playas/${p.slug}`} className={styles.cardLink}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.nombre}>{p.nombre}</div>
                    <div className={styles.lugar}>{p.municipio} · {p.provincia}</div>
                  </div>
                  {m && (
                    <span className={styles.pill} style={{ background: estColor + '22', color: estColor, border: `1px solid ${estColor}44` }}>
                      <span className={styles.pillDot} style={{ background: estColor }}/>
                      {estLabel}
                    </span>
                  )}
                </div>
                {m && (
                  <div className={styles.datos}>
                    <span className={styles.dato}><Drop size={14} weight="bold" color="var(--accent,#6b400a)" style={{verticalAlign:'middle',marginRight:2}}/>{m.agua}°C</span>
                    <span className={styles.dato}><Waves size={14} weight="bold" color="var(--accent,#6b400a)" style={{verticalAlign:'middle',marginRight:2}}/>{m.olas}m</span>
                  </div>
                )}
              </Link>
              <button
                type="button"
                className={styles.btnQuitar}
                onClick={() => toggle(p.slug)}
                aria-label={locale === 'en' ? `Remove ${p.nombre} from favorites` : `Quitar ${p.nombre} de favoritas`}
                title="Quitar de favoritas"
              ><span aria-hidden="true">✕</span></button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
