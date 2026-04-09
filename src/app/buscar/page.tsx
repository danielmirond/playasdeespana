// src/app/buscar/page.tsx
'use client'
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import type { Playa } from '@/types'
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
  const [filtros,   setFiltros]   = useState<Record<string, boolean>>({})
  const [comunidad, setComunidad] = useState(searchParams.get('comunidad') ?? '')
  const [pagina,    setPagina]    = useState(1)
  const PER_PAGE = 24

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
    const str = params.toString()
    router.replace(str ? `/buscar?${str}` : '/buscar', { scroll: false })
    setPagina(1)
  }, [q, comunidad])

  const toggleFiltro = useCallback((key: string) => {
    setFiltros(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      return next
    })
    setPagina(1)
  }, [])

  const resultados = useMemo(() => {
    const qLow = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return playas.filter(p => {
      if (q) {
        const haystack = [p.nombre, p.municipio, p.provincia, p.comunidad]
          .join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (!haystack.includes(qLow)) return false
      }
      if (comunidad && p.comunidad !== comunidad) return false
      for (const k of Object.keys(filtros)) {
        if (filtros[k] && !(p as any)[k]) return false
      }
      return true
    })
  }, [playas, q, comunidad, filtros])

  const paginas     = Math.ceil(resultados.length / PER_PAGE)
  const visible     = resultados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE)
  const activosFiltros = Object.keys(filtros).length

  return (
    <>
      <Nav />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Buscar playas</h1>
          {!loading && (
            <span className={styles.total}>
              {resultados.length.toLocaleString('es')} resultado{resultados.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Nombre, municipio o provincia…"
              autoFocus
            />
            {q && (
              <button className={styles.clearBtn} onClick={() => setQ('')}>✕</button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className={styles.filtrosWrap}>
          {/* Comunidad */}
          <select
            className={styles.select}
            value={comunidad}
            onChange={e => setComunidad(e.target.value)}
          >
            <option value="">Todas las comunidades</option>
            {COMUNIDADES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Chips */}
          <div className={styles.chips}>
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`${styles.chip} ${filtros[f.key] ? styles.chipOn : ''}`}
                onClick={() => toggleFiltro(f.key)}
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

        {/* Resultados */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}/>
            <span>Cargando playas…</span>
          </div>
        ) : resultados.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>~</span>
            <p>No hay playas con esos criterios.</p>
            <button className={styles.emptyBtn} onClick={() => { setQ(''); setFiltros({}); setComunidad('') }}>
              Ver todas las playas
            </button>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {visible.map(p => (
                <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardNombre}>{p.nombre}</div>
                    <div className={styles.cardLugar}>{p.municipio} · {p.provincia}</div>
                    <div className={styles.cardComunidad}>{p.comunidad}</div>
                  </div>
                  <div className={styles.cardBadges}>
                    {p.bandera    && <span className={styles.badge} title="Bandera Azul">B. Azul</span>}
                    {p.socorrismo && <span className={styles.badge} title="Socorrismo">Socorr.</span>}
                    {p.accesible  && <span className={styles.badge} title="Accesible">PMR</span>}
                    {p.perros     && <span className={styles.badge} title="Perros">Perros</span>}
                    {p.duchas     && <span className={styles.badge} title="Duchas">Duchas</span>}
                    {p.parking    && <span className={styles.badge} title="Parking">P</span>}
                  </div>
                  <svg className={styles.arrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                  </svg>
                </Link>
              ))}
            </div>

            {/* Paginación */}
            {paginas > 1 && (
              <div className={styles.paginacion}>
                <button
                  className={styles.pageBtn}
                  disabled={pagina === 1}
                  onClick={() => { setPagina(p => p - 1); window.scrollTo(0, 0) }}
                >← Anterior</button>
                <span className={styles.pageInfo}>{pagina} / {paginas}</span>
                <button
                  className={styles.pageBtn}
                  disabled={pagina === paginas}
                  onClick={() => { setPagina(p => p + 1); window.scrollTo(0, 0) }}
                >Siguiente →</button>
              </div>
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
