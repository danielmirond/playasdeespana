import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasNudistas, getNudistasStats, toSlug } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import styles from '../../PlayasNudistas.module.css'

export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getNudistasStats()).provincias.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = (await getNudistasStats()).provincias.find(p => p.slug === slug)
  if (!p) return {}
  return {
    title: `Playas nudistas en ${p.nombre} (${p.count}) — Listado 2026`,
    description: `${p.count} playas nudistas en la provincia de ${p.nombre}. Mapa interactivo, municipios y servicios.`,
    alternates: { canonical: `/playas-nudistas/provincia/${slug}` },
  }
}

export default async function ProvinciaNudistasPage({ params }: Props) {
  const { slug } = await params
  const [playas, stats] = await Promise.all([getPlayasNudistas(), getNudistasStats()])
  const provincia = stats.provincias.find(p => p.slug === slug)
  if (!provincia) notFound()

  const filtradas = playas.filter(p => toSlug(p.provincia) === slug)
  const muns = stats.municipios.filter(m => m.provinciaSlug === slug)

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
            <Link href={`/playas-nudistas/comunidad/${provincia.comunidadSlug}`}>{provincia.comunidad}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{provincia.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas nudistas en {provincia.nombre}</h1>
          <p className={styles.subtitulo}>{provincia.count} playas nudistas{muns.length > 0 && ` en ${muns.length} municipios`}</p>
        </div>
      </div>
      <div className={styles.wrap}>
        {filtradas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa nudistas en {provincia.nombre}</span>
              <span className={styles.mapaSrc}>{filtradas.length} playas</span>
            </div>
            <MapaPlayas playas={filtradas} height="400px" provincia={provincia.nombre} />
          </div>
        )}
        {muns.length > 0 && (
          <section aria-labelledby="mun-t"><h2 id="mun-t" className={styles.sectionTitle}>Por municipio</h2>
            <div className={styles.linksNav}>{muns.filter(m => m.count >= 2).map(m => (
              <Link key={m.slug} href={`/playas-nudistas/municipio/${m.slug}`} className={styles.linkCard}>
                <span className={styles.linkCardNombre}>{m.nombre}</span><span className={styles.linkCardCount}>{m.count}</span>
              </Link>
            ))}</div>
          </section>
        )}
        <section aria-labelledby="list-t" style={{ marginTop: '2.5rem' }}><h2 id="list-t" className={styles.sectionTitle}>Listado de playas</h2>
          <div className={styles.lista}>{filtradas.map(p => (
            <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>{p.nombre}</div>
                <div className={styles.rowMeta}>{p.municipio}
                  {p.bandera && <span className={styles.badge}>Bandera Azul</span>}
                  {p.accesible && <span className={styles.badge}>PMR</span>}
                </div>
              </div>
              <span className={styles.rowArrow} aria-hidden="true">→</span>
            </Link>
          ))}</div>
        </section>
      </div>
    </>
  )
}
