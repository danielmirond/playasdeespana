'use client'
// src/components/home/Buscador.tsx. Buscador de la home con autocompletado.
//
// Mientras el usuario escribe, hacemos fetch a /api/search?q=... con
// debounce 150ms y mostramos un dropdown con hasta 8 playas que
// coinciden. Click en una → ficha directa.
//
// Las sugerencias 'Prueba:' apuntan a fichas concretas (no a búsquedas).
// Los chips de filtro siguen yendo a /buscar con el filtro preseleccionado.

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './Buscador.module.css'

interface PlayaResultado {
  slug:      string
  nombre:    string
  municipio: string
  provincia: string
}

const SUGERENCIAS: { label: string; slug: string }[] = [
  { label: 'La Concha',   slug: 'kontxa-hondartza' },
  { label: 'Ses Illetes', slug: 'platja-dilletes' },
  { label: 'Bolonia',     slug: 'playa-de-bolonia' },
  { label: 'Famara',      slug: 'playa-de-famara' },
  { label: 'Zurriola',    slug: 'zurriola' },
  { label: 'Las Rodas',   slug: 'a-area-das-rodas' },
]

const FILTROS = [
  { key: 'bandera',    label: 'Bandera Azul', labelEn: 'Blue Flag' },
  { key: 'socorrismo', label: 'Socorrismo',   labelEn: 'Lifeguard' },
  { key: 'accesible',  label: 'Accesible',    labelEn: 'Accessible' },
  { key: 'perros',     label: 'Perros',       labelEn: 'Dogs allowed' },
  { key: 'duchas',     label: 'Duchas',       labelEn: 'Showers' },
  { key: 'parking',    label: 'Parking',      labelEn: 'Parking' },
]

interface Props {
  locale?: 'es' | 'en'
}

export default function Buscador({ locale = 'es' }: Props) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<PlayaResultado[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const es = locale === 'es'

  const fichaBase   = es ? '/playas' : '/en/beaches'
  const searchBase  = es ? '/buscar' : '/en/search'
  const placeholder = es ? 'Nombre, municipio o provincia…' : 'Beach name, town or province…'

  // Debounced fetch a /api/search
  useEffect(() => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const ac = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: ac.signal })
        if (!res.ok) return
        const data = await res.json()
        if (data?.results && Array.isArray(data.results)) {
          setResults(data.results)
          setOpen(data.results.length > 0)
          setHighlighted(-1)
        }
      } catch {
        // abort silencioso
      }
    }, 150)
    return () => {
      clearTimeout(t)
      ac.abort()
    }
  }, [q])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Submit: si hay un resultado destacado → ir a esa ficha;
  // si no, ir a /buscar con la query.
  const handleSearch = useCallback(() => {
    const trimmed = q.trim()
    if (highlighted >= 0 && results[highlighted]) {
      router.push(`${fichaBase}/${results[highlighted].slug}`)
      return
    }
    if (trimmed) {
      // Si hay exactamente 1 resultado, ir directo
      if (results.length === 1) {
        router.push(`${fichaBase}/${results[0].slug}`)
        return
      }
      router.push(`${searchBase}?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push(searchBase)
    }
  }, [q, router, fichaBase, searchBase, results, highlighted])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, results.length - 1))
      setOpen(true)
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const handleFilter = (key: string) => {
    const params = new URLSearchParams()
    params.set(key, '1')
    router.push(`${searchBase}?${params.toString()}`)
  }

  return (
    <div className={styles.wrap} ref={wrapperRef}>
      <div className={styles.box} style={{ position: 'relative' }}>
        <svg className={styles.icon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <label htmlFor="beach-search" className="sr-only">{placeholder}</label>
        <input
          id="beach-search"
          className={styles.input}
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-controls="beach-search-listbox"
          aria-expanded={open}
          aria-activedescendant={highlighted >= 0 ? `beach-search-opt-${highlighted}` : undefined}
          role="combobox"
        />
        <button type="button" className={styles.btn} onClick={handleSearch}>
          {es ? 'Buscar' : 'Search'}
        </button>

        {/* Dropdown de autocompletado */}
        {open && results.length > 0 && (
          <ul
            id="beach-search-listbox"
            role="listbox"
            style={{
              position:   'absolute',
              top:        'calc(100% + 4px)',
              left:       0,
              right:      0,
              background: 'var(--card-bg, #faf6ef)',
              border:     '1px solid var(--line, #e8dcc8)',
              borderRadius: 6,
              boxShadow:  '0 8px 24px rgba(0,0,0,.12)',
              listStyle:  'none',
              margin:     0,
              padding:    '.35rem 0',
              zIndex:     50,
              maxHeight:  '60vh',
              overflowY:  'auto',
            }}
          >
            {results.map((r, i) => (
              <li key={r.slug} role="option" aria-selected={highlighted === i} id={`beach-search-opt-${i}`}>
                <Link
                  href={`${fichaBase}/${r.slug}`}
                  onMouseEnter={() => setHighlighted(i)}
                  style={{
                    display:        'block',
                    padding:        '.5rem 1rem',
                    textDecoration: 'none',
                    color:          'var(--ink, #2a1a08)',
                    background:     highlighted === i ? 'color-mix(in srgb, var(--accent, #6b400a) 8%, transparent)' : 'transparent',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{r.nombre}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted, #5a3d12)' }}>
                    {r.municipio} · {r.provincia}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.suggest}>
        <span>{es ? 'Prueba:' : 'Try:'}</span>
        {SUGERENCIAS.map(s => {
          const href = es ? `/playas/${s.slug}` : `/en/beaches/${s.slug}`
          return (
            <Link key={s.slug} href={href} className={styles.sugBtn}>
              {s.label}
            </Link>
          )
        })}
      </div>

      <div className={styles.filtros} role="group" aria-label={es ? 'Filtros rápidos' : 'Quick filters'}>
        <span className={styles.filtrosLbl}>{es ? 'Filtrar:' : 'Filter:'}</span>
        {FILTROS.map(f => (
          <button
            key={f.key}
            type="button"
            className={styles.chip}
            onClick={() => handleFilter(f.key)}
            aria-label={es ? `Buscar playas con ${f.label.toLowerCase()}` : `Search beaches with ${f.labelEn.toLowerCase()}`}
          >
            {es ? f.label : f.labelEn}
          </button>
        ))}
      </div>
    </div>
  )
}
