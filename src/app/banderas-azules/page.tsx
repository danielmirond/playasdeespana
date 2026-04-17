// src/app/banderas-azules/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getComunidades } from '@/lib/playas'
import styles from './BanderasAzules.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'
import SchemaItemList from '@/components/seo/SchemaItemList'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas con Bandera Azul en España 2026 — Listado oficial',
  description: 'Listado completo y oficial de playas con Bandera Azul en España. Ordenadas por comunidad autónoma, con calidad del agua, servicios, accesibilidad y mapa interactivo.',
  alternates: {
    canonical: '/banderas-azules',
    languages: { 'es': '/banderas-azules', 'en': '/en/blue-flag' },
  },
  openGraph: {
    title: 'Playas con Bandera Azul en España 2026',
    description: 'Listado completo de las playas galardonadas con Bandera Azul, ordenadas por comunidad autónoma.',
    url: 'https://playas-espana.com/banderas-azules',
    type: 'website',
  },
}

const FAQ = [
  {
    q: '¿Qué es la Bandera Azul?',
    a: 'La Bandera Azul es un galardón internacional gestionado por la Foundation for Environmental Education (FEE) que se otorga anualmente a playas, puertos deportivos y embarcaciones ecológicas que cumplen una serie de criterios estrictos de calidad del agua, gestión medioambiental, seguridad, accesibilidad y servicios.',
  },
  {
    q: '¿Qué requisitos debe cumplir una playa para obtener la Bandera Azul?',
    a: 'Calidad de agua de baño excelente durante varias temporadas, educación e información ambiental, gestión ambiental de la playa (papeleras, limpieza, aseos, accesibilidad), servicios de salvamento y socorrismo, plan de emergencias y respeto a la normativa vigente. En España la Asociación de Educación Ambiental y del Consumidor (ADEAC) es la responsable de conceder el galardón.',
  },
  {
    q: '¿Cuántas playas tienen Bandera Azul en España?',
    a: 'España es el país con más playas galardonadas del mundo. El listado cambia cada temporada. En esta página verás siempre el dato actualizado del último reconocimiento disponible.',
  },
  {
    q: '¿Una playa con Bandera Azul tiene siempre buena calidad del agua?',
    a: 'El galardón garantiza que la calidad del agua ha sido excelente durante las últimas temporadas, pero no sustituye el seguimiento en tiempo real. Durante la temporada pueden producirse episodios puntuales (vertidos, temporales, medusas). Comprueba siempre el estado actual del mar en la ficha de cada playa antes de ir.',
  },
  {
    q: '¿Pierde una playa la Bandera Azul si hay problemas durante el verano?',
    a: 'Sí. La certificación puede retirarse temporalmente si la calidad del agua se deteriora, si hay vertidos, si se produce un incidente grave de seguridad o si se incumplen los criterios. ADEAC arría la bandera mientras dura el incumplimiento y la iza de nuevo cuando la situación se normaliza.',
  },
]

const CRITERIOS = [
  { icono: '01', titulo: 'Calidad del agua', texto: 'Análisis periódicos durante varias temporadas con resultados excelentes.' },
  { icono: '02', titulo: 'Información ambiental', texto: 'Señalización de ecosistemas, actividades educativas y códigos de conducta.' },
  { icono: '03', titulo: 'Gestión ambiental', texto: 'Gestión de residuos, papeleras separadas, limpieza regular, aseos accesibles.' },
  { icono: '04', titulo: 'Seguridad y servicios', texto: 'Salvavidas, primeros auxilios, plan de emergencias, accesos PMR y duchas.' },
]

export default async function BanderasAzulesPage() {
  const [playas, comunidades] = await Promise.all([getPlayas(), getComunidades()])
  const azules = playas.filter(p => p.bandera)

  // Agrupar por comunidad
  const porComunidad = new Map<string, typeof azules>()
  for (const p of azules) {
    const list = porComunidad.get(p.comunidad) ?? []
    list.push(p)
    porComunidad.set(p.comunidad, list)
  }
  const grupos = Array.from(porComunidad.entries())
    .map(([comunidad, playas]) => ({ comunidad, playas, count: playas.length }))
    .sort((a, b) => b.count - a.count)

  // Stats extra para el bloque de cifras
  const totalProvincias = new Set(azules.map(p => p.provincia)).size
  const totalMunicipios = new Set(azules.map(p => `${p.provincia}|${p.municipio}`)).size
  const conSocorrismo   = azules.filter(p => p.socorrismo).length
  const accesibles      = azules.filter(p => p.accesible).length

  // JSON-LD: FAQPage + ItemList con las 10 comunidades top
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
    name: 'Playas con Bandera Azul en España',
    description: `Listado de ${azules.length} playas galardonadas con Bandera Azul en España.`,
    numberOfItems: azules.length,
    itemListElement: grupos.slice(0, 20).map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.comunidad,
      url: `https://playas-espana.com/comunidad/${comunidades.find(c => c.nombre === g.comunidad)?.slug ?? ''}`,
    })),
  }

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

  return (
    <>
      <SchemaItemList
        name="Playas con Bandera Azul en España"
        description={`${azules.length} playas con Bandera Azul en España, distribuidas por comunidad autónoma. Distintivo de calidad ambiental y de servicios.`}
        url={`${BASE}/banderas-azules`}
        beaches={azules.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Banderas Azules</span>
          </nav>
          <h1 className={styles.titulo}>Playas con Bandera Azul en España</h1>
          <p className={styles.subtitulo}>
            {azules.length} playas certificadas en {grupos.length} comunidades autónomas
          </p>
          <p className={styles.desc}>
            La Bandera Azul es el galardón internacional que reconoce a las playas con mejor calidad del agua,
            gestión ambiental, seguridad y servicios al visitante. España es el país con más playas premiadas del mundo.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        {/* Bloque de cifras */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{azules.length}</div>
            <div className={styles.statLabel}>Playas galardonadas</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{grupos.length}</div>
            <div className={styles.statLabel}>Comunidades</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalProvincias}</div>
            <div className={styles.statLabel}>Provincias</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalMunicipios}</div>
            <div className={styles.statLabel}>Municipios</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{conSocorrismo}</div>
            <div className={styles.statLabel}>Con socorrismo</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{accesibles}</div>
            <div className={styles.statLabel}>Accesibles PMR</div>
          </div>
        </div>

        {/* Mapa */}
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>Mapa de playas Bandera Azul</span>
            <span className={styles.mapaSrc}>{azules.length} playas</span>
          </div>
          <MapaPlayas playas={azules} height="400px" />
        </div>

        {/* Criterios */}
        <section className={styles.criterios}>
          <h2 className={styles.criteriosTitulo}>¿Qué significa tener Bandera Azul?</h2>
          <p className={styles.criteriosIntro}>
            El galardón certifica que la playa ha cumplido un conjunto de requisitos medidos durante varias temporadas
            por la Asociación de Educación Ambiental y del Consumidor (ADEAC), entidad española de la Foundation for
            Environmental Education (FEE).
          </p>
          <div className={styles.criteriosGrid}>
            {CRITERIOS.map(c => (
              <div key={c.titulo} className={styles.criterio}>
                <div className={styles.criterioNum}>{c.icono}</div>
                <div>
                  <h3 className={styles.criterioTitulo}>{c.titulo}</h3>
                  <p className={styles.criterioTexto}>{c.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Listado por comunidad */}
        <section>
          <h2 className={styles.listadoTitulo}>Listado por comunidad autónoma</h2>
          {grupos.map(g => (
            <div key={g.comunidad} className={styles.grupo}>
              <div className={styles.grupoHead}>
                <h3 className={styles.grupoTitulo}>{g.comunidad}</h3>
                <span className={styles.grupoCount}>{g.count} playas</span>
              </div>
              <div className={styles.lista}>
                {g.playas.map(p => (
                  <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
                    <div className={styles.rowInfo}>
                      <div className={styles.rowNombre}>{p.nombre}</div>
                      <div className={styles.rowMeta}>
                        {p.municipio} · {p.provincia}
                        {p.socorrismo && <span className={styles.badge}>Socorrismo</span>}
                        {p.accesible  && <span className={styles.badge}>PMR</span>}
                        {p.duchas     && <span className={styles.badge}>Duchas</span>}
                        {p.parking    && <span className={styles.badge}>Parking</span>}
                      </div>
                    </div>
                    <span className={styles.rowArrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className={styles.faq}>
          <h2 className={styles.faqTitulo}>Preguntas frecuentes</h2>
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
