// src/app/playas-perros/page.tsx. Índice principal de playas para perros
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasPerros, getPerrosStats } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { Dog, Info } from '@phosphor-icons/react/dist/ssr'
import styles from './PlayasPerros.module.css'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas para perros en España 2026 | Listado por comunidad',
  description: 'Playas donde se permite la entrada de perros en España. Listado oficial por comunidad autónoma, provincia y municipio. Consejos, normativa y mapa interactivo.',
  alternates: {
    canonical: '/playas-perros',
  },
  openGraph: {
    title: 'Playas para perros en España 2026',
    description: 'Listado completo de playas caninas (pet-friendly) en España, ordenadas por comunidad y provincia.',
    url: 'https://playas-espana.com/playas-perros',
    type: 'website',
  },
}

const FAQ = [
  {
    q: '¿Qué es una playa para perros?',
    a: 'Es una playa donde los ayuntamientos o autoridades competentes permiten el acceso de perros durante la temporada de baño (habitualmente junio-septiembre), ya sea de forma libre o en áreas delimitadas. Algunas son playas caninas "oficiales" y otras son zonas habilitadas dentro de playas mixtas.',
  },
  {
    q: '¿Puedo llevar a mi perro a cualquier playa en invierno?',
    a: 'En la mayoría de los municipios costeros españoles está permitido llevar perros a la playa fuera de la temporada de baño (normalmente del 1 de octubre al 31 de mayo). Aun así, conviene consultar la ordenanza municipal concreta porque algunos ayuntamientos prohíben el acceso todo el año y otros lo restringen por zonas.',
  },
  {
    q: '¿Qué documentación debo llevar?',
    a: 'Cartilla sanitaria actualizada del animal (vacunación antirrábica), seguro de responsabilidad civil para razas potencialmente peligrosas (PPP), correa y bozal obligatorio en las razas catalogadas. Muchos ayuntamientos exigen además identificación por microchip visible en la chapa.',
  },
  {
    q: '¿Puedo soltar al perro en una playa canina?',
    a: 'Depende del reglamento local. Algunas playas caninas permiten que el perro esté sin correa durante parte del día; otras exigen correa en todo momento. Respetar los horarios, llevar bolsas para los excrementos y evitar molestar a otros bañistas son obligaciones universales.',
  },
  {
    q: '¿Dónde puedo encontrar el reglamento oficial de cada playa?',
    a: 'El reglamento lo publica el ayuntamiento del municipio correspondiente. En cada ficha de playa de este sitio enlazamos a la web municipal y a la ficha MITECO, donde suele estar disponible la ordenanza actualizada. Ante cualquier duda, llama al ayuntamiento antes de desplazarte.',
  },
]

export default async function PlayasPerrosPage() {
  const [playas, stats] = await Promise.all([
    getPlayasPerros(),
    getPerrosStats(),
  ])

  // JSON-LD: FAQPage + ItemList
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Playas para perros en España',
    description: `Listado de ${stats.total} playas caninas identificadas en España.`,
    numberOfItems: stats.total,
    itemListElement: stats.comunidades.slice(0, 15).map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Playas para perros en ${g.nombre}`,
      url: `https://playas-espana.com/playas-perros/comunidad/${g.slug}`,
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
            <span aria-current="page">Playas para perros</span>
          </nav>
          <h1 className={styles.titulo}>Playas <em>para perros</em> en España</h1>
          <p className={styles.subtitulo}>
            {stats.total} playas identificadas en {stats.comunidades.length} comunidades y {stats.provincias.length} provincias
          </p>
          <p className={styles.desc}>
            Playas caninas donde se permite la entrada de perros, ya sea durante la temporada de baño o fuera
            de ella. Listado por comunidad autónoma, provincia y municipio con mapa interactivo, reglamento
            y servicios disponibles en cada playa.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Playas caninas</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.comunidades.length}</div>
            <div className={styles.statLabel}>Comunidades</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.provincias.length}</div>
            <div className={styles.statLabel}>Provincias</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.municipios.length}</div>
            <div className={styles.statLabel}>Municipios</div>
          </div>
        </div>

        {/* Callout normativa */}
        <div className={styles.info} role="note">
          <Info size={22} weight="bold" className={styles.infoIcon} aria-hidden="true" />
          <p className={styles.infoText}>
            <strong>Importante:</strong> la normativa de perros en playas depende del ayuntamiento. Este listado
            recoge playas donde se ha documentado el permiso, pero consulta siempre la ordenanza municipal antes
            de desplazarte. Llevar cartilla sanitaria, correa, bolsa para excrementos y, en razas PPP, bozal y seguro.
          </p>
        </div>

        {/* Mapa */}
        {playas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa de playas para perros</span>
              <span className={styles.mapaSrc}>{playas.length} playas</span>
            </div>
            <MapaPlayas playas={playas} height="440px" />
          </div>
        )}

        {/* Comunidades */}
        <section aria-labelledby="comunidades-title">
          <h2 id="comunidades-title" className={styles.sectionTitle}>Por comunidad autónoma</h2>
          <div className={styles.linksNav}>
            {stats.comunidades.map(c => (
              <Link
                key={c.slug}
                href={`/playas-perros/comunidad/${c.slug}`}
                className={styles.linkCard}
              >
                <span className={styles.linkCardNombre}>{c.nombre}</span>
                <span className={styles.linkCardCount}>{c.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Provincias */}
        <section aria-labelledby="provincias-title" style={{ marginTop: '2.5rem' }}>
          <h2 id="provincias-title" className={styles.sectionTitle}>Por provincia</h2>
          <div className={styles.linksNav}>
            {stats.provincias.map(p => (
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

        {/* Municipios (si hay alguno con >=1) */}
        {stats.municipios.length > 0 && (
          <section aria-labelledby="municipios-title" style={{ marginTop: '2.5rem' }}>
            <h2 id="municipios-title" className={styles.sectionTitle}>Por municipio</h2>
            <div className={styles.linksNav}>
              {stats.municipios.map(m => (
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

        {/* FAQ */}
        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.faqTitulo}>Preguntas frecuentes</h2>
          {FAQ.map(item => (
            <details key={item.q} className={styles.faqItem}>
              <summary className={styles.faqQ}>{item.q}</summary>
              <p className={styles.faqA}>{item.a}</p>
            </details>
          ))}
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
    </>
  )
}
