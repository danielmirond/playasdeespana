// src/components/home/Comunidades.tsx — Design system hub card pattern
import Link from 'next/link'
import styles from './Comunidades.module.css'

interface Comunidad { nombre: string; slug: string; count: number }
interface Props { comunidades: Comunidad[] }

export default function Comunidades({ comunidades }: Props) {
  const top = comunidades.filter(c => c.count >= 50)
  const rest = comunidades.filter(c => c.count < 50)

  return (
    <section className={styles.section}>
      <div className={styles.hd}>
        <h2 className={styles.hdTitle}>
          Por <em>comunidad</em>
        </h2>
        <Link href="/comunidades" className={styles.hdAction}>Ver todas →</Link>
      </div>
      <div className={styles.grid}>
        {top.map(c => (
          <Link key={c.slug} href={`/comunidad/${c.slug}`} className={styles.item}>
            <div className={styles.info}>
              <span className={styles.nombre}>{c.nombre}</span>
              <span className={styles.n}>{c.count.toLocaleString('es')} playas</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={styles.chevron}><polyline points="9,6 15,12 9,18"/></svg>
          </Link>
        ))}
      </div>
      {rest.length > 0 && (
        <div className={styles.restRow}>
          {rest.map(c => (
            <Link key={c.slug} href={`/comunidad/${c.slug}`} className={styles.restItem}>
              {c.nombre} <span className={styles.restN}>({c.count})</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
