'use client'
// src/components/home/Buscador.tsx. Buscador de la home.
//
// Fix principal: los chips de filtro ahora NAVEGAN a /buscar con el
// filtro preseleccionado. Antes eran decorativos (cambiaban estado
// local pero no hacían nada con él).
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Buscador.module.css'

const SUGERENCIAS = ['La Concha', 'Ses Illetes', 'Tarifa', 'Famara', 'Bolonia', 'Zurriola']

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
  const es = locale === 'es'

  const searchBase = es ? '/buscar' : '/en/search'
  const placeholder = es ? 'Nombre, municipio o provincia…' : 'Beach name, town or province…'

  const handleSearch = useCallback(() => {
    const trimmed = q.trim()
    if (trimmed) {
      router.push(`${searchBase}?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push(searchBase)
    }
  }, [q, router, searchBase])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleSuggestion = (s: string) => {
    router.push(`${searchBase}?q=${encodeURIComponent(s)}`)
  }

  // Los chips ahora navegan directamente a /buscar con el filtro activo.
  // Ya no mantienen estado local (que no hacía nada).
  const handleFilter = (key: string) => {
    const params = new URLSearchParams()
    params.set(key, '1')
    router.push(`${searchBase}?${params.toString()}`)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
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
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder}
        />
        <button type="button" className={styles.btn} onClick={handleSearch}>
          {es ? 'Buscar' : 'Search'}
        </button>
      </div>

      <div className={styles.suggest}>
        <span>{es ? 'Prueba:' : 'Try:'}</span>
        {SUGERENCIAS.map(s => (
          <button key={s} type="button" className={styles.sugBtn} onClick={() => handleSuggestion(s)}>
            {s}
          </button>
        ))}
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
