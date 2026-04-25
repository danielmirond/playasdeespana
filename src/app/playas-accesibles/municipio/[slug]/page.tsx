import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasAccesibles, getAccesiblesStats, toSlug } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import styles from '../../PlayasAccesibles.module.css'

export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAccesiblesStats()).municipios.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = (await getAccesiblesStats()).municipios.find(m => m.slug === slug)
  if (!m) return {}
  return {
    title: `Playas accesibles en ${m.nombre} | ${m.count} playas`,
    description: `${m.count} playas accesibles en ${m.nombre} (${m.provincia}). Mapa, servicios y accesos.`,
    alternates: { canonical: `/playas-accesibles/municipio/${slug}` },
  }
}

export default async function MunicipioAccesiblesPage({ params }: Props) {
  const { slug } = await params
  const [playas, stats] = await Promise.all([getPlayasAccesibles(), getAccesiblesStats()])
  const mun = stats.municipios.find(m => m.slug === slug)
  if (!mun) notFound()

  const filtradas = playas.filter(p => toSlug(p.municipio) === slug)
  const provincia = stats.provincias.find(p => p.slug === mun.provinciaSlug)

  return (
    <>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href="/playas-accesibles">Playas accesibles</Link>
            {provincia && (<>
              <span aria-hidden="true">›</span>
              <Link href={`/playas-accesibles/comunidad/${provincia.comunidadSlug}`}>{provincia.comunidad}</Link>
              <span aria-hidden="true">›</span>
              <Link href={`/playas-accesibles/provincia/${provincia.slug}`}>{provincia.nombre}</Link>
            </>)}
            <span aria-hidden="true">›</span>
            <span aria-current="page">{mun.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas accesibles en {mun.nombre}</h1>
          <p className={styles.subtitulo}>{mun.count} playas accesibles{provincia && `, ${provincia.nombre}`}</p>
        </div>
      </div>
      <div className={styles.wrap}>
        {filtradas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa accesibles en {mun.nombre}</span>
              <span className={styles.mapaSrc}>{filtradas.length} playas</span>
            </div>
            <MapaPlayas playas={filtradas} height="400px" />
          </div>
        )}
        <section aria-labelledby="list-t"><h2 id="list-t" className={styles.sectionTitle}>Listado de playas</h2>
          <div className={styles.lista}>{filtradas.map(p => (
            <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>{p.nombre}</div>
                <div className={styles.rowMeta}>{p.provincia}
                  {p.bandera && <span className={styles.badge}>Bandera Azul</span>}
                  {p.accesible && <span className={styles.badge}>PMR</span>}
                  {p.duchas && <span className={styles.badge}>Duchas</span>}
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
