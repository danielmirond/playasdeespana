// src/app/en/yacht-rental/page.tsx — EN master landing for yacht rental.
// Mirrors /alquiler-yate. Uses only toponym + prices from the dataset; copy
// translated inline. Detail pages keep ES prose, so cards link to /alquiler-yate/*.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { DESTINOS_PREMIUM } from '@/lib/embarcaciones'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Yacht rental in Spain: prices by destination | Playas de España',
  description: 'Real comparison of yacht rental in Ibiza, Mallorca, Menorca, Tenerife, Marbella and Costa Brava. Weekly prices, coves only reachable by sea, and the best season.',
  alternates: { canonical: '/en/yacht-rental', languages: { es: '/alquiler-yate', en: '/en/yacht-rental' } },
  openGraph: { title: 'Yacht rental in Spain: prices by destination', description: 'Real comparison across Spain’s 6 premium yacht destinations.', url: `${BASE}/en/yacht-rental`, type: 'website' },
}

export default function YachtRentalMasterEn() {
  const conYate = DESTINOS_PREMIUM.filter(d => d.precios.yateSemana)

  const collectionSchema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Yacht rental in Spain', description: 'Comparison by premium destination.', inLanguage: 'en',
    hasPart: conYate.map(d => ({ '@type': 'Service', name: `Yacht rental in ${d.nombre}`, url: `${BASE}/en/yacht-rental`, areaServed: { '@type': 'Place', name: d.nombre } })),
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/en">Home</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Yacht rental</span>
        </nav>

        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>
            Premium · 6 destinations
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: '.75rem' }}>
            <em style={{ fontWeight: 500, color: 'var(--accent)' }}>Yacht</em> rental in Spain
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink)', maxWidth: 740, marginBottom: 0, lineHeight: 1.6 }}>
            A comparison by premium destination. Each landing has real market prices, coves reachable only by sea, the best season to go and local tips you won’t find on the big generalist platforms.
          </p>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--ink)' }}>
            6 destinations to charter a yacht
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.85rem' }}>
            {conYate.map(d => (
              <Link key={d.slug} href={`/alquiler-yate/${d.slug}`} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: '1.1rem 1.2rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>{d.nombre}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{d.provincia} · {d.fondeos.length} top anchorages</div>
                {d.precios.yateSemana && (
                  <div style={{ fontSize: '.82rem', color: 'var(--accent)', fontWeight: 600, marginTop: '.2rem' }}>
                    From €{d.precios.yateSemana[0].toLocaleString('en')}/week
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', background: 'var(--card-bg, #faf6ef)', padding: '1.5rem 1.5rem', borderRadius: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '.75rem', color: 'var(--ink)' }}>
            Yacht or catamaran? Which suits you
          </h2>
          <ul style={{ fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
            <li><strong>Yacht</strong> (8-30 m): premium, one cabin per couple, ideal for a full week. €8k-35k/week.</li>
            <li><strong>Catamaran</strong> (10-15 m): stable, groups of 6-12, ideal for a day or weekend. €500-2,500/day.</li>
            <li><strong>Licence-free boat</strong> (&lt; 5 m): casual, by the day, no licence needed. €120-360/day.</li>
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '.65rem' }}>
            <Link href="/en/catamaran-rental" style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'underline' }}>See catamarans →</Link>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      </main>
    </>
  )
}
