// src/app/playas-nudistas/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasNudistas, getNudistasStats } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { Info } from '@phosphor-icons/react/dist/ssr'
import styles from './PlayasNudistas.module.css'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas nudistas en España 2026 — Listado completo por provincia',
  description: 'Listado completo de playas nudistas y de naturismo en España. Ordenadas por comunidad, provincia y municipio con mapa interactivo y servicios.',
  alternates: { canonical: '/playas-nudistas' },
  openGraph: {
    title: 'Playas nudistas en España 2026',
    description: 'Listado completo de playas nudistas en España, ordenadas por comunidad y provincia.',
    url: 'https://playas-espana.com/playas-nudistas',
    type: 'website',
  },
}

const FAQ = [
  {
    q: '¿Es legal el nudismo en playas de España?',
    a: 'El nudismo no está prohibido de forma general por la legislación española. El Tribunal Constitucional ha amparado la libertad de desnudez en espacios públicos siempre que no haya exhibicionismo provocador. No obstante, cada ayuntamiento puede regular el uso de playas mediante ordenanzas locales, por lo que conviene consultar la normativa del municipio.',
  },
  {
    q: '¿Qué diferencia hay entre una playa nudista oficial y una de uso nudista?',
    a: 'Una playa nudista oficial está señalizada por el ayuntamiento y permite explícitamente la práctica del nudismo. Una playa de "uso nudista" o "tradición nudista" es una zona donde la costumbre local ha establecido la práctica, aunque no cuente con señalización oficial. En ambas es habitual el respeto mutuo entre bañistas con y sin ropa.',
  },
  {
    q: '¿Puedo ir vestido a una playa nudista?',
    a: 'Sí. La mayoría de playas nudistas en España son de "uso mixto", donde conviven bañistas con y sin ropa. No hay obligación de desnudarse. Lo importante es respetar la privacidad de los demás y no hacer fotos o vídeos sin permiso.',
  },
  {
    q: '¿Las playas nudistas tienen servicios?',
    a: 'Depende de la playa. Algunas cuentan con socorrismo, duchas, aseos y chiringuito, especialmente las urbanas. Las calas y playas más aisladas suelen tener menos servicios. En la ficha de cada playa de este sitio encontrarás los servicios disponibles.',
  },
  {
    q: '¿Son seguras las playas nudistas?',
    a: 'Tan seguras como cualquier otra playa. Las playas con socorrismo y bandera están supervisadas independientemente de si son nudistas o no. Las playas aisladas (calas, acantilados) pueden tener accesos difíciles — comprueba las condiciones de acceso en la ficha de cada playa.',
  },
]

export default async function PlayasNudistasPage() {
  const [playas, stats] = await Promise.all([
    getPlayasNudistas(),
    getNudistasStats(),
  ])

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
    name: 'Playas nudistas en España',
    description: `Listado de ${stats.total} playas nudistas en España.`,
    numberOfItems: stats.total,
    itemListElement: stats.comunidades.slice(0, 15).map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Playas nudistas en ${g.nombre}`,
      url: `https://playas-espana.com/playas-nudistas/comunidad/${g.slug}`,
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
            <span aria-current="page">Playas nudistas</span>
          </nav>
          <h1 className={styles.titulo}>Playas nudistas en España</h1>
          <p className={styles.subtitulo}>
            {stats.total} playas en {stats.comunidades.length} comunidades y {stats.provincias.length} provincias
          </p>
          <p className={styles.desc}>
            Listado completo de playas de naturismo y nudismo en España. Incluye playas oficiales señalizadas y
            zonas de tradición nudista, con mapa interactivo, servicios disponibles y accesos.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Playas nudistas</div>
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

        <div className={styles.info} role="note">
          <Info size={22} weight="bold" className={styles.infoIcon} aria-hidden="true" />
          <p className={styles.infoText}>
            El nudismo es legal en España. Este listado incluye tanto playas señalizadas oficialmente como zonas
            de tradición nudista. Respeta siempre a los demás bañistas y consulta la ordenanza municipal si tienes dudas.
          </p>
        </div>

        {playas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa de playas nudistas</span>
              <span className={styles.mapaSrc}>{playas.length} playas</span>
            </div>
            <MapaPlayas playas={playas} height="440px" />
          </div>
        )}

        <section aria-labelledby="comunidades-title">
          <h2 id="comunidades-title" className={styles.sectionTitle}>Por comunidad autónoma</h2>
          <div className={styles.linksNav}>
            {stats.comunidades.map(c => (
              <Link key={c.slug} href={`/playas-nudistas/comunidad/${c.slug}`} className={styles.linkCard}>
                <span className={styles.linkCardNombre}>{c.nombre}</span>
                <span className={styles.linkCardCount}>{c.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="provincias-title" style={{ marginTop: '2.5rem' }}>
          <h2 id="provincias-title" className={styles.sectionTitle}>Por provincia</h2>
          <div className={styles.linksNav}>
            {stats.provincias.map(p => (
              <Link key={p.slug} href={`/playas-nudistas/provincia/${p.slug}`} className={styles.linkCard}>
                <span className={styles.linkCardNombre}>{p.nombre}</span>
                <span className={styles.linkCardCount}>{p.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {stats.municipios.length > 0 && (
          <section aria-labelledby="municipios-title" style={{ marginTop: '2.5rem' }}>
            <h2 id="municipios-title" className={styles.sectionTitle}>Por municipio</h2>
            <div className={styles.linksNav}>
              {stats.municipios.filter(m => m.count >= 2).map(m => (
                <Link key={m.slug} href={`/playas-nudistas/municipio/${m.slug}`} className={styles.linkCard}>
                  <span className={styles.linkCardNombre}>{m.nombre}</span>
                  <span className={styles.linkCardCount}>{m.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
    </>
  )
}
