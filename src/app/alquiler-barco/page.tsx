// src/app/alquiler-barco/page.tsx — Hub de alquiler de barcos por costas.
// NOTA: el sitio NO usa Tailwind (design system propio con variables CSS).
// Esta página estaba escrita 100% con clases Tailwind inexistentes -> salía
// sin maquetar. Reescrita con estilos en línea + tokens del design system,
// que renderizan siempre (van en el JS, no dependen de ningún chunk CSS).
import Nav from '@/components/ui/Nav'
import Link from 'next/link'
import { getAllLocalities } from '@/lib/boat-rental-localities'
import { boatRentalSlug } from '@/lib/boat-rental-helpers'

const AWIN_MAIN = 'https://www.awin1.com/cread.php?awinmid=32683&awinaffid=playasdeespana&clickref=playasdeespana_main&ued=https://www.samboat.es'
const AWIN_BOTTOM = 'https://www.awin1.com/cread.php?awinmid=32683&awinaffid=playasdeespana&clickref=playasdeespana_bottom&ued=https://www.samboat.es'

export default function BoatRentalHubPage() {
  const localities = getAllLocalities()

  const coasts = new Map<string, typeof localities>()
  localities.forEach((locality) => {
    if (!coasts.has(locality.coast)) coasts.set(locality.coast, [])
    coasts.get(locality.coast)!.push(locality)
  })

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #0891b2 100%)',
        color: '#fff', padding: '3.5rem 1.5rem',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 6vw, 3.2rem)',
            fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 1rem',
          }}>
            Alquila barcos en las costas de España
          </h1>
          <p style={{
            fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 620, margin: '0 auto 1.75rem',
            color: 'rgba(255,255,255,.9)',
          }}>
            Descubre fondeos seguros, calas escondidas y las mejores tarifas de alquiler de barcos en todo el litoral español.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#coasts" style={{
              padding: '.8rem 1.4rem', background: '#fff', color: '#0369a1',
              borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '.95rem',
            }}>
              Explorar costas
            </a>
            <a href={AWIN_MAIN} target="_blank" rel="noopener noreferrer sponsored" style={{
              padding: '.8rem 1.4rem', background: 'rgba(255,255,255,.12)', color: '#fff',
              border: '2px solid rgba(255,255,255,.7)', borderRadius: 8, fontWeight: 700,
              textDecoration: 'none', fontSize: '.95rem',
            }}>
              Ver en SamBoat
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--line)', padding: '2rem 1.5rem' }}>
        <div style={{
          maxWidth: 880, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem', textAlign: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>{localities.length}+</div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: '.2rem 0 0' }}>Localidades</p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>{coasts.size}</div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: '.2rem 0 0' }}>Costas españolas</p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>€100+</div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: '.2rem 0 0' }}>Precios desde</p>
          </div>
        </div>
      </section>

      {/* COASTS */}
      <main id="coasts" style={{ maxWidth: 880, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700,
          color: 'var(--ink)', margin: '0 0 1.75rem',
        }}>
          Costas disponibles
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {Array.from(coasts.entries()).map(([coast, coastLocalities]) => {
            const coastSlug = boatRentalSlug(coast)
            return (
              <section key={coast} style={{ borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{coast}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '.82rem', margin: '.2rem 0 0' }}>
                    {coastLocalities.length} localidades disponibles
                  </p>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '.75rem', marginBottom: '1rem',
                }}>
                  {coastLocalities.slice(0, 4).map((locality) => (
                    <Link
                      key={locality.slug}
                      href={`/alquiler-barco/costas/${coastSlug}/provincias/${boatRentalSlug(locality.province)}/${locality.slug}`}
                      prefetch={false}
                      style={{
                        display: 'block', background: 'var(--card-bg)', border: '1px solid var(--line)',
                        borderRadius: 8, padding: '.9rem 1rem', textDecoration: 'none', color: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem' }}>
                        {locality.locality}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                        €{locality.pricing.small.min} - €{locality.pricing.captain.max}/día
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  href={`/alquiler-barco/costas/${coastSlug}`}
                  prefetch={false}
                  style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}
                >
                  Ver las {coastLocalities.length} localidades de {coast} →
                </Link>
              </section>
            )
          })}
        </div>
      </main>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)', color: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 .75rem' }}>
            Comienza tu aventura en barco
          </h2>
          <p style={{ color: 'rgba(255,255,255,.88)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            Explora cientos de barcos verificados en todas las costas españolas. Reserva seguro con SamBoat.
          </p>
          <a href={AWIN_BOTTOM} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: 'inline-block', padding: '.9rem 1.8rem', background: '#fff', color: '#0369a1',
            borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1rem',
          }}>
            Explorar ofertas en SamBoat
          </a>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginTop: '1.25rem' }}>
            Afiliado con SamBoat · Sin coste adicional para ti
          </p>
        </div>
      </section>
    </>
  )
}
