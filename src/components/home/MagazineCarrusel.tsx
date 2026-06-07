// src/components/home/MagazineCarrusel.tsx
// Carrusel del Magazine para la home: scroll horizontal con scroll-snap
// (CSS puro, sin JS → server component, sin coste de hidratación).
// Muestra los últimos artículos publicados; se alimenta solo del dataset.
import Link from 'next/link'
import { getAllArticles, getAllArticlesEn, CATEGORIES, CATEGORIES_EN, type Article } from '@/lib/magazine'

function CarruselCard({ a, base, label, minLabel }: { a: Article; base: string; label: string; minLabel: string }) {
  return (
    <Link
      href={`${base}/${a.slug}`}
      style={{
        flex: '0 0 auto', width: 'min(280px, 78vw)', scrollSnapAlign: 'start',
        display: 'flex', flexDirection: 'column',
        background: 'var(--card-bg)', border: '1px solid var(--line)',
        borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit',
      }}
    >
      {a.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.heroImage} alt={a.heroAlt} width={280} height={130} loading="lazy" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', background: 'var(--card-bg)' }} />
      ) : (
        <div style={{ height: 130, background: 'linear-gradient(135deg,#0c4a6e,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem' }} aria-hidden>{CATEGORIES[a.category].emoji}</div>
      )}
      <div style={{ padding: '1rem 1.05rem 1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--accent)' }}>{label}</span>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: '.35rem 0 .4rem', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.excerpt}</p>
        <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 'auto', paddingTop: '.7rem', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>{a.readingMin} {minLabel}</div>
      </div>
    </Link>
  )
}

export default function MagazineCarrusel({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const en = locale === 'en'
  const articles = (en ? getAllArticlesEn() : getAllArticles()).slice(0, 10)
  if (articles.length === 0) return null

  const base = en ? '/en/magazine' : '/magazine'
  const heading = en ? 'From the Magazine' : 'Del Magazine'
  const kicker = en ? 'Routes, curiosities & guides' : 'Rutas, curiosidades y guías de playa'
  const seeAll = en ? 'See all →' : 'Ver todo →'
  const minLabel = en ? 'min' : 'min'
  const catLabel = (a: Article) => en ? CATEGORIES_EN[a.category].label : CATEGORIES[a.category].label

  return (
    <section aria-labelledby="mag-carousel-title" style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', padding: '0 1.5rem', marginBottom: '1.1rem' }}>
        <div>
          <div style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem' }}>{kicker}</div>
          <h2 id="mag-carousel-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-.015em', lineHeight: 1.1 }}>{heading}</h2>
        </div>
        <Link href={base} style={{ flex: '0 0 auto', color: 'var(--accent)', fontWeight: 600, fontSize: '.85rem', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: '.2rem' }}>{seeAll}</Link>
      </div>

      <div
        style={{
          display: 'flex', gap: '1rem',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          padding: '.25rem 1.5rem 1rem',
          scrollbarWidth: 'thin',
        }}
      >
        {articles.map((a) => (
          <CarruselCard key={a.slug} a={a} base={base} label={catLabel(a)} minLabel={minLabel} />
        ))}
      </div>
    </section>
  )
}
