import Nav from '@/components/ui/Nav'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocalitiesByCoast, getAllLocalities } from '@/lib/boat-rental-localities'
import { boatRentalSlug } from '@/lib/boat-rental-helpers'

interface ProvincePageParams { coast: string; province: string }

const AWIN = (ref: string) =>
  `https://www.awin1.com/cread.php?awinmid=32683&awinaffid=playasdeespana&clickref=${ref}&ued=https://www.samboat.es`

export function generateStaticParams() {
  return getAllLocalities().map((l) => ({
    coast: boatRentalSlug(l.coast),
    province: boatRentalSlug(l.province),
  }))
}

function localitiesFor(coast: string, province: string) {
  const key = boatRentalSlug(province)
  return getLocalitiesByCoast(coast).filter((l) => boatRentalSlug(l.province) === key)
}

export async function generateMetadata({ params }: { params: Promise<ProvincePageParams> }): Promise<Metadata> {
  const { coast, province } = await params
  const locs = localitiesFor(coast, province)
  const name = locs[0]?.province ?? decodeURIComponent(province)
  const minPrice = locs.length ? Math.min(...locs.map((l) => l.pricing.small.min)) : 0
  const title = `Alquiler de barcos en ${name}: precios y mejores calas | Playas de España`
  const description = `Alquila barco en ${name}: ${locs.length} ${locs.length === 1 ? 'destino' : 'destinos'}, precios desde €${minPrice}/día, calas accesibles solo por mar y fondeos seguros.`
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `https://playas-espana.com/alquiler-barco/costas/${coast}/provincias/${province}` },
  }
}

export default async function ProvincePage({ params }: { params: Promise<ProvincePageParams> }) {
  const { coast, province } = await params
  const localities = localitiesFor(coast, province)
  if (localities.length === 0) notFound()

  const provinceName = localities[0].province
  const coastName = localities[0].coast
  const coastSlug = boatRentalSlug(coastName)
  const provinceSlug = boatRentalSlug(provinceName)
  const minPrice = Math.min(...localities.map((l) => l.pricing.small.min))

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#0891b2 100%)', color: '#fff', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', marginBottom: '1rem' }}>
            <Link href="/alquiler-barco" style={{ color: 'rgba(255,255,255,.85)' }}>Alquiler de barcos</Link>{' › '}
            <Link href={`/alquiler-barco/costas/${coastSlug}`} style={{ color: 'rgba(255,255,255,.85)' }}>{coastName}</Link>{' › '}{provinceName}
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1rem' }}>
            Alquiler de barcos en {provinceName}
          </h1>
          <p style={{ fontSize: '1.05rem', maxWidth: 620, lineHeight: 1.6, color: 'rgba(255,255,255,.92)', margin: '0 0 1.5rem' }}>
            {localities.length} {localities.length === 1 ? 'destino' : 'destinos'} en {provinceName} ({coastName}) con barcos desde €{minPrice}/día, fondeos seguros y las mejores calas.
          </p>
          <a href={AWIN(`prov_${provinceSlug}_hero`)} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.9rem 1.8rem', background: '#fff', color: '#0369a1', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Ver barcos en {provinceName} →
          </a>
        </div>
      </section>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1.25rem' }}>
          Destinos en {provinceName}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1rem' }}>
          {localities.map((l) => (
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

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg,#0369a1 0%,#0891b2 100%)', color: '#fff', borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center', marginTop: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 .6rem' }}>Reserva tu barco en {provinceName}</h2>
          <p style={{ color: 'rgba(255,255,255,.9)', lineHeight: 1.6, margin: '0 0 1.5rem', maxWidth: 520, marginInline: 'auto' }}>
            Barcos verificados con o sin patrón, reserva segura y cancelación flexible.
          </p>
          <a href={AWIN(`prov_${provinceSlug}_bottom`)} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'inline-block', padding: '.9rem 1.8rem', background: '#fff', color: '#0369a1', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>
            Explorar ofertas en SamBoat →
          </a>
        </section>

        <div style={{ marginTop: '2rem' }}>
          <Link href={`/alquiler-barco/costas/${coastSlug}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Volver a {coastName}</Link>
        </div>
      </main>
    </>
  )
}
