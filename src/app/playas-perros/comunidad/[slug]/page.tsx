// src/app/playas-perros/comunidad/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasPerros, getPerrosStats } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { Info } from '@phosphor-icons/react/dist/ssr'
import styles from '../../PlayasPerros.module.css'

export const revalidate = 86400

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const stats = await getPerrosStats()
  return stats.comunidades.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const stats = await getPerrosStats()
  const comunidad = stats.comunidades.find(c => c.slug === slug)
  if (!comunidad) return {}
  return {
    title: `Playas para perros en ${comunidad.nombre} (${comunidad.count}) — Listado 2026`,
    description: `${comunidad.count} playas caninas en ${comunidad.nombre}: mapa interactivo, municipios con playas pet-friendly y normativa.`,
    alternates: { canonical: `/playas-perros/comunidad/${slug}` },
  }
}

export default async function ComunidadPerrosPage({ params }: Props) {
  const { slug } = await params
  const [playas, stats] = await Promise.all([getPlayasPerros(), getPerrosStats()])
  const comunidad = stats.comunidades.find(c => c.slug === slug)
  if (!comunidad) notFound()

  const playasFiltradas = playas.filter(p => {
    const cs = p.comunidad
      ?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? ''
    return cs === slug
  })

  // Provincias dentro de esta comunidad
  const provinciasDeEsta = stats.provincias.filter(p => p.comunidadSlug === slug)

  // Municipios dentro (agrupados por provincia)
  const municipiosDeEsta = stats.municipios.filter(m =>
    provinciasDeEsta.some(p => p.slug === m.provinciaSlug)
  )

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Playas para perros en ${comunidad.nombre}`,
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
            <span aria-current="page">{comunidad.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas para perros en {comunidad.nombre}</h1>
          <p className={styles.subtitulo}>
            {comunidad.count} {comunidad.count === 1 ? 'playa canina' : 'playas caninas'}
            {provinciasDeEsta.length > 0 && ` en ${provinciasDeEsta.length} ${provinciasDeEsta.length === 1 ? 'provincia' : 'provincias'}`}
          </p>
          <p className={styles.desc}>
            Listado de playas donde se permite la entrada de perros en {comunidad.nombre}. Incluye mapa,
            servicios por playa y enlace al reglamento municipal cuando está disponible.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.info} role="note">
          <Info size={22} weight="bold" className={styles.infoIcon} aria-hidden="true" />
          <p className={styles.infoText}>
            Consulta siempre la ordenanza del ayuntamiento antes de desplazarte. La temporada y las condiciones
            (correa, horarios, bozal) varían entre municipios de {comunidad.nombre}.
          </p>
        </div>

        {playasFiltradas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa de playas caninas en {comunidad.nombre}</span>
              <span className={styles.mapaSrc}>{playasFiltradas.length} playas</span>
            </div>
            <MapaPlayas playas={playasFiltradas} height="400px" comunidad={comunidad.nombre} />
          </div>
        )}

        {/* Provincias dentro */}
        {provinciasDeEsta.length > 0 && (
          <section aria-labelledby="provincias-title">
            <h2 id="provincias-title" className={styles.sectionTitle}>Por provincia</h2>
            <div className={styles.linksNav}>
              {provinciasDeEsta.map(p => (
                <Link
                  key={p.slug}
                  href={`/playas-perros/provincia/${p.slug}`}
                  className={styles.linkCard}
                >
                  <span className={styles.linkCardNombre}>{p.nombre}</span>
                  <span className={styles.linkCardCount}>{p.count}</span>
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
                    {p.municipio} · {p.provincia}
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

        {/* Municipios dentro */}
        {municipiosDeEsta.length > 0 && (
          <section aria-labelledby="municipios-title" style={{ marginTop: '2.5rem' }}>
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
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
    </>
  )
}
