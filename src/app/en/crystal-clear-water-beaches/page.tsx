// EN mirror of /playas-aguas-cristalinas. Same scoring engine (toponyms +
// turbidity), translated prose. TopBeachCardsConHero with locale="en".
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import { getTurbidez } from '@/lib/marine'
import type { Playa } from '@/types'
import SchemaItemList from '@/components/seo/SchemaItemList'
import UpdatedBadge from '@/components/seo/UpdatedBadge'
import { getEditorialModified } from '@/lib/dateModified'
import TopBeachCardsConHero from '@/components/seo/TopBeachCardsConHero'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const MODIFIED = getEditorialModified('src/app/playas-aguas-cristalinas/page.tsx', ['public/data/playas.json'])

export const metadata: Metadata = {
  title: 'Crystal-clear water beaches in Spain | The most transparent',
  description: 'Discover Spain’s clearest, most transparent beaches: the Canaries, Balearics, Almería and Menorca. Rankings by water visibility, EEA quality and Blue Flag.',
  alternates: { canonical: '/en/crystal-clear-water-beaches', languages: { es: '/playas-aguas-cristalinas', en: '/en/crystal-clear-water-beaches' } },
  openGraph: { title: 'Crystal-clear water beaches in Spain', description: 'Spain’s most transparent beaches: ranked by water visibility, EEA quality and Blue Flag.', url: `${BASE}/en/crystal-clear-water-beaches`, type: 'article', images: [{ url: '/api/og?playa=Crystal-clear%20water%20beaches%20in%20Spain', width: 1200, height: 630 }] },
  robots: { index: true, follow: true },
}

function scoreAguasCristalinas(p: Playa, turbidez: { visibilidad_m: number } | null): number {
  let score = 0
  const esCanarias = p.lat < 30
  const esBaleares = p.comunidad === 'Islas Baleares'
  const esAlmeria = p.provincia === 'Almería'
  const esMurcia = p.provincia === 'Murcia'
  const esCatOrMed = ['Cataluña', 'Comunitat Valenciana'].includes(p.comunidad)
  if (esCanarias) score += 40
  else if (esBaleares) score += 38
  else if (esAlmeria) score += 32
  else if (esMurcia) score += 28
  else if (esCatOrMed) score += 22
  else score += 14
  const vis = turbidez?.visibilidad_m ?? 10
  score += Math.min(40, Math.round((vis / 25) * 40))
  if (p.bandera) score += 15
  if (p.composicion?.toLowerCase().includes('arena fina') || p.composicion?.toLowerCase().includes('blanca')) score += 5
  return Math.min(100, score)
}

const FAQ = [
  { q: 'Where are Spain’s clearest-water beaches?', a: 'Mainly in the Canaries (La Graciosa, Fuerteventura, Lanzarote), the Balearics (Menorca, Formentera, Ibiza), Cabo de Gata (Almería) and parts of the Murcia coast. White sand seabed, warm climate and the absence of rivers give the greatest transparency.' },
  { q: 'How is water transparency measured?', a: 'Visibility is estimated in metres using remote sensing and oceanographic models. 20-25 metres (the Canaries in summer) is exceptional; 10-15 metres is very good; 5-10 metres is the Atlantic standard; below that indicates high turbidity or sediment-laden water.' },
  { q: 'Is it the same as water quality?', a: 'No. Water quality (EEA Directive 2006/7/EC) measures bacteriological pollution — a health indicator. Transparency measures visual clarity. A beach can have Excellent quality and murky water (for example near river mouths).' },
  { q: 'When is the water clearest?', a: 'In summer after several days without strong wind. Waves suspend sand and cut visibility. The best weeks tend to be mid-June and September (stable water, little plankton) in the Mediterranean; year-round in the Canaries.' },
]
const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'en', mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }

export default async function CrystalClearBeachesEn() {
  const playas = await getPlayas()
  const conScore = await Promise.all(playas.map(async p => {
    const turb = await getTurbidez(p.lat, p.lng)
    return { ...p, score: scoreAguasCristalinas(p, turb) }
  }))
  const sorted = [...conScore].sort((a, b) => b.score - a.score)
  const porComunidad = new Map<string, typeof sorted>()
  for (const p of sorted) {
    const lista = porComunidad.get(p.comunidad) ?? []
    if (lista.length < 5) { lista.push(p); porComunidad.set(p.comunidad, lista) }
  }
  const seleccion = Array.from(porComunidad.values()).flat().sort((a, b) => b.score - a.score).slice(0, 30)

  return (
    <>
      <SchemaItemList name="Crystal-clear water beaches in Spain" description="Ranking of Spain’s clearest-water beaches by estimated visibility, EEA quality and Blue Flag." url={`${BASE}/en/crystal-clear-water-beaches`} beaches={seleccion.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))} locale="en" ordered />
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/en">Home</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Crystal-clear water</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: '.75rem' }}>
          Spain’s <em style={{ fontWeight: 500, color: 'var(--accent)' }}>clearest-water beaches</em>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.6 }}>
          Spain’s most transparent waters are in the Canaries, the Balearics and specific spots in Almería and Murcia. A ranking based on estimated visibility, EEA water quality and Blue Flag — the three indicators that best predict real transparency.
        </p>

        <section aria-labelledby="h2-what" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 id="h2-what" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>What makes a beach’s water crystal-clear?</h2>
          <ul style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>White sand or rocky seabed</strong> — reflects light, stirs up no sediment.</li>
            <li><strong>No nearby rivers</strong> — freshwater inflows cloud the sea.</li>
            <li><strong>Usually little swell</strong> — waves suspend sand and cut visibility.</li>
            <li><strong>Warm, stable climate</strong> — less plankton (chlorophyll) in the water.</li>
            <li><strong>Pollution protection</strong> — Blue Flag and EEA Excellent classification.</li>
          </ul>
        </section>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>The 10 clearest</h2>
        <TopBeachCardsConHero
          playas={seleccion.slice(0, 10).map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia, comunidad: p.comunidad, lat: p.lat, lng: p.lng, bandera: p.bandera, score: p.score }))}
          limit={10}
          eyebrow="Top 10 · Estimated visibility + Blue Flag + EEA quality"
          scoreColor="#0369a1"
          locale="en"
        />

        {seleccion.length > 10 && (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2rem', marginBottom: '1rem' }}>And another {seleccion.length - 10} with excellent water</h2>
            <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.55rem' }} start={11}>
              {seleccion.slice(10).map((p, i) => (
                <li key={p.slug}>
                  <Link href={`/en/beaches/${p.slug}`} prefetch={false} style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.7rem .85rem', borderRadius: 6, background: 'var(--card-bg)', border: '1px solid var(--line)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'rgba(74,122,144,.15)', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 800 }}>{i + 11}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.15rem' }}>{p.municipio} · {p.provincia}{p.bandera && <span style={{ color: '#2563eb', marginLeft: '.35rem' }}>· Blue Flag</span>}</div>
                    </div>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#0369a1', flexShrink: 0 }}>{p.score}/100</span>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Explore more */}
        <section aria-labelledby="h2-more" style={{ marginTop: '3rem' }}>
          <h2 id="h2-more" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>Explore more</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { href: '/en/blue-flag', label: 'Blue Flag beaches' },
              { href: '/en/communities/canarias', label: 'Beaches of the Canary Islands' },
              { href: '/en/communities/islas-baleares', label: 'Beaches of the Balearic Islands' },
              { href: '/en/islands', label: 'Beaches by island' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'inline-flex', padding: '.45rem .85rem', background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100, fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(107,64,10,.3)' }}>{l.label} →</Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="h2-faq" style={{ marginTop: '3rem' }}>
          <h2 id="h2-faq" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {FAQ.map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <UpdatedBadge iso={MODIFIED} url="https://playas-espana.com/en/crystal-clear-water-beaches" name="Crystal-clear water beaches in Spain" visible={false} />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}
