// src/app/playas/[slug]/que-llevar/page.tsx
// Página dedicada SEO long-tail: "qué llevar a [playa]".
// ISR diario. Contenido editorial generado por reglas + productos
// contextualizados.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlayaBySlug, toSlug } from '@/lib/playas'
import { getMareas } from '@/lib/marine'
import { getMeteoPlaya } from '@/lib/meteo'
import { ESTADOS, calcularEstado } from '@/lib/estados'
import { nombreConPlaya } from '@/lib/geo'
import { getProductosParaPlaya, AMAZON_TAG } from '@/lib/amazon-productos'
import { generarTextoQueLlevar, productosConRazon } from '@/lib/textoQueLlevar'
import { generarFaqsPlaya } from '@/lib/faqsPlaya'
import { calcularBandera, estimarMedusas } from '@/lib/seguridad'
import { estimarMareas } from '@/lib/mareas-lunar'
import Nav from '@/components/ui/Nav'
import styles from './que-llevar.module.css'

export const revalidate = 86400 // 24h
export const maxDuration = 25

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) return {}
  const np = nombreConPlaya(playa.nombre)
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const title = `Qué llevar a ${np} | Imprescindibles para tu día de playa`
  const description = `Lista de imprescindibles para ${np}: protección solar, sombra, calzado, snorkel y más. Selección contextual según composición y condiciones reales.`
  return {
    title,
    description,
    alternates: { canonical: `/playas/${slug}/que-llevar` },
    openGraph: {
      title, description, url: `${BASE}/playas/${slug}/que-llevar`,
      siteName: 'Playas de España', locale: 'es_ES', type: 'article',
    },
    twitter: { card: 'summary', title, description },
  }
}

export default async function QueLlevarPage({ params }: Props) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  // Estado actual para que el texto refleje las condiciones del día.
  // Si falla el fetch, usamos un estado neutral (BUENA).
  const [marRes, meteoRes] = await Promise.allSettled([
    getMareas(playa.lat, playa.lng),
    getMeteoPlaya(playa.lat, playa.lng),
  ])
  const olas    = marRes.status === 'fulfilled' && marRes.value ? (marRes.value.oleaje_m?.[0] ?? 0) : 0
  const tempAgua = marRes.status === 'fulfilled' && marRes.value ? (marRes.value.temp_agua?.[0] ?? null) : null
  const viento  = meteoRes.status === 'fulfilled' && meteoRes.value ? (meteoRes.value.viento_kmh ?? 0) : 0
  const vientoRacha = meteoRes.status === 'fulfilled' && meteoRes.value ? (meteoRes.value.viento_racha ?? 0) : 0
  const vientoDir   = meteoRes.status === 'fulfilled' && meteoRes.value ? (meteoRes.value.viento_dir ?? 'N') : 'N'
  const estadoKey = calcularEstado({ olas, viento })
  const estado = ESTADOS[estadoKey]

  const productosBase = getProductosParaPlaya(playa, estadoKey)
  const productos = productosConRazon([...productosBase], playa)
  const texto = generarTextoQueLlevar(playa, estadoKey)
  const np = nombreConPlaya(playa.nombre)

  const banderaPlaya = calcularBandera(olas, viento, vientoRacha)
  const medusas = estimarMedusas(playa.lat, playa.lng, tempAgua, viento, vientoDir)
  const mareasLunar = estimarMareas(playa.lat, playa.lng)
  const faqs = generarFaqsPlaya({
    playa, aguaC: tempAgua ?? 18, olasM: olas, vientoKmh: viento,
    vientoRacha, vientoDir,
    banderaPlaya, medusas, mareasLunar, locale: 'es',
  }).slice(0, 5)

  const municipioSlug = toSlug(playa.municipio)
  const provinciaSlug = playa.provincia ? toSlug(playa.provincia) : null
  const comunidadSlug = playa.comunidad
    ? playa.comunidad.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : null

  // JSON-LD: Article + BreadcrumbList
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `Qué llevar a ${np}`,
        description: `Lista contextual de imprescindibles para ${np}.`,
        about: { '@type': 'Beach', name: np },
        author: { '@type': 'Organization', name: 'Playas de España' },
        publisher: { '@type': 'Organization', name: 'Playas de España' },
        url: `${BASE}/playas/${slug}/que-llevar`,
        datePublished: '2026-04-28T00:00:00Z',
        dateModified: new Date().toISOString(),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio',          item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: playa.comunidad,   item: `${BASE}/comunidad/${comunidadSlug}` },
          { '@type': 'ListItem', position: 3, name: playa.provincia,   item: provinciaSlug ? `${BASE}/provincia/${provinciaSlug}` : `${BASE}/` },
          { '@type': 'ListItem', position: 4, name: playa.municipio,   item: `${BASE}/municipio/${municipioSlug}` },
          { '@type': 'ListItem', position: 5, name: playa.nombre,      item: `${BASE}/playas/${slug}` },
          { '@type': 'ListItem', position: 6, name: 'Qué llevar',      item: `${BASE}/playas/${slug}/que-llevar` },
        ],
      },
      ...(faqs.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Nav />
      <main className={styles.main}>
        <nav className={styles.bc} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/comunidad/${comunidadSlug}`}>{playa.comunidad}</Link>
          <span aria-hidden="true">›</span>
          {provinciaSlug
            ? <Link href={`/provincia/${provinciaSlug}`}>{playa.provincia}</Link>
            : <span>{playa.provincia}</span>}
          <span aria-hidden="true">›</span>
          <Link href={`/municipio/${municipioSlug}`}>{playa.municipio}</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/playas/${slug}`}>{playa.nombre}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Qué llevar</span>
        </nav>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Imprescindibles · {playa.municipio}</div>
          <h1 className={styles.title}>Qué llevar a <em>{np}</em></h1>
          <p className={styles.intro}>{texto.intro}</p>
        </header>

        <section className={styles.section} aria-labelledby="prods">
          <h2 id="prods" className={styles.h2}>Imprescindibles para <em>{playa.nombre}</em></h2>
          <ol className={styles.lista}>
            {productos.map((p, i) => (
              <li key={p.asin} className={styles.prod}>
                <span className={styles.numero} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.prodBody}>
                  <h3 className={styles.prodNombre}>{p.nombre}</h3>
                  <p className={styles.prodRazon}>{p.razon}</p>
                  <div className={styles.prodMeta}>
                    <span className={styles.prodPrecio}>{p.precio} €</span>
                    <span className={styles.prodSep}>·</span>
                    <span className={styles.prodCat}>{p.categoria}</span>
                  </div>
                </div>
                <a
                  href={`https://www.amazon.es/dp/${p.asin}/?tag=${AMAZON_TAG}`}
                  target="_blank" rel="noopener noreferrer sponsored"
                  className={styles.prodCTA}
                >
                  Ver en Amazon →
                </a>
              </li>
            ))}
          </ol>
          <p className={styles.disclose}>
            Amazon.es · enlaces de afiliado (tag {AMAZON_TAG}). Ganamos una comisión sin coste adicional para ti si compras a través de estos enlaces.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="cuando">
          <h2 id="cuando" className={styles.h2}>Cuándo ir y <em>qué esperar</em></h2>
          <p className={styles.parrafo}>{texto.cuando}</p>
          <div className={styles.dataTable} role="list">
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Composición</span>
              <span className={styles.dv}>{playa.composicion ?? 'Arena'}</span>
            </div>
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Tipo</span>
              <span className={styles.dv}>{playa.tipo ?? '—'}</span>
            </div>
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Bandera Azul</span>
              <span className={styles.dv}>{playa.bandera ? 'Sí' : 'No'}</span>
            </div>
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Socorrismo</span>
              <span className={styles.dv}>{playa.socorrismo ? 'Sí' : 'No'}</span>
            </div>
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Accesible</span>
              <span className={styles.dv}>{playa.accesible ? 'Sí' : 'No'}</span>
            </div>
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Perros</span>
              <span className={styles.dv}>{playa.perros ? 'Sí' : 'No'}</span>
            </div>
            <div className={styles.dataRow} role="listitem">
              <span className={styles.dk}>Estado actual</span>
              <span className={styles.dv} style={{ color: estado.dot }}>{estado.label}</span>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="qhacer">
          <h2 id="qhacer" className={styles.h2}>Qué hacer en <em>{playa.nombre}</em></h2>
          <p className={styles.parrafo}>{texto.qHacer}</p>
        </section>

        {faqs.length > 0 && (
          <section className={styles.section} aria-labelledby="faqs">
            <h2 id="faqs" className={styles.h2}>Preguntas frecuentes</h2>
            <div className={styles.faqs}>
              {faqs.map((f, i) => (
                <details key={i} className={styles.faq}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className={styles.volver}>
          <Link href={`/playas/${slug}`} className={styles.volverLink}>
            ← Volver a la ficha completa de {playa.nombre}
          </Link>
        </div>
      </main>
    </>
  )
}
