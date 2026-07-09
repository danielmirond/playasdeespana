// src/app/playas-perros/page.tsx. Índice principal de playas para perros
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasPerros, getPerrosStats } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
import TopBeachCardsConHero from '@/components/seo/TopBeachCardsConHero'
import IconInfo from '@/components/ui/IconInfo'
import styles from './PlayasPerros.module.css'
import EnlacesRelacionados from '@/components/seo/EnlacesRelacionados'
import UpdatedBadge from '@/components/seo/UpdatedBadge'
import { getEditorialModified } from '@/lib/dateModified'

export const revalidate = 86400

const MODIFIED = getEditorialModified('src/app/playas-perros/page.tsx', ['public/data/playas.json'])
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
    images: [{ url: '/api/og?playa=Playas%20para%20perros%20en%20Espa%C3%B1a', width: 1200, height: 630 }],
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
  {
    q: '¿Cuáles son las mejores playas para perros de España?',
    a: 'Depende de lo que busques. Para arena y espacio, la playa canina de Pinedo (Valencia) y la del Ahorcados en Torrevieja son de las más grandes; en el norte, El Espartal en Asturias y varias del litoral gallego funcionan muy bien fuera de temporada. En este listado puedes filtrar por comunidad y provincia para ver las documentadas cerca de ti, con sus servicios y su estado del mar del día.',
  },
  {
    q: '¿Hay playas donde llevar al perro todo el año?',
    a: 'Sí. Las playas caninas "oficiales" suelen permitir el acceso durante todo el año, no solo en verano. Fuera de ellas, la mayoría de municipios permiten perros en cualquier playa entre octubre y mayo (fuera de la temporada de baño). En pleno verano, sin embargo, el acceso a las playas no caninas suele estar prohibido de día.',
  },
  {
    q: '¿Multan por llevar el perro a una playa no permitida?',
    a: 'Sí. Acceder con el perro a una playa donde no está permitido durante la temporada de baño puede acarrear multa, y su cuantía varía mucho según la ordenanza municipal (desde unas decenas hasta varios cientos de euros). No recoger los excrementos o llevar suelta una raza que exige correa también se sanciona. Por eso conviene confirmar la ordenanza antes de ir.',
  },
  {
    q: '¿Qué debo llevar para un día de playa con perro?',
    a: 'Agua dulce abundante y un bebedero (el agua salada deshidrata y sienta mal), sombra portátil, bolsas para excrementos, correa (y bozal si es raza PPP), una toalla y, si hace mucho calor, ir a primera o última hora para evitar la arena ardiendo y las horas de más gente. Enjuaga al perro con agua dulce al salir para retirar la sal.',
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
          <IconInfo size={22} className={styles.infoIcon} />
          <p className={styles.infoText}>
            <strong>Importante:</strong> la normativa de perros en playas depende del ayuntamiento. Este listado
            recoge playas donde se ha documentado el permiso, pero consulta siempre la ordenanza municipal antes
            de desplazarte. Llevar cartilla sanitaria, correa, bolsa para excrementos y, en razas PPP, bozal y seguro.
          </p>
        </div>

        {/* Top 10 con foto hero */}
        {playas.length > 0 && (
          <section aria-labelledby="top-perros" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <h2 id="top-perros" className={styles.sectionTitle}>
              Las 10 más recomendadas
            </h2>
            <TopBeachCardsConHero
              playas={playas.slice(0, 10).map(p => ({
                slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia,
                comunidad: p.comunidad, lat: p.lat, lng: p.lng, bandera: p.bandera,
              }))}
              limit={10}
              eyebrow={`Top 10 · ${playas.length} playas que admiten perros`}
            />
          </section>
        )}

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

        {/* Guía editorial (profundidad de tema) */}
        <section aria-labelledby="guia-title" style={{ marginTop: '2.5rem', maxWidth: 720 }}>
          <h2 id="guia-title" className={styles.sectionTitle}>Cómo funcionan las playas para perros en España</h2>
          <div style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 1rem' }}>
              No existe una norma estatal única: cada ayuntamiento decide si permite perros en su litoral y en qué
              condiciones. Por eso conviven dos realidades. Están las <strong>playas caninas oficiales</strong>, zonas
              habilitadas expresamente para que el perro entre y se bañe durante todo el año, normalmente con papeleras
              de excrementos, ducha y a veces bebederos. Y está el <strong>resto de playas</strong>, donde lo habitual
              es que el perro solo pueda entrar fuera de la temporada de baño —de forma orientativa, entre octubre y
              mayo—, mientras que en pleno verano el acceso queda prohibido de día.
            </p>
            <p style={{ margin: '0 0 1rem' }}>
              La densidad de playas caninas cambia mucho según la zona. El litoral mediterráneo —
              {' '}<Link href="/playas-perros/comunidad/comunitat-valenciana" style={{ color: 'var(--accent)' }}>Comunitat Valenciana</Link>,
              {' '}<Link href="/playas-perros/comunidad/cataluna" style={{ color: 'var(--accent)' }}>Cataluña</Link> y
              {' '}<Link href="/playas-perros/comunidad/andalucia" style={{ color: 'var(--accent)' }}>Andalucía</Link>— concentra
              buena parte de las zonas habilitadas oficiales, muchas de ellas de arena y bien señalizadas. En la
              cornisa cantábrica y en Galicia el acceso suele ser más estacional que oficial: playas amplias y poco
              masificadas donde el perro es bienvenido casi todo el año salvo en los meses de más afluencia. Usa el
              listado por comunidad y provincia de abajo para ver las playas documentadas cerca de ti, con sus
              servicios y el estado del mar del día.
            </p>
            <p style={{ margin: 0 }}>
              Antes de ir, dos comprobaciones ahorran disgustos: confirmar en la ordenanza municipal que el acceso
              sigue vigente —cambian de un año a otro— y preparar lo básico para el perro. Agua dulce y bebedero
              (el agua salada deshidrata), sombra, bolsas para los excrementos, correa y, en razas consideradas
              potencialmente peligrosas, bozal y seguro. A la vuelta, un enjuague con agua dulce le quita la sal del
              pelo y las almohadillas. Puedes cruzar esta lista con la de <Link href="/banderas-hoy" style={{ color: 'var(--accent)' }}>banderas
              de hoy</Link> y la <Link href="/temperatura-del-agua" style={{ color: 'var(--accent)' }}>temperatura del agua</Link> para
              elegir el mejor día.
            </p>
          </div>
        </section>

        {/* Comunidades */}
        <section aria-labelledby="comunidades-title" style={{ marginTop: '2.5rem' }}>
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

        <UpdatedBadge iso={MODIFIED} url="https://playas-espana.com/playas-perros" name="Playas para perros en España" visible={false} />
        <EnlacesRelacionados topic="perros" />
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
