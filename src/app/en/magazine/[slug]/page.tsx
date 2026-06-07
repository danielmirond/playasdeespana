import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import { getArticleBySlug, getAllArticlesEn, CATEGORIES, CATEGORIES_EN, type Block } from '@/lib/magazine'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export function generateStaticParams() {
  return getAllArticlesEn().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getArticleBySlug(slug)
  if (!a || !a.en) return {}
  const url = `${BASE}/en/magazine/${a.slug}`
  const og = `${BASE}/api/og?playa=${encodeURIComponent(a.en.title)}`
  return {
    title: `${a.en.title} | Playas de España Magazine`,
    description: a.en.excerpt,
    alternates: { canonical: `/en/magazine/${a.slug}`, languages: { es: `/magazine/${a.slug}`, en: `/en/magazine/${a.slug}` } },
    openGraph: { title: a.en.title, description: a.en.excerpt, url, type: 'article', publishedTime: a.datePublished, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: a.en.title, description: a.en.excerpt, images: [og] },
  }
}

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case 'h2':
      return <h2 key={i} id={b.id} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: '2.2rem 0 .9rem' }}>{b.text}</h2>
    case 'p':
      return <p key={i} style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink)', margin: '0 0 1.1rem' }} dangerouslySetInnerHTML={{ __html: b.html }} />
    case 'ul':
      return <ul key={i} style={{ margin: '0 0 1.3rem', paddingLeft: '1.3rem', display: 'grid', gap: '.5rem' }}>{b.items.map((it, j) => <li key={j} style={{ fontSize: '.95rem', lineHeight: 1.6, color: 'var(--muted)' }}>{it}</li>)}</ul>
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

export default async function ArticlePageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticleBySlug(slug)
  if (!a || !a.en) notFound()
  const en = a.en

  const cat = CATEGORIES[a.category]
  const catEn = CATEGORIES_EN[a.category]
  const url = `${BASE}/en/magazine/${a.slug}`
  const og = `${BASE}/api/og?playa=${encodeURIComponent(en.title)}`

  const ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: en.title, description: en.excerpt, image: [og], datePublished: a.datePublished, dateModified: a.datePublished,
    author: { '@type': 'Organization', name: 'Playas de España' },
    publisher: { '@type': 'Organization', name: 'Playas de España', url: BASE },
    mainEntityOfPage: url, articleSection: catEn.label, inLanguage: 'en',
  }
  const faqLd = en.faq && en.faq.length > 0 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: en.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Magazine', item: `${BASE}/en/magazine` },
      { '@type': 'ListItem', position: 2, name: catEn.label, item: `${BASE}/en/magazine/category/${cat.slug}` },
      { '@type': 'ListItem', position: 3, name: en.title, item: url },
    ],
  }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>
        <nav style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
          <Link href="/en/magazine" style={{ color: 'var(--muted)' }}>Magazine</Link>{' › '}
          <Link href={`/en/magazine/category/${cat.slug}`} style={{ color: 'var(--muted)' }}>{catEn.label}</Link>
        </nav>

        <span style={{ display: 'inline-block', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--accent)', marginBottom: '.6rem' }}>
          {cat.emoji} {catEn.label}
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem,4.5vw,2.6rem)', fontWeight: 900, lineHeight: 1.12, color: 'var(--ink)', margin: '0 0 .75rem' }}>{en.title}</h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 1rem' }}>{en.excerpt}</p>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', margin: '.5rem 0 2rem' }}>{a.readingMin} min read</div>

        <article>{en.body.map(renderBlock)}</article>

        {en.faq && en.faq.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 1rem' }}>Frequently asked questions</h2>
            <div style={{ display: 'grid', gap: '.6rem' }}>
              {en.faq.map((f, i) => (
                <details key={i} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '.9rem 1.1rem', background: 'var(--card-bg)' }}>
                  <summary style={{ fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', fontSize: '.95rem' }}>{f.q}</summary>
                  <p style={{ margin: '.6rem 0 0', color: 'var(--muted)', lineHeight: 1.6, fontSize: '.9rem' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {en.related.length > 0 && (
          <section style={{ marginTop: '2.75rem', borderTop: '1px solid var(--line)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 .85rem' }}>Keep reading</h2>
            <div style={{ display: 'grid', gap: '.5rem' }}>
              {en.related.map((r, i) => (
                <Link key={i} href={r.href} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: '.92rem' }}>{r.label} →</Link>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/en/magazine" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Back to Magazine</Link>
        </div>
      </main>
    </>
  )
}
