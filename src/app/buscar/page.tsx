// src/app/buscar/page.tsx
'use client'
import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import type { Playa } from '@/types'
import { calcularPlayaScore, type PlayaScore, type MeteoInput } from '@/lib/scoring'
import styles from './buscar.module.css'

const FILTROS = [
  { key: 'bandera',    label: 'Bandera Azul' },
  { key: 'socorrismo', label: 'Socorrismo' },
  { key: 'accesible',  label: 'Accesible' },
  { key: 'perros',     label: 'Perros' },
  { key: 'duchas',     label: 'Duchas' },
  { key: 'parking',    label: 'Parking' },
]

const COMUNIDADES = [
  'Andalucía','Asturias','Baleares','Canarias','Cantabria',
  'Cataluña','C. Valenciana','Galicia','Murcia','País Vasco',
]

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function BuscarContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [playas,    setPlayas]    = useState<Playa[]>([])
  const [loading,   setLoading]   = useState(true)
  const [q,         setQ]         = useState(searchParams.get('q') ?? '')
  const [comunidad, setComunidad] = useState(searchParams.get('comunidad') ?? '')
  const [pagina,    setPagina]    = useState(1)
  const PER_PAGE = 24

  // Ubicación del usuario (viene de ?lat=X&lng=Y de la home o ficha)
  const userLat = parseFloat(searchParams.get('lat') ?? '') || null
  const userLng = parseFloat(searchParams.get('lng') ?? '') || null
  const ordenCercanas = searchParams.get('orden') === 'cercanas' && userLat && userLng

  // Scores para las playas visibles (cargados progresivamente)
  const [scores, setScores] = useState<Map<string, PlayaScore>>(new Map())
  const [scoringDone, setScoringDone] = useState(false)
  const scoringRef = useRef(false)

  // Inicializar filtros desde URL params (e.g. ?bandera=1&parking=1)
  const [filtros, setFiltros] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const f of FILTROS) {
      if (searchParams.get(f.key) === '1') init[f.key] = true
    }
    return init
  })

  useEffect(() => {
    fetch('/data/playas.json')
      .then(r => r.json())
      .then((d: Playa[]) => { setPlayas(d); setLoading(false) })
  }, [])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (q)         params.set('q', q)
    if (comunidad) params.set('comunidad', comunidad)
    for (const [k, v] of Object.entries(filtros)) {
      if (v) params.set(k, '1')
    }
    const str = params.toString()
    router.replace(str ? `/buscar?${str}` : '/buscar', { scroll: false })
    setPagina(1)
  }, [q, comunidad, filtros])

  const toggleFiltro = useCallback((key: string) => {
    setFiltros(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      return next
    })
    setPagina(1)
  }, [])

  // Haversine para distancia
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const resultados = useMemo(() => {
    const qLow = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let filtered = playas.filter(p => {
      if (q) {
        const haystack = [p.nombre, p.municipio, p.provincia, p.comunidad]
          .join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (!haystack.includes(qLow)) return false
      }
      if (comunidad && p.comunidad !== comunidad) return false
      for (const k of Object.keys(filtros)) {
        if (filtros[k] && !(p as any)[k]) return false
      }
      // Si hay coords, filtrar a <80km
      if (ordenCercanas && userLat && userLng && p.lat && p.lng) {
        const d = haversine(userLat, userLng, p.lat, p.lng)
        if (d > 80) return false
      }
      return true
    })

    // Cuando tenemos scores, ordenar por score desc. Si no, por distancia o nombre.
    if (ordenCercanas && userLat && userLng) {
      if (scoringDone && scores.size > 0) {
        // Ordenar por score (mayor = mejor)
        filtered.sort((a, b) => {
          const sa = scores.get(a.slug)?.score ?? 0
          const sb = scores.get(b.slug)?.score ?? 0
          return sb - sa
        })
      } else {
        // Mientras se cargan los scores, ordenar por distancia
        filtered.sort((a, b) => {
          const da = haversine(userLat, userLng, a.lat, a.lng)
          const db = haversine(userLat, userLng, b.lat, b.lng)
          return da - db
        })
      }
    }

    return filtered
  }, [playas, q, comunidad, filtros, ordenCercanas, userLat, userLng, scores, scoringDone])

  // Fetch meteo + score para los primeros 12 resultados cuando hay coords
  useEffect(() => {
    if (!ordenCercanas || !userLat || !userLng || playas.length === 0 || scoringRef.current) return
    scoringRef.current = true

    const candidates = playas
      .filter(p => p.lat && p.lng && haversine(userLat, userLng, p.lat, p.lng) < 80)
      .sort((a, b) => haversine(userLat, userLng, a.lat, a.lng) - haversine(userLat, userLng, b.lat, b.lng))
      .slice(0, 12)

    if (candidates.length === 0) { setScoringDone(true); return }

    async function fetchMeteo(lat: number, lng: number): Promise<MeteoInput> {
      try {
        const h = new Date().getHours()
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 4000)
        const [rM, rF] = await Promise.all([
          fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`, { signal: controller.signal }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`, { signal: controller.signal }),
        ])
        clearTimeout(timer)
        const marine = rM.ok ? await rM.json() : null
        const meteo = rF.ok ? await rF.json() : null
        return {
          olas:   parseFloat((marine?.hourly?.wave_height?.[h] ?? 0.4).toFixed(1)),
          agua:   Math.round(marine?.hourly?.sea_surface_temperature?.[h] ?? 18),
          viento: Math.round(meteo?.hourly?.wind_speed_10m?.[h] ?? 10),
          uv:     Math.round(meteo?.hourly?.uv_index?.[h] ?? 3),
        }
      } catch { return { agua: 18, olas: 0.4, viento: 10, uv: 3 } }
    }

    Promise.all(candidates.map(async p => {
      const m = await fetchMeteo(p.lat, p.lng)
      return { slug: p.slug, ps: calcularPlayaScore(p, m) }
    })).then(results => {
      const map = new Map<string, PlayaScore>()
      for (const r of results) map.set(r.slug, r.ps)
      setScores(map)
      setScoringDone(true)
    }).catch(() => setScoringDone(true))
  }, [playas, ordenCercanas, userLat, userLng])

  const paginas     = Math.ceil(resultados.length / PER_PAGE)
  const visible     = resultados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE)
  const activosFiltros = Object.keys(filtros).length

  return (
    <>
      <Nav />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {ordenCercanas ? 'Mejores playas cerca de ti' : 'Buscar playas'}
          </h1>
          {!loading && (
            <span className={styles.total}>
              {resultados.length.toLocaleString('es')} resultado{resultados.length !== 1 ? 's' : ''}
              {ordenCercanas && !scoringDone && ' · calculando scores…'}
              {ordenCercanas && scoringDone && ' · ordenadas por puntuación'}
            </span>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <label htmlFor="buscar-input" className="sr-only">
              Buscar playas por nombre, municipio o provincia
            </label>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="buscar-input"
              className={styles.searchInput}
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Nombre, municipio o provincia…"
              autoFocus
              aria-label="Buscar playas"
            />
            {q && (
              <button className={styles.clearBtn} onClick={() => setQ('')} aria-label="Borrar búsqueda">✕</button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className={styles.filtrosWrap}>
          {/* Comunidad */}
          <label htmlFor="buscar-comunidad" className="sr-only">
            Filtrar por comunidad autónoma
          </label>
          <select
            id="buscar-comunidad"
            className={styles.select}
            value={comunidad}
            onChange={e => setComunidad(e.target.value)}
            aria-label="Filtrar por comunidad autónoma"
          >
            <option value="">Todas las comunidades</option>
            {COMUNIDADES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Chips */}
          <div className={styles.chips} role="group" aria-label="Filtros de servicios">
            {FILTROS.map(f => (
              <button
                key={f.key}
                type="button"
                className={`${styles.chip} ${filtros[f.key] ? styles.chipOn : ''}`}
                onClick={() => toggleFiltro(f.key)}
                aria-pressed={filtros[f.key] ? 'true' : 'false'}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Reset */}
          {(activosFiltros > 0 || comunidad) && (
            <button className={styles.resetBtn} onClick={() => { setFiltros({}); setComunidad('') }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Announcer para lectores de pantalla: cambia al filtrar */}
        <div className={styles.resultsAnnouncer} role="status" aria-live="polite" aria-atomic="true">
          {!loading && `${resultados.length} ${resultados.length === 1 ? 'playa encontrada' : 'playas encontradas'}`}
        </div>

        {/* Resultados */}
        {loading ? (
          <div className={styles.loading} role="status" aria-live="polite" aria-label="Cargando playas">
            <div className={styles.spinner} aria-hidden="true"/>
            <span>Cargando playas…</span>
          </div>
        ) : resultados.length === 0 ? (
          <div className={styles.empty} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">~</span>
            <p>No hay playas con esos criterios.</p>
            <button className={styles.emptyBtn} onClick={() => { setQ(''); setFiltros({}); setComunidad('') }}>
              Ver todas las playas
            </button>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {visible.map(p => {
                const ps = scores.get(p.slug)
                const dist = (ordenCercanas && userLat && userLng && p.lat && p.lng)
                  ? haversine(userLat, userLng, p.lat, p.lng)
                  : null
                return (
                  <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.card}>
                    <div className={styles.cardMain}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.1rem' }}>
                        <div className={styles.cardNombre} style={{ flex: 1 }}>{p.nombre}</div>
                        {/* Score badge */}
                        {ps && (
                          <span style={{
                            background: ps.color, color: '#fff',
                            fontFamily: 'var(--font-serif)', fontWeight: 700,
                            fontSize: '.78rem', padding: '.2rem .4rem', borderRadius: 6,
                            display: 'inline-flex', alignItems: 'center', gap: '.15rem',
                            flexShrink: 0,
                          }}>
                            {ps.score}<span style={{ fontSize: '.5rem', opacity: .8 }}>/100</span>
                          </span>
                        )}
                      </div>
                      <div className={styles.cardLugar}>
                        {p.municipio} · {p.provincia}
                        {dist !== null && (
                          <span style={{ marginLeft: '.4rem', fontWeight: 700, color: 'var(--accent)' }}>
                            · {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                      {/* Factor pills when score available */}
                      {ps && ps.factors.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.2rem', marginTop: '.25rem' }}>
                          {ps.factors.slice(0, 3).map(f => (
                            <span key={f.icon} style={{
                              fontSize: '.62rem', fontWeight: 700, color: f.color,
                              background: `${f.color}12`, border: `1px solid ${f.color}30`,
                              padding: '.1rem .3rem', borderRadius: 4,
                            }}>{f.label}</span>
                          ))}
                        </div>
                      )}
                      {!ps && <div className={styles.cardComunidad}>{p.comunidad}</div>}
                    </div>
                    <div className={styles.cardBadges}>
                      {p.bandera    && <span className={styles.badge} aria-label="Bandera Azul">B. Azul</span>}
                      {p.socorrismo && <span className={styles.badge} aria-label="Servicio de socorrismo">Socorr.</span>}
                      {p.accesible  && <span className={styles.badge} aria-label="PMR">PMR</span>}
                      {p.perros     && <span className={styles.badge} aria-label="Perros">Perros</span>}
                      {p.parking    && <span className={styles.badge} aria-label="Parking">P</span>}
                    </div>
                    <svg className={styles.arrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                    </svg>
                  </Link>
                )
              })}
            </div>

            {/* Paginación */}
            {paginas > 1 && (
              <nav className={styles.paginacion} aria-label="Paginación de resultados">
                <button
                  className={styles.pageBtn}
                  disabled={pagina === 1}
                  onClick={() => { setPagina(p => p - 1); window.scrollTo(0, 0) }}
                  aria-label="Ir a la página anterior"
                >← Anterior</button>
                <span className={styles.pageInfo} aria-current="page" aria-live="polite">
                  Página {pagina} de {paginas}
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={pagina === paginas}
                  onClick={() => { setPagina(p => p + 1); window.scrollTo(0, 0) }}
                  aria-label="Ir a la página siguiente"
                >Siguiente →</button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default function BuscarPage() {
  return (
    <Suspense>
      <BuscarContent />
    </Suspense>
  )
}
