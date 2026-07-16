import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import GygActivities from '@/components/GygActivities'
import AuthorByline from '@/components/seo/AuthorByline'
import { getArticleBySlug, getAllArticles, CATEGORIES, type Block } from '@/lib/magazine'
import { getPlayas } from '@/lib/playas'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getArticleBySlug(slug)
  if (!a) return {}
  const url = `${BASE}/magazine/${a.slug}`
  // Discover prefiere foto real; si no hay, cae a la tarjeta OG de texto.
  const og = a.heroImage ?? `${BASE}/api/og?playa=${encodeURIComponent(a.title)}`
  return {
    title: `${a.title} | Magazine Playas de España`,
    description: a.excerpt,
    alternates: {
      canonical: `/magazine/${a.slug}`,
      languages: a.en ? { es: `/magazine/${a.slug}`, en: `/en/magazine/${a.slug}` } : undefined,
    },
    openGraph: {
      title: a.title, description: a.excerpt, url, type: 'article',
      publishedTime: a.datePublished,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: a.title, description: a.excerpt, images: [og] },
  }
}

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case 'h2':
      return (
        <h2 key={i} id={b.id} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: '2.2rem 0 .9rem' }}>
          {b.text}
        </h2>
      )
    case 'p':
      return <p key={i} style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink)', margin: '0 0 1.1rem' }} dangerouslySetInnerHTML={{ __html: b.html }} />
    case 'ul':
      return (
        <ul key={i} style={{ margin: '0 0 1.3rem', paddingLeft: '1.3rem', display: 'grid', gap: '.5rem' }}>
          {b.items.map((it, j) => <li key={j} style={{ fontSize: '.95rem', lineHeight: 1.6, color: 'var(--muted)' }}>{it}</li>)}
        </ul>
      )
    case 'quote':
      return (
        <blockquote key={i} style={{ margin: '1.5rem 0', padding: '1rem 1.25rem', borderLeft: '4px solid var(--accent)', background: 'var(--card-bg)', borderRadius: '0 8px 8px 0' }}>
          <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: 'var(--ink)', fontStyle: 'italic' }}>{b.text}</p>
          {b.cite && <cite style={{ display: 'block', marginTop: '.5rem', fontSize: '.78rem', color: 'var(--muted)', fontStyle: 'normal' }}>— {b.cite}</cite>}
        </blockquote>
      )
    case 'cta':
      return (
        <Link key={i} href={b.href} style={{ display: 'block', margin: '1.75rem 0', padding: '1.1rem 1.25rem', background: 'linear-gradient(135deg,#0369a1 0%,#0891b2 100%)', borderRadius: 10, textDecoration: 'none', color: '#fff' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>{b.label} →</span>
          {b.sub && <span style={{ display: 'block', fontSize: '.82rem', color: 'rgba(255,255,255,.85)', marginTop: '.2rem' }}>{b.sub}</span>}
        </Link>
      )
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticleBySlug(slug)
  if (!a) notFound()

  // ── Playas mencionadas → enlaces a ficha (enlazado interno global) ──
  // Matching conservador: nombre completo normalizado, o núcleo ≥8 chars
  // (evita falsos positivos tipo "Levante" = viento). Máx. 6.
  const _norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const _core = (x: string) => _norm(x).replace(/\b(playa|platja|praia|cala|calo|hondartza|de|del|de la|la|el|les|los|las|d')\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const _texto = _norm([a.title, a.excerpt, ...a.body.map(b =>
    b.t === 'p' ? b.html : b.t === 'h2' ? b.text : b.t === 'ul' ? b.items.join(' ') : b.t === 'quote' ? b.text : ''
  )].join(' ').replace(/<[^>]+>/g, ' '))
  const _todas = await getPlayas()
  // Palabras tan comunes que un núcleo compuesto SOLO por ellas no
  // identifica una playa ("pequeña", "amarilla", "palmeras"… aparecen en
  // cualquier texto). Esos nombres solo casan por nombre completo.
  const _COMUNES = new Set(['pequena', 'pequeno', 'grande', 'chica', 'chico', 'amarilla', 'blanca', 'negra', 'roja', 'verde', 'dorada', 'nueva', 'vieja', 'nova', 'vella', 'palmeras', 'arena', 'arenas', 'piedras', 'salinas', 'norte', 'sur', 'este', 'oeste', 'levante', 'poniente', 'honda', 'larga', 'llarga', 'gran', 'mar', 'sol', 'costa', 'puerto', 'port', 'torre', 'iglesia', 'castillo', 'rio', 'central', 'pequenas', 'grandes', 'chicas', 'amarillas', 'blancas', 'negras', 'rojas', 'verdes', 'doradas', 'nuevas', 'viejas', 'casas', 'torres', 'puertos', 'rios', 'castillos', 'playitas', 'caletas', 'caleta', 'ensenada', 'muelle', 'faro', 'arenal', 'arenales', 'playazo', 'bassa', 'racó', 'raco'])
  const _seen = new Set<string>()
  const playasMencionadas = _todas
    .filter(pl => {
      const full = _norm(pl.nombre)
      const core = _core(pl.nombre)
      const coreEsPropio = core.length >= 8 && core.split(' ').some(t => t.length >= 4 && !_COMUNES.has(t))
      // La vía de nombre completo también exige nombre "propio": sin esto,
      // una playa llamada a secas "Casas Blancas" casa con cualquier texto
      // que describa un pueblo de casas blancas.
      const tieneGenerico = /\b(playa|platja|praia|cala|calo|hondartza)\b/.test(full)
      const hit = (full.length >= 8 && (tieneGenerico || coreEsPropio) && _texto.includes(full)) || (coreEsPropio && _texto.includes(core))
      if (!hit || _seen.has(pl.slug)) return false
      _seen.add(pl.slug)
      return true
    })
    .sort((x, y) => y.nombre.length - x.nombre.length)
    .slice(0, 6)


  const cat = CATEGORIES[a.category]
  const url = `${BASE}/magazine/${a.slug}`
  const og = a.heroImage ?? `${BASE}/api/og?playa=${encodeURIComponent(a.title)}`

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    // Discover requiere imagen grande (≥1200px) en el Article schema.
    image: [og],
    datePublished: a.datePublished,
    dateModified: a.datePublished,
    author: { '@type': 'Organization', name: 'Playas de España' },
    publisher: { '@type': 'Organization', name: 'Playas de España', url: BASE },
    mainEntityOfPage: url,
    articleSection: cat.label,
  }
  const faqLd = a.faq && a.faq.length > 0 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Magazine', item: `${BASE}/magazine` },
      { '@type': 'ListItem', position: 2, name: cat.label, item: `${BASE}/magazine/categoria/${cat.slug}` },
      { '@type': 'ListItem', position: 3, name: a.title, item: url },
    ],
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          <Link href="/magazine" style={{ color: 'var(--muted)' }}>Magazine</Link>{' › '}
          <Link href={`/magazine/categoria/${cat.slug}`} style={{ color: 'var(--muted)' }}>{cat.label}</Link>
        </nav>

        <span style={{ display: 'inline-block', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--accent)', marginBottom: '.6rem' }}>
          {cat.emoji} {cat.label}
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem,4.5vw,2.6rem)', fontWeight: 900, lineHeight: 1.12, color: 'var(--ink)', margin: '0 0 .75rem' }}>
          {a.title}
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 1rem' }}>{a.excerpt}</p>

        <AuthorByline
          headline={a.title}
          url={url}
          dateModified={a.datePublished}
          datePublished={a.datePublished}
          description={a.excerpt}
          articleSection={cat.label}
        />
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', margin: '.5rem 0 2rem' }}>{a.readingMin} min de lectura</div>

        {/* Hero (foto real Unsplash, si está resuelta) */}
        {a.heroImage && (
          <figure style={{ margin: '0 0 2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.heroThumb ?? a.heroImage} alt={a.heroAlt} width={1200} height={630} loading="eager" style={{ width: '100%', height: 'auto', borderRadius: 12, display: 'block', background: 'var(--card-bg)' }} />
            {a.heroCredit && (
              <figcaption style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.45rem', textAlign: 'right' }}>
                Foto: {a.heroCredit.author ? `${a.heroCredit.author} · ` : ''}{a.heroCredit.source}
              </figcaption>
            )}
          </figure>
        )}

        {/* Cuerpo */}
        <article>{a.body.map(renderBlock)}</article>

        {/* FAQ visible */}
        {a.faq && a.faq.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 1rem' }}>Preguntas frecuentes</h2>
            <div style={{ display: 'grid', gap: '.6rem' }}>
              {a.faq.map((f, i) => (
                <details key={i} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '.9rem 1.1rem', background: 'var(--card-bg)' }}>
                  <summary style={{ fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', fontSize: '.95rem' }}>{f.q}</summary>
                  <p style={{ margin: '.6rem 0 0', color: 'var(--muted)', lineHeight: 1.6, fontSize: '.9rem' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {playasMencionadas.length > 0 && (
          <section style={{ marginTop: '2.75rem', borderTop: '1px solid var(--line)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 .85rem' }}>Playas mencionadas en este artículo</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.55rem' }}>
              {playasMencionadas.map(pl => (
                <Link key={pl.slug} href={`/playas/${pl.slug}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.65rem .85rem', textDecoration: 'none' }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>{pl.nombre} <span aria-hidden="true">→</span></span>
                  <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{pl.municipio} · {pl.provincia}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Relacionados */}
        {a.related.length > 0 && (
          <section style={{ marginTop: '2.75rem', borderTop: '1px solid var(--line)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 .85rem' }}>Sigue leyendo</h2>
            <div style={{ display: 'grid', gap: '.5rem' }}>
              {a.related.map((r, i) => (
                <Link key={i} href={r.href} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: '.92rem' }}>{r.label} →</Link>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/magazine" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Volver al Magazine</Link>
        </div>
      </main>
      <GygActivities query={a.gygQuery} cmp="magazine" />
    </>
  )
}
