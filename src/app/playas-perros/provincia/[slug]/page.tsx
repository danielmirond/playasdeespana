// src/app/playas-perros/provincia/[slug]/page.tsx
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
  return stats.provincias.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const stats = await getPerrosStats()
  const provincia = stats.provincias.find(p => p.slug === slug)
  if (!provincia) return {}
  return {
    title: `Playas para perros en ${provincia.nombre} (${provincia.count}) — Listado 2026`,
    description: `${provincia.count} playas caninas en ${provincia.nombre}: mapa interactivo, municipios pet-friendly y normativa local.`,
    alternates: { canonical: `/playas-perros/provincia/${slug}` },
  }
}

export default async function ProvinciaPerrosPage({ params }: Props) {
  const { slug } = await params
  const [playas, stats] = await Promise.all([getPlayasPerros(), getPerrosStats()])
  const provincia = stats.provincias.find(p => p.slug === slug)
  if (!provincia) notFound()

  const playasFiltradas = playas.filter(p => toSlug(p.provincia) === slug)
  const municipiosDeEsta = stats.municipios.filter(m => m.provinciaSlug === slug)

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Playas para perros en ${provincia.nombre}`,
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
            <span aria-hidden="true">›</span>
            <Link href={`/playas-perros/comunidad/${provincia.comunidadSlug}`}>
              {provincia.comunidad}
            </Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{provincia.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas para perros en {provincia.nombre}</h1>
          <p className={styles.subtitulo}>
            {provincia.count} {provincia.count === 1 ? 'playa canina' : 'playas caninas'}
            {municipiosDeEsta.length > 0 && ` en ${municipiosDeEsta.length} ${municipiosDeEsta.length === 1 ? 'municipio' : 'municipios'}`}
          </p>
          <p className={styles.desc}>
            Playas donde se permite la entrada de perros en la provincia de {provincia.nombre}, pertenecientes
            a {provincia.comunidad}. Mapa interactivo, municipios, servicios y enlace al reglamento local.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.info} role="note">
          <Info size={22} weight="bold" className={styles.infoIcon} aria-hidden="true" />
          <p className={styles.infoText}>
            Las condiciones para acceder con perro varían entre municipios. Consulta la ordenanza del
            ayuntamiento antes de ir, lleva la documentación sanitaria y recoge los excrementos.
          </p>
        </div>

        {playasFiltradas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa de playas caninas en {provincia.nombre}</span>
              <span className={styles.mapaSrc}>{playasFiltradas.length} playas</span>
            </div>
            <MapaPlayas playas={playasFiltradas} height="400px" provincia={provincia.nombre} />
          </div>
        )}

        {/* Municipios dentro */}
        {municipiosDeEsta.length > 0 && (
          <section aria-labelledby="municipios-title">
            <h2 id="municipios-title" className={styles.sectionTitle}>Por municipio</h2>
            <div className={styles.linksNav}>
              {municipiosDeEsta.map(m => (
                <Link
                  key={m.slug}
                  href={`/playas-perros/municipio/${m.slug}`}
                  className={styles.linkCard}
                >
                  <span className={styles.linkCardNombre}>{m.nombre}</span>
                  <span className={styles.linkCardCount}>{m.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Listado completo */}
        <section aria-labelledby="lista-title" style={{ marginTop: '2.5rem' }}>
          <h2 id="lista-title" className={styles.sectionTitle}>Listado de playas</h2>
          <div className={styles.lista}>
            {playasFiltradas.map(p => (
              <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
                <div className={styles.rowInfo}>
                  <div className={styles.rowNombre}>{p.nombre}</div>
                  <div className={styles.rowMeta}>
                    {p.municipio}
                    {p.bandera && <span className={styles.badge}>Bandera Azul</span>}
                    {p.socorrismo && <span className={styles.badge}>Socorrismo</span>}
                    {p.duchas && <span className={styles.badge}>Duchas</span>}
                    {p.parking && <span className={styles.badge}>Parking</span>}
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
