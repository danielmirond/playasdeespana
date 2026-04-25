import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasNudistas, getNudistasStats } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import styles from '../../PlayasNudistas.module.css'

export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getNudistasStats()).comunidades.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = (await getNudistasStats()).comunidades.find(c => c.slug === slug)
  if (!c) return {}
  return {
    title: `Playas nudistas en ${c.nombre} (${c.count}) | Listado 2026`,
    description: `${c.count} playas nudistas en ${c.nombre}: mapa interactivo, provincias y municipios.`,
    alternates: { canonical: `/playas-nudistas/comunidad/${slug}` },
  }
}

export default async function ComunidadNudistasPage({ params }: Props) {
  const { slug } = await params
  const [playas, stats] = await Promise.all([getPlayasNudistas(), getNudistasStats()])
  const comunidad = stats.comunidades.find(c => c.slug === slug)
  if (!comunidad) notFound()

  const toSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const filtradas = playas.filter(p => toSlug(p.comunidad) === slug)
  const provs = stats.provincias.filter(p => p.comunidadSlug === slug)
  const muns = stats.municipios.filter(m => provs.some(p => p.slug === m.provinciaSlug))

  return (
    <>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href="/playas-nudistas">Playas nudistas</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{comunidad.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas nudistas en {comunidad.nombre}</h1>
          <p className={styles.subtitulo}>{comunidad.count} playas nudistas{provs.length > 0 && ` en ${provs.length} provincias`}</p>
        </div>
      </div>
      <div className={styles.wrap}>
        {filtradas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa nudistas en {comunidad.nombre}</span>
              <span className={styles.mapaSrc}>{filtradas.length} playas</span>
            </div>
            <MapaPlayas playas={filtradas} height="400px" comunidad={comunidad.nombre} />
          </div>
        )}
        {provs.length > 0 && (
          <section aria-labelledby="prov-t"><h2 id="prov-t" className={styles.sectionTitle}>Por provincia</h2>
            <div className={styles.linksNav}>{provs.map(p => (
              <Link key={p.slug} href={`/playas-nudistas/provincia/${p.slug}`} className={styles.linkCard}>
                <span className={styles.linkCardNombre}>{p.nombre}</span><span className={styles.linkCardCount}>{p.count}</span>
              </Link>
            ))}</div>
          </section>
        )}
        <section aria-labelledby="list-t" style={{ marginTop: '2.5rem' }}><h2 id="list-t" className={styles.sectionTitle}>Listado de playas</h2>
          <div className={styles.lista}>{filtradas.map(p => (
            <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>{p.nombre}</div>
                <div className={styles.rowMeta}>{p.municipio} · {p.provincia}
                  {p.bandera && <span className={styles.badge}>Bandera Azul</span>}
                  {p.accesible && <span className={styles.badge}>PMR</span>}
                </div>
              </div>
              <span className={styles.rowArrow} aria-hidden="true">→</span>
            </Link>
          ))}</div>
        </section>
        {muns.length > 0 && (
          <section aria-labelledby="mun-t" style={{ marginTop: '2.5rem' }}><h2 id="mun-t" className={styles.sectionTitle}>Por municipio</h2>
            <div className={styles.linksNav}>{muns.filter(m => m.count >= 2).map(m => (
              <Link key={m.slug} href={`/playas-nudistas/municipio/${m.slug}`} className={styles.linkCard}>
                <span className={styles.linkCardNombre}>{m.nombre}</span><span className={styles.linkCardCount}>{m.count}</span>
              </Link>
            ))}</div>
          </section>
        )}
      </div>
    </>
  )
}
