// src/app/comunidades/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getComunidades, getProvincias } from '@/lib/playas'
import styles from './comunidades.module.css'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Comunidades y provincias — Playas de España',
  description: 'Explora las playas de España por comunidad autónoma y provincia.',
}

const ICONOS: Record<string, string> = {
  // Costeras
  'Andalucía': 'AND', 'Asturias': 'AST', 'Islas Baleares': 'BAL',
  'Canarias': 'CAN', 'Cantabria': 'CTB', 'Cataluña': 'CAT',
  'Comunitat Valenciana': 'VAL', 'Galicia': 'GAL', 'Murcia': 'MUR',
  'País Vasco': 'PVA', 'Ceuta': 'CEU', 'Melilla': 'MEL',
  // Interiores (playas fluviales)
  'Castilla y León': 'CYL', 'Castilla-La Mancha': 'CLM',
  'Extremadura': 'EXT', 'Aragón': 'ARA', 'Navarra': 'NAV',
  'La Rioja': 'RIO', 'Madrid': 'MAD',
}

// Comunidades consideradas costeras (aparecen primero en el listado).
const COSTERAS = new Set([
  'Galicia', 'Asturias', 'Cantabria', 'País Vasco',
  'Cataluña', 'Comunitat Valenciana', 'Murcia', 'Andalucía',
  'Islas Baleares', 'Canarias', 'Ceuta', 'Melilla',
])

export default async function ComunidadesPage() {
  const [comunidadesRaw, provincias] = await Promise.all([
    getComunidades(),
    getProvincias(),
  ])

  // Filtrar valores basura que aparecen cuando CartoCiudad no puede
  // resolver la provincia (fallback "España") — no es una comunidad real.
  const comunidades = comunidadesRaw.filter(c => c.nombre !== 'España' && c.nombre)

  // Agrupar provincias por comunidad
  const provPorCom: Record<string, typeof provincias> = {}
  for (const p of provincias) {
    if (!provPorCom[p.comunidad]) provPorCom[p.comunidad] = []
    provPorCom[p.comunidad].push(p)
  }

  // Separar costeras (primero) e interiores (después)
  const costeras = comunidades.filter(c => COSTERAS.has(c.nombre))
  const interiores = comunidades.filter(c => !COSTERAS.has(c.nombre))

  const renderCard = (c: typeof comunidades[number]) => {
    const provs = (provPorCom[c.nombre] ?? []).sort((a, b) => b.count - a.count)
    return (
      <div key={c.slug} className={styles.card}>
        {/* Cabecera comunidad */}
        <Link href={`/comunidad/${c.slug}`} className={styles.cardHead}>
          <span className={styles.icono} aria-hidden="true">{ICONOS[c.nombre] ?? '●'}</span>
          <div className={styles.cardHeadInfo}>
            <span className={styles.nombre}>{c.nombre}</span>
            <span className={styles.count}>{c.count.toLocaleString('es')} playas</span>
          </div>
          <svg className={styles.arrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
          </svg>
        </Link>

        {/* Provincias */}
        {provs.length > 0 && (
          <div className={styles.provs}>
            {provs.map(p => (
              <Link key={p.slug} href={`/provincia/${p.slug}`} className={styles.prov}>
                <span className={styles.provNombre}>{p.nombre}</span>
                <span className={styles.provCount}>{p.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Comunidades <em>y provincias</em></h1>
          <p className={styles.sub}>
            {comunidades.length} comunidades · {provincias.length} provincias · {comunidades.reduce((a, c) => a + c.count, 0).toLocaleString('es')} playas
          </p>
        </div>

        <section aria-labelledby="costeras-title">
          <h2 id="costeras-title" className={styles.sectionTitle}>Comunidades con costa</h2>
          <div className={styles.grid}>
            {costeras.map(renderCard)}
          </div>
        </section>

        {interiores.length > 0 && (
          <section aria-labelledby="interior-title" style={{ marginTop: '3rem' }}>
            <h2 id="interior-title" className={styles.sectionTitle}>Interior — playas fluviales y lagos</h2>
            <p className={styles.sectionDesc}>
              Playas de ríos, embalses y lagos en comunidades sin costa.
            </p>
            <div className={styles.grid}>
              {interiores.map(renderCard)}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
