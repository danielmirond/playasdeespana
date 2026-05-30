import Nav from '@/components/ui/Nav'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocalitiesByCoast, getAllLocalities } from '@/lib/boat-rental-localities'
import { boatRentalSlug } from '@/lib/boat-rental-helpers'

interface CoastPageParams { coast: string }

const AWIN = (ref: string) =>
  `https://www.awin1.com/cread.php?awinmid=32683&awinaffid=playasdeespana&clickref=${ref}&ued=https://www.samboat.es`

export function generateStaticParams() {
  const coasts = new Set(getAllLocalities().map((l) => boatRentalSlug(l.coast)))
  return Array.from(coasts).map((coast) => ({ coast }))
}

export async function generateMetadata({ params }: { params: Promise<CoastPageParams> }): Promise<Metadata> {
  const { coast } = await params
  const locs = getLocalitiesByCoast(coast)
  const name = locs[0]?.coast ?? decodeURIComponent(coast)
  const title = `Alquiler de barcos en ${name}: precios, calas y fondeos | Playas de España`
  const description = `Guía completa para alquilar barco en ${name}. ${locs.length} destinos con precios desde €${Math.min(...locs.map((l) => l.pricing.small.min))}/día, mejores calas, fondeos seguros y consejos.`
  return { title, description, openGraph: { title, description, type: 'website' }, alternates: { canonical: `https://playasdeespana.com/alquiler-barco/costas/${coast}` } }
}

export default async function CoastPage({ params }: { params: Promise<CoastPageParams> }) {
  const { coast } = await params
  const localities = getLocalitiesByCoast(coast)
  if (localities.length === 0) notFound()

  const coastName = localities[0].coast
  const coastSlug = boatRentalSlug(coastName)
  const minPrice = Math.min(...localities.map((l) => l.pricing.small.min))

  // Agrupar por provincia
  const provinces = new Map<string, typeof localities>()
  localities.forEach((l) => {
    if (!provinces.has(l.province)) provinces.set(l.province, [])
    provinces.get(l.province)!.push(l)
  })

  const sectionH2: React.CSSProperties = {
    fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1.25rem',
  }

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#0891b2 100%)', color: '#fff', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', marginBottom: '1rem' }}>
            <Link href="/alquiler-barco" style={{ color: 'rgba(255,255,255,.85)' }}>Alquiler de barcos</Link>{' › '}{coastName}
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1rem' }}>
            Alquiler de barcos en {coastName}
          </h1>
          <p style={{ fontSize: '1.05rem', maxWidth: 620, lineHeight: 1.6, color: 'rgba(255,255,255,.92)', margin: '0 0 1.5rem' }}>
            {localities.length} destinos para navegar por {coastName}: calas escondidas, fondeos seguros y barcos con o sin patrón desde €{minPrice}/día.
          </p>
          <a href={AWIN(`coast_${coastSlug}_hero`)} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.9rem 1.8rem', background: '#fff', color: '#0369a1', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver barcos en {coastName} →
          </a>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--line)', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1rem', textAlign: 'center' }}>
          {[
            [`${localities.length}`, 'Destinos'],
            [`${provinces.size}`, 'Provincias'],
            [`€${minPrice}+`, 'Precios desde'],
          ].map(([n, l], i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{n}</div>
              <p style={{ color: 'var(--muted)', fontSize: '.82rem', margin: '.15rem 0 0' }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* INTRO SEO */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={sectionH2}>Por qué alquilar un barco en {coastName}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            {coastName} concentra algunas de las mejores calas de España, muchas solo accesibles por mar.
            Alquilar un barco —con patrón si no tienes experiencia o sin licencia para embarcaciones de hasta 5,5 m—
            te permite descubrir fondeos tranquilos, playas vírgenes y rincones que desde tierra están masificados o son inaccesibles.
            Abajo encontrarás cada destino con sus precios, mejores playas, fondeos recomendados y consejos locales.
          </p>
        </section>

        {/* DESTINOS POR PROVINCIA */}
        {Array.from(provinces.entries()).map(([province, locs]) => {
          const provinceSlug = boatRentalSlug(province)
          return (
            <section key={province} style={{ marginBottom: '2.75rem' }}>
              <h2 style={sectionH2}>{province}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1rem' }}>
                {locs.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/alquiler-barco/costas/${coastSlug}/provincias/${provinceSlug}/${l.slug}`}
                    style={{ display: 'block', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '1.1rem', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.35rem' }}>{l.locality}</div>
                    <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 .7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.82rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>desde €{l.pricing.small.min}/día</span>
                      <span style={{ color: 'var(--muted)' }}>{l.beaches.length} calas →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg,#0369a1 0%,#0891b2 100%)', color: '#fff', borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center', marginTop: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 .6rem' }}>Encuentra tu barco en {coastName}</h2>
          <p style={{ color: 'rgba(255,255,255,.9)', lineHeight: 1.6, margin: '0 0 1.5rem', maxWidth: 520, marginInline: 'auto' }}>
            Cientos de embarcaciones verificadas con reserva segura y cancelación flexible.
          </p>
          <a href={AWIN(`coast_${coastSlug}_bottom`)} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.9rem 1.8rem', background: '#fff', color: '#0369a1', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Explorar ofertas en SamBoat →
          </a>
        </section>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/alquiler-barco" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Todas las costas</Link>
        </div>
      </main>
    </>
  )
}
