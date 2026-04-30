// src/app/que-llevar/[tipo]/page.tsx
// Una página por tipo de playa con contenido editorial real (~600-900
// palabras). Reemplaza la generación masiva de URLs por playa que
// generaba thin content. Sólo ~9 URLs nuevas en total.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getTipoBySlug, TIPOS } from '@/lib/tiposQueLlevar'
import { PRODUCTOS, AMAZON_TAG } from '@/lib/amazon-productos'
import styles from './que-llevar.module.css'

export const revalidate = 86400

interface Props { params: Promise<{ tipo: string }> }

export async function generateStaticParams() {
  return TIPOS.map(t => ({ tipo: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo } = await params
  const t = getTipoBySlug(tipo)
  if (!t) return {}
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  return {
    title: t.titulo,
    description: t.descripcion,
    alternates: { canonical: `/que-llevar/${t.slug}` },
    openGraph: {
      title: t.titulo,
      description: t.descripcion,
      url: `${BASE}/que-llevar/${t.slug}`,
      siteName: 'Playas de España',
      locale: 'es_ES',
      type: 'article',
    },
    twitter: { card: 'summary', title: t.titulo, description: t.descripcion },
  }
}

// Encuentra el ProductoAmazon completo a partir del ASIN
function buscarProducto(asinId: string) {
  for (const cat of Object.values(PRODUCTOS)) {
    const p = (cat as readonly { asin: string; nombre: string; precio: string; categoria: string }[]).find(x => x.asin === asinId)
    if (p) return p
  }
  return null
}

export default async function QueLlevarTipoPage({ params }: Props) {
  const { tipo } = await params
  const t = getTipoBySlug(tipo)
  if (!t) notFound()

  // Hidratar productos con la data del catálogo
  const productos = t.productos
    .map(({ asin, razon }) => {
      const p = buscarProducto(asin)
      return p ? { ...p, razon } : null
    })
    .filter(Boolean) as Array<{ asin: string; nombre: string; precio: string; categoria: string; razon: string }>

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: t.titulo,
        description: t.descripcion,
        author: { '@type': 'Organization', name: 'Playas de España' },
        publisher: { '@type': 'Organization', name: 'Playas de España' },
        url: `${BASE}/que-llevar/${t.slug}`,
        datePublished: '2026-04-30T00:00:00Z',
        dateModified: new Date().toISOString(),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio',     item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Qué llevar', item: `${BASE}/que-llevar/${t.slug}` },
        ],
      },
      ...(t.faqs.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: t.faqs.map(f => ({
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
          <span aria-current="page">{t.nombre}</span>
        </nav>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Guía editorial · Imprescindibles</div>
          <h1 className={styles.title}>{t.titulo}</h1>
          {t.intro.map((p, i) => (
            <p key={i} className={styles.intro}>{p}</p>
          ))}
        </header>

        <section className={styles.section} aria-labelledby="prods">
          <h2 id="prods" className={styles.h2}>Imprescindibles para <em>{t.nombre}</em></h2>
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
          <p className={styles.parrafo}>{t.cuandoIr}</p>
        </section>

        <section className={styles.section} aria-labelledby="qhacer">
          <h2 id="qhacer" className={styles.h2}>Qué hacer en <em>{t.nombre}</em></h2>
          <p className={styles.parrafo}>{t.qHacer}</p>
        </section>

        <section className={styles.section} aria-labelledby="consejos">
          <h2 id="consejos" className={styles.h2}>Consejos prácticos</h2>
          <ul className={styles.tips}>
            {t.consejos.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>

        {t.faqs.length > 0 && (
          <section className={styles.section} aria-labelledby="faqs">
            <h2 id="faqs" className={styles.h2}>Preguntas frecuentes</h2>
            <div className={styles.faqs}>
              {t.faqs.map((f, i) => (
                <details key={i} className={styles.faq}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section} aria-labelledby="otras">
          <h2 id="otras" className={styles.h2}>Otras guías</h2>
          <div className={styles.otrasGrid}>
            {TIPOS.filter(o => o.slug !== t.slug).slice(0, 6).map(o => (
              <Link key={o.slug} href={`/que-llevar/${o.slug}`} className={styles.otraCard}>
                <span className={styles.otraNombre}>Qué llevar a {o.nombre}</span>
                <span className={styles.otraArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
