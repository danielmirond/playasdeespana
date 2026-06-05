import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import { CATEGORIES, getArticlesByCategory, type MagazineCategory } from '@/lib/magazine'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({ cat }))
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params
  const meta = CATEGORIES[cat as MagazineCategory]
  if (!meta) return {}
  const title = `${meta.label} de playa | Magazine Playas de España`
  return {
    title,
    description: meta.description,
    alternates: { canonical: `/magazine/categoria/${meta.slug}` },
    openGraph: { type: 'website', url: `${BASE}/magazine/categoria/${meta.slug}`, title, description: meta.description },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const meta = CATEGORIES[cat as MagazineCategory]
  if (!meta) notFound()
  const articles = getArticlesByCategory(meta.slug)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 920, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <nav style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/magazine" style={{ color: 'var(--muted)' }}>Magazine</Link>{' › '}{meta.label}
        </nav>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem,4.5vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', margin: '0 0 .5rem' }}>
          {meta.emoji} {meta.label}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 560, lineHeight: 1.6, margin: '0 0 2rem' }}>{meta.description}</p>

        {articles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
            {articles.map((a) => (
              <Link key={a.slug} href={`/magazine/${a.slug}`} style={{ display: 'block', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '1.1rem', textDecoration: 'none', color: 'inherit' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .4rem', lineHeight: 1.25 }}>{a.title}</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{a.excerpt}</p>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.6rem' }}>{a.readingMin} min →</div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Pronto publicaremos artículos en esta categoría.</p>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/magazine" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Todo el Magazine</Link>
        </div>
      </main>
    </>
  )
}
