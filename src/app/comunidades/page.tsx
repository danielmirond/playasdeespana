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
  'Andalucía': '🌞', 'Asturias': '🌿', 'Baleares': '🏝',
  'Canarias': '🌋', 'Cantabria': '⛰', 'Cataluña': '🏛',
  'C. Valenciana': '🍊', 'Galicia': '🌊', 'Murcia': '🌴',
  'País Vasco': '🦑', 'Ceuta': '🏰', 'Melilla': '🌺',
}

export default async function ComunidadesPage() {
  const [comunidades, provincias] = await Promise.all([
    getComunidades(),
    getProvincias(),
  ])

  // Agrupar provincias por comunidad
  const provPorCom: Record<string, typeof provincias> = {}
  for (const p of provincias) {
    if (!provPorCom[p.comunidad]) provPorCom[p.comunidad] = []
    provPorCom[p.comunidad].push(p)
  }

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Comunidades y provincias</h1>
          <p className={styles.sub}>
            {comunidades.length} comunidades · {provincias.length} provincias · {comunidades.reduce((a, c) => a + c.count, 0).toLocaleString('es')} playas
          </p>
        </div>

        <div className={styles.grid}>
          {comunidades.map(c => {
            const provs = (provPorCom[c.nombre] ?? []).sort((a, b) => b.count - a.count)
            return (
              <div key={c.slug} className={styles.card}>
                {/* Cabecera comunidad */}
                <Link href={`/comunidad/${c.slug}`} className={styles.cardHead}>
                  <span className={styles.icono}>{ICONOS[c.nombre] ?? '🏖'}</span>
                  <div className={styles.cardHeadInfo}>
                    <span className={styles.nombre}>{c.nombre}</span>
                    <span className={styles.count}>{c.count.toLocaleString('es')} playas</span>
                  </div>
                  <svg className={styles.arrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          })}
        </div>
      </main>
    </>
  )
}
