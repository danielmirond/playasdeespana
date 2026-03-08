'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Buscador.module.css'

const SUGERENCIAS = ['La Concha', 'Ses Illetes', 'Tarifa', 'Famara', 'Bolonia', 'Zurriola']

const FILTROS: { key: string; label: string }[] = [
  { key: 'calma',      label: '☀️ Mar en calma' },
  { key: 'bandera',    label: '🏖 Bandera Azul' },
  { key: 'socorrismo', label: '🏊 Socorrismo' },
  { key: 'accesible',  label: '♿ Accesible' },
  { key: 'perros',     label: '🐕 Perros' },
  { key: 'duchas',     label: '🚿 Duchas' },
]

interface Props {
  onSearch?: (q: string) => void
  onFilter?: (filters: Record<string, boolean>) => void
}

export default function Buscador({ onSearch, onFilter }: Props) {
  const router  = useRouter()
  const [q, setQ]           = useState('')
  const [activos, setActivos] = useState<Record<string, boolean>>({})

  const handleSearch = useCallback(() => {
    if (q.trim()) {
      onSearch ? onSearch(q) : router.push(`/buscar?q=${encodeURIComponent(q)}`)
    }
  }, [q, onSearch, router])

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
      {/* Caja de búsqueda */}
      <div className={styles.box}>
        <svg className={styles.icon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.input}
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Nombre, municipio o provincia…"
          autoComplete="off"
        />
        <button className={styles.btn} onClick={handleSearch}>Buscar</button>
      </div>

      {/* Sugerencias */}
      <div className={styles.suggest}>
        <span>Prueba:</span>
        {SUGERENCIAS.map(s => (
          <button key={s} className={styles.sugBtn} onClick={() => { setQ(s); onSearch?.(s) }}>
            {s}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <span className={styles.filtrosLbl}>Filtrar:</span>
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
