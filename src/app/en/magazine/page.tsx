import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getAllArticlesEn, CATEGORIES, CATEGORIES_EN, type Article } from '@/lib/magazine'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Magazine | Routes, curiosities and food of the Spanish coast',
  description: 'The Playas de España magazine: coastal routes, beach curiosities, where to eat by the sea and practical guides to enjoy the beach.',
  alternates: { canonical: '/en/magazine', languages: { es: '/magazine', en: '/en/magazine' } },
  openGraph: {
    type: 'website',
    url: `${BASE}/en/magazine`,
    images: [{ url: `${BASE}/api/og?playa=Magazine`, width: 1200, height: 630 }],
  },
}

function Card({ a }: { a: Article }) {
  const cat = CATEGORIES[a.category]
  const catEn = CATEGORIES_EN[a.category]
  return (
    <Link href={`/en/magazine/${a.slug}`} style={{ display: 'flex', flexDirection: 'column', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ height: 140, background: `linear-gradient(135deg,#0c4a6e,#0891b2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }} aria-hidden>{cat.emoji}</div>
      <div style={{ padding: '1.1rem' }}>
        <span style={{ fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--accent)' }}>{catEn.label}</span>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', margin: '.35rem 0 .4rem', lineHeight: 1.25 }}>{a.en!.title}</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.en!.excerpt}</p>
        <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.7rem' }}>{a.readingMin} min</div>
      </div>
    </Link>
  )
}

export default function MagazinePageEn() {
  const articles = getAllArticlesEn()
  return (
    <>
      <Nav />
      <section style={{ background: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#0891b2 100%)', color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 .75rem' }}>Magazine</h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.92)', maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
            Coastal routes, curiosities of the shoreline, where to eat by the sea and guides to make the most of the beach.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2rem' }}>
          {Object.values(CATEGORIES).map((c) => (
            <Link key={c.slug} href={`/en/magazine/category/${c.slug}`} style={{ padding: '.5rem .9rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 999, textDecoration: 'none', color: 'var(--ink)', fontSize: '.85rem', fontWeight: 600 }}>
              {c.emoji} {CATEGORIES_EN[c.slug].label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
          {articles.map((a) => <Card key={a.slug} a={a} />)}
        </div>
      </main>
    </>
  )
}
