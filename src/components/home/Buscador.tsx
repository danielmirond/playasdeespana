'use client'
import { Sun, Umbrella } from '@phosphor-icons/react'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Buscador.module.css'

const SUGERENCIAS = ['La Concha', 'Ses Illetes', 'Tarifa', 'Famara', 'Bolonia', 'Zurriola']

const FILTROS_ES = [
  { key: 'calma',      label: '☀️ Mar en calma' },
  { key: 'bandera',    label: '🏖 Bandera Azul' },
  { key: 'socorrismo', label: '🏊 Socorrismo' },
  { key: 'accesible',  label: '♿ Accesible' },
  { key: 'perros',     label: '🐕 Perros' },
  { key: 'duchas',     label: '🚿 Duchas' },
]

const FILTROS_EN = [
  { key: 'calma',      label: '☀️ Calm sea' },
  { key: 'bandera',    label: '🏖 Blue Flag' },
  { key: 'socorrismo', label: '🏊 Lifeguard' },
  { key: 'accesible',  label: '♿ Accessible' },
  { key: 'perros',     label: '🐕 Dogs allowed' },
  { key: 'duchas',     label: '🚿 Showers' },
]

interface Props {
  onSearch?: (q: string) => void
  onFilter?: (filters: Record<string, boolean>) => void
  locale?: 'es' | 'en'
}

export default function Buscador({ onSearch, onFilter, locale = 'es' }: Props) {
  const router  = useRouter()
  const [q, setQ]             = useState('')
  const [activos, setActivos] = useState<Record<string, boolean>>({})

  const FILTROS  = locale === 'en' ? FILTROS_EN : FILTROS_ES
  const placeholder = locale === 'en' ? 'Beach name, town or province…' : 'Nombre, municipio o provincia…'
  const btnLabel    = locale === 'en' ? 'Search' : 'Buscar'
  const tryLabel    = locale === 'en' ? 'Try:' : 'Prueba:'
  const filterLabel = locale === 'en' ? 'Filter:' : 'Filtrar:'
  const searchBase  = locale === 'en' ? '/en/search' : '/buscar'

  const handleSearch = useCallback(() => {
    if (q.trim()) {
      onSearch ? onSearch(q) : router.push(`${searchBase}?q=${encodeURIComponent(q)}`)
    }
  }, [q, onSearch, router, searchBase])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const toggleFiltro = (key: string) => {
    const next = { ...activos, [key]: !activos[key] }
    if (!next[key]) delete next[key]
    setActivos(next)
    onFilter?.(next)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <svg className={styles.icon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder}
        />
        <button className={styles.btn} onClick={handleSearch}>{btnLabel}</button>
      </div>

      <div className={styles.suggest}>
        <span>{tryLabel}</span>
        {SUGERENCIAS.map(s => (
          <button key={s} className={styles.sugBtn} onClick={() => { setQ(s); onSearch?.(s) }}>
            {s}
          </button>
        ))}
      </div>

      <div className={styles.filtros}>
        <span className={styles.filtrosLbl}>{filterLabel}</span>
        {FILTROS.map(f => (
          <button
            key={f.key}
            className={`${styles.chip} ${activos[f.key] ? styles.chipOn : ''}`}
            onClick={() => toggleFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
