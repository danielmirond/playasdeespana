// src/app/playas-perros/municipio/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasPerros, getPerrosStats, toSlug } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { Info } from '@phosphor-icons/react/dist/ssr'
import styles from '../../PlayasPerros.module.css'

export const revalidate = 86400

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const stats = await getPerrosStats()
  return stats.municipios.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const stats = await getPerrosStats()
  const mun = stats.municipios.find(m => m.slug === slug)
  if (!mun) return {}
  return {
    title: `Playas para perros en ${mun.nombre} — ${mun.count} playas caninas`,
    description: `${mun.count} playas donde se permite la entrada de perros en ${mun.nombre} (${mun.provincia}). Mapa, servicios y normativa local.`,
    alternates: { canonical: `/playas-perros/municipio/${slug}` },
  }
}

export default async function MunicipioPerrosPage({ params }: Props) {
  const { slug } = await params
  const [playas, stats] = await Promise.all([getPlayasPerros(), getPerrosStats()])
  const mun = stats.municipios.find(m => m.slug === slug)
  if (!mun) notFound()

  const playasFiltradas = playas.filter(p => toSlug(p.municipio) === slug)
  const provincia = stats.provincias.find(p => p.slug === mun.provinciaSlug)

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Playas para perros en ${mun.nombre}`,
    numberOfItems: playasFiltradas.length,
    itemListElement: playasFiltradas.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.nombre,
      url: `https://playas-espana.com/playas/${p.slug}`,
    })),
  }

  return (
    <>
      <Nav />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href="/playas-perros">Playas para perros</Link>
            {provincia && (
              <>
                <span aria-hidden="true">›</span>
                <Link href={`/playas-perros/comunidad/${provincia.comunidadSlug}`}>
                  {provincia.comunidad}
                </Link>
                <span aria-hidden="true">›</span>
                <Link href={`/playas-perros/provincia/${provincia.slug}`}>
                  {provincia.nombre}
                </Link>
              </>
            )}
            <span aria-hidden="true">›</span>
            <span aria-current="page">{mun.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas para perros en {mun.nombre}</h1>
          <p className={styles.subtitulo}>
            {mun.count} {mun.count === 1 ? 'playa canina' : 'playas caninas'} en {mun.nombre}
            {provincia && `, ${provincia.nombre}`}
          </p>
          <p className={styles.desc}>
            Listado de playas donde se permite la entrada de perros en el término municipal de {mun.nombre}.
            Consulta siempre la ordenanza del ayuntamiento antes de desplazarte.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.info} role="note">
          <Info size={22} weight="bold" className={styles.infoIcon} aria-hidden="true" />
          <p className={styles.infoText}>
            La documentación y los horarios para acceder a las playas con perros los define el ayuntamiento
            de {mun.nombre}. Lleva cartilla sanitaria, correa, bozal si procede y bolsa para excrementos.
          </p>
        </div>

        {playasFiltradas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa de playas caninas en {mun.nombre}</span>
              <span className={styles.mapaSrc}>{playasFiltradas.length} playas</span>
            </div>
            <MapaPlayas playas={playasFiltradas} height="400px" />
          </div>
        )}

        <section aria-labelledby="lista-title">
          <h2 id="lista-title" className={styles.sectionTitle}>Listado de playas</h2>
          <div className={styles.lista}>
            {playasFiltradas.map(p => (
              <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
                <div className={styles.rowInfo}>
                  <div className={styles.rowNombre}>{p.nombre}</div>
                  <div className={styles.rowMeta}>
                    {p.provincia}
                    {p.bandera && <span className={styles.badge}>Bandera Azul</span>}
                    {p.socorrismo && <span className={styles.badge}>Socorrismo</span>}
                    {p.duchas && <span className={styles.badge}>Duchas</span>}
                    {p.parking && <span className={styles.badge}>Parking</span>}
                    {p.accesible && <span className={styles.badge}>PMR</span>}
                  </div>
                </div>
                <span className={styles.rowArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
    </>
  )
}
