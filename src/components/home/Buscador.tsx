'use client'
// src/components/home/Buscador.tsx. Buscador de la home.
//
// Las sugerencias 'Prueba:' navegan DIRECTO a la ficha de cada playa
// (mejor UX que pasar por /buscar). Los chips de filtro siguen yendo
// a /buscar con el filtro preseleccionado.
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './Buscador.module.css'

// Cada sugerencia apunta a la ficha de una playa icónica concreta.
// Diversidad geográfica: Cantábrica, Mediterránea, Atlántica, Canarias.
const SUGERENCIAS: { label: string; slug: string }[] = [
  { label: 'La Concha',   slug: 'kontxa-hondartza' },     // Donostia, Gipuzkoa
  { label: 'Ses Illetes', slug: 'platja-dilletes' },      // Calvià, Mallorca
  { label: 'Bolonia',     slug: 'playa-de-bolonia' },     // Tarifa, Cádiz
  { label: 'Famara',      slug: 'playa-de-famara' },      // Lanzarote
  { label: 'Zurriola',    slug: 'zurriola' },             // Donostia
  { label: 'Las Rodas',   slug: 'a-area-das-rodas' },     // Islas Cíes, Pontevedra
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

  // Ya no usamos router programático para las sugerencias: ahora son
  // <Link> reales a /playas/<slug>. Mejor SEO (Google indexa los hrefs)
  // y mejor accesibilidad (middle-click abre en pestaña nueva).

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
