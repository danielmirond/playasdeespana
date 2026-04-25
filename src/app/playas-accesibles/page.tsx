// src/app/playas-accesibles/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasAccesibles, getAccesiblesStats } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { Info } from '@phosphor-icons/react/dist/ssr'
import styles from './PlayasAccesibles.module.css'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas accesibles en España 2026 | Listado PMR completo',
  description: 'Listado de playas accesibles para personas con movilidad reducida (PMR) en España. Rampas, pasarelas, sillas anfibias y aseos adaptados por comunidad, provincia y municipio.',
  alternates: { canonical: '/playas-accesibles' },
  openGraph: {
    title: 'Playas accesibles en España 2026',
    description: 'Listado completo de playas accesibles en España, ordenadas por comunidad y provincia.',
    url: 'https://playas-espana.com/playas-accesibles',
    type: 'website',
  },
}

const FAQ = [
  {
    q: '¿Qué es una playa accesible?',
    a: 'Una playa accesible es aquella que dispone de infraestructuras adaptadas para personas con movilidad reducida (PMR): rampas de acceso, pasarelas sobre la arena, sillas anfibias, aseos adaptados y señalización adecuada. Muchas también cuentan con servicio de apoyo al baño.',
  },
  {
    q: '¿Cómo sé si una playa tiene silla anfibia?',
    a: 'Las sillas anfibias suelen estar disponibles en playas con servicio de socorrismo en temporada alta. Consulta la ficha de cada playa en este sitio para ver si tiene el servicio de accesibilidad y socorrismo. También puedes llamar al ayuntamiento del municipio.',
  },
  {
    q: '¿Todas las playas accesibles tienen pasarelas?',
    a: 'No necesariamente. El nivel de accesibilidad varía: algunas playas solo tienen rampa de acceso al arenal, otras añaden pasarelas sobre la arena hasta la orilla, y las mejor equipadas ofrecen además sillas anfibias, vestuarios adaptados y personal de apoyo.',
  },
  {
    q: '¿Puedo ir con silla de ruedas a cualquier playa?',
    a: 'Técnicamente puedes acceder a cualquier playa pública, pero sin pasarelas la arena suelta hace imposible el desplazamiento con silla convencional. Las playas marcadas como accesibles (PMR) en este listado tienen al menos rampa y pasarela certificadas.',
  },
  {
    q: '¿En qué época del año están operativos los servicios de accesibilidad?',
    a: 'La mayoría de los servicios de accesibilidad (sillas anfibias, personal de apoyo) funcionan solo en temporada alta (junio-septiembre). Las infraestructuras fijas (rampas, pasarelas, aseos adaptados) suelen estar disponibles todo el año, aunque conviene confirmar con el ayuntamiento.',
  },
]

export default async function PlayasAccesiblesPage() {
  const [playas, stats] = await Promise.all([
    getPlayasAccesibles(),
    getAccesiblesStats(),
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
    name: 'Playas accesibles en España',
    description: `Listado de ${stats.total} playas accesibles en España.`,
    numberOfItems: stats.total,
    itemListElement: stats.comunidades.slice(0, 15).map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Playas accesibles en ${g.nombre}`,
      url: `https://playas-espana.com/playas-accesibles/comunidad/${g.slug}`,
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
            <span aria-current="page">Playas accesibles</span>
          </nav>
          <h1 className={styles.titulo}>Playas <em>accesibles</em> en España</h1>
          <p className={styles.subtitulo}>
            {stats.total} playas en {stats.comunidades.length} comunidades y {stats.provincias.length} provincias
          </p>
          <p className={styles.desc}>
            Listado completo de playas de movilidad reducida (PMR) en España. Incluye playas oficiales señalizadas y
            zonas de tradición accesible, con mapa interactivo, servicios disponibles y accesos.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Playas accesibles</div>
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
            El accesibilidad es legal en España. Este listado incluye tanto playas señalizadas oficialmente como zonas
            de tradición accesible. Respeta siempre a los demás bañistas y consulta la ordenanza municipal si tienes dudas.
          </p>
        </div>

        {playas.length > 0 && (
          <div className={styles.mapaCard}>
            <div className={styles.mapaHead}>
              <span className={styles.mapaTitle}>Mapa de playas accesibles</span>
              <span className={styles.mapaSrc}>{playas.length} playas</span>
            </div>
            <MapaPlayas playas={playas} height="440px" />
          </div>
        )}

        <section aria-labelledby="comunidades-title">
          <h2 id="comunidades-title" className={styles.sectionTitle}>Por comunidad autónoma</h2>
          <div className={styles.linksNav}>
            {stats.comunidades.map(c => (
              <Link key={c.slug} href={`/playas-accesibles/comunidad/${c.slug}`} className={styles.linkCard}>
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
              <Link key={p.slug} href={`/playas-accesibles/provincia/${p.slug}`} className={styles.linkCard}>
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
                <Link key={m.slug} href={`/playas-accesibles/municipio/${m.slug}`} className={styles.linkCard}>
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
